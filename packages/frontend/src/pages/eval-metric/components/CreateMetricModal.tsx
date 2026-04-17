import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Card,
  Typography,
  Space,
  Radio,
  Button,
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
import styles from './CreateMetricModal.module.scss';

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
        await dispatch(
          updateEvalMetric({ id: editingMetric.id, data }),
        ).unwrap();
        message.success('更新成功');
      } else {
        await dispatch(createEvalMetric(data)).unwrap();
        message.success('创建成功');
      }

      handleCancel();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      }
    }
  };

  const handleTypeChange = (type: MetricType) => {
    setMetricType(type);
    const currentValues = form.getFieldsValue(['name', 'description']);
    form.resetFields();
    form.setFieldsValue(currentValues);
  };

  const metricTypeCards = [
    {
      type: MetricType.LLM,
      icon: <RobotOutlined className={styles.typeIconLlm} />,
      title: 'LLM类型指标',
      description: 'LLM充当裁判对输出质量，需要配置LLM的裁判定位。',
    },
    {
      type: MetricType.CODE,
      icon: <CodeOutlined className={styles.typeIconCode} />,
      title: 'Code类型指标',
      description: '通过代码对输出进行功能性或格式性检查。',
    },
  ];

  return (
    <Drawer
      title={editingMetric ? '编辑评估指标' : '新建评估指标'}
      open={visible}
      onClose={handleCancel}
      width={720}
      extra={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={editingMetric ? updating : creating}
          >
            确定
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item label="指标类型" required>
          <Radio.Group
            value={metricType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={styles.typeGroup}
          >
            <Space direction="vertical" size="middle" className={styles.typeGroup}>
              {metricTypeCards.map((card) => (
                <Card
                  key={card.type}
                  size="small"
                  className={`${styles.typeCard} ${metricType === card.type ? styles.typeCardActive : ''}`}
                  onClick={() => handleTypeChange(card.type)}
                >
                  <Radio value={card.type} className={styles.typeRadio}>
                    <Space align="start">
                      {card.icon}
                      <div>
                        <Text strong>{card.title}</Text>
                        <br />
                        <Text type="secondary" className={styles.typeDesc}>
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

        {metricType === MetricType.LLM ? (
          <LlmMetricForm form={form} />
        ) : (
          <CodeMetricForm form={form} />
        )}
      </Form>
    </Drawer>
  );
};

export default CreateMetricModal;
