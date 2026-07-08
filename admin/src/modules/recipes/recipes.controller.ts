import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto, UpdateRecipeDto } from './recipes.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@ApiTags('宠物喂食记录')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/recipes')
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 获取指定宠物的所有喂食记录
   */
  @Get()
  @ApiOperation({ summary: '获取宠物的所有喂食记录' })
  @ApiResponse({ status: 200, description: '成功返回喂食记录列表' })
  async findAll(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.verifyPetOwnership(petId, user.id);
    return this.recipesService.findAll(petId, user.id);
  }

  /**
   * 获取单条喂食记录
   */
  @Get(':id')
  @ApiOperation({ summary: '获取单条喂食记录' })
  @ApiResponse({ status: 200, description: '成功返回喂食记录' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async findOne(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.verifyPetOwnership(petId, user.id);
    return this.recipesService.findOne(id, user.id);
  }

  /**
   * 创建喂食记录
   */
  @Post()
  @ApiOperation({ summary: '创建喂食记录' })
  @ApiResponse({ status: 201, description: '成功创建喂食记录' })
  async create(
    @Param('petId') petId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateRecipeDto,
  ) {
    await this.verifyPetOwnership(petId, user.id);
    return this.recipesService.create(petId, user.id, dto);
  }

  /**
   * 更新喂食记录
   */
  @Put(':id')
  @ApiOperation({ summary: '更新喂食记录' })
  @ApiResponse({ status: 200, description: '成功更新喂食记录' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateRecipeDto,
  ) {
    await this.verifyPetOwnership(petId, user.id);
    return this.recipesService.update(id, user.id, dto);
  }

  /**
   * 删除喂食记录
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除喂食记录' })
  @ApiResponse({ status: 200, description: '成功删除喂食记录' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.verifyPetOwnership(petId, user.id);
    return this.recipesService.remove(id, user.id);
  }

  /**
   * 验证宠物是否属于当前用户
   */
  private async verifyPetOwnership(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException(`宠物 ${petId} 不存在`);
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('无权操作该宠物的数据');
    }
  }
}
