import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (cartItems.length === 0) throw new BadRequestException('购物车为空');

    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return order;
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: { select: { phone: true } } },
    });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new NotFoundException('订单不存在');
    return order;
  }
}
