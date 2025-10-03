import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, BookOpen, PenTool, Lightbulb, Clock, Target, Archive, Eye, Trash2, ArrowLeft, Newspaper, FolderOpen, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  // Fetch all saved items from API
  const { data: savedRepertoires, isLoading: loadingRepertoires } = useQuery({
    queryKey: ['/api/repertoires/saved'],
  });

  const { data: savedEssays, isLoading: loadingEssays } = useQuery({
    queryKey: ['/api/essays/saved'],
  });

  const { data: savedStructures, isLoading: loadingStructures } = useQuery({
    queryKey: ['/api/structures/saved'],
  });

  const { data: savedNewsletters, isLoading: loadingNewsletters } = useQuery({
    queryKey: ['/api/newsletters/saved'],
  });

  const { data: savedProposals, isLoading: loadingProposals } = useQuery({
    queryKey: ['/api/proposals/saved'],
  });

  const { data: savedTexts, isLoading: loadingTexts } = useQuery({
    queryKey: ['/api/saved-texts'],
  });

  const isLoading = loadingRepertoires || loadingEssays || loadingStructures || loadingNewsletters || loadingProposals || loadingTexts;

  // Transform data to match biblioteca format
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
    size: '1.0 MB',
    type: 'Repertório',
    description: repertoire.description,
    content: `**${repertoire.title}**\n\n${repertoire.description}\n\n**Categoria:** ${repertoire.category}\n**Tipo:** ${repertoire.type}\n**Ano:** ${repertoire.year || 'N/A'}\n**Rating:** ${repertoire.rating || 0}/50\n\n**Palavras-chave:** ${Array.isArray(repertoire.keywords) ? repertoire.keywords.join(', ') : 'N/A'}`
  });

  const transformEssayToFile = (essay: any) => ({
    id: essay.id,
    title: essay.title,
    category: 'Redação',
    date: essay.createdAt,
    size: '450 KB',
    type: 'Redação',
    description: essay.content?.substring(0, 100) + '...' || 'Redação',
    grade: essay.score,
    content: essay.content
  });

  const transformStructureToFile = (structure: any) => ({
    id: structure.id,
    title: structure.title,
    category: 'Estrutura',
    date: structure.createdAt,
    size: '180 KB',
    type: 'Estilo',
    description: structure.description || 'Estrutura personalizada',
    content: structure.structure
  });

  const transformNewsletterToFile = (newsletter: any) => ({
    id: newsletter.id,
    title: newsletter.title,
    category: newsletter.category || 'Atualidades',
    date: newsletter.createdAt,
    size: '2.0 MB',
    type: 'Newsletter',
    description: newsletter.summary || 'Newsletter DissertIA',
    content: newsletter.content
  });

  const transformTextToFile = (savedText: any) => ({
    id: savedText.id,
    title: savedText.title,
    category: 'Texto Modificado',
    date: savedText.createdAt,
    size: '300 KB',
    type: 'Texto Modificado',
    description: savedText.modifiedText?.substring(0, 100) + '...' || 'Texto modificado do Controlador de Escrita',
    content: `**${savedText.title}**\n\n**Texto Original:**\n${savedText.originalText}\n\n**Texto Modificado:**\n${savedText.modifiedText}\n\n${savedText.modificationType ? `**Tipo de Modificação:** ${savedText.modificationType}` : ''}`,
    originalText: savedText.originalText,
    modifiedText: savedText.modifiedText,
    modificationType: savedText.modificationType
  });

  const transformProposalToFile = (proposal: any) => ({
    id: proposal.id,
    title: proposal.title,
    category: proposal.category || 'Proposta',
    date: proposal.createdAt,
    size: '650 KB',
    type: 'Proposta',
    description: `Proposta ${proposal.examType || 'ENEM'} ${proposal.examYear || ''}`,
    content: proposal.motivationalTexts || proposal.fullContent
  });

  // Use real data from API or fallback to empty arrays
  const bibliotecaData = {
    repertorios: savedRepertoires?.results ? savedRepertoires.results.map(transformRepertoireToFile) : [],
    redacoes: savedEssays?.results ? savedEssays.results.map(transformEssayToFile) : [],
    temas: savedProposals?.results ? savedProposals.results.filter((p: any) => p.examType !== 'ENEM' && p.examType !== 'Vestibular').map(transformProposalToFile) : [],
    estilos: savedStructures?.results ? savedStructures.results.map(transformStructureToFile) : [],
    newsletters: savedNewsletters?.results ? savedNewsletters.results.map(transformNewsletterToFile) : [],
    propostas: savedProposals?.results ? savedProposals.results.filter((p: any) => p.examType === 'ENEM' || p.examType === 'Vestibular').map(transformProposalToFile) : [],
    textosModificados: savedTexts?.results ? savedTexts.results.map(transformTextToFile) : []
  };



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
    doc.text('DissertIA - Biblioteca Pessoal', margin, yPosition);
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
      doc.text(`Página ${i} de ${pageCount} - Gerado pelo DissertIA`, 
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

  // Get all saved files from all categories
  const allFiles = [
    ...bibliotecaData.repertorios,
    ...bibliotecaData.redacoes,
    ...bibliotecaData.temas,
    ...bibliotecaData.estilos,
    ...bibliotecaData.newsletters,
    ...bibliotecaData.propostas,
    ...bibliotecaData.textosModificados
  ];

  // Filter files based on search and category
  const filteredFiles = allFiles.filter((file: any) => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || 
                          (selectedCategory === "repertorios" && file.type === "Repertório") ||
                          (selectedCategory === "redacoes" && file.type === "Redação") ||
                          (selectedCategory === "temas" && file.type === "Tema") ||
                          (selectedCategory === "estilos" && file.type === "Estilo") ||
                          (selectedCategory === "newsletters" && file.type === "Newsletter") ||
                          (selectedCategory === "propostas" && file.type === "Proposta") ||
                          (selectedCategory === "textosModificados" && file.type === "Texto Modificado");
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
      case "Texto Modificado": return <FileText size={20} className="text-cyan-600" />;
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
      case "Texto Modificado": return "bg-cyan-100 text-cyan-800";
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
            
            {/* Filter Chips - 2 Lines Grid on Mobile, Single Line on Desktop */}
            <div className="-mx-4 sm:mx-0">
              <div className="grid grid-cols-4 gap-2 px-4 pb-1 sm:flex sm:flex-nowrap sm:overflow-x-auto sm:no-scrollbar sm:px-0">
                <Button
                  variant={selectedCategory === "todos" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("todos")}
                  data-testid="filter-todos"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedCategory === "repertório" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("repertório")}
                  data-testid="filter-repertorio"
                >
                  Repertórios
                </Button>
                <Button
                  variant={selectedCategory === "redação" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("redação")}
                  data-testid="filter-redacao"
                >
                  Redações
                </Button>
                <Button
                  variant={selectedCategory === "tema" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("tema")}
                  data-testid="filter-tema"
                >
                  Temas
                </Button>
                <Button
                  variant={selectedCategory === "estilo" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("estilo")}
                  data-testid="filter-estilo"
                >
                  Estilos
                </Button>
                <Button
                  variant={selectedCategory === "newsletter" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("newsletter")}
                  data-testid="filter-newsletter"
                >
                  Newsletters
                </Button>
                <Button
                  variant={selectedCategory === "proposta" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
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
        <div className="mb-4 sm:mb-8">
          {/* Mobile: Compact Stats Grid - 2 Lines */}
          <div className="sm:hidden">
            <LiquidGlassCard className="p-3">
              <div className="grid grid-cols-3 gap-3 pb-1">
                <div className="flex items-center space-x-2 bg-blue-50 rounded-full px-3 py-1">
                  <BookOpen className="text-blue-600" size={16} />
                  <span className="text-sm font-semibold text-dark-blue">{bibliotecaData.repertorios.length}</span>
                  <span className="text-xs text-soft-gray">Rep</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 rounded-full px-3 py-1">
                  <PenTool className="text-green-600" size={16} />
                  <span className="text-sm font-semibold text-dark-blue">{bibliotecaData.redacoes.length}</span>
                  <span className="text-xs text-soft-gray">Red</span>
                </div>
                <div className="flex items-center space-x-2 bg-yellow-50 rounded-full px-3 py-1">
                  <Lightbulb className="text-yellow-600" size={16} />
                  <span className="text-sm font-semibold text-dark-blue">{bibliotecaData.temas.length}</span>
                  <span className="text-xs text-soft-gray">Tem</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 rounded-full px-3 py-1">
                  <Target className="text-purple-600" size={16} />
                  <span className="text-sm font-semibold text-dark-blue">{bibliotecaData.estilos.length}</span>
                  <span className="text-xs text-soft-gray">Est</span>
                </div>
                <div className="flex items-center space-x-2 bg-orange-50 rounded-full px-3 py-1">
                  <Newspaper className="text-orange-600" size={16} />
                  <span className="text-sm font-semibold text-dark-blue">{bibliotecaData.newsletters.length}</span>
                  <span className="text-xs text-soft-gray">New</span>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-50 rounded-full px-3 py-1">
                  <FolderOpen className="text-indigo-600" size={16} />
                  <span className="text-sm font-semibold text-dark-blue">{bibliotecaData.propostas.length}</span>
                  <span className="text-xs text-soft-gray">Pro</span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
          
          {/* Desktop: Full Grid */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
        </div>


        {/* Files Grid */}
        <div className="grid gap-3 sm:gap-4">
          {filteredFiles.length === 0 ? (
            <LiquidGlassCard className="p-6 sm:p-8 text-center">
              <Archive className="mx-auto mb-4 text-gray-400" size={36} />
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">Nenhum arquivo encontrado</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm ? "Tente buscar com outros termos" : "Comece usando as funcionalidades para criar seu primeiro arquivo"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setLocation('/funcionalidades')}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white"
                  data-testid="button-create-files"
                >
                  Explorar Funcionalidades
                </Button>
              )}
            </LiquidGlassCard>
          ) : (
            filteredFiles.map((file: any) => (
              <LiquidGlassCard key={file.id} className="p-3 sm:p-6 hover:shadow-lg smooth-transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {/* Mobile: Smaller icon */}
                      <div className="sm:hidden">
                        {file.type === "Repertório" && <BookOpen size={16} className="text-blue-600" />}
                        {file.type === "Redação" && <PenTool size={16} className="text-green-600" />}
                        {file.type === "Tema" && <Lightbulb size={16} className="text-yellow-600" />}
                        {file.type === "Estilo" && <Target size={16} className="text-purple-600" />}
                        {file.type === "Newsletter" && <Newspaper size={16} className="text-orange-600" />}
                        {file.type === "Proposta" && <FolderOpen size={16} className="text-indigo-600" />}
                      </div>
                      {/* Desktop: Regular icon */}
                      <div className="hidden sm:block">
                        {getIcon(file.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Mobile: Compact header */}
                      <div className="sm:hidden">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-dark-blue truncate flex-1">{file.title}</h3>
                          <Badge className={`text-xs flex-shrink-0 ${getTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                        </div>
                        {(file as any).grade && (
                          <Badge className="bg-green-100 text-green-800 text-xs mb-1">
                            Nota: {(file as any).grade}
                          </Badge>
                        )}
                        <p className="text-xs text-soft-gray mb-2 line-clamp-2">{file.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={10} className="mr-1" />
                          <span>{new Date(file.date).toLocaleDateString('pt-BR')}</span>
                          <span className="mx-2">•</span>
                          <span>{file.size}</span>
                        </div>
                      </div>
                      
                      {/* Desktop: Full layout */}
                      <div className="hidden sm:block">
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
                  </div>
                  
                  {/* Mobile: Overflow menu */}
                  <div className="sm:hidden flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          data-testid={`button-menu-${file.id}`}
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedFile(file);
                            setShowFileDetails(true);
                          }}
                          className="flex items-center gap-2 p-3"
                          data-testid={`menu-view-${file.id}`}
                        >
                          <Eye size={16} />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => downloadAsPDF(file)}
                          className="flex items-center gap-2 p-3"
                          data-testid={`menu-download-${file.id}`}
                        >
                          <Download size={16} />
                          Baixar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteFile(file.id)}
                          className="flex items-center gap-2 p-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`menu-delete-${file.id}`}
                        >
                          <Trash2 size={16} />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Desktop: Individual buttons */}
                  <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
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
              {selectedFile.type === 'Texto Modificado' ? (
                /* Exibição especial para textos modificados */
                <div className="flex-1 overflow-y-auto space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-dark-blue">Data de Criação: </span>
                        <span className="text-soft-gray">{new Date(selectedFile.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {selectedFile.modificationType && (
                        <div>
                          <span className="font-medium text-dark-blue">Tipo de Modificação: </span>
                          <span className="text-soft-gray">{selectedFile.modificationType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Texto Original */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-dark-blue mb-2 flex items-center gap-2">
                      <FileText size={18} className="text-bright-blue" />
                      Texto Original
                    </h3>
                    <div className="bg-white rounded p-3 text-sm text-soft-gray whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
                      {selectedFile.originalText || 'Texto original não disponível'}
                    </div>
                  </div>
                  
                  {/* Texto Modificado */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-dark-blue mb-2 flex items-center gap-2">
                      <PenTool size={18} className="text-green-600" />
                      Texto Modificado
                    </h3>
                    <div className="bg-white rounded p-3 text-sm text-soft-gray whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
                      {selectedFile.modifiedText || 'Texto modificado não disponível'}
                    </div>
                  </div>
                </div>
              ) : (
                /* Exibição padrão para outros tipos de arquivos */
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
              )}
              
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