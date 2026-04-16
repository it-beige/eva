import {
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BusinessErrorCode } from '@eva/shared';
import {
  UpdateProjectDto,
  ProjectSettings,
} from './dto/update-project.dto';
import {
  AddMemberDto,
  UpdateMemberDto,
  Member,
  CreateTokenDto,
  ApiToken,
} from './dto/manage-member.dto';
import { randomBytes } from 'crypto';
import { BusinessException } from '../../common/errors/business.exception';

@Injectable()
export class SettingsService {
  private projectSettings: ProjectSettings = {
    id: 'project-1',
    name: 'Eva AI 评测平台',
    description: '用于 AI 应用评测和管理的综合平台',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  private members: Member[] = [
    {
      id: 'member-1',
      email: 'admin@eva.ai',
      name: '系统管理员',
      role: 'owner',
      joinedAt: new Date().toISOString(),
    },
    {
      id: 'member-2',
      email: 'developer@eva.ai',
      name: '开发人员',
      role: 'admin',
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'member-3',
      email: 'user@eva.ai',
      name: '普通用户',
      role: 'member',
      joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  private tokens: ApiToken[] = [
    {
      id: 'token-1',
      name: '生产环境 Token',
      token: 'sk-evaprod-' + randomBytes(24).toString('hex'),
      maskedToken: 'sk-evaprod-****************************',
      expiresAt: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'token-2',
      name: '测试环境 Token',
      token: 'sk-evatest-' + randomBytes(24).toString('hex'),
      maskedToken: 'sk-evatest-****************************',
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  /**
   * 获取项目设置
   */
  async getProjectSettings(): Promise<ProjectSettings> {
    return this.projectSettings;
  }

  /**
   * 更新项目设置
   */
  async updateProjectSettings(dto: UpdateProjectDto): Promise<ProjectSettings> {
    this.projectSettings = {
      ...this.projectSettings,
      name: dto.name,
      description: dto.description || null,
      updatedAt: new Date().toISOString(),
    };
    return this.projectSettings;
  }

  /**
   * 获取成员列表
   */
  async getMembers(): Promise<Member[]> {
    return this.members.sort((a, b) => 
      new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );
  }

  /**
   * 添加成员
   */
  async addMember(dto: AddMemberDto): Promise<Member> {
    const existingMember = this.members.find((m) => m.email === dto.email);
    if (existingMember) {
      throw new BusinessException(
        BusinessErrorCode.MEMBER_ALREADY_EXISTS,
        '该邮箱成员已存在',
        HttpStatus.CONFLICT,
      );
    }

    const newMember: Member = {
      id: `member-${Date.now()}`,
      email: dto.email,
      name: dto.email.split('@')[0],
      role: dto.role,
      joinedAt: new Date().toISOString(),
    };

    this.members.push(newMember);
    return newMember;
  }

  /**
   * 更新成员角色
   */
  async updateMember(id: string, dto: UpdateMemberDto): Promise<Member> {
    const member = this.members.find((m) => m.id === id);
    if (!member) {
      throw new BusinessException(
        BusinessErrorCode.MEMBER_NOT_FOUND,
        `成员 ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    member.role = dto.role;
    return member;
  }

  /**
   * 移除成员
   */
  async removeMember(id: string): Promise<void> {
    const index = this.members.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new BusinessException(
        BusinessErrorCode.MEMBER_NOT_FOUND,
        `成员 ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 不能删除 owner
    if (this.members[index].role === 'owner') {
      throw new BusinessException(
        BusinessErrorCode.OWNER_CANNOT_BE_REMOVED,
        '不能删除 owner 角色成员',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.members.splice(index, 1);
  }

  /**
   * 获取 API Token 列表
   */
  async getTokens(): Promise<Omit<ApiToken, 'token'>[]> {
    return this.tokens.map(({ token, ...rest }) => rest);
  }

  /**
   * 创建 API Token
   */
  async createToken(dto: CreateTokenDto): Promise<ApiToken> {
    const tokenValue = 'sk-eva-' + randomBytes(24).toString('hex');
    const maskedToken = tokenValue.slice(0, 12) + '****************************';
    
    const newToken: ApiToken = {
      id: `token-${Date.now()}`,
      name: dto.name,
      token: tokenValue,
      maskedToken,
      expiresAt: dto.expiresIn 
        ? new Date(Date.now() + dto.expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : null,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };

    this.tokens.push(newToken);
    return newToken;
  }

  /**
   * 删除 API Token
   */
  async deleteToken(id: string): Promise<void> {
    const index = this.tokens.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new BusinessException(
        BusinessErrorCode.TOKEN_NOT_FOUND,
        `Token ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    this.tokens.splice(index, 1);
  }
}
