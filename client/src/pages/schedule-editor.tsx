import { useState } from "react";
import { useLocation } from "wouter";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, Clock, Calendar } from "lucide-react";

interface Activity {
  name: string;
  duration: string;
}

interface ScheduleDay {
  day: string;
  dayName: string;
  activities: Activity[];
  totalHours: string;
}

export default function ScheduleEditor() {
  const [, setLocation] = useLocation();

  const [schedule, setSchedule] = useState<ScheduleDay[]>([
    { 
      day: 'SEG', 
      dayName: 'Segunda-feira',
      activities: [
        { name: 'Repertório', duration: '1h' },
        { name: 'Argumentação', duration: '1h' }
      ], 
      totalHours: '2h' 
    },
    { 
      day: 'TER', 
      dayName: 'Terça-feira',
      activities: [
        { name: 'Redação Completa', duration: '3h' }
      ], 
      totalHours: '3h' 
    },
    { 
      day: 'QUA', 
      dayName: 'Quarta-feira',
      activities: [
        { name: 'Revisão', duration: '1h' },
        { name: 'Newsletter', duration: '0.5h' }
      ], 
      totalHours: '1.5h' 
    },
    { 
      day: 'QUI', 
      dayName: 'Quinta-feira',
      activities: [
        { name: 'Simulado', duration: '2.5h' }
      ], 
      totalHours: '2.5h' 
    },
    { 
      day: 'SEX', 
      dayName: 'Sexta-feira',
      activities: [
        { name: 'Estilo', duration: '1h' },
        { name: 'Correções', duration: '1h' }
      ], 
      totalHours: '2h' 
    },
    { 
      day: 'SAB', 
      dayName: 'Sábado',
      activities: [
        { name: 'Redação Completa', duration: '3h' }
      ], 
      totalHours: '3h' 
    },
    { 
      day: 'DOM', 
      dayName: 'Domingo',
      activities: [
        { name: 'Descanso', duration: '-' }
      ], 
      totalHours: '-' 
    }
  ]);

  const [weeklyGoal, setWeeklyGoal] = useState('14');

  const activityOptions = [
    'Repertório',
    'Argumentação',
    'Redação Completa',
    'Revisão',
    'Newsletter',
    'Simulado',
    'Estilo',
    'Correções',
    'Descanso'
  ];

  const updateActivity = (dayIndex: number, activityIndex: number, field: 'name' | 'duration', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].activities[activityIndex][field] = value;
    
    // Recalculate total hours for the day
    if (field === 'duration') {
      const totalHours = newSchedule[dayIndex].activities
        .filter(activity => activity.duration !== '-')
        .reduce((total, activity) => {
          const hours = parseFloat(activity.duration.replace('h', '')) || 0;
          return total + hours;
        }, 0);
      
      newSchedule[dayIndex].totalHours = totalHours > 0 ? `${totalHours}h` : '-';
    }
    
    setSchedule(newSchedule);
  };

  const addActivity = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].activities.push({ name: 'Nova Atividade', duration: '1h' });
    setSchedule(newSchedule);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].activities.splice(activityIndex, 1);
    
    // Recalculate total hours
    const totalHours = newSchedule[dayIndex].activities
      .filter(activity => activity.duration !== '-')
      .reduce((total, activity) => {
        const hours = parseFloat(activity.duration.replace('h', '')) || 0;
        return total + hours;
      }, 0);
    
    newSchedule[dayIndex].totalHours = totalHours > 0 ? `${totalHours}h` : '-';
    setSchedule(newSchedule);
  };

  const handleSave = () => {
    // Here you would typically save to backend/localStorage
    console.log('Salvando cronograma:', schedule, 'Meta semanal:', weeklyGoal);
    // Navigate back to dashboard
    setLocation('/dashboard');
  };

  const handleBack = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-bright-blue/5 to-dark-blue/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
            >
              <ArrowLeft className="mr-2" size={16} />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-dark-blue">Editar Cronograma de Estudos</h1>
              <p className="text-soft-gray">Personalize seu plano de estudos semanal</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
          >
            <Save className="mr-2" size={16} />
            Salvar Alterações
          </Button>
        </div>

        {/* Weekly Goal */}
        <LiquidGlassCard className="mb-6 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="text-bright-blue mr-3" size={20} />
              <div>
                <Label className="text-sm font-medium text-dark-blue">Meta Semanal de Estudos</Label>
                <p className="text-xs text-soft-gray">Defina quantas horas quer estudar por semana</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
                className="w-20 text-center"
                min="1"
                max="50"
              />
              <span className="text-sm text-soft-gray">horas</span>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Schedule Editor */}
        <div className="grid gap-4">
          {schedule.map((day, dayIndex) => (
            <LiquidGlassCard 
              key={day.day} 
              className={`bg-gradient-to-br ${
                day.day === 'DOM' 
                  ? 'from-soft-gray/5 to-bright-blue/5 border-soft-gray/20' 
                  : 'from-bright-blue/5 to-dark-blue/5 border-bright-blue/20'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    day.day === 'DOM' 
                      ? 'bg-gradient-to-br from-soft-gray to-bright-blue' 
                      : 'bg-gradient-to-br from-bright-blue to-dark-blue'
                  }`}>
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue">{day.dayName}</h3>
                    <p className="text-sm text-soft-gray">Total: {day.totalHours}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addActivity(dayIndex)}
                  className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-3">
                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-bright-blue/10">
                    <div className="flex-1">
                      <Label className="text-xs text-soft-gray mb-1 block">Atividade</Label>
                      <Select 
                        value={activity.name} 
                        onValueChange={(value) => updateActivity(dayIndex, activityIndex, 'name', value)}
                      >
                        <SelectTrigger className="border-bright-blue/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-soft-gray mb-1 block">Duração</Label>
                      <Input
                        value={activity.duration}
                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'duration', e.target.value)}
                        className="text-center border-bright-blue/20"
                        placeholder="1h"
                      />
                    </div>
                    {day.activities.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeActivity(dayIndex, activityIndex)}
                        className="border-red-200 text-red-500 hover:bg-red-50 mt-6"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Summary */}
        <LiquidGlassCard className="mt-6 bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 border-bright-blue/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="text-bright-blue mr-3" size={20} />
              <div>
                <h4 className="font-semibold text-dark-blue">Resumo do Cronograma</h4>
                <p className="text-sm text-soft-gray">
                  Total planejado: {
                    schedule
                      .filter(day => day.totalHours !== '-')
                      .reduce((total, day) => {
                        const hours = parseFloat(day.totalHours.replace('h', '')) || 0;
                        return total + hours;
                      }, 0)
                  }h por semana
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-bright-blue">Meta: {weeklyGoal}h</div>
              <div className="text-xs text-soft-gray">por semana</div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}