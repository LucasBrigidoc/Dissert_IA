import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, FileText, Calendar, BookOpen, Target, Filter, ArrowLeft, Eye, Edit, Download, Star, Trophy, School, Building } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PropostasPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Estados para criação de propostas
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    context: "",
    supportText: "",
    category: "",
    difficulty: ""
  });

  // Estados para busca
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedSource, setSelectedSource] = useState("todas");

  // Estado para expandir/compactar o formulário de criação
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Mock data para propostas existentes
  const mockProposals = [
    {
      id: 1,
      title: "A importância da leitura na formação cidadã",
      description: "Redija um texto dissertativo-argumentativo sobre o papel da leitura na formação de cidadãos críticos e conscientes.",
      context: "No Brasil, apenas 52% da população tem o hábito de ler regularmente. Como a leitura pode contribuir para formar cidadãos mais críticos?",
      supportText: "A leitura desenvolve o pensamento crítico, amplia o vocabulário e proporciona conhecimento cultural diversificado.",
      category: "Educação",
      difficulty: "Média",
      source: "ENEM 2023",
      year: "2023",
      institution: "INEP",
      tags: ["educação", "cidadania", "leitura", "crítica"]
    },
    {
      id: 2,
      title: "Tecnologia e relações humanas na era digital",
      description: "Discuta os impactos positivos e negativos da tecnologia nas relações interpessoais contemporâneas.",
      context: "As redes sociais conectam pessoas globalmente, mas também podem causar isolamento social. Como equilibrar tecnologia e relacionamentos?",
      supportText: "Estudos indicam que 70% dos jovens preferem comunicação digital, mas relatam sentir-se mais sozinhos que gerações anteriores.",
      category: "Sociedade",
      difficulty: "Alta",
      source: "Vestibular UNICAMP",
      year: "2024",
      institution: "UNICAMP",
      tags: ["tecnologia", "relações", "digital", "sociedade"]
    },
    {
      id: 3,
      title: "Sustentabilidade urbana e qualidade de vida",
      description: "Analise os desafios da sustentabilidade em grandes centros urbanos e proposte soluções viáveis.",
      context: "Cidades concentram 85% da população brasileira, mas enfrentam problemas de poluição, mobilidade e gestão de resíduos.",
      supportText: "Conceitos como cidade inteligente, mobilidade urbana sustentável e economia circular são fundamentais para o futuro urbano.",
      category: "Meio Ambiente",
      difficulty: "Alta",
      source: "Concurso Público",
      year: "2024",
      institution: "Prefeitura SP",
      tags: ["sustentabilidade", "urbano", "meio ambiente", "cidades"]
    },
    {
      id: 4,
      title: "O papel da juventude na transformação social",
      description: "Redija sobre como os jovens podem ser agentes de mudança social positiva no Brasil.",
      context: "Jovens de 16 a 29 anos representam 25% da população brasileira. Como essa geração pode contribuir para mudanças sociais?",
      supportText: "Movimentos estudantis históricos como o de 1968 e mais recentemente os protestos de 2013 mostram o poder transformador da juventude.",
      category: "Sociedade",
      difficulty: "Média",
      source: "ENEM 2022",
      year: "2022",
      institution: "INEP",
      tags: ["juventude", "sociedade", "mudança", "política"]
    }
  ];

  // Filtrar propostas
  const filteredProposals = mockProposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "todas" || proposal.category === selectedCategory;
    const matchesSource = selectedSource === "todas" || proposal.source.includes(selectedSource);
    
    return matchesSearch && matchesCategory && matchesSource;
  });

  const handleCreateProposal = () => {
    if (!newProposal.title || !newProposal.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha pelo menos o título e descrição da proposta.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Proposta criada com sucesso!",
      description: `"${newProposal.title}" foi adicionada à sua biblioteca.`,
    });

    setNewProposal({
      title: "",
      description: "",
      context: "",
      supportText: "",
      category: "",
      difficulty: ""
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Fácil": return "bg-green-100 text-green-800 border-green-200";
      case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Alta": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes("ENEM")) return <Trophy className="text-yellow-600" size={16} />;
    if (source.includes("Vestibular")) return <School className="text-blue-600" size={16} />;
    if (source.includes("Concurso")) return <Building className="text-purple-600" size={16} />;
    return <FileText className="text-gray-600" size={16} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={() => setLocation("/functionalities")}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Explorador de Propostas</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Crie e explore temas para praticar
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        {/* Formulário de Criação */}
        <LiquidGlassCard className="mb-8 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-create-proposal">
            <div 
              className="flex items-center justify-between mb-6 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-3">
                  <Plus className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark-blue">Criar Nova Proposta</h2>
                  <p className="text-soft-gray">Elabore um tema de redação personalizado</p>
                </div>
              </div>
              <div className="text-bright-blue">
                {isFormExpanded ? "−" : "+"}
              </div>
            </div>

            {isFormExpanded && (
            <>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-dark-blue">
                    Título da Proposta *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: A influência das redes sociais na democracia"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                    data-testid="input-proposal-title"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-dark-blue">
                    Categoria
                  </Label>
                  <Select onValueChange={(value) => setNewProposal(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-1" data-testid="select-proposal-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="sociedade">Sociedade</SelectItem>
                      <SelectItem value="meio-ambiente">Meio Ambiente</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="politica">Política</SelectItem>
                      <SelectItem value="cultura">Cultura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty" className="text-sm font-medium text-dark-blue">
                    Dificuldade
                  </Label>
                  <Select onValueChange={(value) => setNewProposal(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger className="mt-1" data-testid="select-proposal-difficulty">
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facil">Fácil</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-dark-blue">
                    Descrição/Comando *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Redija um texto dissertativo-argumentativo sobre..."
                    value={newProposal.description}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 min-h-[80px]"
                    data-testid="textarea-proposal-description"
                  />
                </div>

                <div>
                  <Label htmlFor="context" className="text-sm font-medium text-dark-blue">
                    Contexto/Situação
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="Forneça informações contextuais sobre o tema..."
                    value={newProposal.context}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, context: e.target.value }))}
                    className="mt-1 min-h-[60px]"
                    data-testid="textarea-proposal-context"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="supportText" className="text-sm font-medium text-dark-blue">
                Texto de Apoio
              </Label>
              <Textarea
                id="supportText"
                placeholder="Adicione textos, dados, estatísticas ou referências que podem ajudar na escrita..."
                value={newProposal.supportText}
                onChange={(e) => setNewProposal(prev => ({ ...prev, supportText: e.target.value }))}
                className="mt-1 min-h-[100px]"
                data-testid="textarea-proposal-support"
              />
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={handleCreateProposal}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white"
                data-testid="button-save-proposal"
              >
                <Plus size={16} className="mr-2" />
                Criar Proposta
              </Button>
            </div>
            </>
            )}
          </LiquidGlassCard>

        {/* Filtros e Busca */}
        <LiquidGlassCard className="mb-8 bg-white/80 border-gray-200/50" data-testid="card-search-filters">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-3">
              <Search className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-blue">Explorar Propostas</h2>
              <p className="text-soft-gray">Encontre temas de redação de provas e concursos</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium text-dark-blue">
                Buscar por título ou tema
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-gray" size={16} />
                <Input
                  id="search"
                  placeholder="Ex: tecnologia, educação, meio ambiente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-proposals"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-dark-blue">
                Categoria
              </Label>
              <Select onValueChange={setSelectedCategory} defaultValue="todas">
                <SelectTrigger className="mt-1" data-testid="select-filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Sociedade">Sociedade</SelectItem>
                  <SelectItem value="Meio Ambiente">Meio Ambiente</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Política">Política</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source" className="text-sm font-medium text-dark-blue">
                Origem
              </Label>
              <Select onValueChange={setSelectedSource} defaultValue="todas">
                <SelectTrigger className="mt-1" data-testid="select-filter-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as fontes</SelectItem>
                  <SelectItem value="ENEM">ENEM</SelectItem>
                  <SelectItem value="Vestibular">Vestibulares</SelectItem>
                  <SelectItem value="Concurso">Concursos Públicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-soft-gray">
            <p>{filteredProposals.length} proposta(s) encontrada(s)</p>
            <Button variant="outline" size="sm" className="flex items-center space-x-2" data-testid="button-advanced-filters">
              <Filter size={14} />
              <span>Filtros Avançados</span>
            </Button>
          </div>
        </LiquidGlassCard>

        {/* Lista de Propostas */}
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <LiquidGlassCard 
              key={proposal.id} 
              className="bg-white/90 border-gray-200/50 hover:border-bright-blue/30 transition-all duration-200 group"
              data-testid={`card-proposal-${proposal.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getSourceIcon(proposal.source)}
                    <h3 className="text-lg font-semibold text-dark-blue group-hover:text-bright-blue transition-colors">
                      {proposal.title}
                    </h3>
                  </div>
                  <p className="text-soft-gray text-sm mb-3 leading-relaxed">
                    {proposal.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className={getDifficultyColor(proposal.difficulty)}>
                      {proposal.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                      {proposal.category}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {proposal.source} {proposal.year}
                    </Badge>
                  </div>

                  {proposal.context && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-dark-blue mb-1">Contexto:</p>
                      <p className="text-sm text-soft-gray">{proposal.context}</p>
                    </div>
                  )}

                  {proposal.supportText && (
                    <div className="bg-bright-blue/5 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-dark-blue mb-1">Texto de Apoio:</p>
                      <p className="text-sm text-soft-gray">{proposal.supportText}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {proposal.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-2 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                    data-testid={`button-use-proposal-${proposal.id}`}
                  >
                    <Edit size={14} />
                    <span>Usar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-2 text-soft-gray border-soft-gray/30 hover:bg-gray-50"
                    data-testid={`button-view-proposal-${proposal.id}`}
                  >
                    <Eye size={14} />
                    <span>Ver</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-2 text-soft-gray border-soft-gray/30 hover:bg-gray-50"
                    data-testid={`button-save-proposal-${proposal.id}`}
                  >
                    <Star size={14} />
                    <span>Salvar</span>
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <LiquidGlassCard className="text-center py-12 bg-gray-50/50" data-testid="card-no-results">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-dark-blue mb-2">Nenhuma proposta encontrada</h3>
            <p className="text-soft-gray mb-4">Tente ajustar os filtros ou criar uma nova proposta</p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-bright-blue to-dark-blue text-white"
              data-testid="button-scroll-to-create"
            >
              <Plus size={16} className="mr-2" />
              Ir para Formulário
            </Button>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}