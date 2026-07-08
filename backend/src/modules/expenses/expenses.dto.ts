import { IsString, IsNumber, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ description: '分类', example: 'food', enum: ['food', 'medical', 'toy', 'bath', 'insurance', 'other'] })
  @IsString()
  category: string;

  @ApiProperty({ description: '金额', example: 128.50 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: '备注', example: '皇家猫粮2kg' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  @ApiProperty({ description: '消费日期', example: '2025-06-15' })
  @IsDateString()
  expenseDate: string;
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ description: '分类', example: 'food', enum: ['food', 'medical', 'toy', 'bath', 'insurance', 'other'] })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '金额', example: 128.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: '备注', example: '皇家猫粮2kg' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;

  @ApiPropertyOptional({ description: '消费日期', example: '2025-06-15' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;
}
