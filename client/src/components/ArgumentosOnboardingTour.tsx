import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Brain, MessageCircle, Eye, Target, CheckCircle, PartyPopper, ArrowDown, ArrowUp, Lightbulb, Send, HelpCircle, RotateCcw, Map, BookmarkPlus, Sparkles, Layers, Zap } from 'lucide-react';
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
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'O Refinamento de Ideias foi criado para ser seu parceiro de brainstorming antes de escrever. Ele organiza seus pensamentos, fortalece seus argumentos e cria uma estrutura sólida para sua redação.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
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
    target: 'elementos',
    title: 'Elementos da Interface',
    description: 'Vamos conhecer os principais elementos da tela e entender para que cada um serve. Cada parte foi pensada para facilitar seu processo criativo.',
    position: 'center',
    icon: <Layers className="text-bright-blue" size={24} />,
    category: 'Interface'
  },
  {
    target: 'capacidades',
    title: 'O Que Você Pode Fazer Aqui?',
    description: 'Esta ferramenta oferece diversos recursos para potencializar sua escrita. Conheça todas as possibilidades disponíveis para você.',
    position: 'center',
    icon: <Sparkles className="text-bright-blue" size={24} />,
    category: 'Recursos'
  },
  {
    target: 'biblioteca',
    title: 'Salve na Biblioteca',
    description: 'Todo seu trabalho pode ser salvo! Após desenvolver suas ideias, você pode salvar o histórico completo na Biblioteca Pessoal para consultar sempre que precisar.',
    position: 'center',
    icon: <BookmarkPlus className="text-bright-blue" size={24} />,
    category: 'Salvamento'
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
    setTargetRect(null);
  }, [currentStep]);

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

              {step.target === 'objetivo' && (
                <div className="mb-4 flex-1 space-y-2.5 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                    <div className="flex items-start gap-2.5">
                      <Target className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-100 mb-1">Objetivo Principal:</p>
                        <p className="text-[10px] text-indigo-800 dark:text-indigo-200 leading-snug">
                          Transformar ideias desorganizadas em uma <strong>estrutura argumentativa completa e coesa</strong>, pronta para ser escrita.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">📝 Por que usar antes de escrever?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Economiza tempo:</strong> Evita reescrever parágrafos inteiros</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Melhora coesão:</strong> Argumentos conectados logicamente</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Reduz bloqueios:</strong> A IA guia seu pensamento</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Fortalece tese:</strong> Desenvolve argumentação sólida</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-amber-600 dark:text-amber-400" size={14} />
                      <p className="text-[10px] text-amber-900 dark:text-amber-100">
                        <strong>Dica:</strong> Use esta ferramenta sempre que tiver o tema mas não souber por onde começar!
                      </p>
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

              {step.target === 'elementos' && (
                <div className="mb-4 flex-1 space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100">
                  <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100 mb-2">🖥️ Conheça os elementos da tela:</p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="text-bright-blue flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100">Chat de Conversa</p>
                        <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">Onde você conversa com a IA. Suas mensagens aparecem à direita (azul) e as da IA à esquerda (cinza).</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <Send className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Campo de Entrada</p>
                        <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">Digite suas ideias aqui. Pressione Enter ou clique no botão azul para enviar.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Target className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">Barra de Progresso</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">Mostra quantos % da redação você já desenvolveu (tema, tese, introdução, etc).</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <Eye className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Preview da Estrutura</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Visualize em cards organizados cada parte da redação conforme você desenvolve.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="text-indigo-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-100">Botão de Ajuda (?)</p>
                        <p className="text-[9px] text-indigo-800 dark:text-indigo-200 leading-snug">Clique para receber orientações sobre a etapa atual da conversa.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/20 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700/30">
                    <div className="flex items-start gap-2">
                      <RotateCcw className="text-gray-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-gray-100">Nova Conversa</p>
                        <p className="text-[9px] text-gray-800 dark:text-gray-200 leading-snug">Reinicia o chat para começar um novo tema do zero.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-900/20 p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/30">
                    <div className="flex items-start gap-2">
                      <Map className="text-sky-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-sky-900 dark:text-sky-100">Ver Histórico</p>
                        <p className="text-[9px] text-sky-800 dark:text-sky-200 leading-snug">Visualiza toda a conversa organizada por tópicos e seções.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'capacidades' && (
                <div className="mb-4 flex-1 space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100">
                  <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100 mb-2">⚡ O que você pode fazer com esta ferramenta:</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                      <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-0.5">✅ Desenvolver Tema e Tese</p>
                      <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">A IA ajuda você a transformar um tema vago em uma tese clara e objetiva.</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-800/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                      <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100 mb-0.5">✅ Construir Argumentos Sólidos</p>
                      <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">Desenvolve argumentos de desenvolvimento com fundamentação lógica e persuasiva.</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                      <p className="text-[10px] font-bold text-green-900 dark:text-green-100 mb-0.5">✅ Estruturar Parágrafos</p>
                      <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">Organiza introdução, desenvolvimentos e conclusão de forma coesa.</p>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                      <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100 mb-0.5">✅ Refinar Linguagem</p>
                      <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Melhora a qualidade argumentativa e formal do seu texto.</p>
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-800/20 p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/30">
                      <p className="text-[10px] font-bold text-sky-900 dark:text-sky-100 mb-0.5">✅ Visualizar Estrutura Completa</p>
                      <p className="text-[9px] text-sky-800 dark:text-sky-200 leading-snug">Veja todo o esqueleto da redação antes de começar a escrever.</p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'biblioteca' && (
                <div className="mb-4 flex-1 space-y-2.5">
                  <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-violet-200 dark:border-violet-700/30">
                    <div className="flex items-start gap-2.5">
                      <BookmarkPlus className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Salve seu Trabalho!</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          Após desenvolver suas ideias, você pode salvar todo o histórico da conversa na <strong>Biblioteca Pessoal</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">💾 Como salvar:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">1.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Complete a conversa com a IA sobre seu tema</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">2.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Clique em "Ver Histórico" para visualizar toda a estrutura</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">3.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Use o botão de salvar para guardar na biblioteca</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-700/30">
                    <p className="text-[10px] font-bold text-cyan-900 dark:text-cyan-100 mb-1">📚 Por que salvar?</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Consulte suas estruturas a qualquer momento</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Reaproveite argumentos em redações similares</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Organize seu acervo de ideias por tema</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Revise seu processo criativo depois</p>
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
