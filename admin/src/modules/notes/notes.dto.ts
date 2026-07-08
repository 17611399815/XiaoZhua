import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: '笔记标题', example: '今日记录' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: '笔记内容', example: '今天带宠物去公园散步...' })
  @IsString()
  content: string;
}

export class UpdateNoteDto {
  @ApiPropertyOptional({ description: '笔记标题', example: '今日记录' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: '笔记内容', example: '今天带宠物去公园散步...' })
  @IsOptional()
  @IsString()
  content?: string;
}
