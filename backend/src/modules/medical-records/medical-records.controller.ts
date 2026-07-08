import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class MedicalRecordsController {
  constructor(private readonly service: MedicalRecordsService) {}

  @Get('pets/:petId/medical-records')
  findAll(@Param('petId') petId: string, @CurrentUser('id') userId: string) {
    return this.service.findAll(petId, userId);
  }

  @Post('pets/:petId/medical-records')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Delete('medical-records/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
