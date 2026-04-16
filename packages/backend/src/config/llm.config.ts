import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  provider: process.env.LLM_PROVIDER ?? 'mock',
  apiKey: process.env.LLM_API_KEY ?? '',
  baseUrl: process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1',
  model: process.env.LLM_MODEL ?? 'gpt-4o-mini',
  temperature: Number.parseFloat(process.env.LLM_TEMPERATURE ?? '0.2'),
  maxTokens: Number.parseInt(process.env.LLM_MAX_TOKENS ?? '512', 10),
}));
