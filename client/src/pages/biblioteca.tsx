import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, BookOpen, PenTool, Lightbulb, Clock, Target, Archive, Eye, Trash2, ArrowLeft, Newspaper, FolderOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsPDF from 'jspdf';
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function BibliotecaPage() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);

  // Sistema inteligente de detecção de origem
  const getBackUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('from');
    const fromSession = sessionStorage.getItem('biblioteca-origin');
    const fromPage = fromUrl || fromSession || 'dashboard';
    
    console.log('Detectando origem da página biblioteca:');
    console.log('- URL param "from":', fromUrl);
    console.log('- SessionStorage "biblioteca-origin":', fromSession);
    console.log('- Origem final detectada:', fromPage);
    
    // Salvar a origem atual se vier da URL (isso sobrescreve qualquer valor anterior)
    if (fromUrl) {
      sessionStorage.setItem('biblioteca-origin', fromUrl);
      console.log('- Salvando nova origem no sessionStorage:', fromUrl);
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

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch saved repertoires from API
  const { data: savedRepertoires, isLoading } = useQuery({
    queryKey: ['/api/repertoires/saved'],
    queryFn: async () => {
      const response = await fetch('/api/repertoires/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch saved repertoires');
      }
      return response.json();
    }
  });

  // Transform repertoires to match biblioteca format
  const transformRepertoireToFile = (repertoire: any) => ({
    id: repertoire.id,
    title: repertoire.title,
    category: repertoire.category === 'social' ? 'Sociedade' :
              repertoire.category === 'environment' ? 'Meio Ambiente' :
              repertoire.category === 'technology' ? 'Tecnologia' :
              repertoire.category === 'education' ? 'Educação' :
              repertoire.category === 'politics' ? 'Política' :
              repertoire.category === 'economy' ? 'Economia' :
              repertoire.category === 'culture' ? 'Cultura' :
              repertoire.category === 'health' ? 'Saúde' :
              repertoire.category === 'ethics' ? 'Ética' :
              repertoire.category === 'globalization' ? 'Globalização' :
              repertoire.category.charAt(0).toUpperCase() + repertoire.category.slice(1),
    date: repertoire.createdAt,
    size: '1.0 MB', // Default size since we don't track actual file size
    type: 'Repertório',
    description: repertoire.description,
    content: `**${repertoire.title}**\n\n${repertoire.description}\n\n**Categoria:** ${repertoire.category}\n**Tipo:** ${repertoire.type}\n**Ano:** ${repertoire.year || 'N/A'}\n**Rating:** ${repertoire.rating || 0}/50\n\n**Palavras-chave:** ${Array.isArray(repertoire.keywords) ? repertoire.keywords.join(', ') : 'N/A'}`
  });

  // Mock data for other categories (keeping existing structure)
  const bibliotecaData = {
    repertorios: savedRepertoires?.results ? savedRepertoires.results.map(transformRepertoireToFile) : [],
    redacoes: [
      {
        id: 3,
        title: "Redação ENEM 2023 - Tecnologia na Educação",
        category: "Educação",
        date: "2024-01-12",
        size: "450 KB", 
        type: "Redação",
        description: "Dissertação argumentativa sobre impactos da tecnologia",
        grade: 920,
        content: "**Redação ENEM 2023: Os impactos da tecnologia na educação brasileira**\n\n**Introdução:**\nA revolução digital transformou radicalmente os paradigmas educacionais no século XXI. No Brasil, país marcado por profundas desigualdades sociais, a incorporação de tecnologias no ambiente escolar representa tanto uma oportunidade de democratização do conhecimento quanto um desafio de inclusão digital. Diante desse cenário, é fundamental analisar como a tecnologia pode contribuir para a melhoria da qualidade educacional, desde que implementada de forma equitativa e planejada.\n\n**Desenvolvimento 1: Benefícios da tecnologia educacional**\nPrimeiramente, é inegável que a tecnologia oferece ferramentas pedagógicas inovadoras... [CONTEÚDO COMPLETO DA REDAÇÃO]\n\n**Desenvolvimento 2: Desafios da inclusão digital**\nPor outro lado, a implementação tecnológica na educação enfrenta obstáculos significativos...\n\n**Conclusão:**\nPortanto, a tecnologia na educação brasileira deve ser vista como instrumento de transformação social..."
      },
      {
        id: 4,
        title: "Simulado - Violência contra a Mulher",
        category: "Sociedade",
        date: "2024-01-08",
        size: "380 KB",
        type: "Redação", 
        description: "Análise sociológica com proposta de intervenção",
        grade: 860,
        content: "**Redação: A urgência no combate à violência contra a mulher no Brasil**\n\n**Introdução:**\nO feminicídio representa uma das mais graves violações dos direitos humanos na sociedade contemporânea. No Brasil, de acordo com o Atlas da Violência 2023, uma mulher é assassinada a cada 7 horas, colocando o país entre os que mais registram crimes dessa natureza no mundo...\n\n**Desenvolvimento 1: Raízes culturais do problema**\nA violência contra a mulher tem raízes profundas na cultura patriarcal brasileira...\n\n**Desenvolvimento 2: Falhas nas políticas públicas**\nAlém dos fatores culturais, a insuficiência das políticas públicas agrava o cenário...\n\n**Proposta de Intervenção:**\nPara enfrentar essa problemática, é necessário um plano integrado que envolva educação, legislação e atendimento especializado..."
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
        description: "Tema criado com textos motivadores sobre IA",
        content: "**Tema: Os desafios da Inteligência Artificial na sociedade contemporânea**\n\n**Textos Motivadores:**\n\n**Texto 1 - Revolução Tecnológica**\n'A inteligência artificial não é mais ficção científica, é uma realidade que está redefinindo o mercado de trabalho, a educação e as relações sociais.' - Revista Época, 2023\n\n**Texto 2 - Dados e Estatísticas**\nSegundo o McKinsey Global Institute, até 2030, cerca de 375 milhões de trabalhadores podem precisar mudar completamente de ocupação devido à automação. No Brasil, 54% dos empregos têm alto potencial de automação.\n\n**Texto 3 - Aspectos Éticos**\n'O desenvolvimento da IA deve ser guiado por princípios éticos que garantam benefícios para toda a humanidade, não apenas para alguns poucos.' - UNESCO, Recomendação sobre Ética da IA\n\n**Instruções:**\nA partir dos textos motivadores e com base nos seus conhecimentos, redija um texto dissertativo-argumentativo sobre os desafios da implementação da inteligência artificial na sociedade brasileira, apresentando proposta de intervenção."
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
        description: "Configurações de formalidade para textos acadêmicos",
        content: "**Estilo Formal Acadêmico - Configurações Salvas**\n\n**Parâmetros de Formalidade:**\n• Nível de formalidade: Alto (9/10)\n• Tom: Impessoal e objetivo\n• Vocabulário: Técnico-científico\n• Estrutura: Clássica dissertativa\n\n**Conectivos Preferenciais:**\n• Introdução: \"Primeiramente\", \"Inicialmente\", \"É fundamental considerar\"\n• Desenvolvimento: \"Ademais\", \"Outrossim\", \"Nesse contexto\"\n• Conclusão: \"Portanto\", \"Dessarte\", \"Conclui-se\"\n\n**Expressões Vedadas:**\n• Gírias e informalidades\n• Primeira pessoa (eu, nós)\n• Expressões coloquiais\n• Repetições desnecessárias\n\n**Características do Estilo:**\n• Períodos longos e bem estruturados\n• Subordinação abundante\n• Referências externas obrigatórias\n• Linguagem culta e rebuscada"
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

  const [bibliotecaState, setBibliotecaState] = useState(bibliotecaData);

  // Função para gerar e baixar PDF
  const downloadAsPDF = (file: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 30;

    // Cabeçalho do documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DissertAI - Biblioteca Pessoal', margin, yPosition);
    yPosition += 15;

    // Informações do arquivo
    doc.setFontSize(16);
    doc.text(file.title, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tipo: ${file.type}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Categoria: ${file.category}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Data: ${new Date(file.date).toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 5;
    
    if (file.grade) {
      doc.text(`Nota: ${file.grade}`, margin, yPosition);
      yPosition += 5;
    }

    doc.text(`Descrição: ${file.description}`, margin, yPosition);
    yPosition += 15;

    // Linha separadora
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Conteúdo
    if (file.content) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Conteúdo:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const lines = file.content.split('\\n');
      
      lines.forEach((line: string) => {
        if (line.trim()) {
          // Verifica se precisa de nova página
          if (yPosition > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            yPosition = 30;
          }
          
          if (line.startsWith('**') && line.endsWith('**')) {
            // Títulos em negrito
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            const title = line.replace(/\*\*/g, '');
            const titleLines = doc.splitTextToSize(title, maxWidth);
            doc.text(titleLines, margin, yPosition);
            yPosition += titleLines.length * 6 + 3;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
          } else if (line.startsWith('•')) {
            // Listas com marcadores
            const listItem = line.substring(2);
            const listLines = doc.splitTextToSize(`• ${listItem}`, maxWidth);
            doc.text(listLines, margin + 5, yPosition);
            yPosition += listLines.length * 5;
          } else {
            // Texto normal
            const textLines = doc.splitTextToSize(line, maxWidth);
            doc.text(textLines, margin, yPosition);
            yPosition += textLines.length * 5;
          }
        } else {
          yPosition += 3; // Espaço em branco
        }
      });
    }

    // Rodapé
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Página ${i} de ${pageCount} - Gerado pelo DissertAI`, 
        pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Download do PDF
    const fileName = `${file.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  // Function to delete saved repertoire
  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/repertoires/${fileId}/save`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting repertoire:', error);
    }
  };

  // Get all saved files (only repertoires for now)
  const allFiles = savedRepertoires?.results ? savedRepertoires.results.map(transformRepertoireToFile) : [];

  // Filter files based on search and category
  const filteredFiles = allFiles.filter((file: any) => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || file.type === "Repertório";
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button
              onClick={() => setLocation(backUrl)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-back"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Archive className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Biblioteca Pessoal</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
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
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-8 pt-16 sm:pt-24">
        {/* Search and Filter Bar - Sticky on Mobile */}
        <div className="sm:static sticky top-16 sm:top-20 z-40 -mx-4 sm:mx-0 mb-4 sm:mb-8">
          <LiquidGlassCard className="mx-4 sm:mx-0 p-3 sm:p-6">
            {/* Search Input */}
            <div className="mb-3 sm:mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 sm:top-3 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar arquivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
                  data-testid="input-search"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
            
            {/* Filter Chips - Horizontal Scroll on Mobile */}
            <div className="-mx-4 sm:mx-0">
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-0 pb-1">
                <Button
                  variant={selectedCategory === "todos" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("todos")}
                  data-testid="filter-todos"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedCategory === "repertório" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("repertório")}
                  data-testid="filter-repertorio"
                >
                  Repertórios
                </Button>
                <Button
                  variant={selectedCategory === "redação" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("redação")}
                  data-testid="filter-redacao"
                >
                  Redações
                </Button>
                <Button
                  variant={selectedCategory === "tema" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("tema")}
                  data-testid="filter-tema"
                >
                  Temas
                </Button>
                <Button
                  variant={selectedCategory === "estilo" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("estilo")}
                  data-testid="filter-estilo"
                >
                  Estilos
                </Button>
                <Button
                  variant={selectedCategory === "newsletter" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("newsletter")}
                  data-testid="filter-newsletter"
                >
                  Newsletters
                </Button>
                <Button
                  variant={selectedCategory === "proposta" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap h-8 px-3 text-xs flex-shrink-0"
                  onClick={() => setSelectedCategory("proposta")}
                  data-testid="filter-proposta"
                >
                  Propostas
                </Button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <LiquidGlassCard className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 text-blue-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaState.repertorios.length}</div>
            <div className="text-sm text-soft-gray">Repertórios</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <PenTool className="mx-auto mb-2 text-green-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaState.redacoes.length}</div>
            <div className="text-sm text-soft-gray">Redações</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <Lightbulb className="mx-auto mb-2 text-yellow-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaState.temas.length}</div>
            <div className="text-sm text-soft-gray">Temas</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <Target className="mx-auto mb-2 text-purple-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaState.estilos.length}</div>
            <div className="text-sm text-soft-gray">Estilos</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <Newspaper className="mx-auto mb-2 text-orange-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaState.newsletters.length}</div>
            <div className="text-sm text-soft-gray">Newsletters</div>
          </LiquidGlassCard>
          
          <LiquidGlassCard className="p-4 text-center">
            <FolderOpen className="mx-auto mb-2 text-indigo-600" size={24} />
            <div className="text-2xl font-bold text-dark-blue">{bibliotecaState.propostas.length}</div>
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
            filteredFiles.map((file: any) => (
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
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setSelectedFile(file);
                        setShowFileDetails(true);
                      }}
                      data-testid={`button-view-${file.id}`}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => downloadAsPDF(file)}
                      data-testid={`button-download-${file.id}`}
                    >
                      <Download size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700" 
                      onClick={() => deleteFile(file.id)}
                      data-testid={`button-delete-${file.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>
            ))
          )}
        </div>
      </div>
      
      {/* Modal de Detalhes do Arquivo */}
      <Dialog open={showFileDetails} onOpenChange={setShowFileDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="file-details-description">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              {selectedFile && getIcon(selectedFile.type)}
              <div>
                <DialogTitle className="text-xl font-bold text-dark-blue">
                  {selectedFile?.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${selectedFile ? getTypeColor(selectedFile.type) : ''}`}>
                    {selectedFile?.type}
                  </Badge>
                  {selectedFile?.grade && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Nota: {selectedFile.grade}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {selectedFile && (
            <div className="flex-1 min-h-0 flex flex-col" id="file-details-description">
              {/* Informações do Arquivo */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-dark-blue">Categoria: </span>
                    <span className="text-soft-gray">{selectedFile.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-dark-blue">Data de Criação: </span>
                    <span className="text-soft-gray">{new Date(selectedFile.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-dark-blue">Tamanho: </span>
                    <span className="text-soft-gray">{selectedFile.size}</span>
                  </div>
                  <div>
                    <span className="font-medium text-dark-blue">Tipo: </span>
                    <span className="text-soft-gray">{selectedFile.type}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="font-medium text-dark-blue">Descrição: </span>
                  <span className="text-soft-gray">{selectedFile.description}</span>
                </div>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFileDetails(false)}
                  className="text-soft-gray border-soft-gray/30 hover:border-bright-blue hover:text-bright-blue"
                  data-testid="button-close-details"
                >
                  Fechar
                </Button>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                    onClick={() => downloadAsPDF(selectedFile)}
                    data-testid={`button-download-details-${selectedFile.id}`}
                  >
                    <Download size={14} className="mr-2" />
                    Download
                  </Button>
                  {(selectedFile.type === 'Redação' || selectedFile.type === 'Estrutura') && (
                    <Button
                      className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                      data-testid={`button-edit-${selectedFile.id}`}
                    >
                      <PenTool size={14} className="mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}