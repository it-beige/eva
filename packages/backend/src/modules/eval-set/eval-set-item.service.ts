import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvalSetItem, EvalSet } from '../../database/entities';
import { CreateEvalSetItemDto } from './dto/create-eval-set-item.dto';
import { UpdateEvalSetItemDto } from './dto/update-eval-set-item.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EvalSetItemService {
  constructor(
    @InjectRepository(EvalSetItem)
    private readonly evalSetItemRepository: Repository<EvalSetItem>,
    @InjectRepository(EvalSet)
    private readonly evalSetRepository: Repository<EvalSet>,
  ) {}

  async findAll(
    evalSetId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<EvalSetItem>> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    // 验证评测集存在
    const evalSet = await this.evalSetRepository.findOne({
      where: { id: evalSetId },
    });

    if (!evalSet) {
      throw new NotFoundException(`评测集 ${evalSetId} 不存在`);
    }

    const [items, total] = await this.evalSetItemRepository.findAndCount({
      where: { evalSetId },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<EvalSetItem> {
    const item = await this.evalSetItemRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`数据项 ${id} 不存在`);
    }

    return item;
  }

  async create(
    evalSetId: string,
    dto: CreateEvalSetItemDto,
  ): Promise<EvalSetItem> {
    // 验证评测集存在
    const evalSet = await this.evalSetRepository.findOne({
      where: { id: evalSetId },
    });

    if (!evalSet) {
      throw new NotFoundException(`评测集 ${evalSetId} 不存在`);
    }

    const item = this.evalSetItemRepository.create({
      ...dto,
      evalSetId,
    });

    const saved = await this.evalSetItemRepository.save(item);

    // 更新评测集数据计数
    await this.updateEvalSetDataCount(evalSetId);

    return saved;
  }

  async update(id: string, dto: UpdateEvalSetItemDto): Promise<EvalSetItem> {
    await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.evalSetItemRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    const evalSetId = item.evalSetId;

    await this.evalSetItemRepository.remove(item);

    // 更新评测集数据计数
    await this.updateEvalSetDataCount(evalSetId);
  }

  async batchImport(
    evalSetId: string,
    fileUrl: string,
  ): Promise<{ imported: number }> {
    // 验证评测集存在
    const evalSet = await this.evalSetRepository.findOne({
      where: { id: evalSetId },
    });

    if (!evalSet) {
      throw new NotFoundException(`评测集 ${evalSetId} 不存在`);
    }

    // 这里应该实现CSV解析逻辑
    // 简化处理，实际应该读取文件并解析
    console.log(`Batch importing for ${evalSetId}: ${fileUrl}`);

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

    // 更新评测集数据计数
    await this.updateEvalSetDataCount(evalSetId);

    return { imported: items.length };
  }

  async export(evalSetId: string): Promise<{ fileUrl: string }> {
    // 验证评测集存在
    const evalSet = await this.evalSetRepository.findOne({
      where: { id: evalSetId },
    });

    if (!evalSet) {
      throw new NotFoundException(`评测集 ${evalSetId} 不存在`);
    }

    // 获取所有数据项
    const items = await this.evalSetItemRepository.find({
      where: { evalSetId },
    });

    // 这里应该实现CSV导出逻辑
    // 简化处理，实际应该生成CSV文件
    console.log(`Exporting ${items.length} items for ${evalSetId}`);

    // 返回模拟的文件URL
    return { fileUrl: `/exports/eval-set-${evalSetId}.csv` };
  }

  private async updateEvalSetDataCount(evalSetId: string): Promise<void> {
    const count = await this.evalSetItemRepository.count({
      where: { evalSetId },
    });
    await this.evalSetRepository.update(evalSetId, { dataCount: count });
  }
}
