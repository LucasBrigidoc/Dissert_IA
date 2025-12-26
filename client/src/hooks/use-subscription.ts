import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserSubscription, SubscriptionPlan, Transaction } from "@shared/schema";

interface SubscriptionWithPlan {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
}

interface SubscriptionLimits {
  hasActiveSubscription: boolean;
  canUseAI: boolean;
  weeklyUsage: number;
  weeklyLimit: number;
  remainingCredits: number;
  percentageUsed: number;
  planName: string;
  daysUntilReset: number;
  resetPeriodDays: number;
  periodLabel: string;
}

export function useSubscription() {
  const subscriptionQuery = useQuery<SubscriptionWithPlan>({
    queryKey: ["/api/subscription"],
  });

  const limitsQuery = useQuery<SubscriptionLimits>({
    queryKey: ["/api/subscription/limits"],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    refetchIntervalInBackground: false, // Não atualiza quando a aba está em segundo plano
  });

  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["/api/subscription/transactions"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason?: string) => {
      return await apiRequest("/api/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/limits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/transactions"] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/subscription/reactivate", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/limits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/transactions"] });
    },
  });

  return {
    subscription: subscriptionQuery.data?.subscription,
    plan: subscriptionQuery.data?.plan,
    limits: limitsQuery.data,
    transactions: transactionsQuery.data,
    isLoading: subscriptionQuery.isLoading || limitsQuery.isLoading,
    isError: subscriptionQuery.isError || limitsQuery.isError,
    cancelSubscription: cancelMutation.mutateAsync,
    reactivateSubscription: reactivateMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
    isReactivating: reactivateMutation.isPending,
    refetch: () => {
      subscriptionQuery.refetch();
      limitsQuery.refetch();
      transactionsQuery.refetch();
    },
  };
}
