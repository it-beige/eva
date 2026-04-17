import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../store/uiSlice';
import observabilityReducer from '../store/observabilitySlice';
import promptReducer from '../store/promptSlice';
import evalSetReducer from '../store/evalSetSlice';
import evalMetricReducer from '../store/evalMetricSlice';
import evalTaskReducer from '../store/evalTaskSlice';
import playgroundReducer from '../store/playgroundSlice';
import autoEvalReducer from '../store/autoEvalSlice';
import projectReducer from '../store/projectSlice';
import { evaApi } from '../services/evaApi';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    observability: observabilityReducer,
    prompt: promptReducer,
    evalSet: evalSetReducer,
    evalMetric: evalMetricReducer,
    evalTask: evalTaskReducer,
    playground: playgroundReducer,
    autoEval: autoEvalReducer,
    project: projectReducer,
    [evaApi.reducerPath]: evaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(evaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
