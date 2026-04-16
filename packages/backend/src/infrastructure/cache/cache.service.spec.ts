import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    const configService = new ConfigService({
      CACHE_NAMESPACE: 'test',
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: 6399,
    });
    service = new CacheService(configService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('stores and retrieves values from fallback store', async () => {
    await service.set('foo', { bar: 1 }, 60);

    await expect(service.get<{ bar: number }>('foo')).resolves.toEqual({
      bar: 1,
    });
  });

  it('invalidates by prefix', async () => {
    await service.set('leaderboard:a', 1, 60);
    await service.set('leaderboard:b', 2, 60);

    await service.delByPrefix('leaderboard:');

    await expect(service.get('leaderboard:a')).resolves.toBeNull();
    await expect(service.get('leaderboard:b')).resolves.toBeNull();
  });
});
