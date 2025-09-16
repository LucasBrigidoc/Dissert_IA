import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookOpen, Globe, Users, TrendingUp, Star, Clock, Loader2, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Repertoire } from "@shared/schema";

interface SearchResult {
  results: Repertoire[];
  source: "cache" | "ai";
  count: number;
  analysis?: {
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
  };
}

export default function Repertorio() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPopularity, setSelectedPopularity] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  
  const { toast } = useToast();

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Mutation para salvar repertório na biblioteca pessoal
  const saveRepertoireMutation = useMutation({
    mutationFn: async (repertoireId: string) => {
      return apiRequest(`/api/repertoires/${repertoireId}/save`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Repertório salvo!",
        description: "O repertório foi adicionado à sua biblioteca pessoal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o repertório. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error saving repertoire:", error);
    }
  });
  
  // Sistema inteligente de detecção de origem
  const getBackUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('from');
    const fromSession = sessionStorage.getItem('repertorio-origin');
    const fromPage = fromUrl || fromSession || 'dashboard';
    
    console.log('Detectando origem da página repertório:');
    console.log('- URL param "from":', fromUrl);
    console.log('- SessionStorage "repertorio-origin":', fromSession);
    console.log('- Origem final detectada:', fromPage);
    
    // Salvar a origem atual se vier da URL
    if (fromUrl) {
      sessionStorage.setItem('repertorio-origin', fromUrl);
    }
    
    // Retornar URL correta baseada na origem
    switch (fromPage) {
      case 'functionalities':
        return '/functionalities';
      case 'dashboard':
        return '/dashboard';
      default:
        return '/dashboard'; // fallback seguro
    }
  };
  
  const backUrl = getBackUrl();

  // Search mutation for intelligent search
  const searchMutation = useMutation({
    mutationFn: async (query: { query: string; type?: string; category?: string; popularity?: string }) => {
      console.log("🔍 Fazendo busca com:", query);
      const result = await apiRequest("/api/repertoires/search", {
        method: "POST",
        body: query
      });
      console.log("✅ Resultado da busca:", result);
      return result;
    },
    onSuccess: (data: SearchResult) => {
      console.log("🎉 Busca bem-sucedida, atualizando resultados:", data);
      setSearchResults(data);
      // Invalidate cache to ensure new AI-generated repertoires are available in the main list
      if (data.source === "ai") {
        queryClient.invalidateQueries({ queryKey: ["/api/repertoires"] });
      }
    },
    onError: (error) => {
      console.error("❌ Erro na busca:", error);
    }
  });

  // Load more mutation for getting additional repertoires
  const loadMoreMutation = useMutation({
    mutationFn: async (query: { query: string; type?: string; category?: string; popularity?: string; excludeIds: string[] }) => {
      console.log("📚 Carregando mais repertórios:", query);
      const result = await apiRequest("/api/repertoires/search", {
        method: "POST",
        body: query
      });
      console.log("✅ Mais repertórios carregados:", result);
      return result;
    },
    onSuccess: (data: SearchResult) => {
      console.log("🎉 Novos repertórios adicionados");
      if (searchResults) {
        // Merge new results with existing ones, avoiding duplicates
        const existingIds = new Set(searchResults.results.map(r => r.id));
        const newResults = data.results.filter(r => !existingIds.has(r.id));
        
        setSearchResults({
          ...searchResults,
          results: [...searchResults.results, ...newResults],
          count: searchResults.count + newResults.length
        });
      }
      // Invalidate cache when new AI-generated repertoires are loaded
      if (data.source === "ai") {
        queryClient.invalidateQueries({ queryKey: ["/api/repertoires"] });
      }
    },
    onError: (error) => {
      console.error("❌ Erro ao carregar mais repertórios:", error);
    }
  });

  // Load initial repertoires
  const { data: initialRepertoires, isLoading: isLoadingInitial } = useQuery({
    queryKey: ["/api/repertoires"],
    queryFn: () => apiRequest("/api/repertoires"),
    select: (data) => {
      console.log("📥 Dados recebidos da API:", data);
      return data.results as Repertoire[];
    }
  });

  const handleSearch = () => {
    // Clear any existing search results to avoid cache conflicts
    setSearchResults(null);
    
    // If there's a search query, do normal search
    if (searchQuery.trim()) {
      const query = {
        query: searchQuery,
        type: selectedType !== "all" ? selectedType : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        popularity: selectedPopularity !== "all" ? selectedPopularity : undefined
      };
      
      console.log("🚀 Iniciando busca com query:", query);
      searchMutation.mutate(query);
    }
    // If no search query but a type is selected, search both cache and AI
    else if (selectedType !== "all") {
      console.log("🔍 Botão clicado com tipo selecionado, buscando cache + IA");
      handleSearchWithTypeAndAI();
    }
    else {
      console.log("⚠️ Busca vazia e nenhum tipo selecionado");
      return;
    }
  };

  // Search both cache and AI when type is selected and search button is clicked
  const handleSearchWithTypeAndAI = () => {
    if (!initialRepertoires) return;
    
    // Filter initial repertoires by selected type (cache search)
    const filteredFromCache = initialRepertoires.filter((repertoire) => {
      if (selectedType !== "all" && repertoire.type !== selectedType) return false;
      if (selectedCategory !== "all" && repertoire.category !== selectedCategory) return false;
      if (selectedPopularity !== "all" && repertoire.popularity !== selectedPopularity) return false;
      return true;
    });

    console.log(`🔍 Busca manual: encontrados ${filteredFromCache.length} repertórios no cache para o tipo ${selectedType}`);

    // Always show cache results first
    if (filteredFromCache.length > 0) {
      console.log("✅ Mostrando resultados do cache");
      setSearchResults({
        results: filteredFromCache,
        source: "cache",
        count: filteredFromCache.length
      });
    }
    
    // Then search AI for additional results (always, regardless of cache amount)
    console.log("🤖 Buscando IA para expandir resultados");
    setTimeout(() => handleTypeSearchAI(), 200);
  };

  // No auto-search - user must click search button
  // Only reset search results when going back to "all" without search query
  useEffect(() => {
    if (selectedType === "all" && !searchQuery.trim()) {
      setSearchResults(null);
    }
  }, [selectedType, searchQuery]);

  // Handle type selection: check cache first, then AI if needed
  const handleTypeSelection = () => {
    if (!initialRepertoires) return;
    
    // Filter initial repertoires by selected type
    const filteredFromCache = initialRepertoires.filter((repertoire) => {
      if (selectedType !== "all" && repertoire.type !== selectedType) return false;
      if (selectedCategory !== "all" && repertoire.category !== selectedCategory) return false;
      if (selectedPopularity !== "all" && repertoire.popularity !== selectedPopularity) return false;
      return true;
    });

    console.log(`📦 Encontrados ${filteredFromCache.length} repertórios no cache para o tipo ${selectedType}`);

    // If we have enough from cache (at least 4), show them
    if (filteredFromCache.length >= 4) {
      console.log("✅ Cache suficiente, mostrando resultados do cache");
      setSearchResults({
        results: filteredFromCache,
        source: "cache",
        count: filteredFromCache.length
      });
    }
    // If we have some but not enough, show them and auto-load more from AI
    else if (filteredFromCache.length > 0) {
      console.log("⚠️ Cache insuficiente, mostrando cache + busca IA");
      setSearchResults({
        results: filteredFromCache,
        source: "cache",
        count: filteredFromCache.length
      });
      // Auto-trigger AI search to get more
      setTimeout(() => handleTypeSearchAI(), 100);
    }
    // If no cache results, go directly to AI
    else {
      console.log("❌ Nenhum resultado no cache, usando IA");
      handleTypeSearchAI();
    }
  };

  // Search for repertoires of a specific type using AI
  const handleTypeSearchAI = () => {
    const searchTerm = typeLabels[selectedType] || selectedType;
    
    // Exclude already shown repertoires
    const excludeIds = searchResults?.results.map(r => r.id) || [];
    
    const query = {
      query: searchTerm,
      type: selectedType !== "all" ? selectedType : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      popularity: selectedPopularity !== "all" ? selectedPopularity : undefined,
      excludeIds: excludeIds.length > 0 ? excludeIds : []
    };
    
    console.log("🤖 Busca IA para completar resultados:", query);
    
    // Use loadMoreMutation to append results instead of replacing
    if (searchResults && searchResults.results.length > 0) {
      loadMoreMutation.mutate(query);
    } else {
      searchMutation.mutate(query);
    }
  };

  // Apply client-side filtering based on selected filters
  const getFilteredRepertoires = () => {
    // If we have search results, show them as-is (server already handled filtering)
    if (searchResults?.results) {
      console.log("🎯 Resultados de busca atualizados:", searchResults);
      return searchResults.results;
    }
    
    // Only apply client-side filtering to initial repertoires when no search is active
    const baseRepertoires = initialRepertoires || [];
    
    return baseRepertoires.filter((repertoire) => {
      // Filter by type
      if (selectedType !== "all" && repertoire.type !== selectedType) {
        return false;
      }
      
      // Filter by category
      if (selectedCategory !== "all" && repertoire.category !== selectedCategory) {
        return false;
      }
      
      // Filter by popularity
      if (selectedPopularity !== "all" && repertoire.popularity !== selectedPopularity) {
        return false;
      }
      
      return true;
    });
  };

  const displayRepertoires = getFilteredRepertoires();
  const isLoading = searchMutation.isPending || isLoadingInitial || loadMoreMutation.isPending;

  // Auto-load more repertoires to ensure minimum 4 results
  const [autoLoadCompleted, setAutoLoadCompleted] = useState(false);
  
  useEffect(() => {
    if (searchResults && displayRepertoires.length < 4 && displayRepertoires.length > 0 && 
        !loadMoreMutation.isPending && !autoLoadCompleted) {
      console.log("🤖 Garantindo 4 repertórios mínimos, buscando mais automaticamente...");
      setAutoLoadCompleted(true);
      handleLoadMore();
    }
  }, [searchResults, displayRepertoires.length, autoLoadCompleted]);
  
  // Reset auto-load flag when new search is made
  useEffect(() => {
    setAutoLoadCompleted(false);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (loadMoreMutation.isPending) return;
    
    // Get existing IDs from current displayed repertoires (works for both search and initial)
    const existingIds = displayRepertoires.map(r => r.id);
    
    // Check if there's an active search (searchQuery or specific type selected)
    const hasActiveSearch = searchQuery.trim() || selectedType !== "all";
    
    let query;
    
    if (hasActiveSearch) {
      // Behavior with active search: load more results related to the search
      const baseQuery = searchQuery.trim() || (selectedType !== "all" ? 
        (typeLabels[selectedType] || selectedType) : "");
      
      query = {
        query: baseQuery,
        type: selectedType !== "all" ? selectedType : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        popularity: selectedPopularity !== "all" ? selectedPopularity : undefined,
        excludeIds: existingIds.length > 0 ? existingIds : []
      };
    } else {
      // Behavior without active search: load more general varied repertoires from cache/AI
      query = {
        query: "repertórios educacionais variados para redação",
        excludeIds: existingIds.length > 0 ? existingIds : []
      };
    }
    
    console.log(hasActiveSearch ? "🔍 Carregando mais resultados da busca" : "📚 Carregando repertórios variados", query);
    loadMoreMutation.mutate(query);
  };

  // Define typeLabels here so it's accessible
  const typeLabels: { [key: string]: string } = {
    movies: "filmes populares para redação",
    laws: "leis importantes para redação",
    books: "livros clássicos para redação",
    news: "notícias relevantes para redação",
    events: "acontecimentos históricos para redação",
    music: "músicas e artistas para redação",
    series: "séries populares para redação",
    documentaries: "documentários importantes para redação",
    research: "pesquisas acadêmicas para redação",
    data: "dados estatísticos para redação"
  };

  // Debug logging removed to improve performance

  // Debug logs para acompanhar o estado (só quando há mudanças importantes)
  useEffect(() => {
    if (initialRepertoires && initialRepertoires.length > 0) {
      console.log("✅ Repertórios iniciais carregados:", initialRepertoires.length, "itens");
    }
  }, [initialRepertoires]);

  useEffect(() => {
    if (searchResults) {
      console.log("🎯 Resultados de busca atualizados:", searchResults);
    }
  }, [searchResults]);

  // Helper functions
  const getTypeIcon = (type: string) => {
    const icons = {
      books: BookOpen,
      laws: Users,
      movies: Globe,
      research: TrendingUp,
      news: Globe,
      events: Users,
      music: Globe,
      series: Globe,
      documentaries: Globe,
      data: TrendingUp
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      books: "Literatura",
      laws: "Legislação", 
      movies: "Cinema",
      research: "Pesquisa",
      news: "Notícias",
      events: "Acontecimentos",
      music: "Música",
      series: "Séries",
      documentaries: "Documentários",
      data: "Dados"
    };
    return labels[type as keyof typeof labels] || "Geral";
  };

  const getPopularityColor = (popularity: string) => {
    const colors = {
      "very-popular": "from-red-500 to-orange-500",
      "popular": "from-bright-blue to-dark-blue", 
      "moderate": "from-green-500 to-blue-500",
      "uncommon": "from-purple-500 to-pink-500",
      "rare": "from-yellow-500 to-orange-500"
    };
    return colors[popularity as keyof typeof colors] || "from-bright-blue to-dark-blue";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Link href={backUrl} data-testid="button-back">
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
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Search className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Explorador de Repertório</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href={backUrl} data-testid="button-back">
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
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Search className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Explorador de Repertório</h1>
              </div>
            </div>
            <p className="text-soft-gray">Descubra referências para enriquecer suas redações</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-16 sm:pt-24">
        {/* Search Bar - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="space-y-4">
              {/* Header Section */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Search className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-dark-blue text-sm sm:text-base">Buscar Repertório</h3>
                  <p className="text-xs text-soft-gray hidden sm:block">Busque por proposta de redação, tema específico ou qualquer palavra-chave</p>
                </div>
              </div>
              
              {/* Search Form - Mobile First */}
              <div className="space-y-3 sm:space-y-4">
                {/* Search Input */}
                <div className="w-full">
                  <Input 
                    placeholder="Digite tema, palavra-chave ou cole sua proposta..."
                    className="border-bright-blue/20 focus:border-bright-blue text-sm sm:text-base h-10 sm:h-12 w-full"
                    data-testid="input-main-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <p className="text-xs text-soft-gray mt-1 sm:hidden">
                    💡 Cole sua proposta ou digite palavras-chave
                  </p>
                  <p className="text-xs text-soft-gray mt-1 hidden sm:block">
                    💡 Dica: Cole sua proposta de redação completa ou digite palavras-chave
                  </p>
                </div>
                
                {/* Filters and Button Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <Select value={selectedType} onValueChange={setSelectedType} data-testid="select-type">
                      <SelectTrigger className="border-bright-blue/20 h-10 sm:h-12 text-sm sm:text-base">
                        <SelectValue placeholder="🎯 Tipo de Repertório" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="movies">📽️ Filmes</SelectItem>
                        <SelectItem value="laws">⚖️ Leis</SelectItem>
                        <SelectItem value="books">📚 Livros</SelectItem>
                        <SelectItem value="news">📰 Notícias</SelectItem>
                        <SelectItem value="events">📅 Acontecimentos</SelectItem>
                        <SelectItem value="music">🎵 Música</SelectItem>
                        <SelectItem value="series">📺 Séries</SelectItem>
                        <SelectItem value="documentaries">🎬 Documentários</SelectItem>
                        <SelectItem value="research">🔬 Pesquisas</SelectItem>
                        <SelectItem value="data">📊 Dados/Estatísticas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base flex-shrink-0" 
                    data-testid="button-search"
                    onClick={handleSearch}
                    disabled={(!searchQuery.trim() && selectedType === "all") || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={14} />
                        <span className="hidden sm:inline">Buscando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={14} />
                        <span className="hidden sm:inline">Buscar Repertórios</span>
                        <span className="sm:hidden">Buscar</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Results */}
        <div className="space-y-4 sm:space-y-6">
          {/* Results Header - Mobile Optimized */}
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-3 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-dark-blue">
                {searchResults ? "Resultados da Busca" : "Repertórios Disponíveis"}
              </h2>
              {searchResults && (
                <div className="flex items-center space-x-2">
                  {searchResults.source === "cache" ? (
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                      <Clock size={10} />
                      <span>Cache</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs">
                      <Sparkles size={10} />
                      <span>IA</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-xs sm:text-sm text-soft-gray flex-shrink-0 text-right">
              <span className="block sm:hidden">{displayRepertoires.length}</span>
              <span className="hidden sm:block">{displayRepertoires.length} referências {searchResults ? "encontradas" : "disponíveis"}</span>
            </div>
          </div>

          {/* Result Cards - Mobile Optimized */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="flex items-center space-x-3 text-bright-blue">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-base sm:text-lg">Buscando repertórios...</span>
              </div>
            </div>
          ) : displayRepertoires.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {displayRepertoires.map((repertoire, index) => {
                const IconComponent = getTypeIcon(repertoire.type);
                const gradientClass = getPopularityColor(repertoire.popularity);
                
                return (
                  <LiquidGlassCard key={repertoire.id} className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 p-4 sm:p-6">
                    {/* Header with Icon and Type */}
                    <div className="flex items-start justify-between mb-3 sm:mb-3">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="text-white" size={12} />
                        </div>
                        <span className="text-xs bg-bright-blue/20 text-bright-blue px-2 py-1 rounded whitespace-nowrap">
                          {getTypeLabel(repertoire.type)}
                        </span>
                      </div>
                      {/* Year info moved to top on mobile */}
                      <div className="flex sm:hidden items-center space-x-1 text-xs text-soft-gray flex-shrink-0">
                        <Clock size={10} />
                        <span>{repertoire.year || "N/A"}</span>
                      </div>
                    </div>
                    
                    {/* Title - Better spacing */}
                    <div className="mb-3 sm:mb-4">
                      <h3 className="font-semibold text-dark-blue text-sm sm:text-base leading-tight line-clamp-2">{repertoire.title}</h3>
                    </div>
                    
                    {/* Description - Better spacing and readability */}
                    <div className="mb-4 sm:mb-5">
                      <p className="text-soft-gray text-xs sm:text-sm leading-relaxed">
                        <span className="sm:hidden">
                          {repertoire.description.length > 90 
                            ? `${repertoire.description.substring(0, 90)}...`
                            : repertoire.description}
                        </span>
                        <span className="hidden sm:block">{repertoire.description}</span>
                      </p>
                    </div>
                    
                    {/* Footer - Mobile optimized */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Year only shows on desktop now */}
                      <div className="hidden sm:flex items-center space-x-2 text-xs text-soft-gray">
                        <Clock size={12} />
                        <span>{repertoire.year || "N/A"}</span>
                      </div>
                      
                      {/* Mobile: Full width button */}
                      <div className="sm:hidden w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 text-sm w-full h-9 font-medium" 
                          data-testid={`button-save-reference-${index + 1}`}
                          onClick={() => saveRepertoireMutation.mutate(repertoire.id)}
                          disabled={saveRepertoireMutation.isPending}
                        >
                          {saveRepertoireMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" size={14} />
                              Salvando...
                            </>
                          ) : (
                            "Salvar Repertório"
                          )}
                        </Button>
                      </div>
                      
                      {/* Desktop: Compact button */}
                      <div className="hidden sm:block">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 text-sm h-8 px-3" 
                          data-testid={`button-save-reference-${index + 1}`}
                          onClick={() => saveRepertoireMutation.mutate(repertoire.id)}
                          disabled={saveRepertoireMutation.isPending}
                        >
                          {saveRepertoireMutation.isPending ? (
                            <>
                              <Loader2 className="mr-1 animate-spin" size={12} />
                              Salvando...
                            </>
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                      </div>
                    </div>
                  </LiquidGlassCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Search className="text-gray-400" size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhum repertório encontrado</h3>
              <p className="text-sm sm:text-base text-gray-500">Tente ajustar sua busca ou usar palavras-chave diferentes.</p>
            </div>
          )}

          {/* Load More - Mobile Optimized */}
          {displayRepertoires.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3" 
                data-testid="button-load-more"
                onClick={handleLoadMore}
                disabled={loadMoreMutation.isPending}
              >
                {loadMoreMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={14} />
                    <span className="hidden sm:inline">Buscando Mais...</span>
                    <span className="sm:hidden">Buscando...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Carregar Mais Resultados</span>
                    <span className="sm:hidden">Carregar Mais</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}