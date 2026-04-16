import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Radio,
  Card,
  Button,
  Space,
  Typography,
  InputNumber,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  RobotOutlined,
  FileOutlined,
  ApiOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { EvalSetType, EvalSetSourceType } from '@eva/shared';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface CreateEvalSetModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateEvalSetFormValues) => void;
  loading?: boolean;
}

export interface CreateEvalSetFormValues {
  name: string;
  type: EvalSetType;
  description?: string;
  sourceType: EvalSetSourceType;
  // Code类型相关
  publicEvalSetId?: string;
  gitRepoUrl?: string;
  // 本地上传
  fileUrl?: string;
  // ODPS
  odpsTableName?: string;
  odpsPartition?: string;
  // AI生成
  exampleFileUrl?: string;
  aiModelId?: string;
  aiGenerateCount?: number;
  // 空白评测集
  columns?: Array<{ name: string; type: string }>;
  // SDK
  sdkEndpoint?: string;
}

const sourceTypeOptions = [
  {
    key: EvalSetSourceType.LOCAL_UPLOAD,
    label: '本地上传',
    icon: <UploadOutlined />,
    description: '上传CSV文件',
  },
  {
    key: EvalSetSourceType.ODPS,
    label: 'ODPS上传',
    icon: <DatabaseOutlined />,
    description: '从ODPS表导入',
  },
  {
    key: EvalSetSourceType.SDK,
    label: 'SDK动态接入',
    icon: <ApiOutlined />,
    description: '通过SDK接入',
  },
  {
    key: EvalSetSourceType.AI_GENERATE,
    label: 'AI智能生成',
    icon: <RobotOutlined />,
    description: 'AI自动生成数据',
  },
  {
    key: EvalSetSourceType.BLANK,
    label: '空白评测集',
    icon: <FileOutlined />,
    description: '创建空白评测集',
  },
  {
    key: EvalSetSourceType.ONLINE_EXTRACT,
    label: '线上数据提取',
    icon: <CloudUploadOutlined />,
    description: '从线上提取',
  },
];

const codeSourceOptions = [
  {
    key: EvalSetSourceType.PUBLIC,
    label: '引用公共评测集',
    icon: <GlobalOutlined />,
  },
  {
    key: EvalSetSourceType.CUSTOM,
    label: '自定义评测集',
    icon: <CodeOutlined />,
  },
];

const mockPublicEvalSets = [
  { id: '1', name: 'HumanEval' },
  { id: '2', name: 'MBPP' },
  { id: '3', name: 'CodeContests' },
];

const mockModels = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5', name: 'GPT-3.5' },
  { id: 'claude-3', name: 'Claude 3' },
];

