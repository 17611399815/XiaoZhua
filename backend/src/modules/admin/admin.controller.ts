import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Public()
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.service.login(body.username, body.password);
  }

  @Get('dashboard/stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('users')
  listUsers(@Query() query: any) {
    return this.service.listUsers(query);
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.service.getUserDetail(id);
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.service.updateUserRole(id, body.role);
  }

  @Get('pets')
  listPets(@Query() query: any) {
    return this.service.listPets(query);
  }

  @Get('products')
  listProducts(@Query() query: any) {
    return this.service.listProducts(query);
  }

  @Post('products')
  createProduct(@Body() body: any) {
    return this.service.createProduct(body);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.service.updateProduct(id, body);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.service.deleteProduct(id);
  }

  @Get('orders')
  listOrders(@Query() query: any) {
    return this.service.listOrders(query);
  }

  @Get('orders/:id')
  getOrderDetail(@Param('id') id: string) {
    return this.service.getOrderDetail(id);
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateOrderStatus(id, body.status);
  }
}
