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
    target: 'latest-newsletter',
    title: 'Newsletter da Semana',
    description: 'Toda semana publicamos uma nova newsletter com conteúdo fresco e relevante. Aqui você encontra a edição mais recente, pronta para ser lida e aproveitada nos seus estudos!',
    position: 'top',
    icon: <Newspaper className="text-bright-blue" size={24} />,
    category: 'Conteúdo Novo'
  },
  {
    target: 'previous-newsletters',
    title: 'Newsletters Anteriores',
    description: 'Não perca nada! Todo o conteúdo educacional já publicado fica guardado aqui. Você pode acessar newsletters antigas sempre que precisar revisar um tema ou buscar referências específicas.',
    position: 'top',
    icon: <Archive className="text-bright-blue" size={24} />,
    category: 'Arquivo'
  },
  {
    target: 'finish',
    title: 'Aproveite o Conteúdo!',
    description: 'Pronto! Agora você sabe onde encontrar todo conteúdo educacional da DissertIA. Leia regularmente as newsletters para manter-se atualizado e turbinar suas redações com repertório de qualidade!',
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
    if (step.target === 'intro' || step.target === 'finish') {
      setTargetRect(null);
      return;
    }

    const targetMap: { [key: string]: string } = {
      'latest-newsletter': '.latest-newsletter-section',
      'previous-newsletters': '.previous-newsletters-section'
    };

    const selector = targetMap[step.target] || step.target;
    const element = document.querySelector(selector);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
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
    if (!targetRect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
      };
    }

    const tooltipWidth = 380;
    const tooltipHeight = 200;
    const padding = 20;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 10001,
    };
  };

  return (
    <div className="onboarding-overlay">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
        onClick={onSkip}
      />

      {targetRect && (
        <div
          className="fixed border-4 border-bright-blue rounded-lg pointer-events-none z-[10000] animate-pulse"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      )}

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
