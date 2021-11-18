import { ContentInfo, Job, SavedJob } from '../../domain/entity/Job';
import { IJobRepository } from '../../domain/repository/IJobRepository';
import { IBlobService } from '../../infrastructure/blobService/IBlobService';
import { Logger } from '../../util/Logger';
import { BSError } from '../../infrastructure/blobService/BSError';
import { IJobService } from '../../infrastructure/jobService/IJobService';
import { JSError } from '../../infrastructure/jobService/JSError';
import { JSJob } from '../../infrastructure/jobService/JSJob';
import { UserIdentity } from '../../domain/entity/UserIdentity';

export class CreateNewJob {
  private jobRepository: IJobRepository;
  private blobService: IBlobService;
  private jobService: IJobService;

  constructor(jobRepository: IJobRepository, blobService: IBlobService, jobService: IJobService) {
    this.jobRepository = jobRepository;
    this.blobService = blobService;
    this.jobService = jobService;
  }

  public async createNewJob({
    clientId,
    tenentId,
    sub
  }: {
    clientId: string;
    tenentId: string;
    sub: string;
  }): Promise<SavedJob> {
    // create job
    const newJob: Job = Job.createNewJob(new UserIdentity(sub, tenentId), clientId);
    Logger.log(`Created new JOB for ${newJob.userIdentity}`);

    // persist job
    const savedJob: SavedJob = await this.jobRepository.save(newJob);
    Logger.log(`Persisted new JOB for ${newJob.userIdentity}, ${savedJob.id}`);

    return savedJob;
  }

  public async submitNewBlob({
    job,
    base64Content,
    mimetype
  }: {
    job: SavedJob;
    base64Content: string;
    mimetype: string;
  }): Promise<void> {
    // submit blob
    const bsResponse: number | BSError = await this.blobService.postNewBlob({
      base64Content: base64Content,
      mimetype: mimetype,
      length: base64Content.length
    });

    // check error on BlobService
    if (bsResponse instanceof BSError) {
      job.errorStoringBlob();
      await this.jobRepository.update(job);
      Logger.log(`An error occured while storing blog for job ${job.id}: ${bsResponse.message}`);
      return;
    }

    // update blob info
    job.blobStored(bsResponse, new ContentInfo(mimetype, base64Content.length));
    job = await this.jobRepository.update(job);

    // submitting job
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const jsResponse: JSJob | JSError = await this.jobService.postJob(job.extBlobId!);

    // check error on JobService
    if (jsResponse instanceof JSError) {
      job.errorSubmittingJob();
      await this.jobRepository.update(job);
      Logger.log(`An error occured while submitting job ${job.id}: ${jsResponse.message}`);
      return;
    }

    // update job info
    job.jobSubmitted(jsResponse.id, jsResponse.status);
    await this.jobRepository.update(job);
  }
}
