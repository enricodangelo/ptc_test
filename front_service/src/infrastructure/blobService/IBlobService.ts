import { BSError } from "./BSError";
import { BSBlob } from "./FSBlob";

export interface IBlobService {
  postNewBlob(blob: BSBlob): Promise<string | BSError>;
  getBlob(blobId: string): Promise<BSBlob | BSError>;
}