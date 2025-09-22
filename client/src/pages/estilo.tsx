import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Plus, ArrowLeft, Edit3, Trash2, Edit, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateStructure } from "@/pages/create-structure";
import { apiRequest } from "@/lib/queryClient";
import type { EssayStructure, Section } from "@shared/schema";

export default function Estilo() {
  const [location, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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

  const saveMutation = useMutation({
    mutationFn: async (structure: EssayStructure) => {
      const method = structure.id.startsWith('user-') ? "POST" : "PUT";
      const url = method === "POST" ? `/api/users/${userId}/structures` : `/api/structures/${structure.id}`;
      
      return await apiRequest(url, {
        method,
        body: JSON.stringify({
          name: structure.name,
          sections: structure.sections,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Estrutura salva!",
        description: "Sua estrutura foi salva com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'structures'] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a estrutura.",
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={backUrl} data-testid="button-back">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                >
                  <ArrowLeft size={14} />
                  <span>Voltar</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <Edit className="text-white" size={16} />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-dark-blue">Estrutura Coringa</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-soft-gray">Gere redações personalizadas seguindo sua metodologia preferida</p>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pt-20 md:pt-24">
        {/* Introduction Section */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-blue mb-3 md:mb-4">Como funciona a Estrutura Coringa?</h2>
            <p className="text-base md:text-lg text-soft-gray max-w-2xl mx-auto leading-relaxed px-2">
              A Estrutura Coringa permite que você crie modelos de redação personalizados com suas próprias seções e metodologias.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 max-w-4xl mx-auto mb-8 md:mb-12">
          <LiquidGlassCard className="hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div 
              className="text-center p-6 md:p-8"
              onClick={() => setSelectedMode('create')}
              data-testid="card-criar-estrutura"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-bright-blue/20 to-bright-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 md:h-10 md:w-10 text-bright-blue" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-dark-blue mb-3 md:mb-4">
                Criar Nova Estrutura
              </h3>
              <p className="text-sm md:text-base text-soft-gray mb-4 md:mb-6 leading-relaxed px-2">
                Monte sua própria estrutura definindo seções personalizadas, instruções específicas e metodologia única para suas redações.
              </p>
              <div className="inline-flex items-center text-bright-blue font-medium text-sm md:text-base">
                Começar criação
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </div>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard className="hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div 
              className="text-center p-6 md:p-8"
              onClick={() => setLocation(`/use-structure?from=estilo`)}
              data-testid="card-usar-estrutura"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-green-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-dark-blue mb-3 md:mb-4">
                Usar Estrutura Existente
              </h3>
              <p className="text-sm md:text-base text-soft-gray mb-4 md:mb-6 leading-relaxed px-2">
                Escolha uma das suas estruturas já criadas e gere redações seguindo a metodologia que você definiu anteriormente.
              </p>
              <div className="inline-flex items-center text-green-600 font-medium text-sm md:text-base">
                Escolher estrutura
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Comparison Cards */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-blue-100">
              <div className="flex items-start md:items-center mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-bright-blue/10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-bright-blue" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-dark-blue leading-tight">Criar Nova Estrutura</h3>
              </div>
              <p className="text-sm md:text-base text-soft-gray mb-3 md:mb-4 leading-relaxed">
                Ideal quando você quer personalizar completamente sua metodologia de redação.
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-soft-gray">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-bright-blue rounded-full mr-3 flex-shrink-0"></div>
                  Define suas próprias seções
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-bright-blue rounded-full mr-3 flex-shrink-0"></div>
                  Cria instruções personalizadas
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-bright-blue rounded-full mr-3 flex-shrink-0"></div>
                  Salva para reutilizar depois
                </li>
              </ul>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-100">
              <div className="flex items-start md:items-center mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-dark-blue leading-tight">Usar Estrutura Existente</h3>
              </div>
              <p className="text-sm md:text-base text-soft-gray mb-3 md:mb-4 leading-relaxed">
                Perfeito quando você já tem uma estrutura pronta e quer gerar redações rapidamente.
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-soft-gray">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></div>
                  Seleciona estrutura já criada
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></div>
                  Gera redação instantaneamente
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></div>
                  Mantém consistência metodológica
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Existing Structures */}
        {structures.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-dark-blue mb-4 md:mb-6 text-center px-2">
              Suas Estruturas Salvas
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {structures.map((structure) => (
                <Card key={structure.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-base md:text-lg text-dark-blue leading-tight">
                      {structure.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs md:text-sm text-soft-gray">
                        {new Date(structure.createdAt!).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex gap-1 md:gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(structure)}
                          data-testid={`button-editar-${structure.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(structure.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-deletar-${structure.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
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