import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Avatar,
  Popconfirm,
  Space,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchMembers,
  addMember,
  removeMember,
  clearError,
  clearSuccessMessage,
} from '../../../store/settingsSlice';
import { Member } from '../../../services/settingsApi';

const { Option } = Select;

const ROLE_CONFIG = {
  owner: { label: '所有者', color: 'gold', icon: <CrownOutlined /> },
  admin: { label: '管理员', color: 'blue', icon: <UserOutlined /> },
  member: { label: '成员', color: 'default', icon: <UserOutlined /> },
};

const MemberManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { members, membersLoading, memberActionLoading, successMessage, error } =
    useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  const handleAddMember = (values: { email: string; role: 'owner' | 'admin' | 'member' }) => {
    dispatch(addMember(values)).then((action) => {
      if (addMember.fulfilled.match(action)) {
        setModalVisible(false);
        form.resetFields();
      }
    });
  };

  const handleRemoveMember = (id: string) => {
    dispatch(removeMember(id));
  };

  const columns: ColumnsType<Member> = [
    {
      title: '成员',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: '#1890ff' }}
            icon={<UserOutlined />}
          >
            {record.name[0]}
          </Avatar>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: keyof typeof ROLE_CONFIG) => {
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (time: string) => new Date(time).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        if (record.role === 'owner') return null;
        return (
          <Popconfirm
            title="确定要移除该成员吗？"
            onConfirm={() => handleRemoveMember(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={memberActionLoading}
            >
              移除
            </Button>
          </Popconfirm>
        );
      },
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
        <div className="text-gray-600">共 {members.length} 位成员</div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          添加成员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={membersLoading}
        pagination={false}
      />

      <Modal
        title="添加成员"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={memberActionLoading}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleAddMember}>
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="member"
          >
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="member">成员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberManagement;
