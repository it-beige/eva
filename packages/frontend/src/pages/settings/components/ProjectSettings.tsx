import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import {
  SaveOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { UpdateProjectRequest } from '@eva/shared';
import {
  useGetProjectSettingsQuery,
  useUpdateProjectSettingsMutation,
} from '../../../services/settingsQueries';
import { getQueryErrorMessage } from '../../../services/evaApi';
import { formatDateTime } from '../../../utils/format';
import styles from '../SettingsPage.module.scss';

const { TextArea } = Input;

const ProjectSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const { data: project, isLoading: projectLoading } =
    useGetProjectSettingsQuery();
  const [updateProjectSettings, { isLoading: projectSaving }] =
    useUpdateProjectSettingsMutation();

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
      });
    }
  }, [project, form]);

  // 自动清除反馈
  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSubmit = async (values: UpdateProjectRequest) => {
    try {
      await updateProjectSettings(values).unwrap();
      setFeedback({ type: 'success', message: '项目设置已保存' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getQueryErrorMessage(error as any, '更新项目设置失败'),
      });
    }
  };

  if (projectLoading) {
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h3 className={styles.sectionTitle}>
              <SettingOutlined className={styles.sectionTitleIcon} />
              基本信息
            </h3>
            <p className={styles.sectionDescription}>配置项目的基本信息和描述</p>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--eva-text-tertiary)' }}>
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 基本信息 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h3 className={styles.sectionTitle}>
              <SettingOutlined className={styles.sectionTitleIcon} />
              基本信息
            </h3>
            <p className={styles.sectionDescription}>配置项目的基本信息和描述</p>
          </div>
        </div>
        <div className={styles.sectionBody}>
          {feedback?.type === 'success' && (
            <div className={styles.successBanner}>
              <CheckCircleOutlined />
              {feedback.message}
            </div>
          )}

          {project && (
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  创建时间
                </span>
                <span className={styles.metaValue}>{formatDateTime(project.createdAt)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>
                  <EditOutlined style={{ marginRight: 4 }} />
                  最后更新
                </span>
                <span className={styles.metaValue}>{formatDateTime(project.updatedAt)}</span>
              </div>
            </div>
          )}

          <div className={styles.formContainer}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input
                  placeholder="请输入项目名称"
                  maxLength={100}
                  showCount
                  size="large"
                />
              </Form.Item>

              <Form.Item name="description" label="项目描述">
                <TextArea
                  placeholder="请输入项目描述，帮助团队成员了解项目用途"
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={projectSaving}
                  size="large"
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectSettings;
