import { type IStorage } from "./storage";
import { type User, type SubscriptionPlan, type UserSubscription } from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe if key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

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
    // Free plan limits: unlimited operations, R$0.35 max cost per month
    const FREE_PLAN_OPERATIONS = -1; // -1 = unlimited
    const FREE_PLAN_COST_CENTAVOS = 35; // R$ 0.35 (17 centavos a cada 15 dias = 34 centavos por mês)

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

  // ==================== AUTOMATIC SUBSCRIPTION LIFECYCLE MANAGEMENT ====================

  /**
   * Check if a user's subscription is expired and handle downgrade
   */
  async checkAndHandleExpiredSubscription(userId: string): Promise<{
    isExpired: boolean;
    downgradedToFree: boolean;
  }> {
    const user = await this.storage.getUserById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // If user is already on free plan, nothing to do
    if (user.planId === 'plan-free') {
      return { isExpired: false, downgradedToFree: false };
    }

    // Check if subscription has expiration date
    if (!user.subscriptionExpiresAt) {
      // No expiration date set, subscription is valid
      return { isExpired: false, downgradedToFree: false };
    }

    // Check if subscription is expired
    const now = new Date();
    const expirationDate = new Date(user.subscriptionExpiresAt);
    
    if (expirationDate > now) {
      // Subscription is still active
      return { isExpired: false, downgradedToFree: false };
    }

    // Subscription is expired, check Stripe for renewal
    const hasActiveStripeSubscription = await this.checkStripeSubscriptionStatus(userId);
    
    if (hasActiveStripeSubscription) {
      // Subscription was renewed in Stripe, local data already updated
      return { isExpired: false, downgradedToFree: false };
    }

    // No active subscription in Stripe, downgrade to free
    await this.storage.updateUserPlan(userId, 'plan-free', null);
    
    console.log(`✅ User ${userId} downgraded to free plan due to expired subscription`);
    
    return { isExpired: true, downgradedToFree: true };
  }

  /**
   * Check if user has active subscription in Stripe
   */
  async checkStripeSubscriptionStatus(userId: string): Promise<boolean> {
    if (!stripe) {
      console.warn("⚠️ Stripe not initialized, skipping subscription check");
      return false;
    }

    try {
      // Get user's active subscription from database
      const subscription = await this.storage.getUserSubscription(userId);
      
      if (!subscription?.stripeSubscriptionId) {
        return false;
      }

      // Fetch subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      ) as any;

      // Check if subscription is active or trialing
      const isActive = ['active', 'trialing'].includes(stripeSubscription.status);
      
      if (isActive && stripeSubscription.current_period_end) {
        // Update local subscription data with Stripe info
        const newExpiresAt = new Date(stripeSubscription.current_period_end * 1000);
        await this.storage.updateUserPlan(userId, subscription.planId, newExpiresAt);
        console.log(`✅ Updated subscription for user ${userId}, expires at ${newExpiresAt}`);
      }

      return isActive;
    } catch (error) {
      console.error(`❌ Error checking Stripe subscription for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Set user to Pro plan (monthly or yearly)
   */
  async upgradeToPro(
    userId: string, 
    planId: 'plan-pro-monthly' | 'plan-pro-yearly',
    stripeSubscriptionId?: string
  ): Promise<void> {
    const duration = planId === 'plan-pro-monthly' ? 30 : 365; // days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    await this.storage.updateUserPlan(userId, planId, expiresAt);

    // Create or update subscription record if Stripe ID provided
    if (stripeSubscriptionId) {
      await this.storage.createOrUpdateSubscription({
        userId,
        planId,
        stripeSubscriptionId,
        expiresAt,
      });
    }

    console.log(`✅ User ${userId} upgraded to ${planId}, expires at ${expiresAt}`);
  }

  /**
   * Handle Stripe webhook for subscription updates
   */
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    console.log(`📨 Received Stripe webhook: ${event.type}`);
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.syncStripeSubscription(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionCancellation(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handleSuccessfulPayment(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handleFailedPayment(invoice);
        break;
      }
    }
  }

  /**
   * Sync Stripe subscription to local database
   */
  private async syncStripeSubscription(subscription: Stripe.Subscription): Promise<void> {
    if (!subscription.customer || typeof subscription.customer !== 'string') {
      return;
    }

    // Find user by Stripe customer ID
    const user = await this.storage.getUserByStripeCustomerId(subscription.customer);
    
    if (!user) {
      console.warn(`⚠️ User not found for Stripe customer ${subscription.customer}`);
      return;
    }

    // Determine plan ID based on subscription interval
    const planId = this.determinePlanFromStripeSubscription(subscription);
    
    if (!planId) {
      console.warn(`⚠️ Could not determine plan for subscription ${subscription.id}`);
      return;
    }

    // Update user plan with new expiration
    const sub = subscription as any;
    if (sub.current_period_end) {
      const expiresAt = new Date(sub.current_period_end * 1000);
      await this.storage.updateUserPlan(user.id, planId, expiresAt);
    }

    console.log(`✅ Synced Stripe subscription ${subscription.id} for user ${user.id}`);
  }

  /**
   * Handle subscription cancellation from Stripe
   */
  private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    if (!subscription.customer || typeof subscription.customer !== 'string') {
      return;
    }

    const user = await this.storage.getUserByStripeCustomerId(subscription.customer);
    
    if (!user) {
      return;
    }

    // Downgrade to free plan
    await this.storage.updateUserPlan(user.id, 'plan-free', null);
    
    console.log(`✅ User ${user.id} subscription cancelled, downgraded to free plan`);
  }

  /**
   * Handle successful payment from Stripe
   */
  private async handleSuccessfulPayment(invoice: Stripe.Invoice): Promise<void> {
    const inv = invoice as any;
    const subscriptionId = typeof inv.subscription === 'string' 
      ? inv.subscription 
      : inv.subscription?.id;
      
    if (!subscriptionId || !stripe) {
      return;
    }

    // Fetch full subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (subscription) {
      await this.syncStripeSubscription(subscription);
    }
  }

  /**
   * Handle failed payment from Stripe
   */
  private async handleFailedPayment(invoice: Stripe.Invoice): Promise<void> {
    console.warn(`⚠️ Payment failed for invoice ${invoice.id}`);
    // Could implement logic to notify user or retry payment
  }

  /**
   * Determine plan ID from Stripe subscription
   */
  private determinePlanFromStripeSubscription(subscription: Stripe.Subscription): string | null {
    // Check subscription interval to determine plan
    const interval = subscription.items.data[0]?.price?.recurring?.interval;
    
    if (interval === 'year') {
      return 'plan-pro-yearly';
    } else if (interval === 'month') {
      return 'plan-pro-monthly';
    }

    return null;
  }

  /**
   * Check all expired subscriptions and downgrade users
   * This should be called periodically (e.g., daily cron job)
   */
  async checkAllExpiredSubscriptions(): Promise<{
    checked: number;
    downgraded: number;
  }> {
    const users = await this.storage.getUsersWithExpiredSubscriptions();
    
    let downgraded = 0;
    
    for (const user of users) {
      const result = await this.checkAndHandleExpiredSubscription(user.id);
      if (result.downgradedToFree) {
        downgraded++;
      }
    }

    console.log(`✅ Checked ${users.length} expired subscriptions, downgraded ${downgraded} users`);
    
    return {
      checked: users.length,
      downgraded,
    };
  }
}
