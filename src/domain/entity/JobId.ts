import { EntityId } from './EntityId';

export class JobId extends EntityId<number> {
  private static nextId = 1;

  constructor(id: number) {
    super('Employee', id);
  }

  validateInput(value: number): boolean {
    return !isNaN(value);
  }

  static getNext(): JobId {
    return new JobId(JobId.nextId++);
  }
}
