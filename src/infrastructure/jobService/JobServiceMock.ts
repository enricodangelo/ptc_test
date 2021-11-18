import { IJobService, JS_JOB_STATUS } from './IJobService';
import { JSError, JSERROR_TYPE } from './JSError';
import { JSJob } from './JSJob';

export class JobServiceMock implements IJobService {
  private nextId = 1;

  async postJob(_blobId: number): Promise<JSJob | JSError> {
    if (Math.random() < 0.5) {
      return new JSJob(this.nextId++, JS_JOB_STATUS.RUNNING);
    } else {
      return new JSError(JSERROR_TYPE.UNKNOWN, 'Internal Server Error');
    }
  }

  async getJobStatus(jobId: number): Promise<JS_JOB_STATUS | JSError> {
    if (Math.random() < 0.5) {
      const statusesArray: JS_JOB_STATUS[] = [JS_JOB_STATUS.RUNNING, JS_JOB_STATUS.FAILED, JS_JOB_STATUS.SUCCESS];
      const status: JS_JOB_STATUS = statusesArray[jobId % statusesArray.length];
      return status;
    } else {
      return new JSError(JSERROR_TYPE.UNKNOWN, 'Internal Server Error');
    }
  }
}
