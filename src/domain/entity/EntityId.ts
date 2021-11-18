export type EntityType = 'Job';

export abstract class EntityId<T> {
  readonly type: EntityType;
  readonly value: T;

  constructor(type: EntityType, value: T) {
    if (!this.validateInput(value)) {
      throw new Error(`Wrong format EnriryId: this value "${value}" has the wrong format.`);
    }
    this.type = type;
    this.value = value;
  }

  abstract validateInput(value: T): boolean;

  equals(otherEntity: EntityId<T>): boolean {
    if (this.type != otherEntity.type) {
      return false;
    }
    if (this.value !== otherEntity.value) {
      return false;
    }
    return true;
  }

  toString(): string {
    return JSON.stringify(this);
  }
}
