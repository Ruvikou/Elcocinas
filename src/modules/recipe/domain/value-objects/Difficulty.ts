export type DifficultyLevel = 'BASIC' | 'COMMON' | 'MODERATE' | 'EXPERT' | 'SUPREME';

export interface DifficultyColors {
  border: string;
  background: string;
  text: string;
  glow: string;
}

export class Difficulty {
  private readonly level: DifficultyLevel;

  constructor(level: DifficultyLevel) {
    this.level = level;
  }

  get value(): DifficultyLevel {
    return this.level;
  }

  get colors(): DifficultyColors {
    const colorMap: Record<DifficultyLevel, DifficultyColors> = {
      BASIC: {
        border: '#9E9E9E',
        background: '#F5F5F5',
        text: '#616161',
        glow: '0 0 8px rgba(158, 158, 158, 0.4)'
      },
      COMMON: {
        border: '#4CAF50',
        background: '#E8F5E9',
        text: '#2E7D32',
        glow: '0 0 8px rgba(76, 175, 80, 0.4)'
      },
      MODERATE: {
        border: '#2196F3',
        background: '#E3F2FD',
        text: '#1565C0',
        glow: '0 0 8px rgba(33, 150, 243, 0.4)'
      },
      EXPERT: {
        border: '#9C27B0',
        background: '#F3E5F5',
        text: '#7B1FA2',
        glow: '0 0 8px rgba(156, 39, 176, 0.4)'
      },
      SUPREME: {
        border: '#FFD700',
        background: '#FFF8E1',
        text: '#F57F17',
        glow: '0 0 12px rgba(255, 215, 0, 0.6)'
      }
    };
    return colorMap[this.level];
  }

  get multiplier(): number {
    const multipliers: Record<DifficultyLevel, number> = {
      BASIC: 1,
      COMMON: 2,
      MODERATE: 3,
      EXPERT: 4,
      SUPREME: 5
    };
    return multipliers[this.level];
  }

  get isLockedByDefault(): boolean {
    return this.level === 'SUPREME';
  }

  get unlockPoints(): number {
    const points: Record<DifficultyLevel, number> = {
      BASIC: 0,
      COMMON: 0,
      MODERATE: 300,
      EXPERT: 600,
      SUPREME: 1000
    };
    return points[this.level];
  }

  get unlockPrice(): number {
    const prices: Record<DifficultyLevel, number> = {
      BASIC: 0,
      COMMON: 0,
      MODERATE: 0.99,
      EXPERT: 1.99,
      SUPREME: 4.99
    };
    return prices[this.level];
  }

  static fromString(level: string): Difficulty {
    const validLevels: DifficultyLevel[] = ['BASIC', 'COMMON', 'MODERATE', 'EXPERT', 'SUPREME'];
    if (!validLevels.includes(level as DifficultyLevel)) {
      throw new Error(`Invalid difficulty level: ${level}`);
    }
    return new Difficulty(level as DifficultyLevel);
  }

  equals(other: Difficulty): boolean {
    return this.level === other.level;
  }
}
