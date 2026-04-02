import { useState, useEffect, useRef, useCallback } from 'react';
import { Recipe } from '@/modules/recipe/domain/entities/Recipe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Check,
  Timer,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CookingModeProps {
  recipe: Recipe;
  onComplete: () => void;
  onExit: () => void;
}

export function CookingMode({ recipe, onComplete, onExit }: CookingModeProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Initialize timer when step changes
  useEffect(() => {
    setTimerSeconds(currentStep.timeMinutes * 60);
    setIsTimerRunning(false);
    setShowAlert(false);
  }, [currentStepIndex, currentStep.timeMinutes]);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            triggerAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const triggerAlert = useCallback(() => {
    setShowAlert(true);
    
    // Visual alert - flash screen
    alertRef.current = setInterval(() => {
      setShowAlert(prev => !prev);
    }, 500);

    // Play sound if not muted
    if (!isMuted) {
      playBeep();
    }

    // Stop alert after 5 seconds
    setTimeout(() => {
      if (alertRef.current) clearInterval(alertRef.current);
      setShowAlert(false);
    }, 5000);
  }, [isMuted]);

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const speakStep = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentStep.description);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(currentStep.timeMinutes * 60);
    setShowAlert(false);
    if (alertRef.current) clearInterval(alertRef.current);
  };

  const adjustTime = (minutes: number) => {
    setTimerSeconds(prev => Math.max(0, prev + minutes * 60));
  };

  const goToNextStep = () => {
    if (!isLastStep) {
      setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B35', '#2EC4B6', '#FFD700', '#9C27B0']
    });
    onComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background transition-colors duration-200 ${showAlert ? 'bg-red-100' : ''}`}>
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            Salir
          </Button>
          <div>
            <h2 className="font-semibold text-sm md:text-base line-clamp-1">{recipe.title}</h2>
            <p className="text-xs text-muted-foreground">
              Paso {currentStepIndex + 1} de {steps.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-card border-b">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 max-w-4xl mx-auto">
        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? 'bg-orange-500'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={goToNextStep}
            disabled={isLastStep}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Step Card */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-orange-600">{currentStep.order}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-medium leading-relaxed">
                {currentStep.description}
              </h3>
              {currentStep.tips && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800">{currentStep.tips}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timer Section */}
          <div className="bg-muted rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Temporizador</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Tiempo recomendado: {currentStep.formattedTime}
              </div>
            </div>

            <div className="text-center mb-6">
              <div className={`text-6xl md:text-7xl font-mono font-bold tracking-wider ${
                timerSeconds === 0 && showAlert ? 'text-red-600 animate-pulse' : 'text-foreground'
              }`}>
                {formatTime(timerSeconds)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustTime(-1)}
                disabled={timerSeconds < 60}
              >
                -1 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustTime(-5)}
                disabled={timerSeconds < 300}
              >
                -5 min
              </Button>

              <Button
                onClick={toggleTimer}
                className={`${isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {isTimerRunning ? (
                  <><Pause className="w-4 h-4 mr-2" /> Pausar</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Iniciar</>
                )}
              </Button>

              <Button variant="outline" onClick={resetTimer}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustTime(5)}
              >
                +5 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustTime(1)}
              >
                +1 min
              </Button>
            </div>
          </div>

          {/* Text to Speech */}
          <Button
            variant="ghost"
            onClick={speakStep}
            className="w-full mt-4"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Leer paso en voz alta
          </Button>
        </Card>

        {/* Complete Button */}
        {isLastStep && (
          <Button
            onClick={handleComplete}
            className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Check className="w-5 h-5 mr-2" />
            Finalizar Receta
          </Button>
        )}
      </div>
    </div>
  );
}
