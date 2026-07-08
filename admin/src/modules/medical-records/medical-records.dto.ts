import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: '就诊标题', example: '年度体检' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: '就诊日期', example: '2026-07-03' })
  @IsDateString()
  visitDate: string;

  @ApiProperty({ description: '就诊医院', example: 'XX宠物医院' })
  @IsString()
  @MaxLength(200)
  hospital: string;

  @ApiProperty({ description: '症状描述', example: '食欲不振，精神萎靡' })
  @IsString()
  @MaxLength(1000)
  symptoms: string;

  @ApiPropertyOptional({ description: '诊断结果', example: '肠胃炎' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  diagnosis?: string;

  @ApiPropertyOptional({ description: '治疗方案', example: '口服药物，清淡饮食' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  treatment?: string;

  @ApiPropertyOptional({ description: '就诊费用（元）', example: 350.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
}

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}
