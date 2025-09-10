import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, FileText, Calendar, Sparkles, BookOpen, Star, Clock, Loader2, Trophy, GraduationCap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Proposal } from "@shared/schema";

interface SearchResult {
  results: Proposal[];
  count: number;
  query?: string;
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
  
  const { toast } = useToast();
  
  // Mutation para salvar proposta na biblioteca pessoal
  const saveProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest(`/api/proposals/${proposalId}/save`, {
        method: "POST"
      });
    },
    onSuccess: () => {
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
  
  // Sistema inteligente de detecção de origem
  const getBackUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('from');
    const fromSession = sessionStorage.getItem('propostas-origin');
    const fromPage = fromUrl || fromSession || 'dashboard';
    
    // Salvar a origem atual se vier da URL
    if (fromUrl) {
      sessionStorage.setItem('propostas-origin', fromUrl);
    }
    
    // Retornar URL correta baseada na origem
    switch (fromPage) {
      case 'argumentos':
        return '/argumentos';
      case 'redacao':
        return '/redacao';
      case 'dashboard':
      default:
        return '/';
    }
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
    mutationFn: async (params: { theme: string; difficulty: string; examType: string }) => {
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

    generateMutation.mutate({ theme, difficulty, examType });
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={getBackUrl()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-soft-gray hover:text-dark-blue hover:bg-bright-blue/10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bright-blue/10">
              <FileText className="w-6 h-6 text-bright-blue" />
            </div>
            <h1 className="text-3xl font-bold text-dark-blue">Explorador de Propostas</h1>
          </div>
        </div>

        {/* Search Section */}
        <LiquidGlassCard className="mb-8 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-bright-blue" />
              <h2 className="text-xl font-semibold text-dark-blue">Buscar Propostas de Redação</h2>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Digite o tema, palavras-chave ou tipo de exame..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-soft-gray/30 focus:border-bright-blue"
                  data-testid="input-search"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                data-testid="button-search"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-soft-gray mb-2">Tipo de Exame</label>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger className="border-soft-gray/30 focus:border-bright-blue" data-testid="select-exam-type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="enem">ENEM</SelectItem>
                    <SelectItem value="vestibular">Vestibular</SelectItem>
                    <SelectItem value="concurso">Concurso</SelectItem>
                    <SelectItem value="simulado">Simulado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-soft-gray mb-2">Tema</label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="border-soft-gray/30 focus:border-bright-blue" data-testid="select-theme">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os temas</SelectItem>
                    <SelectItem value="social">Sociedade</SelectItem>
                    <SelectItem value="environment">Meio Ambiente</SelectItem>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="politics">Política</SelectItem>
                    <SelectItem value="economy">Economia</SelectItem>
                    <SelectItem value="culture">Cultura</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-soft-gray mb-2">Dificuldade</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="border-soft-gray/30 focus:border-bright-blue" data-testid="select-difficulty">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                    <SelectItem value="muito-dificil">Muito Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateNew}
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue text-white border-0"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Gerar IA
                </Button>
              </div>
            </div>
          </div>
        </LiquidGlassCard>

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
                {searchResults?.count || 0} propostas encontradas
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayProposals.map((proposal) => (
                <LiquidGlassCard 
                  key={proposal.id} 
                  className="p-6 hover:scale-[1.02] transition-transform cursor-pointer"
                  data-testid={`card-proposal-${proposal.id}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-dark-blue text-lg leading-tight">
                          {proposal.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {getExamTypeLabel(proposal.examType)}
                          </span>
                          <span className="text-sm px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                            {getThemeLabel(proposal.theme)}
                          </span>
                          <span className="text-sm px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {getDifficultyLabel(proposal.difficulty)}
                          </span>
                        </div>
                      </div>
                      
                      {proposal.rating && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">{proposal.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-3">
                      <p className="text-soft-gray text-sm leading-relaxed line-clamp-3">
                        {proposal.statement}
                      </p>
                      
                      {proposal.supportingText && (
                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                          <p className="text-soft-gray text-xs leading-relaxed line-clamp-2">
                            <span className="font-medium text-bright-blue">Texto de apoio:</span> {proposal.supportingText}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-soft-gray/20">
                      <div className="flex items-center gap-4 text-xs text-soft-gray/70">
                        {proposal.examName && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>{proposal.examName}</span>
                          </div>
                        )}
                        {proposal.year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{proposal.year}</span>
                          </div>
                        )}
                        {proposal.isAiGenerated && (
                          <div className="flex items-center gap-1 text-purple-400">
                            <Sparkles className="w-3 h-3" />
                            <span>IA</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => saveProposalMutation.mutate(proposal.id)}
                        disabled={saveProposalMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                        data-testid={`button-save-${proposal.id}`}
                      >
                        {saveProposalMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <BookOpen className="w-3 h-3" />
                        )}
                        Salvar
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
              disabled={generateMutation.isPending}
              className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue text-white border-0"
              data-testid="button-generate-empty"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Gerar Propostas com IA
            </Button>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}