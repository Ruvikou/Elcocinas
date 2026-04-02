export type UnlockType = 'PAYMENT' | 'GAMIFICATION' | 'PREREQUISITE';

export interface UnlockRequirementProps {
  type: UnlockType;
  value: number | string;
  description: string;
}

export class UnlockRequirement {
  private readonly type: UnlockType;
  private readonly value: number | string;
  private readonly description: string;

  constructor(props: UnlockRequirementProps) {
    this.type = props.type;
    this.value = props.value;
    this.description = props.description;
  }

  getType(): UnlockType {
    return this.type;
  }

  getValue(): number | string {
    return this.value;
  }

  getDescription(): string {
    return this.description;
  }

  isPayment(): boolean {
    return this.type === 'PAYMENT';
  }

  isGamification(): boolean {
    return this.type === 'GAMIFICATION';
  }

  isPrerequisite(): boolean {
    return this.type === 'PREREQUISITE';
  }

  static payment(amount: number): UnlockRequirement {
    return new UnlockRequirement({
      type: 'PAYMENT',
      value: amount,
      description: `Pagar €${amount.toFixed(2)} para desbloquear`
    });
  }

  static gamification(points: number): UnlockRequirement {
    return new UnlockRequirement({
      type: 'GAMIFICATION',
      value: points,
      description: `Acumular ${points} puntos para desbloquear`
    });
  }

  static prerequisite(recipeId: string, recipeName: string): UnlockRequirement {
    return new UnlockRequirement({
      type: 'PREREQUISITE',
      value: recipeId,
      description: `Completar primero: ${recipeName}`
    });
  }

  toJSON() {
    return {
      type: this.type,
      value: this.value,
      description: this.description
    };
  }
}
