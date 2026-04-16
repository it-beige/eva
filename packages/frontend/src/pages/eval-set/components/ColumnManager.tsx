import { useState } from 'react';
import { Popover, Checkbox, Button, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

interface ColumnManagerProps {
  allColumns: string[];
  visibleColumns: string[];
  onChange: (visibleColumns: string[]) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  allColumns,
  visibleColumns,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const handleChange = (checkedValues: string[]) => {
    onChange(checkedValues);
  };

  const handleSelectAll = () => {
    onChange([...allColumns]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const content = (
    <div style={{ width: 200 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Button type="link" size="small" onClick={handleSelectAll}>
          全选
        </Button>
        <Button type="link" size="small" onClick={handleClearAll}>
          清空
        </Button>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <Checkbox.Group
        value={visibleColumns}
        onChange={handleChange}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {allColumns.map((col) => (
          <Checkbox key={col} value={col}>
            {col}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );

  return (
    <Popover
      content={content}
      title="列管理"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Button icon={<SettingOutlined />}>列管理</Button>
    </Popover>
  );
};

export default ColumnManager;
