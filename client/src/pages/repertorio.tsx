import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookOpen, Globe, Users, TrendingUp, Star, Clock, Loader2, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
    },
    onError: (error) => {
      console.error("❌ Erro na busca:", error);
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
    if (!searchQuery.trim()) {
      console.log("⚠️ Busca vazia, ignorando");
      return;
    }
    
    const query = {
      query: searchQuery,
      type: selectedType !== "all" ? selectedType : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      popularity: selectedPopularity !== "all" ? selectedPopularity : undefined
    };
    
    console.log("🚀 Iniciando busca com query:", query);
    searchMutation.mutate(query);
  };

  // Apply client-side filtering based on selected filters
  const getFilteredRepertoires = () => {
    const baseRepertoires = searchResults?.results || initialRepertoires || [];
    
    // Always apply client-side filtering when filters are selected
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
  const isLoading = searchMutation.isPending || isLoadingInitial;

  // Debug logging for filtering issues
  useEffect(() => {
    console.log("🔧 DEBUG - Estado dos filtros:", {
      selectedType,
      selectedCategory, 
      selectedPopularity,
      hasSearchResults: !!searchResults,
      searchResultsCount: searchResults?.results?.length || 0,
      initialRepertoiresCount: initialRepertoires?.length || 0,
      displayRepertoiresCount: displayRepertoires.length,
      displayRepertoires: displayRepertoires.map(r => ({ id: r.id, title: r.title, type: r.type }))
    });
  }, [selectedType, selectedCategory, selectedPopularity, searchResults, initialRepertoires, displayRepertoires]);

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
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
      <div className="container mx-auto px-6 py-8 pt-24">
        {/* Search Bar - Full Width */}
        <div className="mb-8">
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Search className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-blue">Buscar Repertório</h3>
                  <p className="text-xs text-soft-gray">Busque por proposta de redação, tema específico ou qualquer palavra-chave</p>
                </div>
              </div>
              
              {/* Campo de Busca Principal */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input 
                    placeholder="Ex: 'Os desafios da democratização do acesso às tecnologias digitais' ou 'meio ambiente', 'fake news', 'George Orwell'..."
                    className="border-bright-blue/20 focus:border-bright-blue text-base h-12"
                    data-testid="input-main-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <p className="text-xs text-soft-gray mt-1">
                    💡 Dica: Cole sua proposta de redação completa ou digite palavras-chave
                  </p>
                </div>
                
                <div>
                  <Select value={selectedType} onValueChange={setSelectedType} data-testid="select-type">
                    <SelectTrigger className="border-bright-blue/20 h-12">
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
                  className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue h-12" 
                  data-testid="button-search"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Search className="mr-2" size={16} />
                  )}
                  {isLoading ? "Buscando..." : "Buscar Repertórios"}
                </Button>
              </div>

              {/* Filtros Avançados (Expandíveis) */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-dark-blue hover:text-bright-blue flex items-center gap-2">
                  <span>Filtros Avançados</span>
                  <span className="transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/30 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">Tema Específico</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="select-category">
                      <SelectTrigger className="border-bright-blue/20">
                        <SelectValue placeholder="Todos os temas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os temas</SelectItem>
                        <SelectItem value="social">Questões Sociais</SelectItem>
                        <SelectItem value="environment">Meio Ambiente</SelectItem>
                        <SelectItem value="technology">Tecnologia e Sociedade</SelectItem>
                        <SelectItem value="education">Educação</SelectItem>
                        <SelectItem value="politics">Política e Cidadania</SelectItem>
                        <SelectItem value="economy">Economia e Trabalho</SelectItem>
                        <SelectItem value="culture">Cultura e Identidade</SelectItem>
                        <SelectItem value="health">Saúde Pública</SelectItem>
                        <SelectItem value="ethics">Ética e Moral</SelectItem>
                        <SelectItem value="globalization">Globalização</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">Popularidade</label>
                    <Select value={selectedPopularity} onValueChange={setSelectedPopularity} data-testid="select-popularity">
                      <SelectTrigger className="border-bright-blue/20">
                        <SelectValue placeholder="Todos os níveis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os níveis</SelectItem>
                        <SelectItem value="very-popular">🔥 Muito populares (mais usados)</SelectItem>
                        <SelectItem value="popular">⭐ Populares (conhecidos)</SelectItem>
                        <SelectItem value="moderate">🎯 Moderadamente conhecidos</SelectItem>
                        <SelectItem value="uncommon">💎 Pouco conhecidos (diferenciados)</SelectItem>
                        <SelectItem value="rare">🏆 Raros (únicos)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-soft-gray mt-1">
                      💡 Repertórios raros podem destacar sua redação
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-dark-blue">
                {searchResults ? "Resultados da Busca" : "Repertórios Disponíveis"}
              </h2>
              {searchResults && (
                <div className="flex items-center space-x-2">
                  {searchResults.source === "cache" ? (
                    <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                      <Clock size={12} />
                      <span>Cache</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs">
                      <Sparkles size={12} />
                      <span>IA</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-soft-gray">
              {displayRepertoires.length} referências {searchResults ? "encontradas" : "disponíveis"}
            </div>
          </div>

          {/* Result Cards */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-bright-blue">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-lg">Buscando repertórios...</span>
              </div>
            </div>
          ) : displayRepertoires.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {displayRepertoires.map((repertoire, index) => {
                const IconComponent = getTypeIcon(repertoire.type);
                const gradientClass = getPopularityColor(repertoire.popularity);
                
                return (
                  <LiquidGlassCard key={repertoire.id} className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center`}>
                          <IconComponent className="text-white" size={14} />
                        </div>
                        <span className="text-xs bg-bright-blue/20 text-bright-blue px-2 py-1 rounded">
                          {getTypeLabel(repertoire.type)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs">{((repertoire.rating || 0) / 10).toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-dark-blue mb-2">{repertoire.title}</h3>
                    <p className="text-soft-gray text-sm mb-3">{repertoire.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-soft-gray">
                        <Clock size={12} />
                        <span>{repertoire.year || "N/A"}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10" 
                        data-testid={`button-save-reference-${index + 1}`}
                      >
                        Salvar
                      </Button>
                    </div>
                  </LiquidGlassCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum repertório encontrado</h3>
              <p className="text-gray-500">Tente ajustar sua busca ou usar palavras-chave diferentes.</p>
            </div>
          )}

          {/* Load More */}
          <div className="flex justify-center">
            <Button variant="outline" className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10" data-testid="button-load-more">
              Carregar Mais Resultados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}