import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
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
    private readonly dataSource: DataSource,
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
    return this.dataSource.transaction(async (manager) => {
      const promptRepository = manager.getRepository(Prompt);
      const promptVersionRepository = manager.getRepository(PromptVersion);
      const prompt = promptRepository.create({
        ...createPromptDto,
        version: 1,
      });

      const savedPrompt = await promptRepository.save(prompt);
      const promptVersion = promptVersionRepository.create({
        promptId: savedPrompt.id,
        version: 1,
        content: savedPrompt.content,
      });

      await promptVersionRepository.save(promptVersion);

      return savedPrompt;
    });
  }

  async update(id: string, updatePromptDto: UpdatePromptDto): Promise<Prompt> {
    return this.dataSource.transaction(async (manager) => {
      const promptRepository = manager.getRepository(Prompt);
      const promptVersionRepository = manager.getRepository(PromptVersion);
      const prompt = await promptRepository.findOne({
        where: { id },
      });

      if (!prompt) {
        throw new NotFoundException(`Prompt with id "${id}" not found`);
      }

      const newVersion = prompt.version + 1;

      prompt.content = updatePromptDto.content;
      prompt.version = newVersion;
      if (updatePromptDto.metadata !== undefined) {
        prompt.metadata = updatePromptDto.metadata;
      }
      if (updatePromptDto.description !== undefined) {
        prompt.description = updatePromptDto.description;
      }

      const updatedPrompt = await promptRepository.save(prompt);
      const promptVersion = promptVersionRepository.create({
        promptId: updatedPrompt.id,
        version: newVersion,
        content: updatePromptDto.content,
      });

      await promptVersionRepository.save(promptVersion);

      return updatedPrompt;
    });
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
