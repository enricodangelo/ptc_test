import { default as express } from 'express';
import { HTTPServerConf } from '../../util/Configuration';
import { HTTPServer } from './HTTPServer';
import { JobController } from './controller/JobController';
import { IJobRepository } from '../../domain/repository/IJobRepository';
import { IJobService } from '../jobService/IJobService';
import { IBlobService } from '../blobService/IBlobService';
import { JobServiceMock } from '../jobService/JobServiceMock';
import { BlobServiceMock } from '../blobService/BlobServiceMock';
import { JobRepositoryJson } from '../../domain/repository/JobRepositoryJson';
import { CreateNewJob } from '../../application/usecases/CreateNewJob';
import { GetJobStatus } from '../../application/usecases/GetJobStatus';
import { GetJobOutput } from '../../application/usecases/GetJobOutput';
import { Server } from 'http';

export class HTTPServerForTest extends HTTPServer {
  constructor(httpServerConf: HTTPServerConf) {
    super(httpServerConf);
  }

  static async startForE2ETest(httpServerConf: HTTPServerConf): Promise<{
    expressApp: express.Express;
    httpServer: Server;
  }> {
    const httpServerForTest: HTTPServerForTest = new HTTPServerForTest(httpServerConf);

    const jobRepository: IJobRepository = new JobRepositoryJson();
    const jobService: IJobService = new JobServiceMock();
    const blobService: IBlobService = new BlobServiceMock();
    const createNewJobUseCase: CreateNewJob = new CreateNewJob(jobRepository, blobService, jobService);
    const getJobStatusUseCase: GetJobStatus = new GetJobStatus(jobRepository, jobService);
    const getJobOutputUseCase: GetJobOutput = new GetJobOutput(jobRepository, blobService, jobService);
    await httpServerForTest.init({
      createNewJobHAndler: await JobController.createNewJob(createNewJobUseCase),
      getJobStatusHandler: await JobController.getJobStatus(getJobStatusUseCase),
      getJobOutputHandler: await JobController.getJobOutput(getJobOutputUseCase)
    });
    const httpServer: Server = await httpServerForTest.start();
    return {
      expressApp: httpServerForTest.app,
      httpServer: httpServer
    };
  }
}
