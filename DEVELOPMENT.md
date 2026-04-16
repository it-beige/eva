# Eva AI 评测平台 — 开发任务记录

## 项目概述

Eva 是一个类 Eva+ 的 AI 应用评测平台，提供完整的 AI 应用管理、评测任务执行、评测集管理、评估指标配置、自动化评测、Prompt 管理、Playground 测试、排行榜展示、应用可观测等功能模块。

**技术栈**：

- **Monorepo**: pnpm workspace
- **前端**: React 18 + Vite 6 + Ant Design 6.x + Redux Toolkit + React Router 6 + Axios + Socket.IO Client
- **后端**: NestJS 10 + TypeORM + PostgreSQL + Redis + Bull + WebSocket (Socket.IO)
- **共享**: @eva/shared 包（类型、枚举、常量）
- **基础设施**: Docker Compose (PostgreSQL + Redis)

---

## 项目结构

```
eva/
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── docker-compose.yml
├── images/                          # UI 设计稿
├── packages/
│   ├── frontend/                    # React SPA
│   │   ├── src/
│   │   │   ├── app/                 # store, router, App.tsx
│   │   │   │   ├── App.tsx
│   │   │   │   ├── router.tsx       # 路由配置
│   │   │   │   └── store.ts         # Redux store
│   │   │   ├── layouts/             # 布局组件
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── ObservabilityLayout.tsx
│   │   │   ├── pages/               # 页面模块
│   │   │   │   ├── ai-application/
│   │   │   │   ├── analytics/
│   │   │   │   ├── auto-eval/
│   │   │   │   ├── eval-metric/
│   │   │   │   ├── eval-set/
│   │   │   │   ├── eval-task/
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── observability/
│   │   │   │   ├── playground/
│   │   │   │   ├── prompt/
│   │   │   │   └── settings/
│   │   │   ├── components/          # 通用组件
│   │   │   ├── services/            # API 请求层
│   │   │   ├── store/               # Redux Toolkit slices
│   │   │   ├── hooks/               # 自定义 hooks
│   │   │   ├── types/               # TypeScript 类型
│   │   │   └── utils/               # 工具函数
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── backend/                     # NestJS API
│   │   ├── src/
│   │   │   ├── modules/             # 业务模块
│   │   │   │   ├── ai-application/
│   │   │   │   ├── auto-eval/
│   │   │   │   ├── eval-metric/
│   │   │   │   ├── eval-set/
│   │   │   │   ├── eval-task/
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── observability/
│   │   │   │   ├── playground/
│   │   │   │   ├── prompt/
│   │   │   │   └── settings/
│   │   │   ├── common/              # 通用设施
│   │   │   │   ├── decorators/
│   │   │   │   ├── dto/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── middlewares/
│   │   │   │   ├── pipes/
│   │   │   │   └── strategies/
│   │   │   ├── config/
│   │   │   ├── database/            # TypeORM
│   │   │   │   ├── entities/
│   │   │   │   ├── migrations/
│   │   │   │   └── seeds/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                      # 前后端共享
│       ├── src/
│       │   ├── types/
│       │   │   └── index.ts
│       │   ├── constants/
│       │   └── index.ts
│       └── package.json
```

---

## 任务执行记录

### Task 1: 项目脚手架初始化

- **状态**: ✅ 已完成
- **执行者**: Jimmy(后端), Lee(前端), Bill(后端)
- **内容**:
  - 初始化 pnpm workspace 结构 (root + frontend + backend + shared)
  - 配置 TypeScript、ESLint、Prettier
  - 前端: Vite 6 + React 18 + Antd 6.x + Redux Toolkit + React Router 6
  - 后端: NestJS 10 + TypeORM + PostgreSQL 配置
  - 共享包: @eva/shared 类型定义
  - Docker Compose: PostgreSQL + Redis

