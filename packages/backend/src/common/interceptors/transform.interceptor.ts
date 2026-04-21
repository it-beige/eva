import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TraceableRequest } from '../http/traceable-request';

/**
 * 统一成功响应体结构
 *
 * @template T 业务数据类型
 */
export interface SuccessResponse<T> {
  /** 业务状态码，0 表示成功 */
  code: number;
  message: string;
  data: T;
  timestamp: string;
  /** 链路追踪 ID，便于前后端日志关联 */
  traceId: string;
}

/**
 * 全局响应转换拦截器
 *
 * 职责：将控制器返回的原始数据包装为统一的 { code, message, data, timestamp, traceId } 结构。
 * 异常场景由 AllExceptionsFilter 统一处理，不经过此拦截器。
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<TraceableRequest>();
    const traceId =
      request.traceId ??
      request.header?.('x-trace-id') ??
      request.header?.('x-request-id') ??
      'unknown';

    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
        traceId,
      })),
    );
  }
}
