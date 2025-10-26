import { useState } from 'react';
import { ChevronRight, ChevronLeft, Edit, Target, CheckCircle, PartyPopper, Lightbulb, Sparkles, BookOpen, Brain, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'center';
  icon?: React.ReactNode;
  category?: string;
}

const estruturaSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo à Estrutura Roterizada!',
    description: 'Esta ferramenta cria roteiros personalizados de redação baseados no seu nível de conhecimento sobre o tema.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'A Estrutura Roterizada foi criada para guiar você na escrita da redação, adaptando o roteiro ao seu nível de familiaridade com o tema.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'Você responde um questionário sobre a proposta, seu conhecimento do tema e repertórios. A IA analisa suas respostas e gera um roteiro personalizado.',
    position: 'center',
    icon: <Edit className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: 'questionario',
    title: 'O Questionário Inteligente',
    description: 'São 5 perguntas que ajudam a IA a entender seu nível de conhecimento e criar um roteiro perfeito para você.',
    position: 'center',
    icon: <Brain className="text-bright-blue" size={24} />,
    category: 'Questionário'
  },
  {
    target: 'roteiro',
    title: 'Seu Roteiro Personalizado',
    description: 'O roteiro gerado inclui análise da proposta, explicação do tema, sugestões de repertórios e uma estrutura completa para cada parágrafo.',
    position: 'center',
    icon: <Sparkles className="text-bright-blue" size={24} />,
    category: 'Roteiro'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você está pronto para criar seu primeiro roteiro personalizado. Cole a proposta e responda as perguntas!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface EstruturaOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function EstruturaOnboardingTour({ onComplete, onSkip }: EstruturaOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = estruturaSteps[currentStep];
  const isLastStep = currentStep === estruturaSteps.length - 1;
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
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Tooltip */}
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
                data-testid="button-skip-estrutura-onboarding"
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
                    {step.icon || <Edit className="text-bright-blue" size={20} />}
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
                          <li>✓ Quando não souber por onde começar a redação</li>
                          <li>✓ Para organizar suas ideias antes de escrever</li>
                          <li>✓ Quando precisar de um roteiro passo a passo</li>
                          <li>✓ Para receber sugestões de repertórios e argumentos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-2">Recursos disponíveis:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-800/40 dark:to-blue-900/40 px-2 py-1 rounded-full border border-blue-300 dark:border-blue-600/50">
                            <span className="text-[11px]">🎯</span>
                            <span className="text-[9px] font-semibold text-blue-900 dark:text-blue-100">Análise da Proposta</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800/40 dark:to-green-900/40 px-2 py-1 rounded-full border border-green-300 dark:border-green-600/50">
                            <span className="text-[11px]">💡</span>
                            <span className="text-[9px] font-semibold text-green-900 dark:text-green-100">Repertórios</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-800/40 dark:to-purple-900/40 px-2 py-1 rounded-full border border-purple-300 dark:border-purple-600/50">
                            <span className="text-[11px]">📝</span>
                            <span className="text-[9px] font-semibold text-purple-900 dark:text-purple-100">Estrutura Completa</span>
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
                          Criar um <strong>roteiro personalizado</strong> que se adapta ao seu nível de conhecimento, facilitando o planejamento e a escrita da redação.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">🎯 Benefícios do roteiro personalizado:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Adaptação:</strong> Roteiro ajustado ao seu nível de familiaridade</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Organização:</strong> Estrutura clara para cada parágrafo</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Sugestões:</strong> Repertórios e argumentos relevantes</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Segurança:</strong> Alertas sobre o que evitar na redação</p>
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
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Cole a Proposta</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Digite ou cole o tema da redação</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Responda o Questionário</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">5 perguntas sobre seu conhecimento do tema</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Receba o Roteiro</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">A IA gera um roteiro personalizado em segundos</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Roteiro completo pronto para usar!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'questionario' && (
                <div className="mb-4 flex-1 space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100">
                  <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100 mb-2">📋 As 5 perguntas do questionário:</p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <BookOpen className="text-bright-blue flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100">1. Proposta da redação</p>
                        <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">O tema que você vai desenvolver</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Brain className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">2. Nível de familiaridade</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">O quanto você conhece sobre o tema (nunca estudei até domínio avançado)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100">3. Problemas e desafios</p>
                        <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">Principais problemas relacionados ao tema que você conhece</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <Target className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">4. Autores e repertórios</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Obras, autores ou dados que você conhece sobre o tema</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                    <div className="flex items-start gap-2">
                      <Settings2 className="text-indigo-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-100">5. Nível de detalhamento</p>
                        <p className="text-[9px] text-indigo-800 dark:text-indigo-200 leading-snug">Passo a passo detalhado ou apenas direções gerais</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'roteiro' && (
                <div className="mb-4 flex-1 space-y-2.5">
                  <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-violet-200 dark:border-violet-700/30">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Roteiro Completo e Personalizado!</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          O roteiro gerado é <strong>adaptado ao seu nível</strong> e inclui tudo que você precisa para escrever uma ótima redação.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">📝 O que vem no roteiro:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Análise da proposta:</strong> Palavras-chave e categoria temática</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Explicação do tema:</strong> Contextualização adaptada ao seu nível</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Repertórios sugeridos:</strong> Filmes, livros, dados e exemplos</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Estrutura completa:</strong> Introdução, desenvolvimento e conclusão</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-700/30">
                    <p className="text-[10px] font-bold text-cyan-900 dark:text-cyan-100 mb-1">💾 Você pode:</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Baixar o roteiro em PDF</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Salvar na sua Biblioteca Pessoal</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Usar como guia durante a escrita</p>
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
                          Você agora sabe como usar a Estrutura Roterizada
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-2">Dica de primeiro uso:</p>
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2.5 rounded">
                      <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                        📝 Cole uma proposta de redação, selecione seu nível de familiaridade (<strong>"Conheço um pouco"</strong> ou <strong>"Nunca estudei"</strong>) e deixe os campos opcionais em branco para ver o poder da IA!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <Edit className="text-amber-600 dark:text-amber-400" size={16} />
                    <p className="text-[11px] font-bold text-amber-900 dark:text-amber-100">
                      A IA vai criar seu roteiro personalizado! ✨
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
                  data-testid="button-previous-estrutura-step"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>

                <div className="flex items-center gap-1.5">
                  {estruturaSteps.map((_, index) => (
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
                  data-testid="button-next-estrutura-step"
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
