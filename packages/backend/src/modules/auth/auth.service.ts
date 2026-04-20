import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';
import { LoginResponse, UserRole } from '@eva/shared';
import { JwtUser } from '../../common/strategies/jwt.strategy';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string): Promise<JwtUser & { id: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在或已失效');
    }

    return {
      id: user.id,
      userId: user.id,
      name: user.name,
      employeeId: user.employeeId ?? undefined,
      role: user.role,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const demoPassword = this.configService.get<string>(
      'DEMO_LOGIN_PASSWORD',
      'eva2026',
    );

    if (dto.password !== demoPassword) {
      throw new UnauthorizedException('账号或密码错误');
    }

    let user = await this.userRepository.findOne({
      where: { employeeId: dto.employeeId },
    });

    // 自动创建演示账号（首次登录时）
    if (!user && dto.employeeId === 'demo') {
      user = this.userRepository.create({
        name: 'Demo User',
        employeeId: 'demo',
        role: UserRole.ADMIN,
        avatar: null,
      });
      user = await this.userRepository.save(user);
    }

    if (!user) {
      throw new UnauthorizedException('账号不存在，请使用演示账号登录');
    }

    const profile = {
      id: user.id,
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      name: user.name,
      employeeId: user.employeeId ?? undefined,
      role: user.role,
    });

    return {
      accessToken,
      user: profile,
    };
  }
}
