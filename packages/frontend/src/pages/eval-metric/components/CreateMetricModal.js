import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal, Form, Card, Typography, Space, Radio, message, } from 'antd';
import { RobotOutlined, CodeOutlined, } from '@ant-design/icons';
import LlmMetricForm from './LlmMetricForm';
import CodeMetricForm from './CodeMetricForm';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { createEvalMetric, updateEvalMetric, hideCreateModal, setEditingMetric, } from '../../../store/evalMetricSlice';
import { MetricType } from '@eva/shared';
const { Text } = Typography;
const CreateMetricModal = ({ visible, editingMetric, }) => {
    const dispatch = useAppDispatch();
    const { creating, updating, currentScope } = useAppSelector((state) => state.evalMetric);
    const [form] = Form.useForm();
    const [metricType, setMetricType] = useState(MetricType.LLM);
    // 当编辑时，设置表单初始值
    useEffect(() => {
        if (visible && editingMetric) {
            setMetricType(editingMetric.type);
            form.setFieldsValue({
                name: editingMetric.name,
                description: editingMetric.description,
                prompt: editingMetric.prompt,
                codeRepoUrl: editingMetric.codeRepoUrl,
                codeBranch: editingMetric.codeBranch || 'master',
            });
        }
        else if (visible) {
            // 新建时重置表单
            setMetricType(MetricType.LLM);
            form.resetFields();
        }
    }, [visible, editingMetric, form]);
    const handleCancel = () => {
        dispatch(hideCreateModal());
        dispatch(setEditingMetric(null));
        form.resetFields();
        setMetricType(MetricType.LLM);
    };
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                ...values,
                type: metricType,
                scope: currentScope,
            };
            if (editingMetric) {
                // 更新
                await dispatch(updateEvalMetric({ id: editingMetric.id, data })).unwrap();
                message.success('更新成功');
            }
            else {
                // 创建
                await dispatch(createEvalMetric(data)).unwrap();
                message.success('创建成功');
            }
            handleCancel();
        }
        catch (error) {
            // 表单验证失败或请求失败
            if (error.message) {
                message.error(error.message);
            }
        }
    };
    const handleTypeChange = (type) => {
        setMetricType(type);
        // 切换类型时重置表单，但保留名称和描述
        const currentValues = form.getFieldsValue(['name', 'description']);
        form.resetFields();
        form.setFieldsValue(currentValues);
    };
    const metricTypeCards = [
        {
            type: MetricType.LLM,
            icon: _jsx(RobotOutlined, { style: { fontSize: 24, color: '#1890ff' } }),
            title: 'LLM类型指标',
            description: 'LLM充当裁判对输出质量，需要配置LLM的裁判定位。',
        },
        {
            type: MetricType.CODE,
            icon: _jsx(CodeOutlined, { style: { fontSize: 24, color: '#52c41a' } }),
            title: 'Code类型指标',
            description: '通过代码对输出进行功能性或格式性检查。',
        },
    ];
    return (_jsx(Modal, { title: editingMetric ? '编辑评估指标' : '新建评估指标', open: visible, onOk: handleOk, onCancel: handleCancel, width: 720, confirmLoading: editingMetric ? updating : creating, okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsxs(Form, { form: form, layout: "vertical", autoComplete: "off", children: [_jsx(Form.Item, { label: "\u6307\u6807\u7C7B\u578B", required: true, style: { marginBottom: 24 }, children: _jsx(Radio.Group, { value: metricType, onChange: (e) => handleTypeChange(e.target.value), style: { width: '100%' }, children: _jsx(Space, { direction: "vertical", style: { width: '100%' }, size: "middle", children: metricTypeCards.map((card) => (_jsx(Card, { size: "small", style: {
                                    cursor: 'pointer',
                                    borderColor: metricType === card.type ? '#1890ff' : '#d9d9d9',
                                    backgroundColor: metricType === card.type ? '#e6f7ff' : '#fff',
                                }, onClick: () => handleTypeChange(card.type), children: _jsx(Radio, { value: card.type, style: { width: '100%' }, children: _jsxs(Space, { align: "start", children: [card.icon, _jsxs("div", { children: [_jsx(Text, { strong: true, children: card.title }), _jsx("br", {}), _jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: card.description })] })] }) }) }, card.type))) }) }) }), metricType === MetricType.LLM ? (_jsx(LlmMetricForm, { form: form })) : (_jsx(CodeMetricForm, { form: form }))] }) }));
};
export default CreateMetricModal;
