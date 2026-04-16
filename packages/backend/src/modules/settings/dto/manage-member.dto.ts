import type {
  AddMemberRequest,
  ApiTokenResponse,
  CreateTokenRequest,
  WorkspaceMember as Member,
  WorkspaceMemberRole,
  UpdateMemberRequest,
} from '@eva/shared';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export type { Member };

export class AddMemberDto implements AddMemberRequest {
  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role: WorkspaceMemberRole;
}

export class UpdateMemberDto implements UpdateMemberRequest {
  @IsString()
  @IsIn(['owner', 'admin', 'member'])
  role: WorkspaceMemberRole;
}

export class CreateTokenDto implements CreateTokenRequest {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresIn?: number; // 过期时间（天），null 表示永不过期
}

export interface ApiToken extends ApiTokenResponse {
  token: string;
}
