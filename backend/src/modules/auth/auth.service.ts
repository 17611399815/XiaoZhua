import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 发送短信验证码
   * 生成6位数字验证码，存入Redis（5分钟有效期），开发环境返回验证码明文
   */
  async sendSmsCode(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存入Redis，5分钟过期
    await this.redis.set(`sms:code:${phone}`, code, 300);

    // 生产环境通过短信服务商发送，开发环境直接返回验证码
    const isDev = this.configService.get('NODE_ENV') !== 'production';
    if (isDev) {
      return { code };
    }
    // TODO: 接入短信服务商发送验证码
    return { message: '验证码已发送' };
  }

  /**
   * 手机号+验证码登录
   * 验证码校验通过后，查找或创建用户，签发 JWT + refresh token
   */
  async login(phone: string, code: string) {
    // 1. 校验验证码
    const storedCode = await this.redis.get(`sms:code:${phone}`);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 验证通过后删除验证码
    await this.redis.del(`sms:code:${phone}`);

    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
        },
      });
    }

    // 3. 检查账号状态
    if (user.status === 'disabled') {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    // 4. 签发令牌
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }

  /**
   * 刷新令牌
   * 验证 refresh token 有效性后，撤销旧 token，签发新的一对令牌
   */
  async refreshToken(rawToken: string) {
    // 1. 从 token 中提取 userId（格式：userId.uuid）
    const parts = rawToken.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('refresh token 格式无效');
    }

    const userId = parts[0];

    // 2. 查找该用户所有未撤销、未过期的 refresh token
    const validTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    // 3. 逐个比对 bcrypt 哈希
    let matchedToken: (typeof validTokens)[number] | null = null;
    for (const t of validTokens) {
      const isMatch = await bcrypt.compare(rawToken, t.token);
      if (isMatch) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('refresh token 无效或已过期');
    }

    // 4. 撤销旧 token
    await this.prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revoked: true },
    });

    // 5. 获取用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    // 6. 签发新令牌
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * 退出登录
   * 撤销指定的 refresh token
   */
  async logout(userId: string, rawToken: string) {
    // 查找并撤销匹配的 token
    const validTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revoked: false,
      },
    });

    for (const t of validTokens) {
      const isMatch = await bcrypt.compare(rawToken, t.token);
      if (isMatch) {
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revoked: true },
        });
        break;
      }
    }

    return { message: '已退出登录' };
  }

  // ───────────────────── 内部方法 ─────────────────────

  /**
   * 签发 JWT access token
   */
  private generateAccessToken(user: {
    id: string;
    phone: string;
    role: string;
  }): string {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return this.jwtService.sign(payload);
  }

  /**
   * 生成 refresh token
   * 格式：userId.uuid
   * 存入数据库时使用 bcrypt 哈希
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = `${userId}.${uuidv4()}`;
    const expiresInDays =
      Number(this.configService.get('REFRESH_TOKEN_EXPIRES_DAYS')) || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const hashedToken = await bcrypt.hash(rawToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });

    return rawToken;
  }
}
