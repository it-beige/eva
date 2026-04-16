import { useState } from 'react';
import { Tag, Button, Space, Popover, Input, theme } from 'antd';
import TagClusterIcon from '../../../components/icons/TagClusterIcon';
import styles from './TagManager.module.scss';

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

  const tagTones = [
    {
      background: '#eff3ff',
      borderColor: '#cdd8ff',
      textColor: '#4359c7',
      iconStart: '#7280FF',
      iconEnd: '#53B8FF',
      iconSoft: 'rgba(114, 128, 255, 0.18)',
    },
    {
      background: '#eef8ff',
      borderColor: '#cbe8ff',
      textColor: '#1e74b7',
      iconStart: '#3FA7FF',
      iconEnd: '#52D2FF',
      iconSoft: 'rgba(83, 182, 255, 0.18)',
    },
    {
      background: '#eefbf7',
      borderColor: '#ccecdf',
      textColor: '#1f8770',
      iconStart: '#34B89A',
      iconEnd: '#63D7BB',
      iconSoft: 'rgba(52, 184, 154, 0.18)',
    },
    {
      background: '#f4f1ff',
      borderColor: '#ddd4ff',
      textColor: '#6350c4',
      iconStart: '#8C73FF',
      iconEnd: '#B494FF',
      iconSoft: 'rgba(140, 115, 255, 0.18)',
    },
    {
      background: '#fff4ef',
      borderColor: '#ffd8c8',
      textColor: '#c46a3f',
      iconStart: '#FF9368',
      iconEnd: '#FFC06C',
      iconSoft: 'rgba(255, 147, 104, 0.18)',
    },
  ];

  const getTagTone = (tag: string) => {
    const hash = Array.from(tag).reduce((total, char) => total + char.charCodeAt(0), 0);
    return tagTones[hash % tagTones.length];
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
    <Space size={[8, 8]} wrap className={styles.tagGroup}>
      {tags.map((tag) => {
        const tone = getTagTone(tag);

        return (
          <Tag
            key={tag}
            closable={!readonly}
            onClose={() => onRemoveTag(tag)}
            className={styles.tagSurface}
            icon={
              <span className={styles.tagIcon}>
                <TagClusterIcon
                  size={12}
                  startColor={tone.iconStart}
                  endColor={tone.iconEnd}
                  secondaryColor={tone.iconSoft}
                />
              </span>
            }
            style={{
              background: tone.background,
              borderColor: tone.borderColor,
              color: tone.textColor,
            }}
          >
            {tag}
          </Tag>
        );
      })}
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
            className={styles.addTagSurface}
            style={{
              background: token.colorBgContainer,
              borderColor: token.colorBorderSecondary,
              color: token.colorTextSecondary,
            }}
          >
            <span className={styles.tagIcon}>
              <TagClusterIcon
                size={12}
                startColor="#7280FF"
                endColor="#53B8FF"
                secondaryColor="rgba(114, 128, 255, 0.18)"
              />
            </span>
            添加标签
          </Tag>
        </Popover>
      )}
    </Space>
  );
};

export default TagManager;
