import { default as path } from 'path';
import { CreateNewJob } from './application/usecases/CreateNewJob';
import { GetJobOutput } from './application/usecases/GetJobOutput';
import { GetJobStatus } from './application/usecases/GetJobStatus';
import { IJobRepository } from './domain/repository/IJobRepository';
import { JobRepositoryJson } from './domain/repository/JobRepositoryJson';
import { BlobServiceMock } from './infrastructure/blobService/BlobServiceMock';
import { IBlobService } from './infrastructure/blobService/IBlobService';
import { JobController } from './infrastructure/http/controller/JobController';
import { HTTPServer } from './infrastructure/http/HTTPServer';
import { IJobService } from './infrastructure/jobService/IJobService';
import { JobServiceMock } from './infrastructure/jobService/JobServiceMock';
import { Configuration } from './util/Configuration';

/* save global variable "__basedir" to access project's root dir later in Configuration
   This works only if this file is located at the root of the project */
(global as any).__basedir = path.join(__dirname, '../');

(async () => {
  // init configuration
  const configuration: Configuration = Configuration.getInstance();

  const jobRepository: IJobRepository = new JobRepositoryJson();
  const jobService: IJobService = new JobServiceMock();
  const blobService: IBlobService = new BlobServiceMock();
  const createNewJobUseCase: CreateNewJob = new CreateNewJob(jobRepository, blobService, jobService);
  const getJobStatusUseCase: GetJobStatus = new GetJobStatus(jobRepository, jobService);
  const getJobOutputUseCase: GetJobOutput = new GetJobOutput(jobRepository, blobService, jobService);

  const server = new HTTPServer(configuration.httpServerConf);
  await server.init({
    createNewJobHAndler: await JobController.createNewJob(createNewJobUseCase),
    getJobStatusHandler: await JobController.getJobStatus(getJobStatusUseCase),
    getJobOutputHandler: await JobController.getJobOutput(getJobOutputUseCase)
  });
  await server.start();
})().catch((error) => {
  console.log(JSON.stringify(error));
});
