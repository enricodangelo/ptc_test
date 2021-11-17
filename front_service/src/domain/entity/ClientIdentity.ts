export class ClientIdentity {
  readonly clientId: string;
  readonly tenentId: string;

  constructor(clientId: string, tenentId: string) {
    this.clientId = clientId;
    this.tenentId = tenentId;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}