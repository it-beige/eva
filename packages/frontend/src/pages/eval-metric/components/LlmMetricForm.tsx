import React from 'react';
import { Form, Input, Typography } from 'antd';
import { CreateEvalMetricData } from '../../../services/evalMetricApi';

const { TextArea } = Input;
const { Text } = Typography;

interface LlmMetricFormProps {
  form: any;
  initialValues?: Partial<CreateEvalMetricData>;
}

const LlmMetricForm: React.FC<LlmMetricFormProps> = ({
  form,
  initialValues,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      autoComplete="off"
    >
      <Form.Item
        label="指标名称"
        name="name"
        rules={[{ required: true, message: '请输入指标名称' }]}
      >
        <Input placeholder="指标名称" />
      </Form.Item>

      <Form.Item label="指标描述" name="description">
        <TextArea
          rows={3}
          placeholder="描述"
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item
        label="Prompt"
        name="prompt"
        rules={[{ required: true, message: '请输入 Prompt' }]}
        style={{ marginBottom: 0 }}
      >
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}>
          {/* Prompt Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fafafa',
              borderRadius: '6px 6px 0 0',
            }}
          >
            <Text strong style={{ fontSize: 14 }}>
              System
            </Text>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // TODO: 打开模板选择弹窗
                console.log('选择模板');
              }}
              style={{ fontSize: 14 }}
            >
              选择模版
            </a>
          </div>

          {/* Prompt TextArea */}
          <TextArea
            rows={12}
            placeholder="输入评估裁判的定义内容。建议包括角色、评估维度、评分标准、评分清单、输出格式、变量（按{{name}}的形式输入变量）等信息"
            style={{
              border: 'none',
              borderRadius: '0 0 6px 6px',
              resize: 'none',
            }}
            value={form.getFieldValue('prompt')}
            onChange={(e) => form.setFieldsValue({ prompt: e.target.value })}
          />
        </div>
      </Form.Item>
    </Form>
  );
};

export default LlmMetricForm;
