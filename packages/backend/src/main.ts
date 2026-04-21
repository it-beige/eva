import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import * as classTransformer from 'class-transformer';
import { AppModule } from './app.module';

/**
 * 应用启动入口
 *
 * 职责：
 *  1. 初始化 NestJS 应用上下文
 *  2. 注册全局中间件、管道、安全策略
 *  3. 配置 Swagger 文档
 *  4. 监听端口并输出启动日志
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  // ---- class-transformer 兼容性补丁 ----
  // Nest 10 的 ValidationPipe 仍引用 plainToClass，
  // 而 class-transformer 0.5 仅导出 plainToInstance，此处做兼容映射
  const ct = classTransformer as Record<string, unknown>;
  if (!('plainToClass' in ct) && 'plainToInstance' in ct) {
    ct['plainToClass'] = ct['plainToInstance'];
  }

  // ---- 读取配置 ----
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const corsOrigin = configService.get<string>('security.corsOrigin', '*');
  const port = configService.get<number>('app.port', 3000);
  const host = configService.get<string>('HOST', '127.0.0.1');
  const sentryDsn = configService.get<string>('monitoring.sentryDsn', '');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // ---- Sentry 监控初始化 ----
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: configService.get<string>('monitoring.environment', 'development'),
    });
    logger.log('Sentry 监控已初始化');
  }

  // 注册优雅关停钩子，确保连接池、队列等资源正确释放
  app.enableShutdownHooks();

  // ---- 全局前缀 ----
  app.setGlobalPrefix(apiPrefix);

  // ---- 安全中间件 ----
  app.use(helmet());

  // ---- CORS 配置 ----
  app.enableCors({
    origin:
      corsOrigin === '*'
        ? true
        : corsOrigin
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean),
    credentials: true,
  });

  // ---- 全局验证管道 ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ---- Swagger 文档（仅非生产环境开启） ----
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Eva API')
      .setDescription('Eva AI 评测平台接口文档')
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, swaggerDocument, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Swagger 文档已挂载: /${apiPrefix}/docs`);
  }

  await app.listen(port, host);
  logger.log(`Eva 后端服务已启动 => http://${host}:${port}/${apiPrefix} [${nodeEnv}]`);
}

bootstrap().catch((err) => {
  // 启动阶段的致命错误直接打到 stderr 并退出
  const logger = new Logger('Bootstrap');
  logger.error('应用启动失败', err instanceof Error ? err.stack : String(err));
  process.exit(1);
});
