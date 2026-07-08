import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Create an order from the user's current cart items.
   * Uses a Prisma transaction to ensure atomicity:
   * 1. Fetch all cart items with product info
   * 2. Calculate total
   * 3. Create order + order items
   * 4. Decrement stock
   * 5. Clear the cart
   */
  async createFromCart(userId: string, dto: CreateOrderDto) {
    // Fetch cart items with current product data
    const cartResult = await this.cartService.getCart(userId);

    if (!cartResult.data || cartResult.data.length === 0) {
      throw new BadRequestException('购物车为空，无法创建订单');
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-verify products are still active and in stock within the transaction
      const orderItems = [];
      let totalAmount = 0;

      for (const cartItem of cartResult.data) {
        // Lock the product row for update
        const product = await tx.product.findUnique({
          where: { id: cartItem.productId },
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `商品 "${product?.name ?? cartItem.productId}" 已下架，请从购物车移除后重试`,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `商品 "${product.name}" 库存不足 (剩余 ${product.stock}，需要 ${cartItem.quantity})`,
          );
        }

        const subtotal = product.price * cartItem.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: cartItem.quantity,
          subtotal,
        });
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'pending',
          remark: dto.remark ?? null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement stock for each purchased product
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  /**
   * List orders for the current user with pagination and optional status filter.
   */
  async findByUser(
    userId: string,
    params?: { status?: string; page?: number; size?: number },
  ) {
    const page = params?.page ?? 1;
    const size = params?.size ?? 20;
    const skip = (page - 1) * size;

    const where: any = { userId };
    if (params?.status) {
      where.status = params.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
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
   * Get a single order with all items, verifying ownership.
   */
  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`订单 (id=${id}) 不存在`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权查看该订单');
    }

    return order;
  }
}
