import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { resolve } from 'path';
import * as entities from './entities';

loadEnv({
  path: resolve(__dirname, '../../../.env'),
});

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'eva',
  entities: Object.values(entities),
  migrations: [resolve(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging:
    process.env.DB_LOGGING === 'true' ||
    (!isProduction && process.env.DB_LOGGING !== 'false'),
});
