import { IStorage } from "./storage";
import { InsertWeeklyUsage, WeeklyUsage } from "@shared/schema";
import { currencyService } from "./currency-service";

/**
 * Weekly Cost Limiting Service for DissertAI
 * Manages unified weekly AI usage limits based on cost (R$8.75/week = R$35/month)
 */
export class WeeklyCostLimitingService {
  constructor(private storage: IStorage) {}

  /**
   * Weekly cost limit in centavos (R$8.75 = 875 centavos)
   * This ensures monthly limit stays at R$35 (4 weeks × R$8.75 = R$35)
   */
  private static readonly WEEKLY_COST_LIMIT_CENTAVOS = 875; // R$8.75

  /**
   * Get start of current week (Monday 00:00:00)
   */
  private getWeekStart(date: Date = new Date()): Date {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    
    weekStart.setDate(weekStart.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    return weekStart;
  }

  /**
   * Get or create weekly usage record
   */
  private async getOrCreateWeeklyUsage(identifier: string): Promise<WeeklyUsage> {
    const weekStart = this.getWeekStart();
    
    // Try to find existing weekly usage
    const existing = await this.storage.findWeeklyUsage(identifier, weekStart);
    
    if (existing) {
      return existing;
    }

    // Create new weekly usage record
    const newUsage: InsertWeeklyUsage = {
      identifier,
      weekStart,
      totalCostCentavos: 0,
      operationCount: 0,
      operationBreakdown: {},
      costBreakdown: {},
      lastOperation: new Date(),
    };

    return await this.storage.insertWeeklyUsage(newUsage);
  }

  /**
   * Check if operation is allowed within weekly cost limit
   */
  async checkWeeklyCostLimit(
    identifier: string,
    estimatedCostCentavos: number
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
    const weeklyUsage = await this.getOrCreateWeeklyUsage(identifier);
    const currentUsage = weeklyUsage.totalCostCentavos || 0;
    const projectedUsage = currentUsage + estimatedCostCentavos;
    
    const weekStart = this.getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const now = new Date();
    const msUntilReset = weekEnd.getTime() - now.getTime();
    const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));
    
    const remaining = Math.max(0, WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS - currentUsage);
    const percentage = Math.min(100, (currentUsage / WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS) * 100);

    return {
      allowed: projectedUsage <= WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS,
      currentUsageCentavos: currentUsage,
      limitCentavos: WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS,
      remainingCentavos: remaining,
      remainingPercentage: Math.max(0, 100 - percentage),
      weekStart,
      weekEnd,
      daysUntilReset
    };
  }

  /**
   * Record AI operation cost and update weekly usage
   */
  async recordAIOperation(
    identifier: string,
    operation: string,
    costCentavos: number
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
    const weeklyUsage = await this.getOrCreateWeeklyUsage(identifier);
    
    // Update usage counters
    const newTotalCost = (weeklyUsage.totalCostCentavos || 0) + costCentavos;
    const newOperationCount = (weeklyUsage.operationCount || 0) + 1;
    
    const operationBreakdown = { ...(weeklyUsage.operationBreakdown as any || {}) };
    const costBreakdown = { ...(weeklyUsage.costBreakdown as any || {}) };
    
    operationBreakdown[operation] = (operationBreakdown[operation] || 0) + 1;
    costBreakdown[operation] = (costBreakdown[operation] || 0) + costCentavos;

    // Update the weekly usage record
    const updatedUsage = await this.storage.updateWeeklyUsage(weeklyUsage.id, {
      totalCostCentavos: newTotalCost,
      operationCount: newOperationCount,
      operationBreakdown,
      costBreakdown,
      lastOperation: new Date(),
    });

    const usagePercentage = Math.min(100, (newTotalCost / WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS) * 100);
    const remaining = Math.max(0, WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS - newTotalCost);

    return {
      success: true,
      newUsage: updatedUsage,
      usageStats: {
        currentUsageCentavos: newTotalCost,
        limitCentavos: WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS,
        remainingCentavos: remaining,
        usagePercentage
      }
    };
  }

  /**
   * Get current weekly usage stats for display
   */
  async getWeeklyUsageStats(identifier: string): Promise<{
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
    const weeklyUsage = await this.getOrCreateWeeklyUsage(identifier);
    const currentUsage = weeklyUsage.totalCostCentavos || 0;
    
    const weekStart = this.getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const now = new Date();
    const msUntilReset = weekEnd.getTime() - now.getTime();
    const daysUntilReset = Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));
    
    const remaining = Math.max(0, WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS - currentUsage);
    const usagePercentage = Math.min(100, (currentUsage / WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS) * 100);
    const remainingPercentage = Math.max(0, 100 - usagePercentage);

    // Format values to BRL for display
    const formatCentavosToBRL = (centavos: number): string => {
      return `R$ ${(centavos / 100).toFixed(2)}`;
    };

    return {
      currentUsageCentavos: currentUsage,
      limitCentavos: WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS,
      remainingCentavos: remaining,
      usagePercentage,
      remainingPercentage,
      operationCount: weeklyUsage.operationCount || 0,
      operationBreakdown: weeklyUsage.operationBreakdown as any || {},
      costBreakdown: weeklyUsage.costBreakdown as any || {},
      weekStart,
      weekEnd,
      daysUntilReset,
      formattedUsage: {
        currentBRL: formatCentavosToBRL(currentUsage),
        limitBRL: formatCentavosToBRL(WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS),
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
  async getUsageAnalytics(identifier: string, weeks: number = 4): Promise<{
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
    
    const weeklyHistory = history.map((usage: WeeklyUsage) => {
      const weekEnd = new Date(usage.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const utilizationPercentage = ((usage.totalCostCentavos || 0) / WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS) * 100;
      
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
      utilizationPercentage: ((peakUsage.totalCostCentavos || 0) / WeeklyCostLimitingService.WEEKLY_COST_LIMIT_CENTAVOS) * 100
    } : null;

    return {
      weeklyHistory,
      averageWeeklyCost,
      peakUsageWeek,
      totalCostPeriod
    };
  }
}