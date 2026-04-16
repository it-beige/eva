import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessErrorCode, UserRole } from '@eva/shared';
import { JwtUser } from '../strategies/jwt.strategy';
import { BusinessException } from '../errors/business.exception';
import { ROLES_KEY } from '../auth/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtUser }>();
    const user = request.user;

    if (!user) {
      throw new BusinessException(
        BusinessErrorCode.AUTH_UNAUTHORIZED,
        '未登录或登录状态已失效',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new BusinessException(
        BusinessErrorCode.AUTH_FORBIDDEN,
        '当前账号无权访问该资源',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
