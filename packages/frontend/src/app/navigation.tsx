import {
  AppstoreOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  RadarChartOutlined,
  SettingOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { matchPath } from 'react-router-dom';
import type { ReactNode } from 'react';
import { UserRole } from '@eva/shared';
import type { TopNavType } from '../store/uiSlice';

export type ShellMenuItem =
  | {
      type: 'group';
      label: string;
      children: Array<{
        key: string;
        label: string;
        icon: ReactNode;
        requiredRole?: UserRole;
      }>;
    }
  | {
      type: 'item';
      key: string;
      label: string;
      icon: ReactNode;
      requiredRole?: UserRole;
    };

export type PageMeta = {
  title: string;
  description: string;
  section: TopNavType;
  breadcrumbs: Array<{ title: string; path?: string }>;
};

export const topNavItems = [
  { key: 'analytics', label: '应用分析', path: '/analytics' },
  { key: 'observability', label: '应用可观测', path: '/observability/traces' },
  { key: 'evaluation', label: '应用评测', path: '/eval/tasks' },
] as const;

export const workspaceOptions = [
  { value: 'project1', label: 'AI评测 · 战略部项目' },
  { value: 'project2', label: 'AI评测 · 产品部项目' },
  { value: 'project3', label: 'AI评测 · 公共能力平台' },
];

export const evaluationMenuItems: ShellMenuItem[] = [
  {
    type: 'group',
    label: '评测体系',
    children: [
      { key: '/eval/tasks', icon: <CheckCircleOutlined />, label: '评测任务' },
      { key: '/eval/datasets', icon: <DatabaseOutlined />, label: '评测集' },
      { key: '/eval/metrics', icon: <BarChartOutlined />, label: '评估指标' },
      { key: '/eval/auto-eval', icon: <PlayCircleOutlined />, label: '自动化评测' },
    ],
  },
  {
    type: 'item',
    key: '/eval/prompts',
    icon: <FileTextOutlined />,
    label: 'Prompt 管理',
  },
  {
    type: 'item',
    key: '/eval/playground',
    icon: <ExperimentOutlined />,
    label: 'Playground',
  },
  {
    type: 'item',
    key: '/eval/leaderboard',
    icon: <TrophyOutlined />,
    label: 'Leaderboard',
  },
  {
    type: 'item',
    key: '/eval/apps',
    icon: <AppstoreOutlined />,
    label: 'AI 应用管理',
  },
  {
    type: 'item',
    key: '/eval/settings',
    icon: <SettingOutlined />,
    label: '设置',
    requiredRole: UserRole.ADMIN,
  },
];

export const observabilityMenuItems: ShellMenuItem[] = [
  {
    type: 'group',
    label: '观测中心',
    children: [
      { key: '/observability/traces', icon: <FileSearchOutlined />, label: '调用明细' },
    ],
  },
];

const pageMetaRegistry: Array<{ pattern: string; meta: PageMeta }> = [
  {
    pattern: '/analytics',
    meta: {
      title: '应用分析',
      description: '集中查看核心业务表现、评测趋势与模型效果，建立管理层和业务方统一使用的经营视图。',
      section: 'analytics',
      breadcrumbs: [{ title: '应用分析' }],
    },
  },
  {
    pattern: '/observability/traces',
    meta: {
      title: '调用明细',
      description: '通过结构化 Trace、行为日志与上下文检索，快速定位异常请求、模型抖动和用户体验问题。',
      section: 'observability',
      breadcrumbs: [{ title: '应用可观测' }, { title: '调用明细' }],
    },
  },
  {
    pattern: '/observability/traces/:id',
    meta: {
      title: 'Trace 详情',
      description: '查看单次请求的输入输出、模型链路、日志与诊断结论，用于问题复盘和根因分析。',
      section: 'observability',
      breadcrumbs: [
        { title: '应用可观测', path: '/observability/traces' },
        { title: '调用明细', path: '/observability/traces' },
        { title: 'Trace 详情' },
      ],
    },
  },
  {
    pattern: '/eval/tasks',
    meta: {
      title: '评测任务',
      description: '组织 Prompt、模型与数据集的评测任务，统一管理运行状态、结果追踪与批量操作流程。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: '评测任务' }],
    },
  },
  {
    pattern: '/eval/tasks/create',
    meta: {
      title: '新建评测任务',
      description: '面向研发和算法团队配置评测任务的输入、评测方式和执行策略。',
      section: 'evaluation',
      breadcrumbs: [
        { title: '应用评测' },
        { title: '评测任务', path: '/eval/tasks' },
        { title: '新建评测任务' },
      ],
    },
  },
  {
    pattern: '/eval/tasks/:id',
    meta: {
      title: '任务详情',
      description: '查看单个评测任务的运行日志、指标进展与结果对比，为问题定位和结果复盘提供依据。',
      section: 'evaluation',
      breadcrumbs: [
        { title: '应用评测' },
        { title: '评测任务', path: '/eval/tasks' },
        { title: '任务详情' },
      ],
    },
  },
  {
    pattern: '/eval/datasets',
    meta: {
      title: '评测集',
      description: '管理用于评测的测试数据集、版本和数据类型，确保评测口径一致且可复用。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: '评测集' }],
    },
  },
  {
    pattern: '/eval/metrics',
    meta: {
      title: '评估指标',
      description: '维护规则型、代码型和大模型评估指标，形成可复用的质量衡量标准。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: '评估指标' }],
    },
  },
  {
    pattern: '/eval/auto-eval',
    meta: {
      title: '自动化评测',
      description: '配置自动触发的回归评测链路，让应用迭代时可以持续追踪质量变化。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: '自动化评测' }],
    },
  },
  {
    pattern: '/eval/prompts',
    meta: {
      title: 'Prompt 管理',
      description: '集中维护 Prompt 版本、发布状态和实验记录，建立清晰的 Prompt 资产库。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: 'Prompt 管理' }],
    },
  },
  {
    pattern: '/eval/playground',
    meta: {
      title: 'Playground',
      description: '用于快速验证 Prompt、参数和模型组合表现，为正式评测前的探索提供实验空间。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: 'Playground' }],
    },
  },
  {
    pattern: '/eval/leaderboard',
    meta: {
      title: 'Leaderboard',
      description: '汇总多模型或多版本的结果表现，帮助团队从统一排名视角比较能力差异。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: 'Leaderboard' }],
    },
  },
  {
    pattern: '/eval/apps',
    meta: {
      title: 'AI 应用管理',
      description: '管理接入评测体系的 AI 应用、业务描述与环境配置，形成企业级应用台账。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: 'AI 应用管理' }],
    },
  },
  {
    pattern: '/eval/settings',
    meta: {
      title: '设置',
      description: '统一管理项目成员、令牌、权限和系统级配置，满足团队协作和治理需求。',
      section: 'evaluation',
      breadcrumbs: [{ title: '应用评测' }, { title: '设置' }],
    },
  },
];

export const getTopNavFromPath = (pathname: string): TopNavType => {
  if (pathname.startsWith('/analytics')) {
    return 'analytics';
  }

  if (pathname.startsWith('/observability')) {
    return 'observability';
  }

  return 'evaluation';
};

export const getPageMeta = (pathname: string): PageMeta => {
  const matched = pageMetaRegistry.find(({ pattern }) =>
    matchPath({ path: pattern, end: true }, pathname)
  );

  return (
    matched?.meta ?? {
      title: 'Eva Console',
      description: '企业级 AI 评测与可观测工作台。',
      section: getTopNavFromPath(pathname),
      breadcrumbs: [{ title: 'Eva Console' }],
    }
  );
};

export const analyticsEntry = {
  key: '/analytics',
  label: '应用分析',
  icon: <RadarChartOutlined />,
};
