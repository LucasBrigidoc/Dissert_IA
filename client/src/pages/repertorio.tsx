import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, BookOpen, Globe, Users, TrendingUp, Star, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Repertorio() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-soft-gray hover:text-bright-blue" data-testid="button-back">
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <Search className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Explorador de Repertório</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Descubra referências para enriquecer suas redações
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Search and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Search className="text-white" size={14} />
                </div>
                <h3 className="font-semibold text-dark-blue">Buscar</h3>
              </div>
              
              <div className="space-y-4">
                <Input 
                  placeholder="Digite um tema ou palavra-chave"
                  className="border-bright-blue/20 focus:border-bright-blue"
                  data-testid="input-search"
                />
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Categoria</label>
                  <Select data-testid="select-category">
                    <SelectTrigger className="border-bright-blue/20">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="history">História</SelectItem>
                      <SelectItem value="literature">Literatura</SelectItem>
                      <SelectItem value="science">Ciência</SelectItem>
                      <SelectItem value="society">Sociedade</SelectItem>
                      <SelectItem value="technology">Tecnologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Período</label>
                  <Select data-testid="select-period">
                    <SelectTrigger className="border-bright-blue/20">
                      <SelectValue placeholder="Qualquer época" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer época</SelectItem>
                      <SelectItem value="ancient">Antiguidade</SelectItem>
                      <SelectItem value="medieval">Idade Média</SelectItem>
                      <SelectItem value="modern">Idade Moderna</SelectItem>
                      <SelectItem value="contemporary">Contemporâneo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" data-testid="button-search">
                  <Search className="mr-2" size={16} />
                  Buscar Repertório
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Quick Categories */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <h4 className="font-semibold text-dark-blue mb-4">Categorias Populares</h4>
              
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm text-dark-blue hover:bg-bright-blue/10 rounded" data-testid="button-category-tech">
                  🤖 Tecnologia e IA
                </button>
                <button className="w-full text-left p-2 text-sm text-dark-blue hover:bg-bright-blue/10 rounded" data-testid="button-category-environment">
                  🌱 Meio Ambiente
                </button>
                <button className="w-full text-left p-2 text-sm text-dark-blue hover:bg-bright-blue/10 rounded" data-testid="button-category-education">
                  📚 Educação
                </button>
                <button className="w-full text-left p-2 text-sm text-dark-blue hover:bg-bright-blue/10 rounded" data-testid="button-category-social">
                  👥 Questões Sociais
                </button>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
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
    </div>
  );
}