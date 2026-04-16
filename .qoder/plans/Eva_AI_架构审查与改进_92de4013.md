# Eva AI 评测平台 — 架构审查与改进计划

## 一、架构设计缺陷清单

### 1. 数据库层设计问题

#### 1.1 实体关系缺失严重

**问题位置**: `packages/backend/src/database/entities/`

- **EvalTask 实体** (eval-task.entity.ts): 缺少与 EvalSet、AIApplication 的外键关系定义，仅使用裸 UUID 字段 (`evalSetId`, `appId`)，导致：
  - 无法使用 TypeORM 的 `relations` 自动加载关联数据
  - 数据库层面没有外键约束，数据一致性无法保证
  - 查询时需要手动 JOIN 或多次查询
- **LeaderboardEntry 实体**: 缺少与 AIApplication、EvalSet、EvalMetric 的关系定义
- **TraceLog 实体**: 缺少与 AIApplication、User 的关系定义

**改进方案**:

```typescript
// eval-task.entity.ts 应改为：
@ManyToOne(() => EvalSet, { nullable: true })
@JoinColumn({ name: 'eval_set_id' })
evalSet: EvalSet | null;

@ManyToOne(() => AIApplication, { nullable: true })
@JoinColumn({ name: 'app_id' })
application: AIApplication | null;
```

#### 1.2 缺少数据库迁移机制

**问题位置**: `packages/backend/src/database/migrations/` (目录为空)

- 当前使用 `synchronize: true` (开发环境)，生产环境无法使用
- 没有版本化的数据库变更管理
- 团队协作时数据库 schema 无法同步

**改进方案**:

- 引入 TypeORM Migration 机制
- 配置生产环境 `synchronize: false`
- 建立迁移脚本生成和执行流程

#### 1.3 JSON 字段滥用

**问题位置**:

- `eval_task.config` (jsonb)
- `auto_eval.filterRules` (jsonb)
- `eval_set.tags` (jsonb)
- `eval_set_item.input/output/metadata` (jsonb)

**问题**:

- 无法建立索引，查询性能差
- 缺乏类型安全，容易存入脏数据
- 后期难以做数据分析和统计

**改进方案**:

- 对高频查询的 JSON 字段，提取为独立列或关联表
- 使用 PostgreSQL 的 Generated Columns 或 Expression Indexes
- 添加 JSON Schema 验证

### 2. 后端架构问题

#### 2.1 模块间耦合度高

**问题位置**: `packages/backend/src/app.module.ts`

```typescript
TypeOrmModule.forFeature(Object.values(entities)), // 全局注册所有实体
```

- 所有模块共享全部 Entity，违反模块隔离原则
- 模块间可以通过直接注入 Repository 互相访问，缺乏边界

**改进方案**:

- 每个模块只 `forFeature` 注册自己需要的 Entity
- 模块间通信通过 Service 接口，不直接访问 Repository
- 引入 CQRS 模式拆分读写职责

#### 2.2 缺少统一的错误处理体系

**问题位置**:

- `packages/backend/src/common/filters/http-exception.filter.ts`
- 各 Service 中直接抛 `NotFoundException`, `BadRequestException`

**问题**:

- 错误码不规范，前端难以处理
- 缺少业务错误码枚举
- 缺少错误日志追踪 (TraceId)

**改进方案**:

```typescript
// 定义业务错误码
export enum BusinessErrorCode {
  TASK_NOT_FOUND = 'TASK_001',
  EVAL_SET_NOT_FOUND = 'EVAL_SET_001',
  // ...
}

// 统一异常响应格式
{
  code: 'TASK_001',
  message: '评测任务不存在',
  traceId: 'abc123',
  timestamp: '2024-01-01T00:00:00Z'
}
```

#### 2.3 Processor 实现为模拟逻辑

**问题位置**: `packages/backend/src/modules/eval-task/eval-task.processor.ts`

