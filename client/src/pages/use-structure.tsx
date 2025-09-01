import { useState } from "react";
import { ArrowLeft, FileText, Play, Search, Edit3 } from "lucide-react";
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
                    {searchTerm ? 'Nenhuma estrutura encontrada' : 'Nenhuma estrutura salva ainda'}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? 'Tente outro termo de busca' : 'Crie sua primeira estrutura para começar'}
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
                    data-testid="button-editar-estrutura"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar Estrutura
                  </Button>
                  
                  <Button
                    onClick={handleGenerateEssay}
                    disabled={!selectedStructure || !essayTopic.trim()}
                    className="bg-bright-blue hover:bg-blue-600"
                    data-testid="button-gerar-redacao"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Gerar Redação
                  </Button>
                </div>
              </div>

              {/* Configurações da redação embaixo */}
              <div className="mt-6 pt-6 border-t border-bright-blue/20">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">
                  Configurações da Redação
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      rows={3}
                      data-testid="textarea-instrucoes-adicionais"
                    />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          )}

          {/* Mensagem quando nenhuma estrutura está selecionada */}
          {!selectedStructure && filteredStructures.length > 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-soft-gray">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-center text-lg mb-2">Selecione uma estrutura</p>
                <p className="text-center text-sm">
                  Escolha uma estrutura acima para ver os detalhes e configurar a redação
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}