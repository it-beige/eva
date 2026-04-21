import { useEffect, useState } from 'react';
import {
  Card,
  Tabs,
  Input,
  Checkbox,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Row,
  Col,
  Space,
} from 'antd';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { fetchEvalMetrics, setSelectedType } from '../../../store/evalMetricSlice';
import { MetricType, MetricScope, EvalMetric } from '@eva/shared';
import styles from './MetricSelector.module.scss';

const { Search } = Input;

interface MetricSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  selectedType?: MetricType;
  onTypeChange?: (type: MetricType) => void;
}

const MetricSelector = ({
  value = [],
  onChange,
  selectedType = MetricType.LLM,
  onTypeChange,
}: MetricSelectorProps) => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.evalMetric);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [scopeFilter, setScopeFilter] = useState<MetricScope | 'all'>('all');

  // 加载指标数据
  useEffect(() => {
    dispatch(fetchEvalMetrics({ type: selectedType }));
  }, [dispatch, selectedType]);

  // 过滤指标
  const filteredMetrics = items.filter((metric) => {
    // 类型过滤
    if (metric.type !== selectedType) return false;
    // 范围过滤
    if (scopeFilter !== 'all' && metric.scope !== scopeFilter) return false;
    // 关键字过滤
    if (searchKeyword && !metric.name.toLowerCase().includes(searchKeyword.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 处理指标选择
  const handleMetricToggle = (metricId: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, metricId]);
    } else {
      onChange?.(value.filter((id) => id !== metricId));
    }
  };

  // 处理类型切换
  const handleTypeChange = (activeKey: string) => {
    onTypeChange?.(activeKey as MetricType);
    dispatch(setSelectedType(activeKey as MetricType));
  };

  // 范围选项
  const scopeOptions = [
    { key: 'all', label: '全部' },
    { key: MetricScope.PUBLIC, label: '公共' },
    { key: MetricScope.PERSONAL, label: '自定义' },
  ];

  return (
    <div>
      {/* 创建指标链接 */}
      <div className={styles.header}>
        <span className={styles.required}>*</span>
        <a href="/eval/metrics" target="_blank" rel="noopener noreferrer">
          创建指标 →
        </a>
      </div>

      <Tabs
        activeKey={selectedType}
        onChange={handleTypeChange}
        items={[
          { key: MetricType.LLM, label: 'LLM指标' },
          { key: MetricType.CODE, label: 'Code指标' },
        ]}
      />

      {/* 搜索框 */}
      <Search
        placeholder="搜索指标名称"
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className={styles.search}
        allowClear
      />

      <Row gutter={16}>
        {/* 左侧范围筛选 */}
        <Col span={6}>
          <Card size="small" variant="borderless" className={styles.scopeCard}>
            <div className={styles.scopeList}>
              {scopeOptions.map((item) => (
                <div
                  key={item.key}
                  className={`${styles.scopeItem} ${
                    scopeFilter === item.key ? styles.scopeItemActive : ''
                  }`}
                  onClick={() => setScopeFilter(item.key as MetricScope | 'all')}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 右侧指标列表 */}
        <Col span={18}>
          <Spin spinning={loading}>
            {filteredMetrics.length > 0 ? (
              <div>
                {filteredMetrics.map((metric: EvalMetric) => (
                  <div
                    key={metric.id}
                    className={styles.metricRow}
                  >
                    <Checkbox
                      checked={value.includes(metric.id)}
                      onChange={(e) =>
                        handleMetricToggle(metric.id, e.target.checked)
                      }
                      className={styles.metricCheckbox}
                    >
                      <Space>
                        <span>{metric.name}</span>
                        <Tooltip title={metric.description || '暂无描述'}>
                          <InfoCircleOutlined className={styles.infoIcon} />
                        </Tooltip>
                        {metric.scope === MetricScope.PUBLIC && (
                          <Tag className="eva-pillTagBlue">
                            公共
                          </Tag>
                        )}
                      </Space>
                    </Checkbox>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                description="暂无指标"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default MetricSelector;
