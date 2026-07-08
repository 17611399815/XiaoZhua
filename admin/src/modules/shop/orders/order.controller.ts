import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './order.dto';

@ApiTags('Shop - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shop/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * POST /shop/orders
   * Create an order from the current user's cart.
   */
  @Post()
  @ApiOperation({ summary: '从购物车创建订单' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createFromCart(userId, dto);
  }

  /**
   * GET /shop/orders
   * List orders for the current user.
   */
  @Get()
  @ApiOperation({ summary: '获取当前用户的订单列表' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'pending' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.orderService.findByUser(userId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
    });
  }

  /**
   * GET /shop/orders/:id
   * Get a single order with all items (ownership verified).
   */
  @Get(':id')
  @ApiOperation({ summary: '获取订单详情 (含商品项)' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.orderService.findOne(id, userId);
  }
}
