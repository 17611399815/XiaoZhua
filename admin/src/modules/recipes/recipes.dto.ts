import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedFrequency {
  ONCE = 'once',
  TWICE = 'twice',
  THREE_TIMES = 'three_times',
  FREE = 'free',
}

export enum FeedTime {
  MORNING = 'morning',
  NOON = 'noon',
  EVENING = 'evening',
  NIGHT = 'night',
  CUSTOM = 'custom',
}

export class CreateRecipeDto {
  @ApiProperty({ description: '食物名称', example: '皇家狗粮' })
  @IsString()
  @MaxLength(100)
  food: string;

  @ApiProperty({ description: '喂食量（克）', example: 200 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: '喂食频率', enum: FeedFrequency, example: FeedFrequency.TWICE })
  @IsEnum(FeedFrequency)
  frequency: FeedFrequency;

  @ApiProperty({ description: '喂食时间', enum: FeedTime, example: FeedTime.MORNING })
  @IsEnum(FeedTime)
  feedTime: FeedTime;
}

export class UpdateRecipeDto {
  @ApiPropertyOptional({ description: '食物名称', example: '皇家狗粮' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  food?: string;

  @ApiPropertyOptional({ description: '喂食量（克）', example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: '喂食频率', enum: FeedFrequency })
  @IsOptional()
  @IsEnum(FeedFrequency)
  frequency?: FeedFrequency;

  @ApiPropertyOptional({ description: '喂食时间', enum: FeedTime })
  @IsOptional()
  @IsEnum(FeedTime)
  feedTime?: FeedTime;
}
