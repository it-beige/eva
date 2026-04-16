import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'eva',
  synchronize:
    process.env.DB_SYNCHRONIZE === 'true'
      ? true
      : process.env.DB_SYNCHRONIZE === 'false'
        ? false
        : process.env.NODE_ENV !== 'production',
  logging:
    process.env.DB_LOGGING === 'true'
      ? true
      : process.env.DB_LOGGING === 'false'
        ? false
        : process.env.NODE_ENV !== 'production',
  migrationsRun:
    process.env.DB_MIGRATIONS_RUN === 'true'
      ? true
      : process.env.DB_MIGRATIONS_RUN === 'false'
        ? false
        : false,
}));
