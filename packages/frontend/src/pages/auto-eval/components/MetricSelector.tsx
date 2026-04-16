import { useEffect, useState } from 'react';
import {
  Card,
  Tabs,
  Input,
  Checkbox,
  List,
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

const { TabPane } = Tabs;
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#ff4d4f' }}>*</span>
        <a href="/eval-metric" target="_blank" rel="noopener noreferrer">
          创建指标 →
        </a>
      </div>

      {/* 类型 Tab */}
      <Tabs activeKey={selectedType} onChange={handleTypeChange}>
        <TabPane tab="LLM指标" key={MetricType.LLM} />
        <TabPane tab="Code指标" key={MetricType.CODE} />
      </Tabs>

      {/* 搜索框 */}
      <Search
        placeholder="搜索指标名称"
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ marginBottom: 16 }}
        allowClear
      />

      <Row gutter={16}>
        {/* 左侧范围筛选 */}
        <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#f5f5f5' }}>
            <List
              dataSource={scopeOptions}
              renderItem={(item) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: scopeFilter === item.key ? '#e6f7ff' : 'transparent',
                    padding: '8px 12px',
                    borderRadius: 4,
                  }}
                  onClick={() => setScopeFilter(item.key as MetricScope | 'all')}
                >
                  {item.label}
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 右侧指标列表 */}
        <Col span={18}>
          <Spin spinning={loading}>
            {filteredMetrics.length > 0 ? (
              <List
                dataSource={filteredMetrics}
                renderItem={(metric: EvalMetric) => (
                  <List.Item
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <Checkbox
                      checked={value.includes(metric.id)}
                      onChange={(e) =>
                        handleMetricToggle(metric.id, e.target.checked)
                      }
                      style={{ width: '100%' }}
                    >
                      <Space>
                        <span>{metric.name}</span>
                        <Tooltip title={metric.description || '暂无描述'}>
                          <InfoCircleOutlined style={{ color: '#999' }} />
                        </Tooltip>
                        {metric.scope === MetricScope.PUBLIC && (
                          <Tag size="small" color="blue">
                            公共
                          </Tag>
                        )}
                      </Space>
                    </Checkbox>
                  </List.Item>
                )}
              />
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
