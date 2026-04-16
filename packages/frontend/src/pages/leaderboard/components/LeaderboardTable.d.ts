import React from 'react';
import { LeaderboardItem } from '../../../services/leaderboardApi';
interface LeaderboardTableProps {
    data: LeaderboardItem[];
    loading: boolean;
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
    };
}
declare const LeaderboardTable: React.FC<LeaderboardTableProps>;
export default LeaderboardTable;
