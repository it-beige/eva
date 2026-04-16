import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Radio, Space, Typography, Empty } from 'antd';
import styles from '../Prompt.module.css';
const { Text } = Typography;
const VersionCompare = ({ versions }) => {
    const [leftVersion, setLeftVersion] = useState('');
    const [rightVersion, setRightVersion] = useState('');
    useEffect(() => {
        if (versions.length >= 2) {
            setLeftVersion(versions[1]?.id || '');
            setRightVersion(versions[0]?.id || '');
        }
        else if (versions.length === 1) {
            setLeftVersion(versions[0]?.id || '');
            setRightVersion(versions[0]?.id || '');
        }
    }, [versions]);
    const leftContent = versions.find((v) => v.id === leftVersion)?.content || '';
    const rightContent = versions.find((v) => v.id === rightVersion)?.content || '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const renderDiff = (oldText, newText) => {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const maxLines = Math.max(oldLines.length, newLines.length);
        const result = [];
        for (let i = 0; i < maxLines; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';
            if (oldLine === newLine) {
                result.push(_jsx("div", { className: styles.diffLine, children: _jsx("span", { children: oldLine || ' ' }) }, i));
            }
            else {
                if (oldLine) {
                    result.push(_jsx("div", { className: styles.diffRemoved, children: _jsxs("span", { children: ["- ", oldLine] }) }, `old-${i}`));
                }
                if (newLine) {
                    result.push(_jsx("div", { className: styles.diffAdded, children: _jsxs("span", { children: ["+ ", newLine] }) }, `new-${i}`));
                }
            }
        }
        return result;
    };
    if (versions.length === 0) {
        return _jsx(Empty, { description: "\u6682\u65E0\u7248\u672C" });
    }
    return (_jsxs("div", { children: [_jsxs(Card, { size: "small", style: { marginBottom: 16 }, children: [_jsxs(Space, { children: [_jsx(Text, { children: "\u5DE6\u4FA7\u7248\u672C:" }), _jsx(Radio.Group, { value: leftVersion, onChange: (e) => setLeftVersion(e.target.value), optionType: "button", buttonStyle: "solid", size: "small", children: versions.map((v) => (_jsxs(Radio.Button, { value: v.id, children: ["v", v.version] }, v.id))) })] }), _jsxs(Space, { style: { marginLeft: 32 }, children: [_jsx(Text, { children: "\u53F3\u4FA7\u7248\u672C:" }), _jsx(Radio.Group, { value: rightVersion, onChange: (e) => setRightVersion(e.target.value), optionType: "button", buttonStyle: "solid", size: "small", children: versions.map((v) => (_jsxs(Radio.Button, { value: v.id, children: ["v", v.version] }, v.id))) })] })] }), _jsxs("div", { className: styles.compareContainer, children: [_jsxs("div", { className: styles.comparePanel, children: [_jsxs("div", { className: styles.comparePanelHeader, children: ["\u7248\u672C ", versions.find((v) => v.id === leftVersion)?.version || '-'] }), _jsx("pre", { className: styles.compareContent, children: leftContent })] }), _jsxs("div", { className: styles.comparePanel, children: [_jsxs("div", { className: styles.comparePanelHeader, children: ["\u7248\u672C ", versions.find((v) => v.id === rightVersion)?.version || '-'] }), _jsx("pre", { className: styles.compareContent, children: rightContent })] })] })] }));
};
export default VersionCompare;
