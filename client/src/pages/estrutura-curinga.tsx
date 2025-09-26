import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Plus, ArrowLeft, Edit3, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateStructure } from "@/pages/create-structure";
import { apiRequest } from "@/lib/queryClient";
import type { EssayStructure, Section } from "@shared/schema";
import { AIUsageProgress } from "@/components/ai-usage-progress";

export function EstruturaCuringa() {
  const [selectedMode, setSelectedMode] = useState<'create' | 'use' | null>(null);
  const [editingStructure, setEditingStructure] = useState<EssayStructure | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [location, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const modeParam = urlParams.get('mode');
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Definir modo baseado no parâmetro da URL
  useEffect(() => {
    if (modeParam === 'use') {
      setSelectedMode('use');
    } else if (modeParam === 'create') {
      setSelectedMode('create');
    }
  }, [modeParam]);
  
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* AI Usage Progress - Padronizado no topo */}
      <AIUsageProgress variant="header" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={backUrl}>
            <Button variant="ghost" className="mb-4" data-testid="button-voltar">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {fromPage === 'functionalities' ? 'Voltar às Funcionalidades' : 'Voltar ao Dashboard'}
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dark-blue mb-4">
              Estrutura Curinga
            </h1>
            <p className="text-lg text-soft-gray max-w-2xl mx-auto">
              Crie modelos de estrutura reutilizáveis e gere redações personalizadas seguindo sua metodologia preferida
            </p>
          </div>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
              onClick={() => setLocation(`/use-structure?from=${fromPage}`)}
              data-testid="card-usar-estrutura"
            >
              <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-500/20 transition-colors">
                <FileText className="h-8 w-8 text-gray-600" />
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

        {/* Existing Structures Preview */}
        {structures.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-dark-blue mb-6 text-center">
              Suas Estruturas Salvas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {structures.slice(0, 6).map((structure) => (
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

        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="text-soft-gray">Carregando estruturas...</div>
          </div>
        )}
      </div>
    </div>
  );
}

