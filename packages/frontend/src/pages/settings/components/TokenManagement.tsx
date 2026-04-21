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
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  KeyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { CreateTokenRequest } from '@eva/shared';
import {
  useCreateTokenMutation,
  useDeleteTokenMutation,
  useGetTokensQuery,
} from '../../../services/settingsQueries';
import { getQueryErrorMessage } from '../../../services/evaApi';
import { formatDate } from '../../../utils/format';
import styles from '../SettingsPage.module.scss';

const TokenManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [tokenDisplayModal, setTokenDisplayModal] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const { data: tokens = [], isLoading: tokensLoading } = useGetTokensQuery();
  const [createToken, { isLoading: creatingToken }] = useCreateTokenMutation();
  const [deleteToken, { isLoading: deletingToken }] = useDeleteTokenMutation();

  const activeTokens = tokens.filter((t) => {
    if (!t.expiresAt) return true;
    return new Date(t.expiresAt) > new Date();
  });
  const expiredTokens = tokens.length - activeTokens.length;

  useEffect(() => {
    if (newlyCreatedToken) {
      setCreateDrawerVisible(false);
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

  const getTokenStatus = (expiresAt: string | null): { tag: React.ReactNode; iconClass: string } => {
    if (!expiresAt) {
      return {
        tag: <Tag color="green">永不过期</Tag>,
        iconClass: styles.tokenIconDefault,
      };
    }
    const expDate = new Date(expiresAt);
    const isExpired = expDate < new Date();
    const isExpiringSoon = !isExpired && expDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    if (isExpired) {
      return {
        tag: <Tag color="red">已过期</Tag>,
        iconClass: styles.tokenIconExpired,
      };
    }
    if (isExpiringSoon) {
      return {
        tag: <Tag color="orange" icon={<WarningOutlined />}>即将过期</Tag>,
        iconClass: styles.tokenIconWarning,
      };
    }
    return {
      tag: <Tag color="green">{formatDate(expiresAt)} 到期</Tag>,
      iconClass: styles.tokenIconDefault,
    };
  };

  return (
    <>
      {/* 统计概览 */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{tokens.length}</span>
          <span className={styles.statLabel}>全部 Token</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{activeTokens.length}</span>
          <span className={styles.statLabel}>有效</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{expiredTokens}</span>
          <span className={styles.statLabel}>已过期</span>
        </div>
      </div>

      {/* Token 列表 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h3 className={styles.sectionTitle}>
              <KeyOutlined className={styles.sectionTitleIcon} />
              API Token
            </h3>
            <p className={styles.sectionDescription}>用于 API 调用认证的访问凭证</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateDrawerVisible(true)}
          >
            创建 Token
          </Button>
        </div>

        <div className={styles.sectionBodyCompact}>
          {tokensLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--eva-text-tertiary)' }}>
              加载中...
            </div>
          ) : tokens.length === 0 ? (
            <div className={styles.emptyState}>
              <KeyOutlined className={styles.emptyIcon} />
              <span className={styles.emptyText}>暂无 API Token</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerVisible(true)}>
                创建第一个 Token
              </Button>
            </div>
          ) : (
            tokens.map((token) => {
              const { tag, iconClass } = getTokenStatus(token.expiresAt);

              return (
                <div key={token.id} className={styles.tokenCard}>
                  <div className={styles.tokenInfo}>
                    <div className={`${styles.tokenIconWrapper} ${iconClass}`}>
                      <KeyOutlined />
                    </div>
                    <div className={styles.tokenDetails}>
                      <span className={styles.tokenName}>{token.name}</span>
                      <span className={styles.tokenMasked}>{token.maskedToken}</span>
                    </div>
                  </div>

                  <div className={styles.tokenMeta}>
                    <div className={styles.tokenMetaItem}>
                      <span className={styles.tokenMetaLabel}>状态</span>
                      {tag}
                    </div>
                    <div className={styles.tokenMetaItem}>
                      <span className={styles.tokenMetaLabel}>最后使用</span>
                      <span className={styles.tokenMetaValue}>
                        {token.lastUsedAt ? formatDate(token.lastUsedAt) : '从未使用'}
                      </span>
                    </div>
                    <div className={styles.tokenMetaItem}>
                      <span className={styles.tokenMetaLabel}>创建时间</span>
                      <span className={styles.tokenMetaValue}>{formatDate(token.createdAt)}</span>
                    </div>
                  </div>

                  <Popconfirm
                    title="确定要删除该 Token 吗？"
                    description="删除后将无法恢复，请确认"
                    onConfirm={() => handleDeleteToken(token.id)}
                    okText="删除"
                    cancelText="取消"
                    okType="danger"
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={deletingToken}
                    />
                  </Popconfirm>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 创建 Token 抽屉 */}
      <Drawer
        title="创建 API Token"
        open={createDrawerVisible}
        onClose={() => {
          setCreateDrawerVisible(false);
          form.resetFields();
        }}
        width={420}
        extra={
          <Space>
            <Button onClick={() => { setCreateDrawerVisible(false); form.resetFields(); }}>
              取消
            </Button>
            <Button type="primary" onClick={() => form.submit()} loading={creatingToken}>
              创建
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreateToken}>
          <Form.Item
            name="name"
            label="Token 名称"
            rules={[{ required: true, message: '请输入 Token 名称' }]}
          >
            <Input placeholder="例如：生产环境 Token" maxLength={50} size="large" />
          </Form.Item>

          <Form.Item
            name="expiresIn"
            label="过期时间（天）"
            extra="留空表示永不过期，建议设置合理的过期时间以保障安全"
          >
            <InputNumber
              placeholder="留空表示永不过期"
              min={1}
              max={365}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* Token 创建成功弹窗 */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: 'var(--eva-success)' }} />
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
        <div className={styles.tokenWarning}>
          <WarningOutlined style={{ marginTop: 2, flexShrink: 0 }} />
          <span>请立即复制并保存此 Token，关闭后将无法再次查看完整内容。</span>
        </div>
        <div className={styles.tokenDisplay}>
          <code>{newlyCreatedToken}</code>
        </div>
      </Modal>
    </>
  );
};

export default TokenManagement;
