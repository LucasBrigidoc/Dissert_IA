import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, Users, DollarSign, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
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

  // Manual metrics generation
  const generateMetrics = async () => {
    setIsGeneratingMetrics(true);
    try {
      const response = await fetch('/api/admin/generate-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString() })
      });
      
      if (response.ok) {
        // Refetch all data after generating metrics
        await Promise.all([refetchOverview(), refetchTopUsers(), refetchCurrentCosts()]);
      }
    } catch (error) {
      console.error('Error generating metrics:', error);
    } finally {
      setIsGeneratingMetrics(false);
    }
  };

  if (overviewLoading || topUsersLoading || currentCostsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-admin-dashboard">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="admin-dashboard">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Monitoramento de custos e métricas de negócio em tempo real
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={generateMetrics}
              disabled={isGeneratingMetrics}
              variant="outline"
              data-testid="button-generate-metrics"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingMetrics ? 'animate-spin' : ''}`} />
              {isGeneratingMetrics ? 'Gerando...' : 'Gerar Métricas'}
            </Button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
              data-testid="select-time-range"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
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
      </Tabs>
    </div>
  );
}