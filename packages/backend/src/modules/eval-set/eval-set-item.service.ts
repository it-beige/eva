import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvalSetItem, EvalSet } from '../../database/entities';
import { CreateEvalSetItemDto } from './dto/create-eval-set-item.dto';
import { UpdateEvalSetItemDto } from './dto/update-eval-set-item.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * 评测集数据项服务
 *
 * 职责：数据项的 CRUD、批量导入、导出，并同步维护评测集的 dataCount 计数器。
 */
@Injectable()
export class EvalSetItemService {
  private readonly logger = new Logger(EvalSetItemService.name);

  constructor(
    @InjectRepository(EvalSetItem)
    private readonly evalSetItemRepository: Repository<EvalSetItem>,
    @InjectRepository(EvalSet)
    private readonly evalSetRepository: Repository<EvalSet>,
  ) {}

  /**
   * 分页查询数据项
   */
  async findAll(
    evalSetId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EvalSetItem>> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    await this.assertEvalSetExists(evalSetId);

    const [items, total] = await this.evalSetItemRepository.findAndCount({
      where: { evalSetId },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  /**
   * 查询单个数据项
   */
  async findOne(id: string): Promise<EvalSetItem> {
    const item = await this.evalSetItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`数据项 ${id} 不存在`);
    }

    return item;
  }

  /**
   * 创建数据项
   */
  async create(
    evalSetId: string,
    dto: CreateEvalSetItemDto,
  ): Promise<EvalSetItem> {
    await this.assertEvalSetExists(evalSetId);

    const item = this.evalSetItemRepository.create({
      ...dto,
      evalSetId,
    });

    const saved = await this.evalSetItemRepository.save(item);

    // 同步更新评测集数据计数
    await this.updateEvalSetDataCount(evalSetId);

    return saved;
  }

  /**
   * 更新数据项
   */
  async update(id: string, dto: UpdateEvalSetItemDto): Promise<EvalSetItem> {
    await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.evalSetItemRepository.update(id, dto as any);
    return this.findOne(id);
  }

  /**
   * 删除数据项
   */
  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    const evalSetId = item.evalSetId;

    await this.evalSetItemRepository.remove(item);

    // 同步更新评测集数据计数
    await this.updateEvalSetDataCount(evalSetId);
  }

  /**
   * 批量导入数据项
   *
   * TODO: 对接实际的 CSV 解析逻辑，当前为模拟数据
   */
  async batchImport(
    evalSetId: string,
    fileUrl: string,
  ): Promise<{ imported: number }> {
    await this.assertEvalSetExists(evalSetId);

    this.logger.log(`批量导入处理 [evalSetId=${evalSetId}, fileUrl=${fileUrl}]`);

    // 模拟导入数据
    const mockItems = [
      {
        evalSetId,
        input: { question: '示例问题1' },
        output: { answer: '示例答案1' },
      },
      {
        evalSetId,
        input: { question: '示例问题2' },
        output: { answer: '示例答案2' },
      },
    ];

    const items = mockItems.map((item) =>
      this.evalSetItemRepository.create(item),
    );

    await this.evalSetItemRepository.save(items);
    await this.updateEvalSetDataCount(evalSetId);

    return { imported: items.length };
  }

  /**
   * 导出数据项
   *
   * TODO: 对接实际的 CSV 导出逻辑，当前为模拟数据
   */
  async export(evalSetId: string): Promise<{ fileUrl: string }> {
    await this.assertEvalSetExists(evalSetId);

    const items = await this.evalSetItemRepository.find({
      where: { evalSetId },
    });

    this.logger.log(`导出处理 [evalSetId=${evalSetId}, count=${items.length}]`);

    return { fileUrl: `/exports/eval-set-${evalSetId}.csv` };
  }

  // ==================== 私有方法 ====================

  /** 校验评测集是否存在 */
  private async assertEvalSetExists(evalSetId: string): Promise<void> {
    const exists = await this.evalSetRepository.exists({ where: { id: evalSetId } });
    if (!exists) {
      throw new NotFoundException(`评测集 ${evalSetId} 不存在`);
    }
  }

  /** 同步更新评测集的数据计数 */
  private async updateEvalSetDataCount(evalSetId: string): Promise<void> {
    const count = await this.evalSetItemRepository.count({
      where: { evalSetId },
    });
    await this.evalSetRepository.update(evalSetId, { dataCount: count });
  }
}
