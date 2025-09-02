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
      // Simular geração de redação com base na estrutura
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let essay = `**${essayTopic}**\n\n`;
      
      sections.forEach((section, index) => {
        essay += `**${section.title}**\n\n`;
        essay += `${section.description}\n\n`;
        
        // Adicionar conteúdo fictício baseado na descrição
        const sampleContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`;
        essay += `${sampleContent}\n\n`;
        
        if (index < sections.length - 1) {
          essay += '---\n\n';
        }
      });
      
      setGeneratedEssay(essay);
      setUsedStructure(currentStructure);
      setShowResult(true);
      
      toast({
        title: "Redação gerada com sucesso!",
        description: "Sua redação foi criada seguindo a estrutura personalizada.",
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
            className="mb-4 bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-bright-blue text-dark-blue transition-all duration-200" 
            data-testid="button-voltar"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue mb-2">
                {editingStructure ? 'Editar Estrutura' : 'Criar Nova Estrutura'}
              </h1>
              <p className="text-soft-gray">
                {editingStructure 
                  ? 'Modifique sua estrutura existente'
                  : 'Defina seções personalizadas para criar um modelo reutilizável'
                }
              </p>
            </div>
            
          </div>
        </div>

        {/* Editor Centralizado */}
        <LiquidGlassCard>
          <EnhancedStructureEditor
            name={name}
            sections={sections}
            onNameChange={setName}
            onSectionsChange={setSections}
            isEditing={!!editingStructure}
          />
        </LiquidGlassCard>

        

        {/* Proposta de Redação */}
        <LiquidGlassCard>
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="h-5 w-5 text-bright-blue" />
            <h3 className="text-lg font-semibold text-dark-blue">
              Testar Estrutura
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
                {isValid 
                  ? `Criar redação com: ${name || 'Nova estrutura'}` 
                  : 'Complete a estrutura para testar'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleGenerateEssay}
                  disabled={!essayTopic.trim() || !isValid || isGenerating}
                  className="bg-bright-blue hover:bg-blue-600 px-8"
                  data-testid="button-gerar-redacao"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? "Gerando Redação..." : "Criar Redação"}
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={!isValid || isLoading}
                  className="bg-green-600 hover:bg-green-700 px-8"
                  data-testid="button-salvar-estrutura"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Salvando...' : (editingStructure ? 'Atualizar' : 'Salvar')} Estrutura
                </Button>
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Validation Messages */}
        {!isValid && (name || sections.length > 0) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Campos obrigatórios:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
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