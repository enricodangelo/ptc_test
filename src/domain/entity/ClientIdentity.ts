export class ClientIdentity {
  readonly clientId: string;
  readonly tenentId: string;

  constructor(clientId: string, tenentId: string) {
    this.clientId = clientId;
    this.tenentId = tenentId;
  }

  equals(other: ClientIdentity): boolean {
    return this.clientId === other.clientId && this.tenentId === other.tenentId;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}
