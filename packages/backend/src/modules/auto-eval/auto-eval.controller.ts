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
import { AutoEvalService } from './auto-eval.service';
import { CreateAutoEvalDto } from './dto/create-auto-eval.dto';
import { UpdateAutoEvalDto } from './dto/update-auto-eval.dto';
import { QueryAutoEvalDto } from './dto/query-auto-eval.dto';
import { DebugFilterDto, DebugEvalDto } from './dto/debug-auto-eval.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { AutoEval } from '../../database/entities/auto-eval.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auto-evals')
@UseGuards(JwtAuthGuard)
export class AutoEvalController {
  constructor(private readonly autoEvalService: AutoEvalService) {}

  @Get()
  async findAll(
    @Query() query: QueryAutoEvalDto,
  ): Promise<PaginatedResponseDto<AutoEval>> {
    return this.autoEvalService.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AutoEval> {
    return this.autoEvalService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateAutoEvalDto,
    @CurrentUser('userId') userId?: string,
    @CurrentUser('name') userName?: string,
  ): Promise<AutoEval> {
    return this.autoEvalService.create(createDto, userId, userName);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAutoEvalDto,
    @CurrentUser('userId') userId?: string,
    @CurrentUser('name') userName?: string,
  ): Promise<AutoEval> {
    return this.autoEvalService.update(id, updateDto, userId, userName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.autoEvalService.remove(id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMany(
    @Body('ids') ids: string[],
  ): Promise<void> {
    return this.autoEvalService.removeMany(ids);
  }

  @Post('debug-filter')
  async debugFilter(
    @Body() debugDto: DebugFilterDto,
  ) {
    return this.autoEvalService.debugFilter(debugDto);
  }

  @Post('debug-eval')
  async debugEval(
    @Body() debugDto: DebugEvalDto,
  ) {
    return this.autoEvalService.debugEval(debugDto);
  }
}
