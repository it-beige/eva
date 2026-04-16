import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  ttlSeconds: Number.parseInt(process.env.CACHE_TTL_SECONDS ?? '120', 10),
  namespace: process.env.CACHE_NAMESPACE ?? 'eva',
}));
