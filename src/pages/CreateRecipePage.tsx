import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useRecipeStore } from '@/store/useRecipeStore';
import type { DifficultyLevel } from '@/modules/recipe/domain/value-objects/Difficulty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChefHat, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Clock, 
  Lock,
  Unlock,
  Save,
  AlertCircle
} from 'lucide-react';

interface IngredientInput {
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
}

interface StepInput {
  description: string;
  timeMinutes: number;
  tips: string;
}

export function CreateRecipePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createRecipe } = useRecipeStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'COMMON' as DifficultyLevel,
    isLocked: false,
    images: ['']
  });
  
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', quantity: 1, unit: 'unidad', optional: false }
  ]);
  
  const [steps, setSteps] = useState<StepInput[]>([
    { description: '', timeMinutes: 5, tips: '' }
  ]);
  
  const [utensils, setUtensils] = useState<string[]>(['']);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
        <p className="text-muted-foreground mb-4">
          Solo los administradores pueden crear recetas públicas.
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    );
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 1, unit: 'unidad', optional: false }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, { description: '', timeMinutes: 5, tips: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof StepInput, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const addUtensil = () => {
    setUtensils([...utensils, '']);
  };

  const removeUtensil = (index: number) => {
    if (utensils.length > 1) {
      setUtensils(utensils.filter((_, i) => i !== index));
    }
  };

  const updateUtensil = (index: number, value: string) => {
    const updated = [...utensils];
    updated[index] = value;
    setUtensils(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim() || formData.title.length < 3) {
      setError('El título debe tener al menos 3 caracteres');
      return;
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim() && i.quantity > 0);
    if (validIngredients.length === 0) {
      setError('Debe haber al menos un ingrediente válido');
      return;
    }

    const validSteps = steps.filter(s => s.description.trim() && s.timeMinutes > 0);
    if (validSteps.length === 0) {
      setError('Debe haber al menos un paso válido con tiempo mayor a 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const recipe = createRecipe({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        ingredients: validIngredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          optional: ing.optional
        })),
        steps: validSteps.map((step, index) => ({
          order: index + 1,
          description: step.description,
          timeMinutes: step.timeMinutes,
          tips: step.tips || undefined
        })),
        utensils: utensils.filter(u => u.trim()),
        images: formData.images.filter(img => img.trim()).map((url, i) => ({
          url,
          isMain: i === 0,
          alt: formData.title
        })),
        isLocked: formData.isLocked,
        createdBy: user.id,
        visibility: 'PUBLIC'
      });

      navigate(`/recipes/${recipe.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear la receta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Crear Nueva Receta</h1>
          <p className="text-muted-foreground">Añade una nueva receta al catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la receta *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Paella Valenciana"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificultad *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: DifficultyLevel) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Básico</SelectItem>
                    <SelectItem value="COMMON">Común</SelectItem>
                    <SelectItem value="MODERATE">Moderado</SelectItem>
                    <SelectItem value="EXPERT">Experto</SelectItem>
                    <SelectItem value="SUPREME">Supremo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe la receta, su origen, sabor..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL de la imagen principal</Label>
              <Input
                id="image"
                value={formData.images[0]}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="locked"
                checked={formData.isLocked}
                onCheckedChange={(checked) => setFormData({ ...formData, isLocked: checked })}
              />
              <Label htmlFor="locked" className="flex items-center gap-2 cursor-pointer">
                {formData.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                Receta bloqueada (requiere desbloqueo)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ingredientes *</span>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  placeholder="Nombre del ingrediente"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Cantidad"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-24"
                  min="0"
                  step="0.1"
                />
                <Input
                  placeholder="Unidad"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-28"
                />
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id={`optional-${index}`}
                    checked={ingredient.optional}
                    onChange={(e) => updateIngredient(index, 'optional', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`optional-${index}`} className="text-sm whitespace-nowrap">Opcional</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Pasos *
              </span>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir paso
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Paso {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe el paso..."
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Tiempo (minutos) *</Label>
                    <Input
                      type="number"
                      value={step.timeMinutes}
                      onChange={(e) => updateStep(index, 'timeMinutes', parseInt(e.target.value) || 0)}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Tips (opcional)</Label>
                    <Input
                      placeholder="Consejo útil..."
                      value={step.tips}
                      onChange={(e) => updateStep(index, 'tips', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Utensils */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Utensilios</span>
              <Button type="button" variant="outline" size="sm" onClick={addUtensil}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {utensils.map((utensil, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Ej: Sartén"
                    value={utensil}
                    onChange={(e) => updateUtensil(index, e.target.value)}
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUtensil(index)}
                    disabled={utensils.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isSubmitting ? (
              <><Clock className="w-4 h-4 mr-2 animate-spin" /> Creando...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Crear Receta</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
