import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookOpen, Globe, Users, TrendingUp, Star, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Repertorio() {
  const [location] = useLocation();
  
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
                  />
                  <p className="text-xs text-soft-gray mt-1">
                    💡 Dica: Cole sua proposta de redação completa ou digite palavras-chave
                  </p>
                </div>
                
                <div>
                  <Select data-testid="select-type">
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
                
                <Button className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue h-12" data-testid="button-search">
                  <Search className="mr-2" size={16} />
                  Buscar Repertórios
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
                    <Select data-testid="select-category">
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
                    <Select data-testid="select-popularity">
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
            <h2 className="text-xl font-semibold text-dark-blue">Resultados da Busca</h2>
            <div className="text-sm text-soft-gray">247 referências encontradas</div>
          </div>

          {/* Result Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Result 1 */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <BookOpen className="text-white" size={14} />
                  </div>
                  <span className="text-xs bg-bright-blue/20 text-bright-blue px-2 py-1 rounded">Literatura</span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs">4.8</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-dark-blue mb-2">1984 - George Orwell</h3>
              <p className="text-soft-gray text-sm mb-3">Distopia que aborda temas como vigilância estatal, manipulação da informação e controle social. Ideal para redações sobre tecnologia, privacidade e liberdade.</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-soft-gray">
                  <Clock size={12} />
                  <span>Século XX</span>
                </div>
                <Button variant="outline" size="sm" className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10" data-testid="button-save-reference-1">
                  Salvar
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Result 2 */}
            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                    <Users className="text-white" size={14} />
                  </div>
                  <span className="text-xs bg-dark-blue/20 text-dark-blue px-2 py-1 rounded">História</span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs">4.9</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-dark-blue mb-2">Declaração Universal dos Direitos Humanos</h3>
              <p className="text-soft-gray text-sm mb-3">Marco histórico de 1948 que estabelece direitos fundamentais. Excelente referência para temas sobre dignidade humana, igualdade e justiça social.</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-soft-gray">
                  <Clock size={12} />
                  <span>1948</span>
                </div>
                <Button variant="outline" size="sm" className="text-dark-blue border-dark-blue/30 hover:bg-dark-blue/10" data-testid="button-save-reference-2">
                  Salvar
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Result 3 */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={14} />
                  </div>
                  <span className="text-xs bg-soft-gray/20 text-dark-blue px-2 py-1 rounded">Ciência</span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs">4.7</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-dark-blue mb-2">Revolução Industrial 4.0</h3>
              <p className="text-soft-gray text-sm mb-3">Transformação digital atual com IoT, AI e automação. Perfeito para discussões sobre futuro do trabalho, inovação e impactos socioeconômicos.</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-soft-gray">
                  <Clock size={12} />
                  <span>Século XXI</span>
                </div>
                <Button variant="outline" size="sm" className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10" data-testid="button-save-reference-3">
                  Salvar
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Result 4 */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <Globe className="text-white" size={14} />
                  </div>
                  <span className="text-xs bg-bright-blue/20 text-bright-blue px-2 py-1 rounded">Sociedade</span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs">4.6</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-dark-blue mb-2">Lei Maria da Penha</h3>
              <p className="text-soft-gray text-sm mb-3">Marco legal brasileiro de 2006 no combate à violência doméstica. Essencial para redações sobre direitos das mulheres e violência de gênero.</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-soft-gray">
                  <Clock size={12} />
                  <span>2006</span>
                </div>
                <Button variant="outline" size="sm" className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10" data-testid="button-save-reference-4">
                  Salvar
                </Button>
              </div>
            </LiquidGlassCard>
          </div>

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