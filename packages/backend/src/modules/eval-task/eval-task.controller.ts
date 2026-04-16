import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EvalTaskService } from './eval-task.service';
import {
  CreateEvalTaskDto,
  QueryEvalTaskDto,
  BatchOperationDto,
} from './dto';
import { EvalTask } from '../../database/entities/eval-task.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('eval-tasks')
@UseGuards(JwtAuthGuard)
@ApiTags('EvalTasks')
@ApiBearerAuth('access-token')
export class EvalTaskController {
  constructor(private readonly evalTaskService: EvalTaskService) {}

  @Get()
  async findAll(
    @Query() query: QueryEvalTaskDto,
  ): Promise<PaginatedResponseDto<EvalTask>> {
    return this.evalTaskService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EvalTask> {
    return this.evalTaskService.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreateEvalTaskDto,
    @CurrentUser('name') userName?: string,
    @CurrentUser('employeeId') employeeId?: string,
  ): Promise<EvalTask> {
    return this.evalTaskService.create(dto, userName ?? employeeId ?? undefined);
  }

  @Post(':id/copy')
  async copy(
    @Param('id') id: string,
    @CurrentUser('name') userName?: string,
    @CurrentUser('employeeId') employeeId?: string,
  ): Promise<EvalTask> {
    return this.evalTaskService.copy(id, userName ?? employeeId ?? undefined);
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
  async batchOperation(@Body() dto: BatchOperationDto): Promise<{ success: number; failed: number }> {
    return this.evalTaskService.batchOperation(dto);
  }
}
