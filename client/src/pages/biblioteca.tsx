import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, FileText, BookOpen, PenTool, Lightbulb, Clock, Target, Archive, Eye, Trash2, ArrowLeft, Newspaper, FolderOpen, MoreVertical, MessageSquare, User, Bot, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from 'jspdf';
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Função para processar markdown e retornar JSX formatado
function processMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, lineIndex) => {
    const parts: (string | JSX.Element)[] = [];
    let currentText = line;
    let key = 0;
    
    // Processar negrito (**texto**)
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(currentText)) !== null) {
      // Adicionar texto antes do match
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }
      // Adicionar texto em negrito
      parts.push(<strong key={`bold-${lineIndex}-${key++}`} className="font-semibold">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // Adicionar texto restante
    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }
    
    // Se a linha estiver vazia, adicionar quebra de linha
    if (parts.length === 0) {
      elements.push(<br key={`br-${lineIndex}`} />);
    } else {
      elements.push(<span key={`line-${lineIndex}`}>{parts}{lineIndex < lines.length - 1 && <br />}</span>);
    }
  });
  
  return <>{elements}</>;
}


export default function BibliotecaPage() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; type: string; title: string } | null>(null);
  const [showLockedDialog, setShowLockedDialog] = useState(false);

  // Função para obter ícone da seção
  const getSectionIcon = (section: string) => {
    const icons: Record<string, string> = {
      tema: '🎯',
      tese: '💡', 
      introducao: '📝',
      desenvolvimento1: '🔍',
      desenvolvimento2: '📊',
      conclusao: '✅',
      finalizacao: '🎉'
    };
    return icons[section] || '💬';
  };

  // Função para obter nome da seção
  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      tema: 'Desenvolvimento do Tema',
      tese: 'Construção da Tese',
      introducao: 'Introdução',
      desenvolvimento1: 'Primeiro Desenvolvimento',
      desenvolvimento2: 'Segundo Desenvolvimento', 
      conclusao: 'Conclusão',
      finalizacao: 'Finalização'
    };
    return names[section] || 'Conversa Geral';
  };

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

  // Fetch all saved items from API - Always refetch to avoid stale cache
  const { data: savedRepertoires, isLoading: loadingRepertoires } = useQuery({
    queryKey: ['/api/repertoires/saved'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedEssays, isLoading: loadingEssays } = useQuery({
    queryKey: ['/api/essays/saved'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedStructures, isLoading: loadingStructures } = useQuery({
    queryKey: ['/api/structures/saved'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedNewsletters, isLoading: loadingNewsletters } = useQuery({
    queryKey: ['/api/newsletters/saved'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedProposals, isLoading: loadingProposals } = useQuery({
    queryKey: ['/api/proposals/saved'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedTexts, isLoading: loadingTexts } = useQuery({
    queryKey: ['/api/saved-texts'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedOutlines, isLoading: loadingOutlines } = useQuery({
    queryKey: ['/api/saved-outlines'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const { data: savedSimulations, isLoading: loadingSimulations } = useQuery({
    queryKey: ['/api/simulations'],
    refetchOnMount: 'always',
    staleTime: 0,
  });

  // Fetch conversation history when selected file has conversationId
  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ['/api/conversations', selectedFile?.conversationId],
    enabled: !!selectedFile?.conversationId,
  });

  const isLoading = loadingRepertoires || loadingEssays || loadingStructures || loadingNewsletters || loadingProposals || loadingTexts || loadingOutlines || loadingSimulations;

  // Transform data to match biblioteca format
  const transformRepertoireToFile = (repertoire: any) => ({
    id: repertoire.id,
    title: repertoire.title,
    isLocked: repertoire.isLocked || false,
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
    isLocked: essay.isLocked || false,
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
    isLocked: structure.isLocked || false,
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
    isLocked: newsletter.isLocked || false,
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
    isLocked: savedText.isLocked || false,
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
    category: proposal.theme === 'social' ? 'Sociedade' :
              proposal.theme === 'environment' ? 'Meio Ambiente' :
              proposal.theme === 'technology' ? 'Tecnologia' :
              proposal.theme === 'education' ? 'Educação' :
              proposal.theme === 'politics' ? 'Política' :
              proposal.theme === 'economy' ? 'Economia' :
              proposal.theme === 'culture' ? 'Cultura' :
              proposal.theme === 'health' ? 'Saúde' : 'Proposta',
    date: proposal.createdAt,
    size: '650 KB',
    type: 'Proposta',
    description: proposal.statement?.substring(0, 100) + '...' || `Proposta ${proposal.examType || 'ENEM'} ${proposal.year || ''}`,
    content: `**${proposal.title}**\n\n**Comando da Redação:**\n${proposal.statement}\n\n${proposal.supportingText ? `**Textos de Apoio:**\n${proposal.supportingText}\n\n` : ''}**Tipo de Exame:** ${proposal.examType?.toUpperCase() || 'N/A'}\n${proposal.examName ? `**Nome do Exame:** ${proposal.examName}\n` : ''}${proposal.year ? `**Ano:** ${proposal.year}\n` : ''}**Tema:** ${proposal.theme || 'N/A'}\n**Dificuldade:** ${proposal.difficulty || 'N/A'}\n${proposal.isAiGenerated ? '**Origem:** Criada por IA ✨' : '**Origem:** Proposta Real ✓'}`,
    isLocked: proposal.isLocked || false,
    examType: proposal.examType,
    examName: proposal.examName,
    year: proposal.year,
    difficulty: proposal.difficulty,
    theme: proposal.theme,
    isAiGenerated: proposal.isAiGenerated,
    statement: proposal.statement,
    supportingText: proposal.supportingText
  });

  const transformOutlineToFile = (outline: any) => {
    const outlineData = outline.outlineData;
    const content = `**${outline.title}**\n\n**Proposta:** ${outlineData.proposta}\n\n**Categoria Temática:** ${outlineData.categoriaTematica}\n\n**Palavras-chave:** ${outlineData.palavrasChave?.join(', ')}\n\n**INTRODUÇÃO**\n1ª frase: ${outlineData.introducao?.frase1}\n2ª frase: ${outlineData.introducao?.frase2}\n3ª frase: ${outlineData.introducao?.frase3}\n\n**1º DESENVOLVIMENTO**\n1ª frase: ${outlineData.desenvolvimento1?.frase1}\n2ª frase: ${outlineData.desenvolvimento1?.frase2}\n3ª frase: ${outlineData.desenvolvimento1?.frase3}\n\n**2º DESENVOLVIMENTO**\n1ª frase: ${outlineData.desenvolvimento2?.frase1}\n2ª frase: ${outlineData.desenvolvimento2?.frase2}\n3ª frase: ${outlineData.desenvolvimento2?.frase3}\n\n**CONCLUSÃO**\n1ª frase: ${outlineData.conclusao?.frase1}\n2ª frase: ${outlineData.conclusao?.frase2}\n3ª frase: ${outlineData.conclusao?.frase3}`;
    
    const isBrainstorming = outline.outlineType === 'brainstorming';
    
    return {
      id: outline.id,
      title: outline.title,
      isLocked: outline.isLocked || false,
      category: isBrainstorming ? 'Brainstorming' : 'Roteiro',
      date: outline.createdAt,
      size: '500 KB',
      type: isBrainstorming ? 'Brainstorming' : 'Roteiro Personalizado',
      description: outlineData.proposta?.substring(0, 100) + '...' || (isBrainstorming ? 'Conversa de brainstorming' : 'Roteiro de redação personalizado'),
      content,
      outlineData,
      conversationId: outline.conversationId
    };
  };

  const transformSimulationToFile = (simulation: any) => {
    const correctionData = simulation.correctionData;
    const competencies = correctionData?.competencies || [];
    
    let content = `**${simulation.title}**\n\n**Proposta:** ${simulation.proposalUsed || 'N/A'}\n\n**Tipo de Exame:** ${simulation.examType?.toUpperCase() || 'N/A'}\n**Tema:** ${simulation.theme || 'N/A'}\n${simulation.customTheme ? `**Tema Personalizado:** ${simulation.customTheme}\n` : ''}**Tempo Limite:** ${simulation.timeLimit ? `${simulation.timeLimit} minutos` : 'N/A'}\n**Tempo Utilizado:** ${simulation.timeTaken ? `${simulation.timeTaken} minutos` : 'N/A'}\n\n**PONTUAÇÃO FINAL:** ${simulation.score || 0}/1000\n\n`;

    if (competencies.length > 0) {
      content += `**COMPETÊNCIAS:**\n`;
      competencies.forEach((comp: any, index: number) => {
        content += `\nCompetência ${index + 1}: ${comp.score || 0}/200\n${comp.feedback || ''}\n`;
      });
    }

    if (correctionData?.strengths) {
      content += `\n**PONTOS FORTES:**\n${correctionData.strengths}\n`;
    }

    if (correctionData?.improvements) {
      content += `\n**PONTOS A MELHORAR:**\n${correctionData.improvements}\n`;
    }

    if (correctionData?.recommendation) {
      content += `\n**RECOMENDAÇÃO:**\n${correctionData.recommendation}\n`;
    }

    if (simulation.essayText) {
      content += `\n\n**REDAÇÃO:**\n${simulation.essayText}`;
    }

    // Extrair primeira linha ou primeiros caracteres da proposta para o título
    const proposalPreview = simulation.proposalUsed 
      ? simulation.proposalUsed.split('\n')[0].substring(0, 80) + (simulation.proposalUsed.length > 80 ? '...' : '')
      : simulation.theme || 'Simulado';
    
    return {
      id: simulation.id,
      title: `Simulado: ${proposalPreview}`,
      isLocked: simulation.isLocked || false,
      category: 'Simulados',
      date: simulation.createdAt,
      size: '1.2 MB',
      type: 'Simulados',
      description: `${simulation.examType?.toUpperCase() || 'Simulado'} - Nota: ${simulation.score || 0}/1000`,
      grade: simulation.score,
      content,
      essayText: simulation.essayText,
      correctionData: simulation.correctionData,
      simulation
    };
  };

  // Use real data from API or fallback to empty arrays
  const allOutlines = savedOutlines?.results ? savedOutlines.results.map(transformOutlineToFile) : [];
  
  const bibliotecaData = {
    repertorios: savedRepertoires?.results ? savedRepertoires.results.map(transformRepertoireToFile) : [],
    redacoes: savedEssays?.results ? savedEssays.results.map(transformEssayToFile) : [],
    newsletters: savedNewsletters?.results ? savedNewsletters.results.map(transformNewsletterToFile) : [],
    propostas: savedProposals?.results ? savedProposals.results.filter((p: any) => p.examType === 'enem' || p.examType === 'vestibular').map(transformProposalToFile) : [],
    textosModificados: savedTexts?.results ? savedTexts.results.map(transformTextToFile) : [],
    roteiros: allOutlines.filter((outline: any) => outline.type === 'Roteiro Personalizado'),
    brainstormings: allOutlines.filter((outline: any) => outline.type === 'Brainstorming'),
    simulados: savedSimulations?.results ? savedSimulations.results.filter((s: any) => s.isCompleted).map(transformSimulationToFile) : []
  };



  // Função para gerar e baixar PDF
  const downloadAsPDF = (file: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    // Cores DissertIA (mesmas do sistema)
    const darkBlue = [80, 135, 255]; // #5087ff - cor principal
    const softGray = [107, 114, 128]; // #6b7280 - cor secundária
    const lightBlue = [224, 242, 254]; // #E0F2FE
    const lightGreen = [220, 252, 231]; // #DCFCE7
    const lightPurple = [243, 232, 255]; // #F3E8FF
    const lightAmber = [254, 243, 199]; // #FEF3C7
    const purple = [168, 85, 247]; // #A855F7
    const blue = [59, 130, 246]; // #3B82F6
    const amber = [245, 158, 11]; // #F59E0B
    const green = [34, 197, 94]; // #22C55E

    // Função para limpar markdown e formatar texto
    const cleanMarkdown = (text: string): string => {
      if (!text) return '';
      
      // Remove todos os asteriscos de markdown
      let cleaned = text.replace(/\*\*/g, '');
      
      // Remove outros caracteres markdown comuns
      cleaned = cleaned.replace(/\*/g, '');
      cleaned = cleaned.replace(/#{1,6}\s/g, ''); // Remove headings markdown
      cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links markdown
      
      return cleaned.trim();
    };

    // Função para adicionar texto com quebra de linha automática
    const addTextBlock = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      if (!text) return;
      
      const cleanedText = cleanMarkdown(text);
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(cleanedText, maxWidth - 4);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin + 2, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    // Função para adicionar rodapé em todas as páginas
    const addFooter = (pageNumber: number, totalPages: number) => {
      const footerY = pageHeight - 25;
      
      // Linha superior do rodapé
      doc.setDrawColor(...darkBlue);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      // Logo DissertIA estilizada (mesma fonte do header)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkBlue);
      doc.text('DISSERT', margin, footerY);
      doc.setTextColor(...softGray);
      const dissertWidth = doc.getTextWidth('DISSERT');
      doc.text('IA', margin + dissertWidth + 1, footerY);
      
      // Informações de contato
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...softGray);
      doc.text('www.dissertia.com.br', margin, footerY + 5);
      
      // Número da página
      doc.setTextColor(...softGray);
      doc.text(`Pagina ${pageNumber} de ${totalPages}`, 
        pageWidth - margin, footerY + 7, { align: 'right' });
    };

    // Cabeçalho com logo DissertIA estilizada (mesmo estilo da navbar)
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo DissertIA - "DISSERT" branco + "IA" cinza claro (igual ao header do site)
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DISSERT', margin, 20);
    
    // Calcular a largura de "DISSERT" para posicionar "IA" corretamente
    const dissertHeaderWidth = doc.getTextWidth('DISSERT');
    doc.setTextColor(200, 200, 200);
    doc.text('IA', margin + dissertHeaderWidth + 2, 20);
    
    // Tipo do arquivo (sem emojis - jsPDF não suporta)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(file.type, margin, 32);
    
    yPosition = 52;

    // Título do arquivo (com quebra de linha se necessário)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkBlue);
    const titleLines = doc.splitTextToSize(file.title, maxWidth);
    titleLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 8;
    });
    yPosition += 4;

    // Data de criação (sem emoji)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...softGray);
    doc.text(`Data: ${new Date(file.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, yPosition);
    yPosition += 15;

    // Se for roteiro personalizado ou brainstorming, usar layout especial
    if ((file.type === 'Roteiro Personalizado' || file.type === 'Brainstorming') && file.outlineData) {
      const outline = file.outlineData;
      
      // Análise da Proposta
      doc.setFillColor(...lightBlue);
      doc.roundedRect(margin, yPosition, maxWidth, 8, 2, 2, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkBlue);
      doc.text('Analise da Proposta', margin + 3, yPosition + 6);
      yPosition += 13;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const cleanedProposta = cleanMarkdown(outline.proposta || '');
      const propostaLines = doc.splitTextToSize(`Proposta: ${cleanedProposta}`, maxWidth - 4);
      propostaLines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin + 2, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
      
      // Palavras-chave
      if (outline.palavrasChave && outline.palavrasChave.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(...softGray);
        doc.text('Palavras-chave: ' + outline.palavrasChave.join(', '), margin + 2, yPosition);
        yPosition += 8;
      }
      
      // Categoria Temática
      if (outline.categoriaTematica) {
        doc.text('Categoria: ' + outline.categoriaTematica, margin + 2, yPosition);
        yPosition += 12;
      }
      
      // Repertórios Sugeridos
      if (outline.repertoriosSugeridos && outline.repertoriosSugeridos.length > 0) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFillColor(220, 252, 231);
        doc.roundedRect(margin, yPosition, maxWidth, 8, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 197, 94);
        doc.text('Repertorios Sugeridos', margin + 3, yPosition + 6);
        yPosition += 13;
        
        outline.repertoriosSugeridos.forEach((rep: any, idx: number) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
          }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          const cleanedTitulo = cleanMarkdown(rep.titulo || '');
          doc.text(`${idx + 1}. ${cleanedTitulo} (${rep.tipo})`, margin + 2, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...softGray);
          const cleanedRelacao = cleanMarkdown(rep.relacao || '');
          const relacaoLines = doc.splitTextToSize(cleanedRelacao, maxWidth - 6);
          relacaoLines.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(line, margin + 4, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        });
        yPosition += 5;
      }
      
      // 1º Parágrafo - Introdução (Azul)
      if (outline.introducao) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFillColor(...lightBlue);
        doc.roundedRect(margin, yPosition, maxWidth, 8, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...blue);
        doc.text('1. Primeiro Paragrafo - Introducao', margin + 3, yPosition + 6);
        yPosition += 13;
        
        const introducaoTexts = [
          { label: '1ª frase (Contextualização):', text: outline.introducao.frase1 },
          { label: '2ª frase (Problema central):', text: outline.introducao.frase2 },
          { label: '3ª frase (Tese):', text: outline.introducao.frase3 }
        ];
        
        introducaoTexts.forEach(item => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...blue);
          doc.text(item.label, margin + 2, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const cleanedText = cleanMarkdown(item.text || '');
          const lines = doc.splitTextToSize(cleanedText, maxWidth - 4);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(line, margin + 2, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        });
        yPosition += 5;
      }
      
      // 2º Parágrafo - 1º Desenvolvimento (Roxo)
      if (outline.desenvolvimento1) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFillColor(...lightPurple);
        doc.roundedRect(margin, yPosition, maxWidth, 8, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...purple);
        doc.text('2. Segundo Paragrafo - Primeiro Desenvolvimento', margin + 3, yPosition + 6);
        yPosition += 13;
        
        const dev1Texts = [
          { label: '1ª frase (Tópico frasal):', text: outline.desenvolvimento1.frase1 },
          { label: '2ª frase (Repertório):', text: outline.desenvolvimento1.frase2 },
          { label: '3ª frase (Análise crítica):', text: outline.desenvolvimento1.frase3 }
        ];
        
        dev1Texts.forEach(item => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...purple);
          doc.text(item.label, margin + 2, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const cleanedText = cleanMarkdown(item.text || '');
          const lines = doc.splitTextToSize(cleanedText, maxWidth - 4);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(line, margin + 2, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        });
        yPosition += 5;
      }
      
      // 3º Parágrafo - 2º Desenvolvimento (Amarelo)
      if (outline.desenvolvimento2) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFillColor(...lightAmber);
        doc.roundedRect(margin, yPosition, maxWidth, 8, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...amber);
        doc.text('3. Terceiro Paragrafo - Segundo Desenvolvimento', margin + 3, yPosition + 6);
        yPosition += 13;
        
        const dev2Texts = [
          { label: '1ª frase (Tópico frasal):', text: outline.desenvolvimento2.frase1 },
          { label: '2ª frase (Repertório):', text: outline.desenvolvimento2.frase2 },
          { label: '3ª frase (Análise crítica):', text: outline.desenvolvimento2.frase3 }
        ];
        
        dev2Texts.forEach(item => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...amber);
          doc.text(item.label, margin + 2, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const cleanedText = cleanMarkdown(item.text || '');
          const lines = doc.splitTextToSize(cleanedText, maxWidth - 4);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(line, margin + 2, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        });
        yPosition += 5;
      }
      
      // 4º Parágrafo - Conclusão (Verde)
      if (outline.conclusao) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFillColor(...lightGreen);
        doc.roundedRect(margin, yPosition, maxWidth, 8, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...green);
        doc.text('4. Quarto Paragrafo - Conclusao', margin + 3, yPosition + 6);
        yPosition += 13;
        
        const conclusaoTexts = [
          { label: '1ª frase (Retomada da tese):', text: outline.conclusao.frase1 },
          { label: '2ª frase (Proposta de intervenção):', text: outline.conclusao.frase2 },
          { label: '3ª frase (Detalhamento):', text: outline.conclusao.frase3 }
        ];
        
        conclusaoTexts.forEach(item => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 30;
          }
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...green);
          doc.text(item.label, margin + 2, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const cleanedText = cleanMarkdown(item.text || '');
          const lines = doc.splitTextToSize(cleanedText, maxWidth - 4);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(line, margin + 2, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        });
      }
      
    } else if (file.type === 'Texto Modificado' && file.originalText && file.modifiedText) {
      // Informações
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...softGray);
      doc.text(`Data: ${new Date(file.date).toLocaleDateString('pt-BR')}`, margin, yPosition);
      if (file.modificationType) {
        doc.text(`Tipo de Modificação: ${file.modificationType}`, margin + 70, yPosition);
      }
      yPosition += 12;

      // Texto Original
      doc.setFillColor(...lightBlue);
      doc.roundedRect(margin, yPosition, maxWidth, 10, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkBlue);
      doc.text('Texto Original', margin + 3, yPosition + 7);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const cleanedOriginal = cleanMarkdown(file.originalText || '');
      const originalLines = doc.splitTextToSize(cleanedOriginal, maxWidth - 4);
      
      originalLines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin + 2, yPosition);
        yPosition += 5;
      });
      yPosition += 10;

      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }

      // Texto Modificado
      doc.setFillColor(...lightGreen);
      doc.roundedRect(margin, yPosition, maxWidth, 10, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34);
      doc.text('Texto Modificado', margin + 3, yPosition + 7);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const cleanedModified = cleanMarkdown(file.modifiedText || '');
      const modifiedLines = doc.splitTextToSize(cleanedModified, maxWidth - 4);
      
      modifiedLines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin + 2, yPosition);
        yPosition += 5;
      });

    } else {
      // Layout padrão para outros tipos
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...softGray);
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
      doc.setDrawColor(...darkBlue);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Conteúdo
      if (file.content) {
        doc.setTextColor(0, 0, 0);
        
        const lines = file.content.split('\n');
        
        lines.forEach((line: string) => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 30;
            }
            
            // Detectar se é título (contém ** em qualquer lugar)
            if (trimmedLine.includes('**')) {
              const cleanTitle = cleanMarkdown(trimmedLine);
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              doc.setTextColor(...darkBlue);
              const titleLines = doc.splitTextToSize(cleanTitle, maxWidth);
              titleLines.forEach((tLine: string) => {
                if (yPosition > pageHeight - 40) {
                  doc.addPage();
                  yPosition = 30;
                }
                doc.text(tLine, margin, yPosition);
                yPosition += 6;
              });
              yPosition += 2;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
            } else {
              // Texto normal - limpar markdown
              const cleanText = cleanMarkdown(trimmedLine);
              const textLines = doc.splitTextToSize(cleanText, maxWidth);
              textLines.forEach((tLine: string) => {
                if (yPosition > pageHeight - 40) {
                  doc.addPage();
                  yPosition = 30;
                }
                doc.text(tLine, margin, yPosition);
                yPosition += 5;
              });
            }
          } else {
            yPosition += 3;
          }
        });
      }
    }

    // Adicionar rodapé em todas as páginas
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter(i, pageCount);
    }

    // Download do PDF
    const fileName = `${file.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  // Function to open delete confirmation dialog
  const deleteFile = (fileId: string, fileType?: string, fileName?: string) => {
    setFileToDelete({ id: fileId, type: fileType || '', title: fileName || 'este arquivo' });
    setShowDeleteDialog(true);
  };

  // Function to confirm and execute deletion
  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      let endpoint = '';
      
      // Determine the correct API endpoint based on file type
      switch (fileToDelete.type) {
        case 'Repertório':
          endpoint = `/api/repertoires/${fileToDelete.id}/save`;
          break;
        case 'Redação':
          endpoint = `/api/essays/${fileToDelete.id}/save`;
          break;
        case 'Proposta':
          endpoint = `/api/proposals/${fileToDelete.id}/save`;
          break;
        case 'Newsletter':
          endpoint = `/api/newsletters/${fileToDelete.id}/save`;
          break;
        case 'Texto Modificado':
          endpoint = `/api/saved-texts/${fileToDelete.id}`;
          break;
        case 'Roteiro Personalizado':
        case 'Brainstorming':
          endpoint = `/api/saved-outlines/${fileToDelete.id}`;
          break;
        case 'Simulados':
          endpoint = `/api/simulations/${fileToDelete.id}`;
          break;
        default:
          console.error('Unknown file type:', fileToDelete.type);
          setShowDeleteDialog(false);
          setFileToDelete(null);
          return;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Invalidate cache and refresh
        queryClient.invalidateQueries({ queryKey: ['/api/repertoires/saved'] });
        queryClient.invalidateQueries({ queryKey: ['/api/essays/saved'] });
        queryClient.invalidateQueries({ queryKey: ['/api/proposals/saved'] });
        queryClient.invalidateQueries({ queryKey: ['/api/structures/saved'] });
        queryClient.invalidateQueries({ queryKey: ['/api/saved-texts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/saved-outlines'] });
        queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
      } else {
        console.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  // Get all saved files from all categories
  const allFiles = [
    ...bibliotecaData.repertorios,
    ...bibliotecaData.redacoes,
    ...bibliotecaData.propostas,
    ...bibliotecaData.textosModificados,
    ...bibliotecaData.roteiros,
    ...bibliotecaData.brainstormings,
    ...bibliotecaData.simulados
  ];

  // Filter files based on search and category
  const filteredFiles = allFiles.filter((file: any) => {
    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || 
                          (selectedCategory === "repertório" && file.type === "Repertório") ||
                          (selectedCategory === "redação" && file.type === "Redação") ||
                          (selectedCategory === "proposta" && file.type === "Proposta") ||
                          (selectedCategory === "textosModificados" && file.type === "Texto Modificado") ||
                          (selectedCategory === "roteiros" && file.type === "Roteiro Personalizado") ||
                          (selectedCategory === "brainstormings" && file.type === "Brainstorming") ||
                          (selectedCategory === "simulados" && file.type === "Simulados");
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "Repertório": return <BookOpen size={20} className="text-blue-600" />;
      case "Redação": return <PenTool size={20} className="text-green-600" />;
      case "Proposta": return <FolderOpen size={20} className="text-indigo-600" />;
      case "Texto Modificado": return <FileText size={20} className="text-cyan-600" />;
      case "Roteiro Personalizado": return <Target size={20} className="text-pink-600" />;
      case "Brainstorming": return <MessageSquare size={20} className="text-purple-600" />;
      case "Simulados": return <GraduationCap size={20} className="text-amber-600" />;
      default: return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Repertório": return "bg-blue-100 text-blue-800";
      case "Redação": return "bg-green-100 text-green-800";
      case "Proposta": return "bg-indigo-100 text-indigo-800";
      case "Texto Modificado": return "bg-cyan-100 text-cyan-800";
      case "Roteiro Personalizado": return "bg-pink-100 text-pink-800";
      case "Brainstorming": return "bg-purple-100 text-purple-800";
      case "Simulados": return "bg-amber-100 text-amber-800";
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
        {/* Search and Filter Bar */}
        <div className="mb-4 sm:mb-8">
          <LiquidGlassCard className="p-3 sm:p-6">
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
              <div className="grid grid-cols-3 gap-2 px-4 pb-1 sm:flex sm:flex-nowrap sm:overflow-x-auto sm:no-scrollbar sm:px-0">
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
                  variant={selectedCategory === "proposta" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("proposta")}
                  data-testid="filter-proposta"
                >
                  Propostas
                </Button>
                <Button
                  variant={selectedCategory === "textosModificados" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("textosModificados")}
                  data-testid="filter-textos-modificados"
                >
                  Textos Modificados
                </Button>
                <Button
                  variant={selectedCategory === "roteiros" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("roteiros")}
                  data-testid="filter-roteiros"
                >
                  Roteiros
                </Button>
                <Button
                  variant={selectedCategory === "brainstormings" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("brainstormings")}
                  data-testid="filter-brainstormings"
                >
                  Brainstormings
                </Button>
                <Button
                  variant={selectedCategory === "simulados" ? "default" : "secondary"}
                  size="sm"
                  className="w-full h-8 px-2 text-xs rounded-full truncate overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:flex-shrink-0 sm:px-3"
                  onClick={() => setSelectedCategory("simulados")}
                  data-testid="filter-simulados"
                >
                  Simulados
                </Button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Statistics Cards */}
        <div className="mb-4 sm:mb-8">
          {/* Mobile: Ultra Compact Stats Grid */}
          <div className="sm:hidden">
            <LiquidGlassCard className="p-1.5">
              <div className="grid grid-cols-3 gap-1">
                <div className="flex flex-col items-center justify-center bg-blue-50 rounded p-1">
                  <BookOpen className="text-blue-600" size={12} />
                  <span className="text-xs font-bold text-dark-blue leading-tight">{bibliotecaData.repertorios.length}</span>
                  <span className="text-[9px] text-soft-gray leading-tight">Rep</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-indigo-50 rounded p-1">
                  <FolderOpen className="text-indigo-600" size={12} />
                  <span className="text-xs font-bold text-dark-blue leading-tight">{bibliotecaData.propostas.length}</span>
                  <span className="text-[9px] text-soft-gray leading-tight">Prop</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-cyan-50 rounded p-1">
                  <FileText className="text-cyan-600" size={12} />
                  <span className="text-xs font-bold text-dark-blue leading-tight">{bibliotecaData.textosModificados.length}</span>
                  <span className="text-[9px] text-soft-gray leading-tight">Textos</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-pink-50 rounded p-1">
                  <Target className="text-pink-600" size={12} />
                  <span className="text-xs font-bold text-dark-blue leading-tight">{bibliotecaData.roteiros.length}</span>
                  <span className="text-[9px] text-soft-gray leading-tight">Rot</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-purple-50 rounded p-1">
                  <MessageSquare className="text-purple-600" size={12} />
                  <span className="text-xs font-bold text-dark-blue leading-tight">{bibliotecaData.brainstormings.length}</span>
                  <span className="text-[9px] text-soft-gray leading-tight">Brain</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-amber-50 rounded p-1">
                  <GraduationCap className="text-amber-600" size={12} />
                  <span className="text-xs font-bold text-dark-blue leading-tight">{bibliotecaData.simulados.length}</span>
                  <span className="text-[9px] text-soft-gray leading-tight">Sim</span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
          
          {/* Desktop: Full Grid - Centralizado com 6 cards */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            <LiquidGlassCard className="p-4 text-center">
              <BookOpen className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.repertorios.length}</div>
              <div className="text-sm text-soft-gray">Repertórios</div>
            </LiquidGlassCard>
            
            <LiquidGlassCard className="p-4 text-center">
              <FolderOpen className="mx-auto mb-2 text-indigo-600" size={24} />
              <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.propostas.length}</div>
              <div className="text-sm text-soft-gray">Propostas</div>
            </LiquidGlassCard>
            
            <LiquidGlassCard className="p-4 text-center">
              <FileText className="mx-auto mb-2 text-cyan-600" size={24} />
              <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.textosModificados.length}</div>
              <div className="text-sm text-soft-gray">Textos Modificados</div>
            </LiquidGlassCard>
            
            <LiquidGlassCard className="p-4 text-center">
              <Target className="mx-auto mb-2 text-pink-600" size={24} />
              <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.roteiros.length}</div>
              <div className="text-sm text-soft-gray">Roteiros</div>
            </LiquidGlassCard>
            
            <LiquidGlassCard className="p-4 text-center">
              <MessageSquare className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.brainstormings.length}</div>
              <div className="text-sm text-soft-gray">Brainstormings</div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-4 text-center">
              <GraduationCap className="mx-auto mb-2 text-amber-600" size={24} />
              <div className="text-2xl font-bold text-dark-blue">{bibliotecaData.simulados.length}</div>
              <div className="text-sm text-soft-gray">Simulados</div>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Limite de Arquivos - Banner Informativo */}
        {(() => {
          const totalFiles = allFiles.length;
          const lockedFiles = allFiles.filter((f: any) => f.isLocked).length;
          const accessibleFiles = totalFiles - lockedFiles;
          
          // Só mostrar banner para usuários do plano gratuito
          if (totalFiles > 15 || lockedFiles > 0) {
            return (
              <LiquidGlassCard className="p-4 mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Archive className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark-blue mb-1">
                      Limite de Arquivos - Plano Gratuito
                    </h3>
                    <p className="text-sm text-gray-700 mb-2">
                      Você está usando <strong>{accessibleFiles} de 20 arquivos</strong> acessíveis.
                      {lockedFiles > 0 && (
                        <span className="text-red-700 font-medium">
                          {" "}{lockedFiles} {lockedFiles === 1 ? 'arquivo está bloqueado' : 'arquivos estão bloqueados'}.
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[120px]">
                        <div 
                          className="bg-gradient-to-r from-bright-blue to-dark-blue h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((accessibleFiles / 20) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {accessibleFiles}/20
                      </span>
                    </div>
                    {lockedFiles > 0 && (
                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          onClick={() => setLocation('/subscription')}
                          className="bg-gradient-to-r from-bright-blue to-dark-blue text-white"
                          data-testid="button-upgrade-unlock"
                        >
                          ✨ Upgrade para Pro - Arquivos Ilimitados
                        </Button>
                        <p className="text-xs text-gray-600 self-center">
                          ou delete arquivos antigos para liberar espaço
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            );
          }
          return null;
        })()}

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
                  onClick={() => setLocation('/functionalities')}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white"
                  data-testid="button-create-files"
                >
                  Explorar Funcionalidades
                </Button>
              )}
            </LiquidGlassCard>
          ) : (
            filteredFiles.map((file: any) => (
              <LiquidGlassCard key={file.id} className="p-3 sm:p-6 hover:shadow-lg smooth-transition overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {/* Mobile: Smaller icon */}
                      <div className="sm:hidden">
                        {file.type === "Repertório" && <BookOpen size={16} className="text-blue-600" />}
                        {file.type === "Redação" && <PenTool size={16} className="text-green-600" />}
                        {file.type === "Proposta" && <FolderOpen size={16} className="text-indigo-600" />}
                        {file.type === "Texto Modificado" && <FileText size={16} className="text-cyan-600" />}
                        {file.type === "Roteiro Personalizado" && <Target size={16} className="text-pink-600" />}
                        {file.type === "Brainstorming" && <MessageSquare size={16} className="text-purple-600" />}
                        {file.type === "Simulados" && <GraduationCap size={16} className="text-amber-600" />}
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
                          <h3 className="text-sm font-semibold text-dark-blue truncate flex-1 min-w-0">{file.title}</h3>
                          <Badge className={`text-xs flex-shrink-0 whitespace-nowrap ${getTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                        </div>
                        {file.isLocked && (
                          <Badge className="bg-red-100 text-red-800 text-xs mb-1 border border-red-300">
                            🔒 Bloqueado
                          </Badge>
                        )}
                        {(file as any).grade && (
                          <Badge className="bg-green-100 text-green-800 text-xs mb-1">
                            Nota: {(file as any).grade}
                          </Badge>
                        )}
                        <p className="text-xs text-soft-gray mb-2 line-clamp-2 break-words">{file.description}</p>
                        <div className="flex items-center text-xs text-gray-500 flex-wrap gap-1">
                          <Clock size={10} className="mr-1" />
                          <span className="whitespace-nowrap">{new Date(file.date).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span className="break-all">{file.size}</span>
                        </div>
                      </div>
                      
                      {/* Desktop: Full layout */}
                      <div className="hidden sm:block">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-dark-blue truncate min-w-0 max-w-full">{file.title}</h3>
                          <Badge className={`text-xs flex-shrink-0 whitespace-nowrap ${getTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                          {file.isLocked && (
                            <Badge className="bg-red-100 text-red-800 text-xs flex-shrink-0 border border-red-300">
                              🔒 Bloqueado
                            </Badge>
                          )}
                          {(file as any).grade && (
                            <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">
                              Nota: {(file as any).grade}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-soft-gray mb-2 break-words">{file.description}</p>
                        
                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                          <span className="flex items-center whitespace-nowrap">
                            <Clock size={12} className="mr-1" />
                            {new Date(file.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="break-all">{file.size}</span>
                          <span className="break-words">{file.category}</span>
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
                            if (file.isLocked) {
                              setShowLockedDialog(true);
                            } else {
                              setSelectedFile(file);
                              setShowFileDetails(true);
                            }
                          }}
                          className="flex items-center gap-2 p-3"
                          data-testid={`menu-view-${file.id}`}
                          disabled={file.isLocked}
                        >
                          <Eye size={16} />
                          {file.isLocked ? '🔒 Visualizar' : 'Visualizar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            if (file.isLocked) {
                              setShowLockedDialog(true);
                            } else {
                              downloadAsPDF(file);
                            }
                          }}
                          className="flex items-center gap-2 p-3"
                          data-testid={`menu-download-${file.id}`}
                          disabled={file.isLocked}
                        >
                          <Download size={16} />
                          {file.isLocked ? '🔒 Baixar PDF' : 'Baixar PDF'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteFile(file.id, file.type, file.title)}
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
                        if (file.isLocked) {
                          setShowLockedDialog(true);
                        } else {
                          setSelectedFile(file);
                          setShowFileDetails(true);
                        }
                      }}
                      disabled={file.isLocked}
                      data-testid={`button-view-${file.id}`}
                      title={file.isLocked ? 'Arquivo bloqueado - Upgrade para Pro' : 'Visualizar'}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        if (file.isLocked) {
                          setShowLockedDialog(true);
                        } else {
                          downloadAsPDF(file);
                        }
                      }}
                      disabled={file.isLocked}
                      data-testid={`button-download-${file.id}`}
                      title={file.isLocked ? 'Arquivo bloqueado - Upgrade para Pro' : 'Baixar PDF'}
                    >
                      <Download size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700" 
                      onClick={() => deleteFile(file.id, file.type, file.title)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" aria-describedby="file-details-description" hideClose>
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
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
              <Button
                variant="outline"
                onClick={() => setShowFileDetails(false)}
                className="text-soft-gray border-soft-gray/30 hover:border-bright-blue hover:text-bright-blue"
                data-testid="button-close-details"
              >
                Fechar
              </Button>
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
              ) : selectedFile.type === 'Proposta' ? (
                /* Exibição especial para propostas */
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Informações da Proposta */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-dark-blue">Data de Criação: </span>
                        <span className="text-soft-gray">{new Date(selectedFile.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {selectedFile.examName && (
                        <div>
                          <span className="font-medium text-dark-blue">Exame: </span>
                          <span className="text-soft-gray">{selectedFile.examName}</span>
                        </div>
                      )}
                      {selectedFile.year && (
                        <div>
                          <span className="font-medium text-dark-blue">Ano: </span>
                          <span className="text-soft-gray">{selectedFile.year}</span>
                        </div>
                      )}
                      {selectedFile.difficulty && (
                        <div>
                          <span className="font-medium text-dark-blue">Dificuldade: </span>
                          <span className="text-soft-gray capitalize">{selectedFile.difficulty}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Título/Tema da Proposta */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                    <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-emerald-600" />
                      Proposta
                    </h3>
                    <div className="bg-white rounded p-4 text-base font-semibold text-dark-blue border border-emerald-200">
                      {selectedFile.title}
                    </div>
                  </div>

                  {/* Enunciado da Proposta */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-dark-blue mb-3 flex items-center gap-2">
                      <FileText size={18} className="text-bright-blue" />
                      Enunciado da Proposta
                    </h3>
                    <div className="bg-white rounded p-4 text-sm text-dark-blue whitespace-pre-wrap border border-gray-200">
                      {selectedFile.statement || selectedFile.description}
                    </div>
                  </div>

                  {/* Texto de Apoio */}
                  {selectedFile.supportingText && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-dark-blue mb-3 flex items-center gap-2">
                        <BookOpen size={18} className="text-purple-600" />
                        Textos de Apoio
                      </h3>
                      <div className="bg-white rounded p-4 text-sm text-dark-blue whitespace-pre-wrap border border-gray-200 space-y-4">
                        {selectedFile.supportingText}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedFile.type === 'Newsletter' ? (
                /* Exibição especial para Newsletter */
                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Informações da Newsletter em Grid */}
                  <div className="bg-gray-50 rounded-lg p-4">
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

                  {/* Conteúdo da Newsletter */}
                  <div className="p-6 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 rounded-xl border border-bright-blue/20">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-dark-blue leading-relaxed">
                        {selectedFile.content}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedFile.type === 'Simulados' && selectedFile.correctionData ? (
                /* Exibição especial para Simulados */
                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Header com Nota Final */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-600 mb-2">
                        {selectedFile.grade || 0}/1000
                      </div>
                      <div className="text-sm text-amber-700">Nota Final</div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-dark-blue">Tipo: </span>
                          <span className="text-soft-gray">{selectedFile.simulation?.examType?.toUpperCase() || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-dark-blue">Tema: </span>
                          <span className="text-soft-gray">{selectedFile.simulation?.theme || 'N/A'}</span>
                        </div>
                        {selectedFile.simulation?.timeLimit && (
                          <div>
                            <span className="font-medium text-dark-blue">Tempo Limite: </span>
                            <span className="text-soft-gray">{selectedFile.simulation.timeLimit} min</span>
                          </div>
                        )}
                        {selectedFile.simulation?.timeTaken && (
                          <div>
                            <span className="font-medium text-dark-blue">Tempo Usado: </span>
                            <span className="text-soft-gray">{selectedFile.simulation.timeTaken} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Competências */}
                  {selectedFile.correctionData.competencies && selectedFile.correctionData.competencies.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-dark-blue flex items-center gap-2">
                        <span>📊</span>
                        Competências Avaliadas
                      </h3>
                      {selectedFile.correctionData.competencies.map((comp: any, index: number) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-dark-blue">Competência {index + 1}</span>
                            <span className="text-lg font-bold text-bright-blue">{comp.score || 0}/200</span>
                          </div>
                          <p className="text-sm text-soft-gray">{comp.feedback || 'Sem feedback disponível'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pontos Fortes */}
                  {selectedFile.correctionData.strengths && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <span>✅</span>
                        Pontos Fortes
                      </h4>
                      <p className="text-sm text-green-700 leading-relaxed">{selectedFile.correctionData.strengths}</p>
                    </div>
                  )}

                  {/* Pontos a Melhorar */}
                  {selectedFile.correctionData.improvements && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                        <span>📈</span>
                        Pontos a Melhorar
                      </h4>
                      <p className="text-sm text-orange-700 leading-relaxed">{selectedFile.correctionData.improvements}</p>
                    </div>
                  )}

                  {/* Recomendação */}
                  {selectedFile.correctionData.recommendation && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                        <span>💡</span>
                        Recomendação do Professor
                      </h4>
                      <p className="text-sm text-purple-700 leading-relaxed">{selectedFile.correctionData.recommendation}</p>
                    </div>
                  )}

                  {/* Análise Estrutural */}
                  {selectedFile.correctionData.structureAnalysis && (
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                        <span>📝</span>
                        Análise Estrutural
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedFile.correctionData.structureAnalysis.introduction && (
                          <div className="p-3 bg-white rounded-lg border border-indigo-100">
                            <h5 className="font-medium text-indigo-900 text-xs mb-2">INTRODUÇÃO</h5>
                            <p className="text-xs text-indigo-700">{selectedFile.correctionData.structureAnalysis.introduction}</p>
                          </div>
                        )}
                        {selectedFile.correctionData.structureAnalysis.development && (
                          <div className="p-3 bg-white rounded-lg border border-indigo-100">
                            <h5 className="font-medium text-indigo-900 text-xs mb-2">DESENVOLVIMENTO</h5>
                            <p className="text-xs text-indigo-700">{selectedFile.correctionData.structureAnalysis.development}</p>
                          </div>
                        )}
                        {selectedFile.correctionData.structureAnalysis.conclusion && (
                          <div className="p-3 bg-white rounded-lg border border-indigo-100">
                            <h5 className="font-medium text-indigo-900 text-xs mb-2">CONCLUSÃO</h5>
                            <p className="text-xs text-indigo-700">{selectedFile.correctionData.structureAnalysis.conclusion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proposta Utilizada */}
                  {selectedFile.simulation?.proposalUsed && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <span>📋</span>
                        Proposta Utilizada
                      </h4>
                      <p className="text-sm text-blue-700 leading-relaxed whitespace-pre-line">{selectedFile.simulation.proposalUsed}</p>
                    </div>
                  )}

                  {/* Redação Completa */}
                  {selectedFile.essayText && (
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-dark-blue mb-4 flex items-center gap-2">
                        <span>✍️</span>
                        Redação Completa
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-dark-blue leading-relaxed">
                          {selectedFile.essayText}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (selectedFile.type === 'Roteiro Personalizado' || selectedFile.type === 'Brainstorming') && selectedFile.outlineData ? (
                /* Exibição especial para roteiros e brainstorming */
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Botão para ver histórico da conversa */}
                  {selectedFile.conversationId && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConversationHistory(!showConversationHistory)}
                        className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                        data-testid="button-toggle-conversation"
                      >
                        <MessageSquare size={16} className="mr-2" />
                        {showConversationHistory ? 'Ocultar' : 'Ver'} Histórico da Conversa
                      </Button>
                    </div>
                  )}

                  {/* Histórico da Conversa - Estilo Mapa Mental */}
                  {showConversationHistory && selectedFile.conversationId && conversation && (
                    <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
                      <div className="space-y-4 sm:space-y-6">
                        
                        {/* Header da Conversa */}
                        <div className="text-center border-b border-bright-blue/10 pb-4 sm:pb-6">
                          <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                            <MessageSquare className="text-bright-blue" size={16} />
                            <span className="text-sm sm:text-lg font-bold text-dark-blue">
                              {conversation.currentSection ? getSectionName(conversation.currentSection) : 'Histórico da Conversa'}
                            </span>
                            <span className="text-lg sm:text-2xl">{conversation.currentSection ? getSectionIcon(conversation.currentSection) : '💬'}</span>
                          </div>
                          <div className="mt-2 text-xs sm:text-sm text-soft-gray">
                            {conversation.messages?.length || 0} mensagens trocadas
                          </div>
                        </div>

                        {/* Timeline da Conversa */}
                        {loadingConversation ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-blue mx-auto mb-4"></div>
                            <p className="text-soft-gray">Carregando conversa...</p>
                          </div>
                        ) : conversation?.messages && Array.isArray(conversation.messages) && conversation.messages.length > 0 ? (
                          <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                            {conversation.messages.map((message: any, index: number) => (
                              <div key={message.id || index} className={`flex ${
                                message.type === 'user' ? 'justify-end' : 'justify-start'
                              }`}>
                                <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                                  message.type === 'user' 
                                    ? 'bg-gradient-to-r from-bright-blue to-dark-blue text-white'
                                    : 'bg-gradient-to-r from-gray-50 to-gray-100 text-dark-blue border border-gray-200'
                                }`} data-testid={`message-${index}`}>
                                  <div className="flex items-center space-x-2 mb-2">
                                    {message.type === 'user' ? (
                                      <User size={14} className="text-white/80" />
                                    ) : (
                                      <Bot size={14} className="text-bright-blue" />
                                    )}
                                    <span className={`text-xs font-medium ${
                                      message.type === 'user' ? 'text-white/80' : 'text-soft-gray'
                                    }`}>
                                      {message.type === 'user' ? 'Você' : 'IA Assistant'}
                                    </span>
                                    <Clock size={12} className={message.type === 'user' ? 'text-white/60' : 'text-soft-gray/60'} />
                                    <span className={`text-xs ${
                                      message.type === 'user' ? 'text-white/60' : 'text-soft-gray/60'
                                    }`}>
                                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>
                                  <div className={`text-xs sm:text-sm leading-relaxed ${
                                    message.type === 'user' ? 'text-white' : 'text-dark-blue'
                                  }`}>
                                    {processMarkdown(message.content)}
                                  </div>
                                  {message.section && (
                                    <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                                      message.type === 'user' 
                                        ? 'bg-white/20 text-white/80'
                                        : 'bg-bright-blue/10 text-bright-blue'
                                    }`}>
                                      {getSectionIcon(message.section)} {getSectionName(message.section)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-soft-gray">Nenhuma mensagem encontrada</div>
                        )}

                        {/* Progresso Construído */}
                        {conversation.brainstormData && (
                          <div className="border-t border-bright-blue/10 pt-4 sm:pt-6">
                            <h3 className="text-base sm:text-lg font-bold text-dark-blue mb-3 sm:mb-4 text-center">
                              🎯 Progresso da Redação
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              
                              {/* Tema */}
                              {conversation.brainstormData.tema && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                  <div className="text-xs sm:text-sm font-semibold text-blue-700 mb-1 sm:mb-2">🎯 Tema</div>
                                  <div className="text-xs sm:text-sm text-dark-blue">{conversation.brainstormData.tema}</div>
                                </div>
                              )}
                              
                              {/* Tese */}
                              {conversation.brainstormData.tese && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                                  <div className="text-xs sm:text-sm font-semibold text-purple-700 mb-1 sm:mb-2">💡 Tese</div>
                                  <div className="text-xs sm:text-sm text-dark-blue">{conversation.brainstormData.tese}</div>
                                </div>
                              )}
                              
                              {/* Introdução */}
                              {conversation.brainstormData.paragrafos?.introducao && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                                  <div className="text-xs sm:text-sm font-semibold text-green-700 mb-1 sm:mb-2">📝 Introdução</div>
                                  <div className="text-xs sm:text-sm text-dark-blue">{conversation.brainstormData.paragrafos.introducao}</div>
                                </div>
                              )}
                              
                              {/* Desenvolvimento 1 */}
                              {conversation.brainstormData.paragrafos?.desenvolvimento1 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                                  <div className="text-xs sm:text-sm font-semibold text-orange-700 mb-1 sm:mb-2">🔍 Desenvolvimento I</div>
                                  <div className="text-xs sm:text-sm text-dark-blue">{conversation.brainstormData.paragrafos.desenvolvimento1}</div>
                                </div>
                              )}
                              
                              {/* Desenvolvimento 2 */}
                              {conversation.brainstormData.paragrafos?.desenvolvimento2 && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
                                  <div className="text-xs sm:text-sm font-semibold text-indigo-700 mb-1 sm:mb-2">📊 Desenvolvimento II</div>
                                  <div className="text-xs sm:text-sm text-dark-blue">{conversation.brainstormData.paragrafos.desenvolvimento2}</div>
                                </div>
                              )}
                              
                              {/* Conclusão */}
                              {conversation.brainstormData.paragrafos?.conclusao && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 sm:col-span-2">
                                  <div className="text-xs sm:text-sm font-semibold text-red-700 mb-1 sm:mb-2">✅ Conclusão</div>
                                  <div className="text-xs sm:text-sm text-dark-blue">{conversation.brainstormData.paragrafos.conclusao}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Informações da Conversa */}
                        <div className="text-center border-t border-bright-blue/10 pt-4">
                          <div className="text-xs text-soft-gray">
                            Conversa {conversation.createdAt ? `criada em: ${new Date(conversation.createdAt).toLocaleString('pt-BR')}` : ''}
                          </div>
                        </div>

                      </div>
                    </LiquidGlassCard>
                  )}

                  {/* Análise da Proposta */}
                  <div className="p-4 bg-white/60 rounded-xl border border-bright-blue/20">
                    <h4 className="text-lg font-semibold text-dark-blue mb-4">📋 Análise da Proposta</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-soft-gray mb-1">Proposta:</p>
                        <p className="text-dark-blue">{selectedFile.outlineData.proposta}</p>
                      </div>
                      {selectedFile.outlineData.palavrasChave && selectedFile.outlineData.palavrasChave.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-soft-gray mb-1">Palavras-chave obrigatórias:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedFile.outlineData.palavrasChave.map((palavra: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-bright-blue/10 text-bright-blue rounded-full text-sm font-medium">
                                {palavra}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedFile.outlineData.categoriaTematica && (
                        <div>
                          <p className="text-sm font-medium text-soft-gray mb-1">Categoria Temática:</p>
                          <p className="text-dark-blue capitalize">{selectedFile.outlineData.categoriaTematica}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Repertórios Sugeridos */}
                  {selectedFile.outlineData.repertoriosSugeridos && selectedFile.outlineData.repertoriosSugeridos.length > 0 && (
                    <div className="p-4 bg-white/60 rounded-xl border border-emerald-200/50">
                      <h4 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                        <span className="text-emerald-600">💡</span>
                        Repertórios Sugeridos
                      </h4>
                      <div className="space-y-4">
                        {selectedFile.outlineData.repertoriosSugeridos.map((repertorio: any, idx: number) => (
                          <div key={idx} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/30">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-dark-blue">{repertorio.titulo}</p>
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 rounded text-xs">
                                    {repertorio.tipo}
                                  </span>
                                </div>
                                <p className="text-sm text-soft-gray">
                                  <strong className="text-dark-blue">Como usar:</strong> {repertorio.relacao}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roteiro em 4 Blocos */}
                  <div className="space-y-6">
                    {/* Introdução */}
                    {selectedFile.outlineData.introducao && (
                      <div className="p-4 bg-white/60 rounded-xl border border-blue-200/50">
                        <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm">1</span>
                          1º Parágrafo - Introdução
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
                            <p className="text-xs font-medium text-blue-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Contextualização com repertório sociocultural que apresente o tema</p>
                            <p className="text-dark-blue"><strong>1ª frase:</strong> {selectedFile.outlineData.introducao.frase1}</p>
                          </div>
                          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
                            <p className="text-xs font-medium text-blue-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Apresentação do problema ou desafio central do tema</p>
                            <p className="text-dark-blue"><strong>2ª frase:</strong> {selectedFile.outlineData.introducao.frase2}</p>
                          </div>
                          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
                            <p className="text-xs font-medium text-blue-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Tese com os dois argumentos que serão desenvolvidos</p>
                            <p className="text-dark-blue"><strong>3ª frase:</strong> {selectedFile.outlineData.introducao.frase3}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 1º Desenvolvimento */}
                    {selectedFile.outlineData.desenvolvimento1 && (
                      <div className="p-4 bg-white/60 rounded-xl border border-purple-200/50">
                        <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-sm">2</span>
                          2º Parágrafo - 1º Desenvolvimento
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/30">
                            <p className="text-xs font-medium text-purple-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Tópico frasal apresentando o primeiro argumento</p>
                            <p className="text-dark-blue"><strong>1ª frase:</strong> {selectedFile.outlineData.desenvolvimento1.frase1}</p>
                          </div>
                          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/30">
                            <p className="text-xs font-medium text-purple-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Repertório legitimado (dados, citações, fatos) que comprove o argumento</p>
                            <p className="text-dark-blue"><strong>2ª frase:</strong> {selectedFile.outlineData.desenvolvimento1.frase2}</p>
                          </div>
                          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/30">
                            <p className="text-xs font-medium text-purple-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Análise crítica conectando o repertório ao tema e mostrando as consequências</p>
                            <p className="text-dark-blue"><strong>3ª frase:</strong> {selectedFile.outlineData.desenvolvimento1.frase3}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2º Desenvolvimento */}
                    {selectedFile.outlineData.desenvolvimento2 && (
                      <div className="p-4 bg-white/60 rounded-xl border border-amber-200/50">
                        <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-amber-500 text-white rounded-full text-sm">3</span>
                          3º Parágrafo - 2º Desenvolvimento
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
                            <p className="text-xs font-medium text-amber-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Tópico frasal apresentando o segundo argumento</p>
                            <p className="text-dark-blue"><strong>1ª frase:</strong> {selectedFile.outlineData.desenvolvimento2.frase1}</p>
                          </div>
                          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
                            <p className="text-xs font-medium text-amber-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Repertório legitimado (dados, citações, fatos) que comprove o argumento</p>
                            <p className="text-dark-blue"><strong>2ª frase:</strong> {selectedFile.outlineData.desenvolvimento2.frase2}</p>
                          </div>
                          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
                            <p className="text-xs font-medium text-amber-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Análise crítica conectando o repertório ao tema e mostrando as consequências</p>
                            <p className="text-dark-blue"><strong>3ª frase:</strong> {selectedFile.outlineData.desenvolvimento2.frase3}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conclusão */}
                    {selectedFile.outlineData.conclusao && (
                      <div className="p-4 bg-white/60 rounded-xl border border-green-200/50">
                        <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-sm">4</span>
                          4º Parágrafo - Conclusão
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                            <p className="text-xs font-medium text-green-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Retomada da tese apresentada na introdução</p>
                            <p className="text-dark-blue"><strong>1ª frase:</strong> {selectedFile.outlineData.conclusao.frase1}</p>
                          </div>
                          <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                            <p className="text-xs font-medium text-green-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Proposta de intervenção com agente + ação + meio/modo + finalidade</p>
                            <p className="text-dark-blue"><strong>2ª frase:</strong> {selectedFile.outlineData.conclusao.frase2}</p>
                          </div>
                          <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                            <p className="text-xs font-medium text-green-600 mb-1">💡 O que deve ter:</p>
                            <p className="text-xs text-soft-gray mb-2">Detalhamento da proposta de intervenção (como será feito)</p>
                            <p className="text-dark-blue"><strong>3ª frase:</strong> {selectedFile.outlineData.conclusao.frase3}</p>
                          </div>
                        </div>
                      </div>
                    )}
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
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (selectedFile) {
                      deleteFile(selectedFile.id, selectedFile.type, selectedFile.title);
                      setShowFileDetails(false);
                    }
                  }}
                  data-testid="button-delete-header"
                >
                  <Trash2 size={18} className="mr-2" />
                  Excluir
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" aria-describedby="delete-confirmation-description">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
              <Trash2 className="mr-3 text-red-600" size={20} />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          
          <div id="delete-confirmation-description" className="space-y-4">
            <p className="text-soft-gray">
              Tem certeza que deseja excluir <strong className="text-dark-blue">"{fileToDelete?.title}"</strong>?
            </p>
            <p className="text-sm text-red-600">
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setFileToDelete(null);
                }}
                className="flex-1"
                data-testid="button-cancel-delete"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-confirm-delete"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Arquivo Bloqueado */}
      <Dialog open={showLockedDialog} onOpenChange={setShowLockedDialog}>
        <DialogContent className="max-w-md" aria-describedby="locked-file-description">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
              <span className="mr-3 text-3xl">🔒</span>
              Limite do Plano Gratuito Atingido
            </DialogTitle>
          </DialogHeader>
          
          <div id="locked-file-description" className="space-y-4">
            <p className="text-soft-gray">
              Você atingiu o limite de <strong className="text-dark-blue">20 arquivos</strong> no plano gratuito.
            </p>
            <p className="text-sm text-soft-gray">
              Para acessar todos os seus arquivos salvos, você pode:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-dark-blue flex items-center">
                <span className="mr-2">✨</span>
                Upgrade para o Plano Pro
              </h4>
              <ul className="text-sm text-soft-gray space-y-1 ml-6">
                <li>• Biblioteca <strong>ilimitada</strong></li>
                <li>• Acesso a todos os arquivos</li>
                <li>• Uso completo de IA</li>
                <li>• Material exclusivo</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-dark-blue mb-2">
                Ou continue no plano gratuito:
              </h4>
              <p className="text-sm text-soft-gray">
                Você pode apagar arquivos antigos para liberar espaço e visualizar os novos arquivos.
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowLockedDialog(false)}
                className="flex-1"
                data-testid="button-stay-free"
              >
                Continuar Gratuito
              </Button>
              <Button 
                onClick={() => {
                  setShowLockedDialog(false);
                  setLocation('/pricing');
                }}
                className="flex-1 bg-gradient-to-r from-bright-blue to-purple-600 text-white hover:from-bright-blue hover:to-purple-700"
                data-testid="button-upgrade-pro"
              >
                <span className="mr-2">🚀</span>
                Upgrade Pro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}