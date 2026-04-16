import { Injectable, NotFoundException } from '@nestjs/common';
import { RunPlaygroundDto, PlaygroundResult, PlaygroundStreamEvent } from './dto/run-playground.dto';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class PlaygroundService {
  /**
   * 执行 Playground 请求（非流式）
   */
  async run(dto: RunPlaygroundDto): Promise<PlaygroundResult> {
    // 模拟 AI 调用，实际项目中这里会调用真实的 AI 服务
    const startTime = Date.now();
    
    // 模拟处理延迟
    await this.delay(500);
    
    const output = this.generateMockOutput(dto.input);
    const duration = Date.now() - startTime;
    
    return {
      output,
      usage: {
        inputTokens: this.estimateTokens(dto.input),
        outputTokens: this.estimateTokens(output),
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
    const output = this.generateMockOutput(dto.input);
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
        inputTokens: this.estimateTokens(dto.input),
        outputTokens: this.estimateTokens(output),
      },
      duration,
    });
    
    subscriber.complete();
  }

  /**
   * 生成模拟输出
   */
  private generateMockOutput(input: string): string {
    const responses = [
      `根据您的输入 "${input}"，我为您分析如下：\n\n这是一个非常有趣的问题。从多个角度来看，我们可以发现其中的关键点和潜在价值。建议您可以进一步探索相关领域，以获得更多洞察。`,
      `关于 "${input}"，我的回答如下：\n\n1. 首先，这是一个值得深入探讨的话题\n2. 其次，建议结合实际场景进行验证\n3. 最后，持续优化和迭代是关键`,
      `针对 "${input}" 的分析：\n\n基于现有信息和最佳实践，我建议采取以下策略：\n- 明确目标和范围\n- 收集相关数据\n- 制定详细计划\n- 执行并监控结果`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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

  /**
   * 估算 token 数量（简化版）
   */
  private estimateTokens(text: string): number {
    // 简化估算：中文字符按 1 token，英文按 0.25 token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars + otherChars * 0.25);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
