import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, FileText, Calendar, Sparkles, BookOpen, BookmarkPlus, Clock, Loader2, Trophy, GraduationCap, Lightbulb } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Proposal } from "@shared/schema";
import { AIUsageProgress } from "@/components/ai-usage-progress";

interface SearchResult {
  results: Proposal[];
  count: number;
  query?: string;
  futureExamDetected?: boolean;
  futureExamInfo?: {
    examName: string;
    futureYear: number;
    message: string;
  };
  suggestions?: {
    themes: string[];
    examTypes: string[];
  };
}

export default function Propostas() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [hasShownInitialCacheResults, setHasShownInitialCacheResults] = useState(false);
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(new Set());
  const [generationContext, setGenerationContext] = useState("");
  
  const { toast } = useToast();

  // Toggle supporting text expansion
  const toggleSupportingText = (proposalId: string) => {
    setExpandedProposals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(proposalId)) {
        newSet.delete(proposalId);
      } else {
        newSet.add(proposalId);
      }
      return newSet;
    });
  };

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Mutation para salvar proposta na biblioteca pessoal
  const saveProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest(`/api/proposals/${proposalId}/save`, {
        method: "POST"
      });
    },
    onSuccess: (data: any) => {
      // Verificar se já estava salvo
      if (data.alreadySaved) {
        toast({
          title: "Proposta já salva!",
          description: "Esta proposta já está na sua biblioteca pessoal.",
          variant: "default",
        });
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/saved'] });
      toast({
        title: "Proposta salva!",
        description: "A proposta foi adicionada à sua biblioteca pessoal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a proposta. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error saving proposal:", error);
    }
  });
  
  // Sempre voltar para functionalities 
  const getBackUrl = () => {
    return '/functionalities';
  };

  // Load initial proposals
  const { data: initialData } = useQuery({
    queryKey: ["/api/proposals"],
    queryFn: async () => {
      const result = await apiRequest("/api/proposals?limit=6");
      return result;
    }
  });

  useEffect(() => {
    if (initialData) {
      setSearchResults(initialData);
      setIsLoadingInitial(false);
    }
  }, [initialData]);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: { query: string; examType?: string; theme?: string; difficulty?: string }) => {
      console.log("🔍 Fazendo busca com:", query);
      const result = await apiRequest("/api/proposals/search", {
        method: "POST",
        body: query
      });
      console.log("✅ Resultado da busca:", result);
      return result;
    },
    onSuccess: (data: SearchResult) => {
      console.log("🎉 Busca bem-sucedida, atualizando resultados:", data);
      setSearchResults(data);
    },
    onError: (error) => {
      console.error("❌ Erro na busca:", error);
    }
  });

  // Load more mutation for getting additional proposals
  const loadMoreMutation = useMutation({
    mutationFn: async (query: { query: string; examType?: string; theme?: string; difficulty?: string; excludeIds: string[] }) => {
      console.log("📚 Carregando mais propostas:", query);
      const result = await apiRequest("/api/proposals/search", {
        method: "POST",
        body: query
      });
      console.log("✅ Mais propostas carregadas:", result);
      return result;
    },
    onSuccess: (data: SearchResult) => {
      if (searchResults && data.results.length > 0) {
        const newUniqueProposals = data.results.filter(
          newProposal => !searchResults.results.some(existingProposal => existingProposal.id === newProposal.id)
        );
        
        if (newUniqueProposals.length > 0) {
          setSearchResults(prev => ({
            ...prev!,
            results: [...prev!.results, ...newUniqueProposals],
            count: prev!.count + newUniqueProposals.length
          }));
        }
      }
    },
    onError: (error) => {
      console.error("❌ Erro ao carregar mais propostas:", error);
    }
  });

  // Generate new proposals mutation
  const generateMutation = useMutation({
    mutationFn: async (params: { theme: string; difficulty: string; examType: string; context?: string }) => {
      console.log("🎯 Gerando novas propostas:", params);
      const result = await apiRequest("/api/proposals/generate", {
        method: "POST",
        body: params
      });
      console.log("✅ Propostas geradas:", result);
      return result;
    },
    onSuccess: (data: SearchResult) => {
      if (searchResults && data.results.length > 0) {
        setSearchResults(prev => ({
          ...prev!,
          results: [...prev!.results, ...data.results],
          count: prev!.count + data.results.length
        }));
        
        toast({
          title: "Novas propostas geradas!",
          description: `${data.results.length} propostas personalizadas foram criadas pela IA.`,
        });
      }
    },
    onError: (error) => {
      console.error("❌ Erro na geração:", error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar novas propostas. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Campo vazio",
        description: "Digite um termo para buscar propostas.",
        variant: "destructive"
      });
      return;
    }

    const query = {
      query: searchQuery,
      examType: selectedExamType === "all" ? undefined : selectedExamType,
      theme: selectedTheme === "all" ? undefined : selectedTheme,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
    };

    searchMutation.mutate(query);
  };

  const handleLoadMore = () => {
    if (!searchResults) return;
    
    const excludeIds = searchResults.results.map(p => p.id);
    const query = {
      query: searchQuery || "",
      examType: selectedExamType === "all" ? undefined : selectedExamType,
      theme: selectedTheme === "all" ? undefined : selectedTheme,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
      excludeIds
    };

    loadMoreMutation.mutate(query);
  };

  const handleGenerateNew = () => {
    const theme = selectedTheme === "all" ? "social" : selectedTheme;
    const difficulty = selectedDifficulty === "all" ? "medio" : selectedDifficulty;
    const examType = selectedExamType === "all" ? "enem" : selectedExamType;

    // Se ainda não mostrou resultados do cache, mostrar primeiro do cache
    if (!hasShownInitialCacheResults) {
      // Buscar do cache primeiro (sistema já retorna do cache quando disponível)
      const cacheQuery = {
        query: `tema ${theme}`, // usar o tema como query para buscar no cache
        examType: examType === "enem" ? undefined : examType,
        theme: theme === "social" ? undefined : theme,
        difficulty: difficulty === "medio" ? undefined : difficulty,
      };
      
      // Fazer busca que retorna do cache primeiro
      searchMutation.mutate(cacheQuery);
      
      // Marcar que já mostrou cache após iniciar a busca
      setHasShownInitialCacheResults(true);
    } else {
      // Se já mostrou cache, gerar novas propostas com IA
      generateMutation.mutate({ 
        theme, 
        difficulty, 
        examType,
        context: generationContext.trim() || undefined
      });
    }
  };

  const getFilteredProposals = () => {
    if (!searchResults) return [];
    return searchResults.results;
  };

  const displayProposals = getFilteredProposals();
  const isLoading = searchMutation.isPending || isLoadingInitial || loadMoreMutation.isPending;

  // Get theme label
  const getThemeLabel = (theme: string) => {
    const themes = {
      social: "Sociedade",
      environment: "Meio Ambiente",
      technology: "Tecnologia",
      education: "Educação",
      politics: "Política",
      economy: "Economia",
      culture: "Cultura",
      health: "Saúde",
      ethics: "Ética",
      globalization: "Globalização"
    };
    return themes[theme as keyof typeof themes] || theme;
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: string) => {
    const difficulties = {
      facil: "Fácil",
      medio: "Médio",
      dificil: "Difícil",
      "muito-dificil": "Muito Difícil"
    };
    return difficulties[difficulty as keyof typeof difficulties] || difficulty;
  };

  // Get exam type label
  const getExamTypeLabel = (examType: string) => {
    const examTypes = {
      enem: "ENEM",
      vestibular: "Vestibular",
      concurso: "Concurso",
      simulado: "Simulado",
      custom: "Personalizado"
    };
    return examTypes[examType as keyof typeof examTypes] || examType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Link href={getBackUrl()} data-testid="button-back">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 h-8 px-2 text-xs"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Explorador de Propostas</h1>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href={getBackUrl()} data-testid="button-back">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <Lightbulb className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark-blue">Explorador de Propostas</h1>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-soft-gray">Busque propostas reais de ENEM, vestibulares e concursos do Brasil</p>
            </div>
          </div>
        </div>
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pt-20 sm:pt-32 container mx-auto px-3 sm:px-4 py-3 sm:py-8">

        {/* AI Generation Section */}
        <LiquidGlassCard className="mb-8 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-bright-blue" />
              <h2 className="text-xl font-semibold text-dark-blue">Criar Propostas com Inteligência Artificial</h2>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-dark-blue mb-2">
                  <Lightbulb className="w-4 h-4 inline mr-2" />
                  Contexto para Geração (Opcional)
                </label>
                <p className="text-sm text-blue-700 mb-3 leading-relaxed">
                  Forneça palavras-chave, temas ou até mesmo cole uma proposta existente para a IA gerar variações personalizadas e relevantes.
                </p>
              </div>
              <Textarea
                placeholder="Ex: 'desigualdade social no Brasil', 'impactos da tecnologia na educação', ou cole uma proposta completa para gerar variações..."
                value={generationContext}
                onChange={(e) => setGenerationContext(e.target.value)}
                className="min-h-[120px] border-blue-200 focus:border-blue-400 bg-white resize-y text-sm mb-4"
                data-testid="textarea-generation-context"
              />
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  💡 <span className="font-semibold">Dica:</span> Quanto mais detalhes você fornecer (tema, contexto, palavras-chave), mais personalizada e relevante será a proposta gerada pela IA.
                </p>
              </div>
              
              <Button 
                onClick={handleGenerateNew}
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-bright-blue to-purple-600 hover:from-purple-600 hover:to-bright-blue text-white border-0 h-12 text-base font-semibold shadow-lg"
                data-testid="button-generate"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                <span>{hasShownInitialCacheResults ? "Gerar Mais Propostas" : "Gerar Propostas com IA"}</span>
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Future Exam Detection Message */}
        {searchResults?.futureExamDetected && searchResults.futureExamInfo && (
          <LiquidGlassCard className="mb-6 p-4 sm:p-6 border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800 text-lg mb-2">
                  Prova Futura Detectada
                </h4>
                <p className="text-amber-700 mb-3">
                  {searchResults.futureExamInfo.message}
                </p>
                <div className="text-sm text-amber-600 bg-amber-100 rounded-lg p-3">
                  <span className="font-medium">💡 Dica:</span> As propostas abaixo são de anos anteriores e podem te ajudar a entender o padrão e estilo das questões para se preparar melhor!
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-soft-gray">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Buscando propostas...</span>
            </div>
          </div>
        ) : displayProposals.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-blue">
                {searchResults?.futureExamDetected 
                  ? `${searchResults?.count || 0} propostas relacionadas de anos anteriores`
                  : `${searchResults?.count || 0} propostas encontradas`
                }
              </h3>
              {displayProposals.length > 0 && displayProposals.length >= 10 && (
                <Button
                  onClick={handleLoadMore}
                  disabled={loadMoreMutation.isPending}
                  variant="outline"
                  className="border-bright-blue text-bright-blue hover:bg-bright-blue/5"
                  data-testid="button-load-more"
                >
                  {loadMoreMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  Carregar Mais
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {displayProposals.map((proposal) => (
                <LiquidGlassCard 
                  key={proposal.id} 
                  className="p-6 hover:shadow-lg transition-all"
                  data-testid={`card-proposal-${proposal.id}`}
                >
                  <div className="space-y-4">
                    {/* Header com Badge de Proposta Real ou IA */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        {/* Informações da Prova (para propostas reais) */}
                        {!proposal.isAiGenerated && (proposal.examName || proposal.year) && (
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-semibold text-sm shadow-md">
                              <Trophy className="w-4 h-4" />
                              <span>PROPOSTA REAL DE PROVA</span>
                            </div>
                            {proposal.examName && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm border border-blue-200">
                                <GraduationCap className="w-4 h-4" />
                                <span>{proposal.examName}</span>
                              </div>
                            )}
                            {proposal.year && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium text-sm border border-purple-200">
                                <Calendar className="w-4 h-4" />
                                <span>Ano: {proposal.year}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Badge de IA */}
                        {proposal.isAiGenerated && (
                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm shadow-md">
                              <Sparkles className="w-4 h-4" />
                              Criada por Inteligência Artificial
                            </span>
                          </div>
                        )}
                        
                        {/* Título da Proposta */}
                        <h3 className="text-xl font-bold text-dark-blue leading-tight mb-3">
                          {proposal.title}
                        </h3>
                        
                        {/* Tags de Categoria */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-medium">
                            {getExamTypeLabel(proposal.examType)}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 font-medium">
                            {getThemeLabel(proposal.theme)}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 font-medium">
                            {getDifficultyLabel(proposal.difficulty)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enunciado da Proposta */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span className="font-semibold text-slate-700 text-sm">Enunciado da Proposta:</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {proposal.statement}
                      </p>
                    </div>
                    
                    {/* Textos de Apoio */}
                    {proposal.supportingText && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-lg p-4 border-2 border-blue-200">
                        <div 
                          className="cursor-pointer"
                          onClick={() => toggleSupportingText(proposal.id)}
                          data-testid={`supporting-text-${proposal.id}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-blue-800 text-sm">Textos de Apoio</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              {expandedProposals.has(proposal.id) ? (
                                <>
                                  <span className="text-xs mr-1">Recolher</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs mr-1">Ver Completo</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
                            </Button>
                          </div>
                          <div className={`text-slate-700 text-sm leading-relaxed whitespace-pre-wrap ${expandedProposals.has(proposal.id) ? '' : 'line-clamp-3'}`}>
                            {proposal.supportingText}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer com Ações */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="text-xs text-slate-500">
                        {!proposal.isAiGenerated ? (
                          <span className="font-medium">
                            📚 Proposta utilizada em prova oficial do Brasil
                          </span>
                        ) : (
                          <span className="font-medium">
                            🤖 Proposta gerada por IA baseada em padrões reais
                          </span>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => saveProposalMutation.mutate(proposal.id)}
                        disabled={saveProposalMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                        data-testid={`button-save-${proposal.id}`}
                      >
                        {saveProposalMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <BookmarkPlus className="w-4 h-4 mr-2" />
                        )}
                        Salvar na Biblioteca
                      </Button>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </div>
        ) : (
          <LiquidGlassCard className="text-center py-12">
            <FileText className="w-16 h-16 text-soft-gray/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-blue mb-2">Nenhuma proposta encontrada</h3>
            <p className="text-soft-gray mb-6">
              Tente diferentes termos de busca ou use filtros para encontrar propostas.
            </p>
            <Button 
              onClick={handleGenerateNew}
              disabled={generateMutation.isPending || searchMutation.isPending}
              className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue text-white border-0"
              data-testid="button-generate-empty"
            >
              {(generateMutation.isPending || searchMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {hasShownInitialCacheResults ? "Gerar Mais Opções" : "Gerar Propostas com IA"}
            </Button>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}