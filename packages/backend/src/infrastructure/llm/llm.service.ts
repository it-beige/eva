import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LlmGenerationResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  model: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly configService: ConfigService) {}

  async generate(prompt: string): Promise<LlmGenerationResult> {
    const provider = this.configService.get<string>('llm.provider', 'mock');
    const apiKey = this.configService.get<string>('llm.apiKey', '');
    const baseUrl = this.configService.get<string>('llm.baseUrl', 'https://api.openai.com/v1');
    const model = this.configService.get<string>('llm.model', 'gpt-4o-mini');
    const maxTokens = this.configService.get<number>('llm.maxTokens', 512);
    const temperature = this.configService.get<number>('llm.temperature', 0.2);

    if (!apiKey) {
      return this.generateMock(prompt, provider, model);
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'system',
              content:
                'You are the Eva evaluation engine. Return concise, structured answers grounded in the prompt.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`LLM provider failed, fallback to mock: ${response.status} ${errorText}`);
        return this.generateMock(prompt, provider, model);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) {
        return this.generateMock(prompt, provider, model);
      }

      return {
        text,
        inputTokens: payload.usage?.prompt_tokens ?? this.estimateTokens(prompt),
        outputTokens: payload.usage?.completion_tokens ?? this.estimateTokens(text),
        provider,
        model,
      };
    } catch (error) {
      this.logger.warn(`LLM request failed, fallback to mock: ${String(error)}`);
      return this.generateMock(prompt, provider, model);
    }
  }

  private generateMock(
    prompt: string,
    provider: string,
    model: string,
  ): LlmGenerationResult {
    const condensed = prompt
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 24)
      .join(' ');
    const text = `Mock(${provider}/${model}) response: ${condensed}`.trim();

    return {
      text,
      inputTokens: this.estimateTokens(prompt),
      outputTokens: this.estimateTokens(text),
      provider: `${provider}-mock`,
      model,
    };
  }

  private estimateTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.max(1, Math.ceil(chineseChars + otherChars / 4));
  }
}
