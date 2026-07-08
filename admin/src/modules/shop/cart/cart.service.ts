import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all cart items for a user, including product details.
   */
  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute per-item subtotal and cart total
    const data = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      subtotal: item.product ? item.product.price * item.quantity : 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const total = data.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      data,
      total,
    };
  }

  /**
   * Add an item to the cart. If the product is already in the cart, increment quantity.
   */
  async addItem(userId: string, dto: AddCartItemDto) {
    // Verify product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('商品不存在或已下架');
    }

    // Check if already in cart — increment if so
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      include: { product: true },
    });
  }

  /**
   * Update the quantity of a specific cart item.
   */
  async updateItem(id: string, userId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`购物车项 (id=${id}) 不存在`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权操作该购物车项');
    }

    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity: dto.quantity },
      include: { product: true },
    });
  }

  /**
   * Remove an item from the cart.
   */
  async removeItem(id: string, userId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`购物车项 (id=${id}) 不存在`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权操作该购物车项');
    }

    return this.prisma.cartItem.delete({ where: { id } });
  }

  /**
   * Clear all cart items for a user (used after order creation).
   */
  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
