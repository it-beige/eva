import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EvalTaskService } from './eval-task.service';
import {
  CreateEvalTaskDto,
  QueryEvalTaskDto,
  BatchOperationDto,
} from './dto';
import { EvalTask } from '../../database/entities/eval-task.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Controller('api/eval-tasks')
@UseGuards(AuthGuard('jwt'))
export class EvalTaskController {
  constructor(private readonly evalTaskService: EvalTaskService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: QueryEvalTaskDto,
  ): Promise<PaginatedResponseDto<EvalTask>> {
    return this.evalTaskService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EvalTask> {
    return this.evalTaskService.findOne(id);
  }

  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateEvalTaskDto,
  ): Promise<EvalTask> {
    // TODO: 从JWT中获取当前用户
    return this.evalTaskService.create(dto, 'system');
  }

  @Post(':id/copy')
  async copy(@Param('id') id: string): Promise<EvalTask> {
    return this.evalTaskService.copy(id, 'system');
  }

  @Post(':id/abort')
  async abort(@Param('id') id: string): Promise<EvalTask> {
    return this.evalTaskService.abort(id);
  }

  @Get(':id/logs')
  async getLogs(@Param('id') id: string): Promise<string[]> {
    return this.evalTaskService.getLogs(id);
  }

  @Post('batch')
  async batchOperation(
    @Body(new ValidationPipe()) dto: BatchOperationDto,
  ): Promise<{ success: number; failed: number }> {
    return this.evalTaskService.batchOperation(dto);
  }
}
