import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateProjectDto, ProjectSettings } from './dto/update-project.dto';
import {
  AddMemberDto,
  UpdateMemberDto,
  Member,
  CreateTokenDto,
  ApiToken,
} from './dto/manage-member.dto';
import { UserRole } from '@eva/shared';
import { Roles } from '../../common/auth/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiTags('Settings')
@ApiBearerAuth('access-token')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ========== 项目设置 ==========
  
  /**
   * 获取项目设置
   */
  @Get('project')
  @HttpCode(HttpStatus.OK)
  async getProjectSettings(): Promise<ProjectSettings> {
    return this.settingsService.getProjectSettings();
  }

  /**
   * 更新项目设置
   */
  @Put('project')
  @HttpCode(HttpStatus.OK)
  async updateProjectSettings(
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectSettings> {
    return this.settingsService.updateProjectSettings(dto);
  }

  // ========== 成员管理 ==========

  /**
   * 获取成员列表
   */
  @Get('members')
  @HttpCode(HttpStatus.OK)
  async getMembers(): Promise<Member[]> {
    return this.settingsService.getMembers();
  }

  /**
   * 添加成员
   */
  @Post('members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Body() dto: AddMemberDto): Promise<Member> {
    return this.settingsService.addMember(dto);
  }

  /**
   * 更新成员角色
   */
  @Put('members/:id')
  @HttpCode(HttpStatus.OK)
  async updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member> {
    return this.settingsService.updateMember(id, dto);
  }

  /**
   * 移除成员
   */
  @Delete('members/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(@Param('id') id: string): Promise<void> {
    return this.settingsService.removeMember(id);
  }

  // ========== Token 管理 ==========

  /**
   * 获取 API Token 列表
   */
  @Get('tokens')
  @HttpCode(HttpStatus.OK)
  async getTokens(): Promise<Omit<ApiToken, 'token'>[]> {
    return this.settingsService.getTokens();
  }

  /**
   * 创建 API Token
   */
  @Post('tokens')
  @HttpCode(HttpStatus.CREATED)
  async createToken(@Body() dto: CreateTokenDto): Promise<ApiToken> {
    return this.settingsService.createToken(dto);
  }

  /**
   * 删除 API Token
   */
  @Delete('tokens/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteToken(@Param('id') id: string): Promise<void> {
    return this.settingsService.deleteToken(id);
  }
}
