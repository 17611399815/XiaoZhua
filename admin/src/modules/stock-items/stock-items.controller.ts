import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StockItemsService } from './stock-items.service';
import {
  CreateStockItemDto,
  UpdateStockItemDto,
  DecrementStockItemDto,
} from './stock-items.dto';

@ApiTags('库存管理')
@Controller('pets/:petId/stock-items')
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) {}

  @Get()
  @ApiOperation({ summary: '获取宠物的所有库存物品' })
  @ApiResponse({ status: 200, description: '返回库存物品列表' })
  findAll(
    @Param('petId') petId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockItemsService.findAll(petId, userId);
  }

  @Post()
  @ApiOperation({ summary: '为宠物添加库存物品' })
  @ApiResponse({ status: 201, description: '库存物品已创建' })
  create(
    @Param('petId') petId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockItemDto,
  ) {
    return this.stockItemsService.create(petId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存物品' })
  @ApiResponse({ status: 200, description: '库存物品已更新' })
  update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateStockItemDto,
  ) {
    return this.stockItemsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存物品' })
  @ApiResponse({ status: 200, description: '库存物品已删除' })
  remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.stockItemsService.remove(id, userId);
  }

  @Patch(':id/decrement')
  @ApiOperation({ summary: '扣减库存物品数量' })
  @ApiResponse({ status: 200, description: '库存已扣减' })
  @ApiResponse({ status: 400, description: '库存不足' })
  decrement(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: DecrementStockItemDto,
  ) {
    return this.stockItemsService.decrement(id, userId, dto.amount);
  }
}
