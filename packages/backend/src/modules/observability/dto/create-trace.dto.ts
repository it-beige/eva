import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateTraceDto {
  @IsString()
  traceId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  appId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  input?: string;

  @IsOptional()
  @IsString()
  output?: string;

  @IsOptional()
  @IsNumber()
  inputTokens?: number;

  @IsOptional()
  @IsNumber()
  outputTokens?: number;

  @IsOptional()
  @IsNumber()
  ttft?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sourceProject?: string;

  @IsOptional()
  @IsDateString()
  calledAt?: string;
}
