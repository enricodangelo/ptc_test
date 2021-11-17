import { Router } from "express";
import { JobRouter } from "./jobRouter";

export class FSRouter {
  private jobRouter: JobRouter;

  constructor(jobRouter: JobRouter) {
    this.jobRouter = jobRouter;
  }

  getRouter() {
    const routes = Router();

    routes.use("/job", this.jobRouter.getRouter());;
  }
}