import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like, FindOptionsWhere } from 'typeorm';
import { AIApplication } from '../../database/entities/ai-application.entity';
import { AppVersion } from '../../database/entities/app-version.entity';
import { Project } from '../../database/entities/project.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { ImportPublicAgentDto } from './dto/import-public-agent.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * AI 应用管理服务
 *
 * 职责：
 *  1. 应用的 CRUD 操作
 *  2. 应用版本管理（事务保证一致性）
 *  3. 公共 Agent 导入
 */
@Injectable()
export class AIApplicationService {
  private readonly logger = new Logger(AIApplicationService.name);

  constructor(
    @InjectRepository(AIApplication)
    private readonly appRepository: Repository<AIApplication>,
    @InjectRepository(AppVersion)
    private readonly versionRepository: Repository<AppVersion>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 分页查询应用列表
   */
  async findAll(
    query: QueryApplicationDto,
  ): Promise<PaginatedResponseDto<AIApplication>> {
    const { page, pageSize, keyword, projectId } = query;
    const skip = (page - 1) * pageSize;

    const where: FindOptionsWhere<AIApplication> = {};

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

  /**
   * 查询应用详情
   *
   * @throws NotFoundException 应用不存在时抛出
   */
  async findOne(id: string): Promise<AIApplication> {
    const app = await this.appRepository.findOne({
      where: { id },
      relations: ['versions'],
    });

    if (!app) {
      throw new NotFoundException(`AI 应用不存在: ${id}`);
    }

    return app;
  }

  /**
   * 创建应用
   */
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

  /**
   * 更新应用
   *
   * 仅更新 DTO 中显式传入的字段（undefined 表示不更新）
   */
  async update(id: string, dto: UpdateApplicationDto): Promise<AIApplication> {
    const app = await this.findOne(id);

    if (dto.name !== undefined) app.name = dto.name;
    if (dto.description !== undefined) app.description = dto.description;
    if (dto.icon !== undefined) app.icon = dto.icon;
    if (dto.gitRepoUrl !== undefined) app.gitRepoUrl = dto.gitRepoUrl;
    if (dto.projectId !== undefined) app.projectId = dto.projectId;

    return this.appRepository.save(app);
  }

  /**
   * 删除应用
   */
  async remove(id: string): Promise<void> {
    const app = await this.findOne(id);
    await this.appRepository.remove(app);
  }

  /**
   * 查询应用的版本列表
   *
   * 直接通过 appId 查询版本表，无需先加载完整的 Application 实体（避免冗余查询）。
   * 仅做存在性校验即可。
   */
  async findVersions(appId: string): Promise<AppVersion[]> {
    const exists = await this.appRepository.exists({ where: { id: appId } });
    if (!exists) {
      throw new NotFoundException(`AI 应用不存在: ${appId}`);
    }

    return this.versionRepository.find({
      where: { appId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 创建应用版本
   *
   * 使用事务保证"新增版本 + 更新应用最新版本号"的原子性。
   */
  async createVersion(
    appId: string,
    dto: CreateVersionDto,
  ): Promise<AppVersion> {
    return this.dataSource.transaction(async (manager) => {
      const appRepository = manager.getRepository(AIApplication);
      const versionRepository = manager.getRepository(AppVersion);

      const app = await appRepository.findOne({ where: { id: appId } });
      if (!app) {
        throw new NotFoundException(`AI 应用不存在: ${appId}`);
      }

      const version = versionRepository.create({
        appId,
        version: dto.version,
        config: dto.config || null,
      });

      const savedVersion = await versionRepository.save(version);

      // 同步更新应用的最新版本号
      app.latestVersion = dto.version;
      await appRepository.save(app);

      return savedVersion;
    });
  }

  /**
   * 导入公共 Agent
   *
   * @throws BadRequestException 项目下已存在同名应用时抛出
   */
  async importPublicAgent(dto: ImportPublicAgentDto): Promise<AIApplication> {
    const projectId = await this.resolveProjectId(dto.projectId);

    // 同项目下名称唯一性校验
    const existingApp = await this.appRepository.findOne({
      where: { name: dto.name, projectId },
    });

    if (existingApp) {
      throw new BadRequestException(`项目下已存在同名应用: ${dto.name}`);
    }

    const app = this.appRepository.create({
      name: dto.name,
      description: '引用的公共 Code Agent',
      icon: null,
      gitRepoUrl: dto.gitRepoUrl,
      projectId,
      latestVersion: null,
    });

    return this.appRepository.save(app);
  }

  // ==================== 私有方法 ====================

  /**
   * 解析项目 ID
   *
   * 未指定时自动取最早创建的项目，适用于单项目场景。
   */
  private async resolveProjectId(projectId?: string): Promise<string> {
    if (projectId) {
      return projectId;
    }

    const project = await this.projectRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (!project) {
      throw new BadRequestException('未找到可用项目，请先创建项目');
    }

    return project.id;
  }
}
