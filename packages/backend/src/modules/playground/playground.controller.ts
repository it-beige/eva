import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { PlaygroundService } from './playground.service';
import { RunPlaygroundDto, PlaygroundStreamEvent, PlaygroundResult } from './dto/run-playground.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Playground 控制器
 *
 * 提供非流式和流式（SSE）两种模式的 Prompt 调试能力。
 */
@Controller('playground')
@UseGuards(JwtAuthGuard)
@ApiTags('Playground')
@ApiBearerAuth('access-token')
export class PlaygroundController {
  constructor(private readonly playgroundService: PlaygroundService) {}

  /**
   * 执行 Playground 请求（非流式）
   */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  async run(@Body() dto: RunPlaygroundDto): Promise<PlaygroundResult> {
    return this.playgroundService.run(dto);
  }

  /**
   * 执行 Playground 请求（流式 SSE）
   */
  @Post('run/stream')
  @Sse()
  runStream(@Body() dto: RunPlaygroundDto): Observable<PlaygroundStreamEvent> {
    return this.playgroundService.runStream(dto);
  }
}
