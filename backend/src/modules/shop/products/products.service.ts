import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { category?: string; keyword?: string; page?: number; size?: number }) {
    const { category, keyword, page = 1, size = 20 } = query;
    const where: any = { isOnSale: true };
    if (category) where.category = category;
    if (keyword) where.name = { contains: keyword, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, pagination: { page, size, total } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('商品不存在');
    return product;
  }
}
