import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { TraceableRequest } from '../http/traceable-request';

/** 慢请求告警阈值（毫秒） */
const SLOW_REQUEST_THRESHOLD_MS = 3000;

/**
 * HTTP 请求日志中间件
 *
 * 职责：
 *  1. 为每个请求生成 / 透传 traceId，并写入响应头
 *  2. 记录请求日志（method、path、statusCode、耗时）
 *  3. 超过慢请求阈值时输出 WARN 级别日志，便于性能巡检
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl } = request;
    const startTime = Date.now();
    const traceRequest = request as TraceableRequest;
    const traceId =
      request.header('x-trace-id') ??
      request.header('x-request-id') ??
      randomUUID();

    traceRequest.traceId = traceId;
    response.setHeader('x-trace-id', traceId);

    response.on('finish', () => {
      const { statusCode } = response;
      const durationMs = Date.now() - startTime;

      const logPayload = {
        traceId,
        method,
        path: originalUrl,
        statusCode,
        durationMs,
        userAgent: request.get('user-agent') ?? 'unknown',
      };

      // 慢请求告警：超过阈值时输出 WARN 日志，方便 SRE 监控
      if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
        this.logger.warn(
          `慢请求告警 ${JSON.stringify(logPayload)}`,
        );
      } else {
        this.logger.log(JSON.stringify(logPayload));
      }
    });

    next();
  }
}
