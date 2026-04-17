import React, { useRef, useEffect } from 'react';
import { Card, Typography, Space, Tag, Spin } from 'antd';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import styles from './StreamOutput.module.scss';

const { Text } = Typography;

interface StreamOutputProps {
  output: string;
  isStreaming: boolean;
  usage: {
    inputTokens: number;
    outputTokens: number;
  } | null;
  duration: number | null;
}

const StreamOutput: React.FC<StreamOutputProps> = ({
  output,
  isStreaming,
  usage,
  duration,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current && isStreaming) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isStreaming]);

  return (
    <Card
      title="输出结果"
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.wrapper}>
        <div ref={outputRef} className={styles.outputArea}>
          {output ? (
            <>
              <Text>{output}</Text>
              {isStreaming && <span className={styles.cursor} />}
            </>
          ) : (
            <div className={styles.placeholder}>
              {isStreaming ? (
                <Space>
                  <Spin size="small" />
                  <span>正在生成...</span>
                </Space>
              ) : (
                <span>输出内容将显示在这里</span>
              )}
            </div>
          )}
        </div>

        {(usage || duration) && (
          <div className={styles.statsBar}>
            <Space size="large">
              {usage && (
                <>
                  <Tag icon={<FileTextOutlined />} color="blue">
                    输入: {usage.inputTokens} tokens
                  </Tag>
                  <Tag icon={<FileTextOutlined />} color="green">
                    输出: {usage.outputTokens} tokens
                  </Tag>
                </>
              )}
              {duration && (
                <Tag icon={<ClockCircleOutlined />} color="orange">
                  耗时: {duration}ms
                </Tag>
              )}
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StreamOutput;
