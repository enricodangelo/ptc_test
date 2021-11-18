import { Router, Request, Response, NextFunction } from 'express';
import { inputValidatorMiddleware } from '../middleware/inputValidatorMiddleware';
import { jwtValidatorMiddleware } from '../middleware/JwtValidatorMiddleware';
import { pathValidatorMiddleware } from '../middleware/pathValidatorMiddleware';
import { JobIDParamSchema, JobInputSchema } from '../validator/jobControllerValidator';

export async function getJobRouter({
  createNewJobHAndler,
  getJobStatusHandler,
  getJobOutputHandler
}: {
  createNewJobHAndler: (req: Request, res: Response) => Promise<void>;
  getJobStatusHandler: (req: Request, res: Response) => Promise<void>;
  getJobOutputHandler: (req: Request, res: Response) => Promise<void>;
}): Promise<Router> {
  const jobRouter = Router();

  const postJobValidator: (req: Request, res: Response, next: NextFunction) => Promise<void> =
    inputValidatorMiddleware(JobInputSchema);
  const pathJobIdValidator: (req: Request, res: Response, next: NextFunction) => Promise<void> =
    pathValidatorMiddleware(JobIDParamSchema, 'jobId');

  jobRouter.post('/', [jwtValidatorMiddleware, postJobValidator], createNewJobHAndler);
  jobRouter.get('/:jobId/status', [jwtValidatorMiddleware, pathJobIdValidator], getJobStatusHandler);
  jobRouter.get('/:jobId/output', [jwtValidatorMiddleware, pathJobIdValidator], getJobOutputHandler);

  return jobRouter;
}
