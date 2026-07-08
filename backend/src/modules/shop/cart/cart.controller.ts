import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('shop/cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.service.findAll(userId);
  }

  @Post()
  add(@CurrentUser('id') userId: string, @Body() body: { productId: string; quantity?: number }) {
    return this.service.add(userId, body.productId, body.quantity ?? 1);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: { quantity: number }) {
    return this.service.update(id, userId, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
