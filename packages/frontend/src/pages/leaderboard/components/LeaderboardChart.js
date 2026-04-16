import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card, Empty } from 'antd';
const LeaderboardChart = ({ data, loading }) => {
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
        }, {});
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
        return (_jsx(Card, { title: "\u5F97\u5206\u5BF9\u6BD4", loading: loading, children: _jsx(Empty, { description: "\u6682\u65E0\u6570\u636E" }) }));
    }
    return (_jsx(Card, { title: "\u5F97\u5206\u5BF9\u6BD4", loading: loading, children: _jsx("div", { className: "space-y-3", children: appScores.map((app, index) => {
                const percentage = (app.avgScore / maxScore) * 100;
                let barColor = 'bg-red-500';
                if (app.avgScore >= 90)
                    barColor = 'bg-green-500';
                else if (app.avgScore >= 75)
                    barColor = 'bg-blue-500';
                else if (app.avgScore >= 60)
                    barColor = 'bg-orange-500';
                return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 text-center font-bold text-gray-500", children: index + 1 }), _jsx("div", { className: "w-32 truncate text-sm", title: app.name, children: app.name }), _jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-6 overflow-hidden", children: _jsx("div", { className: `h-full ${barColor} transition-all duration-500 flex items-center justify-end pr-2`, style: { width: `${percentage}%` }, children: _jsx("span", { className: "text-white text-xs font-bold", children: app.avgScore.toFixed(1) }) }) })] }, app.name));
            }) }) }));
};
export default LeaderboardChart;
