import { useState } from 'react';
import { ChevronRight, ChevronLeft, Lightbulb, Target, CheckCircle, PartyPopper, BookmarkPlus, Sparkles, Layers, Filter, FileText, GraduationCap, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'center';
  icon?: React.ReactNode;
  category?: string;
}

const propostasSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo ao Explorador de Propostas!',
    description: 'Esta ferramenta usa IA para buscar propostas reais de ENEM, vestibulares e concursos, além de gerar propostas personalizadas para seu treino.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'O Explorador de Propostas foi criado para ajudá-lo a praticar com propostas reais e personalizadas, preparando você melhor para provas e concursos.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'Você personaliza os filtros (tipo de exame, tema, dificuldade) e adiciona um contexto opcional. A IA busca propostas reais e pode gerar propostas personalizadas para você.',
    position: 'center',
    icon: <Lightbulb className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: 'elementos',
    title: 'Elementos da Interface',
    description: 'Vamos conhecer os principais elementos da tela e entender para que cada um serve. Cada parte foi pensada para facilitar sua busca por propostas.',
    position: 'center',
    icon: <Layers className="text-bright-blue" size={24} />,
    category: 'Interface'
  },
  {
    target: 'biblioteca',
    title: 'Salve na Biblioteca',
    description: 'Encontrou uma proposta interessante? Salve na sua Biblioteca Pessoal para treinar depois e ter sempre à mão!',
    position: 'center',
    icon: <BookmarkPlus className="text-bright-blue" size={24} />,
    category: 'Salvamento'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe como usar o Explorador de Propostas. Comece personalizando os filtros e gerando suas propostas!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface PropostasOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function PropostasOnboardingTour({ onComplete, onSkip }: PropostasOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = propostasSteps[currentStep];
  const isLastStep = currentStep === propostasSteps.length - 1;
  const isFirstStep = currentStep === 0;

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

  return (
    <>
      <div className="fixed inset-0 z-[9998]">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      <div
        className="fixed z-[9999] w-[90vw] max-w-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
                data-testid="button-skip-propostas-onboarding"
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
                    {step.icon || <Lightbulb className="text-bright-blue" size={20} />}
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
                          <li>✓ Quando precisar praticar com propostas reais de provas</li>
                          <li>✓ Para conhecer o estilo de propostas de diferentes exames</li>
                          <li>✓ Quando quiser treinar com temas específicos ou dificuldades</li>
                          <li>✓ Para gerar propostas personalizadas com IA</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-2">Tipos de Exame:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-800/40 dark:to-blue-900/40 px-2 py-1 rounded-full border border-blue-300 dark:border-blue-600/50">
                            <span className="text-[11px]">🎓</span>
                            <span className="text-[9px] font-semibold text-blue-900 dark:text-blue-100">ENEM</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-800/40 dark:to-purple-900/40 px-2 py-1 rounded-full border border-purple-300 dark:border-purple-600/50">
                            <span className="text-[11px]">🏛️</span>
                            <span className="text-[9px] font-semibold text-purple-900 dark:text-purple-100">Vestibular</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-800/40 dark:to-amber-900/40 px-2 py-1 rounded-full border border-amber-300 dark:border-amber-600/50">
                            <span className="text-[11px]">📋</span>
                            <span className="text-[9px] font-semibold text-amber-900 dark:text-amber-100">Concurso</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800/40 dark:to-green-900/40 px-2 py-1 rounded-full border border-green-300 dark:border-green-600/50">
                            <span className="text-[11px]">📝</span>
                            <span className="text-[9px] font-semibold text-green-900 dark:text-green-100">Simulado</span>
                          </span>
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
                          Fornecer <strong>propostas reais e personalizadas</strong> para você treinar e se preparar melhor para provas e concursos.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">🎯 Por que praticar com propostas é importante?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Familiarização:</strong> Conhece o estilo de propostas de cada exame</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Prática direcionada:</strong> Treina com temas e dificuldades específicas</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Preparação real:</strong> Propostas de provas anteriores te preparam melhor</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Personalização:</strong> IA gera propostas adaptadas às suas necessidades</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-amber-600 dark:text-amber-400" size={14} />
                      <p className="text-[10px] text-amber-900 dark:text-amber-100">
                        <strong>Dica:</strong> Pratique com diferentes tipos de exame para ampliar seu repertório!
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
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Escolha os Filtros</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Selecione tipo de exame, tema e dificuldade desejada</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Adicione Contexto (Opcional)</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Digite palavras-chave ou cole uma proposta para variações</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Gere as Propostas</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">A IA busca propostas reais e gera personalizadas para você</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Propostas prontas para treinar sua redação!
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
                      <Filter className="text-bright-blue flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100">Filtros de Personalização</p>
                        <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">Escolha tipo de exame, tema e dificuldade para propostas específicas.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <FileText className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">Contexto Adicional</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">Campo para palavras-chave ou proposta existente para gerar variações.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Botão Gerar</p>
                        <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">Busca propostas reais e gera propostas personalizadas com IA.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Cards de Proposta</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Mostram título, enunciado, textos de apoio e origem (real ou IA).</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                    <div className="flex items-start gap-2">
                      <BookmarkPlus className="text-indigo-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-100">Botão Salvar</p>
                        <p className="text-[9px] text-indigo-800 dark:text-indigo-200 leading-snug">Salva a proposta na sua biblioteca para usar depois.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-900/20 p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/30">
                    <div className="flex items-start gap-2">
                      <Zap className="text-sky-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-sky-900 dark:text-sky-100">Carregar Mais</p>
                        <p className="text-[9px] text-sky-800 dark:text-sky-200 leading-snug">Busca propostas adicionais relacionadas aos seus filtros.</p>
                      </div>
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
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Salve suas Propostas!</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          Encontrou uma proposta perfeita para treinar? Salve na <strong>Biblioteca Pessoal</strong> para ter sempre disponível!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">💾 Como salvar:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">1.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Gere propostas relacionadas ao seu tema de interesse</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">2.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Leia o enunciado e veja se é relevante para seu treino</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">3.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Clique em "Salvar na Biblioteca" no card da proposta</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">4.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Acesse sua biblioteca quando quiser treinar!</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-emerald-600 dark:text-emerald-400" size={14} />
                      <p className="text-[10px] text-emerald-900 dark:text-emerald-100">
                        <strong>Dica:</strong> Salve propostas de diferentes temas para ter variedade no treino!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'finish' && (
                <div className="mb-4 flex-1 space-y-3">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="text-[12px] font-bold text-green-900 dark:text-green-100 mb-2">Você está pronto!</p>
                        <p className="text-[10px] text-green-800 dark:text-green-200 leading-relaxed">
                          Agora você sabe como usar o Explorador de Propostas para encontrar propostas reais e gerar propostas personalizadas com IA.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">📝 Próximos passos:</p>
                    <div className="space-y-1.5">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700/30">
                        <p className="text-[10px] text-blue-900 dark:text-blue-100">
                          <strong>1.</strong> Personalize os filtros de acordo com seu objetivo
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700/30">
                        <p className="text-[10px] text-purple-900 dark:text-purple-100">
                          <strong>2.</strong> Adicione contexto para propostas mais específicas (opcional)
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700/30">
                        <p className="text-[10px] text-green-900 dark:text-green-100">
                          <strong>3.</strong> Clique em "Gerar Propostas com IA" e comece a praticar!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Button
                onClick={handlePrevious}
                disabled={isFirstStep}
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${isFirstStep ? 'invisible' : ''}`}
                data-testid="button-previous-propostas-step"
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </Button>

              <div className="flex items-center gap-1.5">
                {propostasSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-bright-blue w-6'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue text-white"
                data-testid="button-next-propostas-step"
              >
                <span>{isLastStep ? 'Começar' : 'Próximo'}</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
