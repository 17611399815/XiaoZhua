import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtAuthGuard } from '../../auth/guards/admin-jwt-auth.guard';
import { AdminCurrentUser } from '../../auth/decorators/admin-current-user.decorator';
import { AdminJwtPayload } from './admin.service';
import {
  LoginDto,
  UpdateUserRoleDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateOrderStatusDto,
  UserListDto,
  OrderListDto,
  PaginationDto,
} from './admin.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ──────────────────────── Auth ────────────────────────

  /**
   * POST /admin/login
   * Admin login — returns a JWT token with { id, username, role: 'admin' }.
   */
  @Post('login')
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功，返回管理员 JWT token' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() dto: LoginDto) {
    return this.adminService.login(dto.username, dto.password);
  }

  // ──────────────────────── Dashboard ────────────────────────

  /**
   * GET /admin/dashboard/stats
   * Get platform overview: total users, pets, orders, and revenue.
   */
  @Get('dashboard/stats')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  @ApiResponse({ status: 200, description: '返回平台统计数据' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ──────────────────────── User Management ────────────────────────

  /**
   * GET /admin/users
   * List all users with pagination and optional phone search.
   */
  @Get('users')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '获取所有用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'phone', required: false, type: String, example: '13800138000' })
  async findAllUsers(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('phone') phone?: string,
  ) {
    return this.adminService.findAllUsers({
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
      phone,
    });
  }

  /**
   * GET /admin/users/:id
   * Get user detail including their pets.
   */
  @Get('users/:id')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '获取用户详情（含宠物列表）' })
  @ApiResponse({ status: 200, description: '返回用户详情' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findUserById(@Param('id') id: string) {
    return this.adminService.findUserById(id);
  }

  /**
   * PUT /admin/users/:id/role
   * Update a user's role.
   */
  @Put('users/:id/role')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '更新用户角色' })
  @ApiResponse({ status: 200, description: '角色更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  // ──────────────────────── Product Management ────────────────────────

  /**
   * GET /admin/products
   * List all products (admin view, includes inactive).
   */
  @Get('products')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '获取所有商品列表（管理端）' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  async findAllProducts(
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.adminService.findAllProducts({
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
    });
  }

  /**
   * POST /admin/products
   * Create a new product.
   */
  @Post('products')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.adminService.createProduct(dto);
  }

  /**
   * PUT /admin/products/:id
   * Update an existing product.
   */
  @Put('products/:id')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '更新商品' })
  @ApiResponse({ status: 200, description: '商品更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.adminService.updateProduct(id, dto);
  }

  /**
   * DELETE /admin/products/:id
   * Delete a product.
   */
  @Delete('products/:id')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '删除商品' })
  @ApiResponse({ status: 200, description: '商品删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @ApiResponse({ status: 409, description: '商品有关联订单，无法删除' })
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // ──────────────────────── Order Management ────────────────────────

  /**
   * GET /admin/orders
   * List all orders with filters (status, phone, date range) and pagination.
   */
  @Get('orders')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '获取所有订单列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'pending' })
  @ApiQuery({ name: 'phone', required: false, type: String, example: '13800138000' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2025-12-31' })
  async findAllOrders(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('status') status?: string,
    @Query('phone') phone?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.findAllOrders({
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
      status,
      phone,
      startDate,
      endDate,
    });
  }

  /**
   * PUT /admin/orders/:id/status
   * Update an order's status.
   */
  @Put('orders/:id/status')
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard)
  @ApiOperation({ summary: '更新订单状态' })
  @ApiResponse({ status: 200, description: '订单状态更新成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, dto.status);
  }
}
