import { BSError } from "./BSError";
import { BSBlobInput } from "./BSBlobInput";
import { BSBlobOutput } from "./BSBlobOutput";
import { IBlobService } from "./IBlobService";

export class BlobServiceMock implements IBlobService {
  async postNewBlob(blob: BSBlobInput): Promise<numnber | BSError> {

  }

  async getBlob(blobId: number): Promise<BSBlobOutput | BSError> {

  }
}