import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  /**
   * 构建完整的文件访问 URL
   */
  getFileUrl(filename: string): string {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }

  /**
   * 验证上传文件是否存在
   */
  validateFile(filename: string): void {
    const filePath = join(process.cwd(), 'uploads', filename);
    if (!filename || !existsSync(filePath)) {
      throw new BadRequestException('文件上传失败或文件不存在');
    }
  }

  /**
   * 删除本地文件
   */
  deleteFile(filename: string): void {
    const filePath = join(process.cwd(), 'uploads', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
