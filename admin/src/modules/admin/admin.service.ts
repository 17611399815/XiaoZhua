import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from './admin.dto';

export interface AdminJwtPayload {
  id: string;
  username: string;
  role: 'admin';
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'xiaozhua-admin-jwt-secret';
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || '7d';

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * On module initialization, ensure a default admin account exists.
   */
  async onModuleInit() {
    await this.seedAdmin();
  }

  // ──────────────────────── Seed ────────────────────────

  /**
   * Create a default admin account (admin / admin123) if none exists.
   */
  async seedAdmin() {
    const existing = await this.prisma.admin.findFirst({
      where: { username: DEFAULT_ADMIN_USERNAME },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await this.prisma.admin.create({
        data: {
          username: DEFAULT_ADMIN_USERNAME,
          password: hashedPassword,
          role: 'admin',
        },
      });
      this.logger.log(
        `Default admin account created: ${DEFAULT_ADMIN_USERNAME} / ${DEFAULT_ADMIN_PASSWORD}`,
      );
    } else {
      this.logger.log('Default admin account already exists, skipping seed.');
    }
  }

  // ──────────────────────── Auth ────────────────────────

  /**
   * Validate admin credentials. Returns JWT token on success.
   */
  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload: AdminJwtPayload = {
      id: admin.id,
      username: admin.username,
      role: 'admin',
    };

    const token = jwt.sign(payload, ADMIN_JWT_SECRET, {
      expiresIn: ADMIN_JWT_EXPIRES_IN,
    });

    return {
      accessToken: token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  // ──────────────────────── Dashboard ────────────────────────

  /**
   * Get dashboard statistics: total users, pets, orders, and total revenue.
   */
  async getDashboardStats() {
    const [totalUsers, totalPets, totalOrders, revenueResult] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.pet.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          status: {
            notIn: ['cancelled', 'refunded'],
          },
        },
      }),
    ]);

    // Count pending orders separately
    const pendingOrders = await this.prisma.order.count({
      where: { status: 'pending' },
    });

    return {
      totalUsers,
      totalPets,
      totalOrders,
      pendingOrders,
      totalRevenue: revenueResult._sum.totalAmount || 0,
    };
  }

  // ──────────────────────── User Management ────────────────────────

  /**
   * List all users with pagination and optional phone search.
   */
  async findAllUsers(params: { page?: number; size?: number; phone?: string }) {
    const page = params.page ?? 1;
    const size = params.size ?? 20;
    const skip = (page - 1) * size;

    const where: any = {};
    if (params.phone) {
      where.phone = { contains: params.phone };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              pets: true,
              orders: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  /**
   * Get a single user's details including their pets.
   */
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        pets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 (id=${id}) 不存在`);
    }

    return user;
  }

  /**
   * Update a user's role.
   */
  async updateUserRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 (id=${id}) 不存在`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        phone: true,
        nickname: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  // ──────────────────────── Product Management ────────────────────────

  /**
   * List all products (admin view, includes inactive products).
   */
  async findAllProducts(params: { page?: number; size?: number }) {
    const page = params.page ?? 1;
    const size = params.size ?? 20;
    const skip = (page - 1) * size;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  /**
   * Create a new product.
   */
  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing product.
   */
  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`商品 (id=${id}) 不存在`);
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a product.
   */
  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`商品 (id=${id}) 不存在`);
    }

    // Check if product is referenced in any order items
    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      throw new ConflictException(
        `该商品已被 ${orderItemCount} 个订单引用，无法删除。建议下架该商品而非删除。`,
      );
    }

    return this.prisma.product.delete({ where: { id } });
  }

  // ──────────────────────── Order Management ────────────────────────

  /**
   * List all orders with filters (status, phone, date range) and pagination.
   */
  async findAllOrders(params: {
    page?: number;
    size?: number;
    status?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = params.page ?? 1;
    const size = params.size ?? 20;
    const skip = (page - 1) * size;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.phone) {
      where.user = {
        phone: { contains: params.phone },
      };
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        // Set to end of day
        const endDate = new Date(params.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              nickname: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  /**
   * Update an order's status.
   */
  async updateOrderStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException(`订单 (id=${id}) 不存在`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            nickname: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }
}
