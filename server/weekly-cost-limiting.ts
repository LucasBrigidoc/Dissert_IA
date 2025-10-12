import { IStorage } from "./storage";
import { InsertWeeklyUsage, WeeklyUsage } from "@shared/schema";
import { currencyService } from "./currency-service";

/**
 * Cost Limiting Service for DissertAI
 * Manages AI usage limits with different periods for each plan:
 * - Free plan: R$0.90 (90 centavos) every 15 days
 * - Pro plan: R$5.00 (500 centavos) every 7 days
 */
export class WeeklyCostLimitingService {
  constructor(private storage: IStorage) {}

  /**
   * Plan limits and periods
   */
  private static readonly PLAN_LIMITS = {
    free: {
      limitCentavos: 90,  // R$0.90
      periodDays: 15       // Reset every 15 days
    },
    pro: {
      limitCentavos: 500,  // R$5.00
      periodDays: 7        // Reset every 7 days (weekly)
    }
  };

  /**
   * Get start of current period based on plan type
   * Free: 15-day periods starting from first day of month
   * Pro: 7-day periods (weekly, Monday 00:00:00)
   */
  private getPeriodStart(planType: 'free' | 'pro', date: Date = new Date()): Date {
    const periodStart = new Date(date);
    
    if (planType === 'pro') {
      // Pro: Weekly periods starting Monday
      const dayOfWeek = periodStart.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      periodStart.setDate(periodStart.getDate() - daysToMonday);
    } else {
      // Free: 15-day periods
      // Calculate which period we're in (0-based from start of month)
      const dayOfMonth = periodStart.getDate();
      const periodIndex = Math.floor((dayOfMonth - 1) / 15);
      const periodStartDay = (periodIndex * 15) + 1;
      periodStart.setDate(periodStartDay);
    }
    
    periodStart.setHours(0, 0, 0, 0);
    return periodStart;
  }

  /**
   * Get period duration in days for a plan
   */
  private getPeriodDays(planType: 'free' | 'pro'): number {
    return WeeklyCostLimitingService.PLAN_LIMITS[planType].periodDays;
  }

  /**
   * Get cost limit in centavos for a plan
   */
  private getLimitCentavos(planType: 'free' | 'pro'): number {
    return WeeklyCostLimitingService.PLAN_LIMITS[planType].limitCentavos;
  }

  /**
   * Get or create usage record for current period
   */
  private async getOrCreateUsageRecord(identifier: string, planType: 'free' | 'pro'): Promise<WeeklyUsage> {
    const periodStart = this.getPeriodStart(planType);
    
    // Try to find existing usage record for this period
    const existing = await this.storage.findWeeklyUsage(identifier, periodStart);
    
    if (existing) {
      return existing;
    }

    // Create new usage record for this period
    const newUsage: InsertWeeklyUsage = {
      identifier,
      weekStart: periodStart,
      totalCostCentavos: 0,
      operationCount: 0,
      operationBreakdown: {},
      costBreakdown: {},
      lastOperation: new Date(),
    };

    return await this.storage.insertWeeklyUsage(newUsage);
  }

