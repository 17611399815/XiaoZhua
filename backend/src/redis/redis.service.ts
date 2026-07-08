import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

interface CacheEntry {
  value: string;
  expiresAt: number | null; // null = no expiry
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private connected = false;

  // In-memory fallback when Redis is unavailable
  private readonly memoryStore = new Map<string, CacheEntry>();

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy: () => null,
    });

    this.client.on('error', () => {});

    // Attempt connection and fallback to memory if unavailable
    this.client.connect()
      .then(() => {
        this.connected = true;
        this.logger.log('Redis connected');
      })
      .catch(() => {
        this.connected = false;
        this.logger.warn('Redis unavailable — using in-memory cache');
      });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.connected) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        // fall through to memory fallback
      }
    }

    // In-memory fallback
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    if (this.connected) {
      try {
        return await this.client.get(key);
      } catch {
        // fall through to memory fallback
      }
    }

    // In-memory fallback
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    // Check expiry
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  async del(key: string): Promise<void> {
    if (this.connected) {
      try {
        await this.client.del(key);
        return;
      } catch {
        // fall through to memory fallback
      }
    }

    this.memoryStore.delete(key);
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      // ignore
    }
  }
}
