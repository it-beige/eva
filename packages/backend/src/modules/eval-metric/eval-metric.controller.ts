import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EvalMetricService } from './eval-metric.service';
import { CreateEvalMetricDto } from './dto/create-eval-metric.dto';
import { UpdateEvalMetricDto } from './dto/update-eval-metric.dto';
import { QueryEvalMetricDto } from './dto/query-eval-metric.dto';
import { ParseRepoDto } from './dto/parse-repo.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { EvalMetric } from '../../database/entities/eval-metric.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('eval-metrics')
@UseGuards(JwtAuthGuard)
export class EvalMetricController {
  constructor(private readonly evalMetricService: EvalMetricService) {}

  @Get()
  async findAll(
    @Query() query: QueryEvalMetricDto,
    @CurrentUser('userId') userId?: string,
  ): Promise<PaginatedResponseDto<EvalMetric>> {
    return this.evalMetricService.findAll(query, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EvalMetric> {
    return this.evalMetricService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateEvalMetricDto,
    @CurrentUser('userId') userId?: string,
    @CurrentUser('name') userName?: string,
  ): Promise<EvalMetric> {
    return this.evalMetricService.create(createDto, userId, userName);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEvalMetricDto,
    @CurrentUser('userId') userId?: string,
    @CurrentUser('name') userName?: string,
  ): Promise<EvalMetric> {
    return this.evalMetricService.update(id, updateDto, userId, userName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.evalMetricService.remove(id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMany(
    @Body('ids') ids: string[],
  ): Promise<void> {
    return this.evalMetricService.removeMany(ids);
  }

  @Post('parse-repo')
  async parseRepo(
    @Body() parseRepoDto: ParseRepoDto,
  ): Promise<{ metrics: string[]; message: string }> {
    return this.evalMetricService.parseRepo(parseRepoDto);
  }
}
