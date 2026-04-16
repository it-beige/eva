import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@eva/shared';

export interface JwtPayload {
  sub: string;
  name: string;
  employeeId?: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface JwtUser {
  userId: string;
  name: string;
  employeeId?: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'security.jwtSecret',
        'eva-secret-key',
      ),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      name: payload.name,
      employeeId: payload.employeeId,
      role: payload.role,
    };
  }
}
