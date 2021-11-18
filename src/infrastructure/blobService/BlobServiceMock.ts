import { BSError, BSERROR_TYPE } from './BSError';
import { BSBlobInput } from './BSBlobInput';
import { BSBlobOutput } from './BSBlobOutput';
import { IBlobService } from './IBlobService';
import { cats } from './cats';

export class BlobServiceMock implements IBlobService {
  private count = 1;

  async postNewBlob(_blob: BSBlobInput): Promise<number | BSError> {
    if (Math.random() < 0.5) {
      return this.count++;
    } else {
      return new BSError(BSERROR_TYPE.UNKNOWN, 'Internal Server Error');
    }
  }

  async getBlob(blobId: number): Promise<BSBlobOutput | BSError> {
    if (Math.random() < 0.5) {
      let content: string;
      if (Math.random() < 0.5) {
        content = cats[1];
      } else {
        content = cats[2];
      }
      return {
        id: blobId,
        base64Content: content,
        mimetype: 'image/jpeg',
        length: content.length
      };
    } else {
      return new BSError(BSERROR_TYPE.UNKNOWN, 'Internal Server Error');
    }
  }
}
