import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from '@/store/useRecipeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocialStore } from '@/store/useSocialStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { UnlockModal } from '@/components/UnlockModal';
import { CookingMode } from '@/components/CookingMode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { DifficultyBadge } from '@/components/DifficultyBadge';
import { 
  Clock, 
  ChefHat, 
  Lock, 
  Play, 
  Heart, 
  Share2, 
  MessageSquare,
  CheckCircle2,
  Send,
  ArrowLeft,
  Flame,
  Timer,
  UtensilsCrossed
} from 'lucide-react';

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecipeById, likeRecipe, unlikeRecipe, unlockRecipe } = useRecipeStore();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { addComment, getComments, likeRecipe: socialLikeRecipe, unlikeRecipe: socialUnlikeRecipe, hasLikedRecipe } = useSocialStore();
  const { completeRecipe, addComment: gamifyComment } = useGamificationStore();
  
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const recipe = id ? getRecipeById(id) : undefined;
  const comments = id ? getComments(id) : [];
  const hasLiked = id && user ? hasLikedRecipe(id, user.id) : false;
  const isUnlocked = user ? user.hasUnlockedRecipe(id || '') || !recipe?.isLocked : !recipe?.isLocked;

  useEffect(() => {
    if (!recipe) {
      navigate('/recipes');
    }
  }, [recipe, navigate]);

  if (!recipe) return null;

  const handleLike = () => {
    if (!isAuthenticated || !user || !id) return;
    
    if (hasLiked) {
      socialUnlikeRecipe(id, user.id);
      unlikeRecipe(id);
    } else {
      socialLikeRecipe(id, user.id);
      likeRecipe(id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSubmitComment = () => {
    if (!isAuthenticated || !user || !commentText.trim() || !id) return;
    
    addComment(id, user.id, user.username, commentText, user.profileImage);
    gamifyComment(user.id);
    setCommentText('');
  };

  const handleCookingComplete = () => {
    if (!user) return;
    
    const points = completeRecipe(user.id, recipe.id, recipe.difficulty.value);
    setEarnedPoints(points);
    
    // Mark recipe as completed
    const updatedUser = user.completeRecipe(recipe.id);
    updateUser(updatedUser);
    
    setIsCookingMode(false);
    setShowCompletionModal(true);
  };

  const handleUnlock = () => {
    if (!user || !id) return;
    
    const updatedUser = user.unlockRecipe(id);
    updateUser(updatedUser);
    unlockRecipe(id, user.id);
  };

  const mainImage = recipe.mainImage;
  const difficultyColors = recipe.difficulty.colors;

  if (isCookingMode) {
    return (
      <CookingMode
        recipe={recipe}
        onComplete={handleCookingComplete}
        onExit={() => setIsCookingMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh]">
        <img
          src={mainImage?.getUrl() || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200'}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <DifficultyBadge level={recipe.difficulty.value} />
              {recipe.isLocked && (
                <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                  <Lock className="w-3 h-3 mr-1" />
                  Bloqueada
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{recipe.title}</h1>
            <p className="text-white/80 max-w-2xl line-clamp-2">{recipe.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-card rounded-xl border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo total</p>
                  <p className="font-semibold">{recipe.formattedTotalTime}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Dificultad</p>
                  <p className="font-semibold">{recipe.difficulty.value}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ingredientes</p>
                  <p className="font-semibold">{recipe.ingredients.length}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-10 hidden sm:block" />
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pasos</p>
                  <p className="font-semibold">{recipe.steps.length}</p>
                </div>
              </div>
            </div>

            {/* Locked Recipe Message */}
            {!isUnlocked && (
              <div 
                className="p-6 rounded-xl border-2 text-center"
                style={{ 
                  borderColor: difficultyColors.border,
                  backgroundColor: difficultyColors.background + '40'
                }}
              >
                <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: difficultyColors.text }} />
                <h3 className="text-xl font-bold mb-2">Receta Bloqueada</h3>
                <p className="text-muted-foreground mb-4">
                  Esta receta requiere ser desbloqueada antes de poder ver todos los detalles y cocinarla.
                </p>
                <div className="space-y-2 mb-4">
                  {recipe.unlockRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 justify-center text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {req.getDescription()}
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Desbloquear Receta
                </Button>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
                <TabsTrigger value="steps" disabled={!isUnlocked}>Pasos</TabsTrigger>
                <TabsTrigger value="comments">Comentarios ({comments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="ingredients" className="space-y-4">
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    Lista de Ingredientes
                  </h3>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          ingredient.optional ? 'bg-muted/50' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-600">
                            {index + 1}
                          </div>
                          <span>{ingredient.name}</span>
                          {ingredient.optional && (
                            <Badge variant="secondary" className="text-xs">Opcional</Badge>
                          )}
                        </div>
                        <span className="font-medium text-muted-foreground">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {recipe.utensils.length > 0 && (
                  <div className="bg-card rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                      Utensilios Necesarios
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.utensils.map((utensil, index) => (
                        <Badge key={index} variant="secondary">{utensil}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                {isUnlocked ? (
                  <div className="space-y-4">
                    {recipe.steps.map((step) => (
                      <div key={step.id} className="bg-card rounded-xl border p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-orange-600">{step.order}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-lg leading-relaxed">{step.description}</p>
                            {step.tips && (
                              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-800">
                                  <span className="font-medium">Tip:</span> {step.tips}
                                </p>
                              </div>
                            )}
                            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                              <Timer className="w-4 h-4" />
                              <span>{step.formattedTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Desbloquea la receta para ver los pasos</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                {/* Add Comment */}
                {isAuthenticated && (
                  <div className="bg-card rounded-xl border p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.profileImage} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Comparte tu experiencia con esta receta..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="mb-2"
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim()}
                            size="sm"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Comentar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Sé el primero en comentar</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-card rounded-xl border p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={comment.userImage} />
                            <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{comment.username}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="mt-2">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-card rounded-xl border p-4 space-y-3">
              {isUnlocked ? (
                <Button 
                  onClick={() => setIsCookingMode(true)}
                  className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Receta
                </Button>
              ) : (
                <Button 
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="w-full py-6 text-lg bg-gradient-to-r from-orange-500 to-orange-600"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Desbloquear
                </Button>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className={`flex-1 ${hasLiked ? 'text-rose-500 border-rose-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                  {hasLiked ? 'Me gusta' : 'Me gusta'}
                </Button>
                <Button variant="outline" onClick={handleShare} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Recipe Info */}
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado por</span>
                  <span className="font-medium">
                    {recipe.createdBy === 'system' ? 'Cuisine Crafter' : recipe.createdBy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="font-medium">
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-medium">{recipe.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibilidad</span>
                  <Badge variant="secondary">{recipe.visibility}</Badge>
                </div>
              </div>
            </div>

            {/* Points Info */}
            {isAuthenticated && user && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Puntos por completar
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    +{25 * recipe.difficulty.multiplier}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    pts al completar esta receta
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        recipe={recipe}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlock={handleUnlock}
      />

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Receta Completada!</h2>
            <p className="text-muted-foreground mb-6">
              Has completado <span className="font-medium text-foreground">{recipe.title}</span>
            </p>
            <div className="bg-orange-50 rounded-xl p-4 mb-6">
              <div className="text-3xl font-bold text-orange-600">+{earnedPoints}</div>
              <p className="text-sm text-orange-700">puntos ganados</p>
            </div>
            <Button onClick={() => setShowCompletionModal(false)} className="w-full">
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
