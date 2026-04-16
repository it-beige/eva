import React from 'react';
import { Card, Row, Col, Radio } from 'antd';
import { EvalType } from '@eva/shared';

interface EvalModeSelectorProps {
  evalType: EvalType;
  value?: string;
  onChange: (value: string) => void;
}

const modeOptions: Record<EvalType, Array<{ value: string; label: string; description: string }>> = {
  [EvalType.CODE]: [
    {
      value: 'single',
      label: '单个评测',
      description: '针对单个评测集单个AI应用发起一次评测任务',
    },
    {
      value: 'batch',
      label: '批量评测',
      description: '批量发起多条评测任务，支持配置多评测集多应用',
    },
  ],
  [EvalType.GENERAL]: [
    {
      value: 'simple',
      label: '简易模式',
      description: '简单配置评测所需要的评测集、评测集指标发起评测。',
    },
    {
      value: 'sdk',
      label: 'SDK模式',
      description: '动态生成的代码可在本地、线上环境运行。',
    },
  ],
  [EvalType.AUDIO]: [],
};

const EvalModeSelector: React.FC<EvalModeSelectorProps> = ({
  evalType,
  value,
  onChange,
}) => {
  const options = modeOptions[evalType];

  if (options.length === 0) {
    return null;
  }

  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%' }}
    >
      <Row gutter={[16, 16]}>
        {options.map((option) => (
          <Col span={12} key={option.value}>
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
                <div style={{ fontWeight: 500, fontSize: 16 }}>{option.label}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                  {option.description}
                </div>
              </Card>
            </Radio>
          </Col>
        ))}
      </Row>
    </Radio.Group>
  );
};

export default EvalModeSelector;
