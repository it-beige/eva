import React from 'react';
import { Card, Row, Col, Radio } from 'antd';
import {
  RobotOutlined,
  CodeOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { EvalType } from '@eva/shared';
import styles from './EvalTypeSelector.module.scss';

interface EvalTypeSelectorProps {
  value: EvalType;
  onChange: (value: EvalType) => void;
}

const evalTypeOptions = [
  {
    value: EvalType.GENERAL,
    label: '通用Agent',
    Icon: RobotOutlined,
    description: '适用于通用对话场景的AI Agent评测',
  },
  {
    value: EvalType.CODE,
    label: 'Code agent',
    Icon: CodeOutlined,
    description: '适用于代码生成、代码理解等场景',
  },
  {
    value: EvalType.AUDIO,
    label: '音频 agent',
    Icon: AudioOutlined,
    description: '适用于语音识别、语音合成等场景',
  },
];

const EvalTypeSelector: React.FC<EvalTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <Radio.Group
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.group}
    >
      <Row gutter={[16, 16]}>
        {evalTypeOptions.map((option) => (
          <Col span={8} key={option.value}>
            <Radio value={option.value} className={styles.radio}>
              <Card
                hoverable
                className={`${styles.optionCard} ${
                  value === option.value ? styles.optionCardActive : ''
                }`}
              >
                <div className={styles.optionContent}>
                  <div
                    className={`${styles.iconSurface} ${
                      value === option.value ? styles.iconSurfaceActive : ''
                    }`}
                  >
                    <option.Icon className={styles.optionIcon} />
                  </div>
                  <div>
                    <div className={styles.optionTitle}>{option.label}</div>
                    <div className={styles.optionDescription}>{option.description}</div>
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
