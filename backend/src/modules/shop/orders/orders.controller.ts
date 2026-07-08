import { Controller, Get, Post, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('shop/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  create(@CurrentUser('id') userId: string) {
    return this.service.create(userId);
  }

  @Get()
  findByUser(@CurrentUser('id') userId: string) {
    return this.service.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findOne(id, userId);
  }
}
