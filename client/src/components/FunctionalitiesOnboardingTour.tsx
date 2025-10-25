import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Brain, GraduationCap, Lightbulb, Archive, Target, MessageCircle, BookOpen, Edit3, Rocket, Network, CheckCircle, PartyPopper, ArrowDown, ArrowUp, Layers, Clock, TrendingUp, Award, Zap, Search, FileText, AlertCircle, CheckSquare, PenTool } from 'lucide-react';
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
    description: 'Descubra o poder da IA para transformar sua escrita! Aqui você encontra ferramentas inteligentes que cobrem todo o processo: desde a organização de ideias até a prática com correção automática.',
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
    title: 'Pronto para Começar!',
    description: 'Parabéns! Você conheceu todas as 6 ferramentas de IA do DISSERTIA e entendeu quando usar cada uma. Agora é hora de colocar em prática e alcançar a nota 1000!',
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

          <div className="p-4">
            <div className="min-h-[340px] flex flex-col">
              <p className="text-soft-gray dark:text-gray-300 text-sm leading-relaxed mb-4">
                {step.description}
              </p>

              {(step.target === 'intro' || step.target === 'finish') && (
                <div className="mb-4 flex-1 space-y-3">
                  {step.target === 'intro' && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30 text-center">
                          <Brain className="text-bright-blue mx-auto mb-1" size={24} />
                          <p className="text-[10px] font-semibold text-blue-900 dark:text-blue-100">Refinamento</p>
                          <p className="text-[9px] text-blue-700 dark:text-blue-300">2 ferramentas</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 p-3 rounded-lg border border-gray-300 dark:border-gray-600/30 text-center">
                          <Target className="text-gray-700 dark:text-gray-300 mx-auto mb-1" size={24} />
                          <p className="text-[10px] font-semibold text-gray-900 dark:text-gray-100">Prática</p>
                          <p className="text-[9px] text-gray-700 dark:text-gray-300">2 ferramentas</p>
                        </div>
                        <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 p-3 rounded-lg border border-sky-200 dark:border-sky-700/30 text-center">
                          <Sparkles className="text-sky-500 mx-auto mb-1" size={24} />
                          <p className="text-[10px] font-semibold text-sky-900 dark:text-sky-100">Criação</p>
                          <p className="text-[9px] text-sky-700 dark:text-sky-300">2 ferramentas</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/30">
                        <div className="flex items-start gap-2.5">
                          <Lightbulb className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={18} />
                          <div>
                            <p className="text-[11px] font-bold text-purple-900 dark:text-purple-100 mb-1">Por que usar as funcionalidades?</p>
                            <ul className="text-[10px] text-purple-800 dark:text-purple-200 leading-snug space-y-0.5">
                              <li>✓ Economize tempo na organização de ideias</li>
                              <li>✓ Receba feedback instantâneo e detalhado</li>
                              <li>✓ Pratique com temas reais e atualizados</li>
                              <li>✓ Acompanhe sua evolução com gráficos</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                        <Rocket className="text-amber-600 dark:text-amber-400" size={16} />
                        <p className="text-[10px] text-amber-800 dark:text-amber-200">
                          <strong>Próximo passo:</strong> Vamos explorar as 3 categorias!
                        </p>
                      </div>
                    </>
                  )}

                  {step.target === 'finish' && (
                    <>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700/30">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="text-white" size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-green-900 dark:text-green-100 mb-1">Tour Concluído!</p>
                            <p className="text-[11px] text-green-800 dark:text-green-200 leading-snug">
                              Você conheceu todas as ferramentas e está pronto para criar redações nota 1000
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded">
                            <p className="text-[10px] font-bold text-green-900 dark:text-green-100">6 Ferramentas</p>
                            <p className="text-[9px] text-green-700 dark:text-green-300">de IA descobertas</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded">
                            <p className="text-[10px] font-bold text-green-900 dark:text-green-100">3 Categorias</p>
                            <p className="text-[9px] text-green-700 dark:text-green-300">de funcionalidades</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                        <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-2">Próximos Passos Recomendados:</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-bright-blue/20 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-bright-blue">1</span>
                            </div>
                            <p className="text-[10px] text-blue-800 dark:text-blue-200">Comece com <strong>Refinamento de Ideias</strong></p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-bright-blue/20 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-bright-blue">2</span>
                            </div>
                            <p className="text-[10px] text-blue-800 dark:text-blue-200">Busque <strong>Repertório</strong> para enriquecer</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-bright-blue/20 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-bright-blue">3</span>
                            </div>
                            <p className="text-[10px] text-blue-800 dark:text-blue-200">Pratique no <strong>Simulador</strong> completo</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                        <Sparkles className="text-amber-600 dark:text-amber-400" size={16} />
                        <p className="text-[11px] font-bold text-amber-900 dark:text-amber-100">
                          Clique em "Começar" para explorar! 🚀
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step.target === 'categories' && (
                <div className="mb-4 flex-1 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 pr-1">
                <div className="space-y-2.5">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-2.5 border border-blue-200 dark:border-blue-700/50">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center shadow-md">
                          <Brain className="text-white" size={18} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="text-xs font-bold text-blue-900 dark:text-blue-100">Refinamento</h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200">
                            Fase 1
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-snug mb-0.5">
                          Organize pensamentos e fortaleça argumentos.
                        </p>
                        <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-snug">
                          <strong>Use:</strong> ideias desorganizadas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg p-2.5 border border-gray-300 dark:border-gray-600">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                          <Target className="text-white" size={18} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">Prática</h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            Fase 2
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-800 dark:text-gray-200 leading-snug mb-0.5">
                          Treine escrita em condições reais.
                        </p>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-snug">
                          <strong>Use:</strong> escrever textos completos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-800/30 rounded-lg p-2.5 border border-sky-200 dark:border-sky-700/50">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center shadow-md">
                          <Sparkles className="text-white" size={18} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className="text-xs font-bold text-sky-900 dark:text-sky-100">Criação</h4>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-200 dark:bg-sky-700 text-sky-800 dark:text-sky-200">
                            Fase 3
                          </span>
                        </div>
                        <p className="text-[11px] text-sky-800 dark:text-sky-200 leading-snug mb-0.5">
                          Gere conteúdo novo e inspire-se.
                        </p>
                        <p className="text-[10px] text-sky-700 dark:text-sky-300 leading-snug">
                          <strong>Use:</strong> inspiração e temas novos
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-2 border border-amber-200 dark:border-amber-700/50">
                    <div className="flex items-start gap-1.5">
                      <Rocket className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                      <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-snug">
                        <strong>Dica:</strong> Fluxo ideal: Refinamento → Prática → Criação
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {step.target === '[data-testid="card-feature-argumentos"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-purple-900 dark:text-purple-100 mb-1.5">Benefícios desta ferramenta:</p>
                        <ul className="text-[10px] text-purple-800 dark:text-purple-200 leading-snug space-y-0.5">
                          <li>✓ Transforma pensamentos soltos em argumentos lógicos</li>
                          <li>✓ Desenvolve teses e contra-argumentos sólidos</li>
                          <li>✓ Fortalece a coerência dos seus pontos</li>
                          <li>✓ Ideal para fase de planejamento</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100 mb-0.5">Quando usar:</p>
                        <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-snug">
                          Antes de começar a escrever, quando tiver ideias desorganizadas sobre o tema
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <Award className="text-bright-blue" size={16} />
                    <p className="text-[10px] text-blue-800 dark:text-blue-200">
                      <strong>Competência ENEM:</strong> Melhora nota em C2 e C3
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-feature-repertorio"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2.5">
                      <Search className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-1.5">O que você encontra:</p>
                        <ul className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug space-y-0.5">
                          <li>✓ Referências históricas e culturais relevantes</li>
                          <li>✓ Dados científicos e sociológicos atualizados</li>
                          <li>✓ Citações de especialistas e pesquisas</li>
                          <li>✓ Exemplos concretos para seus argumentos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100 mb-0.5">Impacto na nota:</p>
                        <p className="text-[10px] text-green-800 dark:text-green-200 leading-snug">
                          Repertório de qualidade pode aumentar até 200 pontos na sua redação
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <BookOpen className="text-amber-600 dark:text-amber-400" size={16} />
                    <p className="text-[10px] text-amber-800 dark:text-amber-200">
                      <strong>Dica:</strong> Use após refinar suas ideias para enriquecer
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-feature-simulador"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2.5">
                      <GraduationCap className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-green-900 dark:text-green-100 mb-1.5">Recursos do simulador:</p>
                        <ul className="text-[10px] text-green-800 dark:text-green-200 leading-snug space-y-0.5">
                          <li>✓ Cronômetro real simulando condições de prova</li>
                          <li>✓ Correção baseada nas 5 competências do ENEM</li>
                          <li>✓ Feedback detalhado e personalizado</li>
                          <li>✓ Gráficos de evolução e estatísticas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded border border-green-200 dark:border-green-700/30">
                      <Clock className="text-green-600 dark:text-green-400 mb-1" size={16} />
                      <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Tempo Real</p>
                      <p className="text-[9px] text-green-700 dark:text-green-300">Cronômetro ativo</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2 rounded border border-green-200 dark:border-green-700/30">
                      <TrendingUp className="text-green-600 dark:text-green-400 mb-1" size={16} />
                      <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Evolução</p>
                      <p className="text-[9px] text-green-700 dark:text-green-300">Acompanhe o progresso</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <Target className="text-purple-600 dark:text-purple-400" size={16} />
                    <p className="text-[10px] text-purple-800 dark:text-purple-200">
                      <strong>Meta:</strong> Pratique ao menos 2x por semana
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-feature-controlador"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                    <div className="flex items-start gap-2.5">
                      <Edit3 className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-100 mb-1.5">Capacidades de edição:</p>
                        <ul className="text-[10px] text-indigo-800 dark:text-indigo-200 leading-snug space-y-0.5">
                          <li>✓ Corrige erros gramaticais e ortográficos</li>
                          <li>✓ Melhora coesão e coerência textual</li>
                          <li>✓ Ajusta tom e clareza da escrita</li>
                          <li>✓ Sugere melhorias de vocabulário</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <Zap className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-0.5">Uso inteligente:</p>
                        <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                          Use na fase de revisão final para polimento do texto
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700/30">
                    <CheckSquare className="text-green-600 dark:text-green-400" size={16} />
                    <p className="text-[10px] text-green-800 dark:text-green-200">
                      <strong>Ideal para:</strong> Revisão e aprimoramento de textos prontos
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-feature-propostas"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700/30">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-yellow-900 dark:text-yellow-100 mb-1.5">O que você recebe:</p>
                        <ul className="text-[10px] text-yellow-800 dark:text-yellow-200 leading-snug space-y-0.5">
                          <li>✓ Temas atualizados e relevantes</li>
                          <li>✓ Propostas completas estilo ENEM</li>
                          <li>✓ Textos motivadores incluídos</li>
                          <li>✓ Variedade de assuntos sociais e culturais</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100 mb-0.5">Inspiração garantida:</p>
                        <p className="text-[10px] text-purple-800 dark:text-purple-200 leading-snug">
                          Nunca mais fique sem saber sobre o que escrever
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700/30">
                    <Rocket className="text-green-600 dark:text-green-400" size={16} />
                    <p className="text-[10px] text-green-800 dark:text-green-200">
                      <strong>Ótimo para:</strong> Começar a praticar rapidamente
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-feature-estrutura"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 rounded-lg border border-cyan-200 dark:border-cyan-700/30">
                    <div className="flex items-start gap-2.5">
                      <Network className="text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-cyan-900 dark:text-cyan-100 mb-1.5">Modelos disponíveis:</p>
                        <ul className="text-[10px] text-cyan-800 dark:text-cyan-200 leading-snug space-y-0.5">
                          <li>✓ Estrutura clássica (4 parágrafos)</li>
                          <li>✓ Estrutura estendida (5 parágrafos)</li>
                          <li>✓ Modelos personalizáveis para seu estilo</li>
                          <li>✓ Guia passo a passo para cada seção</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <PenTool className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100 mb-0.5">Perfeito para iniciantes:</p>
                        <p className="text-[10px] text-green-800 dark:text-green-200 leading-snug">
                          Ganhe confiança com um roteiro claro e organizado
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <Brain className="text-bright-blue" size={16} />
                    <p className="text-[10px] text-blue-800 dark:text-blue-200">
                      <strong>Aprenda:</strong> Estruturas aprovadas em vestibulares
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-biblioteca"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 p-3 rounded-lg border border-slate-200 dark:border-slate-700/30">
                    <div className="flex items-start gap-2.5">
                      <Archive className="text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 mb-1.5">O que fica guardado:</p>
                        <ul className="text-[10px] text-slate-800 dark:text-slate-200 leading-snug space-y-0.5">
                          <li>✓ Todas suas redações e correções</li>
                          <li>✓ Repertórios salvos e favoritos</li>
                          <li>✓ Estruturas criadas e personalizadas</li>
                          <li>✓ Propostas geradas e histórico</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <FileText className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-0.5">Organização inteligente:</p>
                        <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                          Tudo categorizado e fácil de encontrar quando precisar
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <TrendingUp className="text-purple-600 dark:text-purple-400" size={16} />
                    <p className="text-[10px] text-purple-800 dark:text-purple-200">
                      <strong>Vantagem:</strong> Acompanhe sua evolução ao longo do tempo
                    </p>
                  </div>
                </div>
              )}

              {step.target === '[data-testid="card-quick-access"]' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700/30">
                    <div className="flex items-start gap-2.5">
                      <Rocket className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[11px] font-bold text-orange-900 dark:text-orange-100 mb-1.5">Fluxo recomendado:</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-orange-600/20 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">1</span>
                            </div>
                            <p className="text-[10px] text-orange-800 dark:text-orange-200"><strong>Refinar</strong> suas ideias primeiro</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-orange-600/20 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">2</span>
                            </div>
                            <p className="text-[10px] text-orange-800 dark:text-orange-200"><strong>Buscar</strong> repertório relevante</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-orange-600/20 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">3</span>
                            </div>
                            <p className="text-[10px] text-orange-800 dark:text-orange-200"><strong>Praticar</strong> no simulador</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <Award className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100 mb-0.5">Resultado comprovado:</p>
                        <p className="text-[10px] text-green-800 dark:text-green-200 leading-snug">
                          Este fluxo é usado por +2.000 estudantes com sucesso
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <Zap className="text-bright-blue" size={16} />
                    <p className="text-[10px] text-blue-800 dark:text-blue-200">
                      <strong>Caminho mais rápido</strong> para a nota 1000
                    </p>
                  </div>
                </div>
              )}

              {targetRect && step.target !== 'intro' && step.target !== 'finish' && step.target !== 'categories' && (
                <div className="mb-4 flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 border-2 border-bright-blue/20">
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
            </div>
          </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
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
    </>
  );
}
