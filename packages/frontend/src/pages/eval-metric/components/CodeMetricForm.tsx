import React, { useState } from 'react';
import { Form, Input, Button, Typography, Space, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks/useRedux';
import { parseRepoMetrics } from '../../../store/evalMetricSlice';
import { CreateEvalMetricData } from '../../../services/evalMetricApi';

const { Text } = Typography;

interface CodeMetricFormProps {
  form: any;
  initialValues?: Partial<CreateEvalMetricData>;
}

const CodeMetricForm: React.FC<CodeMetricFormProps> = ({
  form,
  initialValues,
}) => {
  const dispatch = useAppDispatch();
  const [parsing, setParsing] = useState(false);

  const handleParseRepo = async () => {
    const codeRepoUrl = form.getFieldValue('codeRepoUrl');
    const codeBranch = form.getFieldValue('codeBranch') || 'master';

    if (!codeRepoUrl) {
      message.error('请先输入代码仓库地址');
      return;
    }

    setParsing(true);
    try {
      const result = await dispatch(
        parseRepoMetrics({ codeRepoUrl, codeBranch }),
      ).unwrap();
      message.success(result.message);
      // TODO: 处理解析出的指标列表
      console.log('解析出的指标:', result.metrics);
    } catch (error: any) {
      message.error(error.message || '解析仓库失败');
    } finally {
      setParsing(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        codeBranch: 'master',
        ...initialValues,
      }}
      autoComplete="off"
    >
      <Form.Item
        label={
          <Space>
            <span>代码仓库</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              需授权给Eva+公共账号：evaplus
            </Text>
          </Space>
        }
        name="codeRepoUrl"
        rules={[{ required: true, message: '请输入代码仓库地址' }]}
      >
        <Input placeholder="请选择或输入代码仓库" />
      </Form.Item>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 打开创建仓库指引
              console.log('帮我创建仓库');
            }}
          >
            没有代码仓库? 帮我创建 &gt;
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 打开 EVA+ 规范文档
              console.log('EVA+ 规范');
            }}
          >
            EVA+ 规范
          </a>
        </Space>
      </div>

      <Form.Item
        label="代码分支"
        name="codeBranch"
        rules={[{ required: true, message: '请输入代码分支' }]}
      >
        <Input
          placeholder="master"
          addonAfter={
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              loading={parsing}
              onClick={handleParseRepo}
              style={{ padding: 0, height: 'auto' }}
            >
              解析仓库指标
            </Button>
          }
        />
      </Form.Item>
    </Form>
  );
};

export default CodeMetricForm;
