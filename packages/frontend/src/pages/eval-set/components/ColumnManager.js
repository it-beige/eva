import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Popover, Checkbox, Button, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
export const ColumnManager = ({ allColumns, visibleColumns, onChange, }) => {
    const [open, setOpen] = useState(false);
    const handleChange = (checkedValues) => {
        onChange(checkedValues);
    };
    const handleSelectAll = () => {
        onChange([...allColumns]);
    };
    const handleClearAll = () => {
        onChange([]);
    };
    const content = (_jsxs("div", { style: { width: 200 }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                }, children: [_jsx(Button, { type: "link", size: "small", onClick: handleSelectAll, children: "\u5168\u9009" }), _jsx(Button, { type: "link", size: "small", onClick: handleClearAll, children: "\u6E05\u7A7A" })] }), _jsx(Divider, { style: { margin: '8px 0' } }), _jsx(Checkbox.Group, { value: visibleColumns, onChange: handleChange, style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: allColumns.map((col) => (_jsx(Checkbox, { value: col, children: col }, col))) })] }));
    return (_jsx(Popover, { content: content, title: "\u5217\u7BA1\u7406", trigger: "click", open: open, onOpenChange: setOpen, placement: "bottomRight", children: _jsx(Button, { icon: _jsx(SettingOutlined, {}), children: "\u5217\u7BA1\u7406" }) }));
};
export default ColumnManager;
