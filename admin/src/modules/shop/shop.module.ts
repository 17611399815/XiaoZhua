import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductController } from './products/product.controller';
import { ProductService } from './products/product.service';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';
import { OrderController } from './orders/order.controller';
import { OrderService } from './orders/order.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProductController,
    CartController,
    OrderController,
  ],
  providers: [
    ProductService,
    CartService,
    OrderService,
  ],
  exports: [
    ProductService,
    CartService,
    OrderService,
  ],
})
export class ShopModule {}
