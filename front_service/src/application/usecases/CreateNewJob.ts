import { ClientIdentity } from "../../domain/entity/ClientIdentity";
import { Job, SavedJob } from "../../domain/entity/Job";
import { IJobRepository } from "../../domain/repository/IJobRepository";
import { IBlobService } from "../../infrastructure/blobService/IBlobService";
import { Logger } from "../../util/Logger";
import { BSError } from "../../infrastructure/blobService/BSError";
import { IJobService } from "../../infrastructure/jobService/IJobService";
import { JSError } from "../../infrastructure/jobService/JSError";

export class CreateNewJob {
  private jobRepository: IJobRepository;
  private blobService: IBlobService;
  private jobService: IJobService;

  constructor(jobRepository: IJobRepository, blobService: IBlobService, jobService: IJobService) {
    this.jobRepository = jobRepository;
    this.blobService = blobService;
    this.jobService = jobService;
  }

  public async createNewJob({ clientId, tenentId }: { clientId: string, tenentId: string }): Promise<SavedJob> {
    // create job
    const newJob: Job = Job.createNewJob(new ClientIdentity(clientId, tenentId));
    Logger.log(`Created new JOB for ${newJob.clientIdentity}`);

    // persist job
    const savedJob: SavedJob = await this.jobRepository.save(newJob);
    Logger.log(`Persisted new JOB for ${newJob.clientIdentity}, ${savedJob.id}`);

    return savedJob;
  }

  public async submitNewJob({ job, base64Content, mimetype, length }: { job: SavedJob, base64Content: string, mimetype: string, length: number }): Promise<void> {
    // submit blob
    const bsResponse: string | BSError = await this.blobService.postNewBlob({ base64Content: base64Content, mimetype: mimetype, length: length });

    // check error on BlobService
    if (bsResponse instanceof BSError) {
      job.errorStoringBlob();
      await this.jobRepository.update(job);
      Logger.log(`An error occured while storing blog for job ${job.id}: ${bsResponse.message}`);
      return;
    }

    // update blob info
    job.blobStored(bsResponse);
    job = await this.jobRepository.update(job);

    // submitting job
    const jsResponse: string | JSError = await this.jobService.postJob(job.extBlobId!);

    // check error on JobService
    if (jsResponse instanceof JSError) {
      job.errorSubmittingJob();
      await this.jobRepository.update(job);
      Logger.log(`An error occured while submitting job ${job.id}: ${jsResponse.message}`);
      return;
    }

    // update job info
    job.jobSubmitted(jsResponse);
    await this.jobRepository.update(job);

    return;
  }
}