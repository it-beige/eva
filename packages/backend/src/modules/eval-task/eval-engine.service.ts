import { Injectable } from '@nestjs/common';
import { EvalTask, EvalSetItem } from '../../database/entities';
import { LlmService } from '../../infrastructure/llm/llm.service';

export interface EvalExecutionItemResult {
  itemId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  score: number;
  inputTokens: number;
  outputTokens: number;
}

export interface EvalExecutionResult {
  items: EvalExecutionItemResult[];
  summary: {
    totalItems: number;
    avgScore: number;
    inputTokens: number;
    outputTokens: number;
  };
}

@Injectable()
export class EvalEngineService {
  constructor(private readonly llmService: LlmService) {}

  async execute(
    task: EvalTask,
    items: EvalSetItem[],
  ): Promise<EvalExecutionResult> {
    const results: EvalExecutionItemResult[] = [];

    for (const item of items) {
      const prompt = this.buildPrompt(task, item);
      const generated = await this.llmService.generate(prompt);
      const expectedOutput = JSON.stringify(item.output ?? {}, null, 2);
      const score = this.calculateScore(expectedOutput, generated.text);

      results.push({
        itemId: item.id,
        input: JSON.stringify(item.input, null, 2),
        expectedOutput,
        actualOutput: generated.text,
        score,
        inputTokens: generated.inputTokens,
        outputTokens: generated.outputTokens,
      });
    }

    const summary = results.reduce(
      (accumulator, item) => {
        accumulator.totalItems += 1;
        accumulator.avgScore += item.score;
        accumulator.inputTokens += item.inputTokens;
        accumulator.outputTokens += item.outputTokens;
        return accumulator;
      },
      {
        totalItems: 0,
        avgScore: 0,
        inputTokens: 0,
        outputTokens: 0,
      },
    );

    summary.avgScore =
      summary.totalItems > 0
        ? Math.round((summary.avgScore / summary.totalItems) * 100) / 100
        : 0;

    return {
      items: results,
      summary,
    };
  }

  private buildPrompt(task: EvalTask, item: EvalSetItem): string {
    return [
      `Task: ${task.name}`,
      `Eval type: ${task.evalType}`,
      `Eval mode: ${task.evalMode ?? 'default'}`,
      `Application version: ${task.appVersion ?? 'latest'}`,
      `Input: ${JSON.stringify(item.input)}`,
      `Expected output: ${JSON.stringify(item.output ?? {})}`,
    ].join('\n');
  }

  private calculateScore(expectedOutput: string, actualOutput: string): number {
    if (!expectedOutput || expectedOutput === '{}' || expectedOutput === 'null') {
      return 0.75;
    }

    const expectedTokens = new Set(
      expectedOutput
        .toLowerCase()
        .split(/[^a-z0-9\u4e00-\u9fa5]+/i)
        .filter(Boolean),
    );
    const actualTokens = new Set(
      actualOutput
        .toLowerCase()
        .split(/[^a-z0-9\u4e00-\u9fa5]+/i)
        .filter(Boolean),
    );

    if (expectedTokens.size === 0) {
      return 0.75;
    }

    let matched = 0;
    for (const token of expectedTokens) {
      if (actualTokens.has(token)) {
        matched += 1;
      }
    }

    return Math.round((matched / expectedTokens.size) * 100) / 100;
  }
}
