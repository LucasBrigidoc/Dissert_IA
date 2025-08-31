import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { ArrowLeft, Target, Plus, Trash2, Edit3 } from "lucide-react";

export default function Goals() {
  const [, setLocation] = useLocation();
  
  const [goals, setGoals] = useState([
    { id: 1, title: "Fazer 2 redações", current: 1, target: 2, description: "Praticar redações completas" },
    { id: 2, title: "Estudar 10h", current: 8.9, target: 10, description: "Tempo total de estudos semanais" }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    description: ""
  });

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target) {
      setGoals([...goals, {
        id: Date.now(),
        title: newGoal.title,
        current: 0,
        target: parseFloat(newGoal.target),
        description: newGoal.description
      }]);
      setNewGoal({ title: "", target: "", description: "" });
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleUpdateGoal = (id: number, field: string, value: any) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
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
              <ArrowLeft size={20} className="mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Edit3 className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-dark-blue">Personalizar Metas</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Current Goals */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-blue">Suas Metas Atuais</h2>
            <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
              <Target className="text-white" size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <div className="flex items-center justify-between mb-3">
                  <Input
                    value={goal.title}
                    onChange={(e) => handleUpdateGoal(goal.id, 'title', e.target.value)}
                    className="font-medium text-dark-blue bg-transparent border-none p-0 focus:ring-0"
                    data-testid={`input-goal-title-${goal.id}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-500 hover:bg-red-50"
                    data-testid={`button-delete-goal-${goal.id}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label className="text-xs text-soft-gray">Meta</Label>
                    <Input
                      type="number"
                      value={goal.target}
                      onChange={(e) => handleUpdateGoal(goal.id, 'target', parseFloat(e.target.value))}
                      className="mt-1"
                      data-testid={`input-goal-target-${goal.id}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-soft-gray">Progresso Atual</Label>
                    <Input
                      type="number"
                      value={goal.current}
                      onChange={(e) => handleUpdateGoal(goal.id, 'current', parseFloat(e.target.value))}
                      className="mt-1"
                      data-testid={`input-goal-current-${goal.id}`}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-soft-gray">Descrição</Label>
                  <Textarea
                    value={goal.description}
                    onChange={(e) => handleUpdateGoal(goal.id, 'description', e.target.value)}
                    className="mt-1 h-20 resize-none"
                    placeholder="Descreva sua meta..."
                    data-testid={`textarea-goal-description-${goal.id}`}
                  />
                </div>
                
                <div className="mt-3 p-2 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 rounded border border-bright-blue/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-soft-gray">Progresso:</span>
                    <span className="text-bright-blue font-semibold">
                      {goal.current}/{goal.target} ({Math.round((goal.current / goal.target) * 100)}%)
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-bright-blue to-dark-blue rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            >
              <Plus size={16} className="mr-2" />
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
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}