import { IsString, IsOptional, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  gitRepoUrl?: string;

  @IsUUID()
  projectId: string;
}
