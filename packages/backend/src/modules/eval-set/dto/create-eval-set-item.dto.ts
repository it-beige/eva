import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreateEvalSetItemDto {
  @IsObject()
  @IsNotEmpty({ message: '输入数据不能为空' })
  input!: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  output?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class BatchImportEvalSetItemsDto {
  @IsString()
  @IsNotEmpty({ message: '文件URL不能为空' })
  fileUrl!: string;
}
