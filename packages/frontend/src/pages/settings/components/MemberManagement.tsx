import React, { useState } from 'react';
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  Space,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { AddMemberRequest } from '@eva/shared';
import {
  useAddMemberMutation,
  useGetMembersQuery,
  useRemoveMemberMutation,
} from '../../../services/settingsQueries';
import { getQueryErrorMessage } from '../../../services/evaApi';
import { formatDate } from '../../../utils/format';
import styles from '../SettingsPage.module.scss';

const { Option } = Select;

const ROLE_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  owner: { label: '所有者', className: 'eva-pillTagOrange', icon: <CrownOutlined /> },
  admin: { label: '管理员', className: 'eva-pillTagBlue', icon: <UserOutlined /> },
  member: { label: '成员', className: '', icon: <UserOutlined /> },
};

const AVATAR_COLORS = [
  '#6366f1', '#10b981', '#ff6b6b', '#ffa940', '#36cfc9',
  '#9254de', '#597ef7', '#f759ab', '#73d13d', '#40a9ff',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const MemberManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery();
  const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();

  const ownerCount = members.filter((m) => m.role === 'owner').length;
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const memberCount = members.filter((m) => m.role === 'member').length;

  const handleAddMember = async (values: AddMemberRequest) => {
    try {
      await addMember(values).unwrap();
      message.success('成员添加成功');
      setDrawerVisible(false);
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

  return (
    <>
      {/* 统计概览 */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{members.length}</span>
          <span className={styles.statLabel}>全部成员</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{ownerCount + adminCount}</span>
          <span className={styles.statLabel}>管理员</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{memberCount}</span>
          <span className={styles.statLabel}>普通成员</span>
        </div>
      </div>

      {/* 成员列表 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h3 className={styles.sectionTitle}>
              <TeamOutlined className={styles.sectionTitleIcon} />
              团队成员
            </h3>
            <p className={styles.sectionDescription}>管理项目的团队成员与权限</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            添加成员
          </Button>
        </div>

        <div className={styles.sectionBodyCompact}>
          {membersLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--eva-text-tertiary)' }}>
              加载中...
            </div>
          ) : members.length === 0 ? (
            <div className={styles.emptyState}>
              <TeamOutlined className={styles.emptyIcon} />
              <span className={styles.emptyText}>暂无团队成员</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>
                添加第一位成员
              </Button>
            </div>
          ) : (
            members.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.member;
              const avatarColor = getAvatarColor(member.name);

              return (
                <div key={member.id} className={styles.tokenCard}>
                  <div className={styles.tokenInfo}>
                    <div
                      className={styles.memberAvatar}
                      style={{ background: avatarColor }}
                    >
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.name}</span>
                      <Tooltip title={member.email}>
                        <span className={styles.memberEmail}>{member.email}</span>
                      </Tooltip>
                    </div>
                  </div>

                  <div className={styles.tokenMeta}>
                    <div className={styles.tokenMetaItem}>
                      <span className={styles.tokenMetaLabel}>加入时间</span>
                      <span className={styles.tokenMetaValue}>{formatDate(member.joinedAt)}</span>
                    </div>
                  </div>

                  <Space size="middle">
                    <Tag className={roleConfig.className} icon={roleConfig.icon}>
                      {roleConfig.label}
                    </Tag>
                    {member.role !== 'owner' && (
                      <Popconfirm
                        title="确定要移除该成员吗？"
                        description="移除后该成员将无法访问项目"
                        onConfirm={() => handleRemoveMember(member.id)}
                        okText="确定移除"
                        cancelText="取消"
                        okType="danger"
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          loading={isRemovingMember}
                        />
                      </Popconfirm>
                    )}
                  </Space>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 添加成员抽屉 */}
      <Drawer
        title="添加成员"
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        width={420}
        extra={
          <Space>
            <Button onClick={() => { setDrawerVisible(false); form.resetFields(); }}>
              取消
            </Button>
            <Button type="primary" onClick={() => form.submit()} loading={isAddingMember}>
              添加
            </Button>
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
            <Input placeholder="请输入成员邮箱地址" size="large" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="member"
          >
            <Select size="large">
              <Option value="admin">
                <Space>
                  <UserOutlined />
                  管理员 — 可管理项目设置和成员
                </Space>
              </Option>
              <Option value="member">
                <Space>
                  <UserOutlined />
                  成员 — 可查看和使用项目功能
                </Space>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default MemberManagement;
