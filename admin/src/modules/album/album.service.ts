import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumDto } from './album.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AlbumService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取某只宠物的相册列表（分页），需验证宠物属于该用户。
   */
  async findAll(
    petId: string,
    userId: string,
    page: number = 1,
    size: number = 20,
  ) {
    // 验证宠物归属
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    const skip = (page - 1) * size;
    const take = size;

    const [records, total] = await Promise.all([
      this.prisma.album.findMany({
        where: { petId, userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.album.count({
        where: { petId, userId },
      }),
    ]);

    return {
      data: records,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 获取单条相册记录（需验证归属）。
   */
  async findOne(id: string, userId: string) {
    const record = await this.prisma.album.findFirst({
      where: { id, userId },
    });

    if (!record) {
      throw new NotFoundException('相册记录不存在或无权访问');
    }

    return record;
  }

  /**
   * 上传照片到相册。
   * file 是 Multer 处理后的文件对象，包含存储在磁盘上的路径。
   */
  async create(
    petId: string,
    userId: string,
    file: Express.Multer.File,
    dto: CreateAlbumDto,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的照片');
    }

    // 验证宠物归属
    const pet = await this.prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      // 宠物不存在时，删除已上传的文件
      this.deleteFile(file.path);
      throw new NotFoundException('宠物不存在或无权访问');
    }

    // 构建图片 URL（相对于服务器静态资源路径）
    const imageUrl = `/uploads/albums/${file.filename}`;

    return this.prisma.album.create({
      data: {
        imageUrl,
        thumbnailUrl: imageUrl, // 目前缩略图与原图使用同一张，后续可接入图片处理服务
        description: dto.description ?? null,
        takenDate: dto.takenDate ? new Date(dto.takenDate) : null,
        petId,
        userId,
      },
    });
  }

  /**
   * 删除相册记录及对应的磁盘文件。
   */
  async remove(id: string, userId: string) {
    const record = await this.prisma.album.findFirst({
      where: { id, userId },
    });

    if (!record) {
      throw new NotFoundException('相册记录不存在或无权访问');
    }

    // 删除磁盘上的图片文件
    this.deleteFileByUrl(record.imageUrl);

    return this.prisma.album.delete({
      where: { id },
    });
  }

  // ── Private helpers ──

  /**
   * 根据文件路径删除磁盘文件。
   */
  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // 删除文件失败时静默处理，记录可由日志系统捕获
    }
  }

  /**
   * 根据存储的 URL 删除对应的磁盘文件。
   * URL 格式为 /uploads/albums/<filename>
   */
  private deleteFileByUrl(imageUrl: string): void {
    if (!imageUrl) return;

    const filename = path.basename(imageUrl);
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'albums',
      filename,
    );
    this.deleteFile(filePath);
  }
}
