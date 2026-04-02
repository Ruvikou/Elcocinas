export class UUID {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!this.isValidUUID(value)) {
        throw new Error('Invalid UUID format');
      }
      this.value = value;
    } else {
      this.value = crypto.randomUUID();
    }
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UUID): boolean {
    return this.value === other.value;
  }
}
