import { Select, Input, Button, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import styles from './FilterRuleBuilder.module.scss';

const { Option } = Select;

interface FilterRuleBuilderProps {
  value?: { conditions: Array<{ field: string; operator: string; value: string }> };
  onChange?: (value: { conditions: Array<{ field: string; operator: string; value: string }> }) => void;
}

// 可选字段
const fieldOptions = [
  { value: 'traceId', label: 'Trace ID' },
  { value: 'sessionId', label: 'Session ID' },
  { value: 'userId', label: '用户 ID' },
  { value: 'input', label: '输入内容' },
  { value: 'output', label: '输出内容' },
  { value: 'status', label: '状态' },
  { value: 'sourceProject', label: '来源项目' },
];

// 操作符选项
const operatorOptions = [
  { value: 'equals', label: '等于' },
  { value: 'contains', label: '包含' },
  { value: 'startsWith', label: '开头是' },
  { value: 'endsWith', label: '结尾是' },
  { value: 'gt', label: '大于' },
  { value: 'gte', label: '大于等于' },
  { value: 'lt', label: '小于' },
  { value: 'lte', label: '小于等于' },
];

const FilterRuleBuilder = ({ value, onChange }: FilterRuleBuilderProps) => {
  const conditions = value?.conditions || [];

  const handleAdd = () => {
    const newConditions = [
      ...conditions,
      { field: 'traceId', operator: 'equals', value: '' },
    ];
    onChange?.({ conditions: newConditions });
  };

  const handleRemove = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    onChange?.({ conditions: newConditions });
  };

  const handleFieldChange = (index: number, field: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], field };
    onChange?.({ conditions: newConditions });
  };

  const handleOperatorChange = (index: number, operator: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], operator };
    onChange?.({ conditions: newConditions });
  };

  const handleValueChange = (index: number, valueStr: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], value: valueStr };
    onChange?.({ conditions: newConditions });
  };

  return (
    <div>
      {conditions.map((condition, index) => (
        <Row key={index} gutter={8} className={styles.ruleRow} align="middle">
          <Col flex="120px">
            <Select
              value={condition.field}
              onChange={(val) => handleFieldChange(index, val)}
              className={styles.fullWidth}
              placeholder="选择字段"
            >
              {fieldOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col flex="120px">
            <Select
              value={condition.operator}
              onChange={(val) => handleOperatorChange(index, val)}
              className={styles.fullWidth}
              placeholder="操作符"
            >
              {operatorOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col flex="auto">
            <Input
              value={condition.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder="输入值"
            />
          </Col>
          <Col flex="32px">
            <Button
              type="text"
              icon={<MinusCircleOutlined />}
              onClick={() => handleRemove(index)}
              danger
            />
          </Col>
        </Row>
      ))}
      <Button
        type="dashed"
        onClick={handleAdd}
        icon={<PlusOutlined />}
        className={styles.fullWidth}
      >
        Add filter
      </Button>
    </div>
  );
};

export default FilterRuleBuilder;
