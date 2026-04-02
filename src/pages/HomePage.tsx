import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipeStore } from '@/store/useRecipeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  Users, 
  Flame,
  Star,
  Search,
  Lock
} from 'lucide-react';

export function HomePage() {
  const { recipes, seedRecipes } = useRecipeStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    seedRecipes();
  }, []);

  const featuredRecipes = recipes.slice(0, 3);
  const supremeRecipes = recipes.filter(r => r.difficulty.value === 'SUPREME');

  const stats = [
    { icon: ChefHat, label: 'Recetas', value: recipes.length },
    { icon: Users, label: 'Cocineros', value: '1.2K+' },
    { icon: Trophy, label: 'Niveles', value: '10' },
    { icon: Star, label: 'Premium', value: '5+' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-teal-500/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
              <Sparkles className="w-3 h-3 mr-1" />
              La experiencia culinaria definitiva
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Descubre el chef que llevas{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                dentro de ti
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explora recetas de todos los niveles, desde lo más básico hasta platillos supremos. 
              Desbloquea, cocina y comparte tu pasión por la gastronomía.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/recipes">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8">
                  <ChefHat className="w-5 h-5 mr-2" />
                  Explorar Recetas
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    <Flame className="w-5 h-5 mr-2" />
                    Comenzar Gratis
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Recetas Destacadas</h2>
            <p className="text-muted-foreground">Las favoritas de nuestra comunidad</p>
          </div>
          <Link to="/recipes">
            <Button variant="ghost" className="hidden sm:flex">
              Ver todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/recipes">
            <Button variant="outline">
              Ver todas las recetas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Supreme Recipes */}
      {supremeRecipes.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Recetas Supremas</h2>
                <p className="text-muted-foreground">El pináculo de la gastronomía</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supremeRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Cómo funciona?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comienza tu viaje culinario en simples pasos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: 'Explora',
              description: 'Descubre recetas de todos los niveles, desde básicas hasta supremas.',
              color: 'bg-blue-500'
            },
            {
              icon: Lock,
              title: 'Desbloquea',
              description: 'Usa puntos ganados o paga para acceder a recetas exclusivas.',
              color: 'bg-purple-500'
            },
            {
              icon: ChefHat,
              title: 'Cocina',
              description: 'Sigue el modo cocina con temporizadores y guía paso a paso.',
              color: 'bg-green-500'
            }
          ].map((step, index) => {
            const IconComponent = step.icon;
            return (
            <div key={step.title} className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 font-bold">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          );
          })}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Listo para comenzar tu aventura culinaria?
            </h2>
            <p className="text-orange-100 mb-8 max-w-xl mx-auto">
              Únete a miles de cocineros que ya están descubriendo nuevas recetas y mejorando sus habilidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-orange-600">
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link to="/recipes">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explorar Recetas
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* User Progress (if authenticated) */}
      {isAuthenticated && user && (
        <section className="container mx-auto px-4">
          <div className="bg-card rounded-2xl p-6 border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.level}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user.levelTitle}</h3>
                  <p className="text-muted-foreground">Nivel {user.level} • {user.points} puntos</p>
                </div>
              </div>
              
              <div className="flex gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold">{user.completedRecipes.length}</div>
                  <div className="text-sm text-muted-foreground">Recetas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{user.unlockedRecipes.length}</div>
                  <div className="text-sm text-muted-foreground">Desbloqueadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{user.friends.length}</div>
                  <div className="text-sm text-muted-foreground">Amigos</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
