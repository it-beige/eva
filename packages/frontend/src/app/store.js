import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../store/uiSlice';
import observabilityReducer from '../store/observabilitySlice';
import aiApplicationReducer from '../store/aiApplicationSlice';
import promptReducer from '../store/promptSlice';
import evalSetReducer from '../store/evalSetSlice';
import evalMetricReducer from '../store/evalMetricSlice';
import evalTaskReducer from '../store/evalTaskSlice';
import playgroundReducer from '../store/playgroundSlice';
import leaderboardReducer from '../store/leaderboardSlice';
import settingsReducer from '../store/settingsSlice';
import autoEvalReducer from '../store/autoEvalSlice';
export const store = configureStore({
    reducer: {
        ui: uiReducer,
        observability: observabilityReducer,
        aiApplication: aiApplicationReducer,
        prompt: promptReducer,
        evalSet: evalSetReducer,
        evalMetric: evalMetricReducer,
        evalTask: evalTaskReducer,
        playground: playgroundReducer,
        leaderboard: leaderboardReducer,
        settings: settingsReducer,
        autoEval: autoEvalReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [],
        },
    }),
});
