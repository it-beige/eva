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
  Alert,
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
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchTokens,
  createToken,
  deleteToken,
  clearError,
  clearSuccessMessage,
  clearNewlyCreatedToken,
} from '../../../store/settingsSlice';
import { ApiToken } from '../../../services/settingsApi';

const TokenManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [tokenDisplayModal, setTokenDisplayModal] = useState(false);
  const dispatch = useAppDispatch();
  const {
    tokens,
    tokensLoading,
    tokenActionLoading,
    newlyCreatedToken,
    successMessage,
    error,
  } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchTokens());
  }, [dispatch]);

  useEffect(() => {
    if (newlyCreatedToken) {
      setCreateModalVisible(false);
      setTokenDisplayModal(true);
      form.resetFields();
    }
  }, [newlyCreatedToken, form]);

  const handleCreateToken = (values: { name: string; expiresIn?: number }) => {
    dispatch(createToken(values));
  };

  const handleDeleteToken = (id: string) => {
    dispatch(deleteToken(id));
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token).then(() => {
      message.success('Token 已复制到剪贴板');
    });
  };

  const columns: ColumnsType<ApiToken> = [
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
      {successMessage && (
        <Alert
          message={successMessage}
          type="success"
          showIcon
          closable
          className="mb-4"
          onClose={() => dispatch(clearSuccessMessage())}
        />
      )}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          className="mb-4"
          onClose={() => dispatch(clearError())}
        />
      )}

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

      {/* 创建 Token 弹窗 */}
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

      {/* Token 展示弹窗 */}
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
          dispatch(clearNewlyCreatedToken());
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
              dispatch(clearNewlyCreatedToken());
            }}
          >
            关闭
          </Button>,
        ]}
      >
        <Alert
          message="请立即复制保存！此 Token 仅展示一次，关闭后将无法再次查看"
          type="warning"
          showIcon
          className="mb-4"
        />
        {newlyCreatedToken && (
          <div className="bg-gray-50 border rounded p-4 font-mono text-sm break-all">
            {newlyCreatedToken}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TokenManagement;
