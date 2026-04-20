# EnhancedTable 增强型表格组件

基于 Ant Design Table 封装的企业级表格组件，提供列管理和密度切换功能。

## 功能特性

✅ **列管理功能**
- 列显示/隐藏控制
- 全部显示/全部隐藏快捷操作
- 列配置持久化（可扩展）

✅ **三种密度模式**
- **紧凑模式**（compact）：单元格 padding 8px 12px
- **标准模式**（default）：单元格 padding 12px 16px
- **宽松模式**（comfortable）：单元格 padding 16px 20px

✅ **完全兼容 Ant Design Table API**
- 所有 Table Props 透传
- 类型安全（TypeScript）
- 自定义样式支持

## 使用示例

### 基础用法

```tsx
import EnhancedTable, { type ColumnConfig } from '@/components/EnhancedTable';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

const columns: ColumnsType<DataType> = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '地址', dataIndex: 'address', key: 'address' },
];

const columnConfigs: ColumnConfig[] = [
  { key: 'name', title: '姓名', defaultVisible: true },
  { key: 'age', title: '年龄', defaultVisible: true },
  { key: 'address', title: '地址', defaultVisible: false },
];

function MyTable() {
  return (
    <EnhancedTable<DataType>
      columns={columns}
      columnConfigs={columnConfigs}
      dataSource={data}
      rowKey="key"
    />
  );
}
```

### 完整示例（含分页、排序、筛选）

```tsx
import { useState, useCallback } from 'react';
import EnhancedTable, { type ColumnConfig } from '@/components/EnhancedTable';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';

interface ProjectItem {
  projectId: string;
  projectName: string;
  source: string;
  userCount: number;
  createTime: string;
}

const ProjectTable = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const columns: ColumnsType<ProjectItem> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '项目来源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: true,
    },
  ];

  const columnConfigs: ColumnConfig[] = [
    { key: 'projectName', title: '项目名称' },
    { key: 'source', title: '项目来源' },
    { key: 'userCount', title: '用户数' },
    { key: 'createTime', title: '创建时间' },
  ];

  const handleTableChange = useCallback((
    pagination: TablePaginationConfig,
    _filters: any,
    sorter: SorterResult<ProjectItem> | SorterResult<ProjectItem>[]
  ) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
    
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s?.field) {
      setSortBy(s.field as string);
      setSortOrder(s.order === 'ascend' ? 'asc' : 'desc');
    }
  }, []);

  return (
    <EnhancedTable<ProjectItem>
      rowKey="projectId"
      columns={columns}
      columnConfigs={columnConfigs}
      dataSource={projects}
      loading={loading}
      onTableChange={handleTableChange}
      pagination={{
        current: page,
        pageSize,
        total: total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (t) => `共 ${t} 个项目`,
      }}
    />
  );
};
```

## API

### EnhancedTable Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | Ant Design Table 列配置 | `ColumnsType<T>` | - |
| columnConfigs | 列配置列表（用于列管理） | `ColumnConfig[]` | - |
| density | 表格密度模式 | `'compact' \| 'default' \| 'comfortable'` | `'default'` |
| pagination | 分页配置 | `TablePaginationConfig \| false` | - |
| defaultSortBy | 默认排序字段 | `string` | - |
| defaultSortOrder | 默认排序方式 | `'asc' \| 'desc'` | `'desc'` |
| onTableChange | 表格变化回调 | `(pagination, filters, sorter) => void` | - |
| ...tableProps | 其他 Table Props | `TableProps<T>` | - |

> 注：所有未列出的 Ant Design Table Props 均可直接传递

### ColumnConfig

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| key | 列的唯一标识（对应 column 的 key 或 dataIndex） | `string` | - |
| title | 列显示名称（在列管理弹窗中显示） | `string` | - |
| defaultVisible | 是否默认显示 | `boolean` | `true` |

## 样式定制

组件使用 CSS Modules，可通过覆盖以下变量定制样式：

```scss
// 主题变量
--eva-primary: #5A63FF;        // 主色调
--eva-border: #E3E8F5;         // 边框色
--eva-split: #EEF2F8;          // 分割线色
--eva-text: #2F3542;           // 文字色
--eva-primary-hover: #4850E0;  // 主色悬停
```

## 注意事项

1. **列 key 唯一性**：确保每个 column 都有唯一的 `key` 或 `dataIndex`，否则列管理功能可能异常
2. **columnConfigs 与 columns 对应**：`columnConfigs` 中的 `key` 必须与 `columns` 中的 `key` 或 `dataIndex` 一致
3. **性能优化**：`columnConfigs` 建议使用 `useMemo` 缓存，避免不必要的重渲染
4. **固定列支持**：支持 `fixed: 'left'` 或 `fixed: 'right'` 的固定列配置

## 示例项目

查看实际使用示例：
- [项目管理页面](../../../pages/project/index.tsx)
- [评测集页面](../../../pages/eval-set/)（待集成）
