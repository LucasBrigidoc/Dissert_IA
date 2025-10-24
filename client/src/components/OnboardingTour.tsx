import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const onboardingSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: '🎉 Bem-vindo ao DISSERTIA!',
    description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades da plataforma. Este guia vai te ajudar a aproveitar ao máximo sua experiência.',
    position: 'center'
  },
  {
    target: '[data-testid="card-welcome-exams"]',
    title: '📅 Suas Próximas Provas',
    description: 'Aqui você pode visualizar suas próximas provas e compromissos. Clique em "Gerenciar Provas" para adicionar, editar ou remover provas. Mantenha seu calendário organizado!',
    position: 'bottom'
  },
  {
    target: '[data-testid="card-goals"]',
    title: '🎯 Metas da Semana',
    description: 'Defina e acompanhe suas metas semanais. Marque as tarefas como concluídas para acompanhar seu progresso. Você pode adicionar novas metas clicando em "Gerenciar Metas".',
    position: 'bottom'
  },
  {
    target: '[data-testid="card-improvement-points"]',
    title: '📊 Pontos por Competência',
    description: 'Visualize seu desempenho em cada competência do ENEM. O gráfico mostra suas médias e áreas que precisam de mais atenção. Quanto mais redações você fizer, mais precisa será esta análise!',
    position: 'bottom'
  },
  {
    target: '[data-testid="card-visible-features"]',
    title: '⭐ Funcionalidades em Destaque',
    description: 'Estas são as funcionalidades mais importantes da plataforma. Você pode personalizar quais aparecem aqui em Configurações. Clique em qualquer card para usar a funcionalidade!',
    position: 'top'
  },
  {
    target: '[data-testid="button-nav-functionalities"]',
    title: '🚀 Explorar Funcionalidades',
    description: 'Clique aqui para ver TODAS as funcionalidades disponíveis: Correção de Redações, Banco de Repertórios, Gerador de Títulos, Análise de Competências e muito mais!',
    position: 'bottom'
  },
  {
    target: '[data-testid="button-nav-newsletter"]',
    title: '📰 Newsletter Semanal',
    description: 'Receba resumos semanais com temas de atualidades, repertórios culturais e dicas para suas redações. Mantenha-se atualizado com conteúdo relevante!',
    position: 'bottom'
  },
  {
    target: '[data-testid="button-nav-settings"]',
    title: '⚙️ Configurações',
    description: 'Personalize sua experiência, gerencie seu plano, escolha quais funcionalidades aparecem na Home e muito mais. Explore as opções disponíveis!',
    position: 'bottom'
  },
  {
    target: 'finish',
    title: '✅ Você está pronto!',
    description: 'Agora você conhece todas as funcionalidades principais do DISSERTIA. Comece explorando as funcionalidades ou fazendo sua primeira simulação de redação. Boa sorte nos estudos!',
    position: 'center'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (step.target === 'intro' || step.target === 'finish') {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, step.target]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetRect || step.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const spacing = 20;
    let position: React.CSSProperties = {};

    switch (step.position) {
      case 'bottom':
        position = {
          top: targetRect.bottom + spacing + window.scrollY,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)'
        };
        break;
      case 'top':
        position = {
          top: targetRect.top - spacing + window.scrollY,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
        break;
      case 'left':
        position = {
          top: targetRect.top + targetRect.height / 2 + window.scrollY,
          left: targetRect.left - spacing,
          transform: 'translate(-100%, -50%)'
        };
        break;
      case 'right':
        position = {
          top: targetRect.top + targetRect.height / 2 + window.scrollY,
          left: targetRect.right + spacing,
          transform: 'translateY(-50%)'
        };
        break;
    }

    return position;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]">
        {/* Darkened background */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Highlight for target element */}
        {targetRect && step.target !== 'intro' && step.target !== 'finish' && (
          <div
            className="absolute border-4 border-bright-blue rounded-lg shadow-2xl shadow-bright-blue/50 pointer-events-none animate-pulse"
            style={{
              top: targetRect.top + window.scrollY - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-[90vw] max-w-md"
        style={getTooltipPosition()}
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-bright-blue/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-bright-blue to-dark-blue p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="text-bright-blue" size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
              </div>
              <button
                onClick={onSkip}
                className="text-white/80 hover:text-white transition-colors"
                data-testid="button-skip-onboarding"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-soft-gray text-sm leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-soft-gray">
                  Passo {currentStep + 1} de {onboardingSteps.length}
                </span>
                <span className="text-xs text-bright-blue font-medium">
                  {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bright-blue to-dark-blue transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={isFirstStep}
                className="flex-1 border-soft-gray/30 disabled:opacity-50"
                data-testid="button-previous-step"
              >
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:opacity-90"
                data-testid="button-next-step"
              >
                {isLastStep ? 'Começar' : 'Próximo'}
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
