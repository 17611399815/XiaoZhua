import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface AdminJwtPayload {
  id: string;
  username: string;
  role: 'admin';
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'xiaozhua-admin-jwt-secret';

@Injectable()
export class AdminJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供管理员认证令牌');
    }

    const token = authHeader.substring(7);

    try {
      const payload = jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('需要管理员权限');
      }

      // Attach admin user to request for downstream use
      request.adminUser = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('管理员认证令牌无效或已过期');
    }
  }
}
