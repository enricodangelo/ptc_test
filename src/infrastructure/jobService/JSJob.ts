import { JS_JOB_STATUS } from "./IJobService";

export class JSJob {
  readonly id: number;
  readonly status: JS_JOB_STATUS;

  constructor(id: number, status: JS_JOB_STATUS) {
    this.id = id;
    this.status = status;
  }
}