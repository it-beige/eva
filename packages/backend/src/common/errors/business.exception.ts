import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessErrorCode } from '@eva/shared';

type BusinessExceptionPayload = {
  code: BusinessErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export class BusinessException extends HttpException {
  constructor(
    code: BusinessErrorCode,
    message: string,
    status: HttpStatus,
    details?: Record<string, unknown>,
  ) {
    const payload: BusinessExceptionPayload = {
      code,
      message,
      details,
    };

    super(payload, status);
  }
}
