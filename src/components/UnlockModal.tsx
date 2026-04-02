import { useState } from 'react';
import { Recipe } from '@/modules/recipe/domain/entities/Recipe';
import { useAuthStore } from '@/store/useAuthStore';
import { useRecipeStore } from '@/store/useRecipeStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  CreditCard, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

interface UnlockModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export function UnlockModal({ recipe, isOpen, onClose, onUnlock }: UnlockModalProps) {
  const { user } = useAuthStore();
  const { unlockRecipe } = useRecipeStore();
  const { unlockRecipe: gamifyUnlock } = useGamificationStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const userPoints = user?.points || 0;
  const pointsRequirement = recipe.unlockRequirements.find(r => r.isGamification());
  const paymentRequirement = recipe.unlockRequirements.find(r => r.isPayment());
  const prerequisiteRequirement = recipe.unlockRequirements.find(r => r.isPrerequisite());
  
  const requiredPoints = pointsRequirement ? (pointsRequirement.getValue() as number) : 0;
  const hasEnoughPoints = userPoints >= requiredPoints;
  const pointsProgress = Math.min((userPoints / requiredPoints) * 100, 100);
  
  const price = paymentRequirement ? (paymentRequirement.getValue() as number) : 0;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate Stripe payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Unlock recipe
    if (user) {
      unlockRecipe(recipe.id, user.id);
      gamifyUnlock(user.id, recipe.id);
    }
    
    setPaymentSuccess(true);
    setIsProcessing(false);
    
    setTimeout(() => {
      onUnlock();
      onClose();
      setPaymentSuccess(false);
    }, 1500);
  };

  const handlePointsUnlock = async () => {
    if (!hasEnoughPoints) return;
    
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Unlock with points (deduct points)
    if (user) {
      unlockRecipe(recipe.id, user.id);
      gamifyUnlock(user.id, recipe.id);
    }
    
    setPaymentSuccess(true);
    setIsProcessing(false);
    
    setTimeout(() => {
      onUnlock();
      onClose();
      setPaymentSuccess(false);
    }, 1500);
  };

  if (paymentSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">¡Receta Desbloqueada!</h3>
            <p className="text-muted-foreground text-center">
              Ahora puedes cocinar {recipe.title}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Receta Bloqueada</DialogTitle>
              <DialogDescription>
                Desbloquea <span className="font-medium text-foreground">{recipe.title}</span> para cocinarla
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagar
            </TabsTrigger>
            <TabsTrigger value="gamification">
              <Trophy className="w-4 h-4 mr-2" />
              Puntos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4">
            <div className="bg-muted rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Precio de desbloqueo</p>
              <div className="text-4xl font-bold text-green-600">
                €{price.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Sparkles className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <span className="font-medium text-green-800">Acceso inmediato</span>
                  <p className="text-green-700">Desbloquea la receta al instante</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <span className="font-medium text-blue-800">Acceso de por vida</span>
                  <p className="text-blue-700">Una vez desbloqueada, siempre será tuya</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando...</>
              ) : (
                <><CreditCard className="w-5 h-5 mr-2" /> Pagar €{price.toFixed(2)}</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Pago seguro procesado por Stripe. No almacenamos tus datos de tarjeta.
            </p>
          </TabsContent>

          <TabsContent value="gamification" className="space-y-4">
            <div className="bg-muted rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Tus puntos</span>
                <span className="font-bold">{userPoints} pts</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Puntos necesarios</span>
                <span className="font-bold">{requiredPoints} pts</span>
              </div>
              
              <Progress value={pointsProgress} className="h-3" />
              
              <div className="mt-4 text-center">
                <Badge variant={hasEnoughPoints ? 'default' : 'secondary'}>
                  {hasEnoughPoints ? '¡Tienes suficientes puntos!' : `Te faltan ${requiredPoints - userPoints} pts`}
                </Badge>
              </div>
            </div>

            {!hasEnoughPoints && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">¿Cómo ganar más puntos?</p>
                    <ul className="mt-2 space-y-1 text-amber-700">
                      <li>• Completa recetas (+25-125 pts)</li>
                      <li>• Deja comentarios (+10 pts)</li>
                      <li>• Sube fotos (+20 pts)</li>
                      <li>• Dale like a recetas (+5 pts)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handlePointsUnlock} 
              disabled={!hasEnoughPoints || isProcessing}
              className="w-full py-6 text-lg"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando...</>
              ) : (
                <><Trophy className="w-5 h-5 mr-2" /> Desbloquear con Puntos</>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {prerequisiteRequirement && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-purple-800">Requisito adicional</p>
                <p className="text-purple-700">{prerequisiteRequirement.getDescription()}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
