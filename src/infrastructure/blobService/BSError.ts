export enum BSERROR_TYPE {
  UNKNOWN = 'UNKNOWN'
}

export class BSError {
  readonly type: BSERROR_TYPE;
  readonly message: string;

  constructor(type: BSERROR_TYPE, message: string) {
    this.type = type;
    this.message = message;
  }
}
