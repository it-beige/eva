import React, { useCallback } from 'react';
import { Row, Col, message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import PlaygroundConfig from './components/PlaygroundConfig';
import StreamOutput from './components/StreamOutput';
import {
  runPlaygroundStream,
  appendOutput,
  setOutput,
  setStreaming,
  setUsage,
  setDuration,
  clearOutput,
  addToHistory,
} from '../../store/playgroundSlice';
import { PlaygroundStreamEvent } from '../../services/playgroundApi';

const PlaygroundPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { output, isStreaming, loading, usage, duration } = useAppSelector(
    (state) => state.playground
  );

  const handleStreamEvent = useCallback(
    (event: PlaygroundStreamEvent) => {
      switch (event.type) {
        case 'chunk':
          if (event.data) {
            dispatch(appendOutput(event.data));
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
    },
    [dispatch]
  );

  const handleSubmit = (values: {
    appId: string;
    appVersion: string;
    promptType: 'select' | 'custom';
    promptId?: string;
    promptContent?: string;
    input: string;
  }) => {
    const request = {
      appId: values.appId,
      appVersion: values.appVersion,
      promptId: values.promptType === 'select' ? values.promptId : undefined,
      promptContent:
        values.promptType === 'custom' ? values.promptContent : undefined,
      input: values.input,
    };

    dispatch(setOutput(''));
    dispatch(setStreaming(true));
    dispatch(setUsage(null));
    dispatch(setDuration(null));

    dispatch(
      runPlaygroundStream({
        request,
        onEvent: handleStreamEvent,
      })
    );
  };

  const handleClear = () => {
    if (output) {
      dispatch(
        addToHistory({
          input: '',
          output,
        })
      );
    }
    dispatch(clearOutput());
  };

  return (
    <div className="h-full p-6">
      <h1 className="text-2xl font-bold mb-6">Playground</h1>
      <Row gutter={24} className="h-[calc(100%-60px)]">
        <Col span={10} className="h-full">
          <PlaygroundConfig
            onSubmit={handleSubmit}
            onClear={handleClear}
            loading={isStreaming || loading}
          />
        </Col>
        <Col span={14} className="h-full">
          <StreamOutput
            output={output}
            isStreaming={isStreaming}
            usage={usage}
            duration={duration}
          />
        </Col>
      </Row>
    </div>
  );
};

export default PlaygroundPage;
