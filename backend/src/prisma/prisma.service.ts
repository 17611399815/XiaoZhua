import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  get isConnected() {
    return this.connected;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Database connected');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Database unavailable: ${message}. Running in mock mode.`);
    }
  }
}
