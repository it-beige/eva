import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, Method } from 'axios';
import api from './api';

type QueryArgs = {
  url: string;
  method?: Method;
  params?: unknown;
  data?: unknown;
};

export type QueryError = {
  status?: number;
  data?: unknown;
  message: string;
};

const axiosBaseQuery =
  (): BaseQueryFn<QueryArgs, unknown, QueryError> =>
  async ({ url, method = 'get', params, data }) => {
    try {
      const result = await api({
        url,
        method,
        params,
        data,
      });

      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message:
            axiosError.response?.data?.message ??
            axiosError.message ??
            '请求失败',
        },
      };
    }
  };

export const getQueryErrorMessage = (
  error: QueryError | undefined,
  fallback: string,
): string => {
  if (!error) {
    return fallback;
  }

  if (
    typeof error.data === 'object' &&
    error.data !== null &&
    'message' in error.data
  ) {
    const message = (error.data as { message?: string }).message;
    return message ?? error.message ?? fallback;
  }

  return error.message ?? fallback;
};

export const evaApi = createApi({
  reducerPath: 'evaApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Applications', 'ApplicationVersions', 'ProjectSettings', 'Members', 'Tokens'],
  endpoints: () => ({}),
});
