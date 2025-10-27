import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Newspaper, BookOpen, Archive, Sparkles, PartyPopper, CheckCircle, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  category?: string;
}

const newsletterSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo à Newsletter Educacional!',
    description: 'Aqui você encontra conteúdo semanal curado especialmente para enriquecer suas redações. Receba referências culturais, temas atuais, dados relevantes e insights que vão fazer toda diferença na sua nota!',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'content',
    title: 'Conteúdo Semanal de Qualidade',
    description: 'Toda semana publicamos uma nova newsletter com temas atuais, repertórios culturais e referências que você pode usar nas suas redações. As newsletters anteriores ficam disponíveis para consulta a qualquer momento!',
    position: 'center',
    icon: <Newspaper className="text-bright-blue" size={24} />,
    category: 'Conteúdo'
  },
  {
    target: 'finish',
    title: 'Aproveite o Conteúdo!',
    description: 'Pronto! Leia regularmente as newsletters para manter-se atualizado e turbinar suas redações com repertório de qualidade. Bons estudos!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface NewsletterOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function NewsletterOnboardingTour({ onComplete, onSkip }: NewsletterOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = newsletterSteps[currentStep];
  const isLastStep = currentStep === newsletterSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    // All steps are centered, no need to target specific elements
    setTargetRect(null);
  }, [currentStep, step.target]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipStyle = () => {
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10001,
    };
  };

  return (
    <div className="onboarding-overlay">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
        onClick={onSkip}
      />

      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-[380px] max-w-[90vw]"
        style={getTooltipStyle()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {step.icon}
            <div>
              <h3 className="font-bold text-lg text-dark-blue">{step.title}</h3>
              {step.category && (
                <p className="text-xs text-bright-blue font-medium">{step.category}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-soft-gray hover:text-dark-blue -mr-2 -mt-2"
            data-testid="button-skip-onboarding"
          >
            <X size={18} />
          </Button>
        </div>

        <p className="text-soft-gray text-sm leading-relaxed mb-6">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {newsletterSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-bright-blue'
                    : index < currentStep
                    ? 'w-1.5 bg-bright-blue/50'
                    : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="text-soft-gray border-soft-gray/30"
                data-testid="button-previous-step"
              >
                <ChevronLeft size={16} />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-gradient-to-r from-bright-blue to-dark-blue text-white"
              data-testid="button-next-step"
            >
              {isLastStep ? 'Começar' : 'Próximo'}
              {!isLastStep && <ChevronRight size={16} className="ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