```typescript
// 模拟评测执行过程
const totalSteps = 10
for (let step = 1; step <= totalSteps; step++) {
  await new Promise(resolve => setTimeout(resolve, 1000))
}
const shouldFail = Math.random() < 0.1 // 10% 失败率
```

- 核心业务逻辑未实现
- 没有实际的评测执行引擎
- 缺少与 LLM API 的集成

**改进方案**:

- 设计评测执行引擎抽象层
- 实现 LLM 调用适配器 (OpenAI, 通义千问等)
- 实现指标计算逻辑

#### 2.4 缺少缓存策略

**问题位置**: 全局

- Leaderboard 查询、EvalSet 列表等高频读操作没有缓存
- Redis 仅用于 Bull 队列

**改进方案**:

- 引入 `cache-manager` + `@nestjs/cache-manager`
- 对排行榜、配置类数据添加 Redis 缓存
- 实现缓存失效策略

### 3. 前端架构问题

#### 3.1 Redux 状态管理过度设计

**问题位置**: `packages/frontend/src/store/` (11个 slice)

- 每个模块都有独立的 Redux slice，但大部分只是 CRUD 状态
- 大量重复的 `loading/error/pagination` 状态模板代码
- RTK Query 更适合此类场景

**改进方案**:

```typescript
// 使用 RTK Query 替代手动 slice
export const evalTaskApi = createApi({
  reducerPath: 'evalTaskApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api' }),
  endpoints: builder => ({
    getEvalTasks: builder.query<PaginatedResponse<EvalTask>, QueryParams>({
      query: params => ({ url: '/eval-tasks', params }),
    }),
    // ...
  }),
})
```

#### 3.2 API 层缺少统一类型定义

**问题位置**: `packages/frontend/src/services/`

- 每个 API 文件独立定义 Request/Response 接口
- 与后端 DTO 不同步，容易出错
- 应从 `@eva/shared` 统一导入

**改进方案**:

- 在 `@eva/shared` 中定义 API 契约类型
- 使用 OpenAPI/Swagger 自动生成前端类型
- 引入 API Mock 机制

#### 3.3 缺少路由守卫和权限控制

**问题位置**: `packages/frontend/src/app/router.tsx`

- 所有路由直接暴露，没有认证检查
- 登录状态仅依赖 `localStorage.getItem('token')`
- 没有角色权限路由控制

**改进方案**:

```typescript
// 添加路由守卫
{
  path: '/eval',
  element: <AuthGuard><MainLayout /></AuthGuard>,
  children: [
    {
      path: 'tasks',
      element: <PermissionGuard requiredRole="admin"><EvalTaskListPage /></PermissionGuard>,
    },
  ]
}
```

### 4. 工程规范问题

#### 4.1 缺少测试体系

**问题位置**: 全局

- 没有单元测试 (Jest/Vitest)
- 没有集成测试
- 没有 E2E 测试
- CI/CD 流程缺失

#### 4.2 日志和监控缺失

**问题位置**:

- `packages/backend/src/common/middlewares/logger.middleware.ts` (仅有简单 console.log)
- 缺少结构化日志 (JSON 格式)
- 缺少 APM 接入 (Sentry, OpenTelemetry)

#### 4.3 安全配置薄弱

**问题位置**:

- `.env.example` 中 JWT_SECRET 为弱密钥
- CORS 配置为 `*`
- 缺少 Helmet 安全头配置
- 缺少请求频率限制 (Rate Limiting)

---

## 二、改进计划 (分阶段执行)

### Phase 1: 基础架构加固

| 任务                   | 负责人     | 优先级 | 产出                                   |
| ---------------------- | ---------- | ------ | -------------------------------------- |
| 1.1 数据库迁移机制搭建 | 后端工程师 | P0     | Migration 脚本 + 执行流程              |
| 1.2 实体关系补全       | 后端工程师 | P0     | 所有 Entity 添加 @ManyToOne/@OneToMany |
| 1.3 统一错误码体系     | 后端工程师 | P1     | BusinessErrorCode + 异常过滤器重构     |
| 1.4 环境变量安全加固   | DevOps     | P0     | 强 JWT_SECRET + CORS 白名单 + Helmet   |
| 1.5 前端路由守卫       | 前端工程师 | P1     | AuthGuard + 权限路由                   |

