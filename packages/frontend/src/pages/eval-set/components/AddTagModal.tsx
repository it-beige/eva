import { useState, useEffect } from 'react';
import { Drawer, Form, Input, Tag, Space, Button } from 'antd';

interface AddTagModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (tagName: string) => void;
  existingTags: string[];
  loading?: boolean;
}

const suggestedTags = [
  '测试',
  '生产',
  '开发中',
  '已归档',
  '重要',
  '内部使用',
  '公开',
  '待审核',
];

export const AddTagModal: React.FC<AddTagModalProps> = ({
  open,
  onCancel,
  onSubmit,
  existingTags = [],
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (open) {
      form.resetFields();
      setInputValue('');
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      if (values.tagName) {
        onSubmit(values.tagName);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleSuggestedTagClick = (tag: string) => {
    form.setFieldsValue({ tagName: tag });
    setInputValue(tag);
  };

  const availableSuggestedTags = suggestedTags.filter(
    (tag) => !existingTags.includes(tag),
  );

  return (
    <Drawer
      title="添加标签"
      open={open}
      onClose={onCancel}
      width={420}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            确定
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="标签名称"
          name="tagName"
          rules={[
            { required: true, message: '请输入标签名称' },
            {
              validator: (_, value) => {
                if (existingTags.includes(value)) {
                  return Promise.reject(new Error('该标签已存在'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="请输入标签名称"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Form.Item>

        {availableSuggestedTags.length > 0 && (
          <Form.Item label="推荐标签">
            <Space size={[8, 8]} wrap>
              {availableSuggestedTags.map((tag) => (
                <Tag
                  key={tag}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSuggestedTagClick(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default AddTagModal;
