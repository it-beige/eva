# Eva AI 评测平台 — 全量开发计划

## 一、项目架构概览

```
eva/
├── pnpm-workspace.yaml
├── package.json                # root, scripts: dev/build/lint
├── tsconfig.base.json
├── .gitignore / .env.example
├── packages/
│   ├── frontend/              # React SPA
│   │   ├── src/
│   │   │   ├── app/           # store, router, App.tsx
│   │   │   ├── layouts/       # MainLayout (TopNav + Sidebar + Content)
│   │   │   ├── pages/         # 按模块拆分
│   │   │   ├── components/    # 通用组件
│   │   │   ├── services/      # API 请求层 (axios)
│   │   │   ├── store/         # Redux Toolkit slices
│   │   │   ├── hooks/         # 自定义 hooks
│   │   │   ├── types/         # TypeScript 类型
│   │   │   └── utils/         # 工具函数
│   │   ├── vite.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── backend/               # NestJS API
│   │   ├── src/
│   │   │   ├── modules/       # 按业务模块拆分
│   │   │   ├── common/        # guards, filters, interceptors, pipes
│   │   │   ├── config/        # 配置模块
│   │   │   ├── database/      # TypeORM entities, migrations
│   │   │   └── main.ts
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                # 前后端共享类型/常量
│       ├── src/
│       │   ├── types/         # DTO, enum, interface
│       │   └── constants/
│       └── package.json
```

**技术栈确认**:

- 前端: React 18 + Vite + Ant Design 6.x (最新版) + Redux Toolkit + React Router 6 + Axios
- 后端: NestJS 10 + TypeORM + PostgreSQL + Redis (Bull 队列) + WebSocket (Socket.IO)
- Monorepo: pnpm workspace
- 共享: @eva/shared 包（类型、枚举、常量）

---

## 二、数据库设计 (核心实体)

| 实体             | 关键字段                                                                                                                                                               | 说明         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Project          | id, name, description                                                                                                                                                  | 项目/空间    |
| AIApplication    | id, name, description, icon, latestVersion, gitRepoUrl, projectId                                                                                                      | AI 应用      |
| AppVersion       | id, appId, version, config                                                                                                                                             | 应用版本     |
| EvalTask         | id, name, status(pending/running/success/failed/aborted), progress, evalSetId, taskGroupId, evalModelId, evalType, evalMode, maxConcurrency, appId, appVersion, config | 评测任务     |
| EvalSet          | id, name, type(text/code), description, dataCount, sourceType(public/custom), gitRepoUrl, lastEvalTime, createdBy                                                      | 评测集       |
| EvalSetItem      | id, evalSetId, input, output, metadata, createdAt                                                                                                                      | 评测集数据项 |
| EvalMetric       | id, name, description, type(llm/code), scope(personal/public), prompt, codeRepoUrl, codeBranch, createdBy                                                              | 评估指标     |
| AutoEval         | id, name, status(enabled/disabled), filterRules(JSON), sampleRate, metricIds, createdBy                                                                                | 自动化评测   |
| Prompt           | id, name, content, metadata, description, version, createdBy                                                                                                           | Prompt       |
| PromptVersion    | id, promptId, version, content                                                                                                                                         | Prompt 版本  |
| TraceLog         | id, traceId, sessionId, userId, nodeId, messageId, input, output, inputTokens, outputTokens, ttft, status, sourceProject, calledAt                                     | 调用明细     |
| LeaderboardEntry | id, appId, evalSetId, metricId, score, rank                                                                                                                            | 排行榜       |
| User             | id, name, employeeId, role                                                                                                                                             | 用户         |

---

## 三、功能模块分解 (共 12 大模块)

### Task 1: 项目脚手架初始化

- 初始化 pnpm workspace 结构 (root + frontend + backend + shared)
- 配置 TypeScript、ESLint、Prettier
- 前端: Vite + React + Antd + Redux Toolkit + React Router
- 后端: NestJS CLI scaffold + TypeORM + PostgreSQL 配置
- 共享包: @eva/shared 类型定义
- Docker Compose: PostgreSQL + Redis

