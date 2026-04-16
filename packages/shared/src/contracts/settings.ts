export type WorkspaceMemberRole = 'owner' | 'admin' | 'member';

export interface ProjectSettingsResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

export interface WorkspaceMember {
  id: string;
  email: string;
  name: string;
  role: WorkspaceMemberRole;
  avatar?: string;
  joinedAt: string;
}

export interface AddMemberRequest {
  email: string;
  role: WorkspaceMemberRole;
}

export interface UpdateMemberRequest {
  role: WorkspaceMemberRole;
}

export interface ApiTokenResponse {
  id: string;
  name: string;
  maskedToken: string;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreateTokenRequest {
  name: string;
  expiresIn?: number;
}

export interface CreateTokenResponse extends ApiTokenResponse {
  token: string;
}
