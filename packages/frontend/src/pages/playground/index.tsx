import React, { useCallback } from 'react';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import PlaygroundConfig from './components/PlaygroundConfig';
import StreamOutput from './components/StreamOutput';
import PageContainer from '../../components/page/PageContainer';
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
import styles from './PlaygroundPage.module.scss';

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
    <PageContainer
      description="选择 AI 应用和 Prompt，输入测试数据，实时查看模型输出结果。"
    >
      <div className={styles.contentGrid}>
        <PlaygroundConfig
          onSubmit={handleSubmit}
          onClear={handleClear}
          loading={isStreaming || loading}
        />
        <StreamOutput
          output={output}
          isStreaming={isStreaming}
          usage={usage}
          duration={duration}
        />
      </div>
    </PageContainer>
  );
};

export default PlaygroundPage;
