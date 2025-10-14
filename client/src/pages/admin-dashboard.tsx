import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, BarChart3, Users, DollarSign, TrendingUp, AlertTriangle, RefreshCw, CreditCard, Target, Brain, Users as UsersIcon, Mail, BookOpen, Book, Tag, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BusinessOverview {
  totalUsers: number;
  activeUsers: number;
  totalOperations: number;
  totalCostBrl: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageCostPerUser: number;
  topOperations: Array<{ operation: string; count: number; cost: number }>;
  dailyTrends: Array<{ date: string; operations: number; cost: number; users: number }>;
  cacheEfficiency: number;
}

interface TopUser {
  userId?: string;
  ipAddress: string;
  totalCost: number;
  totalOperations: number;
  averageOperationCost: number;
  topOperation: string;
}

interface CurrentCosts {
  totalOperations: number;
  totalCost: number;
  cacheHitRate: number;
  topOperation: string;
  date: string;
  realTime: boolean;
}

// ===== FASE 1: RECEITA + IA COST TRACKING =====
interface RevenueOverview {
  mrr: number;
  arr: number;
  totalActiveSubscriptions: number;
  paidUsers: number;
  trialUsers: number;
  arpu: number;
  grossMarginPercent: number;
  mrrGrowthRate: number;
  churnRate: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  features: unknown;
  maxOperationsPerMonth: number | null;
  maxAICostPerMonth: number | null;
  isActive: boolean | null;
}

interface SubscriptionsSummary {
  totalActive: number;
  totalTrial: number;
  totalCancelled: number;
  subscriptionsByPlan: Record<string, number>;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: string;
}

// ===== FASE 2: FUNIL DE CONVERSÃO + UX COMPLETION RATES =====
interface ConversionStep {
  stepName: string;
  stepNumber: number;
  conversionRate: number;
  usersEntered: number;
  usersCompleted: number;
  averageTimeToComplete: number;
}

interface SessionMetrics {
  totalSessions: number;
  averageDuration: number;
  bounceRate: number;
  averagePageViews: number;
  topSources: Array<{ source: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
}

interface TaskCompletionRate {
  taskType: string;
  taskName: string;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  averageTimeToComplete: number;
  averageSatisfactionScore: number;
  averageNpsScore: number;
}

interface UserEventsAnalytics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByDay: Record<string, number>;
  recentEvents: any[];
}

// ===== FASE 3: ADVANCED COHORT ANALYSIS + PREDICTIVE METRICS =====
interface CohortAnalysis {
  cohortMonth: string;
  totalUsers: number;
  activeUsers: number;
  churnedUsers: number;
  retentionRate: number;
  currentMrr: number;
  averageLtv: number;
  averageLifetimeDays: number;
}

interface RevenueBySource {
  source: string;
  totalRevenue: number;
  totalUsers: number;
  averageRevenue: number;
  percentage: number;
}

interface HighRiskUser {
  userId: string;
  userName: string;
  userEmail: string;
  churnProbability: number;
  riskLevel: string;
  daysToChurn: number;
  riskFactors: string[];
  recommendedActions: string[];
}

interface PredictiveMetric {
  id: string;
  metricType: string;
  timeHorizon: string;
  predictedValue: number;
  confidenceScore: number | null;
  actualValue: number | null;
  metricDate: string;
}

const formatCurrency = (centavos: number) => {
  return `R$ ${(centavos / 100).toFixed(2)}`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
};

const operationNames: Record<string, string> = {
  structure_analysis: "Análise de Estrutura",
  essay_generation: "Geração de Redação", 
  essay_correction: "Correção de Redação",
  proposal_generation: "Geração de Proposta",
  proposal_search: "Busca de Proposta",
  future_exam_detection: "Detecção de Provas Futuras",
  repertoire_search: "Busca de Repertório",
  repertoire_generation: "Geração de Repertório",
  ai_chat: "Chat com IA",
  text_modification: "Modificação de Texto"
};

const COLORS = ['#5087ff', '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'];

