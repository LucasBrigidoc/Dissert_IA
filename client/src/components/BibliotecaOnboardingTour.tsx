import { useState } from 'react';
import { ChevronRight, ChevronLeft, Archive, Target, CheckCircle, PartyPopper, BookmarkPlus, Lightbulb, Layers, Filter, FileText, Search, Download, Trash2, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position: 'center';
  icon?: React.ReactNode;
  category?: string;
}

const bibliotecaSteps: OnboardingStep[] = [
  {
    target: 'intro',
    title: 'Bem-vindo à Biblioteca Pessoal!',
    description: 'Este é o seu repositório inteligente onde todos os seus arquivos ficam organizados e sempre acessíveis para consulta.',
    position: 'center',
    icon: <PartyPopper className="text-bright-blue" size={24} />,
    category: 'Início'
  },
  {
    target: 'objetivo',
    title: 'Qual é o Objetivo desta Ferramenta?',
    description: 'A Biblioteca Pessoal foi criada para centralizar e organizar tudo que você salva: repertórios, propostas, textos modificados, roteiros e muito mais.',
    position: 'center',
    icon: <Target className="text-bright-blue" size={24} />,
    category: 'Objetivo'
  },
  {
    target: 'how-it-works',
    title: 'Como Funciona?',
    description: 'Todos os itens que você salva nas outras funcionalidades aparecem aqui automaticamente, organizados por categoria para facilitar o acesso.',
    position: 'center',
    icon: <Archive className="text-bright-blue" size={24} />,
    category: 'Funcionamento'
  },
  {
    target: 'elementos',
    title: 'Elementos da Interface',
    description: 'Vamos conhecer os principais elementos da tela e entender para que cada um serve.',
    position: 'center',
    icon: <Layers className="text-bright-blue" size={24} />,
    category: 'Interface'
  },
  {
    target: 'acoes',
    title: 'Ações Disponíveis',
    description: 'Você pode visualizar, baixar em PDF e excluir seus arquivos de forma fácil e rápida.',
    position: 'center',
    icon: <Eye className="text-bright-blue" size={24} />,
    category: 'Ações'
  },
  {
    target: 'finish',
    title: 'Pronto para Começar!',
    description: 'Agora você já sabe como usar a Biblioteca Pessoal. Continue usando as funcionalidades para criar mais arquivos!',
    position: 'center',
    icon: <CheckCircle className="text-bright-blue" size={24} />,
    category: 'Concluído'
  }
];

