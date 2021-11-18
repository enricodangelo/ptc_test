import { Router, Request, Response } from 'express';
import { getJobRouter } from './jobRouter';

export async function getFsRouter({
  createNewJobHAndler,
  getJobStatusHandler,
  getJobOutputHandler
}: {
  createNewJobHAndler: (req: Request, res: Response) => Promise<void>;
  getJobStatusHandler: (req: Request, res: Response) => Promise<void>;
  getJobOutputHandler: (req: Request, res: Response) => Promise<void>;
}): Promise<Router> {
  const fsRouter = Router();

  fsRouter.use(
    '/job',
    await getJobRouter({
      createNewJobHAndler: createNewJobHAndler,
      getJobStatusHandler: getJobStatusHandler,
      getJobOutputHandler: getJobOutputHandler
    })
  );

  return fsRouter;
}
