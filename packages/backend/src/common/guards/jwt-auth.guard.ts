import {
  Injectable,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessErrorCode } from '@eva/shared';
import { BusinessException } from '../errors/business.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new BusinessException(
          BusinessErrorCode.AUTH_UNAUTHORIZED,
          '未登录或登录状态已失效',
          HttpStatus.UNAUTHORIZED,
        )
      );
    }
    return user;
  }
}
