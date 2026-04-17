import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  App as AntdApp,
  Button,
  Input,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { ProjectSource } from '@eva/shared';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchProjects, deleteProject, setPage, setPageSize } from '../../store/projectSlice';
import type { ProjectItem } from '../../services/projectApi';
import { getCurrentUser } from '../../auth/session';
import styles from './ProjectList.module.scss';

const { Title } = Typography;

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
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadData = useCallback(() => {
    dispatch(
      fetchProjects({
        page,
        pageSize,
        keyword: keyword || undefined,
        sortBy,
        sortOrder,
      }),
    );
  }, [dispatch, page, pageSize, keyword, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      content: '删除后将无法恢复，是否继续？',
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

  const canManageProject = (project: ProjectItem): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return project.admins.some((a) => a.id === currentUser.id);
  };

  const renderAdmins = (admins: ProjectItem['admins']) => {
    if (!admins || admins.length === 0) return '-';
    const display = admins.slice(0, 3).map((a) => a.name).join(', ');
    if (admins.length > 3) {
      const fullList = admins.map((a) => `${a.name}(${a.employeeId})`).join('\n');
      return (
        <Tooltip title={<pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{fullList}</pre>}>
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
      title: '项目ID',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 120,
      sorter: true,
      ellipsis: true,
      render: (id: string) => (
        <span className={styles.projectIdLink} onClick={() => navigate(`/projects/${id}`)}>
          {id.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 160,
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'pid/统一身份',
      dataIndex: 'pid',
      key: 'pid',
      width: 120,
    },
    {
      title: '应用code',
      dataIndex: 'appCode',
      key: 'appCode',
      width: 120,
      render: (v: string | null) => v || '-',
    },
    {
      title: '项目来源',
      dataIndex: 'source',
      key: 'source',
      width: 140,
      render: (source: string) => {
        const config = sourceTagConfig[source] || { label: source, className: styles.direct };
        return <Tag className={`${styles.sourceTag} ${config.className}`}>{config.label}</Tag>;
      },
    },
    {
      title: '项目描述',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: true,
      render: (v: string | null) => v || '-',
    },
    {
      title: '管理员',
      dataIndex: 'admins',
      key: 'admins',
      width: 160,
      render: renderAdmins,
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 80,
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
      render: (v: string) => {
        if (!v) return '-';
        return new Date(v).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: ProjectItem) => {
        if (!canManageProject(record)) return null;
        return (
          <Space>
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
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          项目列表
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/projects/create')}
        >
          创建项目
        </Button>
      </div>

      <div className={styles.searchBar}>
        <Input.Search
          placeholder="支持项目ID、pid、项目名称搜索"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) handleSearch('');
          }}
        />
      </div>

      <Table<ProjectItem>
        rowKey="projectId"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: 1400 }}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  );
};

export default ProjectListPage;
