import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Popconfirm,
  Space,
  message,
  Tooltip,
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
      render: (name: string) => (
        <Space>
          <KeyOutlined className="text-gray-400" />
          <span className="font-medium">{name}</span>
        </Space>
      ),
    },
    {
      title: 'Token 值',
      dataIndex: 'maskedToken',
      key: 'maskedToken',
      render: (maskedToken: string) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{maskedToken}</code>
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
            <Tooltip title={expDate.toLocaleString('zh-CN')}>
              <Tag color="orange" icon={<WarningOutlined />}>
                即将过期
              </Tag>
            </Tooltip>
          );
        }

        return (
          <span className="text-gray-500 text-sm">
            {expDate.toLocaleDateString('zh-CN')}
          </span>
        );
      },
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (lastUsedAt: string | null) =>
        lastUsedAt ? (
          <span className="text-gray-500 text-sm">
            {new Date(lastUsedAt).toLocaleString('zh-CN')}
          </span>
        ) : (
          <span className="text-gray-400">从未使用</span>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        <span className="text-gray-500 text-sm">
          {new Date(createdAt).toLocaleDateString('zh-CN')}
        </span>
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
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600">共 {tokens.length} 个 Token</div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建 Token
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tokens}
        rowKey="id"
        loading={tokensLoading}
        pagination={false}
      />

      <Modal
        title="创建 API Token"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={tokenActionLoading}
        okText="创建"
        cancelText="取消"
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
      </Modal>

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
        <p className="mb-4 text-orange-500">
          请立即复制并保存此 Token，关闭后将无法再次查看完整内容。
        </p>
        <div className="bg-gray-100 p-4 rounded">
          <code className="break-all">{newlyCreatedToken}</code>
        </div>
      </Modal>
    </div>
  );
};

export default TokenManagement;
