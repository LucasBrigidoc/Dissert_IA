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
        <div className="container mx-auto px-3 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 transition-all duration-200 h-8 md:h-12 px-2 sm:px-3 md:px-6 text-xs sm:text-sm md:text-base"
                onClick={onBack}
                data-testid="button-voltar"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 mr-1 md:mr-3" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="bg-white/20 p-1 sm:p-1.5 md:p-3 rounded-full">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-white">
                    {editingStructure ? 'Editor de Estruturas' : 'Criador de Estruturas'}
                  </h1>
                  <p className="text-xs md:text-base text-blue-100 hidden md:block">
                    {editingStructure 
                      ? 'Personalize sua estrutura de redação'
                      : 'Crie sua estrutura personalizada de redação'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 text-xs md:text-sm">
                <Plus className="h-2 w-2 sm:h-3 sm:w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Nova </span>Estrutura
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com espaçamento para header fixo */}
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 md:px-8 pt-16 sm:pt-20 md:pt-28 pb-6 sm:pb-8 md:pb-16">
        <div className="space-y-6 sm:space-y-8 md:space-y-12">
          {/* Formulário de criação */}
          <LiquidGlassCard className="border-l-4 md:border-l-6 border-l-bright-blue w-full shadow-lg">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-7 md:pt-8 pb-4 sm:pb-5 md:pb-6">
                <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 sm:p-4 md:p-5 rounded-xl flex-shrink-0 shadow-md mobile-touch-target">
                    <Palette className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-bright-blue" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-dark-blue font-bold mobile-text-adjust">
                      {editingStructure ? 'Editar Estrutura' : 'Criar Nova Estrutura'}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base md:text-lg mt-2 text-soft-gray mobile-text-adjust">
                      {editingStructure 
                        ? 'Modifique e aperfeiçoe sua estrutura existente'
                        : 'Defina seções personalizadas para criar um modelo reutilizável e eficiente'
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-7 md:pb-8">
                <EnhancedStructureEditor
                  name={name}
                  sections={sections}
                  onNameChange={setName}
                  onSectionsChange={setSections}
                  isEditing={!!editingStructure}
                  onSave={handleSave}
                  isSaving={isLoading}
                  showSaveButton={true}
                />
              </CardContent>
            </Card>
          </LiquidGlassCard>

          {/* Proposta de Redação */}
          <LiquidGlassCard className="border-l-4 md:border-l-6 border-l-green-500 w-full shadow-lg">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-7 md:pt-8 pb-4 sm:pb-5 md:pb-6">
                <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 sm:p-4 md:p-5 rounded-xl flex-shrink-0 shadow-md mobile-touch-target">
                    <PenTool className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-dark-blue font-bold mobile-text-adjust">Testar Estrutura</CardTitle>
                    <CardDescription className="text-sm sm:text-base md:text-lg mt-2 text-soft-gray mobile-text-adjust">Gere uma redação usando sua estrutura personalizada e veja os resultados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-7 md:pb-8">
                <div className="space-y-6 sm:space-y-7 md:space-y-8">
                  
                  {/* Grid de campos de entrada */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 md:gap-8">
                    <div className="space-y-3 sm:space-y-4">
                      <Label htmlFor="essay-topic" className="text-base sm:text-lg md:text-xl text-dark-blue font-semibold mobile-text-adjust flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Tema da Redação
                      </Label>
                      <Textarea
                        id="essay-topic"
                        placeholder="Ex: A importância da educação digital no século XXI"
                        value={essayTopic}
                        onChange={(e) => setEssayTopic(e.target.value)}
                        rows={4}
                        className="text-sm sm:text-base md:text-lg p-4 sm:p-5 mobile-touch-target resize-none border-2 focus:border-bright-blue rounded-lg"
                        data-testid="textarea-tema-redacao"
                      />
                      <p className="text-sm sm:text-base text-soft-gray mobile-text-adjust">
                        📝 Defina claramente o tema central da sua redação
                      </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <Label htmlFor="additional-instructions" className="text-base sm:text-lg md:text-xl text-dark-blue font-semibold mobile-text-adjust flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        Instruções Especiais <span className="text-sm font-normal">(opcional)</span>
                      </Label>
                      <Textarea
                        id="additional-instructions"
                        placeholder="Ex: Abordagem argumentativa, público jovem, incluir dados estatísticos..."
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        rows={4}
                        className="text-sm sm:text-base md:text-lg p-4 sm:p-5 mobile-touch-target resize-none border-2 focus:border-green-500 rounded-lg"
                        data-testid="textarea-instrucoes-adicionais"
                      />
                      <p className="text-sm sm:text-base text-soft-gray mobile-text-adjust">
                        ⚙️ Requisitos específicos, tom, estilo ou público-alvo
                      </p>
                    </div>
                  </div>
                  
                  {/* Seção de ação */}
                  <div className="mt-6 sm:mt-8 md:mt-10 pt-6 sm:pt-7 md:pt-8 border-t-2 border-bright-blue/20">
                    <div className="text-center space-y-4 sm:space-y-5">
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 sm:p-5 md:p-6 rounded-xl">
                        <p className="text-sm sm:text-base md:text-lg text-dark-blue font-medium mobile-text-adjust">
                          {isValid 
                            ? `🚀 Pronto para criar redação com: "${name || 'Nova estrutura'}"` 
                            : '⚠️ Complete a estrutura acima para testar'
                          }
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateEssay}
                        disabled={!essayTopic.trim() || !isValid || isGenerating}
                        size="lg"
                        className="bg-gradient-to-r from-bright-blue to-green-500 hover:from-blue-600 hover:to-green-600 px-8 sm:px-10 md:px-12 py-4 sm:py-5 w-full sm:w-auto text-base sm:text-lg md:text-xl font-semibold mobile-touch-target shadow-lg hover:shadow-xl transition-all"
                        data-testid="button-gerar-redacao"
                      >
                        {isGenerating ? (
                          <Loader2 className="mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                        ) : (
                          <Play className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                        <span>
                          {isGenerating ? "Gerando Redação..." : "Criar Redação Agora"}
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
            <LiquidGlassCard className="border-l-4 md:border-l-6 border-l-yellow-500 w-full shadow-lg">
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="px-4 sm:px-6 md:px-8 py-6 sm:py-7 md:py-8">
                  <div className="flex items-start gap-4 sm:gap-5 md:gap-6">
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 sm:p-4 rounded-xl flex-shrink-0 shadow-md">
                      <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-800 mb-3 sm:mb-4 mobile-text-adjust">⚠️ Campos Obrigatórios</h3>
                      <p className="text-sm sm:text-base md:text-lg text-yellow-700 mb-4 sm:mb-5 mobile-text-adjust">
                        Complete os campos a seguir para continuar:
                      </p>
                      <ul className="space-y-2 sm:space-y-3">
                        {!name.trim() && (
                          <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg text-yellow-700 mobile-text-adjust">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Nome da estrutura
                          </li>
                        )}
                        {sections.length === 0 && (
                          <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg text-yellow-700 mobile-text-adjust">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Pelo menos uma seção
                          </li>
                        )}
                        {sections.some(s => !s.title.trim()) && (
                          <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg text-yellow-700 mobile-text-adjust">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Título de todas as seções
                          </li>
                        )}
                        {sections.some(s => !s.description.trim()) && (
                          <li className="flex items-center gap-3 text-sm sm:text-base md:text-lg text-yellow-700 mobile-text-adjust">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            Descrição de todas as seções
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </LiquidGlassCard>
          )}
        </div>
      </div>
    </div>
  );
}