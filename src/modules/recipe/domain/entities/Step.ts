import { Entity } from '@/shared/domain/entities/Entity';

export interface StepProps {
  order: number;
  description: string;
  timeMinutes: number;
  tips?: string;
  imageUrl?: string;
}

export class Step extends Entity<StepProps> {
  constructor(props: StepProps, id?: string) {
    super(props, id);
    this.validate();
  }

  get order(): number {
    return this.props.order;
  }

  get description(): string {
    return this.props.description;
  }

  get timeMinutes(): number {
    return this.props.timeMinutes;
  }

  get tips(): string | undefined {
    return this.props.tips;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get formattedTime(): string {
    const hours = Math.floor(this.timeMinutes / 60);
    const minutes = this.timeMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
    }
    return `${minutes} min`;
  }

  private validate(): void {
    if (this.props.order < 1) {
      throw new Error('Step order must be at least 1');
    }
    if (!this.props.description || this.props.description.trim().length === 0) {
      throw new Error('Step description is required');
    }
    if (this.props.timeMinutes <= 0) {
      throw new Error('Step time must be greater than 0 minutes');
    }
  }

  updateTime(newTimeMinutes: number): Step {
    if (newTimeMinutes <= 0) {
      throw new Error('Time must be greater than 0 minutes');
    }
    return new Step(
      { ...this.props, timeMinutes: newTimeMinutes },
      this.id
    );
  }

  toJSON() {
    return {
      id: this.id,
      order: this.props.order,
      description: this.props.description,
      timeMinutes: this.props.timeMinutes,
      tips: this.props.tips,
      imageUrl: this.props.imageUrl
    };
  }
}
