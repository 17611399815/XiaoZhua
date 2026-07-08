import {
  IsString,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ description: '商品 ID', example: 'clx...' })
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: '数量', example: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: '新数量', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}
