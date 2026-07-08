import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipeDto, UpdateRecipeDto } from './recipes.dto';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定宠物的所有喂食记录（仅限该用户所属宠物）
   */
  async findAll(petId: string, userId: string) {
    // 验证宠物归属
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.recipe.findMany({
      where: { petId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取单条喂食记录（验证归属）
   */
  async findOne(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`喂食记录 ${id} 不存在`);
    }

    // 验证该记录所属宠物的归属
    await this.verifyPetOwnership(recipe.petId, userId);

    return recipe;
  }

  /**
   * 创建喂食记录
   */
  async create(petId: string, userId: string, dto: CreateRecipeDto) {
    // 验证宠物归属
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.recipe.create({
      data: {
        ...dto,
        petId,
        userId,
      },
    });
  }

  /**
   * 更新喂食记录
   */
  async update(id: string, userId: string, dto: UpdateRecipeDto) {
    // 先查询记录是否存在并验证宠物归属
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`喂食记录 ${id} 不存在`);
    }

    await this.verifyPetOwnership(recipe.petId, userId);

    return this.prisma.recipe.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除喂食记录
   */
  async remove(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`喂食记录 ${id} 不存在`);
    }

    await this.verifyPetOwnership(recipe.petId, userId);

    return this.prisma.recipe.delete({
      where: { id },
    });
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
