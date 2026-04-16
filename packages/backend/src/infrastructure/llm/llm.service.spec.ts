import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';

describe('LlmService', () => {
  it('returns mock response when api key is absent', async () => {
    const service = new LlmService(
      new ConfigService({
        LLM_PROVIDER: 'mock',
        LLM_MODEL: 'demo-model',
      }),
    );

    const result = await service.generate('hello world');

    expect(result.text).toContain('Mock(');
    expect(result.inputTokens).toBeGreaterThan(0);
    expect(result.outputTokens).toBeGreaterThan(0);
  });
});
