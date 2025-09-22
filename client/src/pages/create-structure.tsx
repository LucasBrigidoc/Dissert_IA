import { useState } from "react";
import { ArrowLeft, Save, PenTool, Loader2, Play, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { EnhancedStructureEditor } from "@/components/enhanced-structure-editor";

import { EssayResult } from "@/pages/essay-result";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Section, InsertEssayStructure, EssayStructure } from "@shared/schema";
import { insertEssayStructureSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CreateStructureProps {
  onBack: () => void;
  editingStructure?: {
    id: string;
    name: string;
    sections: Section[];
  } | null;
}

export function CreateStructure({ onBack, editingStructure }: CreateStructureProps) {
  const [name, setName] = useState(editingStructure?.name || "");
  const [sections, setSections] = useState<Section[]>(editingStructure?.sections || []);
  
  const [essayTopic, setEssayTopic] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [usedStructure, setUsedStructure] = useState<EssayStructure | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock userId - in a real app this would come from auth context
  const userId = "mock-user-id";

  const createMutation = useMutation({
    mutationFn: async (data: InsertEssayStructure) => {
      return await apiRequest("/api/structures", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Estrutura salva com sucesso!",
        description: "Sua estrutura foi criada e está disponível para uso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'structures'] });
      onBack();
    },
    onError: () => {
      toast({
        title: "Erro ao salvar estrutura",
        description: "Não foi possível salvar a estrutura. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertEssayStructure>) => {
      return await apiRequest(`/api/structures/${editingStructure!.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Estrutura atualizada com sucesso!",
        description: "Suas alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'structures'] });
      onBack();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar estrutura",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    try {
      const structureData = {
        userId,
        name: name.trim(),
        sections,
      };

      // Validate data
      insertEssayStructureSchema.parse(structureData);

      if (editingStructure) {
        updateMutation.mutate(structureData);
      } else {
        createMutation.mutate(structureData);
      }
    } catch (error) {
      toast({
        title: "Dados inválidos",
        description: "Verifique se todos os campos estão preenchidos corretamente.",
        variant: "destructive",
      });
    }
  };

  const isValid = name.trim() && sections.length > 0 && sections.every(s => s.title.trim() && s.description.trim());
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleGenerateEssay = async () => {
    if (!essayTopic.trim() || !isValid) return;

    const currentStructure: EssayStructure = {
      id: Date.now().toString(),
      name,
      sections,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setIsGenerating(true);
    
    try {
      // Generate essay using AI
      const response = await apiRequest("/api/essays/generate", {
        method: "POST",
        body: JSON.stringify({
          structureName: name || 'Nova Estrutura',
          sections: sections,
          topic: essayTopic.trim(),
          additionalInstructions: additionalInstructions.trim() || undefined
        }),
      });

      if (response.success) {
        setGeneratedEssay(response.essay);
        setUsedStructure(currentStructure);
        setShowResult(true);
        
        toast({
          title: "Redação gerada com sucesso!",
          description: "Sua redação foi criada com IA seguindo a estrutura personalizada.",
        });
      } else {
        throw new Error(response.message || "Failed to generate essay");
      }
    } catch (error: any) {
      console.error("Essay generation error:", error);
      
      // Check for rate limiting (HTTP 429 status)
      if (error.status === 429) {
        toast({
          title: "Limite de uso atingido",
          description: "Você pode gerar 3 redações por hora. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        // Fallback to local generation if AI fails
        let fallbackEssay = `**${essayTopic}**\n\n`;
        
        sections.forEach((section, index) => {
          fallbackEssay += `**${section.title}**\n\n`;
          fallbackEssay += `${section.description}\n\n`;
          
          // Adicionar conteúdo básico baseado na descrição
          const sampleContent = `Este parágrafo desenvolve a seção "${section.title}" conforme descrito: ${section.description}. O conteúdo foi gerado automaticamente devido à indisponibilidade da IA.`;
          fallbackEssay += `${sampleContent}\n\n`;
          
          if (index < sections.length - 1) {
            fallbackEssay += '---\n\n';
          }
        });
        
        setGeneratedEssay(fallbackEssay);
        setUsedStructure(currentStructure);
        setShowResult(true);
        
        const errorMessage = error.status >= 400 && error.status < 500 
          ? "Erro na solicitação. Verifique os dados informados." 
          : "A IA está indisponível. Redação gerada com estrutura básica.";
        
        toast({
          title: "Redação gerada (modo offline)",
          description: errorMessage,
          variant: "default",
        });
      }
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
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button 
            variant="outline" 
            onClick={onBack} 
            size="sm"
            className="mb-3 md:mb-4 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-bright-blue text-dark-blue transition-all duration-200" 
            data-testid="button-voltar"
          >
            <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">Voltar</span>
          </Button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-blue mb-2">
              {editingStructure ? 'Editar Estrutura' : 'Criar Nova Estrutura'}
            </h1>
            <p className="text-sm md:text-base text-soft-gray leading-relaxed">
              {editingStructure 
                ? 'Modifique sua estrutura existente'
                : 'Defina seções personalizadas para criar um modelo reutilizável'
              }
            </p>
          </div>
        </div>

        {/* Editor Centralizado */}
        <LiquidGlassCard className="max-w-4xl mx-auto">
          <EnhancedStructureEditor
            name={name}
            sections={sections}
            onNameChange={setName}
            onSectionsChange={setSections}
            isEditing={!!editingStructure}
          />
        </LiquidGlassCard>

        

        {/* Proposta de Redação */}
        <LiquidGlassCard className="mt-4 md:mt-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <PenTool className="h-4 w-4 md:h-5 md:w-5 text-bright-blue" />
            <h3 className="text-base md:text-lg font-semibold text-dark-blue">
              Testar Estrutura
            </h3>
          </div>
          
          <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <div>
              <Label htmlFor="essay-topic" className="text-sm md:text-base text-dark-blue font-medium">
                Tema da Redação *
              </Label>
              <Textarea
                id="essay-topic"
                placeholder="Ex: A importância da educação digital no século XXI"
                value={essayTopic}
                onChange={(e) => setEssayTopic(e.target.value)}
                rows={3}
                className="mt-1 text-sm md:text-base"
                data-testid="textarea-tema-redacao"
              />
              <p className="text-xs text-soft-gray mt-1">
                Defina claramente o tema central da sua redação
              </p>
            </div>

            <div>
              <Label htmlFor="additional-instructions" className="text-sm md:text-base text-dark-blue font-medium">
                Instruções Especiais (opcional)
              </Label>
              <Textarea
                id="additional-instructions"
                placeholder="Ex: Abordagem argumentativa, público jovem, incluir dados estatísticos..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={3}
                className="mt-1 text-sm md:text-base"
                data-testid="textarea-instrucoes-adicionais"
              />
              <p className="text-xs text-soft-gray mt-1">
                Requisitos específicos, tom, estilo ou público-alvo
              </p>
            </div>
          </div>
          
          {/* Botão de gerar sempre visível */}
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-bright-blue/20">
            <div className="text-center">
              <p className="text-sm text-soft-gray mb-3 md:mb-4 px-2">
                {isValid 
                  ? `Criar redação com: ${name || 'Nova estrutura'}` 
                  : 'Complete a estrutura para testar'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                <Button
                  onClick={handleGenerateEssay}
                  disabled={!essayTopic.trim() || !isValid || isGenerating}
                  className="bg-bright-blue hover:bg-blue-600 px-4 md:px-8 w-full sm:w-auto"
                  data-testid="button-gerar-redacao"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  <span className="text-sm md:text-base">
                    {isGenerating ? "Gerando Redação..." : "Criar Redação"}
                  </span>
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={!isValid || isLoading}
                  className="bg-green-600 hover:bg-green-700 px-4 md:px-8 w-full sm:w-auto"
                  data-testid="button-salvar-estrutura"
                >
                  <Save className="mr-2 h-4 w-4" />
                  <span className="text-sm md:text-base">
                    {isLoading ? 'Salvando...' : (editingStructure ? 'Atualizar' : 'Salvar')} Estrutura
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Validation Messages */}
        {!isValid && (name || sections.length > 0) && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-4xl mx-auto">
            <h3 className="font-medium text-yellow-800 mb-2 text-sm md:text-base">Campos obrigatórios:</h3>
            <ul className="text-xs md:text-sm text-yellow-700 space-y-1">
              {!name.trim() && <li>• Nome da estrutura</li>}
              {sections.length === 0 && <li>• Pelo menos uma seção</li>}
              {sections.some(s => !s.title.trim()) && <li>• Título de todas as seções</li>}
              {sections.some(s => !s.description.trim()) && <li>• Descrição de todas as seções</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}