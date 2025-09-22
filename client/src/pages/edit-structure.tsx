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

    if (!editedStructure.sections || !Array.isArray(editedStructure.sections) || editedStructure.sections.length === 0) {
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

    const currentSections = Array.isArray(editedStructure.sections) ? editedStructure.sections : [];
    setEditedStructure({
      ...editedStructure,
      sections: [...currentSections, newSection]
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

  // Check if current name would conflict
  const nameExists = existingStructures.some((s: EssayStructure) => 
    s.name.toLowerCase() === editedStructure.name.toLowerCase()
  );

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
                onClick={onCancel}
                data-testid="button-voltar"
              >
                <ArrowLeft className="h-4 w-4 md:h-6 md:w-6 mr-1 md:mr-3" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-white/20 p-1.5 md:p-3 rounded-full">
                  <Edit3 className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-white">Editor de Estruturas</h1>
                  <p className="text-xs md:text-base text-blue-100 hidden sm:block">Personalize sua estrutura de redação</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-2 md:px-3 py-1 text-xs md:text-sm">
                <Copy className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Criando </span>Cópia
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo com espaçamento para header fixo */}
      <div className="w-full px-3 md:px-6 pt-16 md:pt-24 pb-6 md:pb-12">
        <div className="space-y-4 md:space-y-10">
          {/* Informações da estrutura original */}
          <LiquidGlassCard className="border-l-2 md:border-l-4 border-l-blue-500 w-full">
            <CardHeader className="pb-3 md:pb-6 px-3 md:px-6 pt-3 md:pt-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
                  <FileText className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl text-dark-blue">Estrutura Original</CardTitle>
                  <CardDescription className="text-sm md:text-base">Esta cópia será baseada na estrutura abaixo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              <div className="bg-gray-50 p-3 md:p-6 rounded-lg">
                <h3 className="font-semibold text-base md:text-lg text-gray-700 mb-2 md:mb-3">{originalStructure.name}</h3>
                <p className="text-sm md:text-base text-gray-600">
                  {Array.isArray(originalStructure.sections) ? originalStructure.sections.length : 0} seções • 
                  Criada em {originalStructure.createdAt instanceof Date 
                    ? originalStructure.createdAt.toLocaleDateString() 
                    : originalStructure.createdAt ? new Date(originalStructure.createdAt).toLocaleDateString() : 'Data não disponível'}
                </p>
              </div>
            </CardContent>
          </LiquidGlassCard>

          {/* Formulário de edição */}
          <LiquidGlassCard className="border-l-2 md:border-l-4 border-l-green-500 w-full">
            <CardHeader className="px-3 md:px-6 pt-3 md:pt-6 pb-3 md:pb-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-green-100 p-2 md:p-3 rounded-lg">
                  <Palette className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg md:text-xl text-dark-blue">Personalizar Cópia</CardTitle>
                  <CardDescription className="text-sm md:text-base">Edite o nome e as seções da sua nova estrutura</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-8 px-3 md:px-6 pb-3 md:pb-6">
              {/* Nome da estrutura */}
              <div className="space-y-2 md:space-y-3">
                <Label className="text-dark-blue font-semibold text-sm md:text-base flex items-center gap-1 md:gap-2">
                  <Edit3 className="h-4 w-4 md:h-5 md:w-5 text-bright-blue" />
                  Nome da Nova Estrutura
                </Label>
                <Input
                  value={editedStructure.name}
                  onChange={(e) => setEditedStructure({
                    ...editedStructure,
                    name: e.target.value
                  })}
                  placeholder="Nome da sua estrutura personalizada"
                  className="bg-white border-bright-blue/20 focus:border-bright-blue h-10 md:h-12 text-sm md:text-base"
                  data-testid="input-nome-estrutura"
                />
                {nameExists ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs md:text-sm">
                        <p className="font-medium text-amber-900 mb-1">Nome já existe!</p>
                        <p className="text-amber-700">
                          Já existe uma estrutura com este nome. Ao salvar, o sistema criará automaticamente um nome único adicionando um número ao final (ex: "{editedStructure.name} (1)").
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-gray-500">
                    ✅ Este nome pode ser usado para sua nova estrutura
                  </p>
                )}
              </div>

              {/* Seções */}
              <div className="space-y-3 md:space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-dark-blue font-semibold text-sm md:text-base flex items-center gap-1 md:gap-2">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-bright-blue" />
                    <span className="hidden sm:inline">Seções da Estrutura</span>
                    <span className="sm:hidden">Seções</span>
                  </Label>
                  <Button
                    onClick={addSection}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white h-8 md:h-12 px-3 md:px-6 text-xs md:text-base"
                    data-testid="button-adicionar-secao"
                  >
                    <Plus className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Nova Seção</span>
                    <span className="sm:hidden">Nova</span>
                  </Button>
                </div>

                <div className="space-y-3 md:space-y-6">
                  {Array.isArray(editedStructure.sections) && 
                    (editedStructure.sections as Section[]).map((section, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-12 rounded-xl border border-bright-blue/20">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="bg-bright-blue p-1.5 md:p-2 rounded-full">
                            <FileText className="h-3 w-3 md:h-4 md:w-4 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs md:text-sm px-2 md:px-3 py-1">
                            Seção {index + 1}
                          </Badge>
                        </div>
                        {Array.isArray(editedStructure.sections) && editedStructure.sections.length > 1 && (
                          <Button
                            onClick={() => removeSection(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50 h-8 w-8 md:h-10 md:w-10"
                            data-testid={`button-remover-secao-${index}`}
                          >
                            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3 md:space-y-6">
                        <div>
                          <Label className="text-sm md:text-base font-semibold text-dark-blue mb-1 md:mb-2 block">Título da Seção</Label>
                          <Input
                            value={section.title || ''}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            placeholder="Ex: Introdução, Desenvolvimento, Conclusão"
                            className="bg-white h-9 md:h-12 text-sm md:text-base"
                            data-testid={`input-titulo-secao-${index}`}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm md:text-base font-semibold text-dark-blue mb-1 md:mb-2 block">Descrição/Conteúdo</Label>
                          <Textarea
                            value={section.description || ''}
                            onChange={(e) => updateSection(index, 'description', e.target.value)}
                            placeholder="Descreva o conteúdo desta seção..."
                            rows={6}
                            className="bg-white resize-none text-sm md:text-base leading-relaxed min-h-[120px] md:min-h-[200px]"
                            data-testid={`textarea-descricao-secao-${index}`}
                          />
                        </div>

                        <div>
                          <Label className="text-sm md:text-base font-semibold text-dark-blue mb-1 md:mb-2 block">Diretrizes (Opcional)</Label>
                          <Textarea
                            value={section.guidelines || ''}
                            onChange={(e) => updateSection(index, 'guidelines', e.target.value)}
                            placeholder="Dicas de como usar esta seção..."
                            rows={3}
                            className="bg-white resize-none text-sm md:text-base leading-relaxed min-h-[80px] md:min-h-[100px]"
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
          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center max-w-4xl mx-auto">
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="px-6 md:px-10 py-3 md:py-4 h-10 md:h-14 text-sm md:text-base border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
              data-testid="button-cancelar"
            >
              <X className="mr-2 md:mr-3 h-4 w-4 md:h-6 md:w-6" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              size="sm"
              className="px-6 md:px-10 py-3 md:py-4 h-10 md:h-14 text-sm md:text-base bg-gradient-to-r from-bright-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg w-full sm:w-auto"
              data-testid="button-salvar-copia"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 md:mr-3 h-4 w-4 md:h-6 md:w-6 animate-spin" />
              ) : (
                <Save className="mr-2 md:mr-3 h-4 w-4 md:h-6 md:w-6" />
              )}
              <span className="hidden sm:inline">{createMutation.isPending ? "Salvando..." : "Salvar Nova Estrutura"}</span>
              <span className="sm:hidden">{createMutation.isPending ? "Salvando..." : "Salvar"}</span>
            </Button>
          </div>

          {/* Aviso sobre cópia */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-2 md:gap-4">
              <AlertCircle className="h-4 w-4 md:h-6 md:w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-sm md:text-base">
                <p className="font-semibold text-blue-900 mb-2">Como funciona a criação de cópias:</p>
                <ul className="text-blue-700 space-y-1 md:space-y-2 list-disc list-inside leading-relaxed">
                  <li>A estrutura original <strong>não será alterada</strong></li>
                  <li>Uma nova estrutura será criada com suas personalizações</li>
                  <li>Se o nome escolhido já existir, o sistema adicionará automaticamente um número para torná-lo único</li>
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
        setLocation("/use-structure");
      }
    } else {
      // Se não há dados, volta para a página anterior
      toast({
        title: "Nenhuma estrutura selecionada",
        description: "Selecione uma estrutura para editar.",
        variant: "destructive"
      });
      setLocation("/use-structure");
    }
  }, [setLocation, toast]);

  const handleSave = (structure: EssayStructure) => {
    // Limpar sessionStorage
    sessionStorage.removeItem('structureToEdit');
    sessionStorage.removeItem('previousPage');
    
    // Volta para a tela "Usar estrutura existente" após salvar
    setLocation('/use-structure');
  };

  const handleCancel = () => {
    // Limpar sessionStorage e voltar para "Usar estrutura existente"
    sessionStorage.removeItem('structureToEdit');
    sessionStorage.removeItem('previousPage');
    // Volta para a tela "Usar estrutura existente"
    setLocation('/use-structure');
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