import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Slider,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Breadcrumb,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  createAutoEval,
  setCreateFormName,
  setCreateFormStatus,
  setCreateFormFilterRules,
  setCreateFormSampleRate,
  setCreateFormMetricIds,
  setCreateFormMetricType,
  resetCreateForm,
  clearDebugResults,
} from '../../store/autoEvalSlice';
import { AutoEvalStatus, MetricType } from '@eva/shared';
import FilterRuleBuilder from './components/FilterRuleBuilder';
import MetricSelector from './components/MetricSelector';
import DebugFilterPanel from './components/DebugFilterPanel';
import DebugEvalPanel from './components/DebugEvalPanel';
import type { FilterRules } from '../../services/autoEvalApi';

const { Title, Text } = Typography;

const CreateAutoEvalPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const { createForm, creating } = useAppSelector((state) => state.autoEval);
  const [debugDateRange, setDebugDateRange] = useState<[string, string] | null>(null);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      
      if (createForm.metricIds.length === 0) {
        message.error('请至少选择一个评估指标');
        return;
      }

      await dispatch(
        createAutoEval({
          name: createForm.name,
          status: createForm.status,
          filterRules: createForm.filterRules,
          sampleRate: createForm.sampleRate,
          metricIds: createForm.metricIds,
        }),
      ).unwrap();

      message.success('创建成功');
      dispatch(resetCreateForm());
      dispatch(clearDebugResults());
      navigate('/auto-eval');
    } catch (error) {
      message.error('创建失败，请检查表单');
    }
  };

  // 处理取消
  const handleCancel = () => {
    dispatch(resetCreateForm());
    dispatch(clearDebugResults());
    navigate('/auto-eval');
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 面包屑 */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/auto-eval')}>自动化评测</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>创建自动化评测</Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={24}>
        {/* 左栏 - 配置 */}
        <Col span={14}>
          <Card>
            <div style={{ borderLeft: '3px solid #5B21B6', paddingLeft: 12, marginBottom: 24 }}>
              <Title level={5} style={{ margin: 0 }}>
                新建自动化评测
              </Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: createForm.name,
                status: createForm.status === AutoEvalStatus.ENABLED,
                sampleRate: createForm.sampleRate,
              }}
            >
              {/* 名称 */}
              <Form.Item
                label="名称"
                name="name"
                rules={[{ required: true, message: '请输入名称' }]}
              >
                <Input
                  placeholder="请输入自动化评测名称"
                  value={createForm.name}
                  onChange={(e) => dispatch(setCreateFormName(e.target.value))}
                />
              </Form.Item>

              {/* 任务状态 */}
              <Form.Item
                label="任务状态"
                name="status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                  checked={createForm.status === AutoEvalStatus.ENABLED}
                  onChange={(checked) =>
                    dispatch(
                      setCreateFormStatus(
                        checked ? AutoEvalStatus.ENABLED : AutoEvalStatus.DISABLED,
                      ),
                    )
                  }
                />
              </Form.Item>

              <Divider />

              {/* 1. 过滤采样规则 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ borderLeft: '3px solid #5B21B6', paddingLeft: 12, marginBottom: 16 }}>
                  <Title level={5} style={{ margin: 0 }}>1. 过滤采样规则</Title>
                </div>

                {/* 过滤条件 */}
                <Form.Item label="过滤条件">
                  <FilterRuleBuilder
                    value={createForm.filterRules}
                    onChange={(value) => dispatch(setCreateFormFilterRules(value))}
                  />
                </Form.Item>

                {/* 采样率 */}
                <Form.Item
                  label="采样率"
                  required
                  rules={[{ required: true, message: '请设置采样率' }]}
                >
                  <Row align="middle">
                    <Col flex="auto">
                      <Slider
                        min={0}
                        max={100}
                        value={createForm.sampleRate}
                        onChange={(val) => dispatch(setCreateFormSampleRate(val))}
                      />
                    </Col>
                    <Col flex="80px" style={{ marginLeft: 16 }}>
                      <InputNumber
                        min={0}
                        max={100}
                        value={createForm.sampleRate}
                        onChange={(val) =>
                          dispatch(setCreateFormSampleRate(val || 0))
                        }
                        formatter={(val) => `${val}%`}
                        parser={(val) =>
                          parseInt((val || '').replace('%', ''), 10) || 0
                        }
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Row>
                </Form.Item>
              </div>

              <Divider />

              {/* 2. 评测规则 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ borderLeft: '3px solid #5B21B6', paddingLeft: 12, marginBottom: 16 }}>
                  <Title level={5} style={{ margin: 0 }}>2. 评测规则</Title>
                </div>

                <Form.Item
                  label="选择评估指标"
                  required
                  rules={[{ required: true, message: '请选择评估指标' }]}
                >
                  <MetricSelector
                    value={createForm.metricIds}
                    onChange={(value) => dispatch(setCreateFormMetricIds(value))}
                    selectedType={createForm.selectedMetricType}
                    onTypeChange={(type) => dispatch(setCreateFormMetricType(type))}
                  />
                </Form.Item>
              </div>

              {/* 底部按钮 */}
              <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                <Row gutter={16}>
                  <Col>
                    <Button type="primary" onClick={handleSubmit} loading={creating}>
                      创建
                    </Button>
                  </Col>
                  <Col>
                    <Button onClick={handleCancel}>取消</Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右栏 - 调试 */}
        <Col span={10}>
          <Card>
            <div style={{ borderLeft: '3px solid #5B21B6', paddingLeft: 12, marginBottom: 24 }}>
              <Title level={5} style={{ margin: 0 }}>
                调试
              </Title>
            </div>

            {/* 1. 调试过滤采样规则 */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>1. 调试过滤采样规则</Text>
              </div>
              <DebugFilterPanel
                filterRules={createForm.filterRules}
                sampleRate={createForm.sampleRate}
              />
            </div>

            <Divider />

            {/* 2. 调试评测规则 */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>2. 调试评测规则 <span style={{ color: '#faad14' }}>★</span></Text>
              </div>
              <DebugEvalPanel
                filterRules={createForm.filterRules}
                sampleRate={createForm.sampleRate}
                dateRange={debugDateRange}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateAutoEvalPage;
