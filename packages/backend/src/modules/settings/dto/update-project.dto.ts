import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export interface ProjectSettings {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
