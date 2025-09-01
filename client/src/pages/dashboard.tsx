import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { mockUserData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, AlertTriangle, Edit3, X, Save, Grid3X3, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScoreData {
  id: number;
  date: string;
  totalScore: number;
  competence1?: number;
  competence2?: number;
  competence3?: number;
  competence4?: number;
  competence5?: number;
  source: 'platform' | 'external';
  examName?: string;
}

interface ScheduleDay {
  day: string;
  activities: string[];
  hours: number;
  minutes: number;
  completed: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [editingTarget, setEditingTarget] = useState(false);
  const [newTargetScore, setNewTargetScore] = useState(mockUserData.targetScore);
  const [showAddScore, setShowAddScore] = useState(false);
  const [showScheduleEdit, setShowScheduleEdit] = useState(false);
  const [showFeaturesConfig, setShowFeaturesConfig] = useState(false);
  
  // Available features
  const allFeatures = [
    { id: 'argumentos', name: 'Arquiteto de Argumentos', description: 'Construa argumentos sólidos', icon: MessageCircle, color: 'bright-blue' },
    { id: 'repertorio', name: 'Explorador de Repertório', description: 'Amplie seus conhecimentos', icon: Search, color: 'dark-blue' },
    { id: 'simulador', name: 'Simulador de Provas', description: 'Pratique redações', icon: GraduationCap, color: 'bright-blue' },
    { id: 'estilo', name: 'Criador de Estilo', description: 'Personalize sua escrita', icon: Sliders, color: 'soft-gray' },
    { id: 'goals', name: 'Metas e Objetivos', description: 'Defina seus objetivos', icon: Target, color: 'bright-blue' },
    { id: 'newsletter', name: 'Newsletter Semanal', description: 'Conteúdo atualizado', icon: Book, color: 'dark-blue' }
  ];
  
  // Visible features state
  const [visibleFeatures, setVisibleFeatures] = useState(['argumentos', 'repertorio', 'simulador', 'estilo']);
  
  // Schedule data state
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([
    { day: 'SEG', activities: ['Repertório', 'Argumentação'], hours: 2, minutes: 0, completed: false },
    { day: 'TER', activities: ['Redação Completa'], hours: 3, minutes: 0, completed: false },
    { day: 'QUA', activities: ['Revisão', 'Newsletter'], hours: 1, minutes: 30, completed: false },
    { day: 'QUI', activities: ['Simulado'], hours: 2, minutes: 30, completed: false },
    { day: 'SEX', activities: ['Estilo', 'Correções'], hours: 2, minutes: 0, completed: false },
    { day: 'SAB', activities: ['Redação Completa'], hours: 3, minutes: 0, completed: false },
    { day: 'DOM', activities: ['Descanso'], hours: 0, minutes: 0, completed: false }
  ]);
  
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDay[]>([]);
  
  const [scores, setScores] = useState<ScoreData[]>([
    { id: 1, date: '2024-01-10', totalScore: 720, competence1: 160, competence2: 140, competence3: 180, competence4: 120, competence5: 120, source: 'platform', examName: 'Simulado 1' },
    { id: 2, date: '2024-01-17', totalScore: 750, competence1: 170, competence2: 150, competence3: 160, competence4: 140, competence5: 130, source: 'platform', examName: 'Simulado 2' },
    { id: 3, date: '2024-01-24', totalScore: 785, competence1: 160, competence2: 140, competence3: 180, competence4: 120, competence5: 185, source: 'platform', examName: 'Simulado 3' }
  ]);
  
  const [newScore, setNewScore] = useState({
    date: '',
    totalScore: '',
    competence1: '',
    competence2: '',
    competence3: '',
    competence4: '',
    competence5: '',
    examName: ''
  });
  const { 
    name, 
    averageScore, 
    targetScore, 
    essaysCount, 
    studyHours, 
    streak, 
    progressPercentage, 
    nextExam 
  } = mockUserData;

  const handleAddScore = () => {
    if (newScore.date && newScore.totalScore) {
      const score: ScoreData = {
        id: Date.now(),
        date: newScore.date,
        totalScore: Number(newScore.totalScore),
        competence1: newScore.competence1 ? Number(newScore.competence1) : undefined,
        competence2: newScore.competence2 ? Number(newScore.competence2) : undefined,
        competence3: newScore.competence3 ? Number(newScore.competence3) : undefined,
        competence4: newScore.competence4 ? Number(newScore.competence4) : undefined,
        competence5: newScore.competence5 ? Number(newScore.competence5) : undefined,
        source: 'external',
        examName: newScore.examName || 'Nota Externa'
      };
      setScores([...scores, score]);
      setNewScore({
        date: '',
        totalScore: '',
        competence1: '',
        competence2: '',
        competence3: '',
        competence4: '',
        competence5: '',
        examName: ''
      });
      setShowAddScore(false);
    }
  };

  const chartData = scores.map(score => ({
    date: new Date(score.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    nota: score.totalScore,
    nome: score.examName
  })).sort((a, b) => new Date(scores.find(s => s.totalScore === a.nota)?.date || 0).getTime() - new Date(scores.find(s => s.totalScore === b.nota)?.date || 0).getTime());

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens/session
    // For demo purposes, just redirect to landing page
    setLocation("/");
  };

  const handleQuickAccess = (tool: string) => {
    console.log(`Acessando ferramenta: ${tool}`);
    // Navigate to the specific tool page
    switch(tool) {
      case 'argumentos':
        setLocation('/argumentos');
        break;
      case 'repertorio':
        setLocation('/repertorio');
        break;
      case 'simulador':
        setLocation('/simulador');
        break;
      case 'estilo':
        setLocation('/estilo');
        break;
    }
  };

  const handleReadNewsletter = () => {
    setLocation("/newsletter");
  };

  const handleSuggestedAction = (action: string) => {
    console.log(`Executando ação: ${action}`);
    // Navigate to the specific action
    switch(action) {
      case 'argumentacao':
        setLocation('/argumentos');
        break;
      case 'repertorio':
        setLocation('/repertorio');
        break;
    }
  };

  const handleScheduleEdit = () => {
    setEditingSchedule([...scheduleData]);
    setShowScheduleEdit(true);
  };

  const handleSaveSchedule = () => {
    setScheduleData([...editingSchedule]);
    setShowScheduleEdit(false);
  };

  const handleCancelScheduleEdit = () => {
    setEditingSchedule([]);
    setShowScheduleEdit(false);
  };

  const updateScheduleDay = (index: number, field: 'activities' | 'hours' | 'minutes', value: string | string[] | number) => {
    const updated = [...editingSchedule];
    if (field === 'activities' && typeof value === 'string') {
      // Parse activities from textarea (one per line)
      updated[index].activities = value.split('\n').filter(activity => activity.trim() !== '');
    } else if (field === 'hours' && typeof value === 'string') {
      updated[index].hours = parseInt(value) || 0;
    } else if (field === 'minutes' && typeof value === 'string') {
      updated[index].minutes = parseInt(value) || 0;
    }
    setEditingSchedule(updated);
  };

  const toggleScheduleCompletion = (index: number) => {
    const updated = [...scheduleData];
    updated[index].completed = !updated[index].completed;
    setScheduleData(updated);
  };

  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '-';
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const handleFeaturesConfig = () => {
    setShowFeaturesConfig(true);
  };

  const handleSaveFeaturesConfig = () => {
    setShowFeaturesConfig(false);
  };

  const toggleFeatureVisibility = (featureId: string) => {
    setVisibleFeatures(prev => {
      if (prev.includes(featureId)) {
        // Can't remove if already at minimum (2)
        if (prev.length <= 2) return prev;
        return prev.filter(id => id !== featureId);
      } else {
        // Can't add if already at maximum (4)
        if (prev.length >= 4) return prev;
        return [...prev, featureId];
      }
    });
  };

  const getVisibleFeaturesData = () => {
    return allFeatures.filter(feature => visibleFeatures.includes(feature.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2" data-testid="link-dashboard-logo">
                <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                  <Plus className="text-white text-sm" />
                </div>
                <span className="text-2xl font-bold text-dark-blue">
                  DISSERT<span className="text-bright-blue">AI</span>
                </span>
              </Link>
              
              {/* Navigation Menu */}
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-home">
                  <Home size={18} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                  <Plus size={18} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-newsletter">
                  <Book size={18} />
                  <span className="font-medium">Newsletter</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-settings">
                  <Settings size={18} />
                  <span className="font-medium">Configurações</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-soft-gray hover:text-bright-blue transition-colors" data-testid="button-notifications">
                
              </button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                data-testid="button-logout"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* First Row: All Exams + Activity Stats + Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* Welcome + Quick Exam Info Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-welcome-exams">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-dark-blue">Olá, {name.split(' ')[0]}! 👋</h3>
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Calendar className="text-white" size={16} />
              </div>
            </div>
            <p className="text-sm text-soft-gray mb-4">Continue sua jornada rumo à nota 1000!</p>
            
            {/* Próximas Provas Resumo */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-dark-blue mb-2">Próximas Provas:</div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 rounded border border-soft-gray/20">
                <span className="text-xs text-dark-blue font-medium">Simulado</span>
                <span className="text-xs text-soft-gray">28/out</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded border border-bright-blue/20">
                <span className="text-xs text-dark-blue font-medium">ENEM 1º</span>
                <span className="text-xs text-bright-blue">3/nov</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 rounded border border-dark-blue/20">
                <span className="text-xs text-dark-blue font-medium">ENEM 2º</span>
                <span className="text-xs text-dark-blue">10/nov</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setLocation('/exams')}
              variant="outline" 
              size="sm" 
              className="w-full mt-4 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
              data-testid="button-view-all-exams"
            >
              Ver Todas as Provas
            </Button>
          </LiquidGlassCard>

          {/* Goals Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 h-full" data-testid="card-goals">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="font-semibold text-dark-blue">Metas da Semana</h4>
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Target className="text-white" size={16} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <CheckCircle2 className="text-bright-blue mr-3" size={18} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-dark-blue">Fazer 2 redações</div>
                  <div className="text-xs text-soft-gray">1/2 concluídas</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 rounded-lg border border-soft-gray/20">
                <Target className="text-soft-gray mr-3" size={18} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-dark-blue">Estudar 10h</div>
                  <div className="text-xs text-soft-gray">8.9/10h concluídas</div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
              onClick={() => setLocation('/goals')}
              data-testid="button-customize-goals"
            >
              <Edit3 size={16} className="mr-2" />
              Personalizar
            </Button>
          </LiquidGlassCard>

          {/* Improvement Points - Taking 2 columns */}
          <div className="lg:col-span-2">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-soft-gray/5 border-bright-blue/20" data-testid="card-improvement-points">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <Target className="text-white" size={12} />
                  </div>
                  <h4 className="text-sm font-semibold text-dark-blue">Pontos a Melhorar</h4>
                </div>
              </div>
              
              {/* Competências em linhas horizontais */}
              <div className="space-y-1">
                {/* Competência 1 */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-xs font-medium text-dark-blue">Norma Culta</span>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">160/200</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-soft-gray">Concordância e regência</span>
                    <AlertTriangle className="text-red-500" size={12} />
                  </div>
                </div>

                {/* Competência 2 */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <span className="text-xs font-medium text-dark-blue">Compreensão</span>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">140/200</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-soft-gray">Interpretação textual</span>
                    <AlertTriangle className="text-yellow-500" size={12} />
                  </div>
                </div>

                {/* Competência 3 */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-xs font-medium text-dark-blue">Argumentação</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">180/200</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-soft-gray">Diversificar argumentos</span>
                    <CheckCircle2 className="text-blue-500" size={12} />
                  </div>
                </div>

                {/* Competência 4 */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <span className="text-xs font-medium text-dark-blue">Coesão</span>
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">120/200</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-soft-gray">Conectivos e coesão</span>
                    <AlertTriangle className="text-orange-500" size={12} />
                  </div>
                </div>

                {/* Competência 5 */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                    <span className="text-xs font-medium text-dark-blue">Proposta</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">170/200</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-soft-gray">Detalhar agentes</span>
                    <CheckCircle2 className="text-green-500" size={12} />
                  </div>
                </div>
              </div>
              
              {/* Summary em linha */}
              <div className="mt-2 flex items-center justify-between p-2 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded border border-bright-blue/20">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="text-bright-blue" size={12} />
                  <span className="text-xs font-medium text-dark-blue">Foco: Coesão (Comp. 4)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-soft-gray">Média:</span>
                  <span className="text-sm font-bold text-bright-blue">154</span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Second Row: Progress + Evolution Chart + Simulator Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Progress Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/10 border-bright-blue/20" data-testid="card-progress">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-dark-blue">Progresso Geral</h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTarget(true)}
                  className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 p-1 h-8"
                  data-testid="button-edit-target"
                >
                  <Edit3 size={12} />
                </Button>
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={16} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (progressPercentage / 100) * 314}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5087ff" />
                      <stop offset="100%" stopColor="#09072e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-dark-blue" data-testid="text-average-score">
                      {averageScore}
                    </div>
                    <div className="text-xs text-soft-gray">Nota Média</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {editingTarget ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-soft-gray">Nova meta:</span>
                    <input
                      type="number"
                      value={newTargetScore}
                      onChange={(e) => setNewTargetScore(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border border-bright-blue/30 rounded focus:outline-none focus:border-bright-blue"
                      data-testid="input-target-score"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        mockUserData.targetScore = newTargetScore;
                        setEditingTarget(false);
                      }}
                      className="text-xs bg-bright-blue text-white hover:bg-bright-blue/90"
                      data-testid="button-save-target"
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewTargetScore(targetScore);
                        setEditingTarget(false);
                      }}
                      className="text-xs"
                      data-testid="button-cancel-target"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-soft-gray">Meta: {targetScore}</span>
                  <span className="text-bright-blue font-semibold" data-testid="text-points-to-goal">
                    {targetScore > averageScore ? `${targetScore - averageScore} pontos para a meta` : 'Meta atingida! 🎉'}
                  </span>
                </div>
              )}
              <Progress value={progressPercentage} className="h-3 bg-gray-200">
                <div className="h-full bg-gradient-to-r from-bright-blue to-dark-blue rounded-full transition-all duration-500" style={{width: `${progressPercentage}%`}} />
              </Progress>
            </div>
          </LiquidGlassCard>

          {/* Evolution Chart */}
          <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-bright-blue/5 border-dark-blue/20" data-testid="card-evolution-chart">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-bright-blue rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Evolução das Notas</h4>
              </div>
              <Select defaultValue="30-days" data-testid="select-chart-period">
                <SelectTrigger className="w-32 border-bright-blue/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30-days">Últimos 30 dias</SelectItem>
                  <SelectItem value="6-months">Últimos 6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-48 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 rounded-lg border border-bright-blue/20 p-4" data-testid="chart-evolution">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5087ff20" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#09072e"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#09072e"
                    fontSize={12}
                    domain={[400, 1000]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #5087ff30',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} pontos`, 
                      props.payload.nome
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nota" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#5087ff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#09072e', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5087ff" />
                      <stop offset="100%" stopColor="#09072e" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Add Score Button */}
            <div className="mt-4 flex justify-center">
              <Dialog open={showAddScore} onOpenChange={setShowAddScore}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                    data-testid="button-add-score"
                  >
                    <Plus size={14} className="mr-1" />
                    Adicionar Nota
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </LiquidGlassCard>

          {/* Simulator Time Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20" data-testid="card-simulator-time">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-dark-blue">Tempo Médio no Simulador</h4>
              <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                <Clock className="text-white" size={16} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <div className="text-2xl font-bold text-bright-blue mb-1" data-testid="text-total-time">
                  2h 15min
                </div>
                <div className="text-xs text-soft-gray font-medium">Tempo Total</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 rounded border border-bright-blue/10">
                  <div className="flex items-center">
                    <Lightbulb className="text-bright-blue mr-2" size={14} />
                    <span className="text-sm text-dark-blue">Brainstorm</span>
                  </div>
                  <span className="text-sm font-medium text-bright-blue" data-testid="text-brainstorm-time">25min</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-dark-blue/5 to-soft-gray/5 rounded border border-dark-blue/10">
                  <div className="flex items-center">
                    <MessageCircle className="text-dark-blue mr-2" size={14} />
                    <span className="text-sm text-dark-blue">Rascunho</span>
                  </div>
                  <span className="text-sm font-medium text-dark-blue" data-testid="text-draft-time">1h 20min</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-soft-gray/5 to-bright-blue/5 rounded border border-soft-gray/10">
                  <div className="flex items-center">
                    <CheckCircle2 className="text-soft-gray mr-2" size={14} />
                    <span className="text-sm text-dark-blue">A limpo</span>
                  </div>
                  <span className="text-sm font-medium text-soft-gray" data-testid="text-final-time">30min</span>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Add Score Dialog */}
        <Dialog open={showAddScore} onOpenChange={setShowAddScore}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-dark-blue flex items-center">
                <Plus className="mr-2" size={20} />
                Adicionar Nova Nota
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-dark-blue">Nome da Prova/Simulado</Label>
                  <Input
                    value={newScore.examName}
                    onChange={(e) => setNewScore({...newScore, examName: e.target.value})}
                    placeholder="Ex: Simulado ENEM"
                    className="mt-1"
                    data-testid="input-exam-name"
                  />
                </div>
                
                <div>
                  <Label className="text-sm text-dark-blue">Data</Label>
                  <Input
                    type="date"
                    value={newScore.date}
                    onChange={(e) => setNewScore({...newScore, date: e.target.value})}
                    className="mt-1"
                    data-testid="input-score-date"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue font-medium">Nota Total (obrigatório)</Label>
                <Input
                  type="number"
                  value={newScore.totalScore}
                  onChange={(e) => setNewScore({...newScore, totalScore: e.target.value})}
                  placeholder="Ex: 850"
                  className="mt-1"
                  max="1000"
                  min="0"
                  data-testid="input-total-score"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue font-medium mb-3 block">Pontuação por Competência (opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { key: 'competence1', label: 'Comp. 1', desc: 'Norma Culta' },
                    { key: 'competence2', label: 'Comp. 2', desc: 'Compreensão' },
                    { key: 'competence3', label: 'Comp. 3', desc: 'Argumentação' },
                    { key: 'competence4', label: 'Comp. 4', desc: 'Coesão' },
                    { key: 'competence5', label: 'Comp. 5', desc: 'Proposta' }
                  ].map((comp) => (
                    <div key={comp.key}>
                      <Label className="text-xs text-soft-gray">{comp.label}</Label>
                      <Input
                        type="number"
                        value={newScore[comp.key as keyof typeof newScore]}
                        onChange={(e) => setNewScore({...newScore, [comp.key]: e.target.value})}
                        placeholder="0-200"
                        className="mt-1 text-sm"
                        max="200"
                        min="0"
                        data-testid={`input-${comp.key}`}
                      />
                      <div className="text-xs text-soft-gray mt-1">{comp.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddScore}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 flex-1"
                  data-testid="button-save-score"
                >
                  Salvar Nota
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddScore(false)}
                  data-testid="button-cancel-score"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        

        {/* Fourth Row: Cronograma de Estudos - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-study-schedule">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-dark-blue text-lg">Cronograma de Estudos Personalizado</h4>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Timer className="text-white" size={16} />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
                onClick={handleScheduleEdit}
                data-testid="button-customize-schedule"
              >
                Personalizar
              </Button>
            </div>
          </div>
          <div className="grid lg:grid-cols-7 gap-4">
            {/* Dias da Semana */}
            {scheduleData.map((schedule, index) => (
              <div key={index} className="flex flex-col">
                <div className={`p-4 rounded-lg border h-full ${
                  schedule.completed
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                    : schedule.day === 'DOM' 
                      ? 'bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20' 
                      : 'bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 border-bright-blue/20'
                }`}>
                  <div className="text-center mb-3">
                    <div className="text-sm font-bold text-dark-blue mb-1">{schedule.day}</div>
                    <div className={`text-xs font-medium ${
                      schedule.completed 
                        ? 'text-green-600'
                        : schedule.day === 'DOM' ? 'text-soft-gray' : 'text-bright-blue'
                    }`}>
                      {formatTime(schedule.hours, schedule.minutes)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {schedule.activities.map((activity, i) => (
                      <div key={i} className={`text-xs px-2 py-1 rounded text-center ${
                        schedule.completed
                          ? 'bg-green-100 text-green-700 line-through'
                          : schedule.day === 'DOM' 
                            ? 'bg-soft-gray/20 text-soft-gray' 
                            : 'bg-white/50 text-dark-blue'
                      }`}>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
                {schedule.day !== 'DOM' && (
                  <div className="flex items-center justify-center mt-3">
                    <button
                      onClick={() => toggleScheduleCompletion(index)}
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        schedule.completed
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-white/70 text-dark-blue hover:bg-bright-blue/10 border border-bright-blue/30'
                      }`}
                      data-testid={`button-complete-${schedule.day.toLowerCase()}`}
                    >
                      <CheckCircle2 size={12} />
                      <span>{schedule.completed ? 'Concluído' : 'Marcar'}</span>
                    </button>
                  </div>
                )}
                {schedule.day === 'DOM' && (
                  <div className="mt-3 h-8"></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="text-bright-blue mr-3" size={18} />
                <div>
                  <div className="text-sm font-medium text-dark-blue">Meta Semanal de Estudos</div>
                  <div className="text-xs text-soft-gray">Baseado na sua próxima prova</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-bright-blue">14h</div>
                <div className="text-xs text-soft-gray">por semana</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Schedule Edit Modal */}
        <Dialog open={showScheduleEdit} onOpenChange={setShowScheduleEdit}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-schedule-edit">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Timer className="mr-3 text-bright-blue" size={24} />
                Editar Cronograma de Estudos
              </DialogTitle>
              <div className="text-sm text-soft-gray">Cronograma semanal de estudos</div>
            </DialogHeader>
            
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editingSchedule.map((day, index) => (
                  <div key={day.day} className={`p-4 rounded-lg border-2 ${
                    day.day === 'DOM' 
                      ? 'bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/30' 
                      : 'bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/30'
                  }`} data-testid={`schedule-edit-${day.day.toLowerCase()}`}>
                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-dark-blue mb-2">{day.day}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-dark-blue">Tempo de Estudo</Label>
                        <div className="flex space-x-2 mt-1">
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={day.hours}
                              onChange={(e) => updateScheduleDay(index, 'hours', e.target.value)}
                              placeholder="0"
                              min="0"
                              max="12"
                              className="text-center"
                              data-testid={`input-hours-${day.day.toLowerCase()}`}
                            />
                            <div className="text-xs text-center text-soft-gray mt-1">Horas</div>
                          </div>
                          <div className="flex-1">
                            <Input
                              type="number"
                              value={day.minutes}
                              onChange={(e) => updateScheduleDay(index, 'minutes', e.target.value)}
                              placeholder="0"
                              min="0"
                              max="59"
                              step="15"
                              className="text-center"
                              data-testid={`input-minutes-${day.day.toLowerCase()}`}
                            />
                            <div className="text-xs text-center text-soft-gray mt-1">Minutos</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-dark-blue">Atividades</Label>
                        <Textarea
                          value={day.activities.join('\n')}
                          onChange={(e) => updateScheduleDay(index, 'activities', e.target.value)}
                          placeholder="Uma atividade por linha..."
                          className="mt-1 min-h-[100px]"
                          data-testid={`textarea-activities-${day.day.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleCancelScheduleEdit}
                  className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10"
                  data-testid="button-cancel-schedule"
                >
                  <X className="mr-2" size={16} />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveSchedule}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                  data-testid="button-save-schedule"
                >
                  <Save className="mr-2" size={16} />
                  Salvar Cronograma
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Features Configuration Modal */}
        <Dialog open={showFeaturesConfig} onOpenChange={setShowFeaturesConfig}>
          <DialogContent className="max-w-2xl" data-testid="dialog-features-config">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Settings className="mr-3 text-bright-blue" size={24} />
                Configurar Funcionalidades de Acesso Rápido
              </DialogTitle>
              <div className="text-sm text-soft-gray">Escolha quais funcionalidades aparecem no seu dashboard</div>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="text-sm font-medium text-dark-blue mb-2">
                Selecione as funcionalidades que deseja ver no acesso rápido:
              </div>
              
              <div className="grid gap-3">
                {allFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = visibleFeatures.includes(feature.id);
                  
                  return (
                    <div 
                      key={feature.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-bright-blue/10 border-bright-blue/30' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${
                        (!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() => {
                        if ((!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)) {
                          return;
                        }
                        toggleFeatureVisibility(feature.id);
                      }}
                      data-testid={`feature-toggle-${feature.id}`}
                    >
                      <Checkbox 
                        checked={isSelected}
                        disabled={(!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)}
                        onChange={() => {
                          if ((!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)) {
                            return;
                          }
                          toggleFeatureVisibility(feature.id);
                        }}
                        data-testid={`checkbox-${feature.id}`}
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? `bg-gradient-to-br from-${feature.color === 'bright-blue' ? 'bright-blue' : feature.color === 'dark-blue' ? 'dark-blue' : 'soft-gray'} to-${feature.color === 'bright-blue' ? 'dark-blue' : feature.color === 'dark-blue' ? 'soft-gray' : 'bright-blue'}`
                          : 'bg-gray-300'
                      }`}>
                        <IconComponent className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-dark-blue">{feature.name}</div>
                        <div className="text-xs text-soft-gray">{feature.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className={`text-xs mt-2 ${
                visibleFeatures.length < 2 || visibleFeatures.length > 4 
                  ? 'text-red-500' 
                  : 'text-soft-gray'
              }`}>
                {visibleFeatures.length < 2 
                  ? 'Selecione pelo menos 2 funcionalidades'
                  : visibleFeatures.length > 4
                    ? 'Máximo de 4 funcionalidades'
                    : `Funcionalidades selecionadas: ${visibleFeatures.length}/4`
                }
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowFeaturesConfig(false)}
                className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10"
                data-testid="button-cancel-features-config"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveFeaturesConfig}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                data-testid="button-save-features-config"
              >
                <Save className="mr-2" size={16} />
                Salvar Configuração
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fifth Row: Newsletter - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20" data-testid="card-newsletter">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-dark-blue">Newsletter da Semana</h4>
            <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
              <Book className="text-white" size={16} />
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="font-medium text-dark-blue mb-2 text-lg">Tecnologia e Sociedade 🤖</div>
              <p className="text-soft-gray leading-relaxed">Explore como a inteligência artificial está transformando o mundo moderno e descubra como incorporar esse tema em suas redações com repertório atualizado e exemplos práticos.</p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleReadNewsletter}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 px-8 py-3"
                data-testid="button-read-newsletter"
              >
                Ler Newsletter Completa
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Sixth Row: System Features - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-system-features">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-dark-blue text-lg">Acesso rápido das principais Funcionalidades</h4>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFeaturesConfig}
                className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
                data-testid="button-configure-features"
              >
                <Settings className="mr-2" size={14} />
                Configurar
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Plus className="text-white" size={16} />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className={`flex flex-wrap justify-center gap-4 ${
              visibleFeatures.length === 2 ? 'max-w-md mx-auto' :
              visibleFeatures.length === 3 ? 'max-w-2xl mx-auto' :
              'max-w-4xl mx-auto'
            }`}>
            {getVisibleFeaturesData().map((feature) => {
              const IconComponent = feature.icon;
              const borderColor = feature.color === 'bright-blue' ? 'border-bright-blue/30 hover:border-bright-blue/50'
                : feature.color === 'dark-blue' ? 'border-dark-blue/30 hover:border-dark-blue/50'
                : 'border-soft-gray/30 hover:border-soft-gray/50';
              
              const gradientFrom = feature.color === 'bright-blue' ? 'from-bright-blue'
                : feature.color === 'dark-blue' ? 'from-dark-blue'
                : 'from-soft-gray';
              
              const gradientTo = feature.color === 'bright-blue' ? 'to-dark-blue'
                : feature.color === 'dark-blue' ? 'to-soft-gray'
                : 'to-bright-blue';
              
              const hoverGradient = feature.color === 'bright-blue' ? 'hover:from-bright-blue/10 hover:to-dark-blue/10'
                : feature.color === 'dark-blue' ? 'hover:from-dark-blue/10 hover:to-soft-gray/10'
                : 'hover:from-soft-gray/10 hover:to-bright-blue/10';
              
              return (
                <Button 
                  key={feature.id}
                  onClick={() => handleQuickAccess(feature.id)}
                  variant="outline" 
                  className={`p-4 h-auto min-h-[120px] flex flex-col items-center justify-center ${borderColor} hover:bg-gradient-to-br ${hoverGradient} transition-all duration-200 group w-44 flex-shrink-0`}
                  data-testid={`button-feature-${feature.id}`}
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <IconComponent className="text-white" size={18} />
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm text-dark-blue font-medium leading-tight">{feature.name}</div>
                    <div className="text-xs text-soft-gray leading-relaxed">{feature.description}</div>
                  </div>
                </Button>
              );
            })}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={() => setLocation('/functionalities')}
              variant="outline" 
              className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10 px-6 py-2"
              data-testid="button-view-all-functionalities"
            >
              <Grid3X3 className="mr-2" size={16} />
              Ver Todas as Funcionalidades
            </Button>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
