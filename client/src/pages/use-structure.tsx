import { useState } from "react";
import { ArrowLeft, FileText, Play, Search, Edit3, PenTool, Loader2, Save, X } from "lucide-react";
import { EssayResult } from "@/pages/essay-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { StructurePreview } from "@/components/structure-preview";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { EssayStructure, Section } from "@shared/schema";

interface UseStructureProps {
  structures: EssayStructure[];
  onBack: () => void;
  onSaveStructure?: (structure: EssayStructure) => void;
}

export function UseStructure({ structures, onBack, onSaveStructure }: UseStructureProps) {
  // Estrutura de exemplo para demonstração
  const exampleStructure: EssayStructure = {
    id: "example-1",
    name: "Estrutura Dissertativa Clássica",
    userId: "example-user",
    sections: [
      {
        title: "Introdução",
        description: "Apresentação do tema, contextualização e tese",
        guidelines: "Inicie com um gancho, contextualize o tema e apresente sua tese claramente"
      },
      {
        title: "Desenvolvimento 1",
        description: "Primeiro argumento principal com fundamentação",
        guidelines: "Desenvolva seu primeiro argumento com dados, exemplos e citações"
      },
      {
        title: "Desenvolvimento 2",
        description: "Segundo argumento principal com aprofundamento",
        guidelines: "Apresente um segundo argumento, pode incluir contraposição"
      },
      {
        title: "Conclusão",
        description: "Síntese dos argumentos e proposta de intervenção",
        guidelines: "Retome a tese, sintetize os argumentos e proponha soluções"
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Combinar estruturas do usuário com estrutura de exemplo
  const allStructures = [exampleStructure, ...structures];
  
  const [selectedStructure, setSelectedStructure] = useState<EssayStructure | null>(null);
  const [essayTopic, setEssayTopic] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [editingStructure, setEditingStructure] = useState<EssayStructure | null>(null);
  const [editedStructure, setEditedStructure] = useState<EssayStructure | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [usedStructure, setUsedStructure] = useState<EssayStructure | null>(null);
  const { toast } = useToast();

  const filteredStructures = allStructures.filter(structure =>
    structure.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateEssayContent = (structure: EssayStructure, topic: string, instructions: string): string => {
    const sections = Array.isArray(structure.sections) ? structure.sections as Section[] : [];
    let essay = "";
    
    essay += `**${topic}**\n\n`;
    
    sections.forEach((section, index) => {
      essay += `**${section.title || `Seção ${index + 1}`}**\n\n`;
      
      if (section.description) {
        essay += `${section.description}\n\n`;
      }
      
      // Gerar conteúdo baseado no tipo de seção e tema
      switch (section.title?.toLowerCase()) {
        case 'introdução':
          essay += `A questão sobre "${topic}" tem se tornado cada vez mais relevante em nossa sociedade contemporânea. Este tema desperta debates importantes e merece uma análise cuidadosa dos seus múltiplos aspectos.\n\n`;
          break;
        case 'desenvolvimento':
        case 'desenvolvimento 1':
        case 'desenvolvimento 2':
          essay += `No que se refere a ${topic.toLowerCase()}, é fundamental considerarmos os diversos fatores que influenciam esta questão. Os dados atuais demonstram a complexidade do tema e a necessidade de uma abordagem multidisciplinar para sua compreensão.\n\n`;
          break;
        case 'conclusão':
          essay += `Em síntese, a questão sobre "${topic}" demanda atenção especial da sociedade e das instituições. É necessário que sejam implementadas medidas efetivas para abordar adequadamente esta temática, promovendo o bem-estar social e o desenvolvimento sustentável.\n\n`;
          break;
        default:
          essay += `Em relação a ${topic.toLowerCase()}, esta seção aborda aspectos fundamentais que contribuem para uma compreensão mais ampla do tema proposto.\n\n`;
      }
    });
    
    if (instructions.trim()) {
      essay += `\n---\n**Instruções consideradas:** ${instructions}\n`;
    }
    
    return essay;
  };

  const handleGenerateEssay = async () => {
    if (!essayTopic.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Insira o tema da redação.",
        variant: "destructive",
      });
      return;
    }

    // Usar estrutura selecionada ou estrutura de exemplo por padrão
    const structureToUse = selectedStructure || exampleStructure;
    if (!structureToUse) {
      toast({
        title: "Erro",
        description: "Nenhuma estrutura disponível.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const essay = generateEssayContent(structureToUse, essayTopic, additionalInstructions);
      setGeneratedEssay(essay);
      setUsedStructure(structureToUse);
      setShowResult(true);
      
      toast({
        title: "Redação gerada com sucesso!",
        description: "Sua redação foi criada seguindo a estrutura selecionada.",
      });
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Ocorreu um erro ao gerar a redação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Se estiver mostrando resultado, renderizar tela de resultado
  if (showResult && generatedEssay && usedStructure) {
    return (
      <EssayResult
        essay={generatedEssay}
        topic={essayTopic}
        structure={usedStructure}
        instructions={additionalInstructions}
        onBack={() => {
          setShowResult(false);
          setGeneratedEssay("");
          setUsedStructure(null);
        }}
        onEdit={() => {
          setShowResult(false);
          // Manter os dados para continuar editando
        }}
        onNewEssay={() => {
          setShowResult(false);
          setGeneratedEssay("");
          setUsedStructure(null);
          setEssayTopic("");
          setAdditionalInstructions("");
          setSelectedStructure(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="mb-4 border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10 hover:border-bright-blue backdrop-blur-sm bg-white/60 transition-all duration-200 shadow-sm" 
            data-testid="button-voltar"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-dark-blue mb-2">
              Usar Estrutura Existente
            </h1>
            <p className="text-soft-gray">
              Selecione uma estrutura salva e gere redações seguindo esse modelo
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Estruturas em linha horizontal */}
          <LiquidGlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-blue">
                Suas Estruturas
              </h2>
              
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-soft-gray" />
                <Input
                  placeholder="Buscar estruturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-buscar-estruturas"
                />
              </div>
            </div>

            {/* Structure List - Horizontal */}
            <div className="overflow-x-auto">
              {filteredStructures.length === 0 ? (
                <div className="text-center py-8 text-soft-gray">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>
                    {searchTerm ? 'Nenhuma estrutura encontrada' : 'Nenhuma estrutura encontrada'}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? 'Tente outro termo de busca' : 'Tente outro termo de busca'}
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 pb-4">
                  {filteredStructures.map((structure) => (
                    <Card 
                      key={structure.id}
                      className={`cursor-pointer transition-all hover:shadow-md min-w-[280px] flex-shrink-0 ${
                        selectedStructure?.id === structure.id 
                          ? 'ring-2 ring-bright-blue bg-bright-blue/5' 
                          : 'hover:bg-gray-50'
                      } ${
                        structure.id === 'example-1' ? 'border-2 border-bright-blue/30' : ''
                      }`}
                      onClick={() => setSelectedStructure(structure)}
                      data-testid={`card-estrutura-${structure.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-dark-blue">
                            {structure.name}
                            {structure.id === 'example-1' && (
                              <Badge variant="outline" className="ml-2 text-xs text-bright-blue border-bright-blue">
                                Exemplo
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                          </Badge>
                        </div>
                        <CardDescription>
                          {structure.id === 'example-1' ? 'Estrutura padrão para teste' : `Criada em ${new Date(structure.createdAt!).toLocaleDateString('pt-BR')}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-soft-gray">
                          {Array.isArray(structure.sections) && structure.sections.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(structure.sections as Section[]).slice(0, 2).map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section.title || `Seção ${index + 1}`}
                                </Badge>
                              ))}
                              {structure.sections.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{structure.sections.length - 2} mais
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </LiquidGlassCard>

          {/* Estrutura Selecionada - Segunda linha */}
          {selectedStructure && (
            <LiquidGlassCard>
              <div className="flex items-start justify-between gap-6">
                {/* Informações da estrutura */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-dark-blue">
                      {selectedStructure.name}
                    </h2>
                    <Badge variant="secondary">
                      {Array.isArray(selectedStructure.sections) ? selectedStructure.sections.length : 0} seções
                    </Badge>
                    {selectedStructure.id === 'example-1' && (
                      <Badge variant="outline" className="text-bright-blue border-bright-blue">
                        Estrutura de Exemplo
                      </Badge>
                    )}
                  </div>
                  
                  {/* Preview das seções */}
                  <div className="space-y-2">
                    {Array.isArray(selectedStructure.sections) && selectedStructure.sections.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(selectedStructure.sections as Section[]).map((section, index) => (
                          <div key={index} className="p-3 bg-bright-blue/5 rounded-lg border border-bright-blue/20">
                            <h4 className="font-medium text-dark-blue text-sm">
                              {section.title || `Seção ${index + 1}`}
                            </h4>
                            <p className="text-xs text-soft-gray mt-1 line-clamp-2">
                              {section.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <Button
                    variant="outline"
                    className="border-bright-blue text-bright-blue hover:bg-bright-blue/10"
                    onClick={() => {
                      setEditingStructure(selectedStructure);
                      setEditedStructure({ ...selectedStructure });
                    }}
                    data-testid="button-editar-estrutura"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar Estrutura
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          )}

          {/* Proposta de Redação - Sempre visível */}
          <LiquidGlassCard>
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="h-5 w-5 text-bright-blue" />
              <h3 className="text-lg font-semibold text-dark-blue">
                Proposta de Redação
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="essay-topic" className="text-dark-blue font-medium">
                  Tema da Redação *
                </Label>
                <Textarea
                  id="essay-topic"
                  placeholder="Ex: A importância da educação digital no século XXI"
                  value={essayTopic}
                  onChange={(e) => setEssayTopic(e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid="textarea-tema-redacao"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Defina claramente o tema central da sua redação
                </p>
              </div>

              <div>
                <Label htmlFor="additional-instructions" className="text-dark-blue font-medium">
                  Instruções Especiais (opcional)
                </Label>
                <Textarea
                  id="additional-instructions"
                  placeholder="Ex: Abordagem argumentativa, público jovem, incluir dados estatísticos..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid="textarea-instrucoes-adicionais"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Requisitos específicos, tom, estilo ou público-alvo
                </p>
              </div>
            </div>
            
            {/* Botão de gerar sempre visível */}
            <div className="mt-6 pt-6 border-t border-bright-blue/20">
              <div className="text-center">
                <p className="text-sm text-soft-gray mb-4">
                  {selectedStructure 
                    ? `Gerar redação com: ${selectedStructure.name}` 
                    : 'Gerar redação com estrutura padrão'
                  }
                </p>
                <Button
                  onClick={handleGenerateEssay}
                  disabled={!essayTopic.trim() || isGenerating}
                  className="bg-bright-blue hover:bg-blue-600 px-8"
                  data-testid="button-gerar-redacao"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? "Gerando Redação..." : "Gerar Redação"}
                </Button>
              </div>
            </div>
          </LiquidGlassCard>


          {/* Modal de Edição */}
          {editingStructure && editedStructure && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-dark-blue">
                    Editar Estrutura
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingStructure(null);
                      setEditedStructure(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-dark-blue font-medium">Nome da Estrutura</Label>
                    <Input
                      value={editedStructure.name}
                      onChange={(e) => setEditedStructure({
                        ...editedStructure,
                        name: e.target.value
                      })}
                      placeholder="Nome da estrutura"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-dark-blue font-medium">Seções</Label>
                    <div className="space-y-3 mt-2">
                      {Array.isArray(editedStructure.sections) && (editedStructure.sections as Section[]).map((section, index) => (
                        <div key={index} className="p-3 border border-bright-blue/20 rounded-lg">
                          <Input
                            value={section.title || ''}
                            onChange={(e) => {
                              const newSections = [...(editedStructure.sections as Section[])];
                              newSections[index] = { ...section, title: e.target.value };
                              setEditedStructure({ ...editedStructure, sections: newSections });
                            }}
                            placeholder="Título da seção"
                            className="mb-2"
                          />
                          <Textarea
                            value={section.description || ''}
                            onChange={(e) => {
                              const newSections = [...(editedStructure.sections as Section[])];
                              newSections[index] = { ...section, description: e.target.value };
                              setEditedStructure({ ...editedStructure, sections: newSections });
                            }}
                            placeholder="Descrição da seção"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingStructure(null);
                      setEditedStructure(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (editedStructure && onSaveStructure) {
                        const structureToSave = {
                          ...editedStructure,
                          id: editingStructure.id === 'example-1' ? `user-${Date.now()}` : editedStructure.id,
                          updatedAt: new Date()
                        };
                        onSaveStructure(structureToSave);
                        setSelectedStructure(structureToSave);
                        toast({
                          title: "Estrutura salva!",
                          description: "Sua estrutura foi salva em 'Suas Estruturas'."
                        });
                      }
                      setEditingStructure(null);
                      setEditedStructure(null);
                    }}
                    className="bg-bright-blue hover:bg-blue-600"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Estrutura
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          
        </div>
      </div>
    </div>
  );
}