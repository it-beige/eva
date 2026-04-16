import { Injectable } from '@nestjs/common';
import { RunPlaygroundDto, PlaygroundResult, PlaygroundStreamEvent } from './dto/run-playground.dto';
import { Observable, Subscriber } from 'rxjs';
import { LlmService } from '../../infrastructure/llm/llm.service';

@Injectable()
export class PlaygroundService {
  constructor(private readonly llmService: LlmService) {}

  /**
   * 执行 Playground 请求（非流式）
   */
  async run(dto: RunPlaygroundDto): Promise<PlaygroundResult> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(dto);
    const result = await this.llmService.generate(prompt);
    const duration = Date.now() - startTime;

    return {
      output: result.text,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
      duration,
    };
  }

  /**
   * 执行 Playground 请求（流式）
   */
  runStream(dto: RunPlaygroundDto): Observable<PlaygroundStreamEvent> {
    return new Observable((subscriber: Subscriber<PlaygroundStreamEvent>) => {
      this.streamResponse(dto, subscriber).catch((error) => {
        subscriber.next({
          type: 'error',
          error: error.message || 'Stream processing failed',
        });
        subscriber.complete();
      });
    });
  }

  private async streamResponse(
    dto: RunPlaygroundDto,
    subscriber: Subscriber<PlaygroundStreamEvent>,
  ): Promise<void> {
    const startTime = Date.now();
    const prompt = this.buildPrompt(dto);
    const generated = await this.llmService.generate(prompt);
    const output = generated.text;
    const chunks = this.splitIntoChunks(output, 5);
    
    // 模拟流式输出
    for (const chunk of chunks) {
      await this.delay(100);
      subscriber.next({
        type: 'chunk',
        data: chunk,
      });
    }
    
    const duration = Date.now() - startTime;
    
    subscriber.next({
      type: 'done',
      usage: {
        inputTokens: generated.inputTokens,
        outputTokens: generated.outputTokens,
      },
      duration,
    });
    
    subscriber.complete();
  }

  private buildPrompt(dto: RunPlaygroundDto): string {
    return [
      `AppId: ${dto.appId}`,
      `Version: ${dto.appVersion}`,
      `PromptId: ${dto.promptId ?? 'custom'}`,
      `PromptContent: ${dto.promptContent ?? ''}`,
      `Input: ${dto.input}`,
      `Config: ${JSON.stringify(dto.config ?? {})}`,
    ].join('\n');
  }

  /**
   * 将文本分割成多个块（模拟流式输出）
   */
  private splitIntoChunks(text: string, chunkCount: number): string[] {
    const chunks: string[] = [];
    const chunkSize = Math.ceil(text.length / chunkCount);
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
