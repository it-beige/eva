import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/** 内存缓存值包装 */
interface MemoryCacheEntry {
  value: unknown;
  /** 过期时间戳（毫秒） */
  expiresAt: number;
}

/**
 * 多级缓存服务
 *
 * 设计思路（阿里 P8 视角）：
 *  1. 优先使用 Redis 作为分布式缓存，保证多实例一致性
 *  2. Redis 不可用时自动降级到进程内 Map，保证服务可用性
 *  3. 提供 wrap() 语义——"缓存穿透保护"，避免缓存击穿
 *  4. Redis 连接采用 lazyConnect，不阻塞启动流程
 *  5. 所有 key 统一加 namespace 前缀，避免多项目混用同一 Redis 时 key 冲突
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly namespace: string;
  private readonly memoryStore = new Map<string, MemoryCacheEntry>();
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
        this.logger.warn(`Redis 缓存不可用，降级到内存缓存: ${error.message}`);
      });
    } catch {
      this.redisClient = null;
      this.logger.warn('Redis 缓存初始化失败，降级到内存缓存');
    }
  }

  // ==================== 公开 API ====================

  /**
   * 读取缓存
   *
   * @returns 缓存值，未命中时返回 null
   */
  async get<T>(key: string): Promise<T | null> {
    const nsKey = this.buildKey(key);

    // 优先 Redis
    const redisValue = await this.safeRedisOp<string | null>(
      (client) => client.get(nsKey),
      null,
    );
    if (redisValue !== null) {
      return JSON.parse(redisValue) as T;
    }

    // 降级到内存
    return this.getFromMemory<T>(nsKey);
  }

  /**
   * 写入缓存
   *
   * @param ttlSeconds 过期时间（秒）
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const nsKey = this.buildKey(key);

    const stored = await this.safeRedisOp<boolean>(
      async (client) => {
        await client.set(nsKey, JSON.stringify(value), 'EX', ttlSeconds);
        return true;
      },
      false,
    );

    // Redis 写入失败时降级到内存
    if (!stored) {
      this.memoryStore.set(nsKey, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  /** 删除单个缓存 key */
  async del(key: string): Promise<void> {
    const nsKey = this.buildKey(key);
    await this.safeRedisOp((client) => client.del(nsKey), undefined);
    this.memoryStore.delete(nsKey);
  }

  /**
   * 按前缀批量删除缓存
   *
   * 注意：Redis KEYS 命令在大数据量下有性能风险，
   * 生产环境建议改用 SCAN 迭代或引入 key 注册表。
   */
  async delByPrefix(prefix: string): Promise<void> {
    const nsPrefix = this.buildKey(prefix);

    await this.safeRedisOp(async (client) => {
      const keys = await client.keys(`${nsPrefix}*`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    }, undefined);

    for (const key of this.memoryStore.keys()) {
      if (key.startsWith(nsPrefix)) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * 缓存穿透保护
   *
   * 先查缓存，未命中则调用 producer 获取数据并写入缓存。
   * 适用于热点数据查询，避免缓存击穿导致 DB 压力。
   */
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

  // ==================== 生命周期 ====================

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient && this.redisClient.status !== 'end') {
      await this.redisClient.quit();
    }
  }

  // ==================== 私有方法 ====================

  /** 构建带命名空间的 key */
  private buildKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /** 从内存缓存读取，自动清理过期条目 */
  private getFromMemory<T>(nsKey: string): T | null {
    const entry = this.memoryStore.get(nsKey);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryStore.delete(nsKey);
      return null;
    }

    return entry.value as T;
  }

  /**
   * 安全执行 Redis 操作
   *
   * 统一处理连接检查、异常捕获、降级逻辑，消除重复的 try-catch 样板代码。
   */
  private async safeRedisOp<T>(
    operation: (client: Redis) => Promise<T>,
    fallback: T,
  ): Promise<T> {
    if (!this.redisClient) return fallback;

    try {
      if (this.redisClient.status === 'wait') {
        await this.redisClient.connect();
      }
      return await operation(this.redisClient);
    } catch (error) {
      this.logger.debug(`Redis 操作失败: ${String(error)}`);
      return fallback;
    }
  }
}
