import { Module } from '@nestjs/common';
import { StockItemsService } from './stock-items.service';
import { StockItemsController } from './stock-items.controller';

@Module({ controllers: [StockItemsController], providers: [StockItemsService] })
export class StockItemsModule {}
