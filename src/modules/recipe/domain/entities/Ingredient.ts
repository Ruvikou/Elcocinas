import { Entity } from '@/shared/domain/entities/Entity';

export interface IngredientProps {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  notes?: string;
}

export class Ingredient extends Entity<IngredientProps> {
  constructor(props: IngredientProps, id?: string) {
    super(props, id);
    this.validate();
  }

  get name(): string {
    return this.props.name;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unit(): string {
    return this.props.unit;
  }

  get optional(): boolean {
    return this.props.optional || false;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get displayText(): string {
    const quantity = this.quantity % 1 === 0 
      ? this.quantity.toString() 
      : this.quantity.toFixed(2);
    return `${quantity} ${this.unit} ${this.name}`;
  }

  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('Ingredient name is required');
    }
    if (this.props.quantity <= 0) {
      throw new Error('Ingredient quantity must be greater than 0');
    }
    if (!this.props.unit || this.props.unit.trim().length === 0) {
      throw new Error('Ingredient unit is required');
    }
  }

  updateQuantity(newQuantity: number): Ingredient {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    return new Ingredient(
      { ...this.props, quantity: newQuantity },
      this.id
    );
  }

  toJSON() {
    return {
      id: this.id,
      name: this.props.name,
      quantity: this.props.quantity,
      unit: this.props.unit,
      optional: this.props.optional,
      notes: this.props.notes
    };
  }
}
