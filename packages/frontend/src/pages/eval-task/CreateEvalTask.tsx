import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createEvalTask } from '../../store/evalTaskSlice';
import { fetchEvalSets } from '../../store/evalSetSlice';
import EvalTypeSelector from './components/EvalTypeSelector';
import EvalModeSelector from './components/EvalModeSelector';
import HelpPanel from './components/HelpPanel';
import {
  ApplicationVersionResponse,
  CreateEvalTaskRequest,
  EvalType,
} from '@eva/shared';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  useGetApplicationVersionsQuery,
  useGetApplicationsQuery,
} from '../../services/applicationQueries';
import styles from './CreateEvalTask.module.scss';

const { Title, Text } = Typography;
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

const SectionHeading = ({ index, title }: { index: number; title: string }) => (
  <div className={styles.sectionHeader}>
    <div className={styles.sectionIndex}>{index}</div>
    <Title level={5} className={styles.sectionTitle}>
      {title}
    </Title>
  </div>
);

const CreateEvalTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<FormValues>();

  const { loading } = useAppSelector((state) => state.evalTask);
  const { evalSets } = useAppSelector((state) => state.evalSet);
  const { data: applicationData } = useGetApplicationsQuery({ pageSize: 100 });

  const [evalType, setEvalType] = useState<EvalType>(EvalType.GENERAL);
  const [evalMode, setEvalMode] = useState<string | undefined>();
  const [selectedAppId, setSelectedAppId] = useState<string | undefined>();
  const [extraConfigExpanded, setExtraConfigExpanded] = useState(false);
  const applications = applicationData?.items ?? [];
  const { data: appVersions = [] } = useGetApplicationVersionsQuery(
    selectedAppId ?? '',
    { skip: !selectedAppId },
  );

  useEffect(() => {
    dispatch(fetchEvalSets({ pageSize: 100 }));
  }, [dispatch]);

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
      const requestData: CreateEvalTaskRequest = {
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
    <div className={styles.page}>
      <Row gutter={24}>
        <Col span={18}>
          <Card variant="borderless">
            <div className={styles.breadcrumb}>
              <Text type="secondary">
                <span className={styles.breadcrumbLink} onClick={() => navigate('/eval/tasks')}>
                  评测任务
                </span>
                <span className={styles.breadcrumbSeparator}>{'>'}</span>
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
              <div className={styles.section}>
                <SectionHeading index={1} title="评测模式" />

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
              <div className={styles.section}>
                <SectionHeading index={2} title="基础配置" />

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
                      <InputNumber min={1} max={100} className={styles.fullWidthInput} />
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
              <div className={styles.section}>
                <SectionHeading index={3} title="评测对象配置" />

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
                        {appVersions.map((version: ApplicationVersionResponse) => (
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
                  onChange={(keys) =>
                    setExtraConfigExpanded(
                      (Array.isArray(keys) ? keys : [keys]).includes('1'),
                    )
                  }
                  items={[
                    {
                      key: '1',
                      label: '更多AI应用配置',
                      children: (
                        <div className={styles.collapseContent}>
                          <Text type="secondary">额外配置项将在这里显示</Text>
                        </div>
                      ),
                    },
                  ]}
                />

                {/* 音频agent额外配置 */}
                {evalType === EvalType.AUDIO && (
                  <>
                    <Row gutter={16} className={styles.audioConfigRow}>
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

              <Form.Item className={styles.footerActions}>
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
