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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from './dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async findAll(@Query() query: QueryProjectDto) {
    return this.projectService.findAll(query);
  }

  @Get('generate-pid')
  async generatePid() {
    return this.projectService.generatePidValue();
  }

  @Get('platforms')
  async getPlatforms() {
    return this.projectService.getPlatforms();
  }

  @Get('apps')
  async getApps(@Query('platform') platform?: string) {
    return this.projectService.getApps(platform);
  }

  @Get('users/search')
  async searchUsers(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: number,
  ) {
    return this.projectService.searchUsers(keyword, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
