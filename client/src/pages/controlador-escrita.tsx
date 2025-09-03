import { useState } from "react";
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

export default function ControladorEscrita() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';
  
  // Estados para o texto
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para os controles
  const [formalityLevel, setFormalityLevel] = useState([50]);
  const [argumentativeLevel, setArgumentativeLevel] = useState([50]);
  
  // Estado para o tipo de modificação atual
  const [modificationType, setModificationType] = useState<string>("");
  
  // Estados para controlar cards expandidos (permite múltiplos abertos)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Estados para formalidade
  const [wordDifficulty, setWordDifficulty] = useState("medio");
  
  // Estados para argumentação
  const [argumentStructure, setArgumentStructure] = useState({
    repertoire: false,
    thesis: false,
    arguments: false,
    conclusion: false
  });
  const [argumentTechnique, setArgumentTechnique] = useState("topico-frasal");

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
    setModificationType(type);
    
    // Simular processamento (na implementação real, aqui seria chamada a API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let processedText = originalText;
    
    switch (type) {
      case 'formalidade':
        if (formalityLevel[0] > 70) {
          processedText = originalText
            .replace(/\bvocê\b/g, "Vossa Senhoria")
            .replace(/\btá\b/g, "está")
            .replace(/\bpra\b/g, "para")
            .replace(/\b(.*?)\b/g, (match) => {
              // Simular linguagem mais formal
              const formalMappings: { [key: string]: string } = {
                "legal": "adequado",
                "muito": "extremamente",
                "coisa": "elemento",
                "fazer": "realizar",
                "ver": "analisar"
              };
              return formalMappings[match.toLowerCase()] || match;
            });
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
          processedText = `É fundamental compreender que ${originalText.toLowerCase()} Portanto, torna-se evidente a necessidade de uma análise mais aprofundada desta questão, considerando suas implicações no contexto atual.`;
        } else if (argumentativeLevel[0] < 30) {
          processedText = `${originalText} Essa é apenas uma perspectiva possível sobre o assunto.`;
        } else {
          processedText = `Considerando que ${originalText.toLowerCase()}, pode-se argumentar que esta questão merece atenção especial.`;
        }
        break;
        
      case 'sinonimos':
        // Simular substituição por sinônimos
        processedText = originalText
          .replace(/\bbom\b/g, "excelente")
          .replace(/\bgrande\b/g, "amplo")
          .replace(/\bpequeno\b/g, "reduzido")
          .replace(/\bimportante\b/g, "relevante")
          .replace(/\bproblema\b/g, "questão")
          .replace(/\bsolução\b/g, "resolução")
          .replace(/\bmostrar\b/g, "demonstrar")
          .replace(/\bpensamento\b/g, "raciocínio");
        break;
        
      case 'antonimos':
        // Simular mudança de sentido com antônimos
        processedText = originalText
          .replace(/\bbom\b/g, "ruim")
          .replace(/\bgrande\b/g, "pequeno")
          .replace(/\bpequeno\b/g, "grande")
          .replace(/\bfácil\b/g, "difícil")
          .replace(/\bdifícil\b/g, "fácil")
          .replace(/\bpositivo\b/g, "negativo")
          .replace(/\bnegativo\b/g, "positivo")
          .replace(/\bsucesso\b/g, "fracasso")
          .replace(/\bvantagem\b/g, "desvantagem");
        break;
    }
    
    setModifiedText(processedText);
    setIsProcessing(false);
    
    toast({
      title: "Texto modificado com sucesso!",
      description: `O texto foi reescrito usando: ${type}`,
    });
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
      <div className="bg-white shadow-sm border-b">
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
            <p className="text-soft-gray">Ajuste o estilo de escrita do seu texto</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 h-[calc(100vh-200px)] flex flex-col">
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
                  <RadioGroup value={wordDifficulty} onValueChange={setWordDifficulty}>
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
                  <RadioGroup value={argumentTechnique} onValueChange={setArgumentTechnique}>
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