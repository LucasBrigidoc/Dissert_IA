import { useState } from 'react';
import { ChevronRight, ChevronLeft, GraduationCap, Target, CheckCircle, PartyPopper, Lightbulb, Clock, Sparkles, Timer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'center';
  icon?: React.ReactNode;
  category?: string;
}

const simuladorSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo ao Simulador de Prova!',
    description: 'Esta ferramenta permite você praticar redações em condições reais de exame, com cronômetro e propostas autênticas.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'O Simulador foi criado para preparar você para a prova real, praticando sob pressão do tempo e desenvolvendo estratégias de gerenciamento.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'Configure o tipo de exame, tempo limite, tema e dificuldade. A IA pode gerar propostas completas com textos de apoio. Depois, escreva sua redação com cronômetro ativo.',
    position: 'center',
    icon: <GraduationCap className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: 'configuracoes',
    title: 'Configurações do Simulado',
    description: 'Personalize sua experiência escolhendo exame (ENEM, Vestibular, etc.), tempo, tema, dificuldade e como o timer será exibido durante a prova.',
    position: 'center',
    icon: <Clock className="text-bright-blue" size={24} />,
    category: 'Configurações'
  },
  {
    target: 'propostas-ia',
    title: 'Propostas Geradas por IA',
    description: 'A IA pode gerar propostas completas e autênticas com textos de apoio, simulando perfeitamente provas reais de vestibulares e concursos.',
    position: 'center',
    icon: <Sparkles className="text-bright-blue" size={24} />,
    category: 'IA'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você está pronto para fazer seu primeiro simulado. Configure as opções, gere uma proposta e teste suas habilidades sob pressão!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface SimuladorOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function SimuladorOnboardingTour({ onComplete, onSkip }: SimuladorOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = simuladorSteps[currentStep];
  const isLastStep = currentStep === simuladorSteps.length - 1;
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
                data-testid="button-skip-simulador-onboarding"
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
                    {step.icon || <GraduationCap className="text-bright-blue" size={20} />}
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
                          <li>✓ Antes de provas reais para treinar sob pressão</li>
                          <li>✓ Para desenvolver controle de tempo na redação</li>
                          <li>✓ Quando quiser praticar com temas variados</li>
                          <li>✓ Para simular a experiência completa do exame</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-2">Tipos de exames disponíveis:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-800/40 dark:to-blue-900/40 px-2 py-1 rounded-full border border-blue-300 dark:border-blue-600/50">
                            <span className="text-[11px]">📚</span>
                            <span className="text-[9px] font-semibold text-blue-900 dark:text-blue-100">ENEM</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-800/40 dark:to-purple-900/40 px-2 py-1 rounded-full border border-purple-300 dark:border-purple-600/50">
                            <span className="text-[11px]">🎓</span>
                            <span className="text-[9px] font-semibold text-purple-900 dark:text-purple-100">Vestibular</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800/40 dark:to-green-900/40 px-2 py-1 rounded-full border border-green-300 dark:border-green-600/50">
                            <span className="text-[11px]">📝</span>
                            <span className="text-[9px] font-semibold text-green-900 dark:text-green-100">Concurso</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-800/40 dark:to-amber-900/40 px-2 py-1 rounded-full border border-amber-300 dark:border-amber-600/50">
                            <span className="text-[11px]">⚙️</span>
                            <span className="text-[9px] font-semibold text-amber-900 dark:text-amber-100">Personalizado</span>
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
                          Preparar você para a <strong>pressão real da prova</strong>, desenvolvendo habilidades de gestão de tempo e familiaridade com o formato dos exames.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">🎯 Por que praticar com simulados?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Controle de tempo:</strong> Aprenda a gerenciar os minutos durante a prova</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Redução de ansiedade:</strong> Familiarize-se com o formato da prova</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Identificar fraquezas:</strong> Descubra pontos que precisa melhorar</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Desenvolver estratégias:</strong> Teste diferentes abordagens de escrita</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-amber-600 dark:text-amber-400" size={14} />
                      <p className="text-[10px] text-amber-900 dark:text-amber-100">
                        <strong>Dica:</strong> Faça pelo menos 3 simulados antes da prova real!
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
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Configure o Simulado</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Escolha tipo de exame, tempo limite, tema e dificuldade</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Gere uma Proposta</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Use a IA para gerar propostas completas com textos de apoio ou cole uma própria</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Inicie e Escreva</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Clique em "Iniciar Simulação" e escreva sua redação com cronômetro ativo</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Simulado salvo automaticamente na biblioteca!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'configuracoes' && (
                <div className="mb-4 flex-1 space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100">
                  <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100 mb-2">⚙️ Opções de configuração:</p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="text-bright-blue flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100">Tipo de Exame</p>
                        <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">ENEM, Vestibular, Concurso Público ou Personalizado</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Timer className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">Tempo Limite</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">60min (ENEM), 90min, 120min ou sem limite de tempo</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <FileText className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Tema e Dificuldade</p>
                        <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">12+ temas disponíveis (tecnologia, meio ambiente, saúde, etc.) em 4 níveis de dificuldade</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Exibição do Timer</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Escolha se quer ver o tempo sempre ou apenas em intervalos (5, 10, 15 ou 30min)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'propostas-ia' && (
                <div className="mb-4 flex-1 space-y-2.5">
                  <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-violet-200 dark:border-violet-700/30">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Propostas Autênticas!</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          A IA gera <strong>2 propostas completas</strong> com enunciado e textos de apoio, simulando perfeitamente provas reais!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">✨ O que você recebe:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Título da proposta:</strong> Tema claro e objetivo</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Enunciado:</strong> Instrução de como desenvolver a redação</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Textos de apoio:</strong> 2-3 textos para fundamentar sua argumentação</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-700/30">
                    <p className="text-[10px] font-bold text-cyan-900 dark:text-cyan-100 mb-1">💡 Dica profissional:</p>
                    <p className="text-[9px] text-cyan-800 dark:text-cyan-200">Você também pode colar uma proposta personalizada se preferir praticar com um tema específico!</p>
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
                          Você agora sabe como usar o Simulador de Prova
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-2">Sugestão de primeiro simulado:</p>
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2.5 rounded">
                      <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                        📝 Configure: <strong>ENEM</strong>, <strong>60 minutos</strong>, tema <strong>aleatório</strong>, dificuldade <strong>média</strong> e clique em <strong>"Gerar Propostas com IA"</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <GraduationCap className="text-amber-600 dark:text-amber-400" size={16} />
                    <p className="text-[11px] font-bold text-amber-900 dark:text-amber-100">
                      Boa sorte no seu simulado! 🎓
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
                  data-testid="button-previous-simulador-step"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>

                <div className="flex items-center gap-1.5">
                  {simuladorSteps.map((_, index) => (
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
                  data-testid="button-next-simulador-step"
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
