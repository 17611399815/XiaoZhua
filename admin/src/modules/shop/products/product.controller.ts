import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';

@ApiTags('Shop - Products')
@Controller('shop/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * GET /shop/products
   * Public: list active products with optional filters.
   */
  @Get()
  @ApiOperation({ summary: '获取商品列表 (公开)' })
  @ApiQuery({ name: 'category', required: false, type: String, example: '粮食' })
  @ApiQuery({ name: 'keyword', required: false, type: String, example: '狗粮' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  async findAll(
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.productService.findAll({
      category,
      keyword,
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
    });
  }

  /**
   * GET /shop/products/:id
   * Public: get a single product by id.
   */
  @Get(':id')
  @ApiOperation({ summary: '获取商品详情 (公开)' })
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
}
