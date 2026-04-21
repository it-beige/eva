import EnhancedTable from '../../../components/EnhancedTable';
import {
  Button,
  Tooltip,
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
      width: '40%',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text || '-'}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'output',
      dataIndex: 'output',
      key: 'output',
      width: '40%',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text || '-'}>
          <span>{text || '-'}</span>
        </Tooltip>
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
              <Tag className={metric.score >= 0.8 ? 'eva-pillTagGreen' : metric.score >= 0.6 ? 'eva-pillTagOrange' : 'eva-pillTagRed'}>
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
          <EnhancedTable
            columns={columns}
            dataSource={debugEvalResults}
            rowKey={(_, index) => `eval-${index}`}
            defaultDensity="compact"
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
