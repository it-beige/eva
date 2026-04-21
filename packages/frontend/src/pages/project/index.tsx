import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  App as AntdApp,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  FolderOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
  ProjectOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { ProjectSource } from '@eva/shared';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchProjects, deleteProject, selectProject, setPage, setPageSize } from '../../store/projectSlice';
import type { ProjectItem } from '../../services/projectApi';
import { clearSession, getCurrentUser } from '../../auth/session';
import EnhancedTable, { type ColumnConfig } from '../../components/EnhancedTable';
import { formatDateTime } from '../../utils/format';
import styles from './ProjectList.module.scss';

const { Title, Text } = Typography;

const sourceTagConfig: Record<string, { label: string; className: string }> = {
  [ProjectSource.IDEALAB]: { label: 'IDEALAB', className: styles.idealab },
  [ProjectSource.IDEALAB_WORKSPACE]: { label: 'IDEALAB_WORKSPACE', className: styles.workspace },
  [ProjectSource.DEMO]: { label: 'DEMO', className: styles.demo },
  [ProjectSource.DIRECT]: { label: 'DIRECT', className: styles.direct },
  [ProjectSource.JOINT]: { label: 'JOINT', className: styles.joint },
};

const ProjectListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { message, modal } = AntdApp.useApp();
  const { list, total, page, pageSize, loading } = useAppSelector(
    (state) => state.project,
  );
  const currentUser = getCurrentUser();

  const [keyword, setKeyword] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(() => {
    dispatch(
      fetchProjects({
        page,
        pageSize,
        keyword: keyword || undefined,
        source: sourceFilter as ProjectSource | undefined,
        sortBy,
        sortOrder,
      }),
    );
  }, [dispatch, page, pageSize, keyword, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stats
  const stats = useMemo(() => {
    const sourceCount: Record<string, number> = {};
    let totalUsers = 0;
    for (const p of list) {
      sourceCount[p.source] = (sourceCount[p.source] || 0) + 1;
      totalUsers += p.userCount;
    }
    return { sourceCount, totalUsers };
  }, [list]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    dispatch(setPage(1));
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: any,
    sorter: SorterResult<ProjectItem> | SorterResult<ProjectItem>[],
  ) => {
    if (pagination.current) dispatch(setPage(pagination.current));
    if (pagination.pageSize) dispatch(setPageSize(pagination.pageSize));

    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s?.field) {
      setSortBy(s.field as string);
      setSortOrder(s.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const handleDelete = (project: ProjectItem) => {
    modal.confirm({
      title: '确认删除项目？',
      content: `删除项目「${project.projectName}」后将无法恢复，是否继续？`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteProject(project.projectId)).unwrap();
          message.success('删除成功');
          loadData();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleEnterProject = (project: ProjectItem) => {
    dispatch(selectProject(project));
    navigate('/eval/tasks');
  };

  const canManageProject = (project: ProjectItem): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return project.admins.some((a) => a.id === currentUser.id);
  };

  const renderAdmins = (admins: ProjectItem['admins']) => {
    if (!admins || admins.length === 0) return <Text type="secondary">-</Text>;
    const display = admins.slice(0, 2).map((a) => a.name).join('、');
    if (admins.length > 2) {
      const fullList = admins.map((a) => `${a.name}(${a.employeeId})`).join('\n');
      return (
        <Tooltip title={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{fullList}</pre>}>
          <span className={styles.adminList}>
            {display}
            <span className={styles.moreAdmins}> 等{admins.length}人</span>
          </span>
        </Tooltip>
      );
    }
    return display;
  };

  const columns: ColumnsType<ProjectItem> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      ellipsis: { showTitle: false },
      render: (name: string, record: ProjectItem) => (
        <Tooltip title={name} placement="topLeft">
          <Space direction="vertical" size={0}>
            <a
              className={styles.projectIdLink}
              style={{ background: 'none', padding: 0, fontFamily: 'inherit', fontSize: 14, fontWeight: 500 }}
              onClick={() => handleEnterProject(record)}
            >
              {name}
            </a>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.pid}</Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '项目来源',
      dataIndex: 'source',
      key: 'source',
      width: 130,
      render: (source: string) => {
        const config = sourceTagConfig[source] || { label: source, className: styles.direct };
        return <Tag className={`${styles.sourceTag} ${config.className}`}>{config.label}</Tag>;
      },
    },
    {
      title: '应用Code',
      dataIndex: 'appCode',
      key: 'appCode',
      width: 120,
      render: (v: string | null) => v
        ? <code className={styles.codeBlock}>{v}</code>
        : <Text type="secondary">未绑定</Text>,
    },
    {
      title: '项目描述',
      dataIndex: 'description',
      key: 'description',
      width: 220,
      ellipsis: { showTitle: false },
      render: (v: string | null) => (
        <Tooltip title={v || '-'} placement="topLeft">
          <span>{v || <Text type="secondary">-</Text>}</span>
        </Tooltip>
      ),
    },
    {
      title: '管理员',
      dataIndex: 'admins',
      key: 'admins',
      width: 140,
      render: renderAdmins,
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 120,
      align: 'center',
      sorter: true,
      render: (count: number) => (
        <span style={{ fontWeight: 600, color: count > 0 ? 'var(--eva-text)' : 'var(--eva-text-tertiary)' }}>
          {count}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      sorter: true,
      render: (v: string) => {
        if (!v) return '-';
        return (
          <Text style={{ fontSize: 13, color: 'var(--eva-text-secondary)' }}>
            {formatDateTime(v)}
          </Text>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: ProjectItem) => (
        <Space size={12}>
          <Button
            type="link"
            size="small"
            icon={<LoginOutlined />}
            className={styles.enterBtn}
            onClick={() => handleEnterProject(record)}
          >
            进入
          </Button>
          {canManageProject(record) && (
            <>
              <Button
                type="link"
                size="small"
                className={styles.actionLink}
                onClick={() => navigate(`/projects/${record.projectId}/edit`)}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                className={styles.deleteLink}
                danger
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const sourceOptions = [
    { value: ProjectSource.IDEALAB, label: 'IDEALAB' },
    { value: ProjectSource.IDEALAB_WORKSPACE, label: 'IDEALAB Workspace' },
    { value: ProjectSource.DIRECT, label: '直接创建' },
    { value: ProjectSource.JOINT, label: '联合创建' },
    { value: ProjectSource.DEMO, label: 'Demo' },
  ];

  // 列配置
  const columnConfigs: ColumnConfig[] = useMemo(
    () => [
      { key: 'projectName', title: '项目名称', defaultVisible: true },
      { key: 'source', title: '项目来源', defaultVisible: true },
      { key: 'appCode', title: '应用Code', defaultVisible: true },
      { key: 'description', title: '项目描述', defaultVisible: true },
      { key: 'admins', title: '管理员', defaultVisible: true },
      { key: 'userCount', title: '用户数', defaultVisible: true },
      { key: 'createTime', title: '创建时间', defaultVisible: true },
      { key: 'action', title: '操作', defaultVisible: true },
    ],
    [],
  );

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLogo}>
          <div className={styles.logoIcon}>E</div>
          <span className={styles.logoName}>Eva+</span>
        </div>
        <div className={styles.topBarRight}>
          {currentUser && <Text className={styles.userName}>{currentUser.name}</Text>}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出
          </Button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <Title level={3} className={styles.title}>
              项目管理
            </Title>
            <Text className={styles.subtitle}>选择一个项目进入工作台，或创建新项目开始评测</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/projects/create')}
            className={styles.createBtn}
          >
            创建项目
          </Button>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <ProjectOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{total}</div>
              <div className={styles.statLabel}>项目总数</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <TeamOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.totalUsers}</div>
              <div className={styles.statLabel}>总用户数</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <AppstoreOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.sourceCount[ProjectSource.IDEALAB] || 0}</div>
              <div className={styles.statLabel}>关联应用</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
              <FolderOutlined />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats.sourceCount[ProjectSource.JOINT] || 0}</div>
              <div className={styles.statLabel}>联合项目</div>
            </div>
          </div>
        </div>

        <div className="eva-filterBar">
          <div className="eva-filterBarMain">
            <div className="eva-filterField">
              <span className="eva-filterFieldLabel">搜索</span>
              <Input.Search
                placeholder="搜索项目ID、pid、项目名称"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={(e) => {
                  if (!e.target.value) handleSearch('');
                }}
                className={styles.projectSearchInput}
              />
            </div>
            <div className="eva-filterField">
              <span className="eva-filterFieldLabel">项目来源</span>
              <Select
                placeholder="全部来源"
                allowClear
                className={styles.projectSourceSelect}
                options={sourceOptions}
                value={sourceFilter}
                onChange={(v) => {
                  setSourceFilter(v);
                  dispatch(setPage(1));
                }}
              />
            </div>
          </div>
        </div>

        <div className={`eva-contentCard ${styles.tableSection}`}>
          <div className="eva-contentCardBody">
            <EnhancedTable<ProjectItem>
              rowKey="projectId"
              columns={columns}
              columnConfigs={columnConfigs}
              dataSource={list}
              loading={loading}
              fillHeight
              scroll={{ x: 1200 }}
              onTableChange={handleTableChange}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (t) => `共 ${t} 个项目`,
                style: { padding: '12px 16px', margin: 0 },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectListPage;
