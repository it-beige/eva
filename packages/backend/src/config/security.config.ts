import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  corsOrigin:
    process.env.CORS_ORIGIN ??
    'http://localhost:5173,http://127.0.0.1:5173',
  jwtSecret:
    process.env.JWT_SECRET ?? 'eva-dev-secret-change-me-1234567890',
}));
