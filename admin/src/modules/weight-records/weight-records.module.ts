import { Module } from '@nestjs/common';
import { WeightRecordsController } from './weight-records.controller';
import { WeightRecordsService } from './weight-records.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WeightRecordsController],
  providers: [WeightRecordsService],
  exports: [WeightRecordsService],
})
export class WeightRecordsModule {}
