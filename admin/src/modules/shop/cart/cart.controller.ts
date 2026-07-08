import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { CurrentUser } from '../../../auth/current-user.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';

@ApiTags('Shop - Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shop/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * GET /shop/cart
   * Get all cart items for the current user.
   */
  @Get()
  @ApiOperation({ summary: '获取当前用户的购物车' })
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  /**
   * POST /shop/cart
   * Add an item to the cart.
   */
  @Post()
  @ApiOperation({ summary: '添加商品到购物车' })
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @CurrentUser('id') userId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(userId, dto);
  }

  /**
   * PUT /shop/cart/:id
   * Update the quantity of a cart item.
   */
  @Put(':id')
  @ApiOperation({ summary: '更新购物车项数量' })
  async updateItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(id, userId, dto);
  }

  /**
   * DELETE /shop/cart/:id
   * Remove a specific item from the cart.
   */
  @Delete(':id')
  @ApiOperation({ summary: '从购物车中移除商品' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.cartService.removeItem(id, userId);
  }
}
