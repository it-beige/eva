import { Request } from 'express';

export type TraceableRequest = Request & {
  traceId?: string;
};
