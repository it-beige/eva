import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, Card, Descriptions, Tag, Spin, Empty, Button, } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchPrompt, fetchVersions } from '../../store/promptSlice';
import VersionCompare from './components/VersionCompare';
import styles from './Prompt.module.css';
const PromptDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentPrompt, versions, loading } = useAppSelector((state) => state.prompt);
    useEffect(() => {
        if (id) {
            dispatch(fetchPrompt(id));
            dispatch(fetchVersions(id));
        }
    }, [id, dispatch]);
    if (loading && !currentPrompt) {
        return (_jsx("div", { style: { padding: 24, textAlign: 'center' }, children: _jsx(Spin, { size: "large" }) }));
    }
    if (!currentPrompt) {
        return (_jsxs("div", { style: { padding: 24 }, children: [_jsx(Empty, { description: "Prompt \u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5220\u9664" }), _jsx("div", { style: { textAlign: 'center', marginTop: 16 }, children: _jsx(Button, { onClick: () => navigate('/eval/prompts'), children: "\u8FD4\u56DE\u5217\u8868" }) })] }));
    }
    return (_jsxs("div", { className: styles.detailContainer, children: [_jsxs(Breadcrumb, { className: styles.breadcrumb, children: [_jsx(Breadcrumb.Item, { children: _jsx(Link, { to: "/eval/prompts", children: "Prompt\u7BA1\u7406" }) }), _jsx(Breadcrumb.Item, { children: currentPrompt.name })] }), _jsx("div", { style: { marginBottom: 16 }, children: _jsx(Button, { icon: _jsx(ArrowLeftOutlined, {}), onClick: () => navigate('/eval/prompts'), children: "\u8FD4\u56DE" }) }), _jsx(Card, { title: "\u57FA\u672C\u4FE1\u606F", style: { marginBottom: 24 }, children: _jsxs(Descriptions, { column: 2, children: [_jsx(Descriptions.Item, { label: "\u540D\u79F0", children: currentPrompt.name }), _jsx(Descriptions.Item, { label: "\u7248\u672C\u53F7", children: _jsxs(Tag, { color: "blue", children: ["v", currentPrompt.version] }) }), _jsx(Descriptions.Item, { label: "\u63CF\u8FF0", children: currentPrompt.description || '-' }), _jsx(Descriptions.Item, { label: "\u521B\u5EFA\u4EBA", children: currentPrompt.createdBy || '-' }), _jsx(Descriptions.Item, { label: "\u521B\u5EFA\u65F6\u95F4", children: new Date(currentPrompt.createdAt).toLocaleString() }), _jsx(Descriptions.Item, { label: "\u66F4\u65B0\u65F6\u95F4", children: new Date(currentPrompt.updatedAt).toLocaleString() })] }) }), _jsx(Card, { title: "\u5F53\u524D Prompt \u5185\u5BB9", style: { marginBottom: 24 }, children: _jsx("pre", { style: {
                        background: '#f5f5f5',
                        padding: 16,
                        borderRadius: 4,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        lineHeight: 1.6,
                        maxHeight: 400,
                        overflow: 'auto',
                    }, children: currentPrompt.content }) }), _jsx(Card, { title: "\u7248\u672C\u5BF9\u6BD4", children: _jsx(VersionCompare, { versions: versions }) })] }));
};
export default PromptDetailPage;
