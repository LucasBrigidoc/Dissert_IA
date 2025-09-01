import { useState } from "react";
import { ArrowLeft, FileText, Play, Search } from "lucide-react";
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
}

export function UseStructure({ structures, onBack }: UseStructureProps) {
  const [selectedStructure, setSelectedStructure] = useState<EssayStructure | null>(null);
  const [essayTopic, setEssayTopic] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredStructures = structures.filter(structure =>
    structure.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateEssay = () => {
    if (!selectedStructure || !essayTopic.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma estrutura e insira o tema da redação.",
        variant: "destructive",
      });
      return;
    }

    // Esta funcionalidade será implementada futuramente
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A geração de redações com IA será implementada em breve.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4" data-testid="button-voltar">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Structure Selection */}
          <div className="space-y-6">
            <LiquidGlassCard>
              <h2 className="text-xl font-semibold text-dark-blue mb-4">
                Suas Estruturas
              </h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-soft-gray" />
                <Input
                  placeholder="Buscar estruturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-buscar-estruturas"
                />
              </div>

              {/* Structure List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStructures.length === 0 ? (
                  <div className="text-center py-8 text-soft-gray">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>
                      {searchTerm ? 'Nenhuma estrutura encontrada' : 'Nenhuma estrutura salva ainda'}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? 'Tente outro termo de busca' : 'Crie sua primeira estrutura para começar'}
                    </p>
                  </div>
                ) : (
                  filteredStructures.map((structure) => (
                    <Card 
                      key={structure.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedStructure?.id === structure.id 
                          ? 'ring-2 ring-bright-blue bg-bright-blue/5' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedStructure(structure)}
                      data-testid={`card-estrutura-${structure.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-dark-blue">
                            {structure.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                          </Badge>
                        </div>
                        <CardDescription>
                          Criada em {new Date(structure.createdAt!).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-soft-gray">
                          {Array.isArray(structure.sections) && structure.sections.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(structure.sections as Section[]).slice(0, 3).map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section.title || `Seção ${index + 1}`}
                                </Badge>
                              ))}
                              {structure.sections.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{structure.sections.length - 3} mais
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </LiquidGlassCard>

            {/* Essay Configuration */}
            {selectedStructure && (
              <LiquidGlassCard>
                <h2 className="text-xl font-semibold text-dark-blue mb-4">
                  Configurações da Redação
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="essay-topic" className="text-dark-blue font-medium">
                      Tema da Redação *
                    </Label>
                    <Textarea
                      id="essay-topic"
                      placeholder="Insira o tema sobre o qual você deseja escrever..."
                      value={essayTopic}
                      onChange={(e) => setEssayTopic(e.target.value)}
                      rows={3}
                      data-testid="textarea-tema-redacao"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional-instructions" className="text-dark-blue font-medium">
                      Instruções Adicionais (opcional)
                    </Label>
                    <Textarea
                      id="additional-instructions"
                      placeholder="Requisitos específicos, tom desejado, público-alvo, etc..."
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      rows={2}
                      data-testid="textarea-instrucoes-adicionais"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateEssay}
                    disabled={!selectedStructure || !essayTopic.trim()}
                    className="w-full bg-bright-blue hover:bg-blue-600"
                    size="lg"
                    data-testid="button-gerar-redacao"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Gerar Redação com IA
                  </Button>
                </div>
              </LiquidGlassCard>
            )}
          </div>

          {/* Structure Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            {selectedStructure ? (
              <div>
                <h2 className="text-xl font-semibold text-dark-blue mb-4">
                  Prévia da Estrutura Selecionada
                </h2>
                <StructurePreview
                  name={selectedStructure.name}
                  sections={Array.isArray(selectedStructure.sections) ? selectedStructure.sections as Section[] : []}
                  className="lg:max-h-[80vh] lg:overflow-y-auto"
                />
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-soft-gray">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-center text-lg mb-2">Selecione uma estrutura</p>
                  <p className="text-center text-sm">
                    Escolha uma estrutura ao lado para ver sua prévia e configurar a redação
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}