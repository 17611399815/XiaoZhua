import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockItemsService {
  constructor(private prisma: PrismaService) {}

  async checkPet(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
  }

  async findAll(petId: string, userId: string) {
    await this.checkPet(petId, userId);
    return this.prisma.stockItem.findMany({ where: { petId }, orderBy: { createdAt: 'desc' } });
  }

  async create(petId: string, userId: string, dto: any) {
    await this.checkPet(petId, userId);
    return this.prisma.stockItem.create({ data: { ...dto, petId, userId } });
  }

  async update(id: string, userId: string, dto: any) {
    const item = await this.prisma.stockItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('物品不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.stockItem.update({ where: { id }, data: dto });
  }

  async decrement(id: string, userId: string, amount: number = 1) {
    const item = await this.prisma.stockItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('物品不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    const newRemaining = Math.max(0, item.remaining - amount);
    return this.prisma.stockItem.update({ where: { id }, data: { remaining: newRemaining } });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.stockItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('物品不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.stockItem.delete({ where: { id } });
  }
}
