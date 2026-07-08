import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async checkPet(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.userId !== userId) throw new ForbiddenException('无权访问');
  }

  async findAll(petId: string, userId: string) {
    await this.checkPet(petId, userId);
    return this.prisma.medicalRecord.findMany({ where: { petId }, orderBy: { visitDate: 'desc' } });
  }

  async create(petId: string, userId: string, dto: any) {
    await this.checkPet(petId, userId);
    return this.prisma.medicalRecord.create({
      data: { ...dto, petId, userId, visitDate: new Date(dto.visitDate || Date.now()) },
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('病历不存在');
    if (item.userId !== userId) throw new ForbiddenException('无权访问');
    return this.prisma.medicalRecord.delete({ where: { id } });
  }
}
