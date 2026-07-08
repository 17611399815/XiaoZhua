import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './notes.dto';

@ApiTags('Notes')
@ApiBearerAuth()
@Controller('pets/:petId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: '获取宠物的所有笔记' })
  findAll(
    @Param('petId', ParseUUIDPipe) petId: string,
    @CurrentUser() userId: string,
  ) {
    return this.notesService.findAll(petId, userId);
  }

  @Post()
  @ApiOperation({ summary: '为宠物创建新笔记' })
  create(
    @Param('petId', ParseUUIDPipe) petId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(petId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新笔记' })
  update(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除笔记' })
  remove(
    @Param('petId', ParseUUIDPipe) petId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ) {
    return this.notesService.remove(id, userId);
  }
}
