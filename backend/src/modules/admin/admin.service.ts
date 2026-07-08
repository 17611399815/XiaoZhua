import { Injectable, UnauthorizedException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const admin = await this.prisma.admin.findUnique({ where: { username: 'admin' } });
      if (!admin) {
        const hashed = await bcryptjs.hash('admin123', 10);
        await this.prisma.admin.create({
          data: { username: 'admin', password: hashed, role: 'super_admin' },
        });
        console.log('✅ 默认管理员已创建: admin / admin123');
      }
    } catch (e) {
      console.warn('⚠️ 数据库不可用，跳过管理员播种');
    }
  }

  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (!admin) throw new UnauthorizedException('用户名或密码错误');
    const valid = await bcryptjs.compare(password, admin.password);
    if (!valid) throw new UnauthorizedException('用户名或密码错误');

    const token = this.jwtService.sign({ id: admin.id, username: admin.username, role: 'admin' });
    return { token, username: admin.username, role: admin.role };
  }

  async getStats() {
    const [totalUsers, totalPets, totalOrders, revenueResult] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.pet.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);
    return {
      totalUsers,
      totalPets,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0).toFixed(2),
    };
  }

  async listUsers(query: { page?: number; size?: number; keyword?: string }) {
    const { page = 1, size = 20, keyword } = query;
    const where: any = {};
    if (keyword) where.phone = { contains: keyword };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, pagination: { page, size, total } };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { pets: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async updateUserRole(id: string, role: string) {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async listPets(query: { page?: number; size?: number; type?: string }) {
    const { page = 1, size = 20, type } = query;
    const where: any = {};
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pet.count({ where }),
    ]);
    return { data, pagination: { page, size, total } };
  }

  // Product management
  async listProducts(query: { page?: number; size?: number; keyword?: string }) {
    const { page = 1, size = 20, keyword } = query;
    const where: any = {};
    if (keyword) where.name = { contains: keyword, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip: (page - 1) * size, take: size, orderBy: { createdAt: 'desc' } }),
      this.prisma.product.count({ where }),
    ]);
    return { data, pagination: { page, size, total } };
  }

  async createProduct(dto: any) {
    return this.prisma.product.create({ data: dto });
  }

  async updateProduct(id: string, dto: any) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  // Order management
  async listOrders(query: { page?: number; size?: number; status?: string }) {
    const { page = 1, size = 20, status } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { user: { select: { phone: true } } },
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, pagination: { page, size, total } };
  }

  async getOrderDetail(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { phone: true } },
      },
    });
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}
