import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe } from '@/modules/recipe/domain/entities/Recipe';
import type { CreateRecipeDTO } from '@/modules/recipe/domain/entities/Recipe';
import type { DifficultyLevel } from '@/modules/recipe/domain/value-objects/Difficulty';
import { Difficulty } from '@/modules/recipe/domain/value-objects/Difficulty';
import { Ingredient } from '@/modules/recipe/domain/entities/Ingredient';
import { Step } from '@/modules/recipe/domain/entities/Step';
import { RecipeImage } from '@/modules/recipe/domain/value-objects/RecipeImage';
import { UnlockRequirement } from '@/modules/recipe/domain/value-objects/UnlockRequirement';

interface RecipeFilters {
  search: string;
  difficulties: DifficultyLevel[];
  maxTime: number;
  ingredients: string[];
  sortBy: 'difficulty' | 'time' | 'likes' | 'newest';
}

interface RecipeState {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  filters: RecipeFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
  unlockRecipe: (recipeId: string, userId: string) => void;
  likeRecipe: (recipeId: string) => void;
  unlikeRecipe: (recipeId: string) => void;
  setFilters: (filters: Partial<RecipeFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  getRecipeById: (id: string) => Recipe | undefined;
  getRecipesByUser: (userId: string) => Recipe[];
  createRecipe: (dto: CreateRecipeDTO) => Recipe;
  seedRecipes: () => void;
}

// Load recipes from localStorage
const loadRecipes = (): Recipe[] => {
  const stored = localStorage.getItem('cuisine_crafter_recipes');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return parsed.map((r: any) => reconstructRecipe(r));
  } catch {
    return [];
  }
};

// Reconstruct Recipe from JSON
const reconstructRecipe = (data: any): Recipe => {
  const ingredients = data.props?.ingredients || data.ingredients || [];
  const steps = data.props?.steps || data.steps || [];
  const images = data.props?.images || data.images || [];
  const unlockRequirements = data.props?.unlockRequirements || data.unlockRequirements || [];
  
  return new Recipe({
    title: data.props?.title || data.title,
    description: data.props?.description || data.description,
    difficulty: Difficulty.fromString(data.props?.difficulty?.value || data.difficulty),
    ingredients: ingredients.map((i: any) => new Ingredient({
      name: i.props?.name || i.name,
      quantity: i.props?.quantity || i.quantity,
      unit: i.props?.unit || i.unit,
      optional: i.props?.optional || i.optional,
      notes: i.props?.notes || i.notes
    }, i.id)),
    steps: steps.map((s: any) => new Step({
      order: s.props?.order || s.order,
      description: s.props?.description || s.description,
      timeMinutes: s.props?.timeMinutes || s.timeMinutes,
      tips: s.props?.tips || s.tips,
      imageUrl: s.props?.imageUrl || s.imageUrl
    }, s.id)),
    utensils: data.props?.utensils || data.utensils || [],
    images: images.map((img: any) => new RecipeImage(
      img.url || img.props?.url,
      img.isMain || img.props?.isMain,
      img.alt || img.props?.alt
    )),
    isLocked: data.props?.isLocked ?? data.isLocked ?? false,
    unlockRequirements: unlockRequirements.map((req: any) => new UnlockRequirement({
      type: req.type || req.props?.type,
      value: req.value || req.props?.value,
      description: req.description || req.props?.description
    })),
    createdBy: data.props?.createdBy || data.createdBy,
    visibility: data.props?.visibility || data.visibility || 'PUBLIC',
    likes: data.props?.likes || data.likes || 0,
    createdAt: new Date(data.props?.createdAt || data.createdAt),
    updatedAt: new Date(data.props?.updatedAt || data.updatedAt)
  }, data.id || data._id);
};

// Save recipes to localStorage
const saveRecipes = (recipes: Recipe[]) => {
  localStorage.setItem('cuisine_crafter_recipes', JSON.stringify(recipes));
};

