import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Save, RefreshCw, RotateCcw, Edit3, Sliders, ThumbsUp } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ControladorEscrita() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Estados para o texto
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para os controles
  const [formalityLevel, setFormalityLevel] = useState([50]);
  const [argumentativeLevel, setArgumentativeLevel] = useState([50]);
  
  // Estado para o tipo de modificação atual
  const [modificationType, setModificationType] = useState<string>("");

  const handleBack = () => {
    setLocation("/functionalities");
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-dark-blue mb-4">
              Controlador de Escrita
            </h1>
            <p className="text-lg text-soft-gray max-w-2xl mx-auto">
              Transforme seu texto com controles avançados de estilo, formalidade e argumentação. 
              Reescreva com sinônimos ou mude completamente o sentido com antônimos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Área de Entrada de Texto */}
          <div className="lg:col-span-2">
            <LiquidGlassCard className="h-full">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="original-text" className="text-lg font-semibold text-dark-blue mb-3 block">
                    Texto Original
                  </Label>
                  <Textarea
                    id="original-text"
                    placeholder="Digite aqui o parágrafo que você deseja modificar. Você pode escrever sobre qualquer tema e aplicar diferentes estilos e modificações..."
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    className="min-h-[200px] text-base leading-relaxed"
                  />
                </div>

                {/* Área do Texto Modificado */}
                {modifiedText && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-lg font-semibold text-dark-blue flex items-center gap-2">
                        Texto Modificado
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
                        >
                          <Copy className="h-4 w-4" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveToLibrary}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetTexts}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Limpar
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-bright-blue">
                      <p className="text-base leading-relaxed text-gray-800">
                        {modifiedText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </LiquidGlassCard>
          </div>

          {/* Painel de Controles */}
          <div className="space-y-6">
            {/* Controles de Estilo */}
            <LiquidGlassCard>
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sliders className="h-5 w-5 text-bright-blue" />
                  <h3 className="text-lg font-semibold text-dark-blue">Controles de Estilo</h3>
                </div>

                {/* Controle de Formalidade */}
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
                    <span>Muito Formal</span>
                  </div>
                  <Button
                    onClick={() => simulateTextProcessing('formalidade')}
                    disabled={isProcessing}
                    className="w-full mt-3 bg-gradient-to-r from-bright-blue to-dark-blue text-white"
                  >
                    {isProcessing ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Edit3 className="mr-2 h-4 w-4" />
                    )}
                    Aplicar Formalidade
                  </Button>
                </div>

                {/* Controle de Argumentação */}
                <div>
                  <Label className="text-sm font-medium text-dark-blue mb-2 block">
                    Nível Argumentativo: {argumentativeLevel[0]}%
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
                    <span>Muito Argumentativo</span>
                  </div>
                  <Button
                    onClick={() => simulateTextProcessing('argumentativo')}
                    disabled={isProcessing}
                    className="w-full mt-3 bg-gradient-to-r from-dark-blue to-soft-gray text-white"
                  >
                    {isProcessing ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="mr-2 h-4 w-4" />
                    )}
                    Tornar Argumentativo
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Controles de Reescrita */}
            <LiquidGlassCard>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">Reescrita Avançada</h3>
                
                <Button
                  onClick={() => simulateTextProcessing('sinonimos')}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full border-green-200 hover:bg-green-50 hover:border-green-300"
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Reescrever com Sinônimos
                  <span className="block text-xs text-soft-gray mt-1">
                    Mantém o sentido original
                  </span>
                </Button>

                <Button
                  onClick={() => simulateTextProcessing('antonimos')}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Reescrever com Antônimos
                  <span className="block text-xs text-soft-gray mt-1">
                    Muda o sentido do texto
                  </span>
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Dicas de Uso */}
            <LiquidGlassCard className="bg-blue-50/50">
              <h4 className="text-sm font-semibold text-dark-blue mb-2">💡 Dicas de Uso</h4>
              <ul className="text-xs text-soft-gray space-y-1">
                <li>• Use formalidade alta para textos acadêmicos</li>
                <li>• Aumente a argumentação para persuadir</li>
                <li>• Sinônimos enriquecem o vocabulário</li>
                <li>• Antônimos ajudam a explorar oposições</li>
                <li>• Salve as versões que mais gostar</li>
              </ul>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}