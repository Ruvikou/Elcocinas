import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useRecipeStore } from '@/store/useRecipeStore';
import { useSocialStore } from '@/store/useSocialStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ACHIEVEMENTS } from '@/store/useGamificationStore';
import { 
  ChefHat, 
  Trophy, 
  Users, 
  Lock, 
  MapPin, 
  Edit,
  Settings
} from 'lucide-react';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const { recipes } = useRecipeStore();
  const { getFriends } = useSocialStore();
  const { getUserAchievements } = useGamificationStore();

  // In a real app, we would fetch the user by username
  // For now, we'll use the current user or show a placeholder
  const isOwnProfile = currentUser?.username === username;
  const profileUser = isOwnProfile ? currentUser : null;

  const userRecipes = profileUser 
    ? recipes.filter(r => r.createdBy === profileUser.id)
    : [];
  const completedRecipes = profileUser?.completedRecipes || [];
  const unlockedRecipes = profileUser?.unlockedRecipes || [];
  const friends = profileUser ? getFriends(profileUser.id) : [];
  const achievements = profileUser ? getUserAchievements(profileUser.id) : [];

  const nextLevelPoints = (profileUser?.level || 1) * 100;
  const currentLevelPoints = ((profileUser?.level || 1) - 1) * 100;
  const pointsProgress = profileUser 
    ? ((profileUser.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100 
    : 0;

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Usuario no encontrado</h2>
        <p className="text-muted-foreground">El perfil que buscas no existe o no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl border p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-orange-200">
              <AvatarImage src={profileUser.profileImage} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                {profileUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 font-bold border-4 border-white">
              {profileUser.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profileUser.username}</h1>
              {profileUser.isAdmin && (
                <Badge className="bg-purple-500">Admin</Badge>
              )}
            </div>
            
            <p className="text-lg text-muted-foreground mb-4">{profileUser.levelTitle}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Miembro desde {new Date(profileUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{completedRecipes.length}</div>
                <div className="text-xs text-muted-foreground">Recetas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{unlockedRecipes.length}</div>
                <div className="text-xs text-muted-foreground">Desbloqueadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{friends.length}</div>
                <div className="text-xs text-muted-foreground">Amigos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profileUser.points}</div>
                <div className="text-xs text-muted-foreground">Puntos</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {isOwnProfile ? (
              <>
                <Button variant="outline" className="w-full md:w-auto">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Agregar Amigo
              </Button>
            )}
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso al nivel {profileUser.level + 1}</span>
            <span className="text-sm text-muted-foreground">
              {profileUser.points} / {nextLevelPoints} pts
            </span>
          </div>
          <Progress value={pointsProgress} className="h-2" />
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recipes">
            <ChefHat className="w-4 h-4 mr-2" />
            Recetas
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Logros
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            <Lock className="w-4 h-4 mr-2" />
            Desbloqueadas
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="w-4 h-4 mr-2" />
            Amigos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="mt-6">
          {userRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No has creado recetas</h3>
              <p className="text-muted-foreground">
                {isOwnProfile ? 'Crea tu primera receta para compartirla con la comunidad.' : 'Este usuario aún no ha creado recetas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = achievements.some(a => a.id === achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' 
                      : 'bg-muted/50 border-muted opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  {isUnlocked && (
                    <Badge className="mt-2 bg-yellow-400 text-yellow-900">Desbloqueado</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="unlocked" className="mt-6">
          {unlockedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No has desbloqueado recetas</h3>
              <p className="text-muted-foreground">
                Explora el catálogo y desbloquea recetas para verlas aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlockedRecipes.map((recipeId: string) => {
                const recipe = recipes.find(r => r.id === recipeId);
                return recipe ? <RecipeCard key={recipe.id} recipe={recipe} /> : null;
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No tienes amigos</h3>
              <p className="text-muted-foreground">
                Conecta con otros cocineros para compartir experiencias.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friendId => (
                <div key={friendId} className="bg-card rounded-xl border p-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{friendId.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Usuario {friendId.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Amigo</p>
                  </div>
                  <Button variant="ghost" size="sm">Ver perfil</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
