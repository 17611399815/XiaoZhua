import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { PetsService } from './pets.service';
import { CreatePetDto, UpdatePetDto } from './pets.dto';

@ApiTags('Pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  /**
   * GET /pets
   * List all pets belonging to the current user.
   */
  @Get()
  @ApiOperation({ summary: '获取当前用户的宠物列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'type', required: false, type: String, example: '狗狗' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('type') type?: string,
  ) {
    return this.petsService.findAll(userId, {
      page: page ? parseInt(page, 10) : undefined,
      size: size ? parseInt(size, 10) : undefined,
      type,
    });
  }

  /**
   * POST /pets
   * Create a new pet for the current user.
   */
  @Post()
  @ApiOperation({ summary: '创建宠物' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePetDto,
  ) {
    return this.petsService.create(userId, dto);
  }

  /**
   * GET /pets/:id
   * Get a single pet by id (ownership verified).
   */
  @Get(':id')
  @ApiOperation({ summary: '获取宠物详情' })
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.petsService.findOne(id, userId);
  }

  /**
   * PUT /pets/:id
   * Update a pet (ownership verified).
   */
  @Put(':id')
  @ApiOperation({ summary: '更新宠物信息' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
  ) {
    return this.petsService.update(id, userId, dto);
  }

  /**
   * DELETE /pets/:id
   * Delete a pet (ownership verified).
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除宠物' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.petsService.remove(id, userId);
  }
}
