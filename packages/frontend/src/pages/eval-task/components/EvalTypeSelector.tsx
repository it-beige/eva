import React from 'react';
import { Card, Row, Col, Radio } from 'antd';
import {
  RobotOutlined,
  CodeOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { EvalType } from '@eva/shared';

interface EvalTypeSelectorProps {
  value: EvalType;
  onChange: (value: EvalType) => void;
}

const evalTypeOptions = [
  {
    value: EvalType.GENERAL,
    label: '通用Agent',
    icon: <RobotOutlined style={{ fontSize: 24 }} />,
    description: '适用于通用对话场景的AI Agent评测',
  },
  {
    value: EvalType.CODE,
    label: 'Code agent',
    icon: <CodeOutlined style={{ fontSize: 24 }} />,
    description: '适用于代码生成、代码理解等场景',
  },
  {
    value: EvalType.AUDIO,
    label: '音频 agent',
    icon: <AudioOutlined style={{ fontSize: 24 }} />,
    description: '适用于语音识别、语音合成等场景',
  },
];

const EvalTypeSelector: React.FC<EvalTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%' }}
    >
      <Row gutter={[16, 16]}>
        {evalTypeOptions.map((option) => (
          <Col span={8} key={option.value}>
            <Radio value={option.value} style={{ width: '100%' }}>
              <Card
                hoverable
                style={{
                  width: '100%',
                  borderColor: value === option.value ? '#1890ff' : undefined,
                  backgroundColor: value === option.value ? '#e6f7ff' : undefined,
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: value === option.value ? '#1890ff' : '#f0f0f0',
                      color: value === option.value ? '#fff' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16 }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {option.description}
                    </div>
                  </div>
                </div>
              </Card>
            </Radio>
          </Col>
        ))}
      </Row>
    </Radio.Group>
  );
};

export default EvalTypeSelector;
