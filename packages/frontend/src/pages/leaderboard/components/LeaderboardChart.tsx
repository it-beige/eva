import React from 'react';
import { Card, Empty } from 'antd';
import { LeaderboardItem } from '../../../services/leaderboardApi';
import styles from './LeaderboardChart.module.scss';

interface LeaderboardChartProps {
  data: LeaderboardItem[];
  loading: boolean;
}

const LeaderboardChart: React.FC<LeaderboardChartProps> = ({ data, loading }) => {
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

    return Object.values(grouped)
      .map((app) => ({
        ...app,
        avgScore: app.scores.reduce((a, b) => a + b, 0) / app.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
  }, [data]);

  const maxScore = Math.max(...appScores.map((app) => app.avgScore), 100);

  if (appScores.length === 0) {
    return (
      <Card title="得分对比" loading={loading}>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  const getBarClass = (score: number) => {
    if (score >= 90) return styles.barFillGreen;
    if (score >= 75) return styles.barFillBlue;
    if (score >= 60) return styles.barFillOrange;
    return styles.barFillRed;
  };

  return (
    <Card title="得分对比" loading={loading}>
      <div className={styles.barList}>
        {appScores.map((app, index) => {
          const percentage = (app.avgScore / maxScore) * 100;
          return (
            <div key={app.name} className={styles.barRow}>
              <div className={styles.barRank}>{index + 1}</div>
              <div className={styles.barName} title={app.name}>
                {app.name}
              </div>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${getBarClass(app.avgScore)}`}
                  style={{ width: `${percentage}%` }}
                >
                  <span className={styles.barScore}>
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
