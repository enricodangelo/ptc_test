import { JSError } from "./JSError";

export enum JS_JOB_STATUS {
  RUNNING = `RUNNING`,
  SUCCESS = `SUCCESS`,
  FAILED = `FAILED`
}

export interface IJobService {
  postJob(blobId: string): Promise<string | JSError>;
  getJobStatus(jobId: string): Promise<JS_JOB_STATUS | JSError>;
}