### Task 2: 通用布局与路由系统 (前端)

- **顶部导航**: Eva+ Logo + 三大模块入口（应用分析、应用可观测、应用评测）+ 用户头像
- **左侧边栏**: 根据当前顶部 Tab 动态渲染
  - 应用评测侧边栏: 项目选择器（下拉） + 搜索 + 评测(评测任务/评测集/评估指标/自动化评测) + Prompt(Prompt管理/Playground) + Leaderboard + AI应用管理 + 设置
  - 应用可观测侧边栏: 调用明细
- **面包屑导航**: 支持多级路由
- **路由表**: 所有页面路由配置，含懒加载

### Task 3: 后端通用基础设施

- NestJS 全局中间件: 请求日志、CORS、Helmet
- 全局异常过滤器 (HttpExceptionFilter)
- 响应拦截器 (统一返回格式)
- 认证 Guard (JWT)
- 分页管道/DTO
- TypeORM 数据库连接 + 所有 Entity 定义
- 种子数据脚本

### Task 4: AI 应用管理模块

**后端 API** — `modules/ai-application/`:

- CRUD: 列表(分页+搜索) / 创建 / 详情 / 更新 / 删除
- 版本管理: 创建版本 / 列表 / 详情
- 引用公共 Code Agent

**前端页面** — `pages/ai-application/`:

- 列表页: 卡片网格布局 (4列)，每张卡片含图标、名称、描述、版本、评测/代码仓库按钮
- 搜索栏 + "引用公共 Code Agent" / "新增 AI 应用" 按钮
- 新建/编辑 AI 应用 Modal
- 应用详情页

### Task 5: 评测任务模块

**后端 API** — `modules/eval-task/`:

- CRUD: 列表(分页+多条件筛选) / 创建 / 详情 / 复制 / 中止
- 任务执行引擎: Bull 队列处理评测任务，WebSocket 推送进度
- 日志查询
- 批量操作 (批量中止/删除)

**前端页面** — `pages/eval-task/`:

- 列表页: Table 含名称、ID(短hash)、状态Tag(成功-绿/运行中-蓝带进度/失败-红/中止-橙)、评测集Tag、任务组、评估模型、操作列(复制/中止/日志/更多)
- 筛选栏: 名称搜索 + 评测集下拉 + 任务状态下拉 + 筛选按钮 + 批量操作 + 图表视图切换
- 新建评测任务页面(三步骤表单):
  - Step1 评测模式: 评测类型选择(通用Agent/Code agent/音频agent)，评测模式选择(根据类型动态变化 — Code: 单个/批量; 通用: 简易/SDK; 音频: 固定)
  - Step2 基础配置: 任务名称 + 最大并发(默认10) + 评测集选择器 + 评测项选择器
  - Step3 评测对象配置: AI应用选择 + 版本选择 + 更多配置(可展开)；音频agent额外有数据集选择、配置文件选择、配置信息文本域
- 右侧帮助面板: "什么是AI应用评测?" + "操作指南"
- 任务详情/日志页

### Task 6: 评测集模块

**后端 API** — `modules/eval-set/`:

- CRUD: 列表(分页+筛选+批量勾选) / 创建(6种方式) / 详情 / 删除(含确认对话框)
- 数据项管理: 列表 / 新增 / 编辑 / 删除 / 批量导入导出
- 数据创建方式 API:
  - 本地上传: CSV 文件解析入库 (≤2万条)
  - ODPS 上传: 对接 ODPS 数据源 (project.table_name 格式, 支持分区条件, ≤2万条)
  - 线上数据提取: 从 Trace 数据按时间范围 + 粒度(trace/对话)自动获取
  - SDK 动态接入: 提供 SDK 接口，无条数限制
  - AI 智能生成: 基于示例CSV + 选择生成模型 + 配置数量(1-100) 自动扩充
  - 空白评测集: 手动创建列(默认 Input/Output)
