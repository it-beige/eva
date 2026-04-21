import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * LLM 生成结果
 */
export interface LlmGenerationResult {
  /** 模型输出文本 */
  text: string;
  /** 输入 Token 数 */
  inputTokens: number;
  /** 输出 Token 数 */
  outputTokens: number;
  /** 供应商标识 */
  provider: string;
  /** 模型名称 */
  model: string;
}

/** LLM 配置（构造期一次性读取，避免每次调用都查 ConfigService） */
interface LlmConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/** 请求超时时间（毫秒） */
const REQUEST_TIMEOUT_MS = 30_000;

/** 最大重试次数 */
const MAX_RETRIES = 2;

/** 重试基础延迟（毫秒），采用指数退避 */
const RETRY_BASE_DELAY_MS = 1000;

/**
 * 大语言模型调用服务
 *
 * 设计思路：
 *  1. 配置在构造期一次性注入，避免热路径上反复读取 ConfigService
 *  2. 内置超时控制（AbortController）和指数退避重试机制，提升调用成功率
 *  3. API Key 为空或调用失败时自动降级到 Mock 模式，保证开发/测试环境可用
 *  4. Token 估算采用中英文混合策略，更贴近实际计费
 */
@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);
  private config!: LlmConfig;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.config = {
      provider: this.configService.get<string>('llm.provider', 'mock'),
      apiKey: this.configService.get<string>('llm.apiKey', ''),
      baseUrl: this.configService.get<string>('llm.baseUrl', 'https://api.openai.com/v1'),
      model: this.configService.get<string>('llm.model', 'gpt-4o-mini'),
      maxTokens: this.configService.get<number>('llm.maxTokens', 512),
      temperature: this.configService.get<number>('llm.temperature', 0.2),
    };

    this.logger.log(
      `LLM 服务初始化完成 [provider=${this.config.provider}, model=${this.config.model}]`,
    );
  }

  /**
   * 调用 LLM 生成文本
   *
   * @param prompt 提示词
   * @returns 生成结果（含 Token 统计）
   */
  async generate(prompt: string): Promise<LlmGenerationResult> {
    const { provider, apiKey, model } = this.config;

    // 无 API Key 时走 Mock 模式
    if (!apiKey) {
      return this.generateMock(prompt, provider, model);
    }

    return this.executeWithRetry(prompt);
  }

  // ==================== 私有方法 ====================

  /**
   * 带重试的 LLM 调用
   *
   * 采用指数退避策略，避免瞬时故障导致服务不可用。
   */
  private async executeWithRetry(prompt: string): Promise<LlmGenerationResult> {
    const { provider, apiKey, baseUrl, model, maxTokens, temperature } = this.config;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // 超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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
              { role: 'user', content: prompt },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };

        const text = payload.choices?.[0]?.message?.content?.trim();
        if (!text) {
          throw new Error('LLM 返回空内容');
        }

        return {
          text,
          inputTokens: payload.usage?.prompt_tokens ?? this.estimateTokens(prompt),
          outputTokens: payload.usage?.completion_tokens ?? this.estimateTokens(text),
          provider,
          model,
        };
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;
        const errMsg = error instanceof Error ? error.message : String(error);

        if (isLastAttempt) {
          this.logger.warn(`LLM 调用失败（已重试 ${MAX_RETRIES} 次），降级到 Mock: ${errMsg}`);
          return this.generateMock(prompt, provider, model);
        }

        // 指数退避
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        this.logger.warn(`LLM 调用失败（第 ${attempt + 1} 次），${delay}ms 后重试: ${errMsg}`);
        await this.sleep(delay);
      }
    }

    // 理论上不会走到这里，TypeScript 类型安全兜底
    return this.generateMock(prompt, this.config.provider, this.config.model);
  }

  /**
   * Mock 生成器
   *
   * 用于开发/测试环境或 LLM 不可用时的降级方案。
   */
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

  /**
   * Token 估算
   *
   * 中文字符按 1 token / 字计算，英文按 4 字符 / token 计算。
   * 这是一个粗略估算，实际计费以 LLM 返回的 usage 为准。
   */
  private estimateTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.max(1, Math.ceil(chineseChars + otherChars / 4));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