// Seed data - 5 initial recipes
const seedData: CreateRecipeDTO[] = [
  {
    title: 'Huevo Frito Perfecto',
    description: 'El clásico desayuno. Aprende a hacer un huevo frito con la yema cremosa y la clara perfectamente cocinada.',
    difficulty: 'BASIC',
    ingredients: [
      { name: 'Huevo', quantity: 1, unit: 'unidad' },
      { name: 'Aceite de oliva', quantity: 1, unit: 'cucharada' },
      { name: 'Sal', quantity: 1, unit: 'pizca' }
    ],
    steps: [
      { order: 1, description: 'Calentar el aceite en una sartén a fuego medio', timeMinutes: 2 },
      { order: 2, description: 'Romper el huevo y verterlo suavemente en la sartén', timeMinutes: 1 },
      { order: 3, description: 'Cocinar hasta que la clara esté cuajada y la yema cremosa', timeMinutes: 2 }
    ],
    utensils: ['Sartén', 'Espátula'],
    images: [{ url: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?w=800', isMain: true, alt: 'Huevo frito perfecto' }],
    isLocked: false,
    createdBy: 'system',
    visibility: 'PUBLIC'
  },
  {
    title: 'Tortilla Española Clásica',
    description: 'La receta tradicional de tortilla española con patatas y cebolla. Un plato emblemático de la cocina española.',
    difficulty: 'COMMON',
    ingredients: [
      { name: 'Huevos', quantity: 4, unit: 'unidades' },
      { name: 'Patatas', quantity: 3, unit: 'unidades' },
      { name: 'Cebolla', quantity: 1, unit: 'unidad' },
      { name: 'Aceite de oliva', quantity: 200, unit: 'ml' },
      { name: 'Sal', quantity: 1, unit: 'cucharadita' }
    ],
    steps: [
      { order: 1, description: 'Pelar y cortar las patatas en rodajas finas', timeMinutes: 5 },
      { order: 2, description: 'Cortar la cebolla en juliana fina', timeMinutes: 3 },
      { order: 3, description: 'Freír las patatas y cebolla a fuego lento hasta que estén tiernas', timeMinutes: 15 },
      { order: 4, description: 'Escurrir el aceite y mezclar con los huevos batidos', timeMinutes: 3 },
      { order: 5, description: 'Cocinar la mezcla en la sartén dando la vuelta para cuajar por ambos lados', timeMinutes: 4 }
    ],
    utensils: ['Sartén', 'Espátula', 'Bol', 'Colador'],
    images: [{ url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', isMain: true, alt: 'Tortilla española' }],
    isLocked: false,
    createdBy: 'system',
    visibility: 'PUBLIC'
  },
  {
    title: 'Risotto de Setas',
    description: 'Un risotto cremoso con setas silvestres, vino blanco y queso parmesano. Requiere técnica y paciencia.',
    difficulty: 'MODERATE',
    ingredients: [
      { name: 'Arroz Arborio', quantity: 300, unit: 'g' },
      { name: 'Setas variadas', quantity: 250, unit: 'g' },
      { name: 'Caldo de verduras', quantity: 1, unit: 'litro' },
      { name: 'Vino blanco', quantity: 100, unit: 'ml' },
      { name: 'Queso Parmesano', quantity: 50, unit: 'g' },
      { name: 'Mantequilla', quantity: 40, unit: 'g' },
      { name: 'Cebolla', quantity: 1, unit: 'unidad' },
      { name: 'Ajo', quantity: 2, unit: 'dientes' }
    ],
    steps: [
      { order: 1, description: 'Sofreír la cebolla y el ajo picados en mantequilla', timeMinutes: 5 },
      { order: 2, description: 'Agregar las setas limpias y cortadas, saltear', timeMinutes: 5 },
      { order: 3, description: 'Añadir el arroz y tostar ligeramente', timeMinutes: 3 },
      { order: 4, description: 'Verter el vino blanco y dejar evaporar', timeMinutes: 3 },
      { order: 5, description: 'Agregar el caldo caliente cucharón por cucharón, removiendo constantemente', timeMinutes: 20 },
      { order: 6, description: 'Incorporar el parmesano y la mantequilla restante para cremar', timeMinutes: 4 }
    ],
    utensils: ['Cacerola', 'Cucharón', 'Espátula de madera', 'Cuchillo'],
    images: [{ url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800', isMain: true, alt: 'Risotto de setas' }],
    isLocked: true,
    unlockRequirements: [
      { type: 'GAMIFICATION', value: 300, description: 'Acumular 300 puntos para desbloquear' },
      { type: 'PAYMENT', value: 0.99, description: 'Pagar €0.99 para desbloquear' }
    ],
    createdBy: 'system',
    visibility: 'PUBLIC'
  },
  {
    title: 'Pato a la Naranja Estilo Cordon Bleu',
    description: 'Una receta sofisticada de pato con salsa de naranja al estilo francés. Requiere precisión y técnica avanzada.',
    difficulty: 'EXPERT',
    ingredients: [
      { name: 'Magret de pato', quantity: 2, unit: 'unidades' },
      { name: 'Naranjas', quantity: 4, unit: 'unidades' },
      { name: 'Grand Marnier', quantity: 50, unit: 'ml' },
      { name: 'Caldo de ave', quantity: 200, unit: 'ml' },
      { name: 'Miel', quantity: 2, unit: 'cucharadas' },
      { name: 'Tomillo fresco', quantity: 3, unit: 'ramitas' },
      { name: 'Pimienta negra', quantity: 1, unit: 'cucharadita' },
      { name: 'Sal', quantity: 1, unit: 'cucharadita' }
    ],
    steps: [
      { order: 1, description: 'Puntuar la piel del pato en rombos y sazonar', timeMinutes: 5 },
      { order: 2, description: 'Exprimir el zumo de 2 naranjas y reservar', timeMinutes: 3 },
      { order: 3, description: 'Sellar el pato por el lado de la piel hasta que esté crujiente', timeMinutes: 8 },
      { order: 4, description: 'Dar la vuelta y cocinar al punto deseado', timeMinutes: 6 },
      { order: 5, description: 'Retirar el pato y desglasar la sartén con Grand Marnier', timeMinutes: 2 },
      { order: 6, description: 'Agregar el zumo de naranja, caldo y miel, reducir la salsa', timeMinutes: 15 },
      { order: 7, description: 'Filetear el pato y servir con la salsa', timeMinutes: 5 },
      { order: 8, description: 'Decorar con rodajas de naranja y tomillo', timeMinutes: 1 }
    ],
    utensils: ['Sartén', 'Cuchillo afilado', 'Exprimidor', 'Colador fino'],
    images: [{ url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800', isMain: true, alt: 'Pato a la naranja' }],
    isLocked: true,
    unlockRequirements: [
      { type: 'PREREQUISITE', value: '', description: 'Completar Risotto de Setas + dejar un comentario' },
      { type: 'PAYMENT', value: 1.99, description: 'Pagar €1.99 para desbloquear' }
    ],
    createdBy: 'system',
    visibility: 'PUBLIC'
  },
  {
    title: 'Sopa de Tortuga con Trufas y Oro Comestible',
    description: 'La receta más exclusiva de nuestro recetario. Una sopa sofisticada con ingredientes de lujo y técnicas culinarias de alta gastronomía.',
    difficulty: 'SUPREME',
    ingredients: [
      { name: 'Carne de tortuga (sustituto ético)', quantity: 500, unit: 'g' },
      { name: 'Trufas negras', quantity: 30, unit: 'g' },
      { name: 'Oro comestible 24k', quantity: 1, unit: 'hoja' },
      { name: 'Jerez vintage', quantity: 100, unit: 'ml' },
      { name: 'Caldo de carne', quantity: 2, unit: 'litros' },
      { name: 'Verduras mirepoix', quantity: 300, unit: 'g' },
      { name: 'Tomillo', quantity: 2, unit: 'ramitas' },
      { name: 'Laurel', quantity: 2, unit: 'hojas' },
      { name: 'Pimienta de Sichuan', quantity: 1, unit: 'cucharadita' },
      { name: 'Mantequilla clarificada', quantity: 50, unit: 'g' }
    ],
    steps: [
      { order: 1, description: 'Preparar el caldo con las verduras mirepoix y especias, cocinar 2 horas', timeMinutes: 120 },
      { order: 2, description: 'Dorar la carne de tortuga en mantequilla clarificada', timeMinutes: 8 },
      { order: 3, description: 'Agregar el Jerez y flambear cuidadosamente', timeMinutes: 3 },
      { order: 4, description: 'Incorporar el caldo colado y cocinar a fuego lento', timeMinutes: 45 },
      { order: 5, description: 'Laminar las trufas negras finamente', timeMinutes: 5 },
      { order: 6, description: 'Reducir la sopa hasta obtener consistencia sedosa', timeMinutes: 20 },
      { order: 7, description: 'Rectificar sazón y añadir las trufas laminadas', timeMinutes: 3 },
      { order: 8, description: 'Servir en platos calientes con decoración de oro', timeMinutes: 2 },
      { order: 9, description: 'Añadir el toque final de pimienta de Sichuan molida', timeMinutes: 1 },
      { order: 10, description: 'Presentar con pan artesanal tostado', timeMinutes: 2 },
      { order: 11, description: 'Servir inmediatamente mientras esté caliente', timeMinutes: 1 },
      { order: 12, description: 'Disfrutar de esta experiencia culinaria única', timeMinutes: 10 }
    ],
    utensils: ['Cacerola grande', 'Sartén', 'Colador fino', 'Cuchillo de trufa', 'Cucharón'],
    images: [{ url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', isMain: true, alt: 'Sopa de lujo con trufas' }],
    isLocked: true,
    unlockRequirements: [
      { type: 'PAYMENT', value: 4.99, description: 'Pagar €4.99 para desbloquear' },
      { type: 'GAMIFICATION', value: 1000, description: 'Completar 3 recetas Expertas + 1000 puntos + subir video' }
    ],
    createdBy: 'system',
    visibility: 'PUBLIC'
  }
];

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      filteredRecipes: [],
      filters: {
        search: '',
        difficulties: [],
        maxTime: 300,
        ingredients: [],
        sortBy: 'newest'
      },
      isLoading: false,
      error: null,

      setRecipes: (recipes: Recipe[]) => {
        set({ recipes });
        saveRecipes(recipes);
        get().applyFilters();
      },

      addRecipe: (recipe: Recipe) => {
        const recipes = [...get().recipes, recipe];
        set({ recipes });
        saveRecipes(recipes);
        get().applyFilters();
      },

      updateRecipe: (recipe: Recipe) => {
        const recipes = get().recipes.map(r => r.id === recipe.id ? recipe : r);
        set({ recipes });
        saveRecipes(recipes);
        get().applyFilters();
      },

      deleteRecipe: (recipeId: string) => {
        const recipes = get().recipes.filter(r => r.id !== recipeId);
        set({ recipes });
        saveRecipes(recipes);
        get().applyFilters();
      },

      unlockRecipe: (recipeId: string, _userId: string) => {
        const recipe = get().recipes.find(r => r.id === recipeId);
        if (recipe) {
          const unlocked = recipe.unlock();
          get().updateRecipe(unlocked);
        }
      },

      likeRecipe: (recipeId: string) => {
        const recipe = get().recipes.find(r => r.id === recipeId);
        if (recipe) {
          const liked = recipe.incrementLikes();
          get().updateRecipe(liked);
        }
      },

      unlikeRecipe: (recipeId: string) => {
        const recipe = get().recipes.find(r => r.id === recipeId);
        if (recipe) {
          const unliked = recipe.decrementLikes();
          get().updateRecipe(unliked);
        }
      },

      setFilters: (filters: Partial<RecipeFilters>) => {
        set(state => ({ filters: { ...state.filters, ...filters } }));
        get().applyFilters();
      },

      applyFilters: () => {
        const { recipes, filters } = get();
        let filtered = [...recipes];

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(searchLower) ||
            r.description.toLowerCase().includes(searchLower) ||
            r.ingredients.some(i => i.name.toLowerCase().includes(searchLower))
          );
        }

        // Difficulty filter
        if (filters.difficulties.length > 0) {
          filtered = filtered.filter(r => 
            filters.difficulties.includes(r.difficulty.value)
          );
        }

        // Max time filter
        if (filters.maxTime < 300) {
          filtered = filtered.filter(r => r.totalTimeMinutes <= filters.maxTime);
        }

        // Sort
        switch (filters.sortBy) {
          case 'difficulty':
            const difficultyOrder = { BASIC: 1, COMMON: 2, MODERATE: 3, EXPERT: 4, SUPREME: 5 };
            filtered.sort((a, b) => difficultyOrder[a.difficulty.value] - difficultyOrder[b.difficulty.value]);
            break;
          case 'time':
            filtered.sort((a, b) => a.totalTimeMinutes - b.totalTimeMinutes);
            break;
          case 'likes':
            filtered.sort((a, b) => b.likes - a.likes);
            break;
          case 'newest':
            filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            break;
        }

        set({ filteredRecipes: filtered });
      },

      clearFilters: () => {
        set({
          filters: {
            search: '',
            difficulties: [],
            maxTime: 300,
            ingredients: [],
            sortBy: 'newest'
          }
        });
        get().applyFilters();
      },

      getRecipeById: (id: string) => {
        return get().recipes.find(r => r.id === id);
      },

      getRecipesByUser: (userId: string) => {
        return get().recipes.filter(r => r.createdBy === userId);
      },

      createRecipe: (dto: CreateRecipeDTO) => {
        const recipe = Recipe.create(dto);
        get().addRecipe(recipe);
        return recipe;
      },

      seedRecipes: () => {
        const existing = loadRecipes();
        if (existing.length === 0) {
          const seeded = seedData.map(dto => Recipe.create(dto));
          set({ recipes: seeded });
          saveRecipes(seeded);
          get().applyFilters();
        } else {
          set({ recipes: existing });
          get().applyFilters();
        }
      }
    }),
    {
      name: 'cuisine-crafter-recipes',
      partialize: (state) => ({ recipes: state.recipes, filters: state.filters })
    }
  )
);
