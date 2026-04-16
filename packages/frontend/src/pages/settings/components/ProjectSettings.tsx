import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchProjectSettings,
  updateProjectSettings,
  clearSuccessMessage,
  clearError,
} from '../../../store/settingsSlice';

const { TextArea } = Input;

const ProjectSettings: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { project, projectLoading, projectSaving, successMessage, error } =
    useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchProjectSettings());
  }, [dispatch]);

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
      });
    }
  }, [project, form]);

  const handleSubmit = (values: { name: string; description?: string }) => {
    dispatch(updateProjectSettings(values));
  };

  return (
    <Card title="项目设置" loading={projectLoading}>
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
            <p>创建时间: {new Date(project.createdAt).toLocaleString('zh-CN')}</p>
            <p>最后更新: {new Date(project.updatedAt).toLocaleString('zh-CN')}</p>
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
