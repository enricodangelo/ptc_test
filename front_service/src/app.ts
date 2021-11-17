import { CreateNewJob } from './application/usecases/CreateNewJob';
import { GetJobOutput } from './application/usecases/GetJobOutput';
import { GetJobStatus } from './application/usecases/GetJobStatus';
import { IJobRepository } from './domain/repository/IJobRepository';
import { BlobServiceMock } from './infrastructure/blobService/BlobServiceMock';
import { IBlobService } from './infrastructure/blobService/IBlobService';
import { JobController } from './infrastructure/http/controller/JobController';
import { HTTPServer } from './infrastructure/http/HTTPServer';
import { FSRouter } from './infrastructure/http/route';
import { JobRouter } from './infrastructure/http/route/jobRouter';
import { IJobService } from './infrastructure/jobService/IJobService';
import { JobServiceMock } from './infrastructure/jobService/JobServiceMock';


(async () => {
  const jobRepository: IJobRepository;
  const jobService: IJobService = new JobServiceMock();
  const blobService: IBlobService = new BlobServiceMock();
  const createNewJobUseCase: CreateNewJob = new CreateNewJob(jobRepository, blobService, jobService);
  const getJobStatusUseCase: GetJobStatus = new GetJobStatus(jobRepository, jobService);
  const getJobOutputUseCase: GetJobOutput = new GetJobOutput(jobRepository, blobService);
  const jobController: JobController = new JobController(createNewJobUseCase, getJobStatusUseCase, getJobOutputUseCase);
  const jobRouter: JobRouter = new JobRouter(jobController);
  const fsRouter: FSRouter = new FSRouter(jobRouter);

  const server = new HTTPServer(parseInt(process.argv[2]), fsRouter);
  server.init();
  await server.start();
})().catch((error) => {
  console.log(JSON.stringify(error));
});
