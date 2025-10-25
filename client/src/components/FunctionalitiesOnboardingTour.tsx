import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Brain, GraduationCap, Lightbulb, Archive, Target, MessageCircle, BookOpen, Edit3, Rocket, Network, CheckCircle, PartyPopper, ArrowDown, ArrowUp, Layers } from 'lucide-react';
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
    target: 'categories',
    title: 'As 3 Categorias de IA',
    description: 'Para dominar a redação perfeita, organizamos as ferramentas em 3 categorias estratégicas que cobrem todo o processo de criação. Cada categoria foi pensada para uma fase específica do seu desenvolvimento como escritor.',
    position: 'center',
    icon: <Layers className="text-bright-blue" size={24} />,
    category: 'Categorias'
  },
  {
    target: '[data-testid="card-feature-argumentos"]',
    title: 'Refinamento de Ideias',
    description: 'Esta ferramenta ajuda você a transformar ideias soltas em argumentos bem estruturados e convincentes. Use quando: você tiver pensamentos desorganizados sobre um tema, precisar fortalecer a lógica dos seus argumentos, ou quiser desenvolver melhor suas teses e contra-argumentos. Perfeita para a fase de planejamento antes de escrever sua redação.',
    position: 'bottom',
    icon: <MessageCircle className="text-bright-blue" size={24} />,
    category: 'Refinamento'
  },
  {
    target: '[data-testid="card-feature-repertorio"]',
    title: 'Explorador de Repertório',
    description: 'Esta ferramenta busca referências culturais, históricas, científicas e sociológicas para enriquecer sua redação. Use quando: precisar de exemplos concretos para seus argumentos, quiser citar dados e fatos relevantes, ou necessitar de repertório sociocultural de qualidade. Essencial para aumentar a nota de competência 2 e 3 do ENEM.',
    position: 'bottom',
    icon: <BookOpen className="text-bright-blue" size={24} />,
    category: 'Refinamento'
  },
  {
    target: '[data-testid="card-feature-simulador"]',
    title: 'Simulador de Prova',
    description: 'Esta ferramenta recria as condições reais do ENEM e outros vestibulares. Use quando: quiser praticar com cronômetro ativo, precisar de correção detalhada baseada nas 5 competências, ou quiser acompanhar sua evolução através de gráficos e estatísticas. Fundamental para ganhar confiança e identificar pontos de melhoria.',
    position: 'bottom',
    icon: <GraduationCap className="text-bright-blue" size={24} />,
    category: 'Prática'
  },
  {
    target: '[data-testid="card-feature-controlador"]',
    title: 'Controlador de Escrita',
    description: 'Esta ferramenta permite editar e aprimorar textos já escritos com precisão. Use quando: precisar revisar e melhorar uma redação completa, quiser corrigir erros gramaticais e de coesão, ou necessitar ajustar o tom e clareza do texto. Perfeita para a fase de revisão e polimento final.',
    position: 'bottom',
    icon: <Edit3 className="text-bright-blue" size={24} />,
    category: 'Prática'
  },
  {
    target: '[data-testid="card-feature-propostas"]',
    title: 'Gerador de Propostas',
    description: 'Esta ferramenta cria temas de redação atualizados e relevantes automaticamente. Use quando: não souber sobre o que escrever, quiser praticar com temas variados e atuais, ou precisar de inspiração para começar a estudar. Gera propostas completas com textos motivadores no estilo ENEM.',
    position: 'bottom',
    icon: <Lightbulb className="text-bright-blue" size={24} />,
    category: 'Criação'
  },
  {
    target: '[data-testid="card-feature-estrutura"]',
    title: 'Estrutura Roteirizada',
    description: 'Esta ferramenta oferece modelos prontos e personalizáveis de estrutura de redação. Use quando: estiver começando e precisar de um roteiro claro, quiser experimentar diferentes abordagens estruturais, ou necessitar de um guia passo a passo para organizar suas ideias. Ideal para iniciantes ganharem confiança.',
    position: 'bottom',
    icon: <Network className="text-bright-blue" size={24} />,
    category: 'Criação'
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
    if (step.target === 'intro' || step.target === 'finish' || step.target === 'categories') {
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

            {step.target === 'categories' && (
              <div className="mb-6 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 pr-1">
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-3.5 border border-blue-200 dark:border-blue-700/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-xl flex items-center justify-center shadow-md">
                          <Brain className="text-white" size={20} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Refinamento</h4>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200">
                            Fase 1
                          </span>
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed mb-1">
                          Organize pensamentos e fortaleça argumentos antes de escrever.
                        </p>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                          <strong>Use quando:</strong> tiver ideias desorganizadas e precisar de base sólida.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-3.5 border border-gray-300 dark:border-gray-600">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-md">
                          <Target className="text-white" size={20} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Prática</h4>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            Fase 2
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed mb-1">
                          Treine escrita em condições reais e receba feedback detalhado.
                        </p>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                          <strong>Use quando:</strong> estiver pronto para escrever e praticar com cronômetro.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-800/30 rounded-lg p-3.5 border border-sky-200 dark:border-sky-700/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl flex items-center justify-center shadow-md">
                          <Sparkles className="text-white" size={20} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className="text-sm font-bold text-sky-900 dark:text-sky-100">Criação</h4>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-200 dark:bg-sky-700 text-sky-800 dark:text-sky-200">
                            Fase 3
                          </span>
                        </div>
                        <p className="text-xs text-sky-800 dark:text-sky-200 leading-relaxed mb-1">
                          Gere conteúdo novo e experimente diferentes abordagens criativas.
                        </p>
                        <p className="text-[11px] text-sky-700 dark:text-sky-300 leading-relaxed">
                          <strong>Use quando:</strong> precisar de inspiração ou temas novos para escrever.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-2.5 border border-amber-200 dark:border-amber-700/50">
                    <div className="flex items-start gap-2">
                      <Rocket className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong>Dica:</strong> Fluxo ideal é Refinamento → Prática → Criação, mas use na ordem que preferir!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {targetRect && step.target !== 'intro' && step.target !== 'finish' && (
              <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border-2 border-bright-blue/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-bright-blue rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-bright-blue uppercase tracking-wide">
                      Visualização do Card
                    </span>
                  </div>
                  {step.category && step.category !== 'Organização' && step.category !== 'Dica de Uso' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      step.category === 'Refinamento' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : step.category === 'Prática'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {step.category}
                    </span>
                  )}
                </div>
                <div 
                  className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-transform duration-200"
                  style={{ position: 'relative' }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-2xl flex items-center justify-center shadow-md">
                          {step.icon && <div className="scale-125">{step.icon}</div>}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {step.category === 'Refinamento' && 'Organize e fortaleça suas ideias antes de escrever'}
                          {step.category === 'Prática' && 'Treine suas habilidades em condições reais'}
                          {step.category === 'Criação' && 'Crie conteúdo novo e inspire-se'}
                          {step.category === 'Organização' && 'Organize todo seu material de estudo'}
                          {step.category === 'Dica de Uso' && 'Aproveite ao máximo a plataforma'}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-bright-blue rounded-full" />
                          <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">
                            Clique para explorar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-bright-blue/30 rounded-tr-lg rounded-bl-lg" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                  <ArrowDown size={14} className="text-bright-blue animate-bounce" />
                  <span className="font-medium">Esta ferramenta está destacada abaixo na página</span>
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
