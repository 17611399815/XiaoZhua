import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}

  async checkPet(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
  }

  async findAll(petId: string, userId: string, page = 1, size = 20) {
    await this.checkPet(petId, userId);
    const [data, total] = await Promise.all([
      this.prisma.albumPhoto.findMany({
        where: { petId },
        orderBy: { takenDate: 'desc' },
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.albumPhoto.count({ where: { petId } }),
    ]);
    return { data, pagination: { page, size, total } };
  }

  async create(petId: string, userId: string, dto: any) {
    await this.checkPet(petId, userId);
    return this.prisma.albumPhoto.create({
      data: { ...dto, petId, userId, takenDate: dto.takenDate ? new Date(dto.takenDate) : new Date() },
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.albumPhoto.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('照片不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.albumPhoto.delete({ where: { id } });
  }
}