- **产出文件**:
  - `/pnpm-workspace.yaml`
  - `/package.json`
  - `/tsconfig.base.json`
  - `/docker-compose.yml`
  - `/packages/frontend/package.json`
  - `/packages/backend/package.json`
  - `/packages/shared/package.json`

---

### Task 2: 通用布局与路由系统

- **状态**: ✅ 已完成
- **执行者**: Taylor(前端)
- **内容**:
  - MainLayout: 顶部导航 + 左侧边栏 + 内容区
  - ObservabilityLayout: 可观测模块专用布局
  - 路由表: 所有页面路由配置，含懒加载
  - uiSlice: 全局 UI 状态管理

- **产出文件**:
  - `packages/frontend/src/layouts/MainLayout.tsx`
  - `packages/frontend/src/layouts/MainLayout.module.css`
  - `packages/frontend/src/layouts/ObservabilityLayout.tsx`
  - `packages/frontend/src/app/router.tsx`
  - `packages/frontend/src/app/store.ts`
  - `packages/frontend/src/store/uiSlice.ts`

---

### Task 3: 后端通用基础设施

- **状态**: ✅ 已完成
- **执行者**: Jason(后端)
- **内容**:
  - 全局异常过滤器 (HttpExceptionFilter)
  - 响应拦截器 (TransformInterceptor)
  - 认证 Guard (JWT)
  - 请求日志中间件 (LoggerMiddleware)
  - 分页 DTO (PaginationQueryDto, PaginatedResponseDto)
  - 13 个 Entity 定义
  - 种子数据脚本

- **产出文件**:
  - `packages/backend/src/common/filters/http-exception.filter.ts`
  - `packages/backend/src/common/interceptors/transform.interceptor.ts`
  - `packages/backend/src/common/guards/jwt-auth.guard.ts`
  - `packages/backend/src/common/middlewares/logger.middleware.ts`
  - `packages/backend/src/common/dto/pagination.dto.ts`
  - `packages/backend/src/database/entities/*.ts` (13个)
  - `packages/backend/src/database/seeds/seed.ts`

---

### Task 4: AI 应用管理模块

