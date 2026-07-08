import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { StockItemsService } from './stock-items.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class StockItemsController {
  constructor(private readonly service: StockItemsService) {}

  @Get('pets/:petId/stock-items')
  findAll(@Param('petId') petId: string, @CurrentUser('id') userId: string) {
    return this.service.findAll(petId, userId);
  }

  @Post('pets/:petId/stock-items')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Put('stock-items/:id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.update(id, userId, body);
  }

  @Patch('stock-items/:id/decrement')
  decrement(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.decrement(id, userId, body?.amount ?? 1);
  }

  @Delete('stock-items/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
