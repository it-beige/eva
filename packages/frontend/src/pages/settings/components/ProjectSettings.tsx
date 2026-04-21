import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { UpdateProjectRequest } from '@eva/shared';
import {
  useGetProjectSettingsQuery,
  useUpdateProjectSettingsMutation,
} from '../../../services/settingsQueries';
import { getQueryErrorMessage } from '../../../services/evaApi';
import { formatDateTime } from '../../../utils/format';

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

  return (
    <Card title="项目设置" loading={projectLoading}>
      {feedback?.type === 'success' && (
        <Alert
          message={feedback.message}
          type="success"
          showIcon
          closable
          className="mb-4"
          onClose={() => setFeedback(null)}
        />
      )}
      {feedback?.type === 'error' && (
        <Alert
          message={feedback.message}
          type="error"
          showIcon
          closable
          className="mb-4"
          onClose={() => setFeedback(null)}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" maxLength={100} showCount />
        </Form.Item>

        <Form.Item name="description" label="项目描述">
          <TextArea
            placeholder="请输入项目描述"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {project && (
          <div className="mb-4 text-gray-400 text-sm">
            <p>创建时间: {formatDateTime(project.createdAt)}</p>
            <p>最后更新: {formatDateTime(project.updatedAt)}</p>
          </div>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={projectSaving}
          >
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProjectSettings;
