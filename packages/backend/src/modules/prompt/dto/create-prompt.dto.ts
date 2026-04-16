import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreatePromptDto {
  @IsString()
  name: string = '';

  @IsString()
  content: string = '';

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;
}
