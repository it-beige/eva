import React from 'react';
import { Drawer, Form, Input, Select, Button, Space } from 'antd';
import type { ImportPublicAgentRequest } from '@eva/shared';
import styles from './ImportPublicModal.module.scss';

const { Option } = Select;

const PUBLIC_AGENTS = [
  {
    name: 'SWE-Agent',
    gitRepoUrl: 'https://github.com/princeton-nlp/SWE-agent',
    description: 'SWE-agent 接入',
  },
  {
    name: 'OpenHands',
    gitRepoUrl: 'https://github.com/All-Hands-AI/OpenHands',
    description: 'All Hands AI 开源 Agent',
  },
  {
    name: 'Devin',
    gitRepoUrl: 'https://github.com/AI-Engineer-Foundation/devin',
    description: 'AI 软件工程师 Agent',
  },
  {
    name: 'AutoCodeRover',
    gitRepoUrl: 'https://github.com/nus-apr/auto-code-rover',
    description: '自动代码修复 Agent',
  },
  {
    name: 'CodeAct',
    gitRepoUrl: 'https://github.com/xingyaoww/code-act',
    description: 'CodeAct Agent',
  },
  {
    name: 'AgentCoder',
    gitRepoUrl: 'https://github.com/huangd1999/AgentCoder',
    description: '代码生成 Agent',
  },
];

interface ImportPublicModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: ImportPublicAgentRequest) => void;
  projectId?: string;
  loading: boolean;
}

const ImportPublicModal: React.FC<ImportPublicModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  projectId,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleAgentChange = (value: string) => {
    const agent = PUBLIC_AGENTS.find((a) => a.name === value);
    if (agent) {
      form.setFieldsValue({
        name: agent.name,
        gitRepoUrl: agent.gitRepoUrl,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData: ImportPublicAgentRequest = {
        name: values.name,
        gitRepoUrl: values.gitRepoUrl,
        ...(projectId ? { projectId } : {}),
      };
      onSubmit(submitData);
    } catch (error) {
      // 表单验证失败
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Drawer
      title="引用公共Code Agent"
      open={visible}
      onClose={handleCancel}
      width={560}
      extra={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            引用
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item label="选择公共Agent">
          <Select
            placeholder="请选择要引用的公共Agent"
            onChange={handleAgentChange}
            allowClear
          >
            {PUBLIC_AGENTS.map((agent) => (
              <Option key={agent.name} value={agent.name}>
                <div>
                  <div className={styles.agentName}>{agent.name}</div>
                  <div className={styles.agentDesc}>{agent.description}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="应用名称"
          rules={[
            { required: true, message: '请输入应用名称' },
            { max: 255, message: '应用名称不能超过255个字符' },
          ]}
        >
          <Input placeholder="请输入应用名称" />
        </Form.Item>

        <Form.Item
          name="gitRepoUrl"
          label="Git仓库地址"
          rules={[
            { required: true, message: '请输入Git仓库地址' },
            { max: 500, message: 'Git仓库地址不能超过500个字符' },
          ]}
        >
          <Input placeholder="请输入Git仓库地址" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ImportPublicModal;
