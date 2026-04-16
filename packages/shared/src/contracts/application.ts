export interface ApplicationVersionResponse {
  id: string;
  appId: string;
  version: string;
  config: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApplicationResponse {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  latestVersion: string | null;
  gitRepoUrl: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  versions?: ApplicationVersionResponse[];
}

export interface QueryApplicationsParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  projectId?: string;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  icon?: string;
  gitRepoUrl?: string;
  projectId?: string;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  icon?: string;
  gitRepoUrl?: string;
  projectId?: string;
}

export interface ImportPublicAgentRequest {
  name: string;
  gitRepoUrl: string;
  projectId?: string;
}

export interface CreateApplicationVersionRequest {
  version: string;
  config?: Record<string, unknown>;
}
