type RawEnvironment = Record<string, unknown>;
const DEFAULT_DEV_CORS_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';
const DEFAULT_DEV_JWT_SECRET = 'eva-dev-secret-change-me-1234567890';

function parseNumber(
  value: unknown,
  key: string,
  fallback: number,
): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  return parsed;
}

function parseBoolean(
  value: unknown,
  key: string,
): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Environment variable ${key} must be "true" or "false"`);
}

function parseString(
  value: unknown,
  fallback: string,
): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value).trim();
}

export function validateEnvironment(config: RawEnvironment): RawEnvironment {
  const nodeEnv = parseString(config.NODE_ENV, 'development');
  const isProduction = nodeEnv === 'production';
  const corsOrigin = parseString(
    config.CORS_ORIGIN,
    isProduction ? '' : DEFAULT_DEV_CORS_ORIGIN,
  );
  const jwtSecret = parseString(
    config.JWT_SECRET,
    isProduction ? '' : DEFAULT_DEV_JWT_SECRET,
  );

  if (isProduction && (!corsOrigin || corsOrigin.includes('*'))) {
    throw new Error(
      'Environment variable CORS_ORIGIN must be an explicit allowlist in production',
    );
  }

  if (isProduction && jwtSecret.length < 32) {
    throw new Error(
      'Environment variable JWT_SECRET must be at least 32 characters in production',
    );
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: parseNumber(config.PORT, 'PORT', 3000),
    API_PREFIX: parseString(config.API_PREFIX, 'api'),
    CORS_ORIGIN: corsOrigin,
    JWT_SECRET: jwtSecret,
    DB_HOST: parseString(config.DB_HOST, 'localhost'),
    DB_PORT: parseNumber(config.DB_PORT, 'DB_PORT', 5432),
    DB_USERNAME: parseString(config.DB_USERNAME, 'postgres'),
    DB_PASSWORD: parseString(config.DB_PASSWORD, 'postgres'),
    DB_DATABASE: parseString(config.DB_DATABASE, 'eva'),
    DB_SYNCHRONIZE: parseBoolean(config.DB_SYNCHRONIZE, 'DB_SYNCHRONIZE'),
    DB_LOGGING: parseBoolean(config.DB_LOGGING, 'DB_LOGGING'),
    DB_MIGRATIONS_RUN: parseBoolean(
      config.DB_MIGRATIONS_RUN,
      'DB_MIGRATIONS_RUN',
    ),
    CACHE_TTL_SECONDS: parseNumber(
      config.CACHE_TTL_SECONDS,
      'CACHE_TTL_SECONDS',
      120,
    ),
    CACHE_NAMESPACE: parseString(config.CACHE_NAMESPACE, 'eva'),
    LLM_PROVIDER: parseString(config.LLM_PROVIDER, 'mock'),
    LLM_API_KEY: parseString(config.LLM_API_KEY, ''),
    LLM_BASE_URL: parseString(config.LLM_BASE_URL, 'https://api.openai.com/v1'),
    LLM_MODEL: parseString(config.LLM_MODEL, 'gpt-4o-mini'),
    LLM_TEMPERATURE:
      config.LLM_TEMPERATURE === undefined ||
      config.LLM_TEMPERATURE === null ||
      config.LLM_TEMPERATURE === ''
        ? 0.2
        : Number.parseFloat(String(config.LLM_TEMPERATURE)),
    LLM_MAX_TOKENS: parseNumber(config.LLM_MAX_TOKENS, 'LLM_MAX_TOKENS', 512),
    SENTRY_DSN: parseString(config.SENTRY_DSN, ''),
    REDIS_HOST: parseString(config.REDIS_HOST, 'localhost'),
    REDIS_PORT: parseNumber(config.REDIS_PORT, 'REDIS_PORT', 6379),
  };
}
