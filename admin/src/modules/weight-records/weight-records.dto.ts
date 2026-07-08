import { IsNumber, IsOptional, IsDateString, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWeightRecordDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  weight: number;

  @IsDateString()
  @IsNotEmpty()
  recordDate: string;
}

export class UpdateWeightRecordDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsDateString()
  recordDate?: string;
}
