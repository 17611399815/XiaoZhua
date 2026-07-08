import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { AlbumService } from './album.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class AlbumController {
  constructor(private readonly service: AlbumService) {}

  @Get('pets/:petId/album')
  findAll(
    @Param('petId') petId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.service.findAll(petId, userId, +(page || 1), +(size || 20));
  }

  @Post('pets/:petId/album')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Delete('album/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
