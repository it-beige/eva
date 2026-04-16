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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EvalSetService } from './eval-set.service';
import { CreateEvalSetDto } from './dto/create-eval-set.dto';
import { UpdateEvalSetDto } from './dto/update-eval-set.dto';
import { QueryEvalSetDto } from './dto/query-eval-set.dto';
import { UpdateEvalSetTagsDto } from './dto/update-eval-set-tags.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { EvalSet } from '../../database/entities';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('eval-sets')
@UseGuards(JwtAuthGuard)
@ApiTags('EvalSets')
@ApiBearerAuth('access-token')
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
  async create(
    @Body() dto: CreateEvalSetDto,
    @CurrentUser('name') userName?: string,
    @CurrentUser('employeeId') employeeId?: string,
  ): Promise<EvalSet> {
    return this.evalSetService.create(dto, userName ?? employeeId ?? undefined);
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
    @Body() dto: UpdateEvalSetTagsDto,
  ): Promise<EvalSet> {
    const tags = dto.tags ?? (dto.tagName ? [dto.tagName] : []);
    let latest = await this.evalSetService.findOne(id);

    for (const tag of tags) {
      latest = await this.evalSetService.addTag(latest.id, tag);
    }

    return latest;
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
