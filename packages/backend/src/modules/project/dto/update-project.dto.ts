import { IsString, IsOptional, IsArray, MaxLength, MinLength, ArrayMinSize } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  projectName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  adminIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}