- Code 类型: 关联 GitLab 仓库，支持引用公共评测集或自定义
- 标签管理: 新增/删除标签
- AI 扩写 / AI 数据加工接口

**前端页面** — `pages/eval-set/`:

- **列表页**:
  - Table 列: 名称、类型Tag(Code/文本)、描述、数据项数、上次评测时间、创建时间、创建人、操作列
  - 行操作按钮: 查看代码(Code类型) / 发起评测 / 删除
  - 支持分页、批量勾选、筛选
- **新建评测集 Modal** (顶部类型切换 + 动态表单):
  - 类型选择: 文本/多模态 | Code
  - 文本/多模态类型 — 数据创建方式卡片(横向滚动):
    - 本地上传: 评测集名称(必填) + 描述 + CSV文件上传区域
    - ODPS上传: 评测集名称 + ODPS表名输入(project.table_name) + 分区条件 + 数据限制提示(≤2万条)
    - 线上数据提取: 粒度选择(trace/对话) + 时间范围筛选
    - SDK动态接入: SDK配置说明
    - AI智能生成: 上传示例CSV + 选择生成模型 + 生成数量(1-100)
    - 空白评测集: 手动创建列管理器(默认Input/Output, 支持添加/删除列)
  - Code 类型:
    - 数据集创建方式: 引用公共评测集 | 自定义评测集
    - 表单: 公共评测集下拉选择(必填) + 评测集名称(必填, 仅字母数字下划线连字符) + 评测集描述 + 代码仓库地址(git@gitlab格式)
- **详情页** (Items 视图):
  - 面包屑: 评测集 > 评测集名 > Items
  - 元信息: 创建时间、GitLab仓库地址
  - 标签管理: 标签列表 + 「+」按钮添加标签(新增标签对话框)
  - 数据表格: case、difficulty、instruction、创建时间等列(动态列, 根据评测集定义)
  - 行操作: 查看代码 / 评测
  - 工具栏: 筛选 / 下载 / 复制 / 图表视图 / 视图切换(列表/卡片/紧凑) / 列管理(列显示/隐藏菜单) / AI扩写 / AI数据加工 / 新增数据项
  - 支持行勾选、手动同步
- **删除确认对话框**: 二次确认弹窗

### Task 7: 评估指标模块

**后端 API** — `modules/eval-metric/`:

- CRUD: 列表(分页, 个人/公共 Tab) / 创建(LLM|Code) / 详情 / 更新 / 删除
- Code 指标: 解析仓库指标

**前端页面** — `pages/eval-metric/`:

- 列表页: Tabs(个人指标/公共指标) + Table(名称、描述、类型、更新人、更新时间、创建人、创建时间、操作)
- 新建评估指标 Modal:
  - 指标类型切换: LLM类型指标 vs Code类型指标
  - LLM: 指标名称 + 指标描述 + Prompt编辑(System区域 + 选择模版链接)，支持变量语法
  - Code: 代码仓库(需授权提示) + 代码分支(default: master) + 解析仓库指标按钮

### Task 8: 自动化评测模块

**后端 API** — `modules/auto-eval/`:

- CRUD: 列表 / 创建 / 更新 / 删除
- 过滤采样规则引擎
- 调试运行: 按时间范围采样 + 评测规则调试

**前端页面** — `pages/auto-eval/`:

- 列表页: Table(名称、更新时间、创建人、创建时间、采样率、状态) + "创建新规则"按钮
- 创建页面(左右双栏布局):
  - 左栏 - 配置: 名称 + 任务状态Toggle + 过滤采样规则(过滤条件动态表单 + 采样率Slider 0-100%) + 评测规则(评估指标选择器: LLM指标/Code指标 Tab + 全部/公共/自定义 分类 + 搜索)
  - 右栏 - 调试: 调试过滤采样规则(时间范围选择 + TraceID/耗时表格) + 调试评测规则(input/output 预览)

### Task 9: Prompt 管理模块

**后端 API** — `modules/prompt/`:

