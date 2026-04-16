import { registerAs } from '@nestjs/config';

export default registerAs('monitoring', () => ({
  sentryDsn: process.env.SENTRY_DSN ?? '',
  environment: process.env.NODE_ENV ?? 'development',
}));
