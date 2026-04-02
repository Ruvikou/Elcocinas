import { useEffect } from 'react';
import { useRecipeStore } from '@/store/useRecipeStore';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeFilters } from '@/components/RecipeFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchX, RefreshCw } from 'lucide-react';

export function RecipesPage() {
  const { filteredRecipes, recipes, seedRecipes, clearFilters } = useRecipeStore();

  useEffect(() => {
    seedRecipes();
  }, []);

  const hasRecipes = recipes.length > 0;
  const hasFilteredRecipes = filteredRecipes.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Catálogo de Recetas</h1>
        <p className="text-muted-foreground">
          Explora nuestra colección de {recipes.length} recetas de todos los niveles
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <RecipeFilters />
      </div>

      {/* Content */}
      {!hasRecipes ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !hasFilteredRecipes ? (
        // Empty state
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No se encontraron recetas</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No hay recetas que coincidan con tus filtros. Intenta ajustar los criterios de búsqueda.
          </p>
          <Button onClick={clearFilters} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpiar filtros
          </Button>
        </div>
      ) : (
        // Recipe grid
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}

      {/* Difficulty Legend */}
      {hasRecipes && (
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-sm font-medium mb-4 text-muted-foreground">Leyenda de dificultad</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { level: 'BASIC', label: 'Básico', color: '#9E9E9E', desc: 'Siempre desbloqueado' },
              { level: 'COMMON', label: 'Común', color: '#4CAF50', desc: 'Fácil de preparar' },
              { level: 'MODERATE', label: 'Moderado', color: '#2196F3', desc: 'Requiere 300 pts o €0.99' },
              { level: 'EXPERT', label: 'Experto', color: '#9C27B0', desc: 'Requiere completar previas' },
              { level: 'SUPREME', label: 'Supremo', color: '#FFD700', desc: '€4.99 o múltiples requisitos' },
            ].map((diff) => (
              <div key={diff.level} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: diff.color }}
                />
                <div>
                  <span className="text-sm font-medium">{diff.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">- {diff.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
