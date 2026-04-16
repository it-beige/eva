import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EvalSet, EvalSetItem } from '../../database/entities';
import { EvalSetSourceType } from '@eva/shared';
import { CreateEvalSetDto } from './dto/create-eval-set.dto';
import { UpdateEvalSetDto } from './dto/update-eval-set.dto';
import { QueryEvalSetDto } from './dto/query-eval-set.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EvalSetService {
  constructor(
    @InjectRepository(EvalSet)
    private readonly evalSetRepository: Repository<EvalSet>,
    @InjectRepository(EvalSetItem)
    private readonly evalSetItemRepository: Repository<EvalSetItem>,
  ) {}

  async findAll(query: QueryEvalSetDto): Promise<PaginatedResponseDto<EvalSet>> {
    const { page, pageSize, type, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    const [items, total] = await this.evalSetRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<EvalSet> {
    const evalSet = await this.evalSetRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!evalSet) {
      throw new NotFoundException(`评测集 ${id} 不存在`);
    }

    return evalSet;
  }

  async create(dto: CreateEvalSetDto, createdBy?: string): Promise<EvalSet> {
    // 验证名称唯一性
    const existing = await this.evalSetRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('评测集名称已存在');
    }

    const evalSet = this.evalSetRepository.create({
      ...dto,
      dataCount: 0,
      createdBy,
      tags: [],
    });

    const saved = await this.evalSetRepository.save(evalSet);

    // 根据创建方式处理数据
    await this.processDataBySourceType(saved, dto);

    return this.findOne(saved.id);
  }

  private async processDataBySourceType(
    evalSet: EvalSet,
    dto: CreateEvalSetDto,
  ): Promise<void> {
    switch (dto.sourceType) {
      case EvalSetSourceType.LOCAL_UPLOAD:
        // 处理本地上传的数据
        if (dto.fileUrl) {
          await this.processLocalUpload(evalSet.id, dto.fileUrl);
        }
        break;

      case EvalSetSourceType.BLANK:
        // 空白评测集，不处理数据
        break;

      case EvalSetSourceType.AI_GENERATE:
        // AI生成数据
        if (dto.exampleFileUrl && dto.aiModelId) {
          await this.processAIGenerate(evalSet.id, dto);
        }
        break;

      case EvalSetSourceType.ODPS:
        // ODPS数据导入
        if (dto.odpsTableName) {
          await this.processODPSImport(evalSet.id, dto);
        }
        break;

      case EvalSetSourceType.PUBLIC:
        // 引用公共评测集
        if (dto.publicEvalSetId) {
          await this.processPublicReference(evalSet.id, dto.publicEvalSetId);
        }
        break;

      default:
        break;
    }
  }

  private async processLocalUpload(
    evalSetId: string,
    fileUrl: string,
  ): Promise<void> {
    // 这里应该实现CSV解析逻辑
    // 简化处理，实际应该读取文件并解析
    console.log(`Processing local upload for ${evalSetId}: ${fileUrl}`);
  }

  private async processAIGenerate(
    evalSetId: string,
    dto: CreateEvalSetDto,
  ): Promise<void> {
    console.log(
      `Processing AI generate for ${evalSetId}: ${dto.aiModelId}, count: ${dto.aiGenerateCount}`,
    );
  }

  private async processODPSImport(
    evalSetId: string,
    dto: CreateEvalSetDto,
  ): Promise<void> {
    console.log(
      `Processing ODPS import for ${evalSetId}: ${dto.odpsTableName}`,
    );
  }

  private async processPublicReference(
    evalSetId: string,
    publicEvalSetId: string,
  ): Promise<void> {
    // 复制公共评测集的数据
    const publicItems = await this.evalSetItemRepository.find({
      where: { evalSetId: publicEvalSetId },
    });

    if (publicItems.length > 0) {
      const newItems = publicItems.map((item) =>
        this.evalSetItemRepository.create({
          evalSetId,
          input: item.input,
          output: item.output,
          metadata: item.metadata,
        }),
      );

      await this.evalSetItemRepository.save(newItems);

      // 更新数据计数
      await this.evalSetRepository.update(evalSetId, {
        dataCount: newItems.length,
      });
    }
  }

  async update(id: string, dto: UpdateEvalSetDto): Promise<EvalSet> {
    const evalSet = await this.findOne(id);

    // 如果更新名称，检查唯一性
    if (dto.name && dto.name !== evalSet.name) {
      const existing = await this.evalSetRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new BadRequestException('评测集名称已存在');
      }
    }

    await this.evalSetRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const evalSet = await this.findOne(id);
    await this.evalSetRepository.remove(evalSet);
  }

  async addTag(id: string, tagName: string): Promise<EvalSet> {
    const evalSet = await this.findOne(id);
    const normalizedTag = tagName.trim();

    if (!normalizedTag) {
      throw new BadRequestException('标签不能为空');
    }

    if (!evalSet.tags.includes(normalizedTag)) {
      await this.evalSetRepository.update(id, {
        tags: [...evalSet.tags, normalizedTag],
      });
    }

    return this.findOne(id);
  }

  async removeTag(id: string, tagName: string): Promise<EvalSet> {
    const evalSet = await this.findOne(id);

    await this.evalSetRepository.update(id, {
      tags: evalSet.tags.filter((tag) => tag !== tagName),
    });

    return this.findOne(id);
  }

  async updateDataCount(id: string): Promise<void> {
    const count = await this.evalSetItemRepository.count({
      where: { evalSetId: id },
    });
    await this.evalSetRepository.update(id, { dataCount: count });
  }
}
