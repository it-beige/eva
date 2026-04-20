# Eva+ AI 评测平台 — 企业级 UI 精细化优化方案

> **角色设定：** 阿里巴巴资深 UI 工程师，全页面 UI 精细化走查与优化
> **技术栈：** React + TypeScript + Ant Design 5 + SCSS Modules
> **设计原则：** 统一性、层次感、呼吸感、无障碍、响应式

---

## 一、全局设计系统（Design Token）

**问题：** App.scss 中缺少语义色；圆角值 4px/6px/8px/10px/12px/14px/26px/30px 混用无体系；间距随意使用无规范；阴影层级之外有大量硬编码 box-shadow。

**优化：**

```scss
// 统一圆角体系
--eva-radius-xs: 4px;    // Tag、Badge
--eva-radius-sm: 6px;    // 输入框、按钮、分页
--eva-radius-md: 8px;    // 菜单项、下拉菜单项
--eva-radius-lg: 12px;   // Card、Modal、统计卡片
--eva-radius-xl: 16px;   // Drawer、大面板
--eva-radius-2xl: 24px;  // 特殊大容器

// 统一间距体系（4px 基准）
--eva-space-1: 4px;
--eva-space-2: 8px;
--eva-space-3: 12px;
--eva-space-4: 16px;
--eva-space-5: 20px;
--eva-space-6: 24px;
--eva-space-8: 32px;
--eva-space-10: 40px;
--eva-space-12: 48px;

// 语义色补充
--eva-success: #34c759;
--eva-success-soft: #e6f9ef;
--eva-warning: #faad14;
--eva-warning-soft: #fff7e6;
--eva-error: #ff4d4f;
--eva-error-soft: #fff2f0;
--eva-info: #5a63ff;
--eva-info-soft: #eef0ff;
```

## 二、登录页（LoginPage）

- SVG 图表 opacity 0.15 → 0.25
- 表单面板 520px → min(560px, 42vw)
- 输入框圆角 10px → var(--eva-radius-md)
- 登录按钮去掉 translateY，仅用 shadow
- 品牌面板 padding 60px → clamp(32px, 5vw, 60px)

## 三、项目管理页（ProjectList）

- 统计卡片增加 will-change: transform
- 搜索栏 maxWidth 400px → min(460px, 100%)
- 项目名称列宽 200 → 240
- Demo 标签背景 #fafafa → #f0f0f0，文字 #8c8c8c → #595959
- 统计卡片圆角 → var(--eva-radius-lg)

## 四、评测任务页（EvalTask）

- 搜索框宽度 260px → 320px
- TaskStatusTag 运行中增加呼吸灯动画
- 详情页日志面板 max-height 480px → min(600px, 60vh)

## 五、评测集页（EvalSet）

- 搜索框宽度 260px → 320px

## 六、Prompt 管理页

- 搜索框宽度 280px → 320px
- 版本号增加 code 样式

## 七、评估指标页（EvalMetric）

- 搜索框宽度 280px → 320px
- dangerText 颜色 → var(--eva-error)

## 八、可观测性页（Observability）

- toolbar 补充完整样式

## 九、排行榜页（Leaderboard）

- topAppScore 颜色 → var(--eva-success)
- 增加过渡动画

## 十、Playground 页

- min-height 220px → 180px
- 小屏 gap 24px → 16px

## 十一、AI 应用页（AIApplication）

- 加载状态 height 400px → min-height 50vh
- 空状态 margin-top 80px → 60px

## 十二、AppShell / MainLayout

- MainLayout 深色样式统一为品牌色系
- 侧边栏圆角 26px → var(--eva-radius-lg)
- 内容容器圆角 30px → var(--eva-radius-lg)
