import { ClientIdentity } from "../../domain/entity/ClientIdentity";
import { JOB_STATUS, SavedJob } from "../../domain/entity/Job";
import { JobId } from "../../domain/entity/JobId";
import { IJobRepository } from "../../domain/repository/IJobRepository";
import { IJobService, JS_JOB_STATUS } from "../../infrastructure/jobService/IJobService";
import { JSError } from "../../infrastructure/jobService/JSError";
import { Logger } from "../../util/Logger";
import { PTCError, PTCERROR_TYPE } from "../../util/PTCError";

export class GetJobStatus {
  private jobRepository: IJobRepository;
  private jobService: IJobService;

  constructor(jobRepository: IJobRepository, jobService: IJobService) {
    this.jobRepository = jobRepository;
    this.jobService = jobService;
  }

  async getJobStatus({ id, clientIdentity }: { id: JobId, clientIdentity: ClientIdentity }): Promise<JOB_STATUS> {
    Logger.log(`GetJobStatus UseCase: ${id}`);
    const job: SavedJob | undefined = await this.jobRepository.findJobById(id);
    if (!job) {
      Logger.log(`GetJobStatus UseCase: job not found: ${id}`);
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, `Job ${id} does not exist.`);
    }

    // check permission on job
    if (!job.clientIdentity.equals(clientIdentity)) {
      throw new PTCError(PTCERROR_TYPE.FORBIDDEN, '');
    }

    if (job.canTrustLocalStatus()) {
      Logger.log(`GetJobStatus UseCase: using local status (${job.status}): ${id}`);
      return job.status;
    }

    if (!job.extJobId) {
      Logger.log(`GetJobStatus UseCase: should never happen, extJobId should be defined here: ${id}`);
      throw new PTCError(PTCERROR_TYPE.DOMAIN_ERROR, `Job ${id} should have "extJobId" set.`);
    }
    const jsResponse: JS_JOB_STATUS | JSError = await this.jobService.getJobStatus(job.extJobId);

    // check error on JobService
    if (jsResponse instanceof JSError) {
      Logger.log(`GetJobStatus UseCase: received error (${JSON.stringify(jsResponse)}) from JobService ${id}`);
       throw new PTCError(PTCERROR_TYPE.EXT_SERVICE_ERROR, `JobService error: (jsResponse.type) ${jsResponse.message}`);
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
    Logger.log(`GetJobStatus UseCase: updated status from JobService (${job.status}) ${id}`);

    return job.status;
  }
}