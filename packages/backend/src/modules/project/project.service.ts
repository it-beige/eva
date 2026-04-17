import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { ProjectCreateMode, ProjectSource } from '@eva/shared';
import { Project } from '../../database/entities/project.entity';
import { User } from '../../database/entities/user.entity';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private generatePid(): string {
    return randomBytes(4).toString('hex');
  }

  async findAll(query: QueryProjectDto) {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      source,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.admins', 'admin')
      .leftJoinAndSelect('project.users', 'user');

    if (keyword) {
      qb.andWhere(
        '(project.id ILIKE :kw OR project.pid ILIKE :kw OR project.name ILIKE :kw)',
        { kw: `%${keyword}%` },
      );
    }

    if (source) {
      qb.andWhere('project.source = :source', { source });
    }

    const allowedSortFields: Record<string, string> = {
      projectId: 'project.id',
      projectName: 'project.name',
      userCount: 'project.user_count',
      createTime: 'project.created_at',
      createdAt: 'project.created_at',
    };

    const sortColumn = allowedSortFields[sortBy] || 'project.created_at';
    qb.orderBy(sortColumn, sortOrder === 'asc' ? 'ASC' : 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const mappedList = list.map((p) => this.toResponse(p));

    return {
      list: mappedList,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['admins', 'users'],
    });

    if (!project) {
      throw new NotFoundException('项目不存在');
    }

    return this.toResponse(project);
  }

  async create(dto: CreateProjectDto) {
    // Check name uniqueness
    const existing = await this.projectRepo.findOne({
      where: { name: dto.projectName },
    });
    if (existing) {
      throw new ConflictException('项目名称已存在');
    }

    const pid =
      dto.createMode === ProjectCreateMode.DIRECT
        ? dto.pid || this.generatePid()
        : this.generatePid();

    // Check pid uniqueness
    const existingPid = await this.projectRepo.findOne({ where: { pid } });
    if (existingPid) {
      throw new ConflictException('pid已存在');
    }

    // Resolve users
    const admins = await this.userRepo.findBy({ id: In(dto.adminIds) });
    const users = dto.userIds?.length
      ? await this.userRepo.findBy({ id: In(dto.userIds) })
      : [];

    // Determine source
    let source = ProjectSource.DIRECT;
    if (dto.createMode === ProjectCreateMode.LINKED) {
      source = ProjectSource.IDEALAB;
    } else if (dto.createMode === ProjectCreateMode.JOINT) {
      source = ProjectSource.JOINT;
    }

    // Generate encryption info
    const encryption = {
      keyName: randomUUID(),
      issueCode: randomBytes(16).toString('hex'),
      generated: true,
    };

    const project = this.projectRepo.create({
      pid,
      name: dto.projectName,
      description: dto.description || null,
      appCode: dto.linkedApp || null,
      source,
      createMode: dto.createMode,
      platform: dto.platform || null,
      linkedApp: dto.linkedApp || null,
      jointApps: dto.jointApps || null,
      userCount: admins.length + users.length,
      encryption,
      admins,
      users,
    });

    const saved = await this.projectRepo.save(project);
    return { projectId: saved.id, pid: saved.pid };
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['admins', 'users'],
    });

    if (!project) {
      throw new NotFoundException('项目不存在');
    }

    // Check name uniqueness if changed
    if (dto.projectName !== project.name) {
      const existing = await this.projectRepo.findOne({
        where: { name: dto.projectName },
      });
      if (existing) {
        throw new ConflictException('项目名称已存在');
      }
    }

    const admins = await this.userRepo.findBy({ id: In(dto.adminIds) });
    const users = dto.userIds?.length
      ? await this.userRepo.findBy({ id: In(dto.userIds) })
      : [];

    project.name = dto.projectName;
    project.description = dto.description || null;
    project.admins = admins;
    project.users = users;
    project.userCount = admins.length + users.length;

    await this.projectRepo.save(project);
    return null;
  }

  async remove(id: string) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('项目不存在');
    }
    await this.projectRepo.remove(project);
    return null;
  }

  async searchUsers(keyword: string, limit = 20) {
    if (!keyword) return [];

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where(
        'user.name ILIKE :kw OR user.employee_id ILIKE :kw',
        { kw: `%${keyword}%` },
      )
      .take(limit)
      .getMany();

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      employeeId: u.employeeId || '',
      displayName: `${u.name}(${u.employeeId || ''})`,
    }));
  }

  async getPlatforms() {
    // Mock platform data
    return [
      { platformId: '1', platformName: 'IDEALAB', platformCode: 'IDEALAB' },
      {
        platformId: '2',
        platformName: 'IDEALAB Workspace',
        platformCode: 'IDEALAB_WORKSPACE',
      },
      { platformId: '3', platformName: 'Demo Platform', platformCode: 'DEMO' },
    ];
  }

  async getApps(platform?: string) {
    // Mock app data
    const allApps = [
      {
        appId: '1',
        appName: '智能客服助手',
        appCode: 'smart-cs',
        platform: 'IDEALAB',
      },
      {
        appId: '2',
        appName: '文档摘要生成',
        appCode: 'doc-summary',
        platform: 'IDEALAB',
      },
      {
        appId: '3',
        appName: '代码审查助手',
        appCode: 'code-review',
        platform: 'IDEALAB_WORKSPACE',
      },
      {
        appId: '4',
        appName: '数据分析Agent',
        appCode: 'data-agent',
        platform: 'IDEALAB_WORKSPACE',
      },
      {
        appId: '5',
        appName: 'Demo应用',
        appCode: 'demo-app',
        platform: 'DEMO',
      },
    ];

    if (platform) {
      return allApps.filter((app) => app.platform === platform);
    }
    return allApps;
  }

  async generatePidValue() {
    let pid: string;
    let exists = true;
    do {
      pid = this.generatePid();
      const found = await this.projectRepo.findOne({ where: { pid } });
      exists = !!found;
    } while (exists);
    return { pid };
  }

  private toResponse(project: Project) {
    return {
      projectId: project.id,
      pid: project.pid,
      projectName: project.name,
      description: project.description,
      appCode: project.appCode,
      source: project.source,
      admins: (project.admins || []).map((u) => ({
        id: u.id,
        name: u.name,
        employeeId: u.employeeId || '',
      })),
      users: (project.users || []).map((u) => ({
        id: u.id,
        name: u.name,
        employeeId: u.employeeId || '',
      })),
      userCount: project.userCount,
      encryption: project.encryption,
      jointApps: project.jointApps,
      createMode: project.createMode,
      createTime: project.createdAt,
      updateTime: project.updatedAt,
    };
  }
}