  /**
   * Check if operation is allowed within cost limit for plan
   */
  async checkWeeklyCostLimit(
    identifier: string,
    estimatedCostCentavos: number,
    planType: 'free' | 'pro'
  ): Promise<{
    allowed: boolean;
    currentUsageCentavos: number;
    limitCentavos: number;
    remainingCentavos: number;
    remainingPercentage: number;
    weekStart: Date;
    weekEnd: Date;
    daysUntilReset: number;
  }> {
    const periodStart = this.getPeriodStart(planType);
    const usageRecord = await this.storage.findWeeklyUsage(identifier, periodStart);
    const currentUsage = usageRecord?.totalCostCentavos || 0;
    const projectedUsage = currentUsage + estimatedCostCentavos;
    const periodEnd = new Date(periodStart);
    
    if (planType === 'free' && periodStart.getDate() >= 16) {
      // For free plan second period (16-end), set to last day of month
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(1);
      periodEnd.setHours(0, 0, 0, 0);
    } else {
      // For pro plan or free plan first period, add period days
      periodEnd.setDate(periodEnd.getDate() + this.getPeriodDays(planType));
    }
    
    const now = new Date();
    const msUntilReset = periodEnd.getTime() - now.getTime();
    const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));
    
    const limitCentavos = this.getLimitCentavos(planType);
    const remaining = Math.max(0, limitCentavos - currentUsage);
    const percentage = Math.min(100, (currentUsage / limitCentavos) * 100);

    return {
      allowed: projectedUsage <= limitCentavos,
      currentUsageCentavos: currentUsage,
      limitCentavos,
      remainingCentavos: remaining,
      remainingPercentage: Math.max(0, 100 - percentage),
      weekStart: periodStart,
      weekEnd: periodEnd,
      daysUntilReset
    };
  }

  /**
   * Gemini 2.5 Flash pricing in USD per million tokens
   */
  private static readonly GEMINI_PRICING_USD = {
    input: 0.30,   // $0.30 per million tokens
    output: 2.50,  // $2.50 per million tokens
  };

  /**
   * Calculate cost in centavos (1/100 BRL) for AI operation using dynamic exchange rates
   */
  private async calculateCostCentavos(inputTokens: number, outputTokens: number): Promise<number> {
    // Calculate cost in USD first
    const inputCostUSD = (inputTokens / 1_000_000) * WeeklyCostLimitingService.GEMINI_PRICING_USD.input;
    const outputCostUSD = (outputTokens / 1_000_000) * WeeklyCostLimitingService.GEMINI_PRICING_USD.output;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    
    // Convert to BRL using current exchange rate
    const totalCostBRL = await currencyService.convertUSDtoBRL(totalCostUSD);
    
    // Convert to centavos (R$ 0.01 = 1 centavo)
    const centavos = Math.ceil(totalCostBRL * 100);
    
    console.log(`💰 Cost calculation: ${inputTokens} in + ${outputTokens} out = $${totalCostUSD.toFixed(6)} USD = R$ ${totalCostBRL.toFixed(4)} BRL = ${centavos} centavos`);
    
    return centavos;
  }

  /**
   * Record AI operation with real token usage and calculate actual cost
   */
  async recordAIOperationWithTokens(
    identifier: string,
    operation: string,
    tokensInput: number,
    tokensOutput: number,
    planType: 'free' | 'pro'
  ): Promise<{
    success: boolean;
    newUsage: WeeklyUsage;
    costCentavos: number;
    usageStats: {
      currentUsageCentavos: number;
      limitCentavos: number;
      remainingCentavos: number;
      usagePercentage: number;
    };
  }> {
    // Calculate real cost based on actual token usage
    const costCentavos = await this.calculateCostCentavos(tokensInput, tokensOutput);
    
    const periodStart = this.getPeriodStart(planType);
    
    // Use UPSERT to avoid race conditions and duplicates
    const operationBreakdown: Record<string, number> = {};
    operationBreakdown[operation] = 1;
    
    const costBreakdown: Record<string, number> = {};
    costBreakdown[operation] = costCentavos;

    // UPSERT: Insert or update atomically
    const updatedUsage = await this.storage.upsertWeeklyUsage({
      identifier,
      weekStart: periodStart,
      totalCostCentavos: costCentavos,
      operationCount: 1,
      operationBreakdown,
      costBreakdown,
      lastOperation: new Date(),
    });

    const limitCentavos = this.getLimitCentavos(planType);
    const totalCost = updatedUsage.totalCostCentavos || 0;
    const usagePercentage = Math.min(100, (totalCost / limitCentavos) * 100);
    const remaining = Math.max(0, limitCentavos - totalCost);

    return {
      success: true,
      newUsage: updatedUsage,
      costCentavos,
      usageStats: {
        currentUsageCentavos: totalCost,
        limitCentavos,
        remainingCentavos: remaining,
        usagePercentage
      }
    };
  }

  /**
   * Record AI operation cost and update usage (deprecated - use recordAIOperationWithTokens instead)
   */
  async recordAIOperation(
    identifier: string,
    operation: string,
    costCentavos: number,
    planType: 'free' | 'pro'
  ): Promise<{
    success: boolean;
    newUsage: WeeklyUsage;
    usageStats: {
      currentUsageCentavos: number;
      limitCentavos: number;
      remainingCentavos: number;
      usagePercentage: number;
    };
  }> {
    const periodStart = this.getPeriodStart(planType);
    
    // Use UPSERT to avoid race conditions
    const operationBreakdown: Record<string, number> = {};
    operationBreakdown[operation] = 1;
    
    const costBreakdown: Record<string, number> = {};
    costBreakdown[operation] = costCentavos;

    const updatedUsage = await this.storage.upsertWeeklyUsage({
      identifier,
      weekStart: periodStart,
      totalCostCentavos: costCentavos,
      operationCount: 1,
      operationBreakdown,
      costBreakdown,
      lastOperation: new Date(),
    });

    const limitCentavos = this.getLimitCentavos(planType);
    const totalCost = updatedUsage.totalCostCentavos || 0;
    const usagePercentage = Math.min(100, (totalCost / limitCentavos) * 100);
    const remaining = Math.max(0, limitCentavos - totalCost);

    return {
      success: true,
      newUsage: updatedUsage,
      usageStats: {
        currentUsageCentavos: totalCost,
        limitCentavos,
        remainingCentavos: remaining,
        usagePercentage
      }
    };
  }

  /**
   * Get current usage stats for display
   */
  async getWeeklyUsageStats(identifier: string, planType: 'free' | 'pro'): Promise<{
    currentUsageCentavos: number;
    limitCentavos: number;
    remainingCentavos: number;
    usagePercentage: number;
    remainingPercentage: number;
    operationCount: number;
    operationBreakdown: Record<string, number>;
    costBreakdown: Record<string, number>;
    weekStart: Date;
    weekEnd: Date;
    daysUntilReset: number;
    formattedUsage: {
      currentBRL: string;
      limitBRL: string;
      remainingBRL: string;
    };
  }> {
    const periodStart = this.getPeriodStart(planType);
    const usageRecord = await this.storage.findWeeklyUsage(identifier, periodStart);
    const currentUsage = usageRecord?.totalCostCentavos || 0;
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + this.getPeriodDays(planType));
    
    const now = new Date();
    const msUntilReset = periodEnd.getTime() - now.getTime();
    const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));
    
    const limitCentavos = this.getLimitCentavos(planType);
    const remaining = Math.max(0, limitCentavos - currentUsage);
    const usagePercentage = Math.min(100, (currentUsage / limitCentavos) * 100);
    const remainingPercentage = Math.max(0, 100 - usagePercentage);

    // Format values to BRL for display
    const formatCentavosToBRL = (centavos: number): string => {
      return `R$ ${(centavos / 100).toFixed(2)}`;
    };

    return {
      currentUsageCentavos: currentUsage,
      limitCentavos,
      remainingCentavos: remaining,
      usagePercentage,
      remainingPercentage,
      operationCount: usageRecord?.operationCount || 0,
      operationBreakdown: (usageRecord?.operationBreakdown as any) || {},
      costBreakdown: (usageRecord?.costBreakdown as any) || {},
      weekStart: periodStart,
      weekEnd: periodEnd,
      daysUntilReset,
      formattedUsage: {
        currentBRL: formatCentavosToBRL(currentUsage),
        limitBRL: formatCentavosToBRL(limitCentavos),
        remainingBRL: formatCentavosToBRL(remaining)
      }
    };
  }

  /**
   * Estimate cost for operation before execution
   */
  async estimateOperationCost(inputTokens: number, outputTokens: number): Promise<{
    estimatedCostCentavos: number;
    estimatedCostBRL: string;
    breakdown: {
      inputCostCentavos: number;
      outputCostCentavos: number;
    };
  }> {
    // Gemini 2.5 Flash-lite pricing: $0.10 input, $0.40 output per million tokens
    const inputCostUSD = (inputTokens / 1_000_000) * 0.10;
    const outputCostUSD = (outputTokens / 1_000_000) * 0.40;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    
    // Convert to BRL and then to centavos
    const totalCostBRL = await currencyService.convertUSDtoBRL(totalCostUSD);
    const inputCostBRL = await currencyService.convertUSDtoBRL(inputCostUSD);
    const outputCostBRL = await currencyService.convertUSDtoBRL(outputCostUSD);
    
    const totalCostCentavos = Math.ceil(totalCostBRL * 100);
    const inputCostCentavos = Math.ceil(inputCostBRL * 100);
    const outputCostCentavos = Math.ceil(outputCostBRL * 100);

    return {
      estimatedCostCentavos: totalCostCentavos,
      estimatedCostBRL: `R$ ${totalCostBRL.toFixed(2)}`,
      breakdown: {
        inputCostCentavos,
        outputCostCentavos
      }
    };
  }

  /**
   * Get usage analytics for monitoring
   */
  async getUsageAnalytics(identifier: string, planType: 'free' | 'pro', weeks: number = 4): Promise<{
    weeklyHistory: Array<{
      weekStart: Date;
      weekEnd: Date;
      totalCostCentavos: number;
      operationCount: number;
      costBRL: string;
      utilizationPercentage: number;
    }>;
    averageWeeklyCost: number;
    peakUsageWeek: {
      weekStart: Date;
      costCentavos: number;
      utilizationPercentage: number;
    } | null;
    totalCostPeriod: number;
  }> {
    const history = await this.storage.getWeeklyUsageHistory(identifier, weeks);
    const limitCentavos = this.getLimitCentavos(planType);
    const periodDays = this.getPeriodDays(planType);
    
    const weeklyHistory = history.map((usage: WeeklyUsage) => {
      const weekEnd = new Date(usage.weekStart);
      weekEnd.setDate(weekEnd.getDate() + periodDays);
      
      const utilizationPercentage = ((usage.totalCostCentavos || 0) / limitCentavos) * 100;
      
      return {
        weekStart: usage.weekStart,
        weekEnd,
        totalCostCentavos: usage.totalCostCentavos || 0,
        operationCount: usage.operationCount || 0,
        costBRL: `R$ ${((usage.totalCostCentavos || 0) / 100).toFixed(2)}`,
        utilizationPercentage
      };
    });

    const totalCostPeriod = history.reduce((sum: number, usage: WeeklyUsage) => sum + (usage.totalCostCentavos || 0), 0);
    const averageWeeklyCost = history.length > 0 ? totalCostPeriod / history.length : 0;
    
    const peakUsage = history.reduce((peak: WeeklyUsage | null, current: WeeklyUsage) => {
      if (!peak || (current.totalCostCentavos || 0) > (peak.totalCostCentavos || 0)) {
        return current;
      }
      return peak;
    }, null as WeeklyUsage | null);

    const peakUsageWeek = peakUsage ? {
      weekStart: peakUsage.weekStart,
      costCentavos: peakUsage.totalCostCentavos || 0,
      utilizationPercentage: ((peakUsage.totalCostCentavos || 0) / limitCentavos) * 100
    } : null;

    return {
      weeklyHistory,
      averageWeeklyCost,
      peakUsageWeek,
      totalCostPeriod
    };
  }
}