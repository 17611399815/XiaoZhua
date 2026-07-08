import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.pet.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('宠物不存在');
    if (pet.userId !== userId) throw new ForbiddenException('无权访问');
    return pet;
  }

  async create(userId: string, data: any) {
    const count = await this.prisma.pet.count({ where: { userId } });
    return this.prisma.pet.create({
      data: {
        ...data,
        userId,
        meetDate: data.meetDate ? new Date(data.meetDate) : new Date(),
        isCurrent: count === 0,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    await this.findOne(id, userId);
    if (data.meetDate) data.meetDate = new Date(data.meetDate);
    return this.prisma.pet.update({ where: { id }, data });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.pet.delete({ where: { id } });
  }

  async switchPet(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.pet.updateMany({ where: { userId, isCurrent: true }, data: { isCurrent: false } });
    return this.prisma.pet.update({ where: { id }, data: { isCurrent: true } });
  }
}
