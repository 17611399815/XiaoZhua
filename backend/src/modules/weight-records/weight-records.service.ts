import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WeightRecordsService {
  constructor(private prisma: PrismaService) {}

  async checkPet(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
  }

  async findAll(petId: string, userId: string) {
    await this.checkPet(petId, userId);
    return this.prisma.weightRecord.findMany({ where: { petId }, orderBy: { recordDate: 'asc' } });
  }

  async create(petId: string, userId: string, dto: any) {
    await this.checkPet(petId, userId);
    const record = await this.prisma.weightRecord.create({
      data: { ...dto, petId, userId, recordDate: new Date(dto.recordDate || Date.now()) },
    });
    // Update pet's current weight
    await this.prisma.pet.update({ where: { id: petId }, data: { weight: dto.weight } });
    return record;
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.weightRecord.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('记录不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.weightRecord.delete({ where: { id } });
  }
}