### Phase 2: 状态管理与 API 层优化 (1周)

| 任务                  | 负责人     | 优先级 | 产出                               |
| --------------------- | ---------- | ------ | ---------------------------------- |
| 2.1 迁移到 RTK Query  | 前端工程师 | P1     | 重构 11 个 slice → 4-5个 API slice |
| 2.2 API 类型统一      | 前后端协同 | P1     | @eva/shared 添加 API 契约类型      |
| 2.3 引入 Swagger 文档 | 后端工程师 | P2     | @nestjs/swagger 自动生成 API 文档  |

### Phase 3: 性能与可扩展性 (2-3周)

| 任务                 | 负责人     | 优先级 | 产出                         |
| -------------------- | ---------- | ------ | ---------------------------- |
| 3.1 Redis 缓存层     | 后端工程师 | P1     | cache-manager + 缓存策略     |
| 3.2 评测执行引擎抽象 | 后端工程师 | P0     | EvalEngine 接口 + LLM 适配器 |
| 3.3 JSON 字段优化    | 后端工程师 | P2     | 高频字段提取 + 索引优化      |
| 3.4 大数据量分页优化 | 后端工程师 | P2     | 游标分页 + 虚拟列表          |

### Phase 4: 工程化完善 (持续)

| 任务                | 负责人 | 优先级 | 产出                       |
| ------------------- | ------ | ------ | -------------------------- |
| 4.1 单元测试覆盖    | 全团队 | P1     | 核心业务逻辑 >80% 覆盖     |
| 4.2 CI/CD 流程      | DevOps | P1     | GitHub Actions / GitLab CI |
| 4.3 日志与监控      | DevOps | P2     | 结构化日志 + Sentry + APM  |
| 4.4 Docker 生产镜像 | DevOps | P1     | 多阶段构建 + K8s 配置      |

---

## 三、关键架构决策

### 决策 1: 是否引入 CQRS 模式？

**建议**: 暂不引入，当前复杂度不够

- 评测任务模块可先行试点 (读写分离)
- 待 QPS > 1000 时再全面推广

### 决策 2: 是否替换 Redux 为 Zustand/Jotai?

**建议**: 保留 Redux，但迁移到 RTK Query

- 团队已有 Redux 经验，迁移成本低
- RTK Query 自带缓存、去重、轮询，适合 CRUD 场景

### 决策 3: 数据库是否需要分库分表？

**建议**: 暂不需要

- 单表数据量 < 1000万时 PostgreSQL 性能足够
- 优先优化索引和查询
- TraceLog 表可考虑按月分区

---

## 四、风险评估

| 风险                         | 影响 | 缓解措施                   |
| ---------------------------- | ---- | -------------------------- |
| 实体关系重构可能破坏现有 API | 高   | 向后兼容，逐步迁移         |
| RTK Query 迁移工作量大       | 中   | 按模块分批迁移，不影响线上 |
| 评测引擎抽象层设计不当       | 高   | 先出设计文档，评审后再开发 |

---

## 五、验收标准

### Phase 1 验收:

- [ ] 数据库迁移可正常执行 (up/down)
- [ ] 所有 Entity 关系定义完整
- [ ] 错误响应格式统一
- [ ] 未登录用户无法访问受保护路由

### Phase 2 验收:

- [ ] Redux slice 数量减少 50%+
- [ ] API 类型定义 100% 来自 @eva/shared
- [ ] Swagger 文档可在线访问

### Phase 3 验收:

- [ ] 排行榜接口响应时间 < 200ms (P95)
- [ ] 评测任务可真实调用 LLM API
- [ ] 分页查询 10万条数据 < 500ms

### Phase 4 验收:

- [ ] 单元测试覆盖率 > 80%
- [ ] CI 流水线自动运行测试
- [ ] 生产环境可追踪所有错误堆栈
