import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

type CacheValue = {
  value: unknown;
  expiresAt: number;
};

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly namespace: string;
  private readonly memoryStore = new Map<string, CacheValue>();
  private readonly redisClient: Redis | null;

  constructor(private readonly configService: ConfigService) {
    this.namespace = this.configService.get<string>('cache.namespace', 'eva');

    try {
      this.redisClient = new Redis({
        host: this.configService.get<string>('queue.redisHost', 'localhost'),
        port: this.configService.get<number>('queue.redisPort', 6379),
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      this.redisClient.on('error', (error) => {
        this.logger.warn(`Redis cache unavailable, fallback to memory store: ${error.message}`);
      });
    } catch (error) {
      this.redisClient = null;
      this.logger.warn('Redis cache bootstrap failed, fallback to memory store');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const namespacedKey = this.buildKey(key);

    if (this.redisClient) {
      try {
        if (this.redisClient.status === 'wait') {
          await this.redisClient.connect();
        }
        const cached = await this.redisClient.get(namespacedKey);
        if (cached) {
          return JSON.parse(cached) as T;
        }
      } catch (error) {
        this.logger.debug(`Redis get failed for ${namespacedKey}: ${String(error)}`);
      }
    }

    const memoryValue = this.memoryStore.get(namespacedKey);
    if (!memoryValue) {
      return null;
    }

    if (Date.now() > memoryValue.expiresAt) {
      this.memoryStore.delete(namespacedKey);
      return null;
    }

    return memoryValue.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const namespacedKey = this.buildKey(key);

    if (this.redisClient) {
      try {
        if (this.redisClient.status === 'wait') {
          await this.redisClient.connect();
        }
        await this.redisClient.set(
          namespacedKey,
          JSON.stringify(value),
          'EX',
          ttlSeconds,
        );
        return;
      } catch (error) {
        this.logger.debug(`Redis set failed for ${namespacedKey}: ${String(error)}`);
      }
    }

    this.memoryStore.set(namespacedKey, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    const namespacedKey = this.buildKey(key);

    if (this.redisClient) {
      try {
        if (this.redisClient.status === 'wait') {
          await this.redisClient.connect();
        }
        await this.redisClient.del(namespacedKey);
      } catch (error) {
        this.logger.debug(`Redis del failed for ${namespacedKey}: ${String(error)}`);
      }
    }

    this.memoryStore.delete(namespacedKey);
  }

  async delByPrefix(prefix: string): Promise<void> {
    const namespacedPrefix = this.buildKey(prefix);

    if (this.redisClient) {
      try {
        if (this.redisClient.status === 'wait') {
          await this.redisClient.connect();
        }
        const keys = await this.redisClient.keys(`${namespacedPrefix}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (error) {
        this.logger.debug(`Redis delByPrefix failed for ${namespacedPrefix}: ${String(error)}`);
      }
    }

    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(namespacedPrefix)) {
        this.memoryStore.delete(key);
      }
    }
  }

  async wrap<T>(
    key: string,
    ttlSeconds: number,
    producer: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await producer();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient && this.redisClient.status !== 'end') {
      await this.redisClient.quit();
    }
  }

  private buildKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
}
