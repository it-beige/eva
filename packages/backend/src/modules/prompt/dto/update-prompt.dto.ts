import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdatePromptDto {
  @IsString()
  content: string = '';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;
}
