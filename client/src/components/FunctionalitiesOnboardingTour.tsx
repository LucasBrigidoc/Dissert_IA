import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Brain, GraduationCap, Lightbulb, Archive, Target, MessageCircle, BookOpen, Edit3, Rocket, Network, CheckCircle, PartyPopper, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  category?: string;
}

const functionalitiesSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo às Funcionalidades!',
    description: 'Aqui você encontra todas as ferramentas do DISSERTIA para revolucionar sua escrita. Vamos conhecer cada categoria e quando usar cada ferramenta.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: '[data-testid="card-feature-argumentos"]',
    title: 'Refinamento de Ideias',
    description: 'Use esta ferramenta quando precisar organizar seus pensamentos e construir argumentos sólidos. Ideal para quando você tem ideias mas precisa estruturá-las melhor.',
    position: 'bottom',
    icon: <MessageCircle className="text-bright-blue" size={24} />,
    category: 'Ferramentas de Refinamento'
  },
  {
    target: '[data-testid="card-feature-repertorio"]',
    title: 'Explorador de Repertório',
    description: 'Use quando precisar de referências culturais, históricas ou científicas para enriquecer sua redação. Perfeito para buscar exemplos e dados que fortaleçam seus argumentos.',
    position: 'bottom',
    icon: <BookOpen className="text-bright-blue" size={24} />,
    category: 'Ferramentas de Refinamento'
  },
  {
    target: '[data-testid="card-feature-simulador"]',
    title: 'Simulador de Prova',
    description: 'Use quando quiser praticar redações completas em condições reais de prova. Controle o tempo, receba correção automática e acompanhe seu progresso ao longo do tempo.',
    position: 'bottom',
    icon: <GraduationCap className="text-bright-blue" size={24} />,
    category: 'Ferramentas de Prática'
  },
  {
    target: '[data-testid="card-feature-controlador"]',
    title: 'Controlador de Escrita',
    description: 'Use para ajustar e refinar textos já escritos. Ideal para melhorar a clareza, corrigir erros e adaptar o tom da sua escrita.',
    position: 'bottom',
    icon: <Edit3 className="text-bright-blue" size={24} />,
    category: 'Ferramentas de Prática'
  },
  {
    target: '[data-testid="card-feature-propostas"]',
    title: 'Gerador de Propostas',
    description: 'Use quando precisar de inspiração para temas de redação ou quando quiser praticar com propostas variadas. Gera temas atuais e relevantes automaticamente.',
    position: 'bottom',
    icon: <Lightbulb className="text-bright-blue" size={24} />,
    category: 'Ferramentas de Criação'
  },
  {
    target: '[data-testid="card-feature-estrutura"]',
    title: 'Estrutura Roteirizada',
    description: 'Use quando precisar de um modelo pronto para seguir. Ideal para iniciantes ou quando quiser experimentar diferentes estruturas de redação.',
    position: 'bottom',
    icon: <Network className="text-bright-blue" size={24} />,
    category: 'Ferramentas de Criação'
  },
  {
    target: '[data-testid="card-biblioteca"]',
    title: 'Biblioteca Pessoal',
    description: 'Aqui fica armazenado todo seu conteúdo: redações, repertórios salvos, estruturas e propostas. Use para organizar e revisar seu progresso.',
    position: 'bottom',
    icon: <Archive className="text-bright-blue" size={24} />,
    category: 'Organização'
  },
  {
    target: '[data-testid="card-quick-access"]',
    title: 'Fluxo de Trabalho Recomendado',
    description: 'Não sabe por onde começar? Siga este fluxo: 1) Construa argumentos, 2) Explore repertório, 3) Pratique com o simulador. Este é o caminho ideal para dominar a redação!',
    position: 'bottom',
    icon: <Rocket className="text-bright-blue" size={24} />,
    category: 'Dica de Uso'
  },
  {
    target: 'finish',
    title: 'Você está pronto!',
    description: 'Agora você conhece todas as ferramentas disponíveis e quando usar cada uma. Escolha a ferramenta que melhor se encaixa na sua necessidade atual e comece a criar!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface FunctionalitiesOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function FunctionalitiesOnboardingTour({ onComplete, onSkip }: FunctionalitiesOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = functionalitiesSteps[currentStep];
  const isLastStep = currentStep === functionalitiesSteps.length - 1;
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
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
        {targetRect && step.target !== 'intro' && step.target !== 'finish' && (
          <>
            <div
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top + window.scrollY - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
              }}
            >
              <div className="absolute inset-0 border-4 border-bright-blue/40 rounded-xl animate-ping" />
              <div className="absolute inset-0 border-4 border-bright-blue/60 rounded-xl shadow-2xl shadow-bright-blue/50" />
              <div className="absolute inset-0 border-4 border-bright-blue rounded-xl shadow-2xl shadow-bright-blue/70 animate-pulse">
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-bright-blue rounded-full shadow-lg shadow-bright-blue/50" />
              </div>
              <div 
                className="absolute inset-0 rounded-xl"
                style={{
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(59, 130, 246, 0.3)',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                }}
              />
            </div>

            <div
              className="absolute pointer-events-none z-[9999] animate-bounce"
              style={(() => {
                const isNearTop = targetRect.top < 100;
                
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
          </>
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-[90vw] max-w-lg"
        style={getTooltipPosition()}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-bright-blue/30 overflow-hidden">
          <div className="bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 px-4 py-2 border-b border-bright-blue/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-bright-blue/20 rounded-md flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-xs font-semibold text-bright-blue uppercase tracking-wide">
                  {step.category || 'Funcionalidades'}
                </span>
              </div>
              <button
                onClick={onSkip}
                className="text-bright-blue hover:text-dark-blue transition-colors text-xs font-semibold hover:underline"
                data-testid="button-skip-functionalities-onboarding"
              >
                Pular
              </button>
            </div>
          </div>

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

          <div className="p-6">
            <p className="text-soft-gray dark:text-gray-300 text-base leading-relaxed mb-6">
              {step.description}
            </p>

            {targetRect && step.target !== 'intro' && step.target !== 'finish' && (
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-bright-blue/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-bright-blue rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-bright-blue uppercase tracking-wide">
                    Prévia da Ferramenta
                  </span>
                </div>
                <div 
                  className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700"
                  style={{
                    maxHeight: '200px',
                    position: 'relative'
                  }}
                >
                  <div className="p-4 flex items-center justify-center min-h-[150px]">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-2xl mb-3">
                        {step.icon && <div className="scale-150">{step.icon}</div>}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[250px]">
                        Esta ferramenta está destacada na página
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-bright-blue/40 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-bright-blue/40 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-bright-blue/40 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-bright-blue/40 rounded-br-lg" />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-soft-gray dark:text-gray-400">
                    Passo {currentStep + 1} de {functionalitiesSteps.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {functionalitiesSteps.map((_, idx) => (
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
                    {Math.round(((currentStep + 1) / functionalitiesSteps.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-bright-blue to-dark-blue transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${((currentStep + 1) / functionalitiesSteps.length) * 100}%` }}
                />
              </div>
            </div>

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
