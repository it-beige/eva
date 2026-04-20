import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { UserRole } from '@eva/shared';
import MainLayout from '../layouts/MainLayout';
import ObservabilityLayout from '../layouts/ObservabilityLayout';
import PageLoading from '../components/feedback/PageLoading';
import AuthGuard from '../auth/AuthGuard';
import PermissionGuard from '../auth/PermissionGuard';
import ProjectGuard from '../auth/ProjectGuard';

// Lazy load all page components
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
const LoginPage = lazy(() => import('../pages/login/index'));
const ProjectListPage = lazy(() => import('../pages/project/index'));
const CreateProjectPage = lazy(() => import('../pages/project/CreateProject'));
const EditProjectPage = lazy(() => import('../pages/project/EditProject'));

// Wrapper for lazy loaded components
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    {
      path: '/login',
      element: withSuspense(LoginPage),
    },
    {
      path: '/projects',
      element: (
        <AuthGuard>
          {withSuspense(ProjectListPage)}
        </AuthGuard>
      ),
    },
    {
      path: '/projects/create',
      element: (
        <AuthGuard>
          {withSuspense(CreateProjectPage)}
        </AuthGuard>
      ),
    },
    {
      path: '/projects/:id/edit',
      element: (
        <AuthGuard>
          {withSuspense(EditProjectPage)}
        </AuthGuard>
      ),
    },
    {
      path: '/eval',
      element: (
        <AuthGuard>
          <ProjectGuard>
            <MainLayout />
          </ProjectGuard>
        </AuthGuard>
      ),
      children: [
        {
          path: 'tasks',
          element: withSuspense(EvalTaskListPage),
        },
        {
          path: 'tasks/create',
          element: withSuspense(CreateEvalTaskPage),
        },
        {
          path: 'tasks/:id',
          element: withSuspense(EvalTaskDetailPage),
        },
        {
          path: 'datasets',
          element: withSuspense(EvalSetListPage),
        },
        {
          path: 'datasets/create',
          element: withSuspense(CreateEvalSetPage),
        },
        {
          path: 'datasets/:id',
          element: withSuspense(EvalSetDetailPage),
        },
        {
          path: 'metrics',
          element: withSuspense(EvalMetricListPage),
        },
        {
          path: 'auto-eval',
          element: withSuspense(AutoEvalListPage),
        },
        {
          path: 'auto-eval/create',
          element: withSuspense(CreateAutoEvalPage),
        },
        {
          path: 'prompts',
          element: withSuspense(PromptListPage),
        },
        {
          path: 'prompts/:id',
          element: withSuspense(PromptDetailPage),
        },
        {
          path: 'playground',
          element: withSuspense(PlaygroundPage),
        },
        {
          path: 'leaderboard',
          element: withSuspense(LeaderboardPage),
        },
        {
          path: 'apps',
          element: withSuspense(AIApplicationPage),
        },
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
    {
      path: '/observability',
      element: (
        <AuthGuard>
          <ProjectGuard>
            <ObservabilityLayout />
          </ProjectGuard>
        </AuthGuard>
      ),
      children: [
        {
          path: 'traces',
          element: withSuspense(ObservabilityPage),
        },
        {
          path: 'traces/:id',
          element: withSuspense(TraceDetailPage),
        },
      ],
    },
    {
      path: '/analytics',
      element: (
        <AuthGuard>
          <ProjectGuard>
            <MainLayout />
          </ProjectGuard>
        </AuthGuard>
      ),
      children: [
        {
          path: '',
          element: withSuspense(AnalyticsPage),
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/login" replace />,
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);
