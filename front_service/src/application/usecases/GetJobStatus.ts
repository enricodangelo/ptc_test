import { JOB_STATUS, SavedJob } from "../../domain/entity/Job";
import { JobId } from "../../domain/entity/JobId";
import { IJobRepository } from "../../domain/repository/IJobRepository";
import { IBlobService } from "../../infrastructure/blobService/IBlobService";
import { IJobService, JS_JOB_STATUS } from "../../infrastructure/jobService/IJobService";
import { JSError } from "../../infrastructure/jobService/JSError";
import { FSERROR } from "../../util/FSError";
import { Logger } from "../../util/Logger";

export class GetJobStatus {
  private jobRepository: IJobRepository;
  private jobService: IJobService;

  constructor(jobRepository: IJobRepository, jobService: IJobService) {
    this.jobRepository = jobRepository;
    this.jobService = jobService;
  }

  async getJobStatus({ id }: { id: JobId }): Promise<JOB_STATUS> {
    const job: SavedJob | undefined = await this.jobRepository.findJobById(id);
    if (!job) {
      throw new Error(FSERROR.NOT_FOUND);
    }

    if (job.canTrustLocalStatus()) {
      return job.status;
    }

    if (!job.extJobId) {
      throw new Error(FSERROR.DOMAIN_ERROR);
    }
    const jsResponse: JS_JOB_STATUS | JSError = await this.jobService.getJobStatus(job.extJobId);

    // check error on JobService
    if (jsResponse instanceof JSError) {
      const error = new Error(jsResponse.message);
      error.name = jsResponse.type;
      throw error;
      // Logger.log(`An error occured while submitting job ${job.id}: ${jsResponse.message}`);
    }

    // update job's status
    switch (jsResponse) {
      case JS_JOB_STATUS.FAILED:
        job.errorExecutingJob();
        break;
      case JS_JOB_STATUS.RUNNING:
        job.executing();
        break;
      case JS_JOB_STATUS.SUCCESS:
        job.executionCompleted();
        break;
    }
    await this.jobRepository.update(job);

    return job.status;
  }
}