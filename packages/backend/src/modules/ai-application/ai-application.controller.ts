import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AIApplicationService } from './ai-application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { ImportPublicAgentDto } from './dto/import-public-agent.dto';
import { AIApplication } from '../../database/entities/ai-application.entity';
import { AppVersion } from '../../database/entities/app-version.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ai-applications')
@UseGuards(JwtAuthGuard)
@ApiTags('Applications')
@ApiBearerAuth('access-token')
export class AIApplicationController {
  constructor(private readonly appService: AIApplicationService) {}

  @Get()
  async findAll(
    @Query() query: QueryApplicationDto,
  ): Promise<PaginatedResponseDto<AIApplication>> {
    return this.appService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AIApplication> {
    return this.appService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateApplicationDto): Promise<AIApplication> {
    return this.appService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ): Promise<AIApplication> {
    return this.appService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.appService.remove(id);
    return { message: '删除成功' };
  }

  @Get(':id/versions')
  async findVersions(@Param('id') id: string): Promise<AppVersion[]> {
    return this.appService.findVersions(id);
  }

  @Post(':id/versions')
  async createVersion(
    @Param('id') id: string,
    @Body() dto: CreateVersionDto,
  ): Promise<AppVersion> {
    return this.appService.createVersion(id, dto);
  }

  @Post('import-public')
  async importPublicAgent(@Body() dto: ImportPublicAgentDto): Promise<AIApplication> {
    return this.appService.importPublicAgent(dto);
  }
}
