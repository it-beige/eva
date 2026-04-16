// Shared constants for Eva platform

export const APP_NAME = 'Eva';
export const APP_VERSION = '1.0.0';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const API_PREFIX = '/api';

export const ERROR_CODES = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

// ==================== Status Color Mappings ====================

export const EVAL_TASK_STATUS_COLORS: Record<string, string> = {
  pending: '#faad14',
  running: '#1890ff',
  success: '#52c41a',
  failed: '#f5222d',
  aborted: '#d9d9d9',
};

export const EVAL_TASK_STATUS_LABELS: Record<string, string> = {
  pending: '待执行',
  running: '执行中',
  success: '成功',
  failed: '失败',
  aborted: '已中止',
};

export const EVAL_TYPE_LABELS: Record<string, string> = {
  general: '通用评测',
  code: '代码评测',
  audio: '音频评测',
};

export const EVAL_SET_TYPE_LABELS: Record<string, string> = {
  text: '文本',
  code: '代码',
};

export const EVAL_SET_SOURCE_TYPE_LABELS: Record<string, string> = {
  public: '公开数据集',
  custom: '自定义',
  local_upload: '本地上传',
  odps: 'ODPS',
  online_extract: '线上数据提取',
  sdk: 'SDK动态接入',
  ai_generate: 'AI智能生成',
  blank: '空白数据集',
};

export const METRIC_TYPE_LABELS: Record<string, string> = {
  llm: 'LLM评测',
  code: '代码评测',
};

export const METRIC_SCOPE_LABELS: Record<string, string> = {
  personal: '个人',
  public: '公开',
};

export const AUTO_EVAL_STATUS_COLORS: Record<string, string> = {
  enabled: '#52c41a',
  disabled: '#d9d9d9',
};

export const AUTO_EVAL_STATUS_LABELS: Record<string, string> = {
  enabled: '已启用',
  disabled: '已禁用',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: '管理员',
  user: '普通用户',
};
