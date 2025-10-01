import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ChevronLeft,
  XCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SubscriptionPage() {
  const { 
    subscription, 
    plan, 
    limits, 
    transactions, 
    isLoading,
    isError,
    cancelSubscription, 
    reactivateSubscription,
    isCanceling,
    isReactivating,
    refetch
  } = useSubscription();
  
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(cancellationReason);
      toast({
        title: "Assinatura cancelada",
        description: "Você ainda terá acesso até o fim do período pago.",
      });
      setShowCancelDialog(false);
      setCancellationReason("");
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscription();
      toast({
        title: "Assinatura reativada",
        description: "Sua assinatura foi reativada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao reativar",
        description: "Não foi possível reativar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Ativa", color: "bg-green-500", icon: CheckCircle },
      cancelled: { label: "Cancelada", color: "bg-red-500", icon: XCircle },
      paused: { label: "Pausada", color: "bg-yellow-500", icon: Clock },
      expired: { label: "Expirada", color: "bg-gray-500", icon: AlertCircle },
      trial: { label: "Período de Teste", color: "bg-blue-500", icon: Sparkles },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    const Icon = statusInfo.icon;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
        <Icon className="w-4 h-4" />
        <span className="font-medium">{statusInfo.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4 md:p-8">
        <div className="max-w-2xl mx-auto mt-12">
          <LiquidGlassCard className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro ao Carregar Assinatura
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Não foi possível carregar os dados da sua assinatura. Tente novamente.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" data-testid="button-back-to-dashboard">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <Button 
                onClick={() => refetch()}
                data-testid="button-retry"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minha Assinatura</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie sua assinatura e acompanhe seu uso</p>
          </div>
        </div>

        {/* Current Plan */}
        <LiquidGlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid="text-plan-name">
                  {plan?.name || "Plano Gratuito"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plan?.description || "Acesso limitado às funcionalidades"}
                </p>
              </div>
            </div>
            {subscription && getStatusBadge(subscription.status)}
          </div>

          {subscription && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Início</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white" data-testid="text-start-date">
                  {formatDate(subscription.startDate)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima Cobrança</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white" data-testid="text-next-billing">
                  {formatDate(subscription.nextBillingDate)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Valor</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white" data-testid="text-price">
                  {subscription.billingCycle === 'yearly' 
                    ? formatCurrency(plan?.priceYearly || 0)
                    : formatCurrency(plan?.priceMonthly || 0)
                  }
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    /{subscription.billingCycle === 'yearly' ? 'ano' : 'mês'}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelDialog(true)}
                disabled={isCanceling}
                data-testid="button-cancel-subscription"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Assinatura
              </Button>
            )}
            
            {subscription?.cancelAtPeriodEnd && (
              <Button 
                variant="default"
                onClick={handleReactivateSubscription}
                disabled={isReactivating}
                data-testid="button-reactivate-subscription"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isReactivating ? "Reativando..." : "Reativar Assinatura"}
              </Button>
            )}

            <Link href="/pricing">
              <Button variant="outline" data-testid="button-upgrade">
                <TrendingUp className="h-4 w-4 mr-2" />
                {subscription ? "Mudar Plano" : "Assinar Agora"}
              </Button>
            </Link>
          </div>
        </LiquidGlassCard>

        {/* Usage Limits */}
        {limits && (
          <LiquidGlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Uso de IA</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Acompanhe seu consumo {limits.periodLabel || 'periódico'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uso {limits.periodLabel || 'periódico'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white" data-testid="text-usage">
                    {limits.percentageUsed.toFixed(1)}% usado
                  </span>
                </div>
                <Progress 
                  value={limits.percentageUsed} 
                  className="h-3"
                  data-testid="progress-usage"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {(100 - limits.percentageUsed).toFixed(1)}% restante • Renova em {limits.daysUntilReset} dias
                </p>
              </div>

              {!limits.canUseAI && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Limite atingido
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Você atingiu seu limite {limits.periodLabel || 'periódico'} de uso de IA. Faça upgrade para continuar usando.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </LiquidGlassCard>
        )}

        {/* Transaction History */}
        {transactions && transactions.length > 0 && (
          <LiquidGlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Histórico de Transações</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Últimas movimentações
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <DollarSign className={`h-4 w-4 ${
                        transaction.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {transaction.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'refund' || transaction.type === 'chargeback'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {transaction.type === 'refund' || transaction.type === 'chargeback' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        )}
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até {formatDate(subscription?.nextBillingDate)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Por que você está cancelando? (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Conte-nos o motivo do cancelamento para melhorarmos nosso serviço..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                data-testid="textarea-cancellation-reason"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              data-testid="button-cancel-dialog-close"
            >
              Manter Assinatura
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              data-testid="button-confirm-cancel"
            >
              {isCanceling ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
