import { ConfigService } from '@nestjs/config';
import { EvalType } from '@eva/shared';
import { LlmService } from '../../infrastructure/llm/llm.service';
import { EvalEngineService } from './eval-engine.service';

describe('EvalEngineService', () => {
  it('executes items and produces aggregated summary', async () => {
    const llmService = new LlmService(
      new ConfigService({
        LLM_PROVIDER: 'mock',
        LLM_MODEL: 'demo-model',
      }),
    );
    const service = new EvalEngineService(llmService);

    const result = await service.execute(
      {
        id: 'task-1',
        name: 'demo-task',
        evalType: EvalType.GENERAL,
        evalMode: 'baseline',
        appVersion: 'v1',
      } as any,
      [
        {
          id: 'item-1',
          input: { question: 'hello' },
          output: { answer: 'hello' },
        } as any,
      ],
    );

    expect(result.summary.totalItems).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.summary.inputTokens).toBeGreaterThan(0);
  });
});
