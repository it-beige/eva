import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  message,
  Collapse,
  InputNumber,
  Space,
} from 'antd';
import { AppDispatch, RootState } from '../../app/store';
import { createEvalTask } from '../../store/evalTaskSlice';
import { fetchEvalSets } from '../../store/evalSetSlice';
import { fetchApplications } from '../../store/aiApplicationSlice';
import { aiApplicationApi } from '../../services/aiApplicationApi';
import EvalTypeSelector from './components/EvalTypeSelector';
import EvalModeSelector from './components/EvalModeSelector';
import HelpPanel from './components/HelpPanel';
import { EvalType, AppVersion } from '@eva/shared';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface FormValues {
  name: string;
  evalType: EvalType;
  evalMode?: string;
  maxConcurrency: number;
  evalSetId?: string;
  evalItemId?: string;
  appId?: string;
  appVersion?: string;
  datasetId?: string;
  configFileId?: string;
  configInfo?: string;
}

const CreateEvalTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm<FormValues>();

  const { loading } = useSelector((state: RootState) => state.evalTask);
  const { evalSets } = useSelector((state: RootState) => state.evalSet);
  const { applications } = useSelector((state: RootState) => state.aiApplication);

  const [evalType, setEvalType] = useState<EvalType>(EvalType.GENERAL);
  const [evalMode, setEvalMode] = useState<string | undefined>();
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>();
  const [appVersions, setAppVersions] = useState<AppVersion[]>([]);
  const [extraConfigExpanded, setExtraConfigExpanded] = useState(false);

  useEffect(() => {
    dispatch(fetchEvalSets({ pageSize: 100 }));
    dispatch(fetchApplications({ pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedAppId) {
      aiApplicationApi.getVersions(selectedAppId).then((versions) => {
        setAppVersions(versions);
      });
    } else {
      setAppVersions([]);
    }
  }, [selectedAppId]);

  // 当评测类型改变时，重置评测模式
  useEffect(() => {
    setEvalMode(undefined);
    form.setFieldsValue({ evalMode: undefined });
  }, [evalType, form]);

  const handleEvalTypeChange = (value: EvalType) => {
    setEvalType(value);
    form.setFieldsValue({ evalType: value });
  };

  const handleEvalModeChange = (value: string) => {
    setEvalMode(value);
    form.setFieldsValue({ evalMode: value });
  };

  const handleAppChange = (value: string) => {
    setSelectedAppId(value);
    form.setFieldsValue({ appId: value, appVersion: undefined });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const requestData = {
        name: values.name,
        evalType: values.evalType,
        evalMode: values.evalMode,
        maxConcurrency: values.maxConcurrency,
        evalSetId: values.evalSetId,
        evalItemId: values.evalItemId,
        appId: values.appId,
        appVersion: values.appVersion,
        config: {},
      };

      // 音频agent额外配置
      if (values.evalType === EvalType.AUDIO) {
        Object.assign(requestData, {
          audioConfig: {
            datasetId: values.datasetId,
            configFileId: values.configFileId,
            configInfo: values.configInfo,
          },
        });
      }

      await dispatch(createEvalTask(requestData)).unwrap();
      message.success('创建评测任务成功');
      navigate('/eval/tasks');
    } catch (error) {
      message.error('创建评测任务失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24}>
        <Col span={18}>
          <Card bordered={false}>
            {/* 面包屑 */}
            <div style={{ marginBottom: 24 }}>
              <Text type="secondary">
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/eval/tasks')}>
                  评测任务
                </span>
                <span style={{ margin: '0 8px' }}>{'>'}</span>
                <span>新建评测任务</span>
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                evalType: EvalType.GENERAL,
                maxConcurrency: 10,
              }}
            >
              {/* 1. 评测模式 */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      marginRight: 8,
                    }}
                  >
                    1
                  </div>
                  <Title level={5} style={{ margin: 0 }}>
                    评测模式
                  </Title>
                </div>

                <Form.Item
                  label="评测类型"
                  name="evalType"
                  rules={[{ required: true, message: '请选择评测类型' }]}
                >
                  <EvalTypeSelector value={evalType} onChange={handleEvalTypeChange} />
                </Form.Item>

                <Form.Item
                  label="评测模式"
                  name="evalMode"
                  rules={[{ required: evalType !== EvalType.AUDIO, message: '请选择评测模式' }]}
                >
                  <EvalModeSelector
                    evalType={evalType}
                    value={evalMode}
                    onChange={handleEvalModeChange}
                  />
                </Form.Item>
              </div>

              {/* 2. 基础配置 */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      marginRight: 8,
                    }}
                  >
                    2
                  </div>
                  <Title level={5} style={{ margin: 0 }}>
                    基础配置
                  </Title>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="评测任务名称"
                      name="name"
                      rules={[{ required: true, message: '请输入评测任务名称' }]}
                    >
                      <Input placeholder="评测任务名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="最大并发执行条数"
                      name="maxConcurrency"
                      rules={[{ required: true, message: '请输入最大并发数' }]}
                    >
                      <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="评测集"
                      name="evalSetId"
                      rules={[{ required: true, message: '请选择评测集' }]}
                    >
                      <Select placeholder="请选择评测集" allowClear>
                        {evalSets.map((es) => (
                          <Option key={es.id} value={es.id}>
                            {es.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="评测项" name="evalItemId">
                      <Select placeholder="请选择" allowClear disabled>
                        <Option value="">全部</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* 3. 评测对象配置 */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#1890ff',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 500,
                      marginRight: 8,
                    }}
                  >
                    3
                  </div>
                  <Title level={5} style={{ margin: 0 }}>
                    评测对象配置
                  </Title>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="AI应用"
                      name="appId"
                      rules={[{ required: true, message: '请选择AI应用' }]}
                    >
                      <Select
                        placeholder="请选择"
                        allowClear
                        onChange={handleAppChange}
                      >
                        {applications.map((app) => (
                          <Option key={app.id} value={app.id}>
                            {app.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="版本"
                      name="appVersion"
                      rules={[{ required: true, message: '请选择版本' }]}
                    >
                      <Select placeholder="请选择" allowClear disabled={!selectedAppId}>
                        {appVersions.map((version) => (
                          <Option key={version.id} value={version.version}>
                            {version.version}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Collapse
                  ghost
                  activeKey={extraConfigExpanded ? ['1'] : []}
                  onChange={(keys) => setExtraConfigExpanded(keys.includes('1'))}
                >
                  <Panel header="更多AI应用配置" key="1">
                    <div style={{ padding: '8px 0' }}>
                      <Text type="secondary">额外配置项将在这里显示</Text>
                    </div>
                  </Panel>
                </Collapse>

                {/* 音频agent额外配置 */}
                {evalType === EvalType.AUDIO && (
                  <>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                      <Col span={12}>
                        <Form.Item
                          label="数据集选择"
                          name="datasetId"
                          rules={[{ required: true, message: '请选择数据集' }]}
                        >
                          <Select placeholder="请选择" allowClear>
                            <Option value="dataset1">数据集 1</Option>
                            <Option value="dataset2">数据集 2</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="配置文件选择"
                          name="configFileId"
                          rules={[{ required: true, message: '请选择配置文件' }]}
                        >
                          <Select placeholder="请选择" allowClear>
                            <Option value="config1">配置文件 1</Option>
                            <Option value="config2">配置文件 2</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      label="配置信息"
                      name="configInfo"
                      rules={[{ required: true, message: '请输入配置信息' }]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="请输入配置信息"
                      />
                    </Form.Item>
                  </>
                )}
              </div>

              {/* 底部按钮 */}
              <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    确定
                  </Button>
                  <Button onClick={() => navigate('/eval/tasks')}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={6}>
          <HelpPanel />
        </Col>
      </Row>
    </div>
  );
};

export default CreateEvalTaskPage;
