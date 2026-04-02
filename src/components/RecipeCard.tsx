import { Link } from 'react-router-dom';
import { Recipe } from '@/modules/recipe/domain/entities/Recipe';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Lock, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  showLockStatus?: boolean;
}

export function RecipeCard({ recipe, showLockStatus = true }: RecipeCardProps) {
  const difficultyColors = recipe.difficulty.colors;
  const mainImage = recipe.mainImage;

  const difficultyLabels: Record<string, string> = {
    BASIC: 'Básico',
    COMMON: 'Común',
    MODERATE: 'Moderado',
    EXPERT: 'Experto',
    SUPREME: 'Supremo'
  };

  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card 
        className="group overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer h-full"
        style={{ 
          borderColor: difficultyColors.border,
          borderWidth: '2px',
          boxShadow: `0 4px 20px ${difficultyColors.border}20`
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mainImage?.getUrl() || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Difficulty Badge */}
          <div 
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            style={{ 
              backgroundColor: difficultyColors.background,
              color: difficultyColors.text,
              boxShadow: difficultyColors.glow
            }}
          >
            {difficultyLabels[recipe.difficulty.value]}
          </div>

          {/* Lock Badge */}
          {showLockStatus && recipe.isLocked && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {recipe.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{recipe.formattedTotalTime}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ChefHat className="w-4 h-4" />
                <span>{recipe.ingredients.length} ingredientes</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-rose-500">
              <Heart className="w-4 h-4 fill-current" />
              <span className="font-medium">{recipe.likes}</span>
            </div>
          </div>

          {/* Lock Status */}
          {showLockStatus && recipe.isLocked && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {recipe.unlockRequirements.length > 0 && recipe.unlockRequirements[0].getDescription()}
              </span>
              <Badge variant="secondary" className="text-xs">
                Bloqueada
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
