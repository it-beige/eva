import { IsString, IsEmail, IsIn, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role: 'owner' | 'admin' | 'member';
}

export class UpdateMemberDto {
  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role: 'owner' | 'admin' | 'member';
}

export interface Member {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
}

export interface CreateTokenDto {
  name: string;
  expiresIn?: number; // 过期时间（天），null 表示永不过期
}

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  maskedToken: string;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}
