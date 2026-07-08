import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PetsService } from './pets.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.petsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.petsService.findOne(id, userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.petsService.create(userId, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.petsService.update(id, userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.petsService.remove(id, userId);
  }

  @Put(':id/switch')
  switchPet(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.petsService.switchPet(id, userId);
  }
}
