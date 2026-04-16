export interface ProjectSettings {
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
export interface Member {
    id: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
    avatar?: string;
    joinedAt: string;
}
export interface AddMemberRequest {
    email: string;
    role: 'owner' | 'admin' | 'member';
}
export interface UpdateMemberRequest {
    role: 'owner' | 'admin' | 'member';
}
export interface ApiToken {
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
export interface CreateTokenResponse extends ApiToken {
    token: string;
}
export declare const settingsApi: {
    /**
     * 获取项目设置
     */
    getProjectSettings: () => Promise<ProjectSettings>;
    /**
     * 更新项目设置
     */
    updateProjectSettings: (data: UpdateProjectRequest) => Promise<ProjectSettings>;
    /**
     * 获取成员列表
     */
    getMembers: () => Promise<Member[]>;
    /**
     * 添加成员
     */
    addMember: (data: AddMemberRequest) => Promise<Member>;
    /**
     * 更新成员角色
     */
    updateMember: (id: string, data: UpdateMemberRequest) => Promise<Member>;
    /**
     * 移除成员
     */
    removeMember: (id: string) => Promise<void>;
    /**
     * 获取 API Token 列表
     */
    getTokens: () => Promise<ApiToken[]>;
    /**
     * 创建 API Token
     */
    createToken: (data: CreateTokenRequest) => Promise<CreateTokenResponse>;
    /**
     * 删除 API Token
     */
    deleteToken: (id: string) => Promise<void>;
};
export default settingsApi;