export const CreateEvalSetModal: React.FC<CreateEvalSetModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm<CreateEvalSetFormValues>();
  const [evalSetType, setEvalSetType] = useState<EvalSetType>(EvalSetType.TEXT);
  const [sourceType, setSourceType] = useState<string>(
    EvalSetSourceType.LOCAL_UPLOAD,
  );
  const [codeSourceType, setCodeSourceType] = useState<string>(EvalSetSourceType.PUBLIC);

  // 当类型切换时重置表单
  useEffect(() => {
    if (open) {
      form.resetFields();
      setEvalSetType(EvalSetType.TEXT);
      setSourceType(EvalSetSourceType.LOCAL_UPLOAD);
      setCodeSourceType(EvalSetSourceType.PUBLIC);
    }
  }, [open, form]);

  const handleTypeChange = (type: EvalSetType) => {
    setEvalSetType(type);
    form.setFieldsValue({ type });
    if (type === EvalSetType.CODE) {
      setSourceType(EvalSetSourceType.PUBLIC);
      form.setFieldsValue({ sourceType: EvalSetSourceType.PUBLIC });
    } else {
      setSourceType(EvalSetSourceType.LOCAL_UPLOAD);
      form.setFieldsValue({ sourceType: EvalSetSourceType.LOCAL_UPLOAD });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const renderTextTypeForm = () => {
    if (evalSetType !== EvalSetType.TEXT) return null;
    return (
      <>
        <Form.Item
          label="数据集创建方式"
          required
          style={{ marginBottom: 16 }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {sourceTypeOptions.map((option) => (
              <Card
                key={option.key}
                size="small"
                style={{
                  width: 140,
                  cursor: 'pointer',
                  border:
                    sourceType === option.key
                      ? '2px solid #5B21B6'
                      : '1px solid #d9d9d9',
                }}
                onClick={() => {
                  setSourceType(option.key);
                  form.setFieldsValue({ sourceType: option.key });
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8, color: '#5B21B6' }}>
                    {option.icon}
                  </div>
                  <div style={{ fontWeight: 500 }}>{option.label}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {option.description}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Form.Item>

        {sourceType === EvalSetSourceType.LOCAL_UPLOAD && (
          <>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[{ required: true, message: '请输入评测集名称' }]}
            >
              <Input placeholder="请输入评测集名称" />
            </Form.Item>
            <Form.Item label="评测集描述" name="description">
              <TextArea rows={3} placeholder="请输入评测集描述" />
            </Form.Item>
            <Form.Item
              name="fileUrl"
              hidden
              rules={[{ required: true, message: '请上传CSV文件' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="上传CSV文件"
              required
            >
              <Upload.Dragger
                name="file"
                multiple={false}
                maxCount={1}
                beforeUpload={() => false}
                onChange={(info) => {
                  const fileName = info.fileList[0]?.name;
                  form.setFieldsValue({ fileUrl: fileName });
                }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">支持 CSV 格式文件</p>
              </Upload.Dragger>
            </Form.Item>
          </>
        )}

        {sourceType === EvalSetSourceType.ODPS && (
          <>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[{ required: true, message: '请输入评测集名称' }]}
            >
              <Input placeholder="请输入评测集名称" />
            </Form.Item>
            <Form.Item
              label="ODPS表名"
              name="odpsTableName"
              rules={[{ required: true, message: '请输入ODPS表名' }]}
            >
              <Input placeholder="格式: project.table_name" />
            </Form.Item>
            <Form.Item label="分区条件" name="odpsPartition">
              <Input placeholder="可选，如: dt=20240101" />
            </Form.Item>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              提示：单次导入数据量建议不超过2万条
            </Text>
          </>
        )}

        {sourceType === EvalSetSourceType.AI_GENERATE && (
          <>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[{ required: true, message: '请输入评测集名称' }]}
            >
              <Input placeholder="请输入评测集名称" />
            </Form.Item>
            <Form.Item
              name="exampleFileUrl"
              hidden
              rules={[{ required: true, message: '请上传示例CSV文件' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="上传示例CSV"
              required
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                onChange={(info) => {
                  const fileName = info.fileList[0]?.name;
                  form.setFieldsValue({ exampleFileUrl: fileName });
                }}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item
              label="选择模型"
              name="aiModelId"
              rules={[{ required: true, message: '请选择模型' }]}
            >
              <Select placeholder="请选择模型">
                {mockModels.map((model) => (
                  <Option key={model.id} value={model.id}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="生成数量"
              name="aiGenerateCount"
              rules={[{ required: true, message: '请输入生成数量' }]}
              initialValue={10}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}

        {sourceType === EvalSetSourceType.BLANK && (
          <>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[{ required: true, message: '请输入评测集名称' }]}
            >
              <Input placeholder="请输入评测集名称" />
            </Form.Item>
            <Form.Item label="评测集描述" name="description">
              <TextArea rows={3} placeholder="请输入评测集描述" />
            </Form.Item>
            <Form.Item label="列管理">
              <Text type="secondary">
                默认包含 Input 和 Output 列，可在创建后管理列
              </Text>
            </Form.Item>
          </>
        )}

        {(sourceType === EvalSetSourceType.SDK ||
          sourceType === EvalSetSourceType.ONLINE_EXTRACT) && (
          <>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[{ required: true, message: '请输入评测集名称' }]}
            >
              <Input placeholder="请输入评测集名称" />
            </Form.Item>
            <Form.Item label="评测集描述" name="description">
              <TextArea rows={3} placeholder="请输入评测集描述" />
            </Form.Item>
            <Text type="secondary">该创建方式需要额外配置，请联系管理员</Text>
          </>
        )}
      </>
    );
  };

  const renderCodeTypeForm = () => {
    if (evalSetType !== EvalSetType.CODE) return null;
    return (
      <>
        <Form.Item
          label="创建方式"
          required
          style={{ marginBottom: 16 }}
        >
          <Radio.Group
            value={codeSourceType}
            onChange={(e) => {
              setCodeSourceType(e.target.value);
              form.setFieldsValue({ sourceType: e.target.value });
            }}
          >
            <Space orientation="vertical">
              {codeSourceOptions.map((option) => (
                <Radio.Button
                  key={option.key}
                  value={option.key}
                  style={{
                    width: 400,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                  }}
                >
                  <Space>
                    <span style={{ fontSize: 20, color: '#5B21B6' }}>
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                  </Space>
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

        {codeSourceType === 'public_reference' && (
          <>
            <Form.Item
              label="公共评测集"
              name="publicEvalSetId"
              rules={[{ required: true, message: '请选择公共评测集' }]}
            >
              <Select placeholder="请选择公共评测集">
                {mockPublicEvalSets.map((set) => (
                  <Option key={set.id} value={set.id}>
                    {set.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[
                { required: true, message: '请输入评测集名称' },
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message: '只能包含字母、数字、下划线和连字符',
                },
              ]}
            >
              <Input placeholder="只能包含字母、数字、下划线和连字符" />
            </Form.Item>
            <Form.Item label="评测集描述" name="description">
              <TextArea rows={3} placeholder="请输入评测集描述" />
            </Form.Item>
            <Form.Item
              label="代码仓库"
              name="gitRepoUrl"
              rules={[{ required: true, message: '请输入代码仓库地址' }]}
            >
              <Input placeholder="git@gitlab.alibaba-inc.com:xxx.git" />
            </Form.Item>
          </>
        )}

        {codeSourceType === 'custom' && (
          <>
            <Form.Item
              label="评测集名称"
              name="name"
              rules={[
                { required: true, message: '请输入评测集名称' },
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message: '只能包含字母、数字、下划线和连字符',
                },
              ]}
            >
              <Input placeholder="只能包含字母、数字、下划线和连字符" />
            </Form.Item>
            <Form.Item label="评测集描述" name="description">
              <TextArea rows={3} placeholder="请输入评测集描述" />
            </Form.Item>
            <Form.Item
              label="代码仓库"
              name="gitRepoUrl"
              rules={[{ required: true, message: '请输入代码仓库地址' }]}
            >
              <Input placeholder="git@gitlab.alibaba-inc.com:xxx.git" />
            </Form.Item>
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      title="新建评测集"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: EvalSetType.TEXT,
          sourceType: EvalSetSourceType.LOCAL_UPLOAD,
        }}
      >
        <Form.Item label="评测集类型" required style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                size="small"
                style={{
                  cursor: 'pointer',
                  border:
                    evalSetType === EvalSetType.TEXT
                      ? '2px solid #5B21B6'
                      : '1px solid #d9d9d9',
                  textAlign: 'center',
                }}
                onClick={() => handleTypeChange(EvalSetType.TEXT)}
              >
                <div style={{ fontWeight: 500 }}>文本/多模态</div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                style={{
                  cursor: 'pointer',
                  border:
                    evalSetType === EvalSetType.CODE
                      ? '2px solid #5B21B6'
                      : '1px solid #d9d9d9',
                  textAlign: 'center',
                }}
                onClick={() => handleTypeChange(EvalSetType.CODE)}
              >
                <div style={{ fontWeight: 500 }}>Code</div>
              </Card>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item name="type" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="sourceType" hidden>
          <Input />
        </Form.Item>

        {renderTextTypeForm()}
        {renderCodeTypeForm()}
      </Form>
    </Modal>
  );
};

export default CreateEvalSetModal;
