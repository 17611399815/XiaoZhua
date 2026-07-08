import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class RecipesController {
  constructor(private readonly service: RecipesService) {}

  @Get('pets/:petId/recipes')
  findAll(@Param('petId') petId: string, @CurrentUser('id') userId: string) {
    return this.service.findAll(petId, userId);
  }

  @Post('pets/:petId/recipes')
  create(@Param('petId') petId: string, @CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.create(petId, userId, body);
  }

  @Delete('recipes/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