- **状态**: ✅ 已完成
- **执行者**: Felix
- **内容**:
  - 后端 CRUD + 版本管理 + 引用公共 Code Agent
  - 前端卡片列表 + Modal + Redux

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/ai-applications` | 分页列表查询 |
  | GET | `/api/ai-applications/:id` | 获取详情 |
  | POST | `/api/ai-applications` | 创建 AI 应用 |
  | PUT | `/api/ai-applications/:id` | 更新应用 |
  | DELETE | `/api/ai-applications/:id` | 删除应用 |
  | GET | `/api/ai-applications/:id/versions` | 获取版本列表 |
  | POST | `/api/ai-applications/:id/versions` | 创建新版本 |
  | POST | `/api/ai-applications/import-public` | 引用公共 Code Agent |

- **前端页面/组件**:
  - `pages/ai-application/index.tsx` - 列表页
  - `pages/ai-application/components/AppCard.tsx` - 应用卡片
  - `pages/ai-application/components/CreateAppModal.tsx` - 新建/编辑 Modal
  - `pages/ai-application/components/ImportPublicModal.tsx` - 引用公共 Agent

- **产出文件**:
  - `packages/backend/src/modules/ai-application/ai-application.controller.ts`
  - `packages/backend/src/modules/ai-application/ai-application.service.ts`
  - `packages/backend/src/modules/ai-application/dto/*.ts`
  - `packages/frontend/src/pages/ai-application/*`
  - `packages/frontend/src/services/aiApplicationApi.ts`
  - `packages/frontend/src/store/aiApplicationSlice.ts`

---

### Task 5: 评测任务模块

- **状态**: ✅ 已完成
- **执行者**: James
- **内容**:
  - 后端 CRUD + Bull 队列 + WebSocket 推送进度
  - 前端三步骤表单 + 状态标签 + 实时进度

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/eval-tasks` | 分页列表查询 |
  | GET | `/api/eval-tasks/:id` | 获取详情 |
  | POST | `/api/eval-tasks` | 创建评测任务 |
  | POST | `/api/eval-tasks/:id/copy` | 复制任务 |
  | POST | `/api/eval-tasks/:id/abort` | 中止任务 |
  | GET | `/api/eval-tasks/:id/logs` | 获取任务日志 |
  | POST | `/api/eval-tasks/batch` | 批量操作 |

- **WebSocket 事件**:
  - `eval-task:progress` - 任务进度推送
  - `eval-task:status` - 任务状态变更

- **前端页面/组件**:
  - `pages/eval-task/index.tsx` - 列表页
  - `pages/eval-task/CreateEvalTask.tsx` - 新建任务页(三步骤表单)
  - `pages/eval-task/EvalTaskDetail.tsx` - 任务详情页
  - `pages/eval-task/components/EvalTypeSelector.tsx` - 评测类型选择
  - `pages/eval-task/components/EvalModeSelector.tsx` - 评测模式选择
  - `pages/eval-task/components/TaskStatusTag.tsx` - 状态标签
  - `pages/eval-task/components/HelpPanel.tsx` - 帮助面板

- **产出文件**:
  - `packages/backend/src/modules/eval-task/eval-task.controller.ts`
  - `packages/backend/src/modules/eval-task/eval-task.service.ts`
  - `packages/backend/src/modules/eval-task/eval-task.processor.ts` (Bull)
  - `packages/backend/src/modules/eval-task/eval-task.gateway.ts` (WebSocket)
  - `packages/frontend/src/pages/eval-task/*`
  - `packages/frontend/src/services/evalTaskApi.ts`
  - `packages/frontend/src/store/evalTaskSlice.ts`

---

### Task 6: 评测集模块

- **状态**: ✅ 已完成
- **执行者**: Robin
- **内容**:
  - 6 种创建方式（本地上传/ODPS/线上数据提取/SDK/AI智能生成/空白）
  - 数据项管理 (CRUD + 批量导入导出)
  - 标签管理
  - 列管理

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/eval-sets` | 分页列表查询 |
  | GET | `/api/eval-sets/:id` | 获取详情 |
  | POST | `/api/eval-sets` | 创建评测集 |
  | PUT | `/api/eval-sets/:id` | 更新评测集 |
  | DELETE | `/api/eval-sets/:id` | 删除评测集 |
  | POST | `/api/eval-sets/:id/tags` | 添加标签 |
  | DELETE | `/api/eval-sets/:id/tags/:tagName` | 删除标签 |
  | GET | `/api/eval-sets/:evalSetId/items` | 数据项列表 |
  | POST | `/api/eval-sets/:evalSetId/items` | 新增数据项 |
  | PUT | `/api/eval-sets/:evalSetId/items/:itemId` | 更新数据项 |
  | DELETE | `/api/eval-sets/:evalSetId/items/:itemId` | 删除数据项 |
  | POST | `/api/eval-sets/:evalSetId/items/batch-import` | 批量导入 |
  | GET | `/api/eval-sets/:evalSetId/items/export` | 导出数据 |

- **前端页面/组件**:
  - `pages/eval-set/index.tsx` - 列表页
  - `pages/eval-set/CreateEvalSet.tsx` - 新建评测集
  - `pages/eval-set/EvalSetDetail.tsx` - 详情页(Items 视图)
  - `pages/eval-set/components/CreateEvalSetModal.tsx` - 新建弹窗(6种方式)
  - `pages/eval-set/components/EvalSetItemTable.tsx` - 数据项表格
  - `pages/eval-set/components/ColumnManager.tsx` - 列管理
  - `pages/eval-set/components/TagManager.tsx` - 标签管理
  - `pages/eval-set/components/AddTagModal.tsx` - 添加标签弹窗

- **产出文件**:
  - `packages/backend/src/modules/eval-set/eval-set.controller.ts`
  - `packages/backend/src/modules/eval-set/eval-set.service.ts`
  - `packages/backend/src/modules/eval-set/eval-set-item.controller.ts`
  - `packages/backend/src/modules/eval-set/eval-set-item.service.ts`
  - `packages/frontend/src/pages/eval-set/*`
  - `packages/frontend/src/services/evalSetApi.ts`
  - `packages/frontend/src/store/evalSetSlice.ts`

---

### Task 7: 评估指标模块

- **状态**: ✅ 已完成
- **执行者**: Jay
- **内容**:
  - LLM/Code 两种类型指标
  - 个人/公共 Tab 分类
  - Prompt 编辑
  - 仓库解析

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/eval-metrics` | 分页列表查询 |
  | GET | `/api/eval-metrics/:id` | 获取详情 |
  | POST | `/api/eval-metrics` | 创建指标 |
  | PUT | `/api/eval-metrics/:id` | 更新指标 |
  | DELETE | `/api/eval-metrics/:id` | 删除单个指标 |
  | DELETE | `/api/eval-metrics` | 批量删除指标 |
  | POST | `/api/eval-metrics/parse-repo` | 解析代码仓库指标 |

- **前端页面/组件**:
  - `pages/eval-metric/index.tsx` - 列表页(Tab: 个人/公共)
  - `pages/eval-metric/components/CreateMetricModal.tsx` - 新建指标弹窗
  - `pages/eval-metric/components/LlmMetricForm.tsx` - LLM 指标表单
  - `pages/eval-metric/components/CodeMetricForm.tsx` - Code 指标表单

- **产出文件**:
  - `packages/backend/src/modules/eval-metric/eval-metric.controller.ts`
  - `packages/backend/src/modules/eval-metric/eval-metric.service.ts`
  - `packages/frontend/src/pages/eval-metric/*`
  - `packages/frontend/src/services/evalMetricApi.ts`
  - `packages/frontend/src/store/evalMetricSlice.ts`

---

### Task 8: 自动化评测模块

- **状态**: ✅ 已完成
- **执行者**: Chloe (重新派发, Sarah 首次执行失败)
- **内容**:
  - 过滤采样规则配置
  - 评测规则配置
  - 调试面板
  - 左右双栏布局

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/auto-evals` | 分页列表查询 |
  | GET | `/api/auto-evals/:id` | 获取详情 |
  | POST | `/api/auto-evals` | 创建规则 |
  | PUT | `/api/auto-evals/:id` | 更新规则 |
  | DELETE | `/api/auto-evals/:id` | 删除单个规则 |
  | DELETE | `/api/auto-evals` | 批量删除规则 |
  | POST | `/api/auto-evals/debug-filter` | 调试过滤采样规则 |
  | POST | `/api/auto-evals/debug-eval` | 调试评测规则 |

- **前端页面/组件**:
  - `pages/auto-eval/index.tsx` - 列表页
  - `pages/auto-eval/CreateAutoEval.tsx` - 创建页(左右双栏)
  - `pages/auto-eval/components/FilterRuleBuilder.tsx` - 过滤规则构建器
  - `pages/auto-eval/components/MetricSelector.tsx` - 指标选择器
  - `pages/auto-eval/components/DebugFilterPanel.tsx` - 调试过滤面板
  - `pages/auto-eval/components/DebugEvalPanel.tsx` - 调试评测面板

- **产出文件**:
  - `packages/backend/src/modules/auto-eval/auto-eval.controller.ts`
  - `packages/backend/src/modules/auto-eval/auto-eval.service.ts`
  - `packages/frontend/src/pages/auto-eval/*`
  - `packages/frontend/src/services/autoEvalApi.ts`
  - `packages/frontend/src/store/autoEvalSlice.ts`

---

### Task 9: Prompt 管理模块

- **状态**: ✅ 已完成
- **执行者**: Nick
- **内容**:
  - CRUD + 版本管理
  - Mustache 语法支持
  - 版本对比视图

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/prompts` | 分页列表查询 |
  | GET | `/api/prompts/:id` | 获取详情 |
  | POST | `/api/prompts` | 创建 Prompt |
  | PUT | `/api/prompts/:id` | 更新 Prompt |
  | DELETE | `/api/prompts/:id` | 删除 Prompt |
  | GET | `/api/prompts/:id/versions` | 获取版本列表 |
  | GET | `/api/prompts/:id/versions/:versionId` | 获取指定版本 |

- **前端页面/组件**:
  - `pages/prompt/index.tsx` - 列表页
  - `pages/prompt/PromptDetail.tsx` - 详情页(版本对比)
  - `pages/prompt/components/CreatePromptModal.tsx` - 新建 Prompt 弹窗
  - `pages/prompt/components/VersionCompare.tsx` - 版本对比组件

- **产出文件**:
  - `packages/backend/src/modules/prompt/prompt.controller.ts`
  - `packages/backend/src/modules/prompt/prompt.service.ts`
  - `packages/frontend/src/pages/prompt/*`
  - `packages/frontend/src/services/promptApi.ts`
  - `packages/frontend/src/store/promptSlice.ts`

---

### Task 10: Playground + Leaderboard + 设置

- **状态**: ✅ 已完成
- **执行者**: Hunk
- **内容**:
  - Playground 流式输出 (SSE/WebSocket)
  - 排行榜展示
  - 项目设置 / 成员管理 / Token 管理

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | POST | `/api/playground/run` | 执行 Playground (非流式) |
  | POST | `/api/playground/run/stream` | 执行 Playground (SSE 流式) |
  | GET | `/api/leaderboard` | 获取排行榜数据 |
  | GET | `/api/leaderboard/summary` | 获取排行榜汇总 |
  | GET | `/api/settings/project` | 获取项目设置 |
  | PUT | `/api/settings/project` | 更新项目设置 |
  | GET | `/api/settings/members` | 获取成员列表 |
  | POST | `/api/settings/members` | 添加成员 |
  | PUT | `/api/settings/members/:id` | 更新成员角色 |
  | DELETE | `/api/settings/members/:id` | 移除成员 |
  | GET | `/api/settings/tokens` | 获取 API Token 列表 |
  | POST | `/api/settings/tokens` | 创建 API Token |
  | DELETE | `/api/settings/tokens/:id` | 删除 API Token |

- **前端页面/组件**:
  - `pages/playground/index.tsx` - Playground 页面
  - `pages/playground/components/PlaygroundConfig.tsx` - 配置面板
  - `pages/playground/components/StreamOutput.tsx` - 流式输出组件
  - `pages/leaderboard/index.tsx` - 排行榜页面
  - `pages/leaderboard/components/LeaderboardTable.tsx` - 排行表格
  - `pages/leaderboard/components/LeaderboardChart.tsx` - 可视化图表
  - `pages/settings/index.tsx` - 设置页面
  - `pages/settings/components/ProjectSettings.tsx` - 项目设置
  - `pages/settings/components/MemberManagement.tsx` - 成员管理
  - `pages/settings/components/TokenManagement.tsx` - Token 管理

- **产出文件**:
  - `packages/backend/src/modules/playground/playground.controller.ts`
  - `packages/backend/src/modules/playground/playground.service.ts`
  - `packages/backend/src/modules/playground/playground.gateway.ts`
  - `packages/backend/src/modules/leaderboard/leaderboard.controller.ts`
  - `packages/backend/src/modules/leaderboard/leaderboard.service.ts`
  - `packages/backend/src/modules/settings/settings.controller.ts`
  - `packages/backend/src/modules/settings/settings.service.ts`
  - `packages/frontend/src/pages/playground/*`
  - `packages/frontend/src/pages/leaderboard/*`
  - `packages/frontend/src/pages/settings/*`
  - `packages/frontend/src/services/playgroundApi.ts`
  - `packages/frontend/src/services/leaderboardApi.ts`
  - `packages/frontend/src/services/settingsApi.ts`
  - `packages/frontend/src/store/playgroundSlice.ts`
  - `packages/frontend/src/store/leaderboardSlice.ts`
  - `packages/frontend/src/store/settingsSlice.ts`

---

### Task 11: 应用可观测 — 调用明细

- **状态**: ✅ 已完成
- **执行者**: Cindy
- **内容**:
  - 多维筛选 (时间范围/TraceId/会话ID/节点ID/messageId/状态/用户ID)
  - Trace / 行为日志 Tab 切换
  - 详情页

- **API 端点**:
  | 方法 | 路径 | 说明 |
  |------|------|------|
  | GET | `/api/traces` | 调用明细列表(分页+多维筛选) |
  | GET | `/api/traces/:id` | Trace 详情 |
  | GET | `/api/traces/:traceId/logs` | 行为日志列表 |
  | POST | `/api/traces` | 创建 Trace 记录 |

- **前端页面/组件**:
  - `pages/observability/index.tsx` - 调用明细列表页
  - `pages/observability/TraceDetail.tsx` - Trace 详情页
  - `pages/observability/components/TraceFilter.tsx` - 筛选栏
  - `pages/observability/components/TraceTable.tsx` - Trace 表格
  - `pages/observability/components/BehaviorLogTab.tsx` - 行为日志 Tab

- **产出文件**:
  - `packages/backend/src/modules/observability/observability.controller.ts`
  - `packages/backend/src/modules/observability/observability.service.ts`
  - `packages/frontend/src/pages/observability/*`
  - `packages/frontend/src/services/observabilityApi.ts`
  - `packages/frontend/src/store/observabilitySlice.ts`

---

### Task 12: 集成联调与优化

- **状态**: ✅ 已完成
- **执行者**: Eric
- **内容**:
  - 模块注册验证 (AppModule)
  - Store 注册验证
  - 路由修复
  - 错误处理完善
  - TypeORM 实体关系修复

- **产出文件**:
  - `packages/backend/src/app.module.ts`
  - `packages/frontend/src/app/store.ts`
  - `packages/frontend/src/app/router.tsx`

---

## 数据库 Entity 一览

| 实体                 | 表名                | 关键字段                                                                                                                                |
| -------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Project**          | projects            | id, name, description                                                                                                                   |
| **AIApplication**    | ai_applications     | id, name, description, icon, latestVersion, gitRepoUrl, projectId                                                                       |
| **AppVersion**       | app_versions        | id, appId, version, config                                                                                                              |
| **EvalTask**         | eval_tasks          | id, name, shortId, status, progress, evalType, evalMode, maxConcurrency, evalSetId, taskGroupId, evalModelId, appId, appVersion, config |
| **EvalSet**          | eval_sets           | id, name, type(text/code), description, dataCount, sourceType, gitRepoUrl, lastEvalTime                                                 |
| **EvalSetItem**      | eval_set_items      | id, evalSetId, input(JSON), output(JSON), metadata(JSON)                                                                                |
| **EvalMetric**       | eval_metrics        | id, name, description, type(llm/code), scope(personal/public), prompt, codeRepoUrl, codeBranch                                          |
| **AutoEval**         | auto_evals          | id, name, status, filterRules(JSON), sampleRate, metricIds(JSON)                                                                        |
| **Prompt**           | prompts             | id, name, content, metadata(JSON), description, version                                                                                 |
| **PromptVersion**    | prompt_versions     | id, promptId, version, content                                                                                                          |
| **TraceLog**         | trace_logs          | id, traceId, sessionId, userId, nodeId, messageId, input, output, inputTokens, outputTokens, ttft, status, sourceProject, calledAt      |
| **LeaderboardEntry** | leaderboard_entries | id, appId, evalSetId, metricId, score, rank                                                                                             |
| **User**             | users               | id, name, employeeId, role(admin/user), avatar                                                                                          |

---

## API 端点汇总

### AI 应用管理

| 方法   | 路径                                 | 说明           |
| ------ | ------------------------------------ | -------------- |
| GET    | `/api/ai-applications`               | 分页列表       |
| GET    | `/api/ai-applications/:id`           | 获取详情       |
| POST   | `/api/ai-applications`               | 创建应用       |
| PUT    | `/api/ai-applications/:id`           | 更新应用       |
| DELETE | `/api/ai-applications/:id`           | 删除应用       |
| GET    | `/api/ai-applications/:id/versions`  | 版本列表       |
| POST   | `/api/ai-applications/:id/versions`  | 创建版本       |
| POST   | `/api/ai-applications/import-public` | 引用公共 Agent |

### 评测任务

| 方法 | 路径                        | 说明     |
| ---- | --------------------------- | -------- |
| GET  | `/api/eval-tasks`           | 分页列表 |
| GET  | `/api/eval-tasks/:id`       | 获取详情 |
| POST | `/api/eval-tasks`           | 创建任务 |
| POST | `/api/eval-tasks/:id/copy`  | 复制任务 |
| POST | `/api/eval-tasks/:id/abort` | 中止任务 |
| GET  | `/api/eval-tasks/:id/logs`  | 任务日志 |
| POST | `/api/eval-tasks/batch`     | 批量操作 |

### 评测集

| 方法   | 路径                                           | 说明       |
| ------ | ---------------------------------------------- | ---------- |
| GET    | `/api/eval-sets`                               | 分页列表   |
| GET    | `/api/eval-sets/:id`                           | 获取详情   |
| POST   | `/api/eval-sets`                               | 创建评测集 |
| PUT    | `/api/eval-sets/:id`                           | 更新评测集 |
| DELETE | `/api/eval-sets/:id`                           | 删除评测集 |
| POST   | `/api/eval-sets/:id/tags`                      | 添加标签   |
| DELETE | `/api/eval-sets/:id/tags/:tagName`             | 删除标签   |
| GET    | `/api/eval-sets/:evalSetId/items`              | 数据项列表 |
| POST   | `/api/eval-sets/:evalSetId/items`              | 新增数据项 |
| PUT    | `/api/eval-sets/:evalSetId/items/:itemId`      | 更新数据项 |
| DELETE | `/api/eval-sets/:evalSetId/items/:itemId`      | 删除数据项 |
| POST   | `/api/eval-sets/:evalSetId/items/batch-import` | 批量导入   |
| GET    | `/api/eval-sets/:evalSetId/items/export`       | 导出数据   |

### 评估指标

| 方法   | 路径                           | 说明         |
| ------ | ------------------------------ | ------------ |
| GET    | `/api/eval-metrics`            | 分页列表     |
| GET    | `/api/eval-metrics/:id`        | 获取详情     |
| POST   | `/api/eval-metrics`            | 创建指标     |
| PUT    | `/api/eval-metrics/:id`        | 更新指标     |
| DELETE | `/api/eval-metrics/:id`        | 删除单个     |
| DELETE | `/api/eval-metrics`            | 批量删除     |
| POST   | `/api/eval-metrics/parse-repo` | 解析仓库指标 |

### 自动化评测

| 方法   | 路径                           | 说明         |
| ------ | ------------------------------ | ------------ |
| GET    | `/api/auto-evals`              | 分页列表     |
| GET    | `/api/auto-evals/:id`          | 获取详情     |
| POST   | `/api/auto-evals`              | 创建规则     |
| PUT    | `/api/auto-evals/:id`          | 更新规则     |
| DELETE | `/api/auto-evals/:id`          | 删除单个     |
| DELETE | `/api/auto-evals`              | 批量删除     |
| POST   | `/api/auto-evals/debug-filter` | 调试过滤规则 |
| POST   | `/api/auto-evals/debug-eval`   | 调试评测规则 |

### Prompt 管理

| 方法   | 路径                                   | 说明        |
| ------ | -------------------------------------- | ----------- |
| GET    | `/api/prompts`                         | 分页列表    |
| GET    | `/api/prompts/:id`                     | 获取详情    |
| POST   | `/api/prompts`                         | 创建 Prompt |
| PUT    | `/api/prompts/:id`                     | 更新 Prompt |
| DELETE | `/api/prompts/:id`                     | 删除 Prompt |
| GET    | `/api/prompts/:id/versions`            | 版本列表    |
| GET    | `/api/prompts/:id/versions/:versionId` | 获取版本    |

### Playground

| 方法 | 路径                         | 说明          |
| ---- | ---------------------------- | ------------- |
| POST | `/api/playground/run`        | 执行(非流式)  |
| POST | `/api/playground/run/stream` | 执行(SSE流式) |

### Leaderboard

| 方法 | 路径                       | 说明       |
| ---- | -------------------------- | ---------- |
| GET  | `/api/leaderboard`         | 排行榜数据 |
| GET  | `/api/leaderboard/summary` | 汇总统计   |

### 可观测

| 方法 | 路径                        | 说明         |
| ---- | --------------------------- | ------------ |
| GET  | `/api/traces`               | 调用明细列表 |
| GET  | `/api/traces/:id`           | Trace 详情   |
| GET  | `/api/traces/:traceId/logs` | 行为日志     |
| POST | `/api/traces`               | 创建记录     |

### 设置

| 方法   | 路径                        | 说明         |
| ------ | --------------------------- | ------------ |
| GET    | `/api/settings/project`     | 项目设置     |
| PUT    | `/api/settings/project`     | 更新项目设置 |
| GET    | `/api/settings/members`     | 成员列表     |
| POST   | `/api/settings/members`     | 添加成员     |
| PUT    | `/api/settings/members/:id` | 更新成员     |
| DELETE | `/api/settings/members/:id` | 移除成员     |
| GET    | `/api/settings/tokens`      | Token 列表   |
| POST   | `/api/settings/tokens`      | 创建 Token   |
| DELETE | `/api/settings/tokens/:id`  | 删除 Token   |

---

## 启动指南

```bash
# 进入项目目录
cd /Users/beige/code/eva

# 安装依赖
pnpm install

# 启动基础设施 (PostgreSQL + Redis)
docker-compose up -d

# 运行数据库种子 (首次启动)
pnpm --filter @eva/backend seed

# 启动开发服务器 (前端 + 后端)
pnpm dev

# 或分别启动
pnpm dev:frontend  # 前端 http://localhost:5173
pnpm dev:backend   # 后端 http://localhost:3000
```

---

## 已知事项与后续计划

### 已知事项

1. **Ant Design 6.x 兼容性**: 部分组件 API 与 5.x 有差异，需持续关注升级
2. **模拟实现**: AI智能生成/ODPS上传/SDK动态接入等功能为模拟实现
3. **认证体系**: JWT 认证已搭建，但用户登录/注册流程为简化版本
4. **WebSocket**: 已集成 Socket.IO，但生产环境需配置 Redis Adapter

### 后续计划

1. **测试补充**: 单元测试、集成测试、E2E 测试
2. **权限完善**: RBAC 权限控制细化
3. **性能优化**: 大数据量分页优化、WebSocket 连接池
4. **部署配置**: 生产环境 Dockerfile、K8s 配置、CI/CD 流程
5. **监控告警**: 接入 APM、日志聚合、告警规则
