import type { ImportPublicAgentRequest } from '@eva/shared';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ImportPublicAgentDto implements ImportPublicAgentRequest {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(500)
  gitRepoUrl: string;

  @IsUUID()
  @IsOptional()
  projectId?: string;
}
