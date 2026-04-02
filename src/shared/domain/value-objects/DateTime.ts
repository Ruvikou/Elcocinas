export class DateTime {
  private readonly value: Date;

  constructor(value?: Date | string | number) {
    if (value) {
      this.value = new Date(value);
    } else {
      this.value = new Date();
    }
  }

  toDate(): Date {
    return new Date(this.value);
  }

  toISOString(): string {
    return this.value.toISOString();
  }

  toTimestamp(): number {
    return this.value.getTime();
  }

  equals(other: DateTime): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  isBefore(other: DateTime): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  isAfter(other: DateTime): boolean {
    return this.value.getTime() > other.value.getTime();
  }
}
