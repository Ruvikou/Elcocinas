import { useState } from 'react';
import { useRecipeStore } from '@/store/useRecipeStore';
import type { DifficultyLevel } from '@/modules/recipe/domain/value-objects/Difficulty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';

const difficultyOptions: DifficultyLevel[] = ['BASIC', 'COMMON', 'MODERATE', 'EXPERT', 'SUPREME'];
const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'difficulty', label: 'Dificultad' },
  { value: 'time', label: 'Tiempo' },
  { value: 'likes', label: 'Popularidad' }
];

export function RecipeFilters() {
  const { filters, setFilters, clearFilters } = useRecipeStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDifficulty = (difficulty: DifficultyLevel) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    setFilters({ difficulties: newDifficulties });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.difficulties.length > 0 || 
    filters.maxTime < 300 ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-card rounded-xl border p-4 space-y-4">
      {/* Search and Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recetas, ingredientes..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:w-auto w-full"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {filters.difficulties.length + (filters.maxTime < 300 ? 1 : 0) + (filters.sortBy !== 'newest' ? 1 : 0)}
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2">
          {/* Difficulty Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Dificultad</label>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => toggleDifficulty(difficulty)}
                  className={`transition-all ${filters.difficulties.includes(difficulty) ? 'opacity-100' : 'opacity-50 grayscale'}`}
                >
                  <DifficultyBadge level={difficulty} />
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Tiempo máximo</label>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {filters.maxTime === 300 ? 'Sin límite' : `${filters.maxTime} min`}
              </span>
            </div>
            <Slider
              value={[filters.maxTime]}
              onValueChange={([value]) => setFilters({ maxTime: value })}
              min={15}
              max={300}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>15 min</span>
              <span>5h</span>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ordenar por</label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.sortBy === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ sortBy: option.value as any })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full text-muted-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.difficulties.map((difficulty) => (
            <Badge 
              key={difficulty} 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleDifficulty(difficulty)}
            >
              {difficulty}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {filters.maxTime < 300 && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setFilters({ maxTime: 300 })}
            >
              Max {filters.maxTime} min
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {filters.sortBy !== 'newest' && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setFilters({ sortBy: 'newest' })}
            >
              {sortOptions.find(o => o.value === filters.sortBy)?.label}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
