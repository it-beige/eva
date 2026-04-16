import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EvalMetric } from '../../database/entities/eval-metric.entity';
import { CreateEvalMetricDto } from './dto/create-eval-metric.dto';
import { UpdateEvalMetricDto } from './dto/update-eval-metric.dto';
import { QueryEvalMetricDto } from './dto/query-eval-metric.dto';
import { ParseRepoDto } from './dto/parse-repo.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { MetricType, MetricScope } from '@eva/shared';

@Injectable()
export class EvalMetricService {
  constructor(
    @InjectRepository(EvalMetric)
    private readonly evalMetricRepository: Repository<EvalMetric>,
  ) {}

  async findAll(
    query: QueryEvalMetricDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<EvalMetric>> {
    const { page, pageSize, scope, type, keyword } = query;

    const where: any = {};

    // 根据 scope 筛选
    if (scope) {
      where.scope = scope;
    }

    // 根据 type 筛选
    if (type) {
      where.type = type;
    }

    // 根据关键字搜索名称
    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    const [items, total] = await this.evalMetricRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<EvalMetric> {
    const metric = await this.evalMetricRepository.findOne({
      where: { id },
    });

    if (!metric) {
      throw new NotFoundException(`评估指标 ${id} 不存在`);
    }

    return metric;
  }

  async create(
    createDto: CreateEvalMetricDto,
    userId?: string,
    userName?: string,
  ): Promise<EvalMetric> {
    // 验证 LLM 类型必须有 prompt
    if (createDto.type === MetricType.LLM && !createDto.prompt) {
      throw new BadRequestException('LLM 类型指标必须提供 Prompt');
    }

    // 验证 Code 类型必须有 codeRepoUrl
    if (createDto.type === MetricType.CODE && !createDto.codeRepoUrl) {
      throw new BadRequestException('Code 类型指标必须提供代码仓库地址');
    }

    const metric = this.evalMetricRepository.create({
      ...createDto,
      createdBy: userName || userId,
      updatedBy: userName || userId,
    });

    return this.evalMetricRepository.save(metric);
  }

  async update(
    id: string,
    updateDto: UpdateEvalMetricDto,
    userId?: string,
    userName?: string,
  ): Promise<EvalMetric> {
    const metric = await this.findOne(id);

    // 验证 LLM 类型必须有 prompt
    if (updateDto.type === MetricType.LLM && updateDto.prompt === '') {
      throw new BadRequestException('LLM 类型指标必须提供 Prompt');
    }

    // 验证 Code 类型必须有 codeRepoUrl
    if (updateDto.type === MetricType.CODE && updateDto.codeRepoUrl === '') {
      throw new BadRequestException('Code 类型指标必须提供代码仓库地址');
    }

    const updated = this.evalMetricRepository.merge(metric, {
      ...updateDto,
      updatedBy: userName || userId,
    });

    return this.evalMetricRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const metric = await this.findOne(id);
    await this.evalMetricRepository.remove(metric);
  }

  async removeMany(ids: string[]): Promise<void> {
    await this.evalMetricRepository.delete(ids);
  }

  async parseRepo(
    parseRepoDto: ParseRepoDto,
  ): Promise<{ metrics: string[]; message: string }> {
    const { codeRepoUrl, codeBranch } = parseRepoDto;

    // TODO: 实现实际的仓库解析逻辑
    // 这里模拟解析结果
    const mockMetrics = [
      'accuracy_check',
      'format_validation',
      'performance_test',
    ];

    return {
      metrics: mockMetrics,
      message: `成功从 ${codeRepoUrl} (${codeBranch} 分支) 解析出 ${mockMetrics.length} 个指标`,
    };
  }
}
