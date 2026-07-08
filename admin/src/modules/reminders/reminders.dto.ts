import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty({ description: '提醒标题', example: '喂食时间' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '提醒类型', example: 'feeding' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: '提醒描述', example: '每天早晚各喂一次' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '提醒日期 (YYYY-MM-DD)', example: '2026-07-03' })
  @IsDateString()
  @IsNotEmpty()
  remindDate: string;

  @ApiProperty({ description: '提醒时间 (HH:mm)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'remindTime must be in HH:mm format',
  })
  remindTime: string;

  @ApiPropertyOptional({ description: '是否已完成', default: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class UpdateReminderDto {
  @ApiPropertyOptional({ description: '提醒标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '提醒类型' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: '提醒描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '提醒日期 (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  remindDate?: string;

  @ApiPropertyOptional({ description: '提醒时间 (HH:mm)' })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
    message: 'remindTime must be in HH:mm format',
  })
  remindTime?: string;

  @ApiPropertyOptional({ description: '是否已完成' })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
