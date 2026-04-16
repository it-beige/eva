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
import { ObservabilityService, TraceListResult } from './observability.service';
import { QueryTraceDto } from './dto/query-trace.dto';
import { CreateTraceDto } from './dto/create-trace.dto';
import { TraceLog } from '../../database/entities/trace-log.entity';

@Controller('api/traces')
@UseGuards(AuthGuard('jwt'))
export class ObservabilityController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: QueryTraceDto,
  ): Promise<TraceListResult> {
    return this.observabilityService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TraceLog | null> {
    return this.observabilityService.findOne(id);
  }

  @Get(':traceId/logs')
  async getBehaviorLogs(@Param('traceId') traceId: string): Promise<TraceLog[]> {
    return this.observabilityService.getBehaviorLogs(traceId);
  }

  @Post()
  async create(@Body() createTraceDto: CreateTraceDto): Promise<TraceLog> {
    return this.observabilityService.create(createTraceDto);
  }
}
