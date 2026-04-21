import EnhancedTable from '../../../components/EnhancedTable';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Popconfirm,
  Space,
  message,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  KeyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ApiTokenResponse, CreateTokenRequest } from '@eva/shared';
import {
  useCreateTokenMutation,
  useDeleteTokenMutation,
  useGetTokensQuery,
} from '../../../services/settingsQueries';
import { getQueryErrorMessage } from '../../../services/evaApi';
import { formatDate, formatDateTime } from '../../../utils/format';

const { Text } = Typography;

const TokenManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [tokenDisplayModal, setTokenDisplayModal] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const { data: tokens = [], isLoading: tokensLoading } = useGetTokensQuery();
  const [createToken, { isLoading: creatingToken }] = useCreateTokenMutation();
  const [deleteToken, { isLoading: deletingToken }] = useDeleteTokenMutation();
  const tokenActionLoading = creatingToken || deletingToken;

  useEffect(() => {
    if (newlyCreatedToken) {
      setCreateModalVisible(false);
      setTokenDisplayModal(true);
      form.resetFields();
    }
  }, [newlyCreatedToken, form]);

  const handleCreateToken = async (values: CreateTokenRequest) => {
    try {
      const result = await createToken(values).unwrap();
      message.success('Token 创建成功');
      setNewlyCreatedToken(result.token);
    } catch (error) {
      message.error(getQueryErrorMessage(error as any, '创建 Token 失败'));
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteToken(id).unwrap();
      message.success('Token 已删除');
    } catch (error) {
      message.error(getQueryErrorMessage(error as any, '删除 Token 失败'));
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token).then(() => {
      message.success('Token 已复制到剪贴板');
    });
  };

  const columns: ColumnsType<ApiTokenResponse> = [
    {
      title: 'Token 名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: { showTitle: false },
      render: (name: string) => (
        <Space>
          <KeyOutlined style={{ color: '#a0a9b8' }} />
          <Tooltip title={name} placement="topLeft">
            <Text strong className="eva-table-cell-text" style={{ maxWidth: 140 }}>{name}</Text>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Token 值',
      dataIndex: 'maskedToken',
      key: 'maskedToken',
      width: 200,
      ellipsis: { showTitle: false },
      render: (maskedToken: string) => (
        <Tooltip title={maskedToken} placement="topLeft">
          <code className="eva-table-cell-text" style={{ fontSize: 12, background: '#f5f7fa', padding: '2px 8px', borderRadius: 4, maxWidth: '100%' }}>
            {maskedToken}
          </code>
        </Tooltip>
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt: string | null) => {
        if (!expiresAt) {
          return <Tag color="green">永不过期</Tag>;
        }

        const expDate = new Date(expiresAt);
        const isExpired = expDate < new Date();
        const isExpiringSoon =
          !isExpired &&
          expDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

        if (isExpired) {
          return <Tag color="red">已过期</Tag>;
        }

        if (isExpiringSoon) {
          return (
            <Tooltip title={formatDateTime(expiresAt)}>
              <Tag color="orange" icon={<WarningOutlined />}>
                即将过期
              </Tag>
            </Tooltip>
          );
        }

        return (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatDate(expiresAt)}
          </Text>
        );
      },
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (lastUsedAt: string | null) =>
        lastUsedAt ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatDateTime(lastUsedAt)}
          </Text>
        ) : (
          <Text style={{ color: '#a0a9b8', fontSize: 12 }}>从未使用</Text>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDate(createdAt)}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="确定要删除该 Token 吗？"
          description="删除后将无法恢复，请确认"
          onConfirm={() => handleDeleteToken(record.id)}
          okText="删除"
          cancelText="取消"
          okType="danger"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={tokenActionLoading}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">共 {tokens.length} 个 Token</Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建 Token
        </Button>
      </div>

      <EnhancedTable
        columns={columns}
        dataSource={tokens}
        rowKey="id"
        loading={tokensLoading}
        pagination={false}
      />

      <Drawer
        title="创建 API Token"
        open={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={420}
        extra={
          <Space>
            <Button onClick={() => { setCreateModalVisible(false); form.resetFields(); }}>取消</Button>
            <Button type="primary" onClick={() => form.submit()} loading={tokenActionLoading}>创建</Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreateToken}>
          <Form.Item
            name="name"
            label="Token 名称"
            rules={[{ required: true, message: '请输入 Token 名称' }]}
          >
            <Input placeholder="例如：生产环境 Token" maxLength={50} />
          </Form.Item>

          <Form.Item name="expiresIn" label="过期时间（天）">
            <InputNumber
              placeholder="留空表示永不过期"
              min={1}
              max={365}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Token 创建成功</span>
          </Space>
        }
        open={tokenDisplayModal}
        onCancel={() => {
          setTokenDisplayModal(false);
          setNewlyCreatedToken(null);
        }}
        footer={[
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => newlyCreatedToken && handleCopyToken(newlyCreatedToken)}
          >
            复制 Token
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setTokenDisplayModal(false);
              setNewlyCreatedToken(null);
            }}
          >
            关闭
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="warning">
            请立即复制并保存此 Token，关闭后将无法再次查看完整内容。
          </Text>
        </div>
        <div style={{ background: '#f5f7fa', padding: 16, borderRadius: 8, wordBreak: 'break-all' }}>
          <code>{newlyCreatedToken}</code>
        </div>
      </Modal>
    </div>
  );
};

export default TokenManagement;
