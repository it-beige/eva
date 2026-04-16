import { IsString, IsUUID, MaxLength } from 'class-validator';

export class ImportPublicAgentDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(500)
  gitRepoUrl: string;

  @IsUUID()
  projectId: string;
}
