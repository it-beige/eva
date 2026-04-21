import EnhancedTable from '../../../components/EnhancedTable';
import { useState } from 'react';
import {
  Space,
  Button,
  Popconfirm,
  Tag,
  Image,
  Tooltip,
  Typography,
} from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { EvalSetItem } from '@eva/shared';
import { formatDateTime } from '../../../utils/format';

const { Text } = Typography;

interface EvalSetItemTableProps {
  items: EvalSetItem[];
  loading: boolean;
  columns: string[];
  visibleColumns: string[];
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
  onEdit: (item: EvalSetItem) => void;
  onDelete: (itemId: string) => void;
  onViewCode?: (item: EvalSetItem) => void;
  isCodeType?: boolean;
}

export const EvalSetItemTable: React.FC<EvalSetItemTableProps> = ({
  items,
  loading,
  columns,
  visibleColumns,
  selectedRowKeys,
  onSelectChange,
  onEdit,
  onDelete,
  onViewCode,
  isCodeType = false,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      onSelectChange(keys as string[]);
    },
  };

  const renderCellContent = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return <Text type="secondary">-</Text>;
    }

    if (typeof value === 'string') {
      // 检测是否为图片URL
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
        return (
          <Image
            src={value}
            alt="image"
            style={{ maxWidth: 80, maxHeight: 80, objectFit: 'cover' }}
            preview={{ src: value }}
          />
        );
      }
      // 检测是否为URL
      if (/^https?:\/\//.test(value)) {
        return (
          <Tooltip title={value} placement="topLeft">
            <a href={value} target="_blank" rel="noopener noreferrer">
              {value.length > 50 ? `${value.slice(0, 50)}...` : value}
            </a>
          </Tooltip>
        );
      }
      return (
        <Tooltip title={value} placement="topLeft">
          <span
            style={{
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              verticalAlign: 'middle',
            }}
          >
            {value}
          </span>
        </Tooltip>
      );
    }

    if (typeof value === 'object') {
      const jsonStr = JSON.stringify(value, null, 2);
      return (
        <Tooltip title={<pre style={{ margin: 0, maxHeight: 300, overflow: 'auto', fontSize: 12 }}>{jsonStr}</pre>} placement="topLeft" overlayStyle={{ maxWidth: 420 }}>
          <pre
            style={{
              maxWidth: 300,
              maxHeight: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
              fontSize: 12,
            }}
          >
            {jsonStr}
          </pre>
        </Tooltip>
      );
    }

    return String(value);
  };

  const tableColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left' as const,
      render: (id: string) => (
        <Text
          copyable
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        >
          {id.slice(0, 8)}...
        </Text>
      ),
    },
    ...columns
      .filter((col) => visibleColumns.includes(col))
      .map((col) => ({
        title: col,
        dataIndex: ['input', col],
        key: col,
        width: 200,
        render: (_: unknown, record: EvalSetItem) => {
          const value = record.input[col];
          return renderCellContent(value);
        },
      })),
    {
      title: 'output',
      dataIndex: ['output'],
      key: 'output',
      width: 200,
      render: (output: Record<string, unknown> | null) => {
        if (!output) return <Text type="secondary">-</Text>;
        return renderCellContent(output);
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: EvalSetItem) => (
        <Space size="small">
          {isCodeType && onViewCode && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewCode(record)}
            >
              查看代码
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个数据项吗？"
            onConfirm={() => onDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <EnhancedTable
      rowKey="id"
      dataSource={items}
      columns={tableColumns}
      loading={loading}
      rowSelection={rowSelection}
      pagination={false}
      scroll={{ x: 'max-content' }}
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
        expandedRowRender: (record: EvalSetItem) => (
          <div style={{ padding: 16, background: '#f5f5f5' }}>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">Input</Tag>
              <pre
                style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 4,
                  marginTop: 8,
                }}
              >
                {JSON.stringify(record.input, null, 2)}
              </pre>
            </div>
            {record.output && (
              <div style={{ marginBottom: 16 }}>
                <Tag color="green">Output</Tag>
                <pre
                  style={{
                    background: '#fff',
                    padding: 12,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  {JSON.stringify(record.output, null, 2)}
                </pre>
              </div>
            )}
            {record.metadata && (
              <div>
                <Tag color="orange">Metadata</Tag>
                <pre
                  style={{
                    background: '#fff',
                    padding: 12,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                >
                  {JSON.stringify(record.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ),
      }}
    />
  );
};

export default EvalSetItemTable;
