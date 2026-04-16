import { IsString, IsOptional, IsObject, IsJSON } from 'class-validator';

export class RunPlaygroundDto {
  @IsString()
  appId: string;

  @IsString()
  appVersion: string;

  @IsString()
  @IsOptional()
  promptId?: string;

  @IsString()
  @IsOptional()
  promptContent?: string;

  @IsString()
  input: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}

export interface PlaygroundStreamEvent {
  type: 'chunk' | 'done' | 'error';
  data?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  duration?: number;
  error?: string;
}

export interface PlaygroundResult {
  output: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  duration: number;
}
