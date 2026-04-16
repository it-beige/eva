import { evaApi } from './evaApi';
import type {
  LeaderboardSummary,
  PaginatedLeaderboardResponse,
  QueryLeaderboardParams,
} from './leaderboardApi';

export const leaderboardQueries = evaApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaderboard: builder.query<
      PaginatedLeaderboardResponse,
      QueryLeaderboardParams | void
    >({
      query: (params) => ({
        url: '/leaderboard',
        params,
      }),
      providesTags: [{ type: 'Applications', id: 'LEADERBOARD' }],
    }),
    getLeaderboardSummary: builder.query<LeaderboardSummary, void>({
      query: () => ({
        url: '/leaderboard/summary',
      }),
      providesTags: [{ type: 'Applications', id: 'LEADERBOARD_SUMMARY' }],
    }),
  }),
});

export const {
  useGetLeaderboardQuery,
  useGetLeaderboardSummaryQuery,
} = leaderboardQueries;
