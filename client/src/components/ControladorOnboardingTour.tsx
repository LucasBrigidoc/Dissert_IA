import { useState } from 'react';
import { ChevronRight, ChevronLeft, Edit3, Target, CheckCircle, PartyPopper, Lightbulb, Sparkles, Sliders, FileText, Shuffle, AlertTriangle, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'center';
  icon?: React.ReactNode;
  category?: string;
}

const controladorSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo ao Controlador de Escrita!',
    description: 'Esta ferramenta usa IA para transformar e refinar seu texto aplicando diferentes estilos e estruturas argumentativas.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'O Controlador de Escrita foi criado para ajudar você a melhorar seus textos com controle total sobre estilo, estrutura e complexidade da linguagem.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'Você cola seu texto, escolhe as modificações que deseja aplicar (reescrita, estruturas causais, comparativas ou de oposição), ajusta os parâmetros e a IA gera versões refinadas.',
    position: 'center',
    icon: <Edit3 className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: 'controles',
    title: 'Os 4 Tipos de Controle',
    description: 'Cada card representa um tipo diferente de modificação que você pode aplicar ao seu texto. Você pode usar um ou combinar vários ao mesmo tempo!',
    position: 'center',
    icon: <Sliders className="text-bright-blue" size={24} />,
    category: 'Controles'
  },
  {
    target: 'report-problems',
    title: 'Reportar Problemas com a IA',
    description: 'Encontrou uma resposta incorreta, confusa ou irrelevante? Use o botão de reportar para nos ajudar a melhorar a qualidade dos textos gerados.',
    position: 'center',
    icon: <AlertTriangle className="text-bright-blue" size={24} />,
    category: 'Feedback'
  },
  {
    target: 'biblioteca',
    title: 'Salve na Biblioteca',
    description: 'Encontrou uma versão perfeita do seu texto? Salve na sua Biblioteca Pessoal para usar em redações futuras e ter sempre à mão!',
    position: 'center',
    icon: <BookmarkPlus className="text-bright-blue" size={24} />,
    category: 'Salvamento'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe como usar o Controlador de Escrita. Cole seu texto, ative os controles desejados e clique em "Gerar Modificações"!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface ControladorOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function ControladorOnboardingTour({ onComplete, onSkip }: ControladorOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = controladorSteps[currentStep];
  const isLastStep = currentStep === controladorSteps.length - 1;
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
                data-testid="button-skip-controlador-onboarding"
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
                    {step.icon || <Edit3 className="text-bright-blue" size={20} />}
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
                          <li>✓ Quando quiser reescrever um parágrafo com diferentes níveis de formalidade</li>
                          <li>✓ Para adicionar estruturas argumentativas ao seu texto</li>
                          <li>✓ Quando precisar melhorar a coesão e coerência do texto</li>
                          <li>✓ Para explorar diferentes formas de escrever a mesma ideia</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-2">4 tipos de controles disponíveis:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-sky-100 to-sky-50 dark:from-sky-800/40 dark:to-sky-900/40 px-2 py-1 rounded-full border border-sky-300 dark:border-sky-600/50">
                            <FileText className="text-sky-600" size={12} />
                            <span className="text-[9px] font-semibold text-sky-900 dark:text-sky-100">Reescrita</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-800/40 dark:to-emerald-900/40 px-2 py-1 rounded-full border border-emerald-300 dark:border-emerald-600/50">
                            <Target className="text-emerald-600" size={12} />
                            <span className="text-[9px] font-semibold text-emerald-900 dark:text-emerald-100">Causais</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-800/40 dark:to-purple-900/40 px-2 py-1 rounded-full border border-purple-300 dark:border-purple-600/50">
                            <Shuffle className="text-purple-600" size={12} />
                            <span className="text-[9px] font-semibold text-purple-900 dark:text-purple-100">Comparativas</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-800/40 dark:to-amber-900/40 px-2 py-1 rounded-full border border-amber-300 dark:border-amber-600/50">
                            <span className="text-[11px]">⚖️</span>
                            <span className="text-[9px] font-semibold text-amber-900 dark:text-amber-100">Oposição</span>
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
                          Dar a você <strong>controle total sobre o estilo e estrutura</strong> do texto, permitindo experimentar diferentes versões até encontrar a melhor forma de expressar suas ideias.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">🎯 Por que usar o Controlador de Escrita?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Versatilidade:</strong> Adapte o texto para diferentes contextos e níveis de formalidade</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Aprendizado:</strong> Compare versões e aprenda novas formas de estruturar argumentos</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Economia de tempo:</strong> Gere múltiplas versões rapidamente</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Qualidade:</strong> Melhore a coesão e coerência dos seus textos</p>
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
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Cole seu Texto</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Digite ou cole o parágrafo que deseja modificar na área de texto</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Escolha os Controles</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Ative um ou mais controles (reescrita, causal, comparativa, oposição) e ajuste os parâmetros</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Gere e Compare</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Clique em "Gerar Modificações" e receba várias versões do seu texto</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Versões refinadas prontas para usar!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'controles' && (
                <div className="mb-4 flex-1 space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-bright-blue/30 scrollbar-track-gray-100">
                  <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100 mb-2">🎛️ Conheça cada tipo de controle:</p>
                  
                  <div className="bg-sky-50 dark:bg-sky-900/20 p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/30">
                    <div className="flex items-start gap-2">
                      <FileText className="text-sky-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-sky-900 dark:text-sky-100">Reescrita</p>
                        <p className="text-[9px] text-sky-800 dark:text-sky-200 leading-snug">Ajuste formalidade, tamanho do texto e complexidade das palavras. Pode preservar ou mudar o sentido.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-700/30">
                    <div className="flex items-start gap-2">
                      <Target className="text-emerald-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-900 dark:text-emerald-100">Estruturas Causais</p>
                        <p className="text-[9px] text-emerald-800 dark:text-emerald-200 leading-snug">Adiciona relações de causa e consequência (porque, portanto, devido a, etc.)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Shuffle className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">Estruturas Comparativas</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">Cria comparações e analogias (assim como, da mesma forma que, etc.)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 flex-shrink-0 mt-0.5 text-sm">⚖️</span>
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Estruturas de Oposição</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Adiciona contrapontos e concessões (embora, porém, apesar de, etc.)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30 mt-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-blue-600 dark:text-blue-400" size={14} />
                      <p className="text-[10px] text-blue-900 dark:text-blue-100">
                        <strong>Dica:</strong> Você pode combinar múltiplos controles ao mesmo tempo!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'report-problems' && (
                <div className="mb-4 flex-1 space-y-2.5">
                  <div className="bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20 p-3 rounded-lg border border-red-200 dark:border-red-700/30">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-red-900 dark:text-red-100 mb-1">Ajude a Melhorar a IA!</p>
                        <p className="text-[10px] text-red-800 dark:text-red-200 leading-snug">
                          Quando encontrar um texto gerado que não está adequado, use o botão <strong>"Reportar Problema"</strong> para nos avisar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">⚠️ Quando reportar?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Resposta incorreta:</strong> Informações factualmente erradas ou imprecisas</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Resposta confusa:</strong> Difícil de entender ou mal explicada</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Resposta irrelevante:</strong> Não tem relação com o texto original</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-1">🎯 Como funciona:</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-blue-800 dark:text-blue-200">1. Clique em "Reportar Problema" no resultado</p>
                      <p className="text-[9px] text-blue-800 dark:text-blue-200">2. Descreva o que está errado</p>
                      <p className="text-[9px] text-blue-800 dark:text-blue-200">3. Envie o feedback</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={14} />
                      <p className="text-[10px] text-green-900 dark:text-green-100">
                        <strong>Seu feedback nos ajuda a treinar a IA e melhorar os resultados!</strong>
                      </p>
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
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Salve seus Textos Refinados!</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          Encontrou uma versão perfeita? Salve na <strong>Biblioteca Pessoal</strong> para ter sempre disponível!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">💾 Como salvar:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">1.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Gere as modificações do seu texto</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">2.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Compare as diferentes versões geradas</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">3.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Clique em "Salvar" na versão que você mais gostou</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-700/30">
                    <p className="text-[10px] font-bold text-cyan-900 dark:text-cyan-100 mb-1">📚 Por que salvar?</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Acesse textos refinados a qualquer momento</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Organize suas melhores versões por tema</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Reutilize em redações sobre temas similares</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={14} />
                      <p className="text-[10px] text-green-900 dark:text-green-100">
                        <strong>Construa sua própria coleção de textos refinados!</strong>
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
                          Você agora sabe como usar o Controlador de Escrita
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-2">Dica de primeiro passo:</p>
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2.5 rounded">
                      <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                        ✍️ Cole um parágrafo da sua redação, ative <strong>"Reescrita"</strong> e ajuste a complexidade das palavras para <strong>"Complexo"</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <Sparkles className="text-amber-600 dark:text-amber-400" size={16} />
                    <p className="text-[11px] font-bold text-amber-900 dark:text-amber-100">
                      A IA vai gerar versões refinadas do seu texto! 🚀
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
                  data-testid="button-previous-controlador-step"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>

                <div className="flex items-center gap-1.5">
                  {controladorSteps.map((_, index) => (
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
                  data-testid="button-next-controlador-step"
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
