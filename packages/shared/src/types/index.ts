// Shared types for Eva platform

// ==================== Enums ====================

export enum EvalTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  ABORTED = 'aborted',
}

export enum EvalType {
  GENERAL = 'general',
  CODE = 'code',
  AUDIO = 'audio',
}

export enum EvalSetType {
  TEXT = 'text',
  CODE = 'code',
}

export enum EvalSetSourceType {
  PUBLIC = 'public',
  CUSTOM = 'custom',
  LOCAL_UPLOAD = 'local_upload',
  ODPS = 'odps',
  ONLINE_EXTRACT = 'online_extract',
  SDK = 'sdk',
  AI_GENERATE = 'ai_generate',
  BLANK = 'blank',
}

export enum MetricType {
  LLM = 'llm',
  CODE = 'code',
}

export enum MetricScope {
  PERSONAL = 'personal',
  PUBLIC = 'public',
}

export enum AutoEvalStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum ProjectSource {
  IDEALAB = 'IDEALAB',
  IDEALAB_WORKSPACE = 'IDEALAB_WORKSPACE',
  DEMO = 'DEMO',
  DIRECT = 'DIRECT',
  JOINT = 'JOINT',
}

export enum ProjectCreateMode {
  LINKED = 'linked',
  DIRECT = 'direct',
  JOINT = 'joint',
}

export enum BusinessErrorCode {
  VALIDATION_ERROR = 'COMMON_001',
  RESOURCE_NOT_FOUND = 'COMMON_404',
  INTERNAL_SERVER_ERROR = 'COMMON_500',
  AUTH_UNAUTHORIZED = 'AUTH_001',
  AUTH_FORBIDDEN = 'AUTH_002',
  TASK_NOT_FOUND = 'TASK_001',
  EVAL_SET_NOT_FOUND = 'EVAL_SET_001',
  APPLICATION_NOT_FOUND = 'APP_001',
  TRACE_NOT_FOUND = 'TRACE_001',
  MEMBER_NOT_FOUND = 'SETTINGS_001',
  MEMBER_ALREADY_EXISTS = 'SETTINGS_002',
  OWNER_CANNOT_BE_REMOVED = 'SETTINGS_003',
  TOKEN_NOT_FOUND = 'SETTINGS_004',
  PROJECT_NOT_FOUND = 'PROJECT_001',
  PROJECT_NAME_EXISTS = 'PROJECT_002',
  PROJECT_PID_EXISTS = 'PROJECT_003',
}

// ==================== Interfaces ====================

export interface User {
  id: string;
  name: string;
  employeeId?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  code: number | string;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
}

export interface ErrorResponse {
  code: number | string;
  message: string;
  data: null;
  timestamp: string;
  path: string;
  traceId: string;
  statusCode: number;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  employeeId?: string | null;
  role: UserRole;
}

export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== Entity Interfaces ====================

export interface ProjectEncryption {
  keyName: string;
  issueCode: string;
  generated: boolean;
}

export interface ProjectUser {
  id: string;
  name: string;
  employeeId: string;
}

export interface Project {
  id: string;
  pid: string;
  name: string;
  description?: string;
  appCode?: string;
  source: ProjectSource;
  admins: ProjectUser[];
  users: ProjectUser[];
  userCount: number;
  encryption?: ProjectEncryption;
  jointApps?: AppInfo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppInfo {
  appId: string;
  appName: string;
  appCode: string;
  platform: string;
}

export interface CreateProjectRequest {
  createMode: ProjectCreateMode;
  pid?: string;
  platform?: string;
  linkedApp?: string;
  projectName: string;
  description?: string;
  jointApps?: string[];
  adminIds: string[];
  userIds?: string[];
}

export interface UpdateProjectDetailRequest {
  projectName: string;
  description?: string;
  adminIds: string[];
  userIds?: string[];
}

export interface AIApplication {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  latestVersion?: string;
  gitRepoUrl?: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppVersion {
  id: string;
  appId: string;
  version: string;
  config?: Record<string, unknown>;
  createdAt: Date;
}

export interface EvalTask {
  id: string;
  name: string;
  shortId: string;
  status: EvalTaskStatus;
  progress: number;
  evalType: EvalType;
  evalMode?: string;
  maxConcurrency: number;
  evalSetId?: string;
  taskGroupId?: string;
  evalModelId?: string;
  appId?: string;
  appVersion?: string;
  config?: Record<string, unknown>;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvalSet {
  id: string;
  name: string;
  type: EvalSetType;
  description?: string;
  dataCount: number;
  sourceType: EvalSetSourceType;
  gitRepoUrl?: string;
  lastEvalTime?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvalSetItem {
  id: string;
  evalSetId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvalMetric {
  id: string;
  name: string;
  description?: string;
  type: MetricType;
  scope: MetricScope;
  prompt?: string;
  codeRepoUrl?: string;
  codeBranch: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoEval {
  id: string;
  name: string;
  status: AutoEvalStatus;
  filterRules?: Record<string, unknown>;
  sampleRate: number;
  metricIds: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  metadata?: Record<string, unknown>;
  description?: string;
  version: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  createdAt: Date;
}

export interface TraceLog {
  id: string;
  traceId: string;
  sessionId?: string;
  appId?: string;
  userId?: string;
  nodeId?: string;
  messageId?: string;
  input?: string;
  output?: string;
  inputTokens?: number;
  outputTokens?: number;
  ttft?: number;
  status?: string;
  sourceProject?: string;
  calledAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  appId?: string;
  evalSetId?: string;
  metricId?: string;
  score: number;
  rank?: number;
  createdAt: Date;
  updatedAt: Date;
}
