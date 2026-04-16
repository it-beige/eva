import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @MaxLength(50)
  version: string;

  @IsOptional()
  config?: Record<string, unknown>;
}
