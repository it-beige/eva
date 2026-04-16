import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessErrorCode, ErrorResponse } from '@eva/shared';
import { TraceableRequest } from '../http/traceable-request';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const rawMessage =
        (exceptionResponse as { message?: string | string[] }).message ??
        'Internal server error';
      message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
    } else {
      message = 'Internal server error';
    }

    const errorResponse: ErrorResponse = {
      code: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId:
        request.header('x-trace-id') ??
        request.header('x-request-id') ??
        'unknown',
      statusCode: status,
    };

    response.status(status).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<TraceableRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const traceId =
      request.traceId ??
      request.header('x-trace-id') ??
      request.header('x-request-id') ??
      'unknown';
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const normalized = this.normalizeException(exceptionResponse, status);

    const errorResponse: ErrorResponse = {
      code: normalized.code,
      message: normalized.message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
      traceId,
      statusCode: status,
    };

    if (!(exception instanceof HttpException) || status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        JSON.stringify({
          traceId,
          method: request.method,
          path: request.url,
          statusCode: status,
          error:
            exception instanceof Error
              ? exception.stack ?? exception.message
              : String(exception),
        }),
      );
    }

    response.setHeader('x-trace-id', traceId);
    response.status(status).json(errorResponse);
  }

  private normalizeException(
    exceptionResponse: unknown,
    status: HttpStatus,
  ): { code: BusinessErrorCode | number; message: string } {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const payload = exceptionResponse as {
        code?: BusinessErrorCode;
        message?: string | string[];
      };

      const message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message ?? this.defaultMessage(status);

      return {
        code: payload.code ?? this.defaultCode(status),
        message,
      };
    }

    if (typeof exceptionResponse === 'string') {
      return {
        code: this.defaultCode(status),
        message: exceptionResponse,
      };
    }

    return {
      code: this.defaultCode(status),
      message: this.defaultMessage(status),
    };
  }

  private defaultCode(status: HttpStatus): BusinessErrorCode | number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return BusinessErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return BusinessErrorCode.AUTH_UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return BusinessErrorCode.AUTH_FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return BusinessErrorCode.RESOURCE_NOT_FOUND;
      default:
        return BusinessErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private defaultMessage(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return '请求参数不合法';
      case HttpStatus.UNAUTHORIZED:
        return '未登录或登录状态已失效';
      case HttpStatus.FORBIDDEN:
        return '当前账号无权访问该资源';
      case HttpStatus.NOT_FOUND:
        return '请求的资源不存在';
      default:
        return '服务内部异常';
    }
  }
}
