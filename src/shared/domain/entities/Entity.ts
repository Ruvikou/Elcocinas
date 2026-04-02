export abstract class Entity<T> {
  protected readonly _id: string;
  public props: T;

  constructor(props: T, id?: string) {
    this._id = id || this.generateId();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) return false;
    if (!(entity instanceof Entity)) return false;
    return this._id === entity._id;
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
