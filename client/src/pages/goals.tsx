import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { ArrowLeft, Target, Plus, Trash2, Edit3, Loader2, AlertCircle, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SelectUserGoal } from "@shared/schema";

export default function Goals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    description: "",
    unit: "unidades"
  });

  const [editingGoals, setEditingGoals] = useState<Record<string, Partial<SelectUserGoal>>>({});

  const { data: goals = [], isLoading, isError, error, refetch } = useQuery<SelectUserGoal[]>({
    queryKey: ['/api/goals']
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: { title: string; target: number; description: string; unit: string }) => {
      return apiRequest('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: goalData.title,
          target: goalData.target,
          current: 0,
          description: goalData.description,
          unit: goalData.unit,
          completed: false,
          priority: 'media'
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({ title: "Meta criada com sucesso!" });
      setNewGoal({ title: "", target: "", description: "", unit: "unidades" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar meta", 
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive" 
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SelectUserGoal> }) => {
      return apiRequest(`/api/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({ title: "Meta atualizada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar meta",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive" 
      });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/goals/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({ title: "Meta excluída com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir meta",
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    }
  });

  const handleAddGoal = () => {
    const targetNum = parseFloat(newGoal.target);
    
    if (!newGoal.title) {
      toast({ title: "O título é obrigatório", variant: "destructive" });
      return;
    }
    
    if (!newGoal.target || isNaN(targetNum) || targetNum <= 0) {
      toast({ title: "A meta deve ser um número maior que zero", variant: "destructive" });
      return;
    }

    createGoalMutation.mutate({
      title: newGoal.title,
      target: targetNum,
      description: newGoal.description,
      unit: newGoal.unit
    });
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoalMutation.mutate(id);
  };

  const handleSaveGoal = (id: string) => {
    const updates = editingGoals[id];
    if (updates) {
      const cleanUpdates: any = {};
      
      if (updates.title !== undefined) cleanUpdates.title = updates.title;
      if (updates.description !== undefined) cleanUpdates.description = updates.description;
      if (updates.unit !== undefined) cleanUpdates.unit = updates.unit;
      
      if (updates.target !== undefined) {
        const targetNum = typeof updates.target === 'number' ? updates.target : parseFloat(String(updates.target));
        if (!isNaN(targetNum) && targetNum > 0) {
          cleanUpdates.target = targetNum;
        }
      }
      
      if (updates.current !== undefined) {
        const currentNum = typeof updates.current === 'number' ? updates.current : parseFloat(String(updates.current));
        if (!isNaN(currentNum) && currentNum >= 0) {
          cleanUpdates.current = currentNum;
        }
      }
      
      if (Object.keys(cleanUpdates).length > 0) {
        updateGoalMutation.mutate({ id, data: cleanUpdates }, {
          onSuccess: () => {
            setEditingGoals(prev => {
              const newState = { ...prev };
              delete newState[id];
              return newState;
            });
          }
        });
      }
    }
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    setEditingGoals(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const getGoalValue = (goal: SelectUserGoal, field: keyof SelectUserGoal) => {
    return editingGoals[goal.id]?.[field] !== undefined 
      ? editingGoals[goal.id][field] 
      : goal[field];
  };

  const hasChanges = (goalId: string) => {
    return editingGoals[goalId] !== undefined && Object.keys(editingGoals[goalId]).length > 0;
  };

  const calculateProgress = (current: number, target: number) => {
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-bright-blue/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="text-dark-blue hover:bg-bright-blue/10"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Edit3 className="text-white" size={14} />
              </div>
              <h1 className="text-xl font-bold text-dark-blue">Personalizar Metas</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Erro ao carregar metas. {error instanceof Error ? error.message : 'Tente novamente.'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
                data-testid="button-retry-goals"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Goals */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-blue">Suas Metas Atuais</h2>
            <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
              <Target className="text-white" size={16} />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-bright-blue" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-soft-gray">
              Você ainda não tem metas cadastradas. Adicione uma meta abaixo!
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const current = getGoalValue(goal, 'current') as number;
                const target = getGoalValue(goal, 'target') as number;
                const progress = calculateProgress(current, target);
                
                return (
                  <div key={goal.id} className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        value={getGoalValue(goal, 'title') as string}
                        onChange={(e) => handleFieldChange(goal.id, 'title', e.target.value)}
                        className="font-medium text-dark-blue bg-transparent border-none p-0 focus:ring-0"
                        data-testid={`input-goal-title-${goal.id}`}
                      />
                      <div className="flex items-center gap-2">
                        {hasChanges(goal.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveGoal(goal.id)}
                            className="text-green-600 hover:bg-green-50"
                            data-testid={`button-save-goal-${goal.id}`}
                            disabled={updateGoalMutation.isPending}
                          >
                            {updateGoalMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-500 hover:bg-red-50"
                          data-testid={`button-delete-goal-${goal.id}`}
                          disabled={deleteGoalMutation.isPending}
                        >
                          {deleteGoalMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <Label className="text-xs text-soft-gray">Meta</Label>
                        <Input
                          type="number"
                          value={target}
                          onChange={(e) => handleFieldChange(goal.id, 'target', e.target.value)}
                          className="mt-1"
                          data-testid={`input-goal-target-${goal.id}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-soft-gray">Progresso Atual</Label>
                        <Input
                          type="number"
                          value={current}
                          onChange={(e) => handleFieldChange(goal.id, 'current', e.target.value)}
                          className="mt-1"
                          data-testid={`input-goal-current-${goal.id}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-soft-gray">Unidade</Label>
                        <Input
                          value={getGoalValue(goal, 'unit') as string}
                          onChange={(e) => handleFieldChange(goal.id, 'unit', e.target.value)}
                          className="mt-1"
                          data-testid={`input-goal-unit-${goal.id}`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-soft-gray">Descrição</Label>
                      <Textarea
                        value={getGoalValue(goal, 'description') as string || ""}
                        onChange={(e) => handleFieldChange(goal.id, 'description', e.target.value)}
                        className="mt-1 h-20 resize-none"
                        placeholder="Descreva sua meta..."
                        data-testid={`textarea-goal-description-${goal.id}`}
                      />
                    </div>
                    
                    <div className="mt-3 p-2 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 rounded border border-bright-blue/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-soft-gray">Progresso:</span>
                        <span className="text-bright-blue font-semibold">
                          {current}/{target} ({progress}%)
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-bright-blue to-dark-blue rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </LiquidGlassCard>

        {/* Add New Goal */}
        <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-blue">Adicionar Nova Meta</h2>
            <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
              <Plus className="text-white" size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-dark-blue">Título da Meta</Label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="Ex: Fazer 3 redações"
                className="mt-1"
                data-testid="input-new-goal-title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-dark-blue">Meta (valor numérico)</Label>
                <Input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  placeholder="Ex: 3"
                  className="mt-1"
                  data-testid="input-new-goal-target"
                />
              </div>
              <div>
                <Label className="text-sm text-dark-blue">Unidade</Label>
                <Input
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                  placeholder="Ex: redações, horas, páginas"
                  className="mt-1"
                  data-testid="input-new-goal-unit"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-dark-blue">Descrição</Label>
              <Textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="Descreva sua nova meta..."
                className="mt-1 h-20 resize-none"
                data-testid="textarea-new-goal-description"
              />
            </div>
            
            <Button
              onClick={handleAddGoal}
              className="w-full bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
              data-testid="button-add-goal"
              disabled={createGoalMutation.isPending}
            >
              {createGoalMutation.isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              Adicionar Meta
            </Button>
          </div>
        </LiquidGlassCard>

        {/* Save Changes */}
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setLocation('/dashboard')}
            className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 px-8 py-3"
            data-testid="button-save-goals"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
