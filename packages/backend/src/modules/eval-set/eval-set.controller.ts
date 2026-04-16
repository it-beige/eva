import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EvalSetService } from './eval-set.service';
import { CreateEvalSetDto } from './dto/create-eval-set.dto';
import { UpdateEvalSetDto } from './dto/update-eval-set.dto';
import { QueryEvalSetDto } from './dto/query-eval-set.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { EvalSet } from '../../database/entities';

@Controller('api/eval-sets')
export class EvalSetController {
  constructor(private readonly evalSetService: EvalSetService) {}

  @Get()
  async findAll(
    @Query() query: QueryEvalSetDto,
  ): Promise<PaginatedResponseDto<EvalSet>> {
    return this.evalSetService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EvalSet> {
    return this.evalSetService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateEvalSetDto): Promise<EvalSet> {
    // TODO: 从请求中获取当前用户
    return this.evalSetService.create(dto, 'system');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEvalSetDto,
  ): Promise<EvalSet> {
    return this.evalSetService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.evalSetService.remove(id);
  }

  @Post(':id/tags')
  async addTag(
    @Param('id') id: string,
    @Body('tagName') tagName: string,
  ): Promise<EvalSet> {
    return this.evalSetService.addTag(id, tagName);
  }

  @Delete(':id/tags/:tagName')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTag(
    @Param('id') id: string,
    @Param('tagName') tagName: string,
  ): Promise<void> {
    await this.evalSetService.removeTag(id, tagName);
  }
}
