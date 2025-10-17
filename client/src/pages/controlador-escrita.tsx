import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Save, RefreshCw, RotateCcw, Edit3, ChevronDown, ChevronUp, FileText, Shuffle, BookOpen, Target, HelpCircle, Lightbulb, Search, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { 
  TextModificationConfig, 
  TextModificationResult, 
  TextModificationType,
  WordDifficulty
} from "@shared/schema";
import { AIUsageProgress, refreshAIUsageStats } from "@/components/ai-usage-progress";

export default function ControladorEscrita() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Estados para o texto
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para os controles
  const [textLength, setTextLength] = useState([100]); // Percentage: 50-200%
  
  // Estado para o tipo de modificação atual
  const [modificationType, setModificationType] = useState<TextModificationType | "">("");
  
  // Estados para controlar cards expandidos (permite múltiplos abertos)
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  
  // Estados para modificações ativas
  const [activeModifications, setActiveModifications] = useState<Set<string>>(new Set());
  
  // Estados para formalidade
  const [wordDifficulty, setWordDifficulty] = useState<WordDifficulty>("medio");
  const [meaningPreservation, setMeaningPreservation] = useState<"preserve" | "change">("preserve");
  
  // Estados para estruturas dissertativas
  const [selectedStructure, setSelectedStructure] = useState<string>("causal");
  const [structureType, setStructureType] = useState<string>("tese-argumento");
  
  // Estados para integração com repertório
  const [suggestedRepertoires, setSuggestedRepertoires] = useState<any[]>([]);
  const [isLoadingRepertoires, setIsLoadingRepertoires] = useState(false);
  
  // Estados para feedback e ajuda
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [helpSections, setHelpSections] = useState<{ [key: string]: boolean }>({});
  
  // Estados para salvar na biblioteca
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  
  // Estados para adicionar repertório
  const [showRepertoireDialog, setShowRepertoireDialog] = useState(false);
  const [selectedRepertoire, setSelectedRepertoire] = useState<any>(null);
  
  // Mutation para salvar texto
  const saveTextMutation = useMutation({
    mutationFn: async (data: { title: string; originalText: string; modifiedText: string; modificationType: string; activeModifications: string[] }) => {
      return await apiRequest('/api/saved-texts', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-texts'] });
      toast({
        title: "Texto salvo na biblioteca!",
        description: "O texto modificado foi adicionado à sua biblioteca pessoal.",
      });
      setShowSaveDialog(false);
      setSaveTitle("");
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o texto. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Função para alternar seções de ajuda
  const toggleHelpSection = (cardId: string) => {
    setHelpSections(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };
  
  // Função para buscar repertórios relevantes usando o texto processado
  const fetchRelevantRepertoires = async (processedText: string, modifications: string[]) => {
    if (!processedText.trim() || modifications.length === 0) {
      setSuggestedRepertoires([]);
      return;
    }
    
    setIsLoadingRepertoires(true);
    try {
      // Extrair palavras-chave do texto processado para maior relevância
      const keywords = processedText.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5)
        .join(' ');
      
      // Determinar categoria baseada nas modificações aplicadas
      let category = 'education';
      if (modifications.includes('estrutura-causal')) {
        category = 'social';
      } else if (modifications.includes('estrutura-comparativa')) {
        category = 'technology';
      }
      
      const response = await fetch('/api/repertoires/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: keywords,
          category,
          popularity: 'popular',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestedRepertoires(data.results.slice(0, 3)); // Limitar a 3 sugestões
      }
    } catch (error) {
      console.error('Erro ao buscar repertórios:', error);
    } finally {
      setIsLoadingRepertoires(false);
    }
  };
  
  // Função para gerar feedback educativo detalhado
  const generateFeedback = (modifications: string[], lengthPercentage: number, processedText: string = modifiedText) => {
    const feedbacks = [];
    
    // Análise estrutural do texto
    const textAnalysis = analyzeTextStructure(originalText, processedText);
    const actualLength = processedText.length;
    
    if (modifications.includes('formalidade')) {
      feedbacks.push(`📝 **REESCRITA APLICADA**
• Tamanho alvo: ${lengthPercentage}% do original
• Tamanho real: ${actualLength} caracteres
• Complexidade lexical: ${wordDifficulty === 'simples' ? 'Simplificada' : wordDifficulty === 'complexo' ? 'Elevada' : 'Equilibrada'}
• Preservação de sentido: ${meaningPreservation === 'preserve' ? 'Mantida' : 'Alterada intencionalmente'}
• **Resultado**: Texto ${lengthPercentage < 80 ? 'resumido' : lengthPercentage > 120 ? 'expandido' : 'reescrito'} com ${meaningPreservation === 'preserve' ? 'mesmo significado' : 'significado alterado'}`);
    }
    
    if (modifications.includes('estrutura-causal')) {
      feedbacks.push(`🎯 **ESTRUTURA CAUSAL IMPLEMENTADA**
• Padrão aplicado: ${structureType.replace('-', ' → ')}
• **Força argumentativa**: Estabelece relações de causa-efeito claras
• **Coesão textual**: Conectivos causais fortalecem a progressão lógica
• **Persuasão**: Argumentação baseada em evidências e consequências`);
    }
    
    if (modifications.includes('estrutura-comparativa')) {
      feedbacks.push(`🔄 **ESTRUTURA COMPARATIVA INTEGRADA**
• **Método**: Conectivos de comparação e contraste
• **Efeito retórico**: Estabelece paralelos e diferenciações
• **Clareza argumentativa**: Facilita compreensão através de analogias
• **Profundidade**: Múltiplas perspectivas sobre o mesmo tema`);
    }
    
    if (modifications.includes('estrutura-oposicao')) {
      feedbacks.push(`⚖️ **ESTRUTURA DE OPOSIÇÃO ELABORADA**
• **Técnica**: Apresentação de contrapontos equilibrados
• **Dialética**: Tese vs. antítese para síntese argumentativa
• **Credibilidade**: Demonstra conhecimento de múltiplas perspectivas
• **Persuasão**: Refuta objeções antecipadamente`);
    }
    
    // Análise quantitativa e qualitativa
    const analysisText = `📊 **ANÁLISE TEXTUAL COMPLETA**
• Extensão: ${actualLength} caracteres ${actualLength > 500 ? '(formato dissertativo ideal)' : actualLength > 200 ? '(parágrafo bem desenvolvido)' : '(resumo ou introdução)'}
• Densidade argumentativa: ${textAnalysis.argumentDensity}
• Complexidade sintática: ${textAnalysis.syntaxComplexity}
• Registro linguístico: ${textAnalysis.linguisticRegister}`;
    
    if (actualLength > 0) {
      feedbacks.push(analysisText);
    }
    
    // Recomendações pedagógicas
    if (modifications.length > 0) {
      const recommendations = generatePedagogicalRecommendations(modifications, actualLength);
      feedbacks.push(`💡 **RECOMENDAÇÕES PEDAGÓGICAS**
${recommendations}`);
    }
    
    if (feedbacks.length > 0) {
      return feedbacks.join('\n\n');
    } else if (modifications.length > 0) {
      return '🔧 **MODIFICAÇÕES SELECIONADAS**: ' + modifications.join(', ') + '\n\n💡 Execute as modificações para receber análise detalhada da construção argumentativa e melhorias aplicadas ao seu texto.';
    } else {
      return 'Selecione e aplique modificações para receber análise pedagógica completa sobre a construção do seu texto.';
    }
  };

  // Função para analisar estrutura do texto
  const analyzeTextStructure = (original: string, modified: string) => {
    const wordCount = modified.split(/\s+/).length;
    const sentenceCount = modified.split(/[.!?]+/).length - 1;
    const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
    
    return {
      argumentDensity: wordCount > 100 ? 'Alta' : wordCount > 50 ? 'Média' : 'Básica',
      syntaxComplexity: avgWordsPerSentence > 20 ? 'Complexa' : avgWordsPerSentence > 12 ? 'Moderada' : 'Simples',
      linguisticRegister: wordDifficulty === 'complexo' ? 'Acadêmico' : wordDifficulty === 'medio' ? 'Padrão' : 'Coloquial'
    };
  };

  // Função para gerar recomendações pedagógicas
  const generatePedagogicalRecommendations = (modifications: string[], textLength: number) => {
    const recommendations = [];
    
    if (modifications.includes('formalidade')) {
      recommendations.push('• Continue variando o registro conforme o contexto (vestibular = formal, blog = informal)');
    }
    if (modifications.includes('estrutura-causal')) {
      recommendations.push('• Explore mais conectivos causais: "visto que", "uma vez que", "por conseguinte"');
    }
    if (modifications.includes('estrutura-comparativa')) {
      recommendations.push('• Pratique analogias históricas e sociais para enriquecer comparações');
    }
    if (modifications.includes('estrutura-oposicao')) {
      recommendations.push('• Desenvolva contrapontos antes de refutá-los para maior credibilidade');
    }
    
    if (textLength < 200) {
      recommendations.push('• Desenvolva mais os argumentos com exemplos concretos e dados');
    } else if (textLength > 800) {
      recommendations.push('• Considere dividir em parágrafos menores para melhor organização');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : '• Continue praticando diferentes técnicas de escrita argumentativa';
  };

  // Função para abrir dialog de repertório
  const openRepertoireDialog = (repertoire: any) => {
    if (!modifiedText.trim()) {
      toast({
        title: "Nenhum texto para enriquecer",
        description: "Primeiro gere um texto modificado para poder adicionar repertórios.",
        variant: "destructive",
      });
      return;
    }
    setSelectedRepertoire(repertoire);
    setShowRepertoireDialog(true);
  };

  // Função para inserir repertório em posição específica
  const insertRepertoireAt = (position: 'inicio' | 'meio' | 'final') => {
    if (!selectedRepertoire || !modifiedText.trim()) return;

    // Formata o repertório de forma acadêmica
    const repertoireText = ` Conforme evidenciado por ${selectedRepertoire.title}, ${selectedRepertoire.description.split('.')[0].toLowerCase()}.`;
    
    let newText = '';
    
    switch (position) {
      case 'inicio':
        // Insere no início, antes do texto
        newText = repertoireText.trim() + ' ' + modifiedText;
        break;
        
      case 'meio':
        // Insere após a primeira frase (busca primeiro ponto final)
        const firstPeriodIndex = modifiedText.indexOf('. ');
        if (firstPeriodIndex !== -1) {
          newText = modifiedText.substring(0, firstPeriodIndex + 1) + 
                   repertoireText + 
                   modifiedText.substring(firstPeriodIndex + 1);
        } else {
          // Se não encontrar ponto, insere no meio do texto
          const middleIndex = Math.floor(modifiedText.length / 2);
          const spaceIndex = modifiedText.indexOf(' ', middleIndex);
          if (spaceIndex !== -1) {
            newText = modifiedText.substring(0, spaceIndex) + 
                     repertoireText + 
                     modifiedText.substring(spaceIndex);
          } else {
            newText = modifiedText + repertoireText;
          }
        }
        break;
        
      case 'final':
        // Insere no final do texto
        newText = modifiedText + repertoireText;
        break;
    }
    
    setModifiedText(newText);
    setShowRepertoireDialog(false);
    setSelectedRepertoire(null);
    
    const positionLabel = position === 'inicio' ? 'início' : position === 'meio' ? 'meio' : 'final';
    toast({
      title: "Repertório adicionado!",
      description: `"${selectedRepertoire.title}" foi integrado ao ${positionLabel} do seu texto.`,
    });
  };

  // Função para alternar cards expandidos
  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  // Função para alternar modificações ativas
  const toggleModification = (modificationType: string) => {
    setActiveModifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modificationType)) {
        newSet.delete(modificationType);
      } else {
        newSet.add(modificationType);
      }
      return newSet;
    });
  };

  // Função para aplicar uma modificação local como fallback
  const applyLocalModification = (text: string, type: string): string => {
    switch (type) {
      case 'formalidade':
        if (meaningPreservation === 'change') {
          // Mudança de sentido: inverte a perspectiva
          const changedText = text.replace(/\bimportante\b/g, "secundário")
            .replace(/\bpositivo\b/g, "negativo")
            .replace(/\bbom\b/g, "problemático")
            .replace(/\bnecessário\b/g, "dispensável");
          return wordDifficulty === 'complexo' ? changedText.replace(/\bvocê\b/g, "Vossa Senhoria") : changedText;
        } else {
          // Preserva sentido: apenas ajusta complexidade das palavras
          if (wordDifficulty === 'complexo') {
            return text
              .replace(/\bvocê\b/g, "Vossa Senhoria")
              .replace(/\btá\b/g, "está")
              .replace(/\bpra\b/g, "para")
              .replace(/\bfazer\b/g, "realizar")
              .replace(/\bver\b/g, "analisar")
              .replace(/\bcoisa\b/g, "elemento");
          } else if (wordDifficulty === 'simples') {
            return text
              .replace(/\bVossa Senhoria\b/g, "você")
              .replace(/\bestá\b/g, "tá")
              .replace(/\bpara\b/g, "pra")
              .replace(/\brealizar\b/g, "fazer")
              .replace(/\banalisar\b/g, "ver");
          }
          return text;
        }
        
      case 'estrutura-causal':
        return `${text} devido a questões fundamentais, uma vez que os dados demonstram a necessidade de análise aprofundada.`;
        
      case 'estrutura-comparativa':
        return `Assim como observamos em situações similares, também ${text.toLowerCase()}, estabelecendo um paralelo importante.`;
        
      case 'estrutura-condicional':
        return `Se considerarmos que ${text.toLowerCase()}, então podemos concluir que esta análise é fundamental.`;
        
      case 'estrutura-oposicao':
        return `Embora existam perspectivas contrárias, ${text.toLowerCase()}, evidenciando a complexidade da questão.`;
          
      default:
        return text;
    }
  };

  // Função para aplicar todas as modificações selecionadas
  const applyAllModifications = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Texto necessário",
        description: "Digite um texto para poder modificá-lo.",
        variant: "destructive",
      });
      return;
    }

    if (activeModifications.size === 0) {
      toast({
        title: "Nenhuma modificação selecionada",
        description: "Selecione pelo menos uma modificação para aplicar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    let processedText = originalText;
    const appliedModifications: string[] = [];
    
    try {
      // Apply each selected modification in sequence
      for (const modificationType of Array.from(activeModifications)) {
        const config: any = {};
        
        if (modificationType === 'formalidade') {
          config.textLength = textLength[0];
          config.wordDifficulty = wordDifficulty;
          config.meaningPreservation = meaningPreservation;
        } else if (modificationType.includes('estrutura-')) {
          config.structureType = structureType;
          config.selectedStructure = selectedStructure;
        }
        
        try {
          // Try AI processing first
          const response = await fetch('/api/text-modification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: processedText,
              type: modificationType,
              config: config
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            processedText = result.modifiedText;
            appliedModifications.push(`${modificationType} (IA)`);
            
            // Atualizar barra de progresso de IA após uso de tokens
            refreshAIUsageStats();
          } else {
            // Fallback to local processing
            processedText = applyLocalModification(processedText, modificationType);
            appliedModifications.push(`${modificationType} (Local)`);
          }
        } catch (error) {
          // Fallback to local processing
          processedText = applyLocalModification(processedText, modificationType);
          appliedModifications.push(`${modificationType} (Local)`);
        }
      }
      
      setModifiedText(processedText);
      // Store the raw modification description, not forcing enum cast
      const modificationDescription = appliedModifications.length > 0 ? appliedModifications.join(', ') : "";
      setModificationType(modificationDescription as TextModificationType);
      
      // Gerar feedback educativo com o texto processado atual
      const activeMods = Array.from(activeModifications);
      setFeedbackText(generateFeedback(activeMods, textLength[0], processedText));
      
      // Buscar repertórios relevantes usando o texto processado
      await fetchRelevantRepertoires(processedText, activeMods);
      
      toast({
        title: "Modificações aplicadas com sucesso!",
        description: `Aplicadas: ${appliedModifications.join(', ')}`,
      });
      
      // Limpar todas as modificações selecionadas após aplicar
      setActiveModifications(new Set());
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível aplicar as modificações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setLocation(backUrl);
  };

  const simulateTextProcessing = async (type: string) => {
    if (!originalText.trim()) {
      toast({
        title: "Texto necessário",
        description: "Digite um texto para poder modificá-lo.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setModificationType(type as TextModificationType);
    
    try {
      // Build configuration based on current settings
      const config: any = {};
      
      if (type === 'formalidade') {
        config.textLength = textLength[0];
        config.wordDifficulty = wordDifficulty;
        config.meaningPreservation = meaningPreservation;
      } else if (type.includes('estrutura-')) {
        config.structureType = structureType;
        config.selectedStructure = selectedStructure;
      }
      
      console.log(`🤖 Processando texto com IA: ${type}`, config);
      
      // Call the AI text modification API
      const response = await fetch('/api/text-modification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          type: type,
          config: config
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na modificação do texto');
      }
      
      const result = await response.json();
      
      // Atualizar barra de progresso de IA após uso de tokens
      refreshAIUsageStats();
      
      setModifiedText(result.modifiedText);
      
      // Gerar feedback educativo com o texto processado
      setFeedbackText(generateFeedback([type], textLength[0], result.modifiedText));
      
      // Buscar repertórios relevantes com o texto processado
      await fetchRelevantRepertoires(result.modifiedText, [type]);
      
      // Show success message with source info
      const sourceLabel = result.source === 'ai' ? 'IA' : 
                         result.source === 'cache' ? 'Cache' : 'Fallback';
      
      toast({
        title: "Texto modificado com sucesso!",
        description: `O texto foi reescrito usando: ${type} (${sourceLabel})`,
      });
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      
      // Fallback to local processing if API fails
      console.log('🔄 Usando processamento local como fallback');
      
      let processedText = originalText;
      
      // Use the same local modification logic as in applyLocalModification
      processedText = applyLocalModification(originalText, type);
      
      setModifiedText(processedText);
      
      toast({
        title: "Processamento offline",
        description: "Texto modificado usando processamento local.",
        variant: "default",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = async () => {
    if (!modifiedText) {
      toast({
        title: "Nenhum texto para copiar",
        description: "Primeiro modifique o texto para poder copiá-lo.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(modifiedText);
      toast({
        title: "Texto copiado!",
        description: "O texto modificado foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveToLibrary = () => {
    if (!modifiedText) {
      toast({
        title: "Nenhum texto para salvar",
        description: "Primeiro modifique o texto para poder salvá-lo.",
        variant: "destructive",
      });
      return;
    }
    
    setShowSaveDialog(true);
  };

  const confirmSaveToLibrary = () => {
    if (!saveTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, forneça um título para o texto.",
        variant: "destructive",
      });
      return;
    }

    saveTextMutation.mutate({
      title: saveTitle,
      originalText,
      modifiedText,
      modificationType: modificationType || "",
      activeModifications: Array.from(activeModifications),
    });
  };

  const resetTexts = () => {
    setModifiedText("");
    setModificationType("");
    setActiveModifications(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com AI Usage integrado */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-back"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center flex-shrink-0">
                <Edit3 className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Controlador de Escrita</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <Edit3 className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Controlador de Escrita</h1>
              </div>
            </div>
            <p className="text-soft-gray">Refine seu texto com os controles de estilo</p>
          </div>
        </div>
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-24 sm:pt-32 min-h-[calc(100vh-200px)] flex flex-col">
        {/* Área de Texto Original */}
        <div className="mb-4 sm:mb-6">
          <LiquidGlassCard className="p-4 sm:p-6">
            <div>
              <Label htmlFor="original-text" className="text-sm sm:text-lg font-semibold text-dark-blue mb-2 sm:mb-3 block">
                Texto Original
              </Label>
              <Textarea
                id="original-text"
                placeholder="Digite aqui o parágrafo que você deseja modificar. Você pode escrever sobre qualquer tema e aplicar diferentes estilos e modificações..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="min-h-[280px] sm:min-h-[200px] text-sm sm:text-base leading-relaxed resize-none"
                data-testid="textarea-original"
              />
            </div>
          </LiquidGlassCard>
        </div>

        {/* Controles - Mobile Otimizado */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-3 md:items-stretch">
          {/* Card de Formalidade */}
          <div 
            className={`min-h-[100px] md:h-[480px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-sky-50/50 to-sky-100/50 border-sky-200 hover:border-sky-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('formalidade') ? 'ring-2 ring-sky-200' : ''}`}
            onClick={isMobile ? () => toggleCard('formalidade') : undefined}
          >
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-dark-blue leading-tight">Reescrita</h3>
                  <p className="text-xs text-soft-gray leading-tight">Ajuste o nível e sentido</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('formalidade') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('formalidade')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seção de Ajuda sobreposta */}
                {helpSections.formalidade && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-4 rounded-lg border border-sky-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-dark-blue">Como usar Reescrita</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHelpSection('formalidade')}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-3 text-xs text-soft-gray">
                      <p><strong>💡 Como usar:</strong> Selecione o nível de formalidade desejado e escolha se quer preservar ou alterar o sentido.</p>
                      <p><strong>📝 Exemplo:</strong> "É importante estudar" → "É fundamental compreender" (preserva) ou "É dispensável estudar" (altera)</p>
                      <p><strong>🎯 Ideal para:</strong> Ajustar o registro linguístico e adaptar o texto ao contexto acadêmico ou coloquial.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="formalidade-active" 
                    checked={activeModifications.has('formalidade')}
                    onCheckedChange={() => toggleModification('formalidade')}
                  />
                  <Label htmlFor="formalidade-active" className="text-sm font-medium text-dark-blue">
                    Incluir reescrita
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Preservação do Sentido
                  </Label>
                  <RadioGroup value={meaningPreservation} onValueChange={(value) => setMeaningPreservation(value as "preserve" | "change")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="preserve" id="preserve" />
                      <Label htmlFor="preserve" className="text-xs">Reescrever sem mudar o sentido</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="change" id="change" />
                      <Label htmlFor="change" className="text-xs">Reescrever mudando o sentido</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Tamanho do Texto: {textLength[0]}%
                  </Label>
                  <Slider
                    value={textLength}
                    onValueChange={setTextLength}
                    min={50}
                    max={200}
                    step={10}
                    className="mb-2"
                    data-testid="slider-text-length"
                  />
                  <div className="flex justify-between text-xs text-soft-gray">
                    <span>Menor (50%)</span>
                    <span>Original (100%)</span>
                    <span>Maior (200%)</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Complexidade das Palavras
                  </Label>
                  <RadioGroup value={wordDifficulty} onValueChange={(value) => setWordDifficulty(value as WordDifficulty)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="simples" id="simples" />
                      <Label htmlFor="simples" className="text-xs">Simples</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medio" id="medio" />
                      <Label htmlFor="medio" className="text-xs">Médio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="complexo" id="complexo" />
                      <Label htmlFor="complexo" className="text-xs">Complexo</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Botão de Ajuda */}
                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('formalidade')}
                    className="w-full flex items-center justify-center gap-2 p-2 text-xs text-dark-blue hover:bg-sky-50"
                    data-testid="button-help-formalidade"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Como usar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Card de Estruturas Causais */}
          <div 
            className={`min-h-[100px] md:h-[480px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 border-emerald-200 hover:border-emerald-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('estrutura-causal') ? 'ring-2 ring-emerald-200' : ''}`}
            onClick={isMobile ? () => toggleCard('estrutura-causal') : undefined}
          >
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-dark-blue leading-tight">Estruturas Causais</h3>
                  <p className="text-xs text-soft-gray leading-tight">Causa e consequência</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('estrutura-causal') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('estrutura-causal')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seção de Ajuda sobreposta */}
                {helpSections['estrutura-causal'] && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-dark-blue">Como usar Estruturas Causais</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHelpSection('estrutura-causal')}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-3 text-xs text-soft-gray">
                      <p><strong>🎯 Como usar:</strong> Estabeleça relações de causa e efeito no seu texto usando conectivos causais.</p>
                      <p><strong>📝 Exemplo:</strong> "A desigualdade social" → "A desigualdade social ocorre devido às políticas públicas insuficientes"</p>
                      <p><strong>🏆 Ideal para:</strong> Problemas sociais, questões ambientais, análises econômicas e temas que envolvem consequências.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="estrutura-causal-active" 
                    checked={activeModifications.has('estrutura-causal')}
                    onCheckedChange={() => toggleModification('estrutura-causal')}
                  />
                  <Label htmlFor="estrutura-causal-active" className="text-sm font-medium text-dark-blue">
                    Aplicar estrutura causal
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Tipo de Estrutura
                  </Label>
                  <RadioGroup value={structureType} onValueChange={setStructureType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tese-argumento" id="tese-argumento" />
                      <Label htmlFor="tese-argumento" className="text-xs">Tese → Argumento → Repertório</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="problema-causa" id="problema-causa" />
                      <Label htmlFor="problema-causa" className="text-xs">Problema → Causa → Dados</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="topico-consequencia" id="topico-consequencia" />
                      <Label htmlFor="topico-consequencia" className="text-xs">Tópico → Consequência → Repertório</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="causa-observacao" id="causa-observacao" />
                      <Label htmlFor="causa-observacao" className="text-xs">Causa → Observação → Repertório</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="efeito-analise" id="efeito-analise" />
                      <Label htmlFor="efeito-analise" className="text-xs">Efeito → Análise → Solução</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fator-impacto" id="fator-impacto" />
                      <Label htmlFor="fator-impacto" className="text-xs">Fator → Impacto → Contexto</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="origem-desenvolvimento" id="origem-desenvolvimento" />
                      <Label htmlFor="origem-desenvolvimento" className="text-xs">Origem → Desenvolvimento → Resultado</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Botão de Ajuda */}
                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('estrutura-causal')}
                    className="w-full flex items-center justify-center gap-2 p-2 text-xs text-dark-blue hover:bg-emerald-50"
                    data-testid="button-help-causal"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Como usar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Card de Estruturas Comparativas */}
          <div 
            className={`min-h-[100px] md:h-[480px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-purple-50/50 to-purple-100/50 border-purple-200 hover:border-purple-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('estrutura-comparativa') ? 'ring-2 ring-purple-200' : ''}`}
            onClick={isMobile ? () => toggleCard('estrutura-comparativa') : undefined}
          >
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shuffle className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-dark-blue leading-tight">Estruturas Comparativas</h3>
                  <p className="text-xs text-soft-gray leading-tight">Comparações e condições</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('estrutura-comparativa') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('estrutura-comparativa')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seção de Ajuda sobreposta */}
                {helpSections['estrutura-comparativa'] && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-dark-blue">Como usar Estruturas Comparativas</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHelpSection('estrutura-comparativa')}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-3 text-xs text-soft-gray">
                      <p><strong>🔄 Como usar:</strong> Crie comparações e analogias para fortalecer seus argumentos com conectivos comparativos.</p>
                      <p><strong>📝 Exemplo:</strong> "A educação é fundamental" → "Assim como a água é vital para plantas, a educação é fundamental"</p>
                      <p><strong>🏆 Ideal para:</strong> Estabelecer paralelos, criar analogias, comparar situações e reforçar argumentos com exemplos similares.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="estrutura-comparativa-active" 
                    checked={activeModifications.has('estrutura-comparativa')}
                    onCheckedChange={() => toggleModification('estrutura-comparativa')}
                  />
                  <Label htmlFor="estrutura-comparativa-active" className="text-sm font-medium text-dark-blue">
                    Aplicar estrutura comparativa
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Tipo de Estrutura
                  </Label>
                  <RadioGroup value={structureType} onValueChange={setStructureType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comparacao-paralela" id="comparacao-paralela" />
                      <Label htmlFor="comparacao-paralela" className="text-xs">Assim como... também</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="forma-similar" id="forma-similar" />
                      <Label htmlFor="forma-similar" className="text-xs">Da mesma forma que...</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="condicional-se" id="condicional-se" />
                      <Label htmlFor="condicional-se" className="text-xs">Se... então</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medida-proporcional" id="medida-proporcional" />
                      <Label htmlFor="medida-proporcional" className="text-xs">Na medida em que...</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enquanto-outro" id="enquanto-outro" />
                      <Label htmlFor="enquanto-outro" className="text-xs">Enquanto... por outro lado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tanto-quanto" id="tanto-quanto" />
                      <Label htmlFor="tanto-quanto" className="text-xs">Tanto quanto...</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="diferente-de" id="diferente-de" />
                      <Label htmlFor="diferente-de" className="text-xs">Diferentemente de...</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="semelhanca-de" id="semelhanca-de" />
                      <Label htmlFor="semelhanca-de" className="text-xs">À semelhança de...</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Botão de Ajuda */}
                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('estrutura-comparativa')}
                    className="w-full flex items-center justify-center gap-2 p-2 text-xs text-dark-blue hover:bg-purple-50"
                    data-testid="button-help-comparativa"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Como usar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Card de Estruturas de Oposição */}
          <div 
            className={`min-h-[100px] md:h-[480px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-amber-50/50 to-amber-100/50 border-amber-200 hover:border-amber-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('estrutura-oposicao') ? 'ring-2 ring-amber-200' : ''}`}
            onClick={isMobile ? () => toggleCard('estrutura-oposicao') : undefined}
          >
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-dark-blue leading-tight">Estruturas de Oposição</h3>
                  <p className="text-xs text-soft-gray leading-tight">Concessão e explicação</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('estrutura-oposicao') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('estrutura-oposicao')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Seção de Ajuda sobreposta */}
                {helpSections['estrutura-oposicao'] && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-dark-blue">Como usar Estruturas de Oposição</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHelpSection('estrutura-oposicao')}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-3 text-xs text-soft-gray">
                      <p><strong>⚖️ Como usar:</strong> Apresente contrapontos e concessões para criar argumentações mais equilibradas e convincentes.</p>
                      <p><strong>📝 Exemplo:</strong> "A tecnologia é benéfica" → "Embora a tecnologia traga riscos, seus benefícios superam as desvantagens"</p>
                      <p><strong>🏆 Ideal para:</strong> Temas polêmicos, debates equilibrados, reconhecer limitações e apresentar visões mais maduras.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="estrutura-oposicao-active" 
                    checked={activeModifications.has('estrutura-oposicao')}
                    onCheckedChange={() => toggleModification('estrutura-oposicao')}
                  />
                  <Label htmlFor="estrutura-oposicao-active" className="text-sm font-medium text-dark-blue">
                    Aplicar estrutura de oposição
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Tipo de Estrutura
                  </Label>
                  <RadioGroup value={structureType} onValueChange={setStructureType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="embora-oposicao" id="embora-oposicao" />
                      <Label htmlFor="embora-oposicao" className="text-xs">Embora... [contraargumento]</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apesar-concessao" id="apesar-concessao" />
                      <Label htmlFor="apesar-concessao" className="text-xs">Apesar de... [objeção]</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conforme-evidencia" id="conforme-evidencia" />
                      <Label htmlFor="conforme-evidencia" className="text-xs">Conforme demonstra...</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exemplo-confirmacao" id="exemplo-confirmacao" />
                      <Label htmlFor="exemplo-confirmacao" className="text-xs">Exemplificado por...</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no-entanto" id="no-entanto" />
                      <Label htmlFor="no-entanto" className="text-xs">No entanto... [contraste]</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contudo" id="contudo" />
                      <Label htmlFor="contudo" className="text-xs">Contudo... [adversidade]</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="por-sua-vez" id="por-sua-vez" />
                      <Label htmlFor="por-sua-vez" className="text-xs">Por sua vez... [alternativa]</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="entretanto" id="entretanto" />
                      <Label htmlFor="entretanto" className="text-xs">Entretanto... [ressalva]</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Botão de Ajuda */}
                <div className="mt-auto pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('estrutura-oposicao')}
                    className="w-full flex items-center justify-center gap-2 p-2 text-xs text-dark-blue hover:bg-amber-50"
                    data-testid="button-help-oposicao"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Como usar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Action Button - Mobile Optimized */}
        <div className="flex justify-center py-3 sm:py-4">
          <LiquidGlassCard className="px-4 sm:px-8 py-3 sm:py-4 w-full">
            <div className="w-full text-center">
              <p className="text-xs sm:text-sm text-soft-gray mb-3 sm:mb-4">
                {activeModifications.size === 0 
                  ? "Selecione as modificações desejadas nos cards acima" 
                  : `${activeModifications.size} modificação${activeModifications.size > 1 ? 'ões' : ''} selecionada${activeModifications.size > 1 ? 's' : ''}`
                }
              </p>
              <Button
                onClick={applyAllModifications}
                disabled={isProcessing || activeModifications.size === 0}
                size="lg"
                className="bg-dark-blue hover:bg-dark-blue/90 text-white font-semibold px-6 sm:px-12 py-3 sm:py-4 w-full max-w-md mx-auto text-sm sm:text-base"
                data-testid="button-apply-all"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="sm:hidden">Processando...</span>
                    <span className="hidden sm:inline">Processando...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="sm:hidden">Aplicar Modificações</span>
                    <span className="hidden sm:inline">Aplicar Todas as Modificações</span>
                  </>
                )}
              </Button>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Área de Resultado - Mobile Optimized */}
        <div>
          <LiquidGlassCard className="min-h-[300px] sm:min-h-0 py-4 sm:py-6 p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <Label className="text-sm sm:text-lg font-semibold text-dark-blue flex items-center gap-2">
                  Resultado
                  {modificationType && (
                    <Badge variant="secondary" className="text-xs">
                      {modificationType}
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                    data-testid="button-copy"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Copiar</span>
                    <span className="sm:hidden">Copiar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToLibrary}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                    data-testid="button-save"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Salvar</span>
                    <span className="sm:hidden">Salvar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTexts}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                    data-testid="button-clear"
                  >
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Limpar</span>
                    <span className="sm:hidden">Limpar</span>
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="O texto modificado aparecerá aqui. Você pode editar diretamente este resultado."
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                className="min-h-[280px] sm:min-h-[200px] text-sm sm:text-base leading-relaxed resize-none"
                data-testid="textarea-result"
              />

              {/* Repertórios Sugeridos */}
              {(suggestedRepertoires.length > 0 || isLoadingRepertoires) && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-dark-blue" />
                      <h4 className="text-sm font-semibold text-dark-blue">
                        Repertórios Sugeridos para seu Texto
                      </h4>
                    </div>
                    
                    {suggestedRepertoires.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {suggestedRepertoires.map((repertoire, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium text-dark-blue line-clamp-2">
                                  {repertoire.title}
                                </h5>
                                <p className="text-xs text-soft-gray mt-1 line-clamp-3">
                                  {repertoire.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {repertoire.type}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {repertoire.category}
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 bg-bright-blue/10 hover:bg-bright-blue/20 text-bright-blue border-bright-blue/30"
                                  onClick={() => openRepertoireDialog(repertoire)}
                                  data-testid={`button-add-repertoire-${index}`}
                                >
                                  <Target className="h-3 w-3 mr-1" />
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isLoadingRepertoires && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2 text-soft-gray">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Buscando repertórios relevantes...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </LiquidGlassCard>
        </div>

      </div>

      {/* Dialog para salvar na biblioteca */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Texto na Biblioteca</DialogTitle>
            <DialogDescription>
              Dê um título para o texto modificado para salvá-lo na sua biblioteca pessoal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-title">Título do Texto</Label>
              <Input
                id="save-title"
                placeholder="Ex: Texto sobre educação - Formal"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmSaveToLibrary()}
                data-testid="input-save-title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveTitle("");
                }}
                data-testid="button-cancel-save"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmSaveToLibrary}
                disabled={saveTextMutation.isPending}
                data-testid="button-confirm-save"
              >
                {saveTextMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para escolher onde adicionar o repertório */}
      <Dialog open={showRepertoireDialog} onOpenChange={setShowRepertoireDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Repertório ao Texto</DialogTitle>
            <DialogDescription>
              Escolha onde deseja inserir o repertório "{selectedRepertoire?.title}" no seu texto.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRepertoire && (
            <div className="space-y-4 py-4">
              {/* Preview do repertório */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-soft-gray">
                  <strong>Preview:</strong> Conforme evidenciado por {selectedRepertoire.title}, {selectedRepertoire.description.split('.')[0].toLowerCase()}.
                </p>
              </div>

              {/* Opções de posicionamento */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Escolha a posição:</Label>
                
                <div className="grid gap-2">
                  {/* Opção: Início */}
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => insertRepertoireAt('inicio')}
                    data-testid="button-insert-inicio"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-bright-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                      <span className="font-semibold text-dark-blue">Início do Texto</span>
                    </div>
                    <span className="text-xs text-soft-gray text-left">
                      Insere o repertório antes do texto, como contextualização inicial
                    </span>
                  </Button>

                  {/* Opção: Meio Inteligente */}
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4 hover:bg-blue-50 hover:border-blue-300 border-2 border-bright-blue bg-bright-blue/5"
                    onClick={() => insertRepertoireAt('meio')}
                    data-testid="button-insert-meio"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-bright-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                      <span className="font-semibold text-dark-blue">Meio do Texto (Recomendado)</span>
                    </div>
                    <span className="text-xs text-soft-gray text-left">
                      Insere após a primeira frase para melhor fluidez argumentativa
                    </span>
                  </Button>

                  {/* Opção: Final */}
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => insertRepertoireAt('final')}
                    data-testid="button-insert-final"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-bright-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                      <span className="font-semibold text-dark-blue">Final do Texto</span>
                    </div>
                    <span className="text-xs text-soft-gray text-left">
                      Insere ao final como reforço conclusivo do argumento
                    </span>
                  </Button>
                </div>
              </div>

              {/* Botão cancelar */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRepertoireDialog(false);
                    setSelectedRepertoire(null);
                  }}
                  data-testid="button-cancel-repertoire"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}