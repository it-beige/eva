import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlaygroundService } from './playground.service';
import { RunPlaygroundDto, PlaygroundStreamEvent, PlaygroundResult } from './dto/run-playground.dto';

@Controller('api/playground')
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
