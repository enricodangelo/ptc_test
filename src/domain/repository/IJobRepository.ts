import { Job, SavedJob } from '../entity/Job';
import { JobId } from '../entity/JobId';

export interface IJobRepository {
  save(job: Job): Promise<SavedJob>;
  update(job: SavedJob): Promise<SavedJob>;
  findJobById(id: JobId): Promise<SavedJob | undefined>;
  deleteJobById(id: JobId): Promise<boolean>;
}
