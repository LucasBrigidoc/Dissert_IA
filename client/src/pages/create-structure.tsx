import { useState } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { StructureEditor } from "@/components/structure-editor";
import { StructurePreview } from "@/components/structure-preview";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Section, InsertEssayStructure } from "@shared/schema";
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
  const [showPreview, setShowPreview] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4" data-testid="button-voltar">
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
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                data-testid="button-previa"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? 'Ocultar' : 'Ver'} Prévia
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!isValid || isLoading}
                className="bg-bright-blue hover:bg-blue-600"
                data-testid="button-salvar-estrutura"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : (editingStructure ? 'Atualizar' : 'Salvar')} Estrutura
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <LiquidGlassCard>
            <StructureEditor
              name={name}
              sections={sections}
              onNameChange={setName}
              onSectionsChange={setSections}
              isEditing={!!editingStructure}
            />
          </LiquidGlassCard>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <h2 className="text-xl font-semibold text-dark-blue mb-4">
                Prévia da Estrutura
              </h2>
              <StructurePreview
                name={name}
                sections={sections}
                className="lg:max-h-[80vh] lg:overflow-y-auto"
              />
            </div>
          )}
        </div>

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