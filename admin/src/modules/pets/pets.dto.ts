import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const GENDERS = ['男孩', '女孩'] as const;
const TYPES = ['猫咪', '狗狗', '其他'] as const;

export class CreatePetDto {
  @ApiProperty({ description: '宠物名字', example: '旺财' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '性别', enum: GENDERS, example: '男孩' })
  @IsString()
  @IsIn(GENDERS)
  gender: string;

  @ApiProperty({ description: '类型', enum: TYPES, example: '狗狗' })
  @IsString()
  @IsIn(TYPES)
  type: string;

  @ApiPropertyOptional({ description: '品种', example: '金毛' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @ApiPropertyOptional({ description: '生日 (ISO date)', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ description: '相遇日期 (ISO date)', example: '2024-06-01' })
  @IsOptional()
  @IsDateString()
  meetDate?: string;

  @ApiPropertyOptional({ description: '体重 (kg)', example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: '是否绝育', example: false })
  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;

  @ApiPropertyOptional({ description: '头像 emoji', example: '🐶' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  emoji?: string;

  @ApiPropertyOptional({ description: '头像图片 URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class UpdatePetDto {
  @ApiPropertyOptional({ description: '宠物名字', example: '旺财' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: '性别', enum: GENDERS })
  @IsOptional()
  @IsString()
  @IsIn(GENDERS)
  gender?: string;

  @ApiPropertyOptional({ description: '类型', enum: TYPES })
  @IsOptional()
  @IsString()
  @IsIn(TYPES)
  type?: string;

  @ApiPropertyOptional({ description: '品种' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @ApiPropertyOptional({ description: '生日 (ISO date)' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ description: '相遇日期 (ISO date)' })
  @IsOptional()
  @IsDateString()
  meetDate?: string;

  @ApiPropertyOptional({ description: '体重 (kg)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: '是否绝育' })
  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;

  @ApiPropertyOptional({ description: '头像 emoji' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  emoji?: string;

  @ApiPropertyOptional({ description: '头像图片 URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
