import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Space,
  Radio,
  Tooltip,
} from 'antd';
import {
  SendOutlined,
  ClearOutlined,
  RobotOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchPrompts } from '../../../store/promptSlice';
import {
  useGetApplicationVersionsQuery,
  useGetApplicationsQuery,
} from '../../../services/applicationQueries';

const { TextArea } = Input;
const { Option } = Select;

interface PlaygroundConfigProps {
  onSubmit: (values: {
    appId: string;
    appVersion: string;
    promptType: 'select' | 'custom';
    promptId?: string;
    promptContent?: string;
    input: string;
  }) => void;
  onClear: () => void;
  loading: boolean;
}

const PlaygroundConfig: React.FC<PlaygroundConfigProps> = ({
  onSubmit,
  onClear,
  loading,
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [promptType, setPromptType] = useState<'select' | 'custom'>('select');
  const [selectedApp, setSelectedApp] = useState<string>();
  const { data: applicationsData } = useGetApplicationsQuery({
    page: 1,
    pageSize: 100,
  });
  const applications = applicationsData?.items ?? [];
  const { data: appVersions = [] } = useGetApplicationVersionsQuery(
    selectedApp ?? '',
    { skip: !selectedApp },
  );

  const { prompts } = useAppSelector((state) => state.prompt);

  useEffect(() => {
    dispatch(fetchPrompts({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  const handleAppChange = (value: string) => {
    setSelectedApp(value);
    form.setFieldValue('appVersion', undefined);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Card title="配置">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          promptType: 'select',
        }}
      >
        {/* AI 应用选择 */}
        <Form.Item
          name="appId"
          label="AI 应用"
          rules={[{ required: true, message: '请选择 AI 应用' }]}
        >
          <Select
            placeholder="选择 AI 应用"
            onChange={handleAppChange}
            showSearch
            optionFilterProp="children"
          >
            {applications.map((app) => (
              <Option key={app.id} value={app.id}>
                <Space>
                  <RobotOutlined />
                  {app.name}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* 版本选择 */}
        <Form.Item
          name="appVersion"
          label="版本"
          rules={[{ required: true, message: '请选择版本' }]}
        >
          <Select
            placeholder="选择版本"
            disabled={!selectedApp}
          >
            {appVersions.map((version) => (
              <Option key={version.id} value={version.version}>
                {version.version}
              </Option>
            ))}
            {!appVersions.length && (
              <Option value="latest">最新版本</Option>
            )}
          </Select>
        </Form.Item>

        {/* Prompt 选择方式 */}
        <Form.Item name="promptType" label="Prompt">
          <Radio.Group
            value={promptType}
            onChange={(e) => setPromptType(e.target.value)}
          >
            <Radio.Button value="select">选择已有</Radio.Button>
            <Radio.Button value="custom">自定义</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Prompt 选择 */}
        {promptType === 'select' ? (
          <Form.Item
            name="promptId"
            rules={[{ required: true, message: '请选择 Prompt' }]}
          >
            <Select placeholder="选择 Prompt" showSearch optionFilterProp="children">
              {prompts.map((prompt) => (
                <Option key={prompt.id} value={prompt.id}>
                  <Space>
                    <FileTextOutlined />
                    {prompt.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item
            name="promptContent"
            rules={[{ required: true, message: '请输入 Prompt 内容' }]}
          >
            <TextArea
              placeholder="输入自定义 Prompt 内容..."
              rows={4}
              showCount
              maxLength={4000}
            />
          </Form.Item>
        )}

        {/* 输入内容 */}
        <Form.Item
          name="input"
          label="输入内容"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <TextArea
            placeholder="输入您的问题或内容..."
            rows={8}
            showCount
            maxLength={8000}
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Tooltip title="清空">
              <Button
                icon={<ClearOutlined />}
                onClick={onClear}
                disabled={loading}
              >
                清空
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              发送
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PlaygroundConfig;
