import { PTCError, PTCERROR_TYPE } from "../../util/PTCError";
import { Job, SavedJob } from "../entity/Job";
import { JobId } from "../entity/JobId";
import { IJobRepository } from "./IJobRepository";

type JobRepoType = {
  [jobId: string]: SavedJob;
}

export class JobRepositoryJson implements IJobRepository {
  private db: JobRepoType;

  constructor() {
    this.db = {};
  }

  async save(job: Job): Promise<SavedJob> {
    const newId: JobId = JobId.getNext();
    const now: Date = new Date();
    const newSavedJob: SavedJob = new SavedJob(newId, now, now, job);
    this.db[newId.value] = newSavedJob;
    return newSavedJob;
  }

  async update(job: SavedJob): Promise<SavedJob> {
    if (!this.db[job.id.value]) {
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, `Job not found: ${job.id}`);
    }
    const now: Date = new Date();
    const newSavedJob: SavedJob = new SavedJob(job.id, job.createdAt, now, job);
    this.db[job.id.value] = newSavedJob;
    return newSavedJob;
  }

  async findJobById(id: JobId): Promise<SavedJob | undefined> {
    if (!this.db[id.value]) {
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, `Job not found: ${id}`);
    }
    return this.db[id.value];
  }

  async deleteJobById(id: JobId): Promise<boolean> {
    if (!this.db[id.value]) {
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, `Job not found: ${id}`);
    }
    delete this.db[id.value];
    return true;
  }
}