import { useState } from 'react';
import {
  Card,
  DatePicker,
  Button,
  Table,
  Empty,
  Spin,
  message,
  Typography,
} from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { debugFilter } from '../../../store/autoEvalSlice';
import type { FilterRules } from '../../../services/autoEvalApi';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DebugFilterPanelProps {
  filterRules?: FilterRules;
  sampleRate?: number;
}

interface DebugResult {
  traceId: string;
  duration: number;
  calledAt: string;
}

const DebugFilterPanel = ({ filterRules, sampleRate }: DebugFilterPanelProps) => {
  const dispatch = useAppDispatch();
  const { debugFilterResults, debugLoading } = useAppSelector((state) => state.autoEval);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const handleDebug = () => {
    if (!dateRange) {
      message.warning('请选择样本时间范围');
      return;
    }

    dispatch(
      debugFilter({
        startTime: dateRange[0],
        endTime: dateRange[1],
        filterRules,
        sampleRate,
      }),
    );
  };

  const columns: ColumnsType<DebugResult> = [
    {
      title: 'TraceID',
      dataIndex: 'traceId',
      key: 'traceId',
      ellipsis: true,
    },
    {
      title: '耗时 (ms)',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (val: number) => val || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: () => <a>查看</a>,
    },
  ];

  return (
    <div>
      {/* 时间选择 */}
      <div style={{ marginBottom: 16 }}>
        <Text style={{ marginRight: 8 }}>样本时间</Text>
        <RangePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          placeholder={['Start date', 'End date']}
          onChange={(_, dateStrings) => {
            if (dateStrings[0] && dateStrings[1]) {
              setDateRange(dateStrings as [string, string]);
            } else {
              setDateRange(null);
            }
          }}
          style={{ width: 320 }}
        />
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleDebug}
          loading={debugLoading}
          style={{ marginLeft: 8 }}
        >
          调试运行
        </Button>
      </div>

      {/* 结果表格 */}
      <Spin spinning={debugLoading}>
        {debugFilterResults.length > 0 ? (
          <Table
            columns={columns}
            dataSource={debugFilterResults}
            rowKey="traceId"
            size="small"
            pagination={false}
            scroll={{ y: 200 }}
          />
        ) : (
          <Empty
            description="No data"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 40 }}
          />
        )}
      </Spin>
    </div>
  );
};

export default DebugFilterPanel;