function UsersTable() {
  const { toast } = useToast();
  const { data: usersData, isLoading } = useQuery<{
    users: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      userType: string;
      createdAt: Date;
      subscription: {
        planName: string;
        status: string;
        startDate: Date | null;
        isPro: boolean;
        price: string;
      };
      usage: {
        totalCost: number;
        totalTokens: number;
        operationCount: number;
      };
    }>;
    total: number;
  }>({
    queryKey: ['/api/admin/all-users'],
    refetchInterval: 30000,
  });

  const { data: subscriptionPlans } = useQuery<{data: SubscriptionPlan[]}>({
    queryKey: ['/api/admin/subscription-plans?activeOnly=true'],
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, planId }: { userId: string; planId: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ planId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-users'] });
      toast({
        title: "Sucesso",
        description: "Plano do usuário atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar plano do usuário",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!usersData?.users || usersData.users.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>;
  }

  const plans = subscriptionPlans?.data || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">Nome</th>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Telefone</th>
            <th className="text-left p-3 font-medium">Plano</th>
            <th className="text-left p-3 font-medium">Criado em</th>
            <th className="text-left p-3 font-medium">Pro desde</th>
            <th className="text-left p-3 font-medium">Tokens</th>
            <th className="text-left p-3 font-medium">Gasto (R$)</th>
          </tr>
        </thead>
        <tbody>
          {usersData.users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50" data-testid={`row-user-${user.id}`}>
              <td className="p-3" data-testid={`text-username-${user.id}`}>{user.name}</td>
              <td className="p-3 text-sm" data-testid={`text-email-${user.id}`}>{user.email}</td>
              <td className="p-3 text-sm">{user.phone}</td>
              <td className="p-3">
                <Select
                  value={plans.find(p => p.name === user.subscription.planName)?.id || 'free'}
                  onValueChange={(planId) => updatePlanMutation.mutate({ userId: user.id, planId })}
                  disabled={updatePlanMutation.isPending}
                  data-testid={`select-plan-${user.id}`}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} data-testid={`option-plan-${plan.id}`}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3 text-sm">{formatDate(user.createdAt)}</td>
              <td className="p-3 text-sm">
                {user.subscription.isPro ? formatDate(user.subscription.startDate) : '-'}
              </td>
              <td className="p-3 text-sm">{user.usage.totalTokens.toLocaleString('pt-BR')}</td>
              <td className="p-3 text-sm font-medium">{formatCurrency(user.usage.totalCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('30');
  const [isGeneratingMetrics, setIsGeneratingMetrics] = useState(false);

  // Query for business overview
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<BusinessOverview>({
    queryKey: [`/api/admin/overview?days=${timeRange}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Query for top users
  const { data: topUsers, isLoading: topUsersLoading, refetch: refetchTopUsers } = useQuery<TopUser[]>({
    queryKey: [`/api/admin/top-users?days=7&limit=20`],
    refetchInterval: 60000, // Refresh every minute
  });

  // Query for current day costs
  const { data: currentCosts, isLoading: currentCostsLoading, refetch: refetchCurrentCosts } = useQuery<CurrentCosts>({
    queryKey: ['/api/admin/current-costs'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time
  });

  // ===== FASE 1: RECEITA + IA COST TRACKING QUERIES =====
  const { data: revenueOverview, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery<{data: RevenueOverview}>({
    queryKey: [`/api/admin/revenue-overview?days=${timeRange}`],
    refetchInterval: 60000,
  });

  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery<{data: SubscriptionPlan[]}>({
    queryKey: ['/api/admin/subscription-plans?activeOnly=true'],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: subscriptionsSummary, isLoading: subscriptionsLoading } = useQuery<{data: SubscriptionsSummary}>({
    queryKey: ['/api/admin/subscriptions-summary'],
    refetchInterval: 120000, // 2 minutes
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<{data: Transaction[]}>({
    queryKey: [`/api/admin/recent-transactions?days=7&limit=20`],
    refetchInterval: 60000,
  });

  // ===== FASE 2: FUNIL DE CONVERSÃO + UX COMPLETION RATES QUERIES =====
  const { data: conversionFunnels, isLoading: funnelsLoading } = useQuery<{data: ConversionStep[]}>({
    queryKey: [`/api/admin/conversion-funnels?funnelName=signup_to_paid&days=${timeRange}`],
    refetchInterval: 300000,
  });

  const { data: sessionMetrics, isLoading: sessionsLoading } = useQuery<{data: SessionMetrics}>({
    queryKey: [`/api/admin/session-metrics?days=${timeRange}`],
    refetchInterval: 300000,
  });

  const { data: taskCompletionRates, isLoading: tasksLoading } = useQuery<{data: TaskCompletionRate[]}>({
    queryKey: [`/api/admin/task-completion-rates?days=${timeRange}`],
    refetchInterval: 300000,
  });

  const { data: userEventsAnalytics, isLoading: eventsLoading } = useQuery<{data: UserEventsAnalytics}>({
    queryKey: [`/api/admin/user-events?days=${timeRange}`],
    refetchInterval: 300000,
  });

  // ===== FASE 3: ADVANCED COHORT ANALYSIS + PREDICTIVE METRICS QUERIES =====
  const { data: cohortAnalysis, isLoading: cohortsLoading } = useQuery<{data: CohortAnalysis[]}>({
    queryKey: ['/api/admin/cohort-analysis'],
    refetchInterval: 600000, // 10 minutes
  });

  const { data: revenueBySource, isLoading: revenueSourceLoading } = useQuery<{data: RevenueBySource[]}>({
    queryKey: [`/api/admin/revenue-by-source?days=${timeRange}`],
    refetchInterval: 600000,
  });

  const { data: highRiskUsers, isLoading: riskUsersLoading } = useQuery<{data: HighRiskUser[]}>({
    queryKey: ['/api/admin/high-risk-users?limit=20'],
    refetchInterval: 1800000, // 30 minutes
  });

  const { data: predictiveMetrics, isLoading: predictiveLoading } = useQuery<{data: PredictiveMetric[]}>({
    queryKey: ['/api/admin/predictive-metrics?metricType=churn_prediction'],
    refetchInterval: 1800000,
  });

  // Manual metrics generation with sample data for all phases
  const generateMetrics = async () => {
    setIsGeneratingMetrics(true);
    try {
      // Generate legacy metrics
      const legacyResponse = await fetch('/api/admin/generate-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString() })
      });

      // Generate sample data for all phases  
      const sampleDataResponse = await fetch('/api/admin/generate-sample-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType: 'all' })
      });
      
      if (legacyResponse.ok && sampleDataResponse.ok) {
        // Refetch all data after generating metrics
        await Promise.all([
          refetchOverview(), 
          refetchTopUsers(), 
          refetchCurrentCosts(),
          refetchRevenue()
        ]);
      }
    } catch (error) {
      console.error('Error generating metrics:', error);
    } finally {
      setIsGeneratingMetrics(false);
    }
  };

  // Check if any critical data is loading
  const isLoading = overviewLoading || topUsersLoading || currentCostsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-admin-dashboard">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="admin-dashboard">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitoramento de custos e métricas de negócio em tempo real
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 lg:flex-nowrap lg:ml-auto">
            {/* Metrics Controls */}
            <div className="flex gap-2">
              <Button
                onClick={generateMetrics}
                disabled={isGeneratingMetrics}
                variant="default"
                size="sm"
                data-testid="button-generate-metrics"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingMetrics ? 'animate-spin' : ''}`} />
                {isGeneratingMetrics ? 'Atualizando...' : 'Atualizar Métricas'}
              </Button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="h-9 px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                aria-label="Selecionar intervalo de tempo"
                data-testid="select-time-range"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="gap-2" data-testid="button-admin-dashboard">
            <BarChart3 size={16} />
            Admin Principal
          </Button>
          <Link href="/admin/newsletter">
            <Button variant="outline" className="gap-2" data-testid="button-admin-newsletter">
              <Mail size={16} />
              Admin Newsletter
            </Button>
          </Link>
          <Link href="/admin/materiais">
            <Button variant="outline" className="gap-2" data-testid="button-admin-materiais">
              <Book size={16} />
              Admin Materiais
            </Button>
          </Link>
          <Link href="/admin/coupons">
            <Button variant="outline" className="gap-2" data-testid="button-admin-coupons">
              <Tag size={16} />
              Admin Cupons
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-time metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">
              {overview?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview?.activeUsers || 0} ativos nos últimos {timeRange} dias
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-operations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações Totais</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-operations">
              {overview?.totalOperations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange} dias
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-cost">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total da API</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cost">
              {formatCurrency(overview?.totalCostBrl || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(overview?.averageCostPerUser || 0)}/usuário ativo
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-tokens">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Totais</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-tokens">
              {(overview?.totalTokens || 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Entrada + Saída
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cache-efficiency">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência do Cache</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cache-efficiency">
              {(overview?.cacheEfficiency || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Economia de custos por cache hits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token breakdown cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card data-testid="card-input-tokens">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📥 Tokens de Entrada (Input)</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-input-tokens">
              {(overview?.totalInputTokens || 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Compatível com Google AI Studio
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-output-tokens">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">📤 Tokens de Saída (Output)</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-output-tokens">
              {(overview?.totalOutputTokens || 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Respostas geradas pela IA
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Tendências</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operações</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily trends chart */}
            <Card data-testid="card-daily-trends">
              <CardHeader>
                <CardTitle>Tendência Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={overview?.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value: any, name: string) => [
                        name === 'cost' ? formatCurrency(value) : value,
                        name === 'operations' ? 'Operações' : name === 'cost' ? 'Custo' : 'Usuários'
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="operations" stroke="#5087ff" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="users" stroke="#1d4ed8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Current day real-time stats */}
            <Card data-testid="card-realtime-stats">
              <CardHeader>
                <CardTitle>Estatísticas de Hoje (Tempo Real)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operações:</span>
                    <Badge variant="outline" data-testid="badge-current-operations">
                      {currentCosts?.totalOperations || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Custo:</span>
                    <Badge variant="outline" data-testid="badge-current-cost">
                      {formatCurrency(currentCosts?.totalCost || 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cache Hit Rate:</span>
                    <Badge variant="outline" data-testid="badge-current-cache">
                      {((currentCosts?.cacheHitRate || 0) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operação Principal:</span>
                    <Badge data-testid="badge-top-operation">
                      {operationNames[currentCosts?.topOperation || ''] || currentCosts?.topOperation || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card data-testid="card-trends-chart">
            <CardHeader>
              <CardTitle>Análise de Tendências ({timeRange} dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={overview?.dailyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value: any, name: string) => [
                      name === 'cost' ? formatCurrency(value) : value,
                      name === 'operations' ? 'Operações' : name === 'cost' ? 'Custo' : 'Usuários'
                    ]}
                  />
                  <Area type="monotone" dataKey="operations" stackId="1" stroke="#5087ff" fill="#5087ff" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="users" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top operations pie chart */}
            <Card data-testid="card-operations-pie">
              <CardHeader>
                <CardTitle>Distribuição de Operações</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overview?.topOperations?.map(op => ({
                        name: operationNames[op.operation] || op.operation,
                        value: op.count,
                        cost: op.cost
                      })) || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(overview?.topOperations || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: string, props: any) => [
                      `${value} operações`,
                      name
                    ]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Operations cost breakdown */}
            <Card data-testid="card-operations-costs">
              <CardHeader>
                <CardTitle>Custo por Operação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overview?.topOperations?.map(op => ({
                    name: operationNames[op.operation] || op.operation,
                    cost: op.cost,
                    count: op.count
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value: any, name: string) => [
                      name === 'cost' ? formatCurrency(value) : value,
                      name === 'cost' ? 'Custo Total' : 'Operações'
                    ]} />
                    <Bar dataKey="cost" fill="#5087ff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card data-testid="card-all-users">
            <CardHeader>
              <CardTitle>Todos os Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
