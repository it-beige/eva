import React from 'react';
import { Card, Empty } from 'antd';
import { LeaderboardItem } from '../../../services/leaderboardApi';

interface LeaderboardChartProps {
  data: LeaderboardItem[];
  loading: boolean;
}

const LeaderboardChart: React.FC<LeaderboardChartProps> = ({ data, loading }) => {
  // 按应用聚合得分数据
  const appScores = React.useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.appName]) {
        acc[item.appName] = {
          name: item.appName,
          scores: [],
          avgScore: 0,
        };
      }
      acc[item.appName].scores.push(item.score);
      return acc;
    }, {} as Record<string, { name: string; scores: number[]; avgScore: number }>);

    // 计算平均分并排序
    return Object.values(grouped)
      .map((app) => ({
        ...app,
        avgScore: app.scores.reduce((a, b) => a + b, 0) / app.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10); // 只显示前10
  }, [data]);

  const maxScore = Math.max(...appScores.map((app) => app.avgScore), 100);

  if (appScores.length === 0) {
    return (
      <Card title="得分对比" loading={loading}>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  return (
    <Card title="得分对比" loading={loading}>
      <div className="space-y-3">
        {appScores.map((app, index) => {
          const percentage = (app.avgScore / maxScore) * 100;
          let barColor = 'bg-red-500';
          if (app.avgScore >= 90) barColor = 'bg-green-500';
          else if (app.avgScore >= 75) barColor = 'bg-blue-500';
          else if (app.avgScore >= 60) barColor = 'bg-orange-500';

          return (
            <div key={app.name} className="flex items-center gap-3">
              <div className="w-8 text-center font-bold text-gray-500">
                {index + 1}
              </div>
              <div className="w-32 truncate text-sm" title={app.name}>
                {app.name}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {app.avgScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default LeaderboardChart;
