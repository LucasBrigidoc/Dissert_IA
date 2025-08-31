import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { mockUserData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
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
                <Bell size={20} />
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
              onClick={() => setLocation('/settings')}
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 text-bright-blue hover:bg-bright-blue/10"
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
              onClick={() => setLocation('/settings')}
              data-testid="button-customize-goals"
            >
              <Settings size={16} className="mr-2" />
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
                  <h4 className="text-sm font-semibold text-dark-blue">Pontos a Melhorar (ENEM)</h4>
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
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={16} />
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
              <div className="flex justify-between text-sm">
                <span className="text-soft-gray">Meta: {targetScore}</span>
                <span className="text-bright-blue font-semibold" data-testid="text-progress-percentage">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-gray-200">
                <div className="h-full bg-gradient-to-r from-bright-blue to-dark-blue rounded-full transition-all duration-500" style={{width: `${progressPercentage}%`}} />
              </Progress>
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
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 rounded-lg border border-bright-blue/20" data-testid="chart-evolution">
              <div className="text-center text-soft-gray">
                <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div className="text-lg font-semibold text-bright-blue mb-2">Gráfico de Evolução</div>
                <div className="text-sm text-dark-blue">Em breve: análise detalhada do seu progresso</div>
              </div>
            </div>
          </LiquidGlassCard>
        </div>


        

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
                data-testid="button-customize-schedule"
              >
                Personalizar
              </Button>
            </div>
          </div>
          <div className="grid lg:grid-cols-7 gap-4">
            {/* Dias da Semana */}
            {[
              { day: 'SEG', activities: ['Repertório', 'Argumentação'], hours: '2h' },
              { day: 'TER', activities: ['Redação Completa'], hours: '3h' },
              { day: 'QUA', activities: ['Revisão', 'Newsletter'], hours: '1.5h' },
              { day: 'QUI', activities: ['Simulado'], hours: '2.5h' },
              { day: 'SEX', activities: ['Estilo', 'Correções'], hours: '2h' },
              { day: 'SAB', activities: ['Redação Completa'], hours: '3h' },
              { day: 'DOM', activities: ['Descanso'], hours: '-' }
            ].map((schedule, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                schedule.day === 'DOM' 
                  ? 'bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20' 
                  : 'bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 border-bright-blue/20'
              }`}>
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-dark-blue mb-1">{schedule.day}</div>
                  <div className={`text-xs font-medium ${
                    schedule.day === 'DOM' ? 'text-soft-gray' : 'text-bright-blue'
                  }`}>
                    {schedule.hours}
                  </div>
                </div>
                <div className="space-y-2">
                  {schedule.activities.map((activity, i) => (
                    <div key={i} className={`text-xs px-2 py-1 rounded text-center ${
                      schedule.day === 'DOM' 
                        ? 'bg-soft-gray/20 text-soft-gray' 
                        : 'bg-white/50 text-dark-blue'
                    }`}>
                      {activity}
                    </div>
                  ))}
                </div>
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
            <h4 className="font-semibold text-dark-blue text-lg">Acesso rapido das principais Funcionalidades</h4>
            <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
              <Plus className="text-white" size={16} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => handleQuickAccess('argumentos')}
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center border-bright-blue/30 hover:bg-gradient-to-br hover:from-bright-blue/10 hover:to-dark-blue/10 hover:border-bright-blue/50 transition-all duration-200 group"
              data-testid="button-feature-arguments"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div className="text-sm text-dark-blue font-medium">Arquiteto de Argumentos</div>
              <div className="text-xs text-soft-gray mt-1 text-center">Construa argumentos sólidos</div>
            </Button>
            
            <Button 
              onClick={() => handleQuickAccess('repertorio')}
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center border-dark-blue/30 hover:bg-gradient-to-br hover:from-dark-blue/10 hover:to-soft-gray/10 hover:border-dark-blue/50 transition-all duration-200 group"
              data-testid="button-feature-repertoire"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Search className="text-white" size={20} />
              </div>
              <div className="text-sm text-dark-blue font-medium">Explorador de Repertório</div>
              <div className="text-xs text-soft-gray mt-1 text-center">Amplie seus conhecimentos</div>
            </Button>
            
            <Button 
              onClick={() => handleQuickAccess('simulador')}
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center border-bright-blue/30 hover:bg-gradient-to-br hover:from-bright-blue/10 hover:to-dark-blue/10 hover:border-bright-blue/50 transition-all duration-200 group"
              data-testid="button-feature-simulator"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white" size={20} />
              </div>
              <div className="text-sm text-dark-blue font-medium">Simulador de Provas</div>
              <div className="text-xs text-soft-gray mt-1 text-center">Pratique redações</div>
            </Button>
            
            <Button 
              onClick={() => handleQuickAccess('estilo')}
              variant="outline" 
              className="p-6 h-auto flex flex-col items-center border-soft-gray/30 hover:bg-gradient-to-br hover:from-soft-gray/10 hover:to-bright-blue/10 hover:border-soft-gray/50 transition-all duration-200 group"
              data-testid="button-feature-style"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sliders className="text-white" size={20} />
              </div>
              <div className="text-sm text-dark-blue font-medium">Criador de Estilo</div>
              <div className="text-xs text-soft-gray mt-1 text-center">Personalize sua escrita</div>
            </Button>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
