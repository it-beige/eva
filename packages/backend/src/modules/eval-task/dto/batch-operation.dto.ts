import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';

export enum BatchOperationType {
  ABORT = 'abort',
  DELETE = 'delete',
}

export class BatchOperationDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  ids: string[];

  @IsEnum(BatchOperationType)
  @IsNotEmpty()
  operation: BatchOperationType;
}
