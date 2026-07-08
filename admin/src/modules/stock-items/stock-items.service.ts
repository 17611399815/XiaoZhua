import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStockItemDto, UpdateStockItemDto } from './stock-items.dto';

@Injectable()
export class StockItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all stock items for a pet owned by the given user.
   * Verifies pet ownership before returning results.
   */
  async findAll(petId: string, userId: string) {
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.stockItem.findMany({
      where: { petId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single stock item by id, verifying ownership via userId.
   */
  async findOne(id: string, userId: string) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`库存物品 #${id} 不存在`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权访问该库存物品');
    }

    return item;
  }

  /**
   * Create a new stock item for a pet owned by the user.
   */
  async create(petId: string, userId: string, dto: CreateStockItemDto) {
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.stockItem.create({
      data: {
        ...dto,
        petId,
        userId,
      },
    });
  }

  /**
   * Update a stock item. Verifies ownership before updating.
   */
  async update(id: string, userId: string, dto: UpdateStockItemDto) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`库存物品 #${id} 不存在`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权修改该库存物品');
    }

    return this.prisma.stockItem.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a stock item. Verifies ownership before deleting.
   */
  async remove(id: string, userId: string) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`库存物品 #${id} 不存在`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权删除该库存物品');
    }

    await this.prisma.stockItem.delete({
      where: { id },
    });

    return { message: '库存物品已删除' };
  }

  /**
   * Decrement the remaining count of a stock item by the given amount.
   * Uses atomic update to prevent race conditions.
   */
  async decrement(id: string, userId: string, amount: number) {
    const item = await this.prisma.stockItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`库存物品 #${id} 不存在`);
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('无权操作该库存物品');
    }

    if (item.remaining < amount) {
      throw new BadRequestException(
        `库存不足：当前剩余 ${item.remaining}${item.unit}，无法扣减 ${amount}${item.unit}`,
      );
    }

    return this.prisma.stockItem.update({
      where: { id },
      data: {
        remaining: { decrement: amount },
      },
    });
  }

  /**
   * Verify that a pet exists and belongs to the given user.
   * Throws NotFoundException if the pet doesn't exist,
   * or ForbiddenException if the user doesn't own it.
   */
  private async verifyPetOwnership(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      throw new NotFoundException(`宠物 #${petId} 不存在`);
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('无权操作该宠物的库存');
    }
  }
}
