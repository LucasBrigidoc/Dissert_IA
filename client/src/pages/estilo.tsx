import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, ArrowLeft, Edit3, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateStructure } from "@/pages/create-structure";
import { UseStructure } from "@/pages/use-structure";
import { apiRequest } from "@/lib/queryClient";
import type { EssayStructure, Section } from "@shared/schema";

export default function Estilo() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';
  
  const [selectedMode, setSelectedMode] = useState<'create' | 'use' | null>(null);
  const [editingStructure, setEditingStructure] = useState<EssayStructure | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock userId - in a real app this would come from auth context
  const userId = "mock-user-id";

  const { data: structures = [], isLoading } = useQuery<EssayStructure[]>({
    queryKey: ['/api/users', userId, 'structures'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (structureId: string) => {
      return await apiRequest(`/api/structures/${structureId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Estrutura excluída",
        description: "A estrutura foi removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'structures'] });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a estrutura.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (structure: EssayStructure) => {
    setEditingStructure(structure);
    setSelectedMode('create');
  };

  const handleDelete = (structureId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta estrutura?')) {
      deleteMutation.mutate(structureId);
    }
  };

  console.log('Current location:', location);
  console.log('URL search params:', window.location.search);
  console.log('From page:', fromPage);
  console.log('Back URL:', backUrl);

  if (selectedMode === 'create') {
    return (
      <CreateStructure 
        onBack={() => {
          setSelectedMode(null);
          setEditingStructure(null);
        }}
        editingStructure={editingStructure ? {
          id: editingStructure.id,
          name: editingStructure.name,
          sections: Array.isArray(editingStructure.sections) ? editingStructure.sections as Section[] : []
        } : null}
      />
    );
  }

  if (selectedMode === 'use') {
    return <UseStructure structures={structures} onBack={() => setSelectedMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={backUrl} className="text-soft-gray hover:text-bright-blue" data-testid="button-back">
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Estrutura Curinga</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Crie modelos reutilizáveis e gere redações personalizadas seguindo sua metodologia preferida
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <LiquidGlassCard className="hover:scale-105 transition-transform cursor-pointer group">
            <div 
              className="text-center p-8"
              onClick={() => setSelectedMode('create')}
              data-testid="card-criar-estrutura"
            >
              <div className="w-16 h-16 bg-bright-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-bright-blue/20 transition-colors">
                <Plus className="h-8 w-8 text-bright-blue" />
              </div>
              <h3 className="text-2xl font-bold text-dark-blue mb-4">
                Criar Nova Estrutura
              </h3>
              <p className="text-soft-gray">
                Defina seções personalizadas e crie um modelo reutilizável para suas redações
              </p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="hover:scale-105 transition-transform cursor-pointer group">
            <div 
              className="text-center p-8"
              onClick={() => setSelectedMode('use')}
              data-testid="card-usar-estrutura"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500/20 transition-colors">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-dark-blue mb-4">
                Usar Estrutura Existente
              </h3>
              <p className="text-soft-gray">
                Selecione uma estrutura salva e gere redações seguindo esse modelo
              </p>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Existing Structures */}
        {structures.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-dark-blue mb-6 text-center">
              Suas Estruturas Salvas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {structures.map((structure) => (
                <Card key={structure.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-dark-blue">
                      {structure.name}
                    </CardTitle>
                    <CardDescription>
                      {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-soft-gray">
                        {new Date(structure.createdAt!).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(structure)}
                          data-testid={`button-editar-${structure.id}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(structure.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-deletar-${structure.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {structures.length === 0 && !isLoading && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <FileText className="mx-auto h-16 w-16 text-soft-gray/50 mb-4" />
            <h3 className="text-xl font-semibold text-dark-blue mb-2">
              Nenhuma estrutura criada ainda
            </h3>
            <p className="text-soft-gray mb-6">
              Crie sua primeira estrutura para começar a gerar redações personalizadas
            </p>
            <Button 
              onClick={() => setSelectedMode('create')}
              className="bg-bright-blue hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Estrutura
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="text-soft-gray">Carregando estruturas...</div>
          </div>
        )}
      </div>
    </div>
  );
}