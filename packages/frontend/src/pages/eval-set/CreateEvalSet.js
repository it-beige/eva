import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { CreateEvalSetModal } from './components/CreateEvalSetModal';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createEvalSet } from '../../store/evalSetSlice';
const CreateEvalSetPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.evalSet);
    const [modalOpen, setModalOpen] = useState(true);
    const handleSubmit = async (values) => {
        try {
            const result = await dispatch(createEvalSet(values)).unwrap();
            message.success('评测集创建成功');
            setModalOpen(false);
            // 跳转到详情页
            navigate(`/eval/datasets/${result.id}`);
        }
        catch (error) {
            message.error('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    };
    const handleCancel = () => {
        setModalOpen(false);
        navigate('/eval/datasets');
    };
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsxs(Card, { bordered: false, children: [_jsx(Button, { icon: _jsx(ArrowLeftOutlined, {}), onClick: () => navigate('/eval/datasets'), style: { marginBottom: 16 }, children: "\u8FD4\u56DE\u5217\u8868" }), _jsx("div", { style: { textAlign: 'center', padding: '40px 0' }, children: _jsx("h3", { children: "\u6B63\u5728\u521B\u5EFA\u8BC4\u6D4B\u96C6..." }) })] }), _jsx(CreateEvalSetModal, { open: modalOpen, onCancel: handleCancel, onSubmit: handleSubmit, loading: creating })] }));
};
export default CreateEvalSetPage;
