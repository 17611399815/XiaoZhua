import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: list products with optional category, keyword search, and pagination.
   * Only returns active (isActive) products.
   */
  async findAll(params?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) {
    const page = params?.page ?? 1;
    const size = params?.size ?? 20;
    const skip = (page - 1) * size;

    const where: any = { isActive: true };

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.keyword) {
      where.OR = [
        { name: { contains: params.keyword } },
        { description: { contains: params.keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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
   * Public: get a single active product by id.
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`商品 (id=${id}) 不存在`);
    }

    return product;
  }

  // ---------------------------------------------------------------------------
  // Admin CRUD — intended to be called from an Admin module controller.
  // The ShopModule exports ProductService so the AdminModule can import it.
  // ---------------------------------------------------------------------------

  /**
   * Admin: list ALL products (including inactive).
   */
  async adminFindAll(params?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) {
    const page = params?.page ?? 1;
    const size = params?.size ?? 20;
    const skip = (page - 1) * size;

    const where: any = {};

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.keyword) {
      where.OR = [
        { name: { contains: params.keyword } },
        { description: { contains: params.keyword } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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
   * Admin: create a new product.
   */
  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
        stock: dto.stock ?? 0,
      },
    });
  }

  /**
   * Admin: update a product.
   */
  async update(id: string, dto: UpdateProductDto) {
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
   * Admin: delete a product.
   */
  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`商品 (id=${id}) 不存在`);
    }

    return this.prisma.product.delete({ where: { id } });
  }
}
