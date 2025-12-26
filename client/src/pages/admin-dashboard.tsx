import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, BarChart3, Users, DollarSign, TrendingUp, AlertTriangle, RefreshCw, CreditCard, Target, Brain, Users as UsersIcon, Mail, BookOpen, Book, Tag, ArrowDownToLine, ArrowUpFromLine, Trash2, Search, Calendar, FileText, User, X, Filter } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdminCheck } from "@/hooks/use-admin-check";

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

interface PlanCount {
  planId: string;
  planName: string;
  userCount: number;
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

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: Date;
  planId: string;
}

// ===== FEEDBACK/BUGS MANAGEMENT =====
interface FeedbackItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  message: string;
  location: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackStatistics {
  totalOperations: number;
  totalBugs: number;
  pendingBugs: number;
  reviewingBugs: number;
  resolvedBugs: number;
  dismissedBugs: number;
  overallAccuracyRate: number;
  resolutionRate: number;
}

interface ToolStat {
  operation: string;
  name: string;
  totalUses: number;
  bugs: number;
  accuracyRate: number;
}

interface FeedbackData {
  feedbacks: FeedbackItem[];
  statistics: FeedbackStatistics;
  toolStats: ToolStat[];
}

function FeedbackManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [periodDays, setPeriodDays] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  // Fetch users for user filter dropdown
  const { data: usersData } = useQuery<{ users: AdminUser[]; total: number }>({
    queryKey: ['/api/admin/users/all'],
  });

  const { data: feedbackData, isLoading } = useQuery<FeedbackData>({
    queryKey: ['/api/admin/feedback', periodDays, selectedUserId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (periodDays !== 'all') params.append('days', periodDays);
      if (selectedUserId !== 'all') params.append('userId', selectedUserId);
      const queryString = params.toString();
      const url = queryString ? `/api/admin/feedback?${queryString}` : '/api/admin/feedback';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch feedback');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status?: string; adminNotes?: string }) => {
      return await apiRequest(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        body: { status, adminNotes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback'] });
      toast({
        title: "Sucesso",
        description: "Feedback atualizado com sucesso!",
      });
      setEditingNotes(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar feedback",
        variant: "destructive",
      });
    },
  });

  const statistics = feedbackData?.statistics;
  const toolStats = feedbackData?.toolStats || [];
  const feedbacks = feedbackData?.feedbacks || [];

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = !searchTerm || 
      fb.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || fb.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'destructive', label: 'Pendente' },
      reviewing: { variant: 'secondary', label: 'Em Análise' },
      resolved: { variant: 'default', label: 'Resolvido' },
      dismissed: { variant: 'outline', label: 'Dispensado' },
    };
    return variants[status] || { variant: 'outline', label: status };
  };

  const getAccuracyColor = (rate: number) => {
    if (rate >= 99) return 'text-green-600 bg-green-50 dark:bg-green-950';
    if (rate >= 95) return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    if (rate >= 90) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
    return 'text-red-600 bg-red-50 dark:bg-red-950';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getPeriodLabel = (value: string) => {
    const labels: Record<string, string> = {
      '1': 'Último dia',
      '3': 'Últimos 3 dias',
      '7': 'Últimos 7 dias',
      '30': 'Últimos 30 dias',
      '90': 'Últimos 90 dias',
      '120': 'Últimos 120 dias',
      '180': 'Últimos 180 dias',
      'all': 'Todo o período',
    };
    return labels[value] || value;
  };

  const users = usersData?.users || [];
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Period Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Período:</span>
          <Select value={periodDays} onValueChange={setPeriodDays}>
            <SelectTrigger className="w-[180px]" data-testid="select-period-filter">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Último dia</SelectItem>
              <SelectItem value="3">Últimos 3 dias</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="120">Últimos 120 dias</SelectItem>
              <SelectItem value="180">Últimos 180 dias</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Filter */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Usuário:</span>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-[220px]" data-testid="select-user-filter">
              <SelectValue placeholder="Todos os usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedUserId !== 'all' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedUserId('all')}
              className="h-8 px-2"
              data-testid="button-clear-user-filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Badge */}
      {selectedUserId !== 'all' && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Exibindo estatísticas de: <strong>{selectedUser?.name || 'Usuário'}</strong>
          </span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Taxa de Acerto Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(statistics?.overallAccuracyRate || 0)}`}>
              {(statistics?.overallAccuracyRate || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.totalOperations.toLocaleString('pt-BR')} operações totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Bugs Reportados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics?.totalBugs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.pendingBugs || 0} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-500" />
              Em Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics?.reviewingBugs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              sendo analisados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Taxa de Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(statistics?.resolutionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {statistics?.resolvedBugs || 0} resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tool Accuracy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Taxa de Acerto por Ferramenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolStats.map((tool) => (
              <div 
                key={tool.operation} 
                className={`p-4 rounded-lg border ${getAccuracyColor(tool.accuracyRate)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{tool.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {tool.accuracyRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tool.totalUses.toLocaleString('pt-BR')} usos</span>
                  <span>{tool.bugs} bugs</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-current h-2 rounded-full transition-all" 
                    style={{ width: `${tool.accuracyRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {toolStats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma estatística de ferramenta disponível ainda.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedbacks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Bugs Reportados pelos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por mensagem, email, usuário ou página..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-feedback-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-feedback-status">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="reviewing">Em Análise</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="dismissed">Dispensados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results counter */}
          <div className="text-sm text-muted-foreground mb-4">
            Mostrando {filteredFeedbacks.length} de {feedbacks.length} feedbacks
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Usuário</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium max-w-[300px]">Mensagem</th>
                  <th className="text-left p-3 font-medium">Página</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Data</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? "Nenhum feedback encontrado com os filtros aplicados"
                        : "Nenhum bug reportado ainda"}
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <tr key={fb.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900" data-testid={`row-feedback-${fb.id}`}>
                      <td className="p-3 text-sm">{fb.userName || 'Anônimo'}</td>
                      <td className="p-3 text-sm">{fb.userEmail || '-'}</td>
                      <td className="p-3 text-sm max-w-[300px]">
                        <div className="line-clamp-2" title={fb.message}>
                          {fb.message}
                        </div>
                        {fb.adminNotes && (
                          <div className="mt-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 p-1 rounded">
                            <strong>Notas:</strong> {fb.adminNotes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant="outline">{fb.location || 'N/A'}</Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={getStatusBadge(fb.status).variant}>
                          {getStatusBadge(fb.status).label}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(fb.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex flex-col gap-2">
                          <Select
                            value={fb.status}
                            onValueChange={(value) => updateFeedbackMutation.mutate({ id: fb.id, status: value })}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs" data-testid={`select-status-${fb.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="reviewing">Em Análise</SelectItem>
                              <SelectItem value="resolved">Resolvido</SelectItem>
                              <SelectItem value="dismissed">Dispensado</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {editingNotes === fb.id ? (
                            <div className="flex gap-1">
                              <Input
                                value={notesValue}
                                onChange={(e) => setNotesValue(e.target.value)}
                                placeholder="Notas..."
                                className="h-8 text-xs"
                                data-testid={`input-notes-${fb.id}`}
                              />
                              <Button
                                size="sm"
                                className="h-8"
                                onClick={() => {
                                  updateFeedbackMutation.mutate({ id: fb.id, adminNotes: notesValue });
                                }}
                                disabled={updateFeedbackMutation.isPending}
                                data-testid={`button-save-notes-${fb.id}`}
                              >
                                OK
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                setEditingNotes(fb.id);
                                setNotesValue(fb.adminNotes || '');
                              }}
                              data-testid={`button-edit-notes-${fb.id}`}
                            >
                              {fb.adminNotes ? 'Editar Notas' : 'Add Notas'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminManagement() {
  const { toast } = useToast();
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  
  const { data: usersData, isLoading } = useQuery<{ users: AdminUser[]; total: number }>({
    queryKey: ['/api/admin/users/all'],
    refetchInterval: 10000,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/admin`, {
        method: 'PATCH',
        body: { isAdmin },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/all'] });
      toast({
        title: "Sucesso",
        description: "Status de administrador atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar status de administrador",
        variant: "destructive",
      });
    },
  });

  const admins = usersData?.users.filter(u => u.isAdmin) || [];
  const nonAdmins = usersData?.users.filter(u => !u.isAdmin) || [];

  // Filter admins and non-admins based on search term
  const filteredAdmins = admins.filter(user => {
    if (!adminSearchTerm) return true;
    const searchLower = adminSearchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower))
    );
  });

  const filteredNonAdmins = nonAdmins.filter(user => {
    if (!adminSearchTerm) return true;
    const searchLower = adminSearchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower))
    );
  });

  if (isLoading) {
    return <div className="text-center py-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={adminSearchTerm}
            onChange={(e) => setAdminSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-admin-search"
          />
        </div>
        {adminSearchTerm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAdminSearchTerm('')}
            data-testid="button-clear-admin-search"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Results Counter */}
      {adminSearchTerm && (
        <p className="text-sm text-muted-foreground" data-testid="text-admin-search-results">
          {filteredAdmins.length + filteredNonAdmins.length} usuário(s) encontrado(s)
        </p>
      )}

      {/* Current Admins Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Administradores Atuais</h3>
        {filteredAdmins.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {adminSearchTerm ? 'Nenhum administrador encontrado com esse critério de busca' : 'Nenhum administrador encontrado'}
          </p>
        ) : (
          <div className="grid gap-3">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-primary/5"
                data-testid={`admin-card-${admin.id}`}
              >
                <div className="flex-1">
                  <p className="font-medium" data-testid={`admin-name-${admin.id}`}>{admin.name}</p>
                  <p className="text-sm text-muted-foreground" data-testid={`admin-email-${admin.id}`}>{admin.email}</p>
                </div>
                <Badge variant="default" data-testid={`admin-badge-${admin.id}`}>Admin</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => toggleAdminMutation.mutate({ userId: admin.id, isAdmin: false })}
                  disabled={toggleAdminMutation.isPending}
                  data-testid={`button-remove-admin-${admin.id}`}
                >
                  Remover Admin
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Non-Admin Users Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Promover Usuários</h3>
        {filteredNonAdmins.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {adminSearchTerm ? 'Nenhum usuário encontrado com esse critério de busca' : 'Todos os usuários já são administradores'}
          </p>
        ) : (
          <div className="border rounded-lg">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Nome</th>
                    <th className="text-left p-3 text-sm font-medium">Email</th>
                    <th className="text-left p-3 text-sm font-medium">Telefone</th>
                    <th className="text-left p-3 text-sm font-medium">Data de Cadastro</th>
                    <th className="text-right p-3 text-sm font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNonAdmins.map((user) => (
                    <tr key={user.id} className="border-t" data-testid={`user-row-${user.id}`}>
                      <td className="p-3 text-sm" data-testid={`user-name-${user.id}`}>{user.name}</td>
                      <td className="p-3 text-sm" data-testid={`user-email-${user.id}`}>{user.email}</td>
                      <td className="p-3 text-sm" data-testid={`user-phone-${user.id}`}>{user.phone || '-'}</td>
                      <td className="p-3 text-sm" data-testid={`user-created-${user.id}`}>
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-sm text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => toggleAdminMutation.mutate({ userId: user.id, isAdmin: true })}
                          disabled={toggleAdminMutation.isPending}
                          data-testid={`button-promote-${user.id}`}
                        >
                          Tornar Admin
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersTable() {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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
        planId: string;
        status: string;
        startDate: Date | null;
        isPro: boolean;
        price: string;
      };
      usage: {
        totalCost: number;
        totalTokens: number;
        operationCount: number;
        cost30Days: number;
        tokens30Days: number;
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
        body: { planId },
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

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`Tem certeza que deseja deletar ${selectedUsers.length} usuário(s)? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiRequest('/api/admin/users/delete-multiple', {
        method: 'POST',
        body: { userIds: selectedUsers },
      });

      // Check if any users were actually deleted
      if (response.deletedCount > 0) {
        toast({
          title: "Sucesso",
          description: `${response.deletedCount} usuário(s) deletado(s) com sucesso!`,
        });
        setSelectedUsers([]);
      } else {
        // No users were deleted - show warning
        toast({
          title: "Erro ao deletar usuários",
          description: `Não foi possível deletar ${selectedUsers.length} usuário(s). Verifique se eles possuem dados relacionados e tente novamente.`,
          variant: "destructive",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-users'] });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar usuários",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const currentFilteredUsers = usersData?.users.filter(user => {
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.phone.toLowerCase().includes(search) ||
        user.subscription.planName.toLowerCase().includes(search)
      );
    }) || [];

    if (selectedUsers.length === currentFilteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentFilteredUsers.map(u => u.id) || []);
    }
  };

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

  // Filter users based on search term
  const filteredUsers = usersData?.users.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.phone.toLowerCase().includes(search) ||
      user.subscription.planName.toLowerCase().includes(search)
    );
  }) || [];

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!usersData?.users || usersData.users.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>;
  }

  const plans = subscriptionPlans?.data || [];

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar usuário por nome, email, telefone ou plano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            data-testid="input-search-users"
          />
        </div>
        {searchTerm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm('')}
            data-testid="button-clear-search"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} usuário(s) encontrado(s)
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <span className="text-sm font-medium text-red-900">
            {selectedUsers.length} usuário(s) selecionado(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            data-testid="button-delete-selected-users"
          >
            <Trash2 className="mr-2" size={16} />
            {isDeleting ? "Deletando..." : "Deletar Selecionados"}
          </Button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 font-medium w-10">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
                  data-testid="checkbox-select-all"
                />
              </th>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Telefone</th>
              <th className="text-left p-3 font-medium">Plano</th>
              <th className="text-left p-3 font-medium">Criado em</th>
              <th className="text-left p-3 font-medium">Pro desde</th>
              <th className="text-left p-3 font-medium">Tokens</th>
              <th className="text-left p-3 font-medium">Gasto (R$)</th>
              <th className="text-left p-3 font-medium text-blue-600">Tokens (30d)</th>
              <th className="text-left p-3 font-medium text-blue-600">Gasto R$ (30d)</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado com "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50" data-testid={`row-user-${user.id}`}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="cursor-pointer"
                    data-testid={`checkbox-user-${user.id}`}
                  />
                </td>
                <td className="p-3" data-testid={`text-username-${user.id}`}>{user.name}</td>
                <td className="p-3 text-sm" data-testid={`text-email-${user.id}`}>{user.email}</td>
                <td className="p-3 text-sm">{user.phone}</td>
                <td className="p-3">
                  <Select
                    value={user.subscription.planId || 'plan-free'}
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
                <td className="p-3 text-sm text-blue-600">{(user.usage.tokens30Days || 0).toLocaleString('pt-BR')}</td>
                <td className="p-3 text-sm font-medium text-blue-600">{formatCurrency(user.usage.cost30Days || 0)}</td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [timeRange, setTimeRange] = useState('30');
  const [isGeneratingMetrics, setIsGeneratingMetrics] = useState(false);

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

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

  // Query for users by plan count
  const { data: usersByPlan } = useQuery<{success: boolean; plans: PlanCount[]}>({
    queryKey: ['/api/admin/users-by-plan'],
    refetchInterval: 30000, // Refresh every 30 seconds
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
          <Link href="/admin/blog">
            <Button variant="outline" className="gap-2" data-testid="button-admin-blog">
              <FileText size={16} />
              Admin Blog
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends" data-testid="tab-trends">Tendências</TabsTrigger>
          <TabsTrigger value="operations" data-testid="tab-operations">Operações</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Usuários</TabsTrigger>
          <TabsTrigger value="bugs" data-testid="tab-bugs">Bugs</TabsTrigger>
          <TabsTrigger value="admins" data-testid="tab-admins">Administradores</TabsTrigger>
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
          <div className="space-y-6">
            {/* Users by plan distribution */}
            <Card data-testid="card-users-by-plan">
              <CardHeader>
                <CardTitle>Distribuição de Usuários por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {usersByPlan?.plans?.map((plan) => {
                    const planColors: Record<string, string> = {
                      'plan-free': 'bg-gray-100 dark:bg-gray-800 border-gray-300',
                      'plan-pro-monthly': 'bg-blue-50 dark:bg-blue-950 border-blue-300',
                      'plan-pro-yearly': 'bg-purple-50 dark:bg-purple-950 border-purple-300',
                    };
                    
                    return (
                      <div 
                        key={plan.planId} 
                        className={`p-4 rounded-lg border ${planColors[plan.planId] || 'bg-gray-100 dark:bg-gray-800'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-semibold">{plan.planName}</span>
                          </div>
                        </div>
                        <div className="text-3xl font-bold" data-testid={`text-plan-count-${plan.planId}`}>
                          {plan.userCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {plan.userCount === 1 ? 'usuário' : 'usuários'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* User management table */}
            <Card data-testid="card-all-users">
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <UsersTable />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bugs">
          <FeedbackManagement />
        </TabsContent>

        <TabsContent value="admins">
          <Card data-testid="card-admin-management">
            <CardHeader>
              <CardTitle>Gerenciamento de Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
