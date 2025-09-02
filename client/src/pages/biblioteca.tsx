import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, FileText, BookOpen, PenTool, Lightbulb, Clock, Target, Archive, Home, Settings, LogOut, Menu, Eye, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BibliotecaPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setLocation("/");
  };

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
    ]
  };

  // Combinar todos os arquivos para busca
  const allFiles = [
    ...bibliotecaData.repertorios,
    ...bibliotecaData.redacoes, 
    ...bibliotecaData.temas,
    ...bibliotecaData.estilos
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
      default: return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Repertório": return "bg-blue-100 text-blue-800";
      case "Redação": return "bg-green-100 text-green-800";
      case "Tema": return "bg-yellow-100 text-yellow-800";
      case "Estilo": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/functionalities" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center">
                  <Archive className="text-white" size={16} />
                </div>
                <span className="font-bold text-dark-blue text-xl">Biblioteca</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/functionalities" className="text-soft-gray hover:text-dark-blue smooth-transition">
                  Funcionalidades
                </Link>
                <Link href="/dashboard" className="text-soft-gray hover:text-dark-blue smooth-transition">
                  Dashboard
                </Link>
                <span className="text-bright-blue font-medium">Biblioteca</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings size={16} className="mr-2" />
                  Configurações
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Sair
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </Button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-2">
                <Link href="/functionalities" className="text-soft-gray hover:text-dark-blue py-2">
                  Funcionalidades
                </Link>
                <Link href="/dashboard" className="text-soft-gray hover:text-dark-blue py-2">
                  Dashboard
                </Link>
                <Link href="/settings" className="text-soft-gray hover:text-dark-blue py-2">
                  Configurações
                </Link>
                <button onClick={handleLogout} className="text-soft-gray hover:text-dark-blue py-2 text-left">
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-blue mb-2">Biblioteca Pessoal</h1>
            <p className="text-soft-gray">Repositório inteligente de todo seu aprendizado organizado por categoria</p>
          </div>

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
              </div>
            </div>
          </LiquidGlassCard>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
    </div>
  );
}