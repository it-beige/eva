import type {
  ProjectSettingsResponse as ProjectSettings,
  UpdateProjectRequest,
} from '@eva/shared';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export type { ProjectSettings };

export class UpdateProjectDto implements UpdateProjectRequest {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
