import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Tag, Button, Space, Popover, Input, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
const { useToken } = theme;
export const TagManager = ({ tags = [], onAddTag, onRemoveTag, readonly = false, }) => {
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
    const getTagColor = (tag) => {
        const index = tag.charCodeAt(0) % tagColors.length;
        return tagColors[index];
    };
    const addTagContent = (_jsxs("div", { style: { width: 200 }, children: [_jsx(Input, { autoFocus: true, placeholder: "\u8F93\u5165\u6807\u7B7E\u540D\u79F0", value: inputValue, onChange: (e) => setInputValue(e.target.value), onPressEnter: handleAddTag, style: { marginBottom: 8 } }), _jsx(Button, { type: "primary", size: "small", block: true, onClick: handleAddTag, children: "\u6DFB\u52A0" })] }));
    return (_jsxs(Space, { size: [8, 8], wrap: true, children: [tags.map((tag) => (_jsx(Tag, { color: getTagColor(tag), closable: !readonly, onClose: () => onRemoveTag(tag), style: { marginRight: 0 }, children: tag }, tag))), !readonly && (_jsx(Popover, { content: addTagContent, title: "\u6DFB\u52A0\u6807\u7B7E", trigger: "click", open: inputVisible, onOpenChange: setInputVisible, placement: "bottomLeft", children: _jsxs(Tag, { style: {
                        background: token.colorBgContainer,
                        borderStyle: 'dashed',
                        cursor: 'pointer',
                    }, children: [_jsx(PlusOutlined, {}), " \u6DFB\u52A0\u6807\u7B7E"] }) }))] }));
};
export default TagManager;
