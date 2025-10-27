import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Newspaper, BookOpen, Archive, Sparkles, PartyPopper, CheckCircle, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  featureLabel?: string;
}

const newsletterSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo à Newsletter Educacional!',
    description: 'Aqui você encontra conteúdo semanal curado especialmente para enriquecer suas redações. Receba referências culturais, temas atuais, dados relevantes e insights que vão fazer toda diferença na sua nota!',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    featureLabel: 'Início'
  },
  {
    target: 'content',
    title: 'Conteúdo Semanal de Qualidade',
    description: 'Toda semana publicamos uma nova newsletter com temas atuais, repertórios culturais e referências que você pode usar nas suas redações. As newsletters anteriores ficam disponíveis para consulta a qualquer momento!',
    position: 'center',
    icon: <Newspaper className="text-bright-blue" size={24} />,
    featureLabel: 'Conteúdo'
  },
  {
    target: 'finish',
    title: 'Aproveite o Conteúdo!',
    description: 'Pronto! Leia regularmente as newsletters para manter-se atualizado e turbinar suas redações com repertório de qualidade. Bons estudos!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    featureLabel: 'Concluído'
  }
];

interface NewsletterOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function NewsletterOnboardingTour({ onComplete, onSkip }: NewsletterOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = newsletterSteps[currentStep];
  const isLastStep = currentStep === newsletterSteps.length - 1;
  const isFirstStep = currentStep === 0;

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

  const getTooltipPosition = () => {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]">
        {/* Darkened background */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-[90vw] max-w-lg"
        style={getTooltipPosition()}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-bright-blue/30 overflow-hidden">
          {/* Feature Label Badge */}
          <div className="bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 px-4 py-2 border-b border-bright-blue/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-bright-blue/20 rounded-md flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-xs font-semibold text-bright-blue uppercase tracking-wide">
                  Newsletter
                </span>
              </div>
              <button
                onClick={onSkip}
                className="text-bright-blue hover:text-dark-blue transition-colors text-xs font-semibold hover:underline"
                data-testid="button-skip-onboarding"
              >
                Pular
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-bright-blue to-dark-blue p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    {step.icon || <Sparkles className="text-bright-blue" size={20} />}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{step.title}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-soft-gray dark:text-gray-300 text-base leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-soft-gray dark:text-gray-400">
                    Passo {currentStep + 1} de {newsletterSteps.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {newsletterSteps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          idx <= currentStep
                            ? 'bg-bright-blue w-3'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-bright-blue font-bold ml-1">
                    {Math.round(((currentStep + 1) / newsletterSteps.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-bright-blue to-dark-blue transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${((currentStep + 1) / newsletterSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={isFirstStep}
                className="flex-1 border-soft-gray/30 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 h-11"
                data-testid="button-previous-step"
              >
                <ChevronLeft size={18} className="mr-1" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all h-11 font-semibold"
                data-testid="button-next-step"
              >
                {isLastStep ? (
                  <>
                    Começar
                    <CheckCircle size={18} className="ml-1" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight size={18} className="ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
