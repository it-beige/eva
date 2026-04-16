import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
import { AIApplication } from '../../database/entities/ai-application.entity';
import { AppVersion } from '../../database/entities/app-version.entity';
import { Project } from '../../database/entities/project.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { ImportPublicAgentDto } from './dto/import-public-agent.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AIApplicationService {
  constructor(
    @InjectRepository(AIApplication)
    private readonly appRepository: Repository<AIApplication>,
    @InjectRepository(AppVersion)
    private readonly versionRepository: Repository<AppVersion>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveProjectId(projectId?: string): Promise<string> {
    if (projectId) {
      return projectId;
    }

    const project = await this.projectRepository.findOne({
      order: { createdAt: 'ASC' },
    });

    if (!project) {
      throw new BadRequestException('未找到可用项目，请先创建项目');
    }

    return project.id;
  }

  async findAll(
    query: QueryApplicationDto,
  ): Promise<PaginatedResponseDto<AIApplication>> {
    const { page, pageSize, keyword, projectId } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    const [items, total] = await this.appRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['versions'],
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<AIApplication> {
    const app = await this.appRepository.findOne({
      where: { id },
      relations: ['versions'],
    });

    if (!app) {
      throw new NotFoundException(`AI应用不存在: ${id}`);
    }

    return app;
  }

  async create(dto: CreateApplicationDto): Promise<AIApplication> {
    const projectId = await this.resolveProjectId(dto.projectId);

    const app = this.appRepository.create({
      name: dto.name,
      description: dto.description || null,
      icon: dto.icon || null,
      gitRepoUrl: dto.gitRepoUrl || null,
      projectId,
      latestVersion: null,
    });

    return this.appRepository.save(app);
  }

  async update(id: string, dto: UpdateApplicationDto): Promise<AIApplication> {
    const app = await this.findOne(id);

    if (dto.name !== undefined) {
      app.name = dto.name;
    }
    if (dto.description !== undefined) {
      app.description = dto.description;
    }
    if (dto.icon !== undefined) {
      app.icon = dto.icon;
    }
    if (dto.gitRepoUrl !== undefined) {
      app.gitRepoUrl = dto.gitRepoUrl;
    }
    if (dto.projectId !== undefined) {
      app.projectId = dto.projectId;
    }

    return this.appRepository.save(app);
  }

  async remove(id: string): Promise<void> {
    const app = await this.findOne(id);
    await this.appRepository.remove(app);
  }

  async findVersions(appId: string): Promise<AppVersion[]> {
    const app = await this.findOne(appId);
    return this.versionRepository.find({
      where: { appId },
      order: { createdAt: 'DESC' },
    });
  }

  async createVersion(
    appId: string,
    dto: CreateVersionDto,
  ): Promise<AppVersion> {
    return this.dataSource.transaction(async (manager) => {
      const appRepository = manager.getRepository(AIApplication);
      const versionRepository = manager.getRepository(AppVersion);
      const app = await appRepository.findOne({
        where: { id: appId },
      });

      if (!app) {
        throw new NotFoundException(`AI应用不存在: ${appId}`);
      }

      const version = versionRepository.create({
        appId,
        version: dto.version,
        config: dto.config || null,
      });

      const savedVersion = await versionRepository.save(version);

      app.latestVersion = dto.version;
      await appRepository.save(app);

      return savedVersion;
    });
  }

  async importPublicAgent(dto: ImportPublicAgentDto): Promise<AIApplication> {
    const projectId = await this.resolveProjectId(dto.projectId);

    // Check if an application with the same name already exists in the project
    const existingApp = await this.appRepository.findOne({
      where: {
        name: dto.name,
        projectId,
      },
    });

    if (existingApp) {
      throw new BadRequestException(
        `项目下已存在同名应用: ${dto.name}`,
      );
    }

    const app = this.appRepository.create({
      name: dto.name,
      description: '引用的公共Code Agent',
      icon: null,
      gitRepoUrl: dto.gitRepoUrl,
      projectId,
      latestVersion: null,
    });

    return this.appRepository.save(app);
  }
}
