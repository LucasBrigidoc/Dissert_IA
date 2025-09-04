import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, BookOpen, PenTool, Lightbulb, Clock, Target, Archive, Eye, Trash2, ArrowLeft, Newspaper, FolderOpen } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BibliotecaPage() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  // Lógica para voltar inteligente - detecta automaticamente a página anterior
  const getSmartBackUrl = () => {
    // Primeiro, verifica se há um parâmetro 'from' na URL
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    
    if (fromParam === 'functionalities') {
      // Salva que veio de functionalities para futuras navegações
      localStorage.setItem('biblioteca-last-source', 'functionalities');
      return '/functionalities';
    }
    
    // Se não há parâmetro 'from', verifica o localStorage para a última fonte conhecida
    const lastSource = localStorage.getItem('biblioteca-last-source');
    if (lastSource === 'functionalities') {
      return '/functionalities';
    }
    
    // Tenta detectar pela história do navegador
    if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      const referrer = document.referrer;
      if (referrer.includes('/functionalities')) {
        localStorage.setItem('biblioteca-last-source', 'functionalities');
        return '/functionalities';
      }
      if (referrer.includes('/dashboard')) {
        localStorage.setItem('biblioteca-last-source', 'dashboard');
        return '/dashboard';
      }
    }
    
    // Por padrão, volta para dashboard
    localStorage.setItem('biblioteca-last-source', 'dashboard');
    return '/dashboard';
  };
  
  const backUrl = getSmartBackUrl();

  // Mock data para diferentes categorias de arquivos salvos
  const bibliotecaData = {
    repertorios: [
      {
        id: 1,
        title: "Repertório sobre Meio Ambiente",
        category: "Meio Ambiente", 
        date: "2024-01-15",
        size: "1.2 MB",
        type: "Repertório",
        description: "Dados estatísticos e citações sobre sustentabilidade"
      },
      {
        id: 2,
        title: "Repertório Direitos Humanos",
        category: "Sociedade",
        date: "2024-01-10", 
        size: "800 KB",
        type: "Repertório",
        description: "Referências históricas e casos emblemáticos"
      }
    ],
    redacoes: [
      {
        id: 3,
        title: "Redação ENEM 2023 - Tecnologia na Educação",
        category: "Educação",
        date: "2024-01-12",
        size: "450 KB", 
        type: "Redação",
        description: "Dissertação argumentativa sobre impactos da tecnologia",
        grade: 920
      },
      {
        id: 4,
        title: "Simulado - Violência contra a Mulher",
        category: "Sociedade",
        date: "2024-01-08",
        size: "380 KB",
        type: "Redação", 
        description: "Análise sociológica com proposta de intervenção",
        grade: 860
      }
    ],
    temas: [
      {
        id: 5,
        title: "Tema Personalizado - Inteligência Artificial",
        category: "Tecnologia",
        date: "2024-01-14",
        size: "250 KB",
        type: "Tema",
        description: "Tema criado com textos motivadores sobre IA"
      }
    ],
    estilos: [
      {
        id: 6,
        title: "Estilo Formal Acadêmico - Versão 2",
        category: "Estilo",
        date: "2024-01-13",
        size: "180 KB",
        type: "Estilo",
        description: "Configurações de formalidade para textos acadêmicos"
      }
    ],
    newsletters: [
      {
        id: 7,
        title: "Newsletter - Tecnologia e Sociedade",
        category: "Atualidades",
        date: "2024-01-22",
        size: "2.1 MB",
        type: "Newsletter",
        description: "Curadoria semanal sobre IA e transformação digital"
      },
      {
        id: 8,
        title: "Newsletter - Sustentabilidade e Meio Ambiente",
        category: "Meio Ambiente",
        date: "2024-01-15",
        size: "1.8 MB",
        type: "Newsletter",
        description: "Análise completa sobre mudanças climáticas e políticas ambientais"
      }
    ],
    propostas: [
      {
        id: 9,
        title: "Proposta ENEM - Democratização do Acesso Digital",
        category: "Tecnologia",
        date: "2024-01-20",
        size: "650 KB",
        type: "Proposta",
        description: "Tema personalizado com textos motivadores sobre inclusão digital"
      },
      {
        id: 10,
        title: "Proposta Vestibular - Violência Urbana",
        category: "Sociedade",
        date: "2024-01-18",
        size: "580 KB",
        type: "Proposta",
        description: "Proposta completa com contexto e materiais de apoio"
      }
    ]
  };

  // Combinar todos os arquivos para busca
  const allFiles = [
    ...bibliotecaData.repertorios,
    ...bibliotecaData.redacoes, 
    ...bibliotecaData.temas,
    ...bibliotecaData.estilos,
    ...bibliotecaData.newsletters,
    ...bibliotecaData.propostas
  ];

  // Filtrar arquivos baseado na busca e categoria
  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || file.type.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "Repertório": return <BookOpen size={20} className="text-blue-600" />;
      case "Redação": return <PenTool size={20} className="text-green-600" />;
      case "Tema": return <Lightbulb size={20} className="text-yellow-600" />;
      case "Estilo": return <Target size={20} className="text-purple-600" />;
      case "Newsletter": return <Newspaper size={20} className="text-orange-600" />;
      case "Proposta": return <FolderOpen size={20} className="text-indigo-600" />;
      default: return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Repertório": return "bg-blue-100 text-blue-800";
      case "Redação": return "bg-green-100 text-green-800";
      case "Tema": return "bg-yellow-100 text-yellow-800";
      case "Estilo": return "bg-purple-100 text-purple-800";
      case "Newsletter": return "bg-orange-100 text-orange-800";
      case "Proposta": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation(backUrl)}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                data-testid="button-back"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <Archive className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Biblioteca Pessoal</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Repositório inteligente de todo seu aprendizado
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 pt-24">
        {/* Search and Filter Bar */}
        <LiquidGlassCard className="mb-8 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por título, categoria ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("todos")}
                data-testid="filter-todos"
              >
                Todos
              </Button>
              <Button
                variant={selectedCategory === "repertório" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("repertório")}
                data-testid="filter-repertorio"
              >
                Repertórios
              </Button>
              <Button
                variant={selectedCategory === "redação" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("redação")}
                data-testid="filter-redacao"
              >
                Redações
              </Button>
              <Button
                variant={selectedCategory === "tema" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("tema")}
                data-testid="filter-tema"
              >
                Temas
              </Button>
              <Button
                variant={selectedCategory === "estilo" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("estilo")}
                data-testid="filter-estilo"
              >
                Estilos
              </Button>
              <Button
                variant={selectedCategory === "newsletter" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("newsletter")}
                data-testid="filter-newsletter"
              >
                Newsletters
              </Button>
              <Button
                variant={selectedCategory === "proposta" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("proposta")}
                data-testid="filter-proposta"
              >
                Propostas
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <LiquidGlassCard className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.repertorios.length}</div>
            <div className="text-sm text-soft-gray">Repertórios</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <PenTool className="mx-auto mb-2 text-green-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.redacoes.length}</div>
            <div className="text-sm text-soft-gray">Redações</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <Lightbulb className="mx-auto mb-2 text-yellow-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.temas.length}</div>
            <div className="text-sm text-soft-gray">Temas</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <Target className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.estilos.length}</div>
            <div className="text-sm text-soft-gray">Estilos</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <Newspaper className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.newsletters.length}</div>
            <div className="text-sm text-soft-gray">Newsletters</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <FolderOpen className="mx-auto mb-2 text-indigo-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.propostas.length}</div>
            <div className="text-sm text-soft-gray">Propostas</div>
          </LiquidGlassCard>
        </div>

        {/* Files Grid */}
        <div className="grid gap-4">
          {filteredFiles.length === 0 ? (
            <LiquidGlassCard className="p-8 text-center">
              <Archive className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum arquivo encontrado</h3>
              <p className="text-gray-500">
                {searchTerm ? "Tente buscar com outros termos" : "Comece usando as funcionalidades para criar seu primeiro arquivo"}
              </p>
            </LiquidGlassCard>
          ) : (
            filteredFiles.map((file) => (
              <LiquidGlassCard key={file.id} className="p-6 hover:shadow-lg smooth-transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-dark-blue truncate">{file.title}</h3>
                        <Badge className={`text-xs ${getTypeColor(file.type)}`}>
                          {file.type}
                        </Badge>
                        {(file as any).grade && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Nota: {(file as any).grade}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-soft-gray mb-2">{file.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {new Date(file.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span>{file.size}</span>
                        <span>{file.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" data-testid={`button-view-${file.id}`}>
                      <Eye size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" data-testid={`button-download-${file.id}`}>
                      <Download size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" data-testid={`button-delete-${file.id}`}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}