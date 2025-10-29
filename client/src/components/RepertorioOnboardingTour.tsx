import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Search, BookOpen, Target, CheckCircle, PartyPopper, Lightbulb, BookmarkPlus, Sparkles, Layers, Filter, Clock, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'center';
  icon?: React.ReactNode;
  category?: string;
}

const repertorioSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo ao Explorador de Repertório!',
    description: 'Esta ferramenta usa IA para encontrar referências culturais, históricas e científicas perfeitas para enriquecer sua redação.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'O Explorador de Repertório foi criado para resolver um dos maiores desafios na redação: encontrar exemplos concretos e repertórios culturais relevantes para seus argumentos.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'Você digita seu tema ou cola a proposta completa da redação, e a IA busca nos nossos bancos de dados e gera repertórios personalizados relacionados ao seu assunto.',
    position: 'center',
    icon: <Search className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: 'elementos',
    title: 'Elementos da Interface',
    description: 'Vamos conhecer os principais elementos da tela e entender para que cada um serve. Cada parte foi pensada para facilitar sua busca por repertórios.',
    position: 'center',
    icon: <Layers className="text-bright-blue" size={24} />,
    category: 'Interface'
  },
  {
    target: 'report-problems',
    title: 'Reportar Problemas com a IA',
    description: 'Encontrou uma resposta incorreta, confusa ou irrelevante? Use o botão de reportar para nos ajudar a melhorar a qualidade dos repertórios gerados.',
    position: 'center',
    icon: <AlertTriangle className="text-bright-blue" size={24} />,
    category: 'Feedback'
  },
  {
    target: 'biblioteca',
    title: 'Salve na Biblioteca',
    description: 'Encontrou um repertório perfeito? Salve na sua Biblioteca Pessoal para usar em redações futuras e ter sempre à mão!',
    position: 'center',
    icon: <BookmarkPlus className="text-bright-blue" size={24} />,
    category: 'Salvamento'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe como usar o Explorador de Repertório. Comece digitando seu tema ou colando sua proposta de redação!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface RepertorioOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function RepertorioOnboardingTour({ onComplete, onSkip }: RepertorioOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = repertorioSteps[currentStep];
  const isLastStep = currentStep === repertorioSteps.length - 1;
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
                data-testid="button-skip-repertorio-onboarding"
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
                    {step.icon || <Search className="text-bright-blue" size={20} />}
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
                          <li>✓ Quando precisar de exemplos concretos para argumentos</li>
                          <li>✓ Para aumentar a nota das competências 2 e 3 do ENEM</li>
                          <li>✓ Quando quiser citar filmes, livros, leis ou pesquisas</li>
                          <li>✓ Para enriquecer redações com repertório sociocultural</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <BookOpen className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-2">10 tipos disponíveis:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-800/40 dark:to-blue-900/40 px-2 py-1 rounded-full border border-blue-300 dark:border-blue-600/50">
                            <span className="text-[11px]">📽️</span>
                            <span className="text-[9px] font-semibold text-blue-900 dark:text-blue-100">Filmes</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-800/40 dark:to-purple-900/40 px-2 py-1 rounded-full border border-purple-300 dark:border-purple-600/50">
                            <span className="text-[11px]">📚</span>
                            <span className="text-[9px] font-semibold text-purple-900 dark:text-purple-100">Livros</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-800/40 dark:to-amber-900/40 px-2 py-1 rounded-full border border-amber-300 dark:border-amber-600/50">
                            <span className="text-[11px]">⚖️</span>
                            <span className="text-[9px] font-semibold text-amber-900 dark:text-amber-100">Leis</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/40 dark:to-slate-900/40 px-2 py-1 rounded-full border border-slate-300 dark:border-slate-600/50">
                            <span className="text-[11px]">📰</span>
                            <span className="text-[9px] font-semibold text-slate-900 dark:text-slate-100">Notícias</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800/40 dark:to-green-900/40 px-2 py-1 rounded-full border border-green-300 dark:border-green-600/50">
                            <span className="text-[11px]">📅</span>
                            <span className="text-[9px] font-semibold text-green-900 dark:text-green-100">Acontecimentos</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-800/40 dark:to-pink-900/40 px-2 py-1 rounded-full border border-pink-300 dark:border-pink-600/50">
                            <span className="text-[11px]">🎵</span>
                            <span className="text-[9px] font-semibold text-pink-900 dark:text-pink-100">Música</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-800/40 dark:to-indigo-900/40 px-2 py-1 rounded-full border border-indigo-300 dark:border-indigo-600/50">
                            <span className="text-[11px]">📺</span>
                            <span className="text-[9px] font-semibold text-indigo-900 dark:text-indigo-100">Séries</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-cyan-800/40 dark:to-cyan-900/40 px-2 py-1 rounded-full border border-cyan-300 dark:border-cyan-600/50">
                            <span className="text-[11px]">🎬</span>
                            <span className="text-[9px] font-semibold text-cyan-900 dark:text-cyan-100">Documentários</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-800/40 dark:to-teal-900/40 px-2 py-1 rounded-full border border-teal-300 dark:border-teal-600/50">
                            <span className="text-[11px]">🔬</span>
                            <span className="text-[9px] font-semibold text-teal-900 dark:text-teal-100">Pesquisas</span>
                          </span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-800/40 dark:to-orange-900/40 px-2 py-1 rounded-full border border-orange-300 dark:border-orange-600/50">
                            <span className="text-[11px]">📊</span>
                            <span className="text-[9px] font-semibold text-orange-900 dark:text-orange-100">Dados</span>
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
                          Fornecer <strong>referências culturais relevantes e de qualidade</strong> para fortalecer seus argumentos e aumentar a credibilidade da redação.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">🎯 Por que repertório é importante?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Conhecimento cultural:</strong> Demonstra repertório sociocultural amplo</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Argumentação sólida:</strong> Fortalece seus pontos de vista com dados reais</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Credibilidade:</strong> Exemplos concretos convencem mais avaliadores</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Diferencial:</strong> Destaca sua redação entre as demais</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-amber-600 dark:text-amber-400" size={14} />
                      <p className="text-[10px] text-amber-900 dark:text-amber-100">
                        <strong>Dica:</strong> Use 2-3 repertórios diferentes para argumentos mais ricos!
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
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Digite ou Cole</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Escreva o tema ou cole a proposta completa da redação</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Filtre (Opcional)</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Escolha o tipo: filmes, livros, leis, pesquisas, etc.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">A IA Busca e Gera</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Repertórios relevantes aparecem em segundos</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Repertórios prontos para usar na redação!
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
                      <Search className="text-bright-blue flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100">Campo de Busca</p>
                        <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">Digite seu tema ou cole a proposta completa. Pressione Enter ou clique em "Buscar".</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Filter className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">Filtro de Tipo</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">Escolha entre filmes, livros, leis, pesquisas, notícias e mais para resultados específicos.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <BookOpen className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Cards de Repertório</p>
                        <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">Cada card mostra título, descrição, tipo e ano da referência. Clique para expandir.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Badge de Origem</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Mostra se o repertório veio do cache (rápido) ou foi gerado pela IA (personalizado).</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-700/30">
                    <div className="flex items-start gap-2">
                      <BookmarkPlus className="text-indigo-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-900 dark:text-indigo-100">Botão Salvar</p>
                        <p className="text-[9px] text-indigo-800 dark:text-indigo-200 leading-snug">Salva o repertório na sua biblioteca para usar depois.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-900/20 p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/30">
                    <div className="flex items-start gap-2">
                      <Zap className="text-sky-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-sky-900 dark:text-sky-100">Carregar Mais</p>
                        <p className="text-[9px] text-sky-800 dark:text-sky-200 leading-snug">Busca repertórios adicionais relacionados ao seu tema.</p>
                      </div>
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
                          Quando encontrar um repertório que não está adequado, use o botão <strong>"Reportar Problema"</strong> para nos avisar.
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
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Resposta irrelevante:</strong> Não tem relação com o tema buscado</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-1">🎯 Como funciona:</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-blue-800 dark:text-blue-200">1. Clique em "Reportar Problema" no repertório</p>
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
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Salve seus Repertórios!</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          Encontrou um repertório perfeito? Salve na <strong>Biblioteca Pessoal</strong> para ter sempre disponível!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">💾 Como salvar:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">1.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Busque repertórios relacionados ao seu tema</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">2.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Leia a descrição e veja se é relevante para sua redação</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue font-bold mt-0.5">3.</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Clique em "Salvar Repertório" no card desejado</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-700/30">
                    <p className="text-[10px] font-bold text-cyan-900 dark:text-cyan-100 mb-1">📚 Por que salvar?</p>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Acesse repertórios salvos a qualquer momento</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Organize seu acervo de referências por tema</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Reutilize em redações sobre temas similares</p>
                      <p className="text-[9px] text-cyan-800 dark:text-cyan-200">• Construa um banco pessoal de repertórios</p>
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
                          Você agora sabe como usar o Explorador de Repertório
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-100 mb-2">Dica de primeiro passo:</p>
                    <div className="bg-white/50 dark:bg-gray-800/30 p-2.5 rounded">
                      <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-snug">
                        🔍 Comece digitando algo como: <strong>"desigualdade social"</strong>, <strong>"meio ambiente"</strong> ou cole sua <strong>proposta completa de redação</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <Search className="text-amber-600 dark:text-amber-400" size={16} />
                    <p className="text-[11px] font-bold text-amber-900 dark:text-amber-100">
                      A IA vai encontrar os melhores repertórios! 🚀
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
                  data-testid="button-previous-repertorio-step"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>

                <div className="flex items-center gap-1.5">
                  {repertorioSteps.map((_, index) => (
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
                  data-testid="button-next-repertorio-step"
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
