import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Prompt } from '../../database/entities/prompt.entity';
import { PromptVersion } from '../../database/entities/prompt-version.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { QueryPromptDto } from './dto/query-prompt.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PromptService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    @InjectRepository(PromptVersion)
    private readonly promptVersionRepository: Repository<PromptVersion>,
  ) {}

  async findAll(query: QueryPromptDto): Promise<PaginatedResponseDto<Prompt>> {
    const { page, pageSize, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    const [items, total] = await this.promptRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id },
      relations: ['versions'],
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id "${id}" not found`);
    }

    return prompt;
  }

  async create(createPromptDto: CreatePromptDto): Promise<Prompt> {
    const prompt = this.promptRepository.create({
      ...createPromptDto,
      version: 1,
    });

    const savedPrompt = await this.promptRepository.save(prompt);

    // 创建第一个版本
    const promptVersion = this.promptVersionRepository.create({
      promptId: savedPrompt.id,
      version: 1,
      content: savedPrompt.content,
    });

    await this.promptVersionRepository.save(promptVersion);

    return savedPrompt;
  }

  async update(id: string, updatePromptDto: UpdatePromptDto): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id "${id}" not found`);
    }

    // 递增版本号
    const newVersion = prompt.version + 1;

    // 更新 Prompt
    prompt.content = updatePromptDto.content;
    prompt.version = newVersion;
    if (updatePromptDto.metadata !== undefined) {
      prompt.metadata = updatePromptDto.metadata;
    }
    if (updatePromptDto.description !== undefined) {
      prompt.description = updatePromptDto.description;
    }

    const updatedPrompt = await this.promptRepository.save(prompt);

    // 创建新版本记录
    const promptVersion = this.promptVersionRepository.create({
      promptId: updatedPrompt.id,
      version: newVersion,
      content: updatePromptDto.content,
    });

    await this.promptVersionRepository.save(promptVersion);

    return updatedPrompt;
  }

  async remove(id: string): Promise<void> {
    const prompt = await this.promptRepository.findOne({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id "${id}" not found`);
    }

    await this.promptRepository.remove(prompt);
  }

  async findVersions(promptId: string): Promise<PromptVersion[]> {
    const prompt = await this.promptRepository.findOne({
      where: { id: promptId },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id "${promptId}" not found`);
    }

    return this.promptVersionRepository.find({
      where: { promptId },
      order: { version: 'DESC' },
    });
  }

  async findVersionById(
    promptId: string,
    versionId: string,
  ): Promise<PromptVersion> {
    const prompt = await this.promptRepository.findOne({
      where: { id: promptId },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id "${promptId}" not found`);
    }

    const version = await this.promptVersionRepository.findOne({
      where: { id: versionId, promptId },
    });

    if (!version) {
      throw new NotFoundException(
        `Version with id "${versionId}" not found for prompt "${promptId}"`,
      );
    }

    return version;
  }
}
