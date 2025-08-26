import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { mockUserData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2" data-testid="link-dashboard-home">
                <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                  <Plus className="text-white text-sm" />
                </div>
                <span className="text-2xl font-bold text-dark-blue">
                  DISSERT<span className="text-bright-blue">AI</span>
                </span>
              </Link>
              <h1 className="text-xl font-semibold text-dark-blue" data-testid="text-dashboard-title">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-soft-gray hover:text-bright-blue" data-testid="button-notifications">
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
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column (30%) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Welcome Card */}
            <LiquidGlassCard data-testid="card-welcome">
              <h3 className="text-xl font-semibold text-dark-blue mb-2">Olá, {name.split(' ')[0]}!</h3>
              <p className="text-soft-gray mb-4">Bem-vindo de volta. Continue sua jornada rumo à nota 1000!</p>
              <div className="text-sm text-bright-blue" data-testid="text-next-exam">
                <Calendar className="inline mr-2" size={16} />
                Próxima prova: {nextExam}
              </div>
            </LiquidGlassCard>

            {/* Progress Card */}
            <LiquidGlassCard data-testid="card-progress">
              <h4 className="font-semibold text-dark-blue mb-4">Progresso Geral</h4>
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
                      stroke="var(--bright-blue)"
                      strokeWidth="8"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (progressPercentage / 100) * 314}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-soft-gray">Meta: {targetScore}</span>
                  <span className="text-bright-blue" data-testid="text-progress-percentage">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </LiquidGlassCard>
          </div>

          {/* Center Column (45%) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Activity Stats */}
            <LiquidGlassCard data-testid="card-activity-stats">
              <h4 className="font-semibold text-dark-blue mb-6">Estatísticas de Atividade</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-bright-blue" data-testid="text-essays-count">
                    {essaysCount}
                  </div>
                  <div className="text-xs text-soft-gray">Redações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-bright-blue" data-testid="text-study-hours">
                    {studyHours}h
                  </div>
                  <div className="text-xs text-soft-gray">Estudo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-bright-blue" data-testid="text-streak">
                    {streak}
                  </div>
                  <div className="text-xs text-soft-gray">Dias Seguidos</div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Evolution Chart */}
            <LiquidGlassCard data-testid="card-evolution-chart">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-dark-blue">Evolução das Notas</h4>
                <Select defaultValue="30-days" data-testid="select-chart-period">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7-days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30-days">Últimos 30 dias</SelectItem>
                    <SelectItem value="6-months">Últimos 6 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg" data-testid="chart-evolution">
                <div className="text-center text-soft-gray">
                  <TrendingUp className="mx-auto mb-2" size={32} />
                  <div>Gráfico de Evolução</div>
                  <div className="text-sm">Implementar com Chart.js</div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Suggested Actions */}
            <LiquidGlassCard data-testid="card-suggested-actions">
              <h4 className="font-semibold text-dark-blue mb-4">Próximas Ações Sugeridas</h4>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-bright-blue/10 rounded-lg">
                  <Lightbulb className="text-bright-blue mr-3" size={20} />
                  <div>
                    <div className="font-medium text-dark-blue">Pratique argumentação</div>
                    <div className="text-sm text-soft-gray">Use o Arquiteto de Argumentos</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-100 rounded-lg">
                  <Book className="text-green-600 mr-3" size={20} />
                  <div>
                    <div className="font-medium text-dark-blue">Amplie seu repertório</div>
                    <div className="text-sm text-soft-gray">Explore novos temas</div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Right Column (25%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Newsletter */}
            <LiquidGlassCard data-testid="card-newsletter">
              <h4 className="font-semibold text-dark-blue mb-4">Newsletter da Semana</h4>
              <div className="text-sm">
                <div className="font-medium text-dark-blue mb-2">Tecnologia e Sociedade</div>
                <p className="text-soft-gray mb-4">Explore como a inteligência artificial está transformando...</p>
                <button className="text-bright-blue hover:underline text-sm" data-testid="button-read-newsletter">
                  Ler Completa
                </button>
              </div>
            </LiquidGlassCard>

            {/* Quick Access */}
            <LiquidGlassCard data-testid="card-quick-access">
              <h4 className="font-semibold text-dark-blue mb-4">Acesso Rápido</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="p-3 h-auto flex flex-col items-center border-bright-blue/20 hover:bg-bright-blue/10"
                  data-testid="button-quick-arguments"
                >
                  <MessageCircle className="text-bright-blue mb-1" size={20} />
                  <div className="text-xs text-dark-blue">Argumentos</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-3 h-auto flex flex-col items-center border-bright-blue/20 hover:bg-bright-blue/10"
                  data-testid="button-quick-repertoire"
                >
                  <Search className="text-bright-blue mb-1" size={20} />
                  <div className="text-xs text-dark-blue">Repertório</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-3 h-auto flex flex-col items-center border-bright-blue/20 hover:bg-bright-blue/10"
                  data-testid="button-quick-simulator"
                >
                  <GraduationCap className="text-bright-blue mb-1" size={20} />
                  <div className="text-xs text-dark-blue">Simulador</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-3 h-auto flex flex-col items-center border-bright-blue/20 hover:bg-bright-blue/10"
                  data-testid="button-quick-style"
                >
                  <Sliders className="text-bright-blue mb-1" size={20} />
                  <div className="text-xs text-dark-blue">Estilo</div>
                </Button>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
