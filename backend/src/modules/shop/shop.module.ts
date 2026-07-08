import { Module } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { CartService } from './cart/cart.service';
import { CartController } from './cart/cart.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';

@Module({
  controllers: [ProductsController, CartController, OrdersController],
  providers: [ProductsService, CartService, OrdersService],
})
export class ShopModule {}
