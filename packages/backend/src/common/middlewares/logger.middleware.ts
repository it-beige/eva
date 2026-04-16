import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { TraceableRequest } from '../http/traceable-request';

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
      const duration = Date.now() - startTime;

      this.logger.log(
        JSON.stringify({
          traceId,
          method,
          path: originalUrl,
          statusCode,
          durationMs: duration,
          userAgent: request.get('user-agent') ?? 'unknown',
        }),
      );
    });

    next();
  }
}
