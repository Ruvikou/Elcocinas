import { Entity } from '@/shared/domain/entities/Entity';

export type UserRole = 'USER' | 'ADMIN';

export interface CompletedRecipe {
  recipeId: string;
  completedAt: Date;
  rating?: number;
  comment?: string;
  photoUrl?: string;
}

export interface UserProps {
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  profileImage?: string;
  points: number;
  completedRecipes: CompletedRecipe[];
  unlockedRecipes: string[];
  friends: string[];
  createdRecipes: string[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  passwordHash: string;
  role?: UserRole;
  profileImage?: string;
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps, id?: string) {
    super(props, id);
    this.validate();
  }

  // Getters
  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get isAdmin(): boolean {
    return this.props.role === 'ADMIN';
  }

  get profileImage(): string | undefined {
    return this.props.profileImage;
  }

  get points(): number {
    return this.props.points;
  }

  get completedRecipes(): CompletedRecipe[] {
    return [...this.props.completedRecipes];
  }

  get unlockedRecipes(): string[] {
    return [...this.props.unlockedRecipes];
  }

  get friends(): string[] {
    return [...this.props.friends];
  }

  get createdRecipes(): string[] {
    return [...this.props.createdRecipes];
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get level(): number {
    const points = this.props.points;
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    if (points < 1500) return 5;
    if (points < 2200) return 6;
    if (points < 3000) return 7;
    if (points < 4000) return 8;
    if (points < 5500) return 9;
    return 10;
  }

  get levelTitle(): string {
    const titles: Record<number, string> = {
      1: 'Novato Cocinero',
      2: 'Aprendiz de Chef',
      3: 'Cocinero Casual',
      4: 'Chef en Casa',
      5: 'Gastrónomo',
      6: 'Chef Experimentado',
      7: 'Maestro Culinario',
      8: 'Chef Profesional',
      9: 'Gran Chef',
      10: 'Leyenda Culinaria'
    };
    return titles[this.level] || 'Leyenda Culinaria';
  }

  // Validation
  private validate(): void {
    if (!this.props.email || !this.isValidEmail(this.props.email)) {
      throw new Error('Valid email is required');
    }
    if (!this.props.username || this.props.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!this.props.passwordHash || this.props.passwordHash.length < 8) {
      throw new Error('Password hash is invalid');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Domain methods
  hasUnlockedRecipe(recipeId: string): boolean {
    return this.props.unlockedRecipes.includes(recipeId);
  }

  hasCompletedRecipe(recipeId: string): boolean {
    return this.props.completedRecipes.some(cr => cr.recipeId === recipeId);
  }

  unlockRecipe(recipeId: string): User {
    if (this.hasUnlockedRecipe(recipeId)) {
      return this;
    }
    return new User(
      {
        ...this.props,
        unlockedRecipes: [...this.props.unlockedRecipes, recipeId],
        updatedAt: new Date()
      },
      this.id
    );
  }

  completeRecipe(recipeId: string, rating?: number, comment?: string, photoUrl?: string): User {
    if (this.hasCompletedRecipe(recipeId)) {
      return this;
    }
    
    const completedRecipe: CompletedRecipe = {
      recipeId,
      completedAt: new Date(),
      rating,
      comment,
      photoUrl
    };

    return new User(
      {
        ...this.props,
        completedRecipes: [...this.props.completedRecipes, completedRecipe],
        updatedAt: new Date()
      },
      this.id
    );
  }

  addPoints(points: number): User {
    if (points <= 0) return this;
    return new User(
      {
        ...this.props,
        points: this.props.points + points,
        updatedAt: new Date()
      },
      this.id
    );
  }

  addFriend(friendId: string): User {
    if (this.props.friends.includes(friendId)) return this;
    return new User(
      {
        ...this.props,
        friends: [...this.props.friends, friendId],
        updatedAt: new Date()
      },
      this.id
    );
  }

  removeFriend(friendId: string): User {
    return new User(
      {
        ...this.props,
        friends: this.props.friends.filter(id => id !== friendId),
        updatedAt: new Date()
      },
      this.id
    );
  }

  addCreatedRecipe(recipeId: string): User {
    if (this.props.createdRecipes.includes(recipeId)) return this;
    return new User(
      {
        ...this.props,
        createdRecipes: [...this.props.createdRecipes, recipeId],
        updatedAt: new Date()
      },
      this.id
    );
  }

  updateProfile(updates: Partial<Pick<UserProps, 'username' | 'profileImage'>>): User {
    return new User(
      {
        ...this.props,
        ...updates,
        updatedAt: new Date()
      },
      this.id
    );
  }

  verifyEmail(): User {
    return new User(
      {
        ...this.props,
        emailVerified: true,
        updatedAt: new Date()
      },
      this.id
    );
  }

  // Static factory method
  static create(dto: CreateUserDTO, id?: string): User {
    return new User({
      email: dto.email.toLowerCase().trim(),
      username: dto.username.trim(),
      passwordHash: dto.passwordHash,
      role: dto.role || 'USER',
      profileImage: dto.profileImage,
      points: 0,
      completedRecipes: [],
      unlockedRecipes: [],
      friends: [],
      createdRecipes: [],
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, id);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.props.email,
      username: this.props.username,
      role: this.props.role,
      profileImage: this.props.profileImage,
      points: this.props.points,
      level: this.level,
      levelTitle: this.levelTitle,
      completedRecipesCount: this.props.completedRecipes.length,
      unlockedRecipesCount: this.props.unlockedRecipes.length,
      friendsCount: this.props.friends.length,
      createdRecipesCount: this.props.createdRecipes.length,
      emailVerified: this.props.emailVerified,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }

  toPublicJSON() {
    return {
      id: this.id,
      username: this.props.username,
      profileImage: this.props.profileImage,
      points: this.props.points,
      level: this.level,
      levelTitle: this.levelTitle,
      completedRecipesCount: this.props.completedRecipes.length,
      unlockedRecipesCount: this.props.unlockedRecipes.length
    };
  }
}
