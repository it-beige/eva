import {
  Button,
  Table,
  Empty,
  Spin,
  message,
  Tag,
} from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { debugEval } from '../../../store/autoEvalSlice';
import type { FilterRules } from '../../../services/autoEvalApi';
import type { ColumnsType } from 'antd/es/table';
import styles from './DebugEvalPanel.module.scss';

interface DebugEvalPanelProps {
  filterRules?: FilterRules;
  sampleRate?: number;
  dateRange?: [string, string] | null;
}

interface DebugEvalResult {
  input: string;
  output: string;
  metrics: Array<{
    metricId: string;
    metricName: string;
    score: number;
  }>;
}

const DebugEvalPanel = ({ filterRules, sampleRate, dateRange }: DebugEvalPanelProps) => {
  const dispatch = useAppDispatch();
  const { debugEvalResults, debugLoading } = useAppSelector((state) => state.autoEval);

  const handleDebug = () => {
    if (!dateRange) {
      message.warning('请先在调试过滤面板选择样本时间范围');
      return;
    }

    dispatch(
      debugEval({
        startTime: dateRange[0],
        endTime: dateRange[1],
        filterRules,
        sampleRate,
      }),
    );
  };

  const columns: ColumnsType<DebugEvalResult> = [
    {
      title: 'input',
      dataIndex: 'input',
      key: 'input',
      ellipsis: true,
      width: '40%',
      render: (text: string) => (
        <div className={styles.preview}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'output',
      dataIndex: 'output',
      key: 'output',
      ellipsis: true,
      width: '40%',
      render: (text: string) => (
        <div className={styles.preview}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: '评测结果',
      key: 'metrics',
      width: '20%',
      render: (_, record) => (
        <div>
          {record.metrics?.map((metric) => (
            <div key={metric.metricId} className={styles.metricLine}>
              <Tag color={metric.score >= 0.8 ? 'success' : metric.score >= 0.6 ? 'warning' : 'error'}>
                {metric.metricName}: {(metric.score * 100).toFixed(1)}%
              </Tag>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 调试按钮 */}
      <div className={styles.actions}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleDebug}
          loading={debugLoading}
        >
          调试运行
        </Button>
      </div>

      {/* 结果表格 */}
      <Spin spinning={debugLoading}>
        {debugEvalResults.length > 0 ? (
          <Table
            columns={columns}
            dataSource={debugEvalResults}
            rowKey={(_, index) => `eval-${index}`}
            size="small"
            pagination={false}
            scroll={{ y: 200 }}
          />
        ) : (
          <Empty
            description="No data"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className={styles.empty}
          />
        )}
      </Spin>
    </div>
  );
};

export default DebugEvalPanel;
