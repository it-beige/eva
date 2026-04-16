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
import { EvalSetItemService } from './eval-set-item.service';
import { CreateEvalSetItemDto, BatchImportEvalSetItemsDto } from './dto/create-eval-set-item.dto';
import { UpdateEvalSetItemDto } from './dto/update-eval-set-item.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { EvalSetItem } from '../../database/entities';

@Controller('eval-sets/:evalSetId/items')
export class EvalSetItemController {
  constructor(private readonly evalSetItemService: EvalSetItemService) {}

  @Get()
  async findAll(
    @Param('evalSetId') evalSetId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EvalSetItem>> {
    return this.evalSetItemService.findAll(evalSetId, query);
  }

  @Post()
  async create(
    @Param('evalSetId') evalSetId: string,
    @Body() dto: CreateEvalSetItemDto,
  ): Promise<EvalSetItem> {
    return this.evalSetItemService.create(evalSetId, dto);
  }

  @Put(':itemId')
  async update(
    @Param('evalSetId') _evalSetId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateEvalSetItemDto,
  ): Promise<EvalSetItem> {
    return this.evalSetItemService.update(itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('evalSetId') _evalSetId: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    return this.evalSetItemService.remove(itemId);
  }

  @Post('batch-import')
  async batchImport(
    @Param('evalSetId') evalSetId: string,
    @Body() dto: BatchImportEvalSetItemsDto,
  ): Promise<{ imported: number }> {
    return this.evalSetItemService.batchImport(evalSetId, dto.fileUrl);
  }

  @Get('export')
  async export(
    @Param('evalSetId') evalSetId: string,
  ): Promise<{ fileUrl: string }> {
    return this.evalSetItemService.export(evalSetId);
  }
}
