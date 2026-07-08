import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Get('pets/:petId/notes')
  findAll(@Param('petId') petId: string, @CurrentUser('id') userId: string) {
    return this.service.findAll(petId, userId);
  }

  @Post('pets/:petId/notes')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Put('notes/:id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.update(id, userId, body);
  }

  @Delete('notes/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
