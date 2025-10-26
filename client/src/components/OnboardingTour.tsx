import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Calendar, Target, BarChart3, Zap, Mail, Settings, CheckCircle, PartyPopper, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, TrendingUp, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  featureLabel?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo ao DISSERTIA!',
    description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades da tela de Home. Em cada aba você encontrará um card de introdução para te ajudar a aproveitar ao máximo sua experiência.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    featureLabel: 'Início'
  },
  {
    target: '[data-testid="card-welcome-exams"]',
    title: 'Suas Próximas Provas',
    description: 'Aqui você pode visualizar suas próximas provas e compromissos. Clique em "Gerenciar Provas" para adicionar, editar ou remover provas. Mantenha seu calendário organizado!',
    position: 'bottom',
    icon: <Calendar className="text-bright-blue" size={24} />,
    featureLabel: 'Gestão de Provas'
  },
  {
    target: '[data-testid="card-goals"]',
    title: 'Metas da Semana',
    description: 'Defina e acompanhe suas metas semanais. Marque as tarefas como concluídas para acompanhar seu progresso. Você pode adicionar novas metas clicando em "Gerenciar Metas".',
    position: 'bottom',
    icon: <Target className="text-bright-blue" size={24} />,
    featureLabel: 'Sistema de Metas'
  },
  {
    target: '[data-testid="card-improvement-points"]',
    title: 'Pontos por Competência',
    description: 'Visualize seu desempenho em cada competência do ENEM. O gráfico mostra suas médias e áreas que precisam de mais atenção. Quanto mais redações você fizer, mais precisa será esta análise!',
    position: 'bottom',
    icon: <BarChart3 className="text-bright-blue" size={24} />,
    featureLabel: 'Análise de Desempenho'
  },
  {
    target: '[data-testid="card-progress"]',
    title: 'Seu Progresso Geral',
    description: 'Acompanhe suas estatísticas gerais: média de pontuação, meta de nota, redações feitas e horas de estudo acumuladas. Defina sua meta de nota para visualizar seu progresso!',
    position: 'bottom',
    icon: <TrendingUp className="text-bright-blue" size={24} />,
    featureLabel: 'Estatísticas Gerais'
  },
  {
    target: '[data-testid="card-evolution-chart"]',
    title: 'Gráfico de Evolução',
    description: 'Visualize a evolução das suas notas ao longo do tempo. O gráfico mostra suas pontuações e você pode filtrar por período para analisar seu progresso.',
    position: 'bottom',
    icon: <TrendingUp className="text-bright-blue" size={24} />,
    featureLabel: 'Evolução de Notas'
  },
  {
    target: '[data-testid="card-simulator-time"]',
    title: 'Tempo de Simulação',
    description: 'Monitore quanto tempo você leva em cada etapa da redação: brainstorm, rascunho e passa a limpo. Isso te ajuda a gerenciar melhor o tempo durante as provas!',
    position: 'bottom',
    icon: <Clock className="text-bright-blue" size={24} />,
    featureLabel: 'Gestão de Tempo'
  },
  {
    target: '[data-testid="card-study-schedule"]',
    title: 'Cronograma de Estudos',
    description: 'Organize sua rotina semanal de estudos. Defina quantas horas você vai estudar por dia e marque os dias concluídos para manter sua disciplina!',
    position: 'bottom',
    icon: <BookOpen className="text-bright-blue" size={24} />,
    featureLabel: 'Rotina de Estudos'
  },
  {
    target: '[data-testid="card-newsletter"]',
    title: 'Newsletter Semanal',
    description: 'Acesse conteúdos semanais com temas de atualidades, repertórios culturais e dicas para suas redações. Explore os artigos disponíveis para enriquecer seu conhecimento!',
    position: 'bottom',
    icon: <Mail className="text-bright-blue" size={24} />,
    featureLabel: 'Conteúdo Semanal'
  },
  {
    target: '[data-testid="card-simulador-provas"]',
    title: 'Simulador de Provas',
    description: 'Acesse o simulador completo de redações. Pratique com temas reais e receba feedback detalhado sobre sua escrita. Ideal para treinar para o ENEM e vestibulares!',
    position: 'bottom',
    icon: <GraduationCap className="text-bright-blue" size={24} />,
    featureLabel: 'Prática de Redação'
  },
  {
    target: 'finish',
    title: 'Você está pronto!',
    description: 'Agora você conhece todos os recursos da sua dashboard! Explore o menu superior para descobrir ainda mais ferramentas: Funcionalidades completas, Configurações e muito mais. Boa sorte nos estudos!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    featureLabel: 'Concluído'
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [elementPreview, setElementPreview] = useState<string | null>(null);

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (step.target === 'intro' || step.target === 'finish') {
      setTargetRect(null);
      setElementPreview(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Capture element preview
      const htmlElement = element as HTMLElement;
      const clone = htmlElement.cloneNode(true) as HTMLElement;
      
      // Get computed styles and create a preview
      const computedStyle = window.getComputedStyle(htmlElement);
      setElementPreview(htmlElement.innerHTML.substring(0, 500));
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

  const getArrowIcon = () => {
    if (!targetRect || step.position === 'center') return null;
    
    switch (step.position) {
      case 'bottom':
        return <ArrowUp size={24} className="text-bright-blue" />;
      case 'top':
        return <ArrowDown size={24} className="text-bright-blue" />;
      case 'left':
        return <ArrowRight size={24} className="text-bright-blue" />;
      case 'right':
        return <ArrowLeft size={24} className="text-bright-blue" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]">
        {/* Darkened background */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
        {/* Highlight for target element */}
        {targetRect && step.target !== 'intro' && step.target !== 'finish' && (
          <>
            {/* Multi-layer highlight effect */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top + window.scrollY - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
              }}
            >
              {/* Outer glow - animated */}
              <div className="absolute inset-0 border-4 border-bright-blue/40 rounded-xl animate-ping" />
              
              {/* Middle ring */}
              <div className="absolute inset-0 border-4 border-bright-blue/60 rounded-xl shadow-2xl shadow-bright-blue/50" />
              
              {/* Inner highlight - pulsing */}
              <div className="absolute inset-0 border-4 border-bright-blue rounded-xl shadow-2xl shadow-bright-blue/70 animate-pulse">
                {/* Corner indicators */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
              </div>

              {/* Spotlight effect */}
              <div 
                className="absolute inset-0 rounded-xl"
                style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(59, 130, 246, 0.3)',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                }}
              />
            </div>

            {/* Floating label indicator */}
            <div
              className="absolute pointer-events-none z-[9999] animate-bounce"
              style={(() => {
                const isNearTop = targetRect.top < 100;
                const isNearBottom = targetRect.bottom > window.innerHeight - 100;
                
                if (isNearTop) {
                  return {
                    top: targetRect.bottom + window.scrollY + 20,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)'
                  };
                } else {
                  return {
                    top: targetRect.top + window.scrollY - 60,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)'
                  };
                }
              })()}
            >
              <div className="bg-bright-blue text-white px-4 py-2 rounded-full shadow-2xl shadow-bright-blue/50 flex items-center gap-2 font-semibold text-sm whitespace-nowrap">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Veja aqui
                {targetRect.top < 100 ? (
                  <ArrowUp size={16} className="animate-bounce" />
                ) : (
                  <ArrowDown size={16} className="animate-bounce" />
                )}
              </div>
            </div>

            {/* Connecting line/arrow from tooltip to element */}
            {step.position !== 'center' && (
              <div
                className="absolute pointer-events-none z-[9999]"
                style={(() => {
                  const tooltipPos = getTooltipPosition();
                  const spacing = 20;
                  
                  switch (step.position) {
                    case 'bottom':
                      return {
                        top: targetRect.bottom + window.scrollY,
                        left: targetRect.left + targetRect.width / 2,
                        transform: 'translateX(-50%)'
                      };
                    case 'top':
                      return {
                        bottom: window.innerHeight - (targetRect.top + window.scrollY),
                        left: targetRect.left + targetRect.width / 2,
                        transform: 'translateX(-50%)'
                      };
                    default:
                      return {};
                  }
                })()}
              >
                <div className="flex flex-col items-center animate-pulse">
                  {getArrowIcon()}
                </div>
              </div>
            )}
          </>
        )}
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
                  Elementos da Home
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

            {/* Element Preview */}
            {targetRect && step.target !== 'intro' && step.target !== 'finish' && (
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-bright-blue/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-bright-blue rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-bright-blue uppercase tracking-wide">
                    Prévia do Elemento
                  </span>
                </div>
                <div 
                  className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700"
                  style={{
                    maxHeight: '200px',
                    position: 'relative'
                  }}
                >
                  {/* Visual representation */}
                  <div className="p-4 flex items-center justify-center min-h-[150px]">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-2xl mb-3">
                        {step.icon && <div className="scale-150">{step.icon}</div>}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[250px]">
                        Este elemento está destacado na página
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative border effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-bright-blue/40 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-bright-blue/40 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-bright-blue/40 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-bright-blue/40 rounded-br-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-soft-gray dark:text-gray-400">
                    Passo {currentStep + 1} de {onboardingSteps.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {onboardingSteps.map((_, idx) => (
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
                    {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-bright-blue to-dark-blue transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
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