- CRUD: 列表(分页+筛选) / 创建 / 详情 / 更新 / 删除
- 版本管理: 自动版本号递增

**前端页面** — `pages/prompt/`:

- 列表页: Table(名称、描述、版本、更新时间) + 筛选 + "新建Prompt"按钮
- 新建 Prompt Modal: 名称 + Prompt 文本域(支持 mustache 变量语法提示) + 元数据(可展开) + 描述(可展开)
- 详情页: 版本对比视图

### Task 10: Playground + Leaderboard + 设置

**Playground** — `pages/playground/`:

- 交互式测试界面，选择 AI 应用 + 版本 + Prompt，发送请求并展示结果
- 支持流式输出 (SSE/WebSocket)

**Leaderboard** — `pages/leaderboard/`:

- 排行榜展示，按评测集 + 指标维度排序
- 表格 + 可视化图表

**设置** — `pages/settings/`:

- 项目设置、成员管理、API Token 管理

### Task 11: 应用可观测 — 调用明细

**后端 API** — `modules/observability/`:

- 调用明细查询: 分页 + 多维筛选(时间范围/TraceId/会话ID/节点ID/messageId/状态/用户ID/输入输出关键词)
- Trace 详情
- 行为日志

**前端页面** — `pages/observability/`:

- 调用明细页:
  - 筛选栏: 时间范围选择(实时模式) + ID搜索 + 状态下拉 + 输入输出关键词 + 用户ID + 查询/重置按钮
  - Tabs: Trace / 行为日志
  - Table: 调用时间、来源项目、TraceId、会话ID、用户ID、首次token响应时间、输入Token数、输入、输出、操作
- Trace 详情页

### Task 12: 集成联调与优化

- 前后端 API 对接联调
- WebSocket 实时进度推送
- 全局错误处理与 loading 状态
- 权限控制 (RBAC)
- 响应式适配
- 构建优化与部署配置

---

## 四、执行顺序 (依赖链)

```
Task 1 (脚手架)
  ├── Task 2 (布局路由)  ──┐
  ├── Task 3 (后端基础)  ──┤
  └── shared types       ──┤
                            ├── Task 4 (AI应用) ─┐
                            ├── Task 5 (评测任务) ┤ (依赖 Task 4 的应用选择器)
                            ├── Task 6 (评测集)  ─┤
                            ├── Task 7 (评估指标) ┤
                            │                     ├── Task 8 (自动化评测, 依赖 Task 7 指标选择器)
                            ├── Task 9 (Prompt)   │
                            ├── Task 10 (Playground/Leaderboard/设置)
                            ├── Task 11 (可观测)  │
                            └───────────────────→ Task 12 (集成联调)
```

**并行组**:

- 第一轮: Task 1
- 第二轮: Task 2 + Task 3 (前后端基础并行)
- 第三轮: Task 4 + Task 6 + Task 7 + Task 9 + Task 11 (独立模块并行)
- 第四轮: Task 5 + Task 8 + Task 10 (依赖上游模块)
- 第五轮: Task 12 (全量集成)

---

## 五、关键技术决策

| 决策项   | 选择                      | 理由                                |
| -------- | ------------------------- | ----------------------------------- |
| 前端构建 | Vite                      | 开发体验优于 CRA，HMR 快            |
| 状态管理 | Redux Toolkit + RTK Query | 用户指定，RTK Query 简化 API 层     |
| UI 框架  | Ant Design 6              | 用户指定，企业级组件丰富            |
| ORM      | TypeORM                   | NestJS 生态首选，装饰器风格契合     |
| 数据库   | PostgreSQL                | 支持 JSON 字段，适合存储配置/元数据 |
| 任务队列 | Bull (Redis)              | 评测任务异步执行 + 进度追踪         |
| 实时通信 | Socket.IO                 | 评测进度推送、Playground 流式输出   |
| API 风格 | RESTful + WebSocket       | REST 覆盖 CRUD，WS 覆盖实时场景     |
