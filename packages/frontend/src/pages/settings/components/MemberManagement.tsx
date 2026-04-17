import React, { useState } from 'react';
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Tag,
  Avatar,
  Popconfirm,
  Space,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AddMemberRequest, WorkspaceMember } from '@eva/shared';
import {
  useAddMemberMutation,
  useGetMembersQuery,
  useRemoveMemberMutation,
} from '../../../services/settingsQueries';
import { getQueryErrorMessage } from '../../../services/evaApi';

const { Option } = Select;

const ROLE_CONFIG = {
  owner: { label: '所有者', color: 'gold', icon: <CrownOutlined /> },
  admin: { label: '管理员', color: 'blue', icon: <UserOutlined /> },
  member: { label: '成员', color: 'default', icon: <UserOutlined /> },
};

const MemberManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery();
  const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [removeMember, { isLoading: isRemovingMember }] =
    useRemoveMemberMutation();
  const memberActionLoading = isAddingMember || isRemovingMember;

  const handleAddMember = async (values: AddMemberRequest) => {
    try {
      await addMember(values).unwrap();
      message.success('成员添加成功');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(getQueryErrorMessage(error as any, '添加成员失败'));
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await removeMember(id).unwrap();
      message.success('成员已移除');
    } catch (error) {
      message.error(getQueryErrorMessage(error as any, '移除成员失败'));
    }
  };

  const columns: ColumnsType<WorkspaceMember> = [
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
        if (record.role === 'owner') {
          return null;
        }

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

      <Drawer
        title="添加成员"
        open={modalVisible}
        onClose={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={420}
        extra={
          <Space>
            <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>取消</Button>
            <Button type="primary" onClick={() => form.submit()} loading={memberActionLoading}>添加</Button>
          </Space>
        }
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
      </Drawer>
    </div>
  );
};

export default MemberManagement;
