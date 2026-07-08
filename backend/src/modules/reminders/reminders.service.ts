import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async findAll(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.reminder.findMany({ where: { petId }, orderBy: { remindDate: 'asc' } });
  }

  async create(petId: string, userId: string, dto: any) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.reminder.create({
      data: {
        ...dto,
        petId,
        userId,
        remindDate: new Date(dto.remindDate),
        remindTime: dto.remindTime || '09:00',
      },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const item = await this.prisma.reminder.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('提醒不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    if (dto.remindDate) dto.remindDate = new Date(dto.remindDate);
    // remindTime stays as string e.g. '09:00'
    return this.prisma.reminder.update({ where: { id }, data: dto });
  }

  async toggle(id: string, userId: string) {
    const item = await this.prisma.reminder.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('提醒不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.reminder.update({ where: { id }, data: { isCompleted: !item.isCompleted } });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.reminder.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('提醒不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.reminder.delete({ where: { id } });
  }
}
