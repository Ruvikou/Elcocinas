import { Difficulty } from '@/modules/recipe/domain/value-objects/Difficulty';
import type { DifficultyLevel } from '@/modules/recipe/domain/value-objects/Difficulty';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DifficultyBadge({ level, showLabel = true, size = 'md' }: DifficultyBadgeProps) {
  const difficulty = new Difficulty(level);
  const colors = difficulty.colors;
  
  const difficultyLabels: Record<DifficultyLevel, string> = {
    BASIC: 'Básico',
    COMMON: 'Común',
    MODERATE: 'Moderado',
    EXPERT: 'Experto',
    SUPREME: 'Supremo'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide ${sizeClasses[size]}`}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        boxShadow: colors.glow,
        border: `1px solid ${colors.border}`
      }}
    >
      {showLabel ? difficultyLabels[level] : level.charAt(0)}
    </span>
  );
}
