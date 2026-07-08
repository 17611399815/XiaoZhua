import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current user profile, including their pets.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 (id=${userId}) 不存在`);
    }

    // Strip sensitive fields
    const { password, ...safe } = user as any;
    return safe;
  }

  /**
   * Update current user's nickname and/or avatar.
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`用户 (id=${userId}) 不存在`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { password, ...safe } = updated as any;
    return safe;
  }

  /**
   * Delete the current user account and all related data (cascade).
   */
  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`用户 (id=${userId}) 不存在`);
    }

    // Cascade delete all user-owned data within a transaction
    await this.prisma.$transaction([
      this.prisma.weightRecord.deleteMany({ where: { userId } }),
      this.prisma.medicalRecord.deleteMany({ where: { userId } }),
      this.prisma.reminder.deleteMany({ where: { userId } }),
      this.prisma.stockItem.deleteMany({ where: { userId } }),
      this.prisma.recipe.deleteMany({ where: { userId } }),
      this.prisma.note.deleteMany({ where: { userId } }),
      this.prisma.pet.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }
}
