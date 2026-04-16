import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';

import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { JwtStrategy } from './common/strategies/jwt.strategy';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'eva'),
        entities: Object.values(entities),
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature(Object.values(entities)),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
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
  ],
  providers: [
    JwtStrategy,
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
