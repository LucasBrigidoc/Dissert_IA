import { type IStorage } from "./storage";
import { type User, type SubscriptionPlan, type UserSubscription } from "@shared/schema";

export interface SubscriptionLimits {
  hasActiveSubscription: boolean;
  planName: string;
  maxOperationsPerMonth: number;
  maxAICostPerMonth: number;
  currentOperations: number;
  currentCostCentavos: number;
  operationsRemaining: number;
  costRemainingCentavos: number;
  canUseAI: boolean;
  limitReachedReason?: string;
}

export class SubscriptionService {
  constructor(private storage: IStorage) {}

  /**
   * Get user's current subscription with plan details
   */
  async getUserSubscriptionWithPlan(userId: string): Promise<{
    subscription: UserSubscription | null;
    plan: SubscriptionPlan | null;
  }> {
    const subscription = await this.storage.getUserSubscription(userId);
    
    if (!subscription) {
      return { subscription: null, plan: null };
    }

    const plan = await this.storage.getSubscriptionPlan(subscription.planId);
    return { subscription, plan: plan || null };
  }

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.storage.getUserSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    // Check if subscription is active and not expired
    const isActive = subscription.status === 'active' || subscription.status === 'trial';
    
    if (subscription.endDate) {
      const now = new Date();
      return isActive && new Date(subscription.endDate) > now;
    }

    return isActive;
  }

  /**
   * Get user plan type: 'free' or 'pro'
   * Pro plan = users with active subscription
   * Free plan = users without active subscription
   */
  async getUserPlanType(userId: string): Promise<'free' | 'pro'> {
    const hasActive = await this.hasActiveSubscription(userId);
    return hasActive ? 'pro' : 'free';
  }

  /**
   * Get subscription limits for a user
   */
  async getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
    const { subscription, plan } = await this.getUserSubscriptionWithPlan(userId);

    // If no subscription, return free plan limits
    if (!subscription || !plan) {
      return this.getFreePlanLimits(userId);
    }

    // Check if subscription is active
    const hasActive = await this.hasActiveSubscription(userId);
    if (!hasActive) {
      return this.getFreePlanLimits(userId);
    }

    // Get current usage for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usage = await this.storage.getUserCostSummary(
      { userId },
      startOfMonth,
      endOfMonth
    );

    // Calculate limits
    const maxOperations = plan.maxOperationsPerMonth || -1; // -1 = unlimited
    const maxCost = plan.maxAICostPerMonth || -1; // -1 = unlimited
    const currentOps = usage.totalOperations;
    const currentCost = usage.totalCost;

    const operationsRemaining = maxOperations === -1 ? -1 : Math.max(0, maxOperations - currentOps);
    const costRemaining = maxCost === -1 ? -1 : Math.max(0, maxCost - currentCost);

    // Determine if user can use AI
    let canUseAI = true;
    let limitReachedReason: string | undefined;

    if (maxOperations !== -1 && currentOps >= maxOperations) {
      canUseAI = false;
      limitReachedReason = 'Limite de operações mensais atingido';
    } else if (maxCost !== -1 && currentCost >= maxCost) {
      canUseAI = false;
      limitReachedReason = 'Limite de custo de IA mensal atingido';
    }

    return {
      hasActiveSubscription: true,
      planName: plan.name,
      maxOperationsPerMonth: maxOperations,
      maxAICostPerMonth: maxCost,
      currentOperations: currentOps,
      currentCostCentavos: currentCost,
      operationsRemaining,
      costRemainingCentavos: costRemaining,
      canUseAI,
      limitReachedReason,
    };
  }

  /**
   * Get free plan limits (for users without subscription)
   */
  private async getFreePlanLimits(userId: string): Promise<SubscriptionLimits> {
    // Free plan limits: unlimited operations, R$0.35 max cost
    const FREE_PLAN_OPERATIONS = -1; // -1 = unlimited
    const FREE_PLAN_COST_CENTAVOS = 35; // R$ 0.35

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usage = await this.storage.getUserCostSummary(
      { userId },
      startOfMonth,
      endOfMonth
    );

    const currentOps = usage.totalOperations;
    const currentCost = usage.totalCost;

    const operationsRemaining = FREE_PLAN_OPERATIONS === -1 ? -1 : Math.max(0, FREE_PLAN_OPERATIONS - currentOps);
    const costRemaining = Math.max(0, FREE_PLAN_COST_CENTAVOS - currentCost);

    let canUseAI = true;
    let limitReachedReason: string | undefined;

    if (FREE_PLAN_OPERATIONS !== -1 && currentOps >= FREE_PLAN_OPERATIONS) {
      canUseAI = false;
      limitReachedReason = 'Limite de operações do plano gratuito atingido. Faça upgrade!';
    } else if (currentCost >= FREE_PLAN_COST_CENTAVOS) {
      canUseAI = false;
      limitReachedReason = 'Limite de custo do plano gratuito atingido. Faça upgrade!';
    }

    return {
      hasActiveSubscription: false,
      planName: 'Gratuito',
      maxOperationsPerMonth: FREE_PLAN_OPERATIONS,
      maxAICostPerMonth: FREE_PLAN_COST_CENTAVOS,
      currentOperations: currentOps,
      currentCostCentavos: currentCost,
      operationsRemaining,
      costRemainingCentavos: costRemaining,
      canUseAI,
      limitReachedReason,
    };
  }

  /**
   * Check if user can use AI features (throws error if not)
   */
  async checkAIUsageAllowed(userId: string): Promise<void> {
    const limits = await this.getSubscriptionLimits(userId);

    if (!limits.canUseAI) {
      throw new Error(limits.limitReachedReason || 'Limite de uso atingido');
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string, reason?: string): Promise<UserSubscription> {
    const subscription = await this.storage.getUserSubscription(userId);
    
    if (!subscription) {
      throw new Error('Nenhuma assinatura encontrada');
    }

    if (subscription.status === 'cancelled') {
      throw new Error('Assinatura já cancelada');
    }

    // Update subscription to cancel at period end
    const updated = await this.storage.updateUserSubscription(subscription.id, {
      cancelAtPeriodEnd: true,
      cancellationReason: reason || null,
      cancelledAt: new Date(),
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId: string): Promise<UserSubscription> {
    const subscription = await this.storage.getUserSubscription(userId);
    
    if (!subscription) {
      throw new Error('Nenhuma assinatura encontrada');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new Error('Assinatura não está cancelada');
    }

    const updated = await this.storage.updateUserSubscription(subscription.id, {
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId: string, limit: number = 10): Promise<any[]> {
    const transactions = await this.storage.getUserTransactions(userId);
    return transactions.slice(0, limit);
  }
}
