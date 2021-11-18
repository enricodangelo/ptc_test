export enum PTCERROR_TYPE {
  WRONG_INPUT = 'WRONG_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  DOMAIN_ERROR = 'DOMAIN_ERROR',
  EXT_SERVICE_ERROR = 'EXT_SERVICE_ERROR'
}

export class PTCError implements Error {
  name: string;
  message: string;
  stack?: string;

  constructor(type: PTCERROR_TYPE, message: string, stack?: string) {
    this.name = PTCERROR_TYPE[type];
    this.message = message;
    this.stack = stack;
  }
}
