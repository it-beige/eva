import { EvalTaskStatus, EvalType } from '../types';

export interface EvalSetInfoResponse {
  id: string;
  name: string;
  type: string;
}

export interface EvalTaskResponse {
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
  createdAt: string;
  updatedAt: string;
  evalSet?: EvalSetInfoResponse | null;
}

export interface CreateEvalTaskRequest {
  name: string;
  evalType: EvalType;
  evalMode?: string;
  maxConcurrency?: number;
  evalSetId?: string;
  evalItemId?: string;
  appId?: string;
  appVersion?: string;
  config?: Record<string, unknown>;
  audioConfig?: {
    datasetId?: string;
    configFileId?: string;
    configInfo?: string;
  };
}
