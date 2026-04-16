import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

import {
  AllExceptionsFilter,
} from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { RolesGuard } from './common/guards/roles.guard';
import { PromptModule } from './modules/prompt/prompt.module';

import * as entities from './database/entities';
import { ObservabilityModule } from './modules/observability/observability.module';
import { AIApplicationModule } from './modules/ai-application/ai-application.module';
import { EvalSetModule } from './modules/eval-set/eval-set.module';
import { EvalMetricModule } from './modules/eval-metric/eval-metric.module';
import { EvalTaskModule } from './modules/eval-task/eval-task.module';
import { PlaygroundModule } from './modules/playground/playground.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AutoEvalModule } from './modules/auto-eval/auto-eval.module';
import { AuthModule } from './modules/auth/auth.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import queueConfig from './config/queue.config';
import securityConfig from './config/security.config';
import cacheConfig from './config/cache.config';
import llmConfig from './config/llm.config';
import monitoringConfig from './config/monitoring.config';
import { validateEnvironment } from './config/env.validation';
import { CacheModule } from './infrastructure/cache/cache.module';
import { LlmModule } from './infrastructure/llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [
        appConfig,
        databaseConfig,
        queueConfig,
        securityConfig,
        cacheConfig,
        llmConfig,
        monitoringConfig,
      ],
      validate: validateEnvironment,
    }),
    CacheModule,
    LlmModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'postgres'),
        password: configService.get<string>('database.password', 'postgres'),
        database: configService.get<string>('database.database', 'eva'),
        entities: Object.values(entities),
        migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
        migrationsRun: configService.get<boolean>(
          'database.migrationsRun',
          false,
        ),
        synchronize: configService.get<boolean>('database.synchronize', false),
        logging: configService.get<boolean>('database.logging', false),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('queue.redisHost', 'localhost'),
          port: configService.get<number>('queue.redisPort', 6379),
        },
      }),
    }),
    EvalSetModule,
    PromptModule,
    ObservabilityModule,
    AIApplicationModule,
    EvalMetricModule,
    EvalTaskModule,
    AutoEvalModule,
    PlaygroundModule,
    LeaderboardModule,
    SettingsModule,
    AuthModule,
  ],
  providers: [
    RolesGuard,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
