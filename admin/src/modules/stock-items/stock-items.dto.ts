import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockItemDto {
  @ApiProperty({ description: '物品名称', example: '狗粮' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '品牌', example: '皇家' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({ description: '分类', example: '食品' })
  @IsString()
  @MaxLength(50)
  category: string;

  @ApiProperty({ description: '剩余数量', example: 5 })
  @IsInt()
  @Min(0)
  remaining: number;

  @ApiProperty({ description: '总数量', example: 10 })
  @IsInt()
  @Min(0)
  total: number;

  @ApiProperty({ description: '单位', example: '袋' })
  @IsString()
  @MaxLength(20)
  unit: string;
}

export class UpdateStockItemDto {
  @ApiPropertyOptional({ description: '物品名称', example: '狗粮' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '品牌', example: '皇家' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ description: '分类', example: '食品' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ description: '剩余数量', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  remaining?: number;

  @ApiPropertyOptional({ description: '总数量', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  total?: number;

  @ApiPropertyOptional({ description: '单位', example: '袋' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}

export class DecrementStockItemDto {
  @ApiProperty({ description: '要减少的数量', example: 1 })
  @IsInt()
  @Min(1)
  amount: number;
}
