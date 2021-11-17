import { Router } from "express";
import { JobController } from "../controller/JobController";
import { checkJwt } from "../middleware/checkJwt";

export class JobRouter {
  private jobController: JobController;

  constructor(jobController: JobController) {
    this.jobController = jobController;
  }

  getRouter(): Router {
    const router = Router();

    //Change my password
    router.post("/", [checkJwt], this.jobController.createNewJob.bind(this.jobController));
    router.get("/:jobId/status", [checkJwt], this.jobController.getJobStatus.bind(this.jobController));
    router.get("/:jobId/output", [checkJwt], this.jobController.getJobOutput.bind(this.jobController));

    return router;
  }
}