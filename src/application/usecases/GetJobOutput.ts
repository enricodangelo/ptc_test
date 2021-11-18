import { ClientIdentity } from "../../domain/entity/ClientIdentity";
import { SavedJob } from "../../domain/entity/Job";
import { JobId } from "../../domain/entity/JobId";
import { JobOutput } from "../../domain/entity/JobOutput";
import { IJobRepository } from "../../domain/repository/IJobRepository";
import { BSBlobOutput } from "../../infrastructure/blobService/BSBlobOutput";
import { BSError } from "../../infrastructure/blobService/BSError";
import { IBlobService } from "../../infrastructure/blobService/IBlobService";
import { Logger } from "../../util/Logger";
import { PTCError, PTCERROR_TYPE } from "../../util/PTCError";

export class GetJobOutput {
  private jobRepository: IJobRepository;
  private blobService: IBlobService;

  constructor(jobRepository: IJobRepository, blobService: IBlobService) {
    this.jobRepository = jobRepository;
    this.blobService = blobService;
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

    if (!job.isOutputReady()) {
      Logger.log(`GetJobOutput UseCase: job's output is not ready yet: ${id}`);
      throw new PTCError(PTCERROR_TYPE.NOT_FOUND, 'Output for this job does not exist yet.');
    }

    if (!job.extBlobId) {
      Logger.log(`GetJobOutput UseCase: should never happen, extJobId should be defined here: ${id}`);
      throw new PTCError(PTCERROR_TYPE.DOMAIN_ERROR, `Job ${id} should have "extBlobId" set.`);
    }
    const bsResponse: BSBlobOutput | BSError = await this.blobService.getBlob(job.extBlobId);

    // check error on BlobService
    if (bsResponse instanceof BSError) {
      Logger.log(`GetJobOutput UseCase: received error (${JSON.stringify(bsResponse)}) from BlobService ${id}`);
      throw new PTCError(PTCERROR_TYPE.EXT_SERVICE_ERROR, `BlobService error: (jsResponse.type) ${bsResponse.message}`);
    }

    Logger.log(`GetJobOutput UseCase: output retrieved for job ${id}`);
    return new JobOutput(id, bsResponse.base64Content, bsResponse.mimetype);
  }
}