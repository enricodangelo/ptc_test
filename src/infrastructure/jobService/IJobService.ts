import { JSError } from './JSError';
import { JSJob } from './JSJob';

export enum JS_JOB_STATUS {
  RUNNING = `RUNNING`,
  SUCCESS = `SUCCESS`,
  FAILED = `FAILED`
}

export interface IJobService {
  postJob(blobId: number): Promise<JSJob | JSError>;
  getJobStatus(jobId: number): Promise<JS_JOB_STATUS | JSError>;
}
