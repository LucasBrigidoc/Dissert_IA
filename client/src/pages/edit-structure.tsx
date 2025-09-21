import { useState, useEffect } from "react";
import { ArrowLeft, Save, X, Copy, Edit3, FileText, Palette, Plus, Trash2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EssayStructure, Section, InsertEssayStructure } from "@shared/schema";
import { insertEssayStructureSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface EditStructureProps {
  originalStructure: EssayStructure;
  onSave: (structure: EssayStructure) => void;
  onCancel: () => void;
}

export function EditStructure({ originalStructure, onSave, onCancel }: EditStructureProps) {
  const [editedStructure, setEditedStructure] = useState<EssayStructure>({
    ...originalStructure,
    name: originalStructure.name + " - Cópia",
    id: `copy-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Mock userId - in a real app this would come from auth context
  const userId = "mock-user-id";

  // Query to get existing structures for name uniqueness check
  const { data: existingStructures = [] } = useQuery({
    queryKey: ['/api/users', userId, 'structures'],
    queryFn: () => apiRequest(`/api/users/${userId}/structures`)
  });

  // Mutation to create new structure
  const createMutation = useMutation({
    mutationFn: async (data: InsertEssayStructure) => {
      return await apiRequest("/api/structures", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (savedStructure) => {
      toast({
        title: "Nova estrutura criada!",
        description: `A estrutura "${savedStructure.name}" foi criada com sucesso.`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'structures'] });
      onSave(savedStructure);
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível criar a nova estrutura. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Function to ensure unique name
  const ensureUniqueName = (baseName: string): string => {
    const existingNames = existingStructures.map((s: EssayStructure) => s.name.toLowerCase());
    let uniqueName = baseName;
    let counter = 1;

    while (existingNames.includes(uniqueName.toLowerCase())) {
      uniqueName = `${baseName} (${counter})`;
      counter++;
    }

    return uniqueName;
  };

  const handleSave = () => {
    // Validação básica
    if (!editedStructure.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a estrutura.",
        variant: "destructive"
      });
      return;
    }

    if (!editedStructure.sections || editedStructure.sections.length === 0) {
      toast({
        title: "Seções obrigatórias",
        description: "A estrutura deve ter pelo menos uma seção.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Garantir nome único
      const uniqueName = ensureUniqueName(editedStructure.name);
      
      // Preparar dados para salvamento
      const structureData = {
        userId,
        name: uniqueName,
        sections: editedStructure.sections
      };

      // Validar com schema
      const validatedData = insertEssayStructureSchema.parse(structureData);

      // Salvar via mutation
      createMutation.mutate(validatedData);
      
    } catch (error) {
      console.error('Erro na validação:', error);
      toast({
        title: "Dados inválidos",
        description: "Por favor, verifique os dados da estrutura e tente novamente.",
        variant: "destructive"
      });
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "",
      description: "",
      guidelines: ""
    };

    setEditedStructure({
      ...editedStructure,
      sections: [...(editedStructure.sections || []), newSection]
    });
  };

  const removeSection = (index: number) => {
    const newSections = [...(editedStructure.sections as Section[])];
    newSections.splice(index, 1);
    setEditedStructure({ ...editedStructure, sections: newSections });
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...(editedStructure.sections as Section[])];
    newSections[index] = { ...newSections[index], [field]: value };
    setEditedStructure({ ...editedStructure, sections: newSections });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header com gradiente e ícones */}
      <div className="bg-gradient-to-r from-bright-blue to-purple-600 shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 transition-all duration-200"
                onClick={onCancel}
                data-testid="button-voltar"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Editor de Estruturas</h1>
                  <p className="text-blue-100">Personalize sua estrutura de redação</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Copy className="h-4 w-4 mr-2" />
                Criando Cópia
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Informações da estrutura original */}
          <LiquidGlassCard className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-dark-blue">Estrutura Original</CardTitle>
                  <CardDescription>Esta cópia será baseada na estrutura abaixo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">{originalStructure.name}</h3>
                <p className="text-sm text-gray-600">
                  {originalStructure.sections?.length || 0} seções • 
                  Criada em {originalStructure.createdAt instanceof Date 
                    ? originalStructure.createdAt.toLocaleDateString() 
                    : new Date(originalStructure.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </LiquidGlassCard>

          {/* Formulário de edição */}
          <LiquidGlassCard className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Palette className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-dark-blue">Personalizar Cópia</CardTitle>
                  <CardDescription>Edite o nome e as seções da sua nova estrutura</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome da estrutura */}
              <div className="space-y-2">
                <Label className="text-dark-blue font-medium flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-bright-blue" />
                  Nome da Nova Estrutura
                </Label>
                <Input
                  value={editedStructure.name}
                  onChange={(e) => setEditedStructure({
                    ...editedStructure,
                    name: e.target.value
                  })}
                  placeholder="Nome da sua estrutura personalizada"
                  className="bg-white border-bright-blue/20 focus:border-bright-blue"
                  data-testid="input-nome-estrutura"
                />
                <p className="text-xs text-gray-500">
                  ⚠️ A cópia terá um nome diferente para evitar confusão com a original
                </p>
              </div>

              {/* Seções */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-dark-blue font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-bright-blue" />
                    Seções da Estrutura
                  </Label>
                  <Button
                    onClick={addSection}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    data-testid="button-adicionar-secao"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Seção
                  </Button>
                </div>

                <div className="space-y-4">
                  {Array.isArray(editedStructure.sections) && 
                    (editedStructure.sections as Section[]).map((section, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-bright-blue/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-bright-blue p-1.5 rounded-full">
                            <FileText className="h-3 w-3 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Seção {index + 1}
                          </Badge>
                        </div>
                        {editedStructure.sections!.length > 1 && (
                          <Button
                            onClick={() => removeSection(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50"
                            data-testid={`button-remover-secao-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-dark-blue">Título da Seção</Label>
                          <Input
                            value={section.title || ''}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            placeholder="Ex: Introdução, Desenvolvimento, Conclusão"
                            className="mt-1 bg-white"
                            data-testid={`input-titulo-secao-${index}`}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-dark-blue">Descrição/Conteúdo</Label>
                          <Textarea
                            value={section.description || ''}
                            onChange={(e) => updateSection(index, 'description', e.target.value)}
                            placeholder="Descreva o conteúdo desta seção..."
                            rows={3}
                            className="mt-1 bg-white resize-none"
                            data-testid={`textarea-descricao-secao-${index}`}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-dark-blue">Diretrizes (Opcional)</Label>
                          <Textarea
                            value={section.guidelines || ''}
                            onChange={(e) => updateSection(index, 'guidelines', e.target.value)}
                            placeholder="Dicas de como usar esta seção..."
                            rows={2}
                            className="mt-1 bg-white resize-none"
                            data-testid={`textarea-diretrizes-secao-${index}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>

          {/* Botões de ação */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={onCancel}
              variant="outline"
              size="lg"
              className="px-8 border-gray-300 hover:bg-gray-50"
              data-testid="button-cancelar"
            >
              <X className="mr-2 h-5 w-5" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              size="lg"
              className="px-8 bg-gradient-to-r from-bright-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              data-testid="button-salvar-copia"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {createMutation.isPending ? "Salvando..." : "Salvar Nova Estrutura"}
            </Button>
          </div>

          {/* Aviso sobre cópia */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Como funciona a criação de cópias:</p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside">
                  <li>A estrutura original <strong>não será alterada</strong></li>
                  <li>Uma nova estrutura será criada com suas personalizações</li>
                  <li>A cópia terá um nome único para evitar confusão</li>
                  <li>Você poderá editar a cópia quantas vezes quiser</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Página wrapper para uso em roteamento
interface EditStructurePageProps {}

export default function EditStructurePage({}: EditStructurePageProps) {
  const [, setLocation] = useLocation();
  const [originalStructure, setOriginalStructure] = useState<EssayStructure | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Tentar obter estrutura do sessionStorage
    const structureData = sessionStorage.getItem('structureToEdit');
    if (structureData) {
      try {
        const structure = JSON.parse(structureData);
        setOriginalStructure(structure);
      } catch (error) {
        console.error('Erro ao carregar estrutura:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a estrutura para edição.",
          variant: "destructive"
        });
        setLocation("/estrutura-curinga");
      }
    } else {
      // Se não há dados, volta para a página anterior
      toast({
        title: "Nenhuma estrutura selecionada",
        description: "Selecione uma estrutura para editar.",
        variant: "destructive"
      });
      setLocation("/estrutura-curinga");
    }
  }, [setLocation, toast]);

  const handleSave = (structure: EssayStructure) => {
    // Limpar sessionStorage
    sessionStorage.removeItem('structureToEdit');
    
    // Voltar para página anterior
    setLocation("/estrutura-curinga");
  };

  const handleCancel = () => {
    // Limpar sessionStorage e voltar
    sessionStorage.removeItem('structureToEdit');
    setLocation("/estrutura-curinga");
  };

  if (!originalStructure) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estrutura...</p>
        </div>
      </div>
    );
  }

  return (
    <EditStructure 
      originalStructure={originalStructure}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}