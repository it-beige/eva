import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { EvalMetric } from '../../database/entities/eval-metric.entity';
import { CreateEvalMetricDto } from './dto/create-eval-metric.dto';
import { UpdateEvalMetricDto } from './dto/update-eval-metric.dto';
import { QueryEvalMetricDto } from './dto/query-eval-metric.dto';
import { ParseRepoDto } from './dto/parse-repo.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { MetricType, MetricScope } from '@eva/shared';

/**
 * 评估指标服务
 *
 * 职责：
 *  1. 指标的 CRUD 与分页查询
 *  2. 指标类型校验（LLM 必须有 prompt，Code 必须有仓库地址）
 *  3. 代码仓库解析（TODO: 对接实际解析引擎）
 */
@Injectable()
export class EvalMetricService {
  private readonly logger = new Logger(EvalMetricService.name);

  constructor(
    @InjectRepository(EvalMetric)
    private readonly evalMetricRepository: Repository<EvalMetric>,
  ) {}

  /**
   * 分页查询指标列表
   */
  async findAll(
    query: QueryEvalMetricDto,
    _userId?: string,
  ): Promise<PaginatedResponseDto<EvalMetric>> {
    const { page, pageSize, scope, type, keyword } = query;

    const where: FindOptionsWhere<EvalMetric> = {};

    if (scope) where.scope = scope;
    if (type) where.type = type;
    if (keyword) where.name = Like(`%${keyword}%`);

    const [items, total] = await this.evalMetricRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  /**
   * 查询指标详情
   */
  async findOne(id: string): Promise<EvalMetric> {
    const metric = await this.evalMetricRepository.findOne({
      where: { id },
    });

    if (!metric) {
      throw new NotFoundException(`评估指标 ${id} 不存在`);
    }

    return metric;
  }

  /**
   * 创建指标
   *
   * 根据指标类型做必填字段校验。
   */
  async create(
    createDto: CreateEvalMetricDto,
    userId?: string,
    userName?: string,
  ): Promise<EvalMetric> {
    this.validateMetricType(createDto.type, createDto.prompt, createDto.codeRepoUrl);

    const operator = userName || userId;
    const metric = this.evalMetricRepository.create({
      ...createDto,
      createdBy: operator,
      updatedBy: operator,
    });

    return this.evalMetricRepository.save(metric);
  }

  /**
   * 更新指标
   */
  async update(
    id: string,
    updateDto: UpdateEvalMetricDto,
    userId?: string,
    userName?: string,
  ): Promise<EvalMetric> {
    const metric = await this.findOne(id);

    // 类型变更时重新校验
    const effectiveType = updateDto.type ?? metric.type;
    const effectivePrompt = updateDto.prompt !== undefined ? updateDto.prompt : metric.prompt;
    const effectiveCodeRepoUrl = updateDto.codeRepoUrl !== undefined ? updateDto.codeRepoUrl : metric.codeRepoUrl;
    this.validateMetricType(effectiveType, effectivePrompt, effectiveCodeRepoUrl);

    const updated = this.evalMetricRepository.merge(metric, {
      ...updateDto,
      updatedBy: userName || userId,
    });

    return this.evalMetricRepository.save(updated);
  }

  /**
   * 删除指标
   */
  async remove(id: string): Promise<void> {
    const metric = await this.findOne(id);
    await this.evalMetricRepository.remove(metric);
  }

  /**
   * 批量删除指标
   *
   * @param ids 指标 ID 数组，空数组时直接返回
   */
  async removeMany(ids: string[]): Promise<void> {
    if (!ids?.length) return;
    await this.evalMetricRepository.delete(ids);
  }

  /**
   * 解析代码仓库中的指标
   *
   * TODO: 对接实际的仓库解析引擎，当前为模拟数据
   */
  async parseRepo(
    parseRepoDto: ParseRepoDto,
  ): Promise<{ metrics: string[]; message: string }> {
    const { codeRepoUrl, codeBranch } = parseRepoDto;

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

  // ==================== 私有方法 ====================

  /**
   * 校验指标类型的必填字段
   *
   * - LLM 类型：必须提供 prompt
   * - Code 类型：必须提供代码仓库地址
   */
  private validateMetricType(
    type: MetricType,
    prompt?: string | null,
    codeRepoUrl?: string | null,
  ): void {
    if (type === MetricType.LLM && !prompt) {
      throw new BadRequestException('LLM 类型指标必须提供 Prompt');
    }

    if (type === MetricType.CODE && !codeRepoUrl) {
      throw new BadRequestException('Code 类型指标必须提供代码仓库地址');
    }
  }
}
