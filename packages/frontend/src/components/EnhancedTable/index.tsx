import { useState, useCallback, useMemo } from 'react';
import { Table, Popover, Checkbox, Button, Divider, Tooltip } from 'antd';
import {
  SettingOutlined,
  UnorderedListOutlined,
  ColumnWidthOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  QuestionCircleOutlined,
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
  /** 默认密度模式 */
  defaultDensity?: TableDensity;
  /** 是否启用列的 ellipsis 功能（省略号+tooltip），默认开启 */
  enableEllipsis?: boolean;
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
  defaultDensity = 'compact',
  enableEllipsis = true,
  onTableChange,
  ...tableProps
}: EnhancedTableProps<T>) {
  // 密度模式状态
  const [density, setDensity] = useState<TableDensity>(defaultDensity);
  
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

  /** 判断列是否为不需要自动添加 ellipsis/tooltip 的类型 */
  const isSkippedColumn = useCallback((col: any): boolean => {
    const skipKeys = ['action', '操作', 'status', '状态', 'rank', '排名'];
    const key = String(col.key || col.dataIndex || '');
    const title = typeof col.title === 'string' ? col.title : '';
    // 1. 已有 ellipsis 配置的列 — 说明业务层已自行处理
    if (col.ellipsis !== undefined) return true;
    // 2. 操作列 / 状态列 / 排名列
    if (skipKeys.includes(key) || skipKeys.includes(title)) return true;
    // 3. 固定列（fixed: 'left' | 'right'）通常是操作列或 ID 列
    if (col.fixed) return true;
    // 4. 对齐居中的列（通常是数值/图标/Tag）
    if (col.align === 'center') return true;
    return false;
  }, []);

  /** 提取 render 结果的文本内容用于 tooltip */
  const extractTextContent = useCallback((content: any): string | null => {
    if (content === null || content === undefined) return null;
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return String(content);
    // ReactNode 不提取
    return null;
  }, []);

  /** 处理ellipsis和tooltip */
  const processColumns = useCallback(
    (cols: ColumnsType<T>): ColumnsType<T> => {
      const shouldAddEllipsis = density === 'compact' || enableEllipsis;
      if (!shouldAddEllipsis) return cols;

      return cols.map((col: any) => {
        // 跳过操作列、已有配置的列
        if (isSkippedColumn(col)) return col;

        const originalRender = col.render;

        // 如果列有 render 函数，包裹 tooltip
        if (originalRender && typeof originalRender === 'function') {
          return {
            ...col,
            ellipsis: {
              showTitle: false,
            },
            render: (text: any, record: T, index: number) => {
              const content = originalRender(text, record, index);
              const textContent = extractTextContent(content);
              
              // 只有纯文本内容才加 tooltip
              if (textContent !== null && textContent !== '-' && textContent !== '') {
                return (
                  <Tooltip title={textContent} placement="topLeft">
                    <span className="eva-table-cell-text">{content}</span>
                  </Tooltip>
                );
              }
              return content;
            },
          };
        }

        // 没有 render 函数，直接添加 ellipsis + tooltip
        return {
          ...col,
          ellipsis: {
            showTitle: false,
          },
          render: (text: any) => {
            if (text === null || text === undefined) return '-';
            const textContent = extractTextContent(text);
            if (textContent !== null) {
              return (
                <Tooltip title={textContent} placement="topLeft">
                  <span className="eva-table-cell-text">{text}</span>
                </Tooltip>
              );
            }
            return text;
          },
        };
      });
    },
    [density, enableEllipsis, isSkippedColumn, extractTextContent],
  );

  /** 过滤可见列 */
  const visibleColumns = useMemo(() => {
    if (!columnConfigs) return processColumns(columns);
    const filtered = columns.filter((col: any) => {
      const key = col.key || col.dataIndex;
      return visibleColumnKeys.has(key as string);
    });
    return processColumns(filtered);
  }, [columns, columnConfigs, visibleColumnKeys, processColumns]);

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
        icon: <UnorderedListOutlined style={{ fontSize: 16 }} />,
        tooltip: '紧凑模式 - 适合查看大量数据',
      },
      {
        mode: 'default' as TableDensity,
        icon: <ColumnWidthOutlined style={{ fontSize: 16 }} />,
        tooltip: '标准模式 - 平衡信息显示',
      },
      {
        mode: 'comfortable' as TableDensity,
        icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
        tooltip: '宽松模式 - 适合详细数据展示',
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
    const hasColumnConfigs = columnConfigs && columnConfigs.length > 0;
    if (!hasColumnConfigs && !densityButtons) return null;

    return (
      <div className={styles.toolbar}>
        {/* 右侧：密度调节 + 列管理 */}
        <div className={styles.toolbarRight}>
          {/* 密度切换按钮组 */}
          <div className={styles.densityGroup}>
            {densityButtons.map((btn) => (
              <Tooltip key={btn.mode} title={btn.tooltip} placement="top">
                <Button
                  type={density === btn.mode ? 'primary' : 'default'}
                  size="small"
                  icon={btn.icon}
                  onClick={() => setDensity(btn.mode)}
                  className={styles.densityBtn}
                />
              </Tooltip>
            ))}
          </div>

          {/* 列管理按钮 */}
          {hasColumnConfigs && (
            <Popover
              content={columnManagerContent}
              title={
                <div className={styles.popoverTitle}>
                  <span>列管理</span>
                  <Tooltip title="自定义表格列的显示与隐藏，拖动列名可调整显示顺序" placement="top">
                    <QuestionCircleOutlined style={{ marginLeft: 8, color: '#8c8c8c', cursor: 'help' }} />
                  </Tooltip>
                </div>
              }
              trigger="click"
              open={columnManagerOpen}
              onOpenChange={setColumnManagerOpen}
              placement="bottomRight"
              overlayClassName={styles.columnManagerPopover}
            >
              <Tooltip title="管理表格列的显示与隐藏" placement="top">
                <Button
                  type={columnManagerOpen ? 'primary' : 'default'}
                  size="small"
                  icon={<SettingOutlined />}
                  className={styles.columnManagerBtn}
                >
                  列管理
                </Button>
              </Tooltip>
            </Popover>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.enhancedTableWrapper}>
      {/* 工具栏 */}
      {renderToolbar()}

      {/* 表格容器 */}
      <div className={`${styles.tableContainer} ${styles[`density-${density}`]}`}>
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
