import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto, UpdatePetDto } from './pets.dto';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all pets belonging to a user.
   * Supports optional pagination and type filtering.
   */
  async findAll(userId: string, params?: { page?: number; size?: number; type?: string }) {
    const page = params?.page ?? 1;
    const size = params?.size ?? 20;
    const skip = (page - 1) * size;

    const where: any = { userId };
    if (params?.type) {
      where.type = params.type;
    }

    const [data, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pet.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  /**
   * Get a single pet by id, verifying it belongs to the requesting user.
   */
  async findOne(id: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });

    if (!pet) {
      throw new NotFoundException(`宠物 (id=${id}) 不存在`);
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('无权访问该宠物');
    }

    return pet;
  }

  /**
   * Create a new pet record for the given user.
   */
  async create(userId: string, dto: CreatePetDto) {
    return this.prisma.pet.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  /**
   * Update a pet record, verifying ownership first.
   */
  async update(id: string, userId: string, dto: UpdatePetDto) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });

    if (!pet) {
      throw new NotFoundException(`宠物 (id=${id}) 不存在`);
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('无权修改该宠物');
    }

    return this.prisma.pet.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete a pet record, verifying ownership first.
   */
  async remove(id: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });

    if (!pet) {
      throw new NotFoundException(`宠物 (id=${id}) 不存在`);
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('无权删除该宠物');
    }

    return this.prisma.pet.delete({ where: { id } });
  }
}
