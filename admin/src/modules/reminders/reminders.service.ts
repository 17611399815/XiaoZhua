import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto, UpdateReminderDto } from './reminders.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify that a pet belongs to the given user.
   * Throws ForbiddenException if the pet does not exist or is not owned by the user.
   */
  private async verifyPetOwnership(petId: string, userId: string): Promise<void> {
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });
    if (!pet) {
      throw new ForbiddenException('您无权操作该宠物的提醒，或宠物不存在');
    }
  }

  /**
   * Verify that a reminder belongs to the given user (via pet ownership).
   * Returns the reminder if ownership is confirmed.
   */
  private async findReminderOrThrow(
    id: string,
    userId: string,
  ) {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
      include: { pet: true },
    });

    if (!reminder) {
      throw new NotFoundException('提醒记录不存在');
    }

    if (reminder.pet.userId !== userId) {
      throw new ForbiddenException('您无权操作该提醒');
    }

    return reminder;
  }

  /**
   * List all reminders for a given pet, scoped to the owning user.
   */
  async findAll(petId: string, userId: string) {
    await this.verifyPetOwnership(petId, userId);
    return this.prisma.reminder.findMany({
      where: { petId },
      orderBy: [{ remindDate: 'asc' }, { remindTime: 'asc' }],
    });
  }

  /**
   * Get a single reminder by id, verifying it belongs (via pet) to the user.
   */
  async findOne(id: string, userId: string) {
    return this.findReminderOrThrow(id, userId);
  }

  /**
   * Create a new reminder for a pet owned by the user.
   */
  async create(petId: string, userId: string, dto: CreateReminderDto) {
    await this.verifyPetOwnership(petId, userId);
    return this.prisma.reminder.create({
      data: {
        ...dto,
        petId,
        userId,
      },
    });
  }

  /**
   * Update an existing reminder (verify ownership via pet -> user).
   */
  async update(id: string, userId: string, dto: UpdateReminderDto) {
    await this.findReminderOrThrow(id, userId);
    return this.prisma.reminder.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a reminder (verify ownership via pet -> user).
   */
  async remove(id: string, userId: string) {
    await this.findReminderOrThrow(id, userId);
    return this.prisma.reminder.delete({
      where: { id },
    });
  }

  /**
   * Toggle the isCompleted status of a reminder (verify ownership via pet -> user).
   */
  async toggleComplete(id: string, userId: string) {
    const reminder = await this.findReminderOrThrow(id, userId);
    return this.prisma.reminder.update({
      where: { id },
      data: { isCompleted: !reminder.isCompleted },
    });
  }
}
