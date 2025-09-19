import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Save, RefreshCw, RotateCcw, Edit3, ChevronDown, ChevronUp, FileText, Shuffle, BookOpen, Target, HelpCircle, Lightbulb, Search, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import type { 
  TextModificationConfig, 
  TextModificationResult, 
  TextModificationType,
  WordDifficulty
} from "@shared/schema";

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
  const [formalityLevel, setFormalityLevel] = useState([50]);
  
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
  
  // Função para alternar seções de ajuda
  const toggleHelpSection = (cardId: string) => {
    setHelpSections(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };
  
  // Função para buscar repertórios relevantes
  const fetchRelevantRepertoires = async (text: string, modifications: string[]) => {
    if (!text.trim() || modifications.length === 0) {
      setSuggestedRepertoires([]);
      return;
    }
    
    setIsLoadingRepertoires(true);
    try {
      // Extrair palavras-chave do texto para busca
      const keywords = text.toLowerCase()
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
  
  // Função para gerar feedback educativo
  const generateFeedback = (modifications: string[], textLength: number) => {
    const feedbacks = [];
    
    if (modifications.includes('formalidade')) {
      const levelText = formalityLevel[0] > 70 ? 'alta formalidade' : formalityLevel[0] < 30 ? 'baixa formalidade' : 'formalidade equilibrada';
      feedbacks.push(`✅ Ajustado para ${levelText} ${meaningPreservation === 'preserve' ? 'preservando' : 'alterando'} o sentido original`);
    }
    
    if (modifications.includes('estrutura-causal')) {
      feedbacks.push(`🎯 Aplicada estrutura causal: ${structureType.replace('-', ' → ')} para fortalecer a argumentação`);
    }
    
    if (modifications.includes('estrutura-comparativa')) {
      feedbacks.push(`🔄 Adicionados conectivos comparativos para estabelecer relações entre ideias`);
    }
    
    if (modifications.includes('estrutura-oposicao')) {
      feedbacks.push(`⚖️ Incorporada estrutura de oposição para apresentar contrapontos equilibrados`);
    }
    
    if (textLength > 0) {
      feedbacks.push(`📊 Texto processado: ${textLength} caracteres ${textLength > 500 ? '(extenso, ideal para desenvolvimento)' : '(conciso, bom para introdução)'}`);
    }
    
    if (feedbacks.length > 0) {
      return feedbacks.join('\n\n');
    } else if (modifications.length > 0) {
      return '🔧 Modificações selecionadas: ' + modifications.join(', ') + '\n\n💡 Execute as modificações para ver análises detalhadas das melhorias aplicadas ao seu texto.';
    } else {
      return 'Selecione e aplique modificações para ver melhorias detalhadas do seu texto.';
    }
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
          return formalityLevel[0] > 70 ? changedText.replace(/\bvocê\b/g, "Vossa Senhoria") : changedText;
        } else {
          // Preserva sentido: apenas ajusta formalidade
          if (formalityLevel[0] > 70) {
            return text
              .replace(/\bvocê\b/g, "Vossa Senhoria")
              .replace(/\btá\b/g, "está")
              .replace(/\bpra\b/g, "para")
              .replace(/\bfazer\b/g, "realizar")
              .replace(/\bver\b/g, "analisar")
              .replace(/\bcoisa\b/g, "elemento");
          } else if (formalityLevel[0] < 30) {
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
          config.formalityLevel = formalityLevel[0];
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
      setModificationType(appliedModifications.length > 0 ? appliedModifications.join(', ') as TextModificationType : "");
      
      // Gerar feedback educativo
      const activeMods = Array.from(activeModifications);
      setFeedbackText(generateFeedback(activeMods, processedText.length));
      
      // Buscar repertórios relevantes
      await fetchRelevantRepertoires(originalText, activeMods);
      
      toast({
        title: "Modificações aplicadas com sucesso!",
        description: `Aplicadas: ${appliedModifications.join(', ')}`,
      });
      
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
        config.formalityLevel = formalityLevel[0];
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
      
      setModifiedText(result.modifiedText);
      
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
    
    // Simular salvamento na biblioteca
    toast({
      title: "Texto salvo na biblioteca!",
      description: "O texto modificado foi adicionado à sua biblioteca pessoal.",
    });
  };

  const resetTexts = () => {
    setModifiedText("");
    setModificationType("");
    setActiveModifications(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
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
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-16 sm:pt-24 min-h-[calc(100vh-200px)] flex flex-col">
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 md:items-stretch">
          {/* Card de Formalidade */}
          <div 
            className={`min-h-[100px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('formalidade') ? 'ring-2 ring-bright-blue/20' : ''}`}
            onClick={isMobile ? () => toggleCard('formalidade') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Reescrita</h3>
                  <p className="text-xs text-soft-gray">Ajuste o nível e sentido</p>
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
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
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
                    Nível de Formalidade: {formalityLevel[0]}%
                  </Label>
                  <Slider
                    value={formalityLevel}
                    onValueChange={setFormalityLevel}
                    max={100}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-soft-gray">
                    <span>Informal</span>
                    <span>Formal</span>
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
                
                {/* Seção de Ajuda */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('formalidade')}
                    className="w-full flex items-center justify-between p-2 text-xs text-dark-blue hover:bg-blue-50"
                    data-testid="button-help-formalidade"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-3 w-3" />
                      Como usar
                    </span>
                    {helpSections.formalidade ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  
                  <Collapsible open={helpSections.formalidade}>
                    <CollapsibleContent className="px-2 py-3 text-xs text-soft-gray bg-gray-50 rounded-b-lg">
                      <div className="space-y-2">
                        <p><strong>💡 Como usar:</strong> Selecione o nível de formalidade desejado e escolha se quer preservar ou alterar o sentido.</p>
                        <p><strong>📝 Exemplo:</strong> "É importante estudar" → "É fundamental compreender" (preserva) ou "É dispensável estudar" (altera)</p>
                        <p><strong>🎯 Ideal para:</strong> Ajustar o registro linguístico e adaptar o texto ao contexto acadêmico ou coloquial.</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}
          </div>

          {/* Card de Estruturas Causais */}
          <div 
            className={`min-h-[100px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 border-emerald-200 hover:border-emerald-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('estrutura-causal') ? 'ring-2 ring-emerald-200' : ''}`}
            onClick={isMobile ? () => toggleCard('estrutura-causal') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Estruturas Causais</h3>
                  <p className="text-xs text-soft-gray">Causa e consequência</p>
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
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
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
                  </RadioGroup>
                </div>
                
                {/* Seção de Ajuda - Estruturas Causais */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('estrutura-causal')}
                    className="w-full flex items-center justify-between p-2 text-xs text-dark-blue hover:bg-emerald-50"
                    data-testid="button-help-causal"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-3 w-3" />
                      Como usar
                    </span>
                    {helpSections['estrutura-causal'] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  
                  <Collapsible open={helpSections['estrutura-causal']}>
                    <CollapsibleContent className="px-2 py-3 text-xs text-soft-gray bg-emerald-50 rounded-b-lg">
                      <div className="space-y-2">
                        <p><strong>🎯 Como usar:</strong> Estabeleça relações de causa e efeito no seu texto usando conectivos causais.</p>
                        <p><strong>📝 Exemplo:</strong> "A desigualdade social" → "A desigualdade social ocorre devido às políticas públicas insuficientes"</p>
                        <p><strong>🏆 Ideal para:</strong> Problemas sociais, questões ambientais, análises econômicas e temas que envolvem consequências.</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}
          </div>

          {/* Card de Estruturas Comparativas */}
          <div 
            className={`min-h-[100px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-purple-50/50 to-purple-100/50 border-purple-200 hover:border-purple-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('estrutura-comparativa') ? 'ring-2 ring-purple-200' : ''}`}
            onClick={isMobile ? () => toggleCard('estrutura-comparativa') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shuffle className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Estruturas Comparativas</h3>
                  <p className="text-xs text-soft-gray">Comparações e condições</p>
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
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
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
                  </RadioGroup>
                </div>
                
                {/* Seção de Ajuda - Estruturas Comparativas */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('estrutura-comparativa')}
                    className="w-full flex items-center justify-between p-2 text-xs text-dark-blue hover:bg-purple-50"
                    data-testid="button-help-comparativa"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-3 w-3" />
                      Como usar
                    </span>
                    {helpSections['estrutura-comparativa'] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  
                  <Collapsible open={helpSections['estrutura-comparativa']}>
                    <CollapsibleContent className="px-2 py-3 text-xs text-soft-gray bg-purple-50 rounded-b-lg">
                      <div className="space-y-2">
                        <p><strong>🔄 Como usar:</strong> Crie comparações e analogias para fortalecer seus argumentos com conectivos comparativos.</p>
                        <p><strong>📝 Exemplo:</strong> "A educação é fundamental" → "Assim como a água é vital para plantas, a educação é fundamental"</p>
                        <p><strong>🏆 Ideal para:</strong> Estabelecer paralelos, criar analogias, comparar situações e reforçar argumentos com exemplos similares.</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}
          </div>

          {/* Card de Estruturas de Oposição */}
          <div 
            className={`min-h-[100px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-amber-50/50 to-amber-100/50 border-amber-200 hover:border-amber-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('estrutura-oposicao') ? 'ring-2 ring-amber-200' : ''}`}
            onClick={isMobile ? () => toggleCard('estrutura-oposicao') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Estruturas de Oposição</h3>
                  <p className="text-xs text-soft-gray">Concessão e explicação</p>
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
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
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
                  </RadioGroup>
                </div>
                
                {/* Seção de Ajuda - Estruturas de Oposição */}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpSection('estrutura-oposicao')}
                    className="w-full flex items-center justify-between p-2 text-xs text-dark-blue hover:bg-amber-50"
                    data-testid="button-help-oposicao"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-3 w-3" />
                      Como usar
                    </span>
                    {helpSections['estrutura-oposicao'] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  
                  <Collapsible open={helpSections['estrutura-oposicao']}>
                    <CollapsibleContent className="px-2 py-3 text-xs text-soft-gray bg-amber-50 rounded-b-lg">
                      <div className="space-y-2">
                        <p><strong>⚖️ Como usar:</strong> Apresente contrapontos e concessões para criar argumentações mais equilibradas e convincentes.</p>
                        <p><strong>📝 Exemplo:</strong> "A tecnologia é benéfica" → "Embora a tecnologia traga riscos, seus benefícios superam as desvantagens"</p>
                        <p><strong>🏆 Ideal para:</strong> Temas polêmicos, debates equilibrados, reconhecer limitações e apresentar visões mais maduras.</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
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
            </div>
          </LiquidGlassCard>
        </div>

        {/* Área de Feedback Educativo */}
        {(modifiedText.trim() || feedbackText || suggestedRepertoires.length > 0 || activeModifications.size > 0) && (
          <div className="mb-4 sm:mb-6">
            <LiquidGlassCard className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="text-white" size={16} />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold text-dark-blue">
                    Análise Pedagógica
                  </h3>
                </div>
                
                {feedbackText && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-dark-blue leading-relaxed whitespace-pre-line">
                      {feedbackText}
                    </div>
                  </div>
                )}
                
                {/* Repertórios Sugeridos */}
                {suggestedRepertoires.length > 0 && (
                  <div>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-dark-blue" />
                      <h4 className="text-sm font-semibold text-dark-blue">
                        Repertórios Sugeridos para seu Texto
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {suggestedRepertoires.map((repertoire, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-dark-blue truncate">
                                {repertoire.title}
                              </h5>
                              <p className="text-xs text-soft-gray mt-1 line-clamp-2">
                                {repertoire.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {repertoire.type}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {repertoire.category}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-dark-blue hover:text-bright-blue"
                              onClick={() => window.open(`/biblioteca?search=${encodeURIComponent(repertoire.title)}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
            </LiquidGlassCard>
          </div>
        )}
      </div>
    </div>
  );
}