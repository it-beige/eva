export interface TraceLog {
  id: string;
  traceId: string;
  sessionId: string | null;
  userId: string | null;
  nodeId: string | null;
  messageId: string | null;
  input: string | null;
  output: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  ttft: number | null;
  status: string | null;
  sourceProject: string | null;
  calledAt: string;
}

export interface TraceListResult {
  list: TraceLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QueryTraceParams {
  startTime?: string;
  endTime?: string;
  idSearch?: string;
  status?: string;
  userId?: string;
  inputKeyword?: string;
  outputKeyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTraceDto {
  traceId: string;
  sessionId?: string;
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
  calledAt?: string;
}

export type TraceStatus = 'success' | 'error' | 'pending' | 'timeout';

export const TRACE_STATUS_OPTIONS = [
  { label: '请选择', value: '' },
  { label: '成功', value: 'success' },
  { label: '错误', value: 'error' },
  { label: '进行中', value: 'pending' },
  { label: '超时', value: 'timeout' },
];

export const TIME_RANGE_OPTIONS = [
  { label: '实时', value: 'realtime' },
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '近7天', value: 'last7days' },
  { label: '近30天', value: 'last30days' },
];
