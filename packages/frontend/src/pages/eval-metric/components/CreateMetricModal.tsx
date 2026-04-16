import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Card,
  Typography,
  Space,
  Radio,
  message,
} from 'antd';
import {
  RobotOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import LlmMetricForm from './LlmMetricForm';
import CodeMetricForm from './CodeMetricForm';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import {
  createEvalMetric,
  updateEvalMetric,
  hideCreateModal,
  setEditingMetric,
} from '../../../store/evalMetricSlice';
import { MetricType, EvalMetric } from '@eva/shared';

const { Text } = Typography;

interface CreateMetricModalProps {
  visible: boolean;
  editingMetric: EvalMetric | null;
}

const CreateMetricModal: React.FC<CreateMetricModalProps> = ({
  visible,
  editingMetric,
}) => {
  const dispatch = useAppDispatch();
  const { creating, updating, currentScope } = useAppSelector(
    (state) => state.evalMetric,
  );

  const [form] = Form.useForm();
  const [metricType, setMetricType] = useState<MetricType>(MetricType.LLM);

  // 当编辑时，设置表单初始值
  useEffect(() => {
    if (visible && editingMetric) {
      setMetricType(editingMetric.type);
      form.setFieldsValue({
        name: editingMetric.name,
        description: editingMetric.description,
        prompt: editingMetric.prompt,
        codeRepoUrl: editingMetric.codeRepoUrl,
        codeBranch: editingMetric.codeBranch || 'master',
      });
    } else if (visible) {
      // 新建时重置表单
      setMetricType(MetricType.LLM);
      form.resetFields();
    }
  }, [visible, editingMetric, form]);

  const handleCancel = () => {
    dispatch(hideCreateModal());
    dispatch(setEditingMetric(null));
    form.resetFields();
    setMetricType(MetricType.LLM);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        ...values,
        type: metricType,
        scope: currentScope,
      };

      if (editingMetric) {
        // 更新
        await dispatch(
          updateEvalMetric({ id: editingMetric.id, data }),
        ).unwrap();
        message.success('更新成功');
      } else {
        // 创建
        await dispatch(createEvalMetric(data)).unwrap();
        message.success('创建成功');
      }

      handleCancel();
    } catch (error: any) {
      // 表单验证失败或请求失败
      if (error.message) {
        message.error(error.message);
      }
    }
  };

  const handleTypeChange = (type: MetricType) => {
    setMetricType(type);
    // 切换类型时重置表单，但保留名称和描述
    const currentValues = form.getFieldsValue(['name', 'description']);
    form.resetFields();
    form.setFieldsValue(currentValues);
  };

  const metricTypeCards = [
    {
      type: MetricType.LLM,
      icon: <RobotOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: 'LLM类型指标',
      description: 'LLM充当裁判对输出质量，需要配置LLM的裁判定位。',
    },
    {
      type: MetricType.CODE,
      icon: <CodeOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: 'Code类型指标',
      description: '通过代码对输出进行功能性或格式性检查。',
    },
  ];

  return (
    <Modal
      title={editingMetric ? '编辑评估指标' : '新建评估指标'}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={720}
      confirmLoading={editingMetric ? updating : creating}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" autoComplete="off">
        {/* 指标类型选择 */}
        <Form.Item
          label="指标类型"
          required
          style={{ marginBottom: 24 }}
        >
          <Radio.Group
            value={metricType}
            onChange={(e) => handleTypeChange(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {metricTypeCards.map((card) => (
                <Card
                  key={card.type}
                  size="small"
                  style={{
                    cursor: 'pointer',
                    borderColor:
                      metricType === card.type ? '#1890ff' : '#d9d9d9',
                    backgroundColor:
                      metricType === card.type ? '#e6f7ff' : '#fff',
                  }}
                  onClick={() => handleTypeChange(card.type)}
                >
                  <Radio value={card.type} style={{ width: '100%' }}>
                    <Space align="start">
                      {card.icon}
                      <div>
                        <Text strong>{card.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {card.description}
                        </Text>
                      </div>
                    </Space>
                  </Radio>
                </Card>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        {/* 根据类型显示不同的表单 */}
        {metricType === MetricType.LLM ? (
          <LlmMetricForm form={form} />
        ) : (
          <CodeMetricForm form={form} />
        )}
      </Form>
    </Modal>
  );
};

export default CreateMetricModal;
