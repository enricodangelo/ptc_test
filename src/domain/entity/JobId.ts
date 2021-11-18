import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { EntityId } from './EntityId';

export class JobId extends EntityId<string> {
  constructor(id: string) {
    super('Employee', id);
  }

  validateInput(value: string): boolean {
    return uuidValidate(value);
  }

  static getNext(): JobId {
    return new JobId(uuidv4());
  }
}
