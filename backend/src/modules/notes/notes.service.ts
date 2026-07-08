import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async checkPet(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
  }

  async findAll(petId: string, userId: string) {
    await this.checkPet(petId, userId);
    return this.prisma.note.findMany({ where: { petId }, orderBy: { updatedAt: 'desc' } });
  }

  async create(petId: string, userId: string, dto: any) {
    await this.checkPet(petId, userId);
    return this.prisma.note.create({ data: { ...dto, petId, userId } });
  }

  async update(id: string, userId: string, dto: any) {
    const item = await this.prisma.note.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('记事不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.note.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.note.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('记事不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.note.delete({ where: { id } });
  }
}
