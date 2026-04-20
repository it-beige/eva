import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserRole } from '@eva/shared';
import MainLayout from '../layouts/MainLayout';
import ObservabilityLayout from '../layouts/ObservabilityLayout';
import PageLoading from '../components/feedback/PageLoading';
import AuthGuard from '../auth/AuthGuard';
import PermissionGuard from '../auth/PermissionGuard';
import ProjectGuard from '../auth/ProjectGuard';

// ─── Lazy-loaded pages ─────────────────────────────────────
const LoginPage = lazy(() => import('../pages/login/index'));
const ProjectListPage = lazy(() => import('../pages/project/index'));
const CreateProjectPage = lazy(() => import('../pages/project/CreateProject'));
const EditProjectPage = lazy(() => import('../pages/project/EditProject'));
const EvalTaskListPage = lazy(() => import('../pages/eval-task/index'));
const CreateEvalTaskPage = lazy(() => import('../pages/eval-task/CreateEvalTask'));
const EvalTaskDetailPage = lazy(() => import('../pages/eval-task/EvalTaskDetail'));
const EvalSetListPage = lazy(() => import('../pages/eval-set/index'));
const CreateEvalSetPage = lazy(() => import('../pages/eval-set/CreateEvalSet'));
const EvalSetDetailPage = lazy(() => import('../pages/eval-set/EvalSetDetail'));
const EvalMetricListPage = lazy(() => import('../pages/eval-metric/index'));
const AutoEvalListPage = lazy(() => import('../pages/auto-eval/index'));
const CreateAutoEvalPage = lazy(() => import('../pages/auto-eval/CreateAutoEval'));
const PromptListPage = lazy(() => import('../pages/prompt/index'));
const PromptDetailPage = lazy(() => import('../pages/prompt/PromptDetail'));
const PlaygroundPage = lazy(() => import('../pages/playground/index'));
const LeaderboardPage = lazy(() => import('../pages/leaderboard/index'));
const AIApplicationPage = lazy(() => import('../pages/ai-application/index'));
const SettingsPage = lazy(() => import('../pages/settings/index'));
const ObservabilityPage = lazy(() => import('../pages/observability/index'));
const TraceDetailPage = lazy(() => import('../pages/observability/TraceDetail'));
const AnalyticsPage = lazy(() => import('../pages/analytics/index'));

// ─── Suspense wrapper ──────────────────────────────────────
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

/**
 * 路由架构说明：
 *
 *  /login                → 公开页面，无 AuthGuard
 *  /projects/**          → AuthGuard (布局路由，只挂载一次)
 *  /eval/**              → AuthGuard > ProjectGuard > MainLayout
 *  /observability/**     → AuthGuard > ProjectGuard > ObservabilityLayout
 *  /analytics/**         → AuthGuard > ProjectGuard > MainLayout
 *
 * 关键设计：
 * 1. AuthGuard 作为布局路由，子路由切换时不会重新挂载/重新校验
 * 2. ProjectGuard 只包裹需要选中项目的模块
 * 3. 所有页面组件均 lazy load + Suspense
 */
export const router = createBrowserRouter([
  // ─── 公开路由 ────────────────────────────────────────
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },

  // ─── 认证路由（统一 AuthGuard） ─────────────────────
  {
    element: <AuthGuard />,
    children: [
      // ── 项目管理（无需选中项目） ──────────────────
      {
        path: '/projects',
        element: withSuspense(ProjectListPage),
      },
      {
        path: '/projects/create',
        element: withSuspense(CreateProjectPage),
      },
      {
        path: '/projects/:id/edit',
        element: withSuspense(EditProjectPage),
      },

      // ── 评测工作台（需选中项目 + MainLayout） ────
      {
        path: '/eval',
        element: (
          <ProjectGuard>
            <MainLayout />
          </ProjectGuard>
        ),
        children: [
          { path: 'tasks', element: withSuspense(EvalTaskListPage) },
          { path: 'tasks/create', element: withSuspense(CreateEvalTaskPage) },
          { path: 'tasks/:id', element: withSuspense(EvalTaskDetailPage) },
          { path: 'datasets', element: withSuspense(EvalSetListPage) },
          { path: 'datasets/create', element: withSuspense(CreateEvalSetPage) },
          { path: 'datasets/:id', element: withSuspense(EvalSetDetailPage) },
          { path: 'metrics', element: withSuspense(EvalMetricListPage) },
          { path: 'auto-eval', element: withSuspense(AutoEvalListPage) },
          { path: 'auto-eval/create', element: withSuspense(CreateAutoEvalPage) },
          { path: 'prompts', element: withSuspense(PromptListPage) },
          { path: 'prompts/:id', element: withSuspense(PromptDetailPage) },
          { path: 'playground', element: withSuspense(PlaygroundPage) },
          { path: 'leaderboard', element: withSuspense(LeaderboardPage) },
          { path: 'apps', element: withSuspense(AIApplicationPage) },
          {
            path: 'settings',
            element: (
              <PermissionGuard requiredRole={UserRole.ADMIN}>
                {withSuspense(SettingsPage)}
              </PermissionGuard>
            ),
          },
        ],
      },

      // ── 可观测（需选中项目 + ObservabilityLayout）
      {
        path: '/observability',
        element: (
          <ProjectGuard>
            <ObservabilityLayout />
          </ProjectGuard>
        ),
        children: [
          { path: 'traces', element: withSuspense(ObservabilityPage) },
          { path: 'traces/:id', element: withSuspense(TraceDetailPage) },
        ],
      },

      // ── 应用分析（需选中项目 + MainLayout） ──────
      {
        path: '/analytics',
        element: (
          <ProjectGuard>
            <MainLayout />
          </ProjectGuard>
        ),
        children: [
          { path: '', element: withSuspense(AnalyticsPage) },
        ],
      },
    ],
  },

  // ─── 兜底 ────────────────────────────────────────────
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
