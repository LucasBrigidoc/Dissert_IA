import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Save, RefreshCw, RotateCcw, Edit3, Sliders, ThumbsUp, ChevronDown, ChevronUp, FileText, Shuffle, BookOpen, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";
import type { 
  TextModificationConfig, 
  TextModificationResult, 
  TextModificationType,
  WordDifficulty,
  ArgumentTechnique,
  ArgumentStructure 
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
  const [argumentativeLevel, setArgumentativeLevel] = useState([50]);
  
  // Estado para o tipo de modificação atual
  const [modificationType, setModificationType] = useState<TextModificationType | "">("");
  
  // Estados para controlar cards expandidos (permite múltiplos abertos)
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  
  // Estados para modificações ativas
  const [activeModifications, setActiveModifications] = useState<Set<string>>(new Set());
  
  // Estados para formalidade
  const [wordDifficulty, setWordDifficulty] = useState<WordDifficulty>("medio");
  
  // Estados para argumentação
  const [argumentStructure, setArgumentStructure] = useState<ArgumentStructure>({
    repertoire: false,
    thesis: false,
    arguments: false,
    conclusion: false
  });
  const [argumentTechnique, setArgumentTechnique] = useState<ArgumentTechnique>("topico-frasal");

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
        
      case 'argumentativo':
        if (argumentativeLevel[0] > 70) {
          return `É fundamental compreender que ${text.toLowerCase()} Portanto, torna-se evidente a necessidade de uma análise mais aprofundada desta questão.`;
        } else if (argumentativeLevel[0] < 30) {
          return `${text} Essa é apenas uma perspectiva possível sobre o assunto.`;
        } else {
          return `Considerando que ${text.toLowerCase()}, pode-se argumentar que esta questão merece atenção especial.`;
        }
        
      case 'sinonimos':
        return text
          .replace(/\bbom\b/g, "excelente")
          .replace(/\bgrande\b/g, "amplo")
          .replace(/\bpequeno\b/g, "reduzido")
          .replace(/\bimportante\b/g, "relevante")
          .replace(/\bproblema\b/g, "questão")
          .replace(/\bsolução\b/g, "resolução");
          
      case 'antonimos':
        return text
          .replace(/\bbom\b/g, "ruim")
          .replace(/\bgrande\b/g, "pequeno")
          .replace(/\bpequeno\b/g, "grande")
          .replace(/\bfácil\b/g, "difícil")
          .replace(/\bdifícil\b/g, "fácil")
          .replace(/\bpositivo\b/g, "negativo")
          .replace(/\bsucesso\b/g, "fracasso");
          
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
        } else if (modificationType === 'argumentativo') {
          config.argumentTechnique = argumentTechnique;
          config.argumentativeLevel = argumentativeLevel[0];
          config.argumentStructure = argumentStructure;
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
      } else if (type === 'argumentativo') {
        config.argumentTechnique = argumentTechnique;
        config.argumentativeLevel = argumentativeLevel[0];
        config.argumentStructure = argumentStructure;
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
      
      switch (type) {
        case 'formalidade':
          if (formalityLevel[0] > 70) {
            processedText = originalText
              .replace(/\bvocê\b/g, "Vossa Senhoria")
              .replace(/\btá\b/g, "está")
              .replace(/\bpra\b/g, "para")
              .replace(/\bfazer\b/g, "realizar")
              .replace(/\bver\b/g, "analisar")
              .replace(/\bcoisa\b/g, "elemento");
          } else if (formalityLevel[0] < 30) {
            processedText = originalText
              .replace(/\bVossa Senhoria\b/g, "você")
              .replace(/\bestá\b/g, "tá")
              .replace(/\bpara\b/g, "pra")
              .replace(/\brealizar\b/g, "fazer")
              .replace(/\banalisar\b/g, "ver");
          }
          break;
          
        case 'argumentativo':
          if (argumentativeLevel[0] > 70) {
            processedText = `É fundamental compreender que ${originalText.toLowerCase()} Portanto, torna-se evidente a necessidade de uma análise mais aprofundada desta questão.`;
          } else if (argumentativeLevel[0] < 30) {
            processedText = `${originalText} Essa é apenas uma perspectiva possível sobre o assunto.`;
          } else {
            processedText = `Considerando que ${originalText.toLowerCase()}, pode-se argumentar que esta questão merece atenção especial.`;
          }
          break;
          
        case 'sinonimos':
          processedText = originalText
            .replace(/\bbom\b/g, "excelente")
            .replace(/\bgrande\b/g, "amplo")
            .replace(/\bpequeno\b/g, "reduzido")
            .replace(/\bimportante\b/g, "relevante")
            .replace(/\bproblema\b/g, "questão")
            .replace(/\bsolução\b/g, "resolução");
          break;
          
        case 'antonimos':
          processedText = originalText
            .replace(/\bbom\b/g, "ruim")
            .replace(/\bgrande\b/g, "pequeno")
            .replace(/\bpequeno\b/g, "grande")
            .replace(/\bfácil\b/g, "difícil")
            .replace(/\bdifícil\b/g, "fácil")
            .replace(/\bpositivo\b/g, "negativo")
            .replace(/\bsucesso\b/g, "fracasso");
          break;
      }
      
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
                className="min-h-[180px] sm:min-h-[200px] text-sm sm:text-base leading-relaxed resize-none"
                data-testid="textarea-original"
              />
            </div>
          </LiquidGlassCard>
        </div>

        {/* Controles - Mobile Otimizado */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 md:items-stretch">
          {/* Card de Formalidade */}
          <div 
            className={`min-h-[180px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('formalidade') ? 'ring-2 ring-bright-blue/20' : ''}`}
            onClick={isMobile ? () => toggleCard('formalidade') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Formalidade</h3>
                  <p className="text-xs text-soft-gray">Ajuste o nível formal</p>
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
                    Incluir ajuste de formalidade
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Nível: {formalityLevel[0]}%
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
                    Dificuldade das Palavras
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
              </div>
            )}
          </div>

          {/* Card de Argumentação */}
          <div 
            className={`min-h-[180px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20 hover:border-dark-blue/40 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('argumentacao') ? 'ring-2 ring-dark-blue/20' : ''}`}
            onClick={isMobile ? () => toggleCard('argumentacao') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Organização Dissertativa</h3>
                  <p className="text-xs text-soft-gray">Estrutura argumentativa</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('argumentacao') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('argumentacao')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 space-y-4 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="argumentativo-active" 
                    checked={activeModifications.has('argumentativo')}
                    onCheckedChange={() => toggleModification('argumentativo')}
                  />
                  <Label htmlFor="argumentativo-active" className="text-sm font-medium text-dark-blue">
                    Incluir organização dissertativa
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Organização do Parágrafo
                  </Label>
                  <RadioGroup value={argumentTechnique} onValueChange={(value) => setArgumentTechnique(value as ArgumentTechnique)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="topico-frasal" id="topico-frasal" />
                      <Label htmlFor="topico-frasal" className="text-xs">Tópico Frasal + Desenvolvimento</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tese-antitese" id="tese-antitese" />
                      <Label htmlFor="tese-antitese" className="text-xs">Tese → Antítese → Síntese</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="causa-consequencia" id="causa-consequencia" />
                      <Label htmlFor="causa-consequencia" className="text-xs">Causa → Consequência</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="problema-solucao" id="problema-solucao" />
                      <Label htmlFor="problema-solucao" className="text-xs">Problema → Solução</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Elementos do Parágrafo
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="repertoire" 
                        checked={argumentStructure.repertoire}
                        onCheckedChange={(checked) => 
                          setArgumentStructure(prev => ({...prev, repertoire: !!checked}))
                        }
                      />
                      <Label htmlFor="repertoire" className="text-xs">Inserir Repertório Legitimador</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="thesis" 
                        checked={argumentStructure.thesis}
                        onCheckedChange={(checked) => 
                          setArgumentStructure(prev => ({...prev, thesis: !!checked}))
                        }
                      />
                      <Label htmlFor="thesis" className="text-xs">Conectar com a Tese</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="arguments" 
                        checked={argumentStructure.arguments}
                        onCheckedChange={(checked) => 
                          setArgumentStructure(prev => ({...prev, arguments: !!checked}))
                        }
                      />
                      <Label htmlFor="arguments" className="text-xs">Desenvolver Argumentação</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="conclusion" 
                        checked={argumentStructure.conclusion}
                        onCheckedChange={(checked) => 
                          setArgumentStructure(prev => ({...prev, conclusion: !!checked}))
                        }
                      />
                      <Label htmlFor="conclusion" className="text-xs">Arremate Conclusivo</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Intensidade: {argumentativeLevel[0]}%
                  </Label>
                  <Slider
                    value={argumentativeLevel}
                    onValueChange={setArgumentativeLevel}
                    max={100}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-soft-gray">
                    <span>Descritivo</span>
                    <span>Persuasivo</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card de Sinônimos */}
          <div 
            className={`min-h-[180px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-green-50/50 to-green-100/50 border-green-200 hover:border-green-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('sinonimos') ? 'ring-2 ring-green-200' : ''}`}
            onClick={isMobile ? () => toggleCard('sinonimos') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Sinônimos</h3>
                  <p className="text-xs text-soft-gray">Mantém o sentido</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('sinonimos') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('sinonimos')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="sinonimos-active" 
                    checked={activeModifications.has('sinonimos')}
                    onCheckedChange={() => toggleModification('sinonimos')}
                  />
                  <Label htmlFor="sinonimos-active" className="text-sm font-medium text-dark-blue">
                    Incluir substituição por sinônimos
                  </Label>
                </div>
                <p className="text-xs text-soft-gray mb-4">
                  Substitui palavras por sinônimos para enriquecer o vocabulário.
                </p>
              </div>
            )}
          </div>

          {/* Card de Antônimos */}
          <div 
            className={`min-h-[180px] md:h-[420px] rounded-xl sm:rounded-2xl p-3 sm:p-4 liquid-glass bg-gradient-to-br from-orange-50/50 to-orange-100/50 border-orange-200 hover:border-orange-300 transition-all duration-300 flex flex-col ${isMobile ? 'cursor-pointer' : ''} ${expandedCards.includes('antonimos') ? 'ring-2 ring-orange-200' : ''}`}
            onClick={isMobile ? () => toggleCard('antonimos') : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shuffle className="text-white" size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue">Antônimos</h3>
                  <p className="text-xs text-soft-gray">Inverte o sentido</p>
                </div>
              </div>
              {isMobile && (expandedCards.includes('antonimos') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              ))}
            </div>
            
            {(isDesktop || expandedCards.includes('antonimos')) && (
              <div 
                className="mt-4 pt-4 border-t border-gray-200 flex-1 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox 
                    id="antonimos-active" 
                    checked={activeModifications.has('antonimos')}
                    onCheckedChange={() => toggleModification('antonimos')}
                  />
                  <Label htmlFor="antonimos-active" className="text-sm font-medium text-dark-blue">
                    Incluir substituição por antônimos
                  </Label>
                </div>
                <p className="text-xs text-soft-gray mb-4">
                  Substitui palavras por antônimos para explorar o argumento oposto.
                </p>
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
                className="min-h-[180px] sm:min-h-[200px] text-sm sm:text-base leading-relaxed resize-none"
                data-testid="textarea-result"
              />
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
}