import { useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Collapse,
  Button,
  Space,
  message,
} from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { createPrompt, updatePrompt } from '../../../store/promptSlice';
import styles from '../Prompt.module.scss';

const { TextArea } = Input;
const { Panel } = Collapse;

interface CreatePromptModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: any;
}

const CreatePromptModal = ({
  open,
  onCancel,
  onSuccess,
  initialValues,
}: CreatePromptModalProps) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.prompt);

  const isEditing = !!initialValues;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          content: initialValues.content,
          description: initialValues.description,
          metadata: initialValues.metadata
            ? JSON.stringify(initialValues.metadata, null, 2)
            : '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        ...values,
        metadata: values.metadata
          ? JSON.parse(values.metadata)
          : undefined,
      };

      if (isEditing) {
        await dispatch(
          updatePrompt({
            id: initialValues.id,
            data: {
              content: data.content,
              metadata: data.metadata,
              description: data.description,
            },
          })
        ).unwrap();
        message.success('更新成功');
      } else {
        await dispatch(createPrompt(data)).unwrap();
        message.success('创建成功');
      }

      onSuccess();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      } else if (error.name === 'SyntaxError') {
        message.error('元数据 JSON 格式错误');
      }
    }
  };

  return (
    <Drawer
      title={isEditing ? '编辑Prompt' : '新建Prompt'}
      open={open}
      onClose={onCancel}
      width={640}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {isEditing ? '保存' : '确认'}
          </Button>
        </Space>
      }
    >
      <div className={styles.modalDescription}>
        编写Prompt，包括基本内容、动态占位符、格式等信息。
        <a href="#" className={styles.helpLink}>
          <LinkOutlined /> 帮助文档
        </a>
      </div>

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        {!isEditing && (
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入Prompt名称' }]}
          >
            <Input placeholder="Prompt名称" />
          </Form.Item>
        )}

        <Form.Item
          name="content"
          label="Prompt"
          rules={[{ required: true, message: '请输入Prompt内容' }]}
        >
          <TextArea
            placeholder="Prompt"
            rows={8}
            showCount
            maxLength={10000}
          />
        </Form.Item>

        <div className={styles.promptHint}>
          使用 mustache 语法在Prompt中引用评测集变量。示例：{'{{question}}'}。
        </div>

        <Collapse
          ghost
          style={{ marginTop: 16 }}
          className={styles.collapsePanel}
        >
          <Panel header="元数据" key="metadata">
            <Form.Item name="metadata">
              <TextArea
                placeholder='{"key": "value"}'
                rows={4}
              />
            </Form.Item>
          </Panel>
        </Collapse>

        <Collapse
          ghost
          className={styles.collapsePanel}
        >
          <Panel header="描述" key="description">
            <Form.Item name="description">
              <TextArea
                placeholder="请输入描述"
                rows={3}
              />
            </Form.Item>
          </Panel>
        </Collapse>
      </Form>
    </Drawer>
  );
};

export default CreatePromptModal;
