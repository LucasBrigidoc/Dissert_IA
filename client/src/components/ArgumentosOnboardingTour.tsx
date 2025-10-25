import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Brain, MessageCircle, Eye, Target, CheckCircle, PartyPopper, ArrowDown, ArrowUp, Lightbulb, Send, HelpCircle, RotateCcw, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
  category?: string;
}

const argumentosSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo ao Refinamento de Ideias!',
    description: 'Esta é uma ferramenta poderosa de IA que ajuda você a transformar ideias soltas em argumentos bem estruturados e convincentes para sua redação.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'O Refinador de Ideias IA conversa com você através de um chat inteligente, fazendo perguntas estratégicas para ajudar a organizar e desenvolver seus argumentos de forma clara e estruturada.',
    position: 'center',
    icon: <Brain className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: '[data-testid="chat-messages"]',
    title: 'Área de Conversa',
    description: 'Aqui é onde acontece a mágica! A IA conversa com você, fazendo perguntas inteligentes sobre tema, tese, argumentos e estrutura da sua redação. Cada resposta sua ajuda a construir uma base sólida.',
    position: 'bottom',
    icon: <MessageCircle className="text-bright-blue" size={24} />,
    category: 'Interface'
  },
  {
    target: '[data-testid="input-chat-message"]',
    title: 'Digite Suas Ideias',
    description: 'Use este campo para conversar com a IA. Pode ser uma ideia solta, um tema de redação, ou responder às perguntas que a IA fizer. Quanto mais você compartilhar, melhor será o resultado!',
    position: 'top',
    icon: <Send className="text-bright-blue" size={24} />,
    category: 'Interação'
  },
  {
    target: '[data-testid="button-help-guidance"]',
    title: 'Precisa de Ajuda?',
    description: 'Clique neste botão sempre que precisar de orientação sobre o que fazer em cada etapa. A IA fornece dicas específicas baseadas na seção atual da conversa.',
    position: 'top',
    icon: <HelpCircle className="text-bright-blue" size={24} />,
    category: 'Recursos'
  },
  {
    target: '[data-testid="button-restart-conversation"]',
    title: 'Recomeçar Conversa',
    description: 'Quer começar do zero com um novo tema? Use este botão para reiniciar a conversa e manter apenas o histórico anterior.',
    position: 'bottom',
    icon: <RotateCcw className="text-bright-blue" size={24} />,
    category: 'Recursos'
  },
  {
    target: 'progress-card',
    title: 'Acompanhe Seu Progresso',
    description: 'Veja em tempo real o andamento da sua redação. Cada parte preenchida (tema, tese, introdução, desenvolvimentos e conclusão) aparece aqui com indicadores visuais.',
    position: 'top',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Progresso'
  },
  {
    target: 'preview-card',
    title: 'Preview da Estrutura',
    description: 'Aqui você visualiza todos os elementos da sua redação conforme vão sendo desenvolvidos na conversa. É como um esboço em tempo real do seu texto!',
    position: 'top',
    icon: <Eye className="text-bright-blue" size={24} />,
    category: 'Visualização'
  },
  {
    target: '[data-testid="button-view-conversation"]',
    title: 'Ver Histórico Completo',
    description: 'Após desenvolver suas ideias, clique aqui para ver todo o histórico da conversa organizado em um mapa mental visual. Perfeito para revisar tudo antes de escrever!',
    position: 'top',
    icon: <Map className="text-bright-blue" size={24} />,
    category: 'Visualização'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe como usar o Refinador de Ideias. Comece conversando com a IA sobre seu tema de redação e deixe ela guiar você pelo processo de construção dos argumentos!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface ArgumentosOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function ArgumentosOnboardingTour({ onComplete, onSkip }: ArgumentosOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = argumentosSteps[currentStep];
  const isLastStep = currentStep === argumentosSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (step.target === 'intro' || step.target === 'finish' || step.target === 'how-it-works') {
      setTargetRect(null);
      return;
    }

    if (step.target === 'progress-card') {
      const elements = document.querySelectorAll('[class*="LiquidGlassCard"]');
      const progressCard = Array.from(elements).find(el => 
        el.textContent?.includes('Progresso da Redação')
      );
      if (progressCard) {
        const rect = progressCard.getBoundingClientRect();
        setTargetRect(rect);
        progressCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (step.target === 'preview-card') {
      const elements = document.querySelectorAll('[class*="LiquidGlassCard"]');
      const previewCard = Array.from(elements).find(el => 
        el.textContent?.includes('Preview da Estrutura')
      );
      if (previewCard) {
        const rect = previewCard.getBoundingClientRect();
        setTargetRect(rect);
        previewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
        
        {targetRect && step.target !== 'intro' && step.target !== 'finish' && step.target !== 'how-it-works' && (
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
                  {step.category || 'Tour'}
                </span>
              </div>
              <button
                onClick={onSkip}
                className="text-bright-blue hover:text-dark-blue transition-colors text-xs font-semibold hover:underline"
                data-testid="button-skip-argumentos-onboarding"
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
                    {step.icon || <Brain className="text-bright-blue" size={20} />}
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{step.title}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="min-h-[280px] flex flex-col">
              <p className="text-soft-gray dark:text-gray-300 text-sm leading-relaxed mb-4">
                {step.description}
              </p>

              {step.target === 'intro' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-purple-900 dark:text-purple-100 mb-1">Quando usar esta ferramenta?</p>
                        <ul className="text-[10px] text-purple-800 dark:text-purple-200 leading-snug space-y-0.5">
                          <li>✓ Quando suas ideias estão desorganizadas</li>
                          <li>✓ Para desenvolver argumentos mais fortes</li>
                          <li>✓ Antes de começar a escrever a redação</li>
                          <li>✓ Para estruturar melhor tese e contra-argumentos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2.5">
                      <Brain className="text-bright-blue flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-1">O que você vai construir:</p>
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          <div className="bg-white/50 dark:bg-gray-800/30 p-1.5 rounded text-center">
                            <p className="text-[9px] font-bold text-blue-900 dark:text-blue-100">Tema</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/30 p-1.5 rounded text-center">
                            <p className="text-[9px] font-bold text-blue-900 dark:text-blue-100">Tese</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/30 p-1.5 rounded text-center">
                            <p className="text-[9px] font-bold text-blue-900 dark:text-blue-100">Introdução</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/30 p-1.5 rounded text-center">
                            <p className="text-[9px] font-bold text-blue-900 dark:text-blue-100">Argumentos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'how-it-works' && (
                <div className="mb-4 flex-1 space-y-2.5">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">A IA faz perguntas estratégicas</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Sobre tema, tese, argumentos e estrutura</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Você responde naturalmente</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Como se estivesse conversando com um amigo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Seus argumentos se organizam</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Em tempo real, com estrutura clara e coesa</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Estrutura completa pronta para escrever!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'finish' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-green-900 dark:text-green-100 mb-1">Tour Concluído!</p>
                        <p className="text-[11px] text-green-800 dark:text-green-200 leading-snug">
                          Você agora sabe como usar o Refinador de Ideias
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-2">Dica de primeiro passo:</p>
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2.5 rounded">
                      <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                        💬 Comece digitando algo como: <strong>"Preciso escrever sobre desigualdade social"</strong> ou <strong>"Tenho que fazer uma redação sobre meio ambiente"</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <Brain className="text-amber-600 dark:text-amber-400" size={16} />
                    <p className="text-[11px] font-bold text-amber-900 dark:text-amber-100">
                      A IA vai guiar você do início ao fim! 🚀
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="button-previous-argumentos-step"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>

                <div className="flex items-center gap-1.5">
                  {argumentosSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentStep
                          ? 'w-6 bg-bright-blue'
                          : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue flex items-center gap-2"
                  size="sm"
                  data-testid="button-next-argumentos-step"
                >
                  {isLastStep ? 'Começar' : 'Próximo'}
                  {!isLastStep && <ChevronRight size={16} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
