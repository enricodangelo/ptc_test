import { Job, SavedJob } from "../entity/Job";

export interface IJobRepository {
  save(job: Job): Promise<SavedJob>;
  update(job: SavedJob): Promise<SavedJob>;
  findJobById(id): Promise<SavedJob | undefined>;
}