import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class RemindersController {
  constructor(private readonly service: RemindersService) {}

  @Get('pets/:petId/reminders')
  findAll(@Param('petId') petId: string, @CurrentUser('id') userId: string) {
    return this.service.findAll(petId, userId);
  }

  @Post('pets/:petId/reminders')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Put('reminders/:id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.update(id, userId, body);
  }

  @Patch('reminders/:id/toggle')
  toggle(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.toggle(id, userId);
  }

  @Delete('reminders/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
