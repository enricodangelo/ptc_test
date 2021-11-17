import { ClientIdentity } from "./ClientIdentity";
import { JobId } from "./JobId";

export enum JOB_STATUS {
  CREATED = 'CREATED',
  STORED = 'STORED',
  STORED_ERROR = 'STORED_ERROR',
  SUBMITTED = 'SUBMITTED',
  SUBMITTED_ERROR = 'SUBMITTED_ERROR',
  EXECUTION_COMPLETED = 'EXECUTED',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
}

export class Job {
  readonly clientIdentity: ClientIdentity;
  private _extJobId?: string;
  private _extBlobId?: string;
  private _status: JOB_STATUS;

  protected constructor(
    clientIdentity: ClientIdentity,
    extJobId: string | undefined,
    extBlobId: string | undefined,
    status: JOB_STATUS,) {
    this.clientIdentity = clientIdentity;
    this._extJobId = extJobId;
    this._extBlobId = extBlobId;
    this._status = status;
  }

  static createNewJob(clientIdentity: ClientIdentity): Job {
    return new Job(clientIdentity, undefined, undefined, JOB_STATUS.CREATED);
  }

  get extJobId(): string | undefined {
    return this._extJobId;
  }

  get extBlobId(): string | undefined {
    return this._extBlobId;
  }

  get status(): JOB_STATUS {
    return this._status;
  }

  blobStored(extJobId: string): JOB_STATUS {
    if (this._extJobId) {
      throw new Error(`The blob for this job has already been submitted.`);
    }
    this._extJobId = extJobId;
    this._status = JOB_STATUS.STORED
    return this._status;
  }

  errorStoringBlob(): JOB_STATUS {
    this._status = JOB_STATUS.STORED_ERROR;
    return this._status;
  }

  jobSubmitted(extBlobId: string) {
    if (this._extBlobId) {
      throw new Error(`This job has already been submitted.`);
    }
    this._extBlobId = extBlobId;
    this._status = JOB_STATUS.SUBMITTED
  }

  errorSubmittingJob(): JOB_STATUS {
    this._status = JOB_STATUS.SUBMITTED_ERROR;
    return this._status;
  }

  errorExecutingJob(): JOB_STATUS {
    this._status = JOB_STATUS.EXECUTION_ERROR;
    return this._status;
  }

  executing(): JOB_STATUS {
    this._status = JOB_STATUS.SUBMITTED;
    return this._status;
  }

  executionCompleted(): JOB_STATUS {
    this._status = JOB_STATUS.EXECUTION_COMPLETED;
    return this._status;
  }

  canTrustLocalStatus(): boolean {
    return this.extJobId === undefined || this._status === JOB_STATUS.STORED_ERROR || this._status === JOB_STATUS.SUBMITTED_ERROR || this._status === JOB_STATUS.EXECUTION_ERROR || this._status === JOB_STATUS.EXECUTION_COMPLETED;
  }
}

export class SavedJob extends Job {
  readonly id: JobId;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: JobId, createdAt: Date, updatedAt: Date, job: Job) {
    super(job.clientIdentity, job.extJobId, job.extBlobId, job.status);
    this.id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

export function isSavedJob(obj: any): obj is SavedJob {
  return obj instanceof SavedJob;
}