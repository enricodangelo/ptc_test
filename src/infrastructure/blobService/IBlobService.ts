import { BSError } from './BSError';
import { BSBlobInput } from './BSBlobInput';
import { BSBlobOutput } from './BSBlobOutput';

export interface IBlobService {
  postNewBlob(blob: BSBlobInput): Promise<number | BSError>;
  getBlob(blobId: number): Promise<BSBlobOutput | BSError>;
}
