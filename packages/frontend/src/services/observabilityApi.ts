import api from './api';
import type { TraceLog, TraceListResult, QueryTraceParams, CreateTraceDto } from '../types/observability';

export const observabilityApi = {
  // 获取 Trace 列表
  getTraces: async (params: QueryTraceParams): Promise<TraceListResult> => {
    const response = await api.get<TraceListResult>('/traces', { params });
    return response.data;
  },

  // 获取单个 Trace 详情
  getTraceById: async (id: string): Promise<TraceLog> => {
    const response = await api.get<TraceLog>(`/traces/${id}`);
    return response.data;
  },

  // 获取行为日志
  getBehaviorLogs: async (traceId: string): Promise<TraceLog[]> => {
    const response = await api.get<TraceLog[]>(`/traces/${traceId}/logs`);
    return response.data;
  },

  // 创建 Trace 记录
  createTrace: async (data: CreateTraceDto): Promise<TraceLog> => {
    const response = await api.post<TraceLog>('/traces', data);
    return response.data;
  },
};

export default observabilityApi;
