import { Button, Card, Progress, Space, Statistic, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageContainer from '../../components/page/PageContainer';

const { Text, Title } = Typography;

type QualityItem = {
  key: string;
  scenario: string;
  score: number;
  trend: string;
  owner: string;
};

const qualityColumns: ColumnsType<QualityItem> = [
  {
    title: '评测场景',
    dataIndex: 'scenario',
    key: 'scenario',
  },
  {
    title: '健康分',
    dataIndex: 'score',
    key: 'score',
    render: (value: number) => `${value}/100`,
  },
  {
    title: '趋势',
    dataIndex: 'trend',
    key: 'trend',
    render: (value: string) => <Tag color={value === '上升' ? 'success' : 'warning'}>{value}</Tag>,
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner',
  },
];

const qualityData: QualityItem[] = [
  { key: '1', scenario: '智能客服主链路', score: 94, trend: '上升', owner: '策略组' },
  { key: '2', scenario: '销售外呼摘要', score: 89, trend: '上升', owner: '增长组' },
  { key: '3', scenario: '工单分派助手', score: 83, trend: '波动', owner: '平台组' },
];

const pendingItems = [
  '回访近 7 天质量分下滑的应用版本',
  '补齐自动化评测覆盖率不足 80% 的业务线',
  '追踪异常请求来源与高频失败 Prompt',
];

const AnalyticsPage = () => {
  return (
    <PageContainer
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          新建分析视图
        </Button>
      }
      content={
        <div className="eva-panelGrid">
          <Card className="eva-statCard">
            <Statistic title="接入应用" value={12} suffix="个" />
          </Card>
          <Card className="eva-statCard">
            <Statistic title="今日调用" value={12890} suffix="次" />
          </Card>
          <Card className="eva-statCard">
            <Statistic title="综合质量分" value={92.6} suffix="/100" precision={1} />
          </Card>
        </div>
      }
    >
      <div className="eva-dashboardSplit">
        <Card>
          <Space orientation="vertical" size={18} style={{ width: '100%' }}>
            <div>
              <Text className="eva-sectionLabel">质量概览</Text>
              <Title level={4} style={{ margin: '8px 0 0' }}>
                核心业务健康度
              </Title>
            </div>
            <Progress percent={93} strokeColor="#ff8a3d" railColor="rgba(255,255,255,0.06)" />
            <Table columns={qualityColumns} dataSource={qualityData} pagination={false} />
          </Space>
        </Card>

        <Card>
          <Space orientation="vertical" size={18} style={{ width: '100%' }}>
            <div>
              <Text className="eva-sectionLabel">运营待办</Text>
              <Title level={4} style={{ margin: '8px 0 0' }}>
                今日重点动作
              </Title>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pendingItems.map((item, index) => (
                <Space key={item} align="start">
                  <Tag color="orange">{index + 1}</Tag>
                  <Text>{item}</Text>
                </Space>
              ))}
            </div>
          </Space>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AnalyticsPage;
