import { Module } from '@nestjs/common';
import { StockItemsController } from './stock-items.controller';
import { StockItemsService } from './stock-items.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockItemsController],
  providers: [StockItemsService],
  exports: [StockItemsService],
})
export class StockItemsModule {}
