import { Router, Request, Response } from "express";
import { jwtValidatorMiddleware } from "../middleware/JwtValidatorMiddleware";

export async function getJobRouter({
  createNewJobHAndler,
  getJobStatusHandler,
  getJobOutputHandler}:
   {
     createNewJobHAndler: (req: Request, res: Response) => Promise<void>,
     getJobStatusHandler: (req: Request, res: Response) => Promise<void>,
     getJobOutputHandler: (req: Request, res: Response) => Promise<void>
    }
  ): Promise<Router> {
  const jobRouter = Router();

  jobRouter.post("/", [jwtValidatorMiddleware], createNewJobHAndler);
  jobRouter.get("/:jobId/status", [jwtValidatorMiddleware], getJobStatusHandler);
  jobRouter.get("/:jobId/output", [jwtValidatorMiddleware],getJobOutputHandler);

  return jobRouter;
}