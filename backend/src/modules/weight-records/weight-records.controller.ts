import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { WeightRecordsService } from './weight-records.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class WeightRecordsController {
  constructor(private readonly service: WeightRecordsService) {}

  @Get('pets/:petId/weight-records')
  findAll(@Param('petId') petId: string, @CurrentUser('id') userId: string) {
    return this.service.findAll(petId, userId);
  }

  @Post('pets/:petId/weight-records')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Delete('weight-records/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
