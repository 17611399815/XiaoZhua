import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWeightRecordDto, UpdateWeightRecordDto } from './weight-records.dto';

@Injectable()
export class WeightRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all weight records for a given pet owned by the specified user.
   */
  async findAll(petId: string, userId: string) {
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.weightRecord.findMany({
      where: { petId },
      orderBy: { recordDate: 'desc' },
    });
  }

  /**
   * Get a single weight record by ID, verifying that the record's pet
   * belongs to the requesting user.
   */
  async findOne(id: string, userId: string) {
    const record = await this.prisma.weightRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('体重记录不存在');
    }

    await this.verifyPetOwnership(record.petId, userId);

    return record;
  }

  /**
   * Create a new weight record for a pet and update the pet's current weight.
   */
  async create(petId: string, userId: string, dto: CreateWeightRecordDto) {
    await this.verifyPetOwnership(petId, userId);

    const record = await this.prisma.weightRecord.create({
      data: {
        weight: dto.weight,
        recordDate: new Date(dto.recordDate),
        petId,
        userId,
      },
    });

    // Update the pet's current weight to the newly recorded value
    await this.prisma.pet.update({
      where: { id: petId },
      data: { weight: dto.weight },
    });

    return record;
  }

  /**
   * Update an existing weight record.
   * Ownership is verified through the record's pet.
   */
  async update(id: string, userId: string, dto: UpdateWeightRecordDto) {
    const record = await this.prisma.weightRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('体重记录不存在');
    }

    await this.verifyPetOwnership(record.petId, userId);

    const updateData: Record<string, unknown> = {};
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.recordDate !== undefined) updateData.recordDate = new Date(dto.recordDate);

    return this.prisma.weightRecord.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a weight record.
   * Ownership is verified through the record's pet.
   */
  async remove(id: string, userId: string) {
    const record = await this.prisma.weightRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('体重记录不存在');
    }

    await this.verifyPetOwnership(record.petId, userId);

    return this.prisma.weightRecord.delete({ where: { id } });
  }

  // ── Private helpers ──

  /**
   * Verifies that the given pet exists and belongs to the specified user.
   * Throws ForbiddenException if the pet is not found or belongs to another user.
   */
  private async verifyPetOwnership(petId: string, userId: string): Promise<void> {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });

    if (!pet || pet.userId !== userId) {
      throw new ForbiddenException('无权访问该宠物的数据');
    }
  }
}
