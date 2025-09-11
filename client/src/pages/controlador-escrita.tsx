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
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  
  // Estados para os controles
  const [formalityLevel, setFormalityLevel] = useState([50]);
  const [argumentativeLevel, setArgumentativeLevel] = useState([50]);
  
  // Estado para o tipo de modificação atual
  const [modificationType, setModificationType] = useState<TextModificationType | "">("");
  
  // Estados para controlar cards expandidos (permite múltiplos abertos)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
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
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
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

  const applyAllModifications = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Texto necessário",
        description: "Digite um texto para poder aplicar as modificações.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se algum card está expandido
    if (expandedCards.size === 0) {
      toast({
        title: "Configurações necessárias",
        description: "Expanda ao menos um controlador para configurar as modificações.",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingAll(true);
    let currentText = originalText;
    const appliedTypes = [];
    
    try {
      // Aplicar modificações sequencialmente baseado nos cards expandidos
      for (const cardType of expandedCards) {
        let modificationType: string;
        let config: any = {};
        
        switch (cardType) {
          case 'formalidade':
            modificationType = 'formalidade';
            config = {
              formalityLevel: formalityLevel[0],
              wordDifficulty: wordDifficulty
            };
            break;
          case 'argumentacao':
            modificationType = 'argumentativo';
            config = {
              argumentTechnique: argumentTechnique,
              argumentativeLevel: argumentativeLevel[0],
              argumentStructure: argumentStructure
            };
            break;
          case 'sinonimos':
            modificationType = 'sinonimos';
            break;
          case 'antonimos':
            modificationType = 'antonimos';
            break;
          default:
            continue;
        }
        
        // Chamar a API para cada modificação
        const response = await fetch('/api/text-modification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: currentText,
            type: modificationType,
            config: config
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          currentText = result.modifiedText;
          appliedTypes.push(modificationType);
        }
      }
      
      setModifiedText(currentText);
      setModificationType("" as TextModificationType);
      
      toast({
        title: "Modificações aplicadas!",
        description: `Aplicadas com sucesso: ${appliedTypes.join(', ')}`,
      });
      
    } catch (error) {
      console.error('Erro ao aplicar modificações:', error);
      toast({
        title: "Erro nas modificações",
        description: "Algumas modificações falharam. Tente aplicar individualmente.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingAll(false);
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
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
      <div className="container mx-auto px-6 py-8 pt-24 h-[calc(100vh-200px)] flex flex-col">
        {/* Área de Texto Original */}
        <div className="mb-6">
          <LiquidGlassCard>
            <div>
              <Label htmlFor="original-text" className="text-lg font-semibold text-dark-blue mb-3 block">
                Texto Original
              </Label>
              <Textarea
                id="original-text"
                placeholder="Digite aqui o parágrafo que você deseja modificar. Você pode escrever sobre qualquer tema e aplicar diferentes estilos e modificações..."
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="min-h-[120px] text-base leading-relaxed resize-none"
              />
            </div>
          </LiquidGlassCard>
        </div>

        {/* Controles - Ocupam toda a vertical */}
        <div className="flex-1 grid grid-cols-4 gap-4 mb-6 items-start">
          {/* Card de Formalidade */}
          <div 
            className={`min-h-[200px] rounded-2xl p-4 liquid-glass bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-300 cursor-pointer ${expandedCards.has('formalidade') ? 'ring-2 ring-bright-blue/20' : ''}`}
            onClick={() => toggleCard('formalidade')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-blue">Formalidade</h3>
                  <p className="text-xs text-soft-gray">Ajuste o nível formal</p>
                </div>
              </div>
              {expandedCards.has('formalidade') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              )}
            </div>
            
            {expandedCards.has('formalidade') && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
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
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    simulateTextProcessing('formalidade');
                  }}
                  disabled={isProcessing}
                  size="sm"
                  className="w-full bg-gradient-to-r from-bright-blue to-dark-blue text-white"
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Edit3 className="mr-2 h-3 w-3" />
                  )}
                  Aplicar Formalidade
                </Button>
              </div>
            )}
          </div>

          {/* Card de Argumentação */}
          <div 
            className={`min-h-[200px] rounded-2xl p-4 liquid-glass bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20 hover:border-dark-blue/40 transition-all duration-300 cursor-pointer ${expandedCards.has('argumentacao') ? 'ring-2 ring-dark-blue/20' : ''}`}
            onClick={() => toggleCard('argumentacao')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <Target className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-blue">Organização Dissertativa</h3>
                  <p className="text-xs text-soft-gray">Estrutura argumentativa</p>
                </div>
              </div>
              {expandedCards.has('argumentacao') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              )}
            </div>
            
            {expandedCards.has('argumentacao') && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
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
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    simulateTextProcessing('argumentativo');
                  }}
                  disabled={isProcessing}
                  size="sm"
                  className="w-full bg-gradient-to-r from-dark-blue to-soft-gray text-white"
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Target className="mr-2 h-3 w-3" />
                  )}
                  Organizar Parágrafo
                </Button>
              </div>
            )}
          </div>

          {/* Card de Sinônimos */}
          <div 
            className={`min-h-[200px] rounded-2xl p-4 liquid-glass bg-gradient-to-br from-green-50/50 to-green-100/50 border-green-200 hover:border-green-300 transition-all duration-300 cursor-pointer ${expandedCards.has('sinonimos') ? 'ring-2 ring-green-200' : ''}`}
            onClick={() => toggleCard('sinonimos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <RefreshCw className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-blue">Sinônimos</h3>
                  <p className="text-xs text-soft-gray">Mantém o sentido</p>
                </div>
              </div>
              {expandedCards.has('sinonimos') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              )}
            </div>
            
            {expandedCards.has('sinonimos') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-soft-gray mb-4">
                  Substitui palavras por sinônimos para enriquecer o vocabulário.
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    simulateTextProcessing('sinonimos');
                  }}
                  disabled={isProcessing}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-3 w-3" />
                  )}
                  Aplicar Sinônimos
                </Button>
              </div>
            )}
          </div>

          {/* Card de Antônimos */}
          <div 
            className={`min-h-[200px] rounded-2xl p-4 liquid-glass bg-gradient-to-br from-orange-50/50 to-orange-100/50 border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer ${expandedCards.has('antonimos') ? 'ring-2 ring-orange-200' : ''}`}
            onClick={() => toggleCard('antonimos')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Shuffle className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-blue">Antônimos</h3>
                  <p className="text-xs text-soft-gray">Inverte o sentido</p>
                </div>
              </div>
              {expandedCards.has('antonimos') ? (
                <ChevronUp className="h-4 w-4 text-soft-gray" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soft-gray" />
              )}
            </div>
            
            {expandedCards.has('antonimos') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-soft-gray mb-4">
                  Substitui palavras por antônimos para explorar o argumento oposto.
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    simulateTextProcessing('antonimos');
                  }}
                  disabled={isProcessing}
                  size="sm"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Shuffle className="mr-2 h-3 w-3" />
                  )}
                  Aplicar Antônimos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Botão Aplicar Todas as Modificações */}
        <div className="mb-6 flex justify-center">
          <Button
            onClick={applyAllModifications}
            disabled={isApplyingAll || isProcessing || !originalText.trim() || expandedCards.size === 0}
            size="lg"
            className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            data-testid="button-apply-all"
          >
            {isApplyingAll ? (
              <>
                <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                Aplicando Modificações...
              </>
            ) : (
              <>
                <Sliders className="mr-3 h-5 w-5" />
                Aplicar Modificações
              </>
            )}
          </Button>
        </div>

        {/* Área de Resultado */}
        <div>
          <LiquidGlassCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-dark-blue flex items-center gap-2">
                  Resultado
                  {modificationType && (
                    <Badge variant="secondary" className="text-xs">
                      {modificationType}
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    className="flex items-center gap-2"
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToLibrary}
                    className="flex items-center gap-2"
                    data-testid="button-save"
                  >
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetTexts}
                    className="flex items-center gap-2"
                    data-testid="button-clear"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="O texto modificado aparecerá aqui. Você pode editar diretamente este resultado."
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                className="min-h-[120px] text-base leading-relaxed resize-none"
                data-testid="textarea-result"
              />
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
}