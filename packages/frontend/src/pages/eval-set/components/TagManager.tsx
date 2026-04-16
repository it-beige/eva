import { useState } from 'react';
import { Tag, Button, Space, Popover, Input, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { useToken } = theme;

interface TagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  readonly?: boolean;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags = [],
  onAddTag,
  onRemoveTag,
  readonly = false,
}) => {
  const { token } = useToken();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (inputValue && !tags.includes(inputValue)) {
      onAddTag(inputValue);
    }
    setInputValue('');
    setInputVisible(false);
  };

  const tagColors = [
    'blue',
    'green',
    'cyan',
    'geekblue',
    'purple',
    'magenta',
    'red',
    'orange',
    'gold',
    'lime',
  ];

  const getTagColor = (tag: string) => {
    const index = tag.charCodeAt(0) % tagColors.length;
    return tagColors[index];
  };

  const addTagContent = (
    <div style={{ width: 200 }}>
      <Input
        autoFocus
        placeholder="输入标签名称"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={handleAddTag}
        style={{ marginBottom: 8 }}
      />
      <Button type="primary" size="small" block onClick={handleAddTag}>
        添加
      </Button>
    </div>
  );

  return (
    <Space size={[8, 8]} wrap>
      {tags.map((tag) => (
        <Tag
          key={tag}
          color={getTagColor(tag)}
          closable={!readonly}
          onClose={() => onRemoveTag(tag)}
          style={{ marginRight: 0 }}
        >
          {tag}
        </Tag>
      ))}
      {!readonly && (
        <Popover
          content={addTagContent}
          title="添加标签"
          trigger="click"
          open={inputVisible}
          onOpenChange={setInputVisible}
          placement="bottomLeft"
        >
          <Tag
            style={{
              background: token.colorBgContainer,
              borderStyle: 'dashed',
              cursor: 'pointer',
            }}
          >
            <PlusOutlined /> 添加标签
          </Tag>
        </Popover>
      )}
    </Space>
  );
};

export default TagManager;
