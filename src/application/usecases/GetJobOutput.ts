import { ClientIdentity } from "../../domain/entity/ClientIdentity";
import { SavedJob } from "../../domain/entity/Job";
import { JobId } from "../../domain/entity/JobId";
import { JobOutput } from "../../domain/entity/JobOutput";
import { IJobRepository } from "../../domain/repository/IJobRepository";
import { BSBlobOutput } from "../../infrastructure/blobService/BSBlobOutput";
import { BSError } from "../../infrastructure/blobService/BSError";
import { IBlobService } from "../../infrastructure/blobService/IBlobService";
import { IJobService, JS_JOB_STATUS } from "../../infrastructure/jobService/IJobService";
import { JSError } from "../../infrastructure/jobService/JSError";
import { Logger } from "../../util/Logger";
import { PTCError, PTCERROR_TYPE } from "../../util/PTCError";

export class GetJobOutput {
  private jobRepository: IJobRepository;
  private blobService: IBlobService;
  private jobService: IJobService;

  constructor(jobRepository: IJobRepository, blobService: IBlobService, jobService: IJobService) {
    this.jobRepository = jobRepository;
    this.blobService = blobService;
    this.blobService = blobService;
    this.jobService = jobService;
  }

  async getJobOutput({ id, clientIdentity }: { id: JobId, clientIdentity: ClientIdentity }): Promise<JobOutput> {
    Logger.log(`GetJobOutput UseCase: ${id}`);
    const job: SavedJob | undefined = await this.jobRepository.findJobById(id);
    if (!job) {
      Logger.log(`GetJobOutput UseCase: job not found: ${id}`);
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, `Job ${id} does not exist.`);
    }

    // check permission on job
    if (!job.clientIdentity.equals(clientIdentity)) {
      throw new PTCError(PTCERROR_TYPE.FORBIDDEN, '');
    }

    // job is completed, can return it
    if (job.isOutputReady()) {
      // checking for id on ext system, should be there
      if (!job.extBlobId) {
        Logger.log(`GetJobOutput UseCase: should never happen, extBlobId should be defined here: ${id}`);
        throw new PTCError(PTCERROR_TYPE.DOMAIN_ERROR, `Job ${id} should have "extBlobId" set.`);
      }

      const bsResponse: BSBlobOutput | BSError = await this.blobService.getBlob(job.extBlobId);

      // check error on BlobService
      if (bsResponse instanceof BSError) {
        Logger.log(`GetJobOutput UseCase: received error (${JSON.stringify(bsResponse)}) from BlobService ${id}`);
        throw new PTCError(PTCERROR_TYPE.EXT_SERVICE_ERROR, `BlobService error: (${bsResponse.type}) ${bsResponse.message}`);
      }

      Logger.log(`GetJobOutput UseCase: output retrieved for job ${id}`);
      return new JobOutput(id, bsResponse.base64Content, bsResponse.mimetype);
    }

    // if in error state then output cannot be there
    if (job.isInError()) {
      Logger.log(`GetJobOutput UseCase: job's output doesn't exist, job in error: ${id}`);
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, 'Output for this job does not exist yet.');
    }

    // check status on JobService
    if (!job.extJobId) {
      Logger.log(`GetJobOutput UseCase: should never happen, extJobId should be defined here: ${id}`);
      throw new PTCError(PTCERROR_TYPE.DOMAIN_ERROR, `Job ${id} should have "extJobId" set.`);
    }
    const jsResponse: JS_JOB_STATUS | JSError = await this.jobService.getJobStatus(job.extJobId);

    // check error on JobService
    if (jsResponse instanceof JSError) {
      Logger.log(`GetJobOutput UseCase: received error (${JSON.stringify(jsResponse)}) from JobService ${id}`);
      throw new PTCError(PTCERROR_TYPE.EXT_SERVICE_ERROR, `JobService error: (${jsResponse.type}) ${jsResponse.message}`);
    }

    switch (jsResponse) {
      case JS_JOB_STATUS.FAILED:
        Logger.log(`GetJobOutput UseCase: job's output is not ready yet: ${id}`);
        throw new PTCError(PTCERROR_TYPE.NOT_FOUND, 'Output for this job does not exist yet.');
      case JS_JOB_STATUS.RUNNING:
        Logger.log(`GetJobOutput UseCase: job's output is not ready yet: ${id}`);
        throw new PTCError(PTCERROR_TYPE.NOT_FOUND, 'Output for this job does not exist yet.');
      case JS_JOB_STATUS.SUCCESS:
        if (!job.extBlobId) {
          Logger.log(`GetJobOutput UseCase: should never happen, extJobId should be defined here: ${id}`);
          throw new PTCError(PTCERROR_TYPE.DOMAIN_ERROR, `Job ${id} should have "extBlobId" set.`);
        }
        const bsResponse: BSBlobOutput | BSError = await this.blobService.getBlob(job.extBlobId);

        // check error on BlobService
        if (bsResponse instanceof BSError) {
          Logger.log(`GetJobOutput UseCase: received error (${JSON.stringify(bsResponse)}) from BlobService ${id}`);
          throw new PTCError(PTCERROR_TYPE.EXT_SERVICE_ERROR, `BlobService error: (${bsResponse.type}) ${bsResponse.message}`);
        }

        Logger.log(`GetJobOutput UseCase: output retrieved for job ${id}`);
        return new JobOutput(id, bsResponse.base64Content, bsResponse.mimetype);
    }
  }
}