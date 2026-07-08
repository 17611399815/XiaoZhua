import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './album.dto';

@ApiTags('宠物相册')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  /**
   * GET /pets/:petId/album
   * 获取宠物的相册列表（分页）。
   */
  @Get()
  @ApiOperation({ summary: '获取宠物相册列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  async findAll(
    @Param('petId') petId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.albumService.findAll(
      petId,
      userId,
      page ? parseInt(page, 10) : undefined,
      size ? parseInt(size, 10) : undefined,
    );
  }

  /**
   * POST /pets/:petId/album
   * 上传照片到宠物相册（multipart/form-data）。
   */
  @Post()
  @ApiOperation({ summary: '上传宠物照片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Param('petId') petId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateAlbumDto,
  ) {
    return this.albumService.create(petId, userId, file, dto);
  }

  /**
   * DELETE /pets/:petId/album/:id
   * 删除宠物相册中的某张照片。
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除宠物照片' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.albumService.remove(id, userId);
  }
}
