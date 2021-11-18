export enum JSERROR_TYPE {
 UNKNOWN = 'UNKNOWN'
}

export class JSError {
  readonly type: JSERROR_TYPE;
  readonly message: string;

  constructor(type: JSERROR_TYPE, message: string) {
    this.type = type;
    this.message = message;
  }
}