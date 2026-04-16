import React, { useRef, useEffect } from 'react';
import { Card, Typography, Space, Tag, Spin } from 'antd';
import { ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';

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

  // 自动滚动到底部
  useEffect(() => {
    if (outputRef.current && isStreaming) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isStreaming]);

  return (
    <Card
      title="输出结果"
      className="h-full"
      styles={{ body: { padding: 0, height: 'calc(100% - 56px)' } }}
    >
      <div className="flex flex-col h-full">
        {/* 输出内容区域 */}
        <div
          ref={outputRef}
          className="flex-1 p-4 overflow-auto bg-gray-50 font-mono text-sm whitespace-pre-wrap"
          style={{ minHeight: '300px' }}
        >
          {output ? (
            <Text>{output}</Text>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
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
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
          )}
        </div>

        {/* Token 统计区域 */}
        {(usage || duration) && (
          <div className="p-3 border-t bg-gray-50">
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
