import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './medical-records.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取某只宠物的所有就诊记录（需验证宠物属于该用户）
   */
  async findAll(petId: string, userId: string) {
    // 验证宠物归属
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    return this.prisma.medicalRecord.findMany({
      where: { petId, userId },
      orderBy: { visitDate: 'desc' },
    });
  }

  /**
   * 获取单条就诊记录（需验证归属）
   */
  async findOne(id: string, userId: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, userId },
    });

    if (!record) {
      throw new NotFoundException('就诊记录不存在或无权访问');
    }

    return record;
  }

  /**
   * 创建就诊记录
   */
  async create(petId: string, userId: string, dto: CreateMedicalRecordDto) {
    // 验证宠物归属
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    return this.prisma.medicalRecord.create({
      data: {
        ...dto,
        petId,
        userId,
      },
    });
  }

  /**
   * 更新就诊记录（需验证归属）
   */
  async update(id: string, userId: string, dto: UpdateMedicalRecordDto) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, userId },
    });

    if (!record) {
      throw new NotFoundException('就诊记录不存在或无权访问');
    }

    return this.prisma.medicalRecord.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除就诊记录（需验证归属）
   */
  async remove(id: string, userId: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, userId },
    });

    if (!record) {
      throw new NotFoundException('就诊记录不存在或无权访问');
    }

    return this.prisma.medicalRecord.delete({
      where: { id },
    });
  }
}
