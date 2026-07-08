import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: '订单备注', example: '请发顺丰' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class QueryOrderDto {
  @ApiPropertyOptional({ description: '订单状态筛选', example: 'pending' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20 })
  @IsOptional()
  size?: number;
}
