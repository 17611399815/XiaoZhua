import {
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户昵称', example: '小爪' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional({ description: '头像 URL', example: 'https://cdn.example.com/avatars/1.png' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
