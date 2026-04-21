import { registerAs } from '@nestjs/config';

/**
 * 解析布尔型环境变量，未设置时返回默认值
 */
function envBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

export default registerAs('database', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'eva',
    /** 生产环境默认关闭自动同步，避免 schema 意外变更 */
    synchronize: envBoolean(process.env.DB_SYNCHRONIZE, !isProduction),
    /** 生产环境默认关闭 SQL 日志 */
    logging: envBoolean(process.env.DB_LOGGING, !isProduction),
    /** 是否自动执行迁移 */
    migrationsRun: envBoolean(process.env.DB_MIGRATIONS_RUN, false),
  };
});
