import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { Row, Col, message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import PlaygroundConfig from './components/PlaygroundConfig';
import StreamOutput from './components/StreamOutput';
import { runPlaygroundStream, setOutput, setStreaming, setUsage, setDuration, clearOutput, addToHistory, } from '../../store/playgroundSlice';
const PlaygroundPage = () => {
    const dispatch = useAppDispatch();
    const { output, isStreaming, loading, usage, duration } = useAppSelector((state) => state.playground);
    const handleStreamEvent = useCallback((event) => {
        switch (event.type) {
            case 'chunk':
                if (event.data) {
                    dispatch(setOutput(output + event.data));
                }
                break;
            case 'done':
                dispatch(setStreaming(false));
                if (event.usage) {
                    dispatch(setUsage(event.usage));
                }
                if (event.duration) {
                    dispatch(setDuration(event.duration));
                }
                message.success('生成完成');
                break;
            case 'error':
                dispatch(setStreaming(false));
                message.error(event.error || '执行失败');
                break;
        }
    }, [dispatch, output]);
    const handleSubmit = (values) => {
        const request = {
            appId: values.appId,
            appVersion: values.appVersion,
            promptId: values.promptType === 'select' ? values.promptId : undefined,
            promptContent: values.promptType === 'custom' ? values.promptContent : undefined,
            input: values.input,
        };
        dispatch(setOutput(''));
        dispatch(setStreaming(true));
        dispatch(setUsage(null));
        dispatch(setDuration(null));
        dispatch(runPlaygroundStream({
            request,
            onEvent: handleStreamEvent,
        }));
    };
    const handleClear = () => {
        if (output) {
            dispatch(addToHistory({
                input: '',
                output,
            }));
        }
        dispatch(clearOutput());
    };
    return (_jsxs("div", { className: "h-full p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Playground" }), _jsxs(Row, { gutter: 24, className: "h-[calc(100%-60px)]", children: [_jsx(Col, { span: 10, className: "h-full", children: _jsx(PlaygroundConfig, { onSubmit: handleSubmit, onClear: handleClear, loading: isStreaming || loading }) }), _jsx(Col, { span: 14, className: "h-full", children: _jsx(StreamOutput, { output: output, isStreaming: isStreaming, usage: usage, duration: duration }) })] })] }));
};
export default PlaygroundPage;
