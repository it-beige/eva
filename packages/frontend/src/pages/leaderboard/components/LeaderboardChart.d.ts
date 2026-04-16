import React from 'react';
import { LeaderboardItem } from '../../../services/leaderboardApi';
interface LeaderboardChartProps {
    data: LeaderboardItem[];
    loading: boolean;
}
declare const LeaderboardChart: React.FC<LeaderboardChartProps>;
export default LeaderboardChart;
