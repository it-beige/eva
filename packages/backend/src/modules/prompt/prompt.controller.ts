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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PromptService } from './prompt.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { QueryPromptDto } from './dto/query-prompt.dto';
import { Prompt } from '../../database/entities/prompt.entity';
import { PromptVersion } from '../../database/entities/prompt-version.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('prompts')
@UseGuards(JwtAuthGuard)
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get()
  async findAll(
    @Query() query: QueryPromptDto,
  ): Promise<PaginatedResponseDto<Prompt>> {
    return this.promptService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Prompt> {
    return this.promptService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPromptDto: CreatePromptDto): Promise<Prompt> {
    return this.promptService.create(createPromptDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePromptDto: UpdatePromptDto,
  ): Promise<Prompt> {
    return this.promptService.update(id, updatePromptDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.promptService.remove(id);
  }

  @Get(':id/versions')
  async findVersions(@Param('id') id: string): Promise<PromptVersion[]> {
    return this.promptService.findVersions(id);
  }

  @Get(':id/versions/:versionId')
  async findVersionById(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ): Promise<PromptVersion> {
    return this.promptService.findVersionById(id, versionId);
  }
}
