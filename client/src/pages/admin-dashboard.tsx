import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, Users, DollarSign, TrendingUp, AlertTriangle, RefreshCw, CreditCard, Target, Brain, Users as UsersIcon, Mail, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BusinessOverview {
  totalUsers: number;
  activeUsers: number;
  totalOperations: number;
  totalCostBrl: number;
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
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            {/* Admin Actions */}
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" data-testid="button-admin-newsletter">
                <Link href="/admin/newsletter">
                  <Mail className="h-4 w-4 mr-2" />
                  Newsletter
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" data-testid="button-admin-materiais">
                <Link href="/admin/materiais">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Material
                </Link>
              </Button>
            </div>
            
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
                {isGeneratingMetrics ? 'Gerando...' : 'Gerar Métricas'}
              </Button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
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

      {/* Real-time metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cost">
              {formatCurrency(overview?.totalCostBrl || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(overview?.averageCostPerUser || 0)}/usuário
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Tendências</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operações</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Usuários</TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue">Receita</TabsTrigger>
          <TabsTrigger value="conversion" data-testid="tab-conversion">Conversão</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
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
          <Card data-testid="card-top-users">
            <CardHeader>
              <CardTitle>Usuários com Maior Custo (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers?.map((user, index) => (
                  <div key={user.ipAddress} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`user-item-${index}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">
                          {user.userId ? `User ${user.userId.slice(0, 8)}...` : user.ipAddress}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        IP: {user.ipAddress} | Principal: {operationNames[user.topOperation] || user.topOperation}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" data-testid={`user-cost-${index}`}>
                        {formatCurrency(user.totalCost)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {user.totalOperations} ops | Média: {formatCurrency(user.averageOperationCost)}
                      </div>
                    </div>
                  </div>
                )) || <div className="text-center text-gray-500 py-8">Nenhum dado disponível</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== FASE 1: RECEITA TAB ===== */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {/* Revenue KPI Cards */}
            <Card data-testid="card-mrr">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-mrr">
                  {formatCurrency(revenueOverview?.data?.mrr || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  ARR: {formatCurrency(revenueOverview?.data?.arr || 0)}
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-active-subscriptions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-subscriptions">
                  {subscriptionsSummary?.data?.totalActive || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionsSummary?.data?.totalTrial || 0} em trial
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-arpu">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-arpu">
                  {formatCurrency(revenueOverview?.data?.arpu || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue por usuário
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-mrr-growth">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-mrr-growth">
                  {(revenueOverview?.data?.mrrGrowthRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos {timeRange} dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Plans */}
            <Card data-testid="card-subscription-plans">
              <CardHeader>
                <CardTitle>Planos de Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(subscriptionPlans?.data || []).map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(plan.priceMonthly)}/mês</div>
                        {plan.priceYearly && (
                          <div className="text-sm text-gray-600">{formatCurrency(plan.priceYearly)}/ano</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card data-testid="card-recent-transactions">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(recentTransactions?.data || []).slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{transaction.type}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(transaction.amount)}</div>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== FASE 2: CONVERSÃO TAB ===== */}
        <TabsContent value="conversion">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {/* Session Metrics Cards */}
            <Card data-testid="card-total-sessions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-sessions">
                  {sessionMetrics?.data?.totalSessions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos {timeRange} dias
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-bounce-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-bounce-rate">
                  {(sessionMetrics?.data?.bounceRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Duração média: {Math.round(sessionMetrics?.data?.averageDuration || 0)}s
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-page-views">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Páginas/Sessão</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-page-views">
                  {(sessionMetrics?.data?.averagePageViews || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Páginas por sessão
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-events-total">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos Totais</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-events-total">
                  {userEventsAnalytics?.data?.totalEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos {timeRange} dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card data-testid="card-conversion-funnel">
              <CardHeader>
                <CardTitle>Funil de Conversão (Signup → Pagamento)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionFunnels?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stepName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value: any, name: string) => [
                      name === 'conversionRate' ? `${value.toFixed(1)}%` : value,
                      name === 'conversionRate' ? 'Taxa de Conversão' : 'Usuários'
                    ]} />
                    <Bar dataKey="conversionRate" fill="#5087ff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Completion Rates */}
            <Card data-testid="card-task-completion">
              <CardHeader>
                <CardTitle>Taxa de Conclusão de Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(taskCompletionRates?.data || []).slice(0, 5).map((task, index) => (
                    <div key={`${task.taskType}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{task.taskName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {task.totalStarted} iniciadas | {task.totalCompleted} concluídas
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{task.completionRate.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">
                          Satisfação: {task.averageSatisfactionScore.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== FASE 3: ANALYTICS TAB ===== */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Cohort Analysis */}
            <Card data-testid="card-cohort-analysis">
              <CardHeader>
                <CardTitle>Análise de Coorte por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cohortAnalysis?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohortMonth" />
                    <YAxis />
                    <Tooltip formatter={(value: any, name: string) => [
                      name === 'retentionRate' ? `${value.toFixed(1)}%` : value,
                      name === 'retentionRate' ? 'Taxa de Retenção' : 
                      name === 'totalUsers' ? 'Total de Usuários' : 
                      name === 'activeUsers' ? 'Usuários Ativos' : name
                    ]} />
                    <Bar dataKey="retentionRate" fill="#5087ff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Source */}
            <Card data-testid="card-revenue-by-source">
              <CardHeader>
                <CardTitle>Receita por Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBySource?.data?.map(source => ({
                        name: source.source,
                        value: source.totalRevenue,
                        percentage: source.percentage
                      })) || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(revenueBySource?.data || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* High Risk Users */}
          <Card data-testid="card-high-risk-users">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Usuários com Alto Risco de Churn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(highRiskUsers?.data || []).slice(0, 5).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`high-risk-user-${index}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={user.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                          {user.riskLevel === 'critical' ? 'Crítico' : 'Alto Risco'}
                        </Badge>
                        <span className="font-medium">{user.userName}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {user.userEmail}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Fatores: {user.riskFactors.slice(0, 2).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{(user.churnProbability * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {user.daysToChurn} dias para churn
                      </div>
                    </div>
                  </div>
                ))}
                {!highRiskUsers?.data?.length && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhum usuário de alto risco encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}