interface BibliotecaOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function BibliotecaOnboardingTour({ onComplete, onSkip }: BibliotecaOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = bibliotecaSteps[currentStep];
  const isLastStep = currentStep === bibliotecaSteps.length - 1;
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
                data-testid="button-skip-biblioteca-onboarding"
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
                    {step.icon || <Archive className="text-bright-blue" size={20} />}
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
                        <p className="text-[11px] font-bold text-purple-900 dark:text-purple-100 mb-1">Para que serve a Biblioteca?</p>
                        <ul className="text-[10px] text-purple-800 dark:text-purple-200 leading-snug space-y-0.5">
                          <li>✓ Centralizar todos os seus arquivos salvos em um só lugar</li>
                          <li>✓ Organizar por categoria para fácil acesso</li>
                          <li>✓ Buscar rapidamente o que precisa</li>
                          <li>✓ Baixar e reutilizar seus conteúdos quando quiser</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <Archive className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                      <div className="w-full">
                        <p className="text-[10px] font-bold text-blue-900 dark:text-blue-100 mb-3">6 tipos de arquivos:</p>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-800/40 dark:to-blue-900/40 px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-600/50">
                            <span className="text-sm">📚</span>
                            <span className="text-[10px] font-semibold text-blue-900 dark:text-blue-100">Repertórios</span>
                          </span>
                          <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-800/40 dark:to-indigo-900/40 px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600/50">
                            <span className="text-sm">📋</span>
                            <span className="text-[10px] font-semibold text-indigo-900 dark:text-indigo-100">Propostas</span>
                          </span>
                          <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-100 to-cyan-50 dark:from-cyan-800/40 dark:to-cyan-900/40 px-3 py-2 rounded-lg border border-cyan-300 dark:border-cyan-600/50">
                            <span className="text-sm">📝</span>
                            <span className="text-[10px] font-semibold text-cyan-900 dark:text-cyan-100">Textos</span>
                          </span>
                          <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-100 to-pink-50 dark:from-pink-800/40 dark:to-pink-900/40 px-3 py-2 rounded-lg border border-pink-300 dark:border-pink-600/50">
                            <span className="text-sm">🎯</span>
                            <span className="text-[10px] font-semibold text-pink-900 dark:text-pink-100">Roteiros</span>
                          </span>
                          <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-800/40 dark:to-purple-900/40 px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-600/50">
                            <span className="text-sm">💡</span>
                            <span className="text-[10px] font-semibold text-purple-900 dark:text-purple-100">Ideias</span>
                          </span>
                          <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-800/40 dark:to-amber-900/40 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-600/50">
                            <span className="text-sm">🎓</span>
                            <span className="text-[10px] font-semibold text-amber-900 dark:text-amber-100">Simulados</span>
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
                          Ser o <strong>repositório central</strong> de todo o seu aprendizado, mantendo tudo organizado e sempre acessível.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">🎯 Por que usar a Biblioteca?</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Organização:</strong> Tudo em um só lugar, fácil de encontrar</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Reutilização:</strong> Acesse seus repertórios e propostas sempre que precisar</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Histórico:</strong> Acompanhe sua evolução ao longo do tempo</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] text-bright-blue mt-0.5">•</span>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300"><strong>Exportação:</strong> Baixe tudo em PDF para estudar offline</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-amber-600 dark:text-amber-400" size={14} />
                      <p className="text-[10px] text-amber-900 dark:text-amber-100">
                        <strong>Dica:</strong> Use os filtros para encontrar rapidamente o que procura!
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
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Salve nas Funcionalidades</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Use o botão "Salvar na Biblioteca" em qualquer funcionalidade</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Organize Automaticamente</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Seus arquivos aparecem aqui organizados por categoria</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 bg-bright-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-bright-blue">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-dark-blue dark:text-gray-100">Acesse Quando Quiser</p>
                        <p className="text-[10px] text-soft-gray dark:text-gray-300">Busque, visualize e baixe seus arquivos a qualquer momento</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-3 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-[11px] font-bold text-green-900 dark:text-green-100">
                        Resultado: Tudo organizado e sempre disponível!
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
                        <p className="text-[9px] text-blue-800 dark:text-blue-200 leading-snug">Digite palavras-chave para encontrar arquivos específicos rapidamente.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-start gap-2">
                      <Filter className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-purple-900 dark:text-purple-100">Filtros por Categoria</p>
                        <p className="text-[9px] text-purple-800 dark:text-purple-200 leading-snug">Filtre por tipo: Repertórios, Propostas, Textos, Roteiros, Ideias ou Simulados.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-700/30">
                    <div className="flex items-start gap-2">
                      <Archive className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-green-900 dark:text-green-100">Cards de Estatísticas</p>
                        <p className="text-[9px] text-green-800 dark:text-green-200 leading-snug">Veja quantos arquivos você tem em cada categoria.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-700/30">
                    <div className="flex items-start gap-2">
                      <FileText className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 dark:text-amber-100">Cards de Arquivos</p>
                        <p className="text-[9px] text-amber-800 dark:text-amber-200 leading-snug">Cada card mostra título, descrição, tipo, data e tamanho do arquivo.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-3 rounded-lg border-2 border-red-400 dark:border-red-600/50 shadow-md">
                    <div className="flex items-start gap-2">
                      <XCircle className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-[11px] font-bold text-red-900 dark:text-red-100">⚠️ Limite de Arquivos</p>
                        <p className="text-[10px] text-red-800 dark:text-red-200 leading-snug font-medium">
                          Plano gratuito: <span className="font-bold">apenas 20 arquivos</span>. 
                          <span className="block mt-1 text-green-700 dark:text-green-400 font-bold">✨ Upgrade para Pro = ILIMITADO!</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step.target === 'acoes' && (
                <div className="mb-4 flex-1 space-y-2.5">
                  <div className="bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-800/20 p-3 rounded-lg border border-violet-200 dark:border-violet-700/30">
                    <div className="flex items-start gap-2.5">
                      <Eye className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-[11px] font-bold text-violet-900 dark:text-violet-100 mb-1">Ações Disponíveis</p>
                        <p className="text-[10px] text-violet-800 dark:text-violet-200 leading-snug">
                          Cada arquivo tem 3 ações principais que você pode realizar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">👁️ O que você pode fazer:</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Eye className="text-bright-blue flex-shrink-0 mt-0.5" size={12} />
                        <div>
                          <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">Visualizar</p>
                          <p className="text-[9px] text-soft-gray dark:text-gray-300">Ver o conteúdo completo do arquivo em detalhes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Download className="text-bright-blue flex-shrink-0 mt-0.5" size={12} />
                        <div>
                          <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">Baixar PDF</p>
                          <p className="text-[9px] text-soft-gray dark:text-gray-300">Exportar o arquivo em formato PDF para usar offline</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Trash2 className="text-red-600 flex-shrink-0 mt-0.5" size={12} />
                        <div>
                          <p className="text-[10px] font-bold text-red-700 dark:text-red-400">Excluir</p>
                          <p className="text-[9px] text-soft-gray dark:text-gray-300">Remover arquivos que não precisa mais</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-700/30">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="text-emerald-600 dark:text-emerald-400" size={14} />
                      <p className="text-[10px] text-emerald-900 dark:text-emerald-100">
                        <strong>Dica:</strong> Baixe seus arquivos favoritos em PDF para ter backup!
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
                          Agora você sabe como usar a Biblioteca Pessoal para organizar e acessar todos os seus arquivos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-dark-blue dark:text-gray-100">📚 Próximos passos:</p>
                    <div className="space-y-1.5">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700/30">
                        <p className="text-[10px] text-blue-900 dark:text-blue-100">
                          <strong>1.</strong> Use as funcionalidades para criar conteúdo
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700/30">
                        <p className="text-[10px] text-purple-900 dark:text-purple-100">
                          <strong>2.</strong> Salve o que achar interessante na Biblioteca
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700/30">
                        <p className="text-[10px] text-green-900 dark:text-green-100">
                          <strong>3.</strong> Volte aqui sempre que precisar consultar!
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
                data-testid="button-previous-biblioteca-step"
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </Button>

              <div className="flex items-center gap-1.5">
                {bibliotecaSteps.map((_, index) => (
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
                data-testid="button-next-biblioteca-step"
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
