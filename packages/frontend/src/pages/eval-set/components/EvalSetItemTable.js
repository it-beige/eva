import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Table, Space, Button, Popconfirm, Tag, Image, Typography, } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
const { Text } = Typography;
export const EvalSetItemTable = ({ items, loading, columns, visibleColumns, selectedRowKeys, onSelectChange, onEdit, onDelete, onViewCode, isCodeType = false, }) => {
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            onSelectChange(keys);
        },
    };
    const renderCellContent = (value) => {
        if (value === null || value === undefined) {
            return _jsx(Text, { type: "secondary", children: "-" });
        }
        if (typeof value === 'string') {
            // 检测是否为图片URL
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
                return (_jsx(Image, { src: value, alt: "image", style: { maxWidth: 80, maxHeight: 80, objectFit: 'cover' }, preview: { src: value } }));
            }
            // 检测是否为URL
            if (/^https?:\/\//.test(value)) {
                return (_jsx("a", { href: value, target: "_blank", rel: "noopener noreferrer", children: value.length > 50 ? `${value.slice(0, 50)}...` : value }));
            }
            return (_jsx("div", { style: {
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                }, title: value, children: value }));
        }
        if (typeof value === 'object') {
            return (_jsx("pre", { style: {
                    maxWidth: 300,
                    maxHeight: 100,
                    overflow: 'auto',
                    margin: 0,
                    fontSize: 12,
                }, children: JSON.stringify(value, null, 2) }));
        }
        return String(value);
    };
    const tableColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            fixed: 'left',
            render: (id) => (_jsxs(Text, { copyable: true, style: { fontFamily: 'monospace', fontSize: 12 }, children: [id.slice(0, 8), "..."] })),
        },
        ...columns
            .filter((col) => visibleColumns.includes(col))
            .map((col) => ({
            title: col,
            dataIndex: ['input', col],
            key: col,
            width: 200,
            render: (_, record) => {
                const value = record.input[col];
                return renderCellContent(value);
            },
        })),
        {
            title: 'output',
            dataIndex: ['output'],
            key: 'output',
            width: 200,
            render: (output) => {
                if (!output)
                    return _jsx(Text, { type: "secondary", children: "-" });
                return renderCellContent(output);
            },
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (_jsxs(Space, { size: "small", children: [isCodeType && onViewCode && (_jsx(Button, { type: "link", size: "small", icon: _jsx(EyeOutlined, {}), onClick: () => onViewCode(record), children: "\u67E5\u770B\u4EE3\u7801" })), _jsx(Button, { type: "link", size: "small", icon: _jsx(EditOutlined, {}), onClick: () => onEdit(record), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u8BA4\u5220\u9664", description: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u6570\u636E\u9879\u5417\uFF1F", onConfirm: () => onDelete(record.id), okText: "\u786E\u8BA4", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "link", danger: true, size: "small", icon: _jsx(DeleteOutlined, {}), children: "\u5220\u9664" }) })] })),
        },
    ];
    return (_jsx(Table, { rowKey: "id", dataSource: items, columns: tableColumns, loading: loading, rowSelection: rowSelection, pagination: false, scroll: { x: 'max-content' }, expandable: {
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
            expandedRowRender: (record) => (_jsxs("div", { style: { padding: 16, background: '#f5f5f5' }, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(Tag, { color: "blue", children: "Input" }), _jsx("pre", { style: {
                                    background: '#fff',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginTop: 8,
                                }, children: JSON.stringify(record.input, null, 2) })] }), record.output && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx(Tag, { color: "green", children: "Output" }), _jsx("pre", { style: {
                                    background: '#fff',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginTop: 8,
                                }, children: JSON.stringify(record.output, null, 2) })] })), record.metadata && (_jsxs("div", { children: [_jsx(Tag, { color: "orange", children: "Metadata" }), _jsx("pre", { style: {
                                    background: '#fff',
                                    padding: 12,
                                    borderRadius: 4,
                                    marginTop: 8,
                                }, children: JSON.stringify(record.metadata, null, 2) })] }))] })),
        } }));
};
export default EvalSetItemTable;
