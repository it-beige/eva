import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import * as classTransformer from 'class-transformer';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  // Nest 10's ValidationPipe still references plainToClass.
  // class-transformer 0.5 only exports plainToInstance.
  const ct = classTransformer as Record<string, unknown>;
  if (!('plainToClass' in ct) && 'plainToInstance' in ct) {
    ct['plainToClass'] = ct['plainToInstance'];
  }

  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const corsOrigin = configService.get<string>('security.corsOrigin', '*');
  const port = configService.get<number>('app.port', 3000);
  const host = configService.get<string>('HOST', '127.0.0.1');
  const sentryDsn = configService.get<string>('monitoring.sentryDsn', '');

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: configService.get<string>('monitoring.environment', 'development'),
    });
  }

  app.enableShutdownHooks();

  // 全局前缀
  app.setGlobalPrefix(apiPrefix);

  // 安全中间件
  app.use(helmet());

  // CORS
  app.enableCors({
    origin:
      corsOrigin === '*'
        ? true
        : corsOrigin
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    credentials: true,
  });

  // 全局验证管道
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Eva API')
    .setDescription('Eva AI 评测平台接口文档')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, host);
  console.log(`Eva backend running on http://${host}:${port}/${apiPrefix}`);
}
bootstrap();
