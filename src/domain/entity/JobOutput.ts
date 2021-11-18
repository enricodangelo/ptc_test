import { hashMD5 } from "../../util/MD5Utils";
import { JobId } from "./JobId";

export class JobOutput {
  readonly id: JobId;
  readonly base64Content: string;
  readonly mimetype: string;
  readonly length: number;
  readonly MD5: string;

  constructor(id: JobId, base64Content: string, mimetype: string) {
    this.id = id;
    this.base64Content = base64Content;
    this.mimetype = mimetype;
    this.length = base64Content.length;
    this.MD5 = hashMD5(base64Content);
  }
}