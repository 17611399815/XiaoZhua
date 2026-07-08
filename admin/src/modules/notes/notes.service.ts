import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './notes.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify that a pet belongs to the given user.
   * Throws NotFoundException if pet does not exist.
   * Throws ForbiddenException if pet does not belong to user.
   */
  private async verifyPetOwnership(petId: string, userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id ${petId} not found`);
    }

    if (pet.userId !== userId) {
      throw new ForbiddenException('You do not own this pet');
    }

    return pet;
  }

  /**
   * Verify that a note belongs to the given user.
   * Throws NotFoundException if note does not exist.
   * Throws ForbiddenException if note's pet does not belong to user.
   */
  private async verifyNoteOwnership(noteId: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { pet: true },
    });

    if (!note) {
      throw new NotFoundException(`Note with id ${noteId} not found`);
    }

    if (note.pet.userId !== userId) {
      throw new ForbiddenException('You do not own this note');
    }

    return note;
  }

  async findAll(petId: string, userId: string) {
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.note.findMany({
      where: { petId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.verifyNoteOwnership(id, userId);
  }

  async create(petId: string, userId: string, dto: CreateNoteDto) {
    await this.verifyPetOwnership(petId, userId);

    return this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content,
        petId,
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateNoteDto) {
    await this.verifyNoteOwnership(id, userId);

    return this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.verifyNoteOwnership(id, userId);

    await this.prisma.note.delete({
      where: { id },
    });

    return { message: 'Note deleted successfully' };
  }
}
