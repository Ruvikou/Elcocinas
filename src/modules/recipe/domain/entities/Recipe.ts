import { Entity } from '@/shared/domain/entities/Entity';
import { Difficulty } from '../value-objects/Difficulty';
import type { DifficultyLevel } from '../value-objects/Difficulty';
import { Ingredient } from './Ingredient';
import { Step } from './Step';
import { RecipeImage } from '../value-objects/RecipeImage';
import { UnlockRequirement } from '../value-objects/UnlockRequirement';

export type Visibility = 'PUBLIC' | 'PRIVATE' | 'FRIENDS';

export interface RecipeProps {
  title: string;
  description: string;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: Step[];
  utensils: string[];
  images: RecipeImage[];
  isLocked: boolean;
  unlockRequirements: UnlockRequirement[];
  createdBy: string;
  visibility: Visibility;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  notes?: string;
}

export interface StepInput {
  order: number;
  description: string;
  timeMinutes: number;
  tips?: string;
  imageUrl?: string;
}

export interface CreateRecipeDTO {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  ingredients: IngredientInput[];
  steps: StepInput[];
  utensils: string[];
  images: { url: string; isMain?: boolean; alt?: string }[];
  isLocked?: boolean;
  unlockRequirements?: UnlockRequirementProps[];
  createdBy: string;
  visibility?: Visibility;
}

export interface UnlockRequirementProps {
  type: 'PAYMENT' | 'GAMIFICATION' | 'PREREQUISITE';
  value: number | string;
  description: string;
}

export class Recipe extends Entity<RecipeProps> {
  constructor(props: RecipeProps, id?: string) {
    super(props, id);
    this.validate();
  }

  // Getters
  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get difficulty(): Difficulty {
    return this.props.difficulty;
  }

  get ingredients(): Ingredient[] {
    return [...this.props.ingredients];
  }

  get steps(): Step[] {
    return [...this.props.steps].sort((a, b) => a.order - b.order);
  }

  get utensils(): string[] {
    return [...this.props.utensils];
  }

  get images(): RecipeImage[] {
    return [...this.props.images];
  }

  get mainImage(): RecipeImage | undefined {
    return this.props.images.find(img => img.getIsMain()) || this.props.images[0];
  }

  get isLocked(): boolean {
    return this.props.isLocked;
  }

  get unlockRequirements(): UnlockRequirement[] {
    return [...this.props.unlockRequirements];
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get visibility(): Visibility {
    return this.props.visibility;
  }

  get likes(): number {
    return this.props.likes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get totalTimeMinutes(): number {
    return this.props.steps.reduce((total, step) => total + step.timeMinutes, 0);
  }

  get formattedTotalTime(): string {
    const hours = Math.floor(this.totalTimeMinutes / 60);
    const minutes = this.totalTimeMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + 'min' : ''}`;
    }
    return `${minutes} min`;
  }

  get difficultyColor(): string {
    return this.props.difficulty.colors.border;
  }

  // Validation
  private validate(): void {
    if (!this.props.title || this.props.title.trim().length < 3) {
      throw new Error('Recipe title must be at least 3 characters');
    }
    if (!this.props.description || this.props.description.trim().length < 10) {
      throw new Error('Recipe description must be at least 10 characters');
    }
    if (this.props.ingredients.length === 0) {
      throw new Error('Recipe must have at least one ingredient');
    }
    if (this.props.steps.length === 0) {
      throw new Error('Recipe must have at least one step');
    }
    if (!this.validateSteps()) {
      throw new Error('All steps must have time greater than 0 minutes');
    }
  }

  validateSteps(): boolean {
    return this.props.steps.every(step => step.timeMinutes > 0);
  }

  // Domain methods
  canBeUnlockedBy(userPoints: number, completedRecipeIds: string[]): boolean {
    if (!this.props.isLocked) return true;
    
    return this.props.unlockRequirements.some(req => {
      if (req.isPayment()) return true;
      if (req.isGamification()) return userPoints >= (req.getValue() as number);
      if (req.isPrerequisite()) return completedRecipeIds.includes(req.getValue() as string);
      return false;
    });
  }

  unlock(): Recipe {
    return new Recipe(
      { ...this.props, isLocked: false, updatedAt: new Date() },
      this.id
    );
  }

  lock(): Recipe {
    return new Recipe(
      { ...this.props, isLocked: true, updatedAt: new Date() },
      this.id
    );
  }

  incrementLikes(): Recipe {
    return new Recipe(
      { ...this.props, likes: this.props.likes + 1, updatedAt: new Date() },
      this.id
    );
  }

  decrementLikes(): Recipe {
    return new Recipe(
      { ...this.props, likes: Math.max(0, this.props.likes - 1), updatedAt: new Date() },
      this.id
    );
  }

  updateImages(images: RecipeImage[]): Recipe {
    return new Recipe(
      { ...this.props, images, updatedAt: new Date() },
      this.id
    );
  }

  // Static factory method
  static create(dto: CreateRecipeDTO, id?: string): Recipe {
    const ingredients = dto.ingredients.map((ing) => 
      new Ingredient({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        optional: ing.optional,
        notes: ing.notes
      })
    );

    const steps = dto.steps.map((step, index) =>
      new Step({
        order: step.order || index + 1,
        description: step.description,
        timeMinutes: step.timeMinutes,
        tips: step.tips,
        imageUrl: step.imageUrl
      })
    );

    const images = dto.images.map((img, index) =>
      new RecipeImage(img.url, img.isMain || index === 0, img.alt || dto.title)
    );

    const unlockRequirements = dto.unlockRequirements?.map(req =>
      new UnlockRequirement(req)
    ) || [];

    const difficulty = Difficulty.fromString(dto.difficulty);

    return new Recipe({
      title: dto.title,
      description: dto.description,
      difficulty,
      ingredients,
      steps,
      utensils: dto.utensils || [],
      images,
      isLocked: dto.isLocked ?? difficulty.isLockedByDefault,
      unlockRequirements,
      createdBy: dto.createdBy,
      visibility: dto.visibility || 'PUBLIC',
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, id);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.props.title,
      description: this.props.description,
      difficulty: this.props.difficulty.value,
      difficultyColors: this.props.difficulty.colors,
      ingredients: this.props.ingredients.map(i => i.toJSON()),
      steps: this.steps.map(s => s.toJSON()),
      utensils: this.props.utensils,
      images: this.props.images.map(img => img.toJSON()),
      mainImage: this.mainImage?.toJSON(),
      isLocked: this.props.isLocked,
      unlockRequirements: this.props.unlockRequirements.map(r => r.toJSON()),
      createdBy: this.props.createdBy,
      visibility: this.props.visibility,
      likes: this.props.likes,
      totalTimeMinutes: this.totalTimeMinutes,
      formattedTotalTime: this.formattedTotalTime,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }
}
