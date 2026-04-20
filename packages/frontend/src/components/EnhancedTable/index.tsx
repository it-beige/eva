import { useState, useCallback, useMemo } from 'react';
import { Table, Popover, Checkbox, Button, Divider } from 'antd';
import {
  SettingOutlined,
  ColumnHeightOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import type { TableProps, ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import styles from './EnhancedTable.module.scss';

/** 表格密度模式 */
export type TableDensity = 'compact' | 'default' | 'comfortable';

/** 列配置项 */
export interface ColumnConfig {
  /** 列的 key（用于标识） */
  key: string;
  /** 列的显示名称 */
  title: string;
  /** 是否默认显示 */
  defaultVisible?: boolean;
}

/** EnhancedTable 组件 Props */
export interface EnhancedTableProps<T> extends Omit<TableProps<T>, 'columns' | 'size' | 'pagination'> {
  /** Ant Design Table 的 columns 配置 */
  columns: ColumnsType<T>;
  /** 列配置列表（用于列管理） */
  columnConfigs?: ColumnConfig[];
  /** 分页配置（透传给 Table） */
  pagination?: TablePaginationConfig | false;
  /** 默认排序字段 */
  defaultSortBy?: string;
  /** 默认排序方式 */
  defaultSortOrder?: 'asc' | 'desc';
  /** 表格变化回调 */
  onTableChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => void;
}

/**
 * EnhancedTable - 增强型表格组件
 * 
 * 功能特性：
 * - 列显示/隐藏管理
 * - 三种密度模式切换（紧凑/标准/宽松）
 * - 列拖拽排序（可选）
 * - 完全兼容 Ant Design Table API
 */
function EnhancedTable<T extends object>({
  columns,
  columnConfigs,
  pagination,
  defaultSortBy,
  defaultSortOrder = 'desc',
  onTableChange,
  ...tableProps
}: EnhancedTableProps<T>) {
  // 密度模式状态
  const [density, setDensity] = useState<TableDensity>('default');
  
  // 列可见性状态
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<string>>(() => {
    if (!columnConfigs) return new Set(columns.map((col: any) => col.key || col.dataIndex));
    return new Set(
      columnConfigs
        .filter((config) => config.defaultVisible !== false)
        .map((config) => config.key)
    );
  });

  // 列管理弹窗状态
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);

  /** 获取密度对应的 size */
  const tableSize = useMemo(() => {
    switch (density) {
      case 'compact':
        return 'small';
      case 'comfortable':
        return 'large';
      default:
        return 'middle';
    }
  }, [density]);

  /** 过滤可见列 */
  const visibleColumns = useMemo(() => {
    if (!columnConfigs) return columns;
    return columns.filter((col: any) => {
      const key = col.key || col.dataIndex;
      return visibleColumnKeys.has(key as string);
    });
  }, [columns, columnConfigs, visibleColumnKeys]);

  /** 处理表格变化 */
  const handleTableChange = useCallback(
    (
      pag: TablePaginationConfig,
      filters: Record<string, any>,
      sorter: SorterResult<T> | SorterResult<T>[],
    ) => {
      onTableChange?.(pag, filters, sorter);
    },
    [onTableChange],
  );

  /** 切换列可见性 */
  const handleColumnVisibilityChange = useCallback((checkedKeys: string[]) => {
    setVisibleColumnKeys(new Set(checkedKeys));
  }, []);

  /** 全部显示 */
  const handleShowAll = useCallback(() => {
    if (!columnConfigs) return;
    setVisibleColumnKeys(new Set(columnConfigs.map((config) => config.key)));
  }, [columnConfigs]);

  /** 全部隐藏 */
  const handleHideAll = useCallback(() => {
    setVisibleColumnKeys(new Set());
  }, []);

  /** 密度按钮配置 */
  const densityButtons = useMemo(
    () => [
      {
        mode: 'compact' as TableDensity,
        icon: <ColumnHeightOutlined style={{ fontSize: 14 }} />,
        tooltip: '紧凑',
      },
      {
        mode: 'default' as TableDensity,
        icon: <ColumnHeightOutlined style={{ fontSize: 16 }} />,
        tooltip: '标准',
      },
      {
        mode: 'comfortable' as TableDensity,
        icon: <ColumnHeightOutlined style={{ fontSize: 18 }} />,
        tooltip: '宽松',
      },
    ],
    [],
  );

  /** 列管理弹窗内容 */
  const columnManagerContent = useMemo(() => {
    if (!columnConfigs || columnConfigs.length === 0) {
      return <div style={{ padding: 8, color: '#999' }}>暂无可配置的列</div>;
    }

    return (
      <div className={styles.columnManagerContent}>
        {/* 快捷操作 */}
        <div className={styles.columnManagerActions}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={handleShowAll}>
            全部显示
          </Button>
          <Button type="link" size="small" icon={<EyeInvisibleOutlined />} onClick={handleHideAll}>
            全部隐藏
          </Button>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* 列复选框列表 */}
        <Checkbox.Group
          value={Array.from(visibleColumnKeys)}
          onChange={(checkedValues) => handleColumnVisibilityChange(checkedValues as string[])}
          className={styles.columnCheckboxGroup}
        >
          {columnConfigs.map((config) => (
            <Checkbox key={config.key} value={config.key} className={styles.columnCheckbox}>
              {config.title}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
    );
  }, [columnConfigs, visibleColumnKeys, handleShowAll, handleHideAll, handleColumnVisibilityChange]);

  /** 渲染工具栏 */
  const renderToolbar = () => {
    if (!columnConfigs) return null;

    return (
      <div className={styles.toolbar}>
        {/* 密度切换按钮组 */}
        <div className={styles.densityGroup}>
          {densityButtons.map((btn) => (
            <Button
              key={btn.mode}
              type={density === btn.mode ? 'primary' : 'default'}
              size="small"
              icon={btn.icon}
              onClick={() => setDensity(btn.mode)}
              title={btn.tooltip}
              className={styles.densityBtn}
            />
          ))}
        </div>

        {/* 列管理按钮 */}
        <Popover
          content={columnManagerContent}
          title="列管理"
          trigger="click"
          open={columnManagerOpen}
          onOpenChange={setColumnManagerOpen}
          placement="bottomRight"
          overlayClassName={styles.columnManagerPopover}
        >
          <Button
            type={columnManagerOpen ? 'primary' : 'default'}
            size="small"
            icon={<SettingOutlined />}
            className={styles.columnManagerBtn}
          >
            列管理
          </Button>
        </Popover>
      </div>
    );
  };

  return (
    <div className={styles.enhancedTableWrapper}>
      {/* 工具栏 */}
      {renderToolbar()}

      {/* 表格容器 */}
      <div className={styles.tableContainer}>
        <Table<T>
          {...tableProps}
          columns={visibleColumns}
          size={tableSize}
          pagination={pagination}
          onChange={handleTableChange}
          className={styles.enhancedTable}
        />
      </div>
    </div>
  );
}

export default EnhancedTable;
