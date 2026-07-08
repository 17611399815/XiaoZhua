import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  MaxLength,
  IsPositive,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ──────────────────────── Auth ────────────────────────

export class LoginDto {
  @ApiProperty({ description: '管理员用户名', example: 'admin' })
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '管理员密码', example: 'admin123' })
  @IsString()
  @MaxLength(100)
  password: string;
}

// ──────────────────────── User ────────────────────────

export class UpdateUserRoleDto {
  @ApiProperty({ description: '用户角色', enum: ['user', 'admin', 'vip'], example: 'vip' })
  @IsString()
  @IsIn(['user', 'admin', 'vip'])
  role: string;
}

// ──────────────────────── Product ────────────────────────

export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: '皇家狗粮' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: '商品描述', example: '优质狗粮，营养均衡' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: '商品价格', example: 199.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: '库存数量', example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: '商品分类', example: '狗粮' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: '商品图片URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '是否上架', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: '商品价格' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ description: '库存数量' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '商品分类' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: '商品图片URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '是否上架' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ──────────────────────── Order ────────────────────────

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: '订单状态',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
    example: 'shipped',
  })
  @IsString()
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status: string;
}

// ──────────────────────── Pagination ────────────────────────

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;
}

export class UserListDto extends PaginationDto {
  @ApiPropertyOptional({ description: '按手机号搜索', example: '13800138000' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class OrderListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '订单状态筛选',
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status?: string;

  @ApiPropertyOptional({ description: '按收货人手机号搜索' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '开始日期 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
