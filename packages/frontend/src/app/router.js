import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import MainLayout from '../layouts/MainLayout';
import ObservabilityLayout from '../layouts/ObservabilityLayout';
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
// Loading fallback component
const PageLoading = () => (_jsx("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }, children: _jsx(Spin, { size: "large" }) }));
// Wrapper for lazy loaded components
const withSuspense = (Component) => (_jsx(Suspense, { fallback: _jsx(PageLoading, {}), children: _jsx(Component, {}) }));
export const router = createBrowserRouter([
    {
        path: '/',
        element: _jsx(Navigate, { to: "/eval/tasks", replace: true }),
    },
    {
        path: '/eval',
        element: _jsx(MainLayout, {}),
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
                element: withSuspense(SettingsPage),
            },
        ],
    },
    {
        path: '/observability',
        element: _jsx(ObservabilityLayout, {}),
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
        element: withSuspense(AnalyticsPage),
    },
]);
