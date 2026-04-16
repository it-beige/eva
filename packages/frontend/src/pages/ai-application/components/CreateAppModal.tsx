import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from '@eva/shared';

const { TextArea } = Input;

interface CreateAppModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateApplicationRequest | UpdateApplicationRequest) => void;
  editingApp: ApplicationResponse | null;
  projectId?: string;
  loading: boolean;
}

const CreateAppModal: React.FC<CreateAppModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  editingApp,
  projectId,
  loading,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!editingApp;

  useEffect(() => {
    if (visible) {
      if (editingApp) {
        form.setFieldsValue({
          name: editingApp.name,
          description: editingApp.description || '',
          icon: editingApp.icon || '',
          gitRepoUrl: editingApp.gitRepoUrl || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingApp, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
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
    <Modal
      title={isEdit ? '编辑AI应用' : '新增AI应用'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={isEdit ? '保存' : '创建'}
      cancelText="取消"
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
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
          name="description"
          label="应用描述"
          rules={[{ max: 2000, message: '应用描述不能超过2000个字符' }]}
        >
          <TextArea
            rows={4}
            placeholder="请输入应用描述"
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          name="icon"
          label="图标URL"
          rules={[{ max: 500, message: '图标URL不能超过500个字符' }]}
        >
          <Input placeholder="请输入图标URL（可选）" />
        </Form.Item>

        <Form.Item
          name="gitRepoUrl"
          label="Git仓库地址"
          rules={[{ max: 500, message: 'Git仓库地址不能超过500个字符' }]}
        >
          <Input placeholder="请输入Git仓库地址（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAppModal;
