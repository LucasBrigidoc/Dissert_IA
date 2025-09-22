import { useState } from "react";
import { ArrowLeft, Save, PenTool, Loader2, Play, Edit, Edit3, Plus, FileText, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { EnhancedStructureEditor } from "@/components/enhanced-structure-editor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
        title: "Erro ao salvar",
        description: "Não foi possível salvar a estrutura.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertEssayStructure) => {
      return await apiRequest(`/api/structures/${editingStructure?.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Estrutura atualizada!",
        description: "Suas alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'structures'] });
      onBack();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a estrutura.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (!name.trim() || sections.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e adicione pelo menos uma seção.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = insertEssayStructureSchema.parse({
        name: name.trim(),
        sections,
        userId,
      });

      if (editingStructure) {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    } catch (error: any) {
      toast({
        title: "Erro de validação",
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
      const response = await fetch("/api/essays/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: essayTopic.trim(),
          structure: currentStructure,
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedEssay(result.essay);
        setUsedStructure(currentStructure);
        setShowResult(true);
        
        toast({
          title: "Redação gerada com sucesso!",
          description: "Sua redação foi criada com IA seguindo a estrutura personalizada.",
        });
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate essay");
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

  if (showResult) {
    return (
      <EssayResult
        essay={generatedEssay}
        structure={usedStructure!}
        topic={essayTopic}
        onBack={() => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header fixo com gradiente e ícones */}
      <div className="fixed top-0 z-50 w-full bg-gradient-to-r from-bright-blue to-purple-600 shadow-xl">
        <div className="container mx-auto px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 transition-all duration-200 h-8 md:h-12 px-3 md:px-6 text-sm md:text-base"
                onClick={onBack}
                data-testid="button-voltar"
              >
                <ArrowLeft className="h-4 w-4 md:h-6 md:w-6 mr-1 md:mr-3" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-white/20 p-1.5 md:p-3 rounded-full">
                  <Plus className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-white">
                    {editingStructure ? 'Editor de Estruturas' : 'Criador de Estruturas'}
                  </h1>
                  <p className="text-xs md:text-base text-blue-100 hidden sm:block">
                    {editingStructure 
                      ? 'Personalize sua estrutura de redação'
                      : 'Crie sua estrutura personalizada de redação'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-2 md:px-3 py-1 text-xs md:text-sm">
                <Plus className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Nova </span>Estrutura
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com espaçamento para header fixo */}
      <div className="w-full px-3 md:px-6 pt-16 md:pt-24 pb-6 md:pb-12">
        <div className="space-y-4 md:space-y-10">
          {/* Formulário de criação */}
          <LiquidGlassCard className="border-l-2 md:border-l-4 border-l-bright-blue w-full">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-3 md:pb-6">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
                    <Palette className="h-4 w-4 md:h-6 md:w-6 text-bright-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-dark-blue">
                      {editingStructure ? 'Editar Estrutura' : 'Criar Nova Estrutura'}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {editingStructure 
                        ? 'Modifique sua estrutura existente'
                        : 'Defina seções personalizadas para criar um modelo reutilizável'
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
                <EnhancedStructureEditor
                  name={name}
                  sections={sections}
                  onNameChange={setName}
                  onSectionsChange={setSections}
                  isEditing={!!editingStructure}
                />
              </CardContent>
            </Card>
          </LiquidGlassCard>

          {/* Proposta de Redação */}
          <LiquidGlassCard className="border-l-2 md:border-l-4 border-l-green-500 w-full">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-3 md:pb-6">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="bg-green-100 p-2 md:p-3 rounded-lg">
                    <PenTool className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl text-dark-blue">Testar Estrutura</CardTitle>
                    <CardDescription className="text-sm md:text-base">Gere uma redação usando sua estrutura personalizada</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
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
              </CardContent>
            </Card>
          </LiquidGlassCard>

          {/* Validation Messages */}
          {!isValid && (name || sections.length > 0) && (
            <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
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
    </div>
  );
}