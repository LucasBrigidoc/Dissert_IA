import { IStorage } from "./storage";
import { InsertUserCost, InsertUserDailyUsage, InsertBusinessMetric, UserCost } from "@shared/schema";

/**
 * Cost Tracking Service for DissertAI
 * Monitors AI usage costs and generates business metrics
 */
export class CostTrackingService {
  constructor(private storage: IStorage) {}

  /**
   * Token costs in BRL per 1000 tokens for Gemini 1.5 Flash
   * Based on current pricing: Input $0.075, Output $0.30 per 1M tokens
   * USD to BRL conversion: ~5.2 BRL per USD (approximate)
   */
  private static readonly TOKEN_COSTS = {
    input: 0.000039, // BRL per token (0.075 * 5.2 / 1000000)
    output: 0.000156, // BRL per token (0.30 * 5.2 / 1000000)
  };

  /**
   * Calculate cost in centavos (1/100 BRL) for AI operation
   */
  private calculateCostCentavos(inputTokens: number, outputTokens: number): number {
    const inputCost = inputTokens * CostTrackingService.TOKEN_COSTS.input;
    const outputCost = outputTokens * CostTrackingService.TOKEN_COSTS.output;
    const totalCostBrl = inputCost + outputCost;
    
    // Convert to centavos (R$ 0.01 = 1 centavo)
    return Math.ceil(totalCostBrl * 100);
  }

  /**
   * Track AI operation cost and usage
   */
  async trackAIOperation(params: {
    userId?: string;
    ipAddress: string;
    operation: string;
    tokensInput: number;
    tokensOutput: number;
    modelUsed?: string;
    source: "ai" | "cache" | "fallback";
    processingTime?: number;
  }): Promise<UserCost> {
    const costCentavos = this.calculateCostCentavos(params.tokensInput, params.tokensOutput);
    
    const costRecord: InsertUserCost = {
      userId: params.userId || null,
      ipAddress: params.ipAddress,
      operation: params.operation as any,
      tokensInput: params.tokensInput,
      tokensOutput: params.tokensOutput,
      costBrl: costCentavos,
      modelUsed: params.modelUsed || "gemini-1.5-flash",
      source: params.source,
      processingTime: params.processingTime || 0,
    };

    // Store individual cost record
    const savedCost = await this.storage.insertUserCost(costRecord);

    // Update daily usage summary
    await this.updateDailyUsage({
      userId: params.userId,
      ipAddress: params.ipAddress,
      operation: params.operation,
      costCentavos: costCentavos,
    });

    return savedCost;
  }

  /**
   * Update daily usage aggregation for efficient querying
   */
  private async updateDailyUsage(params: {
    userId?: string;
    ipAddress: string;
    operation: string;
    costCentavos: number;
  }): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    // Try to find existing daily usage record
    const existing = await this.storage.findUserDailyUsage(
      params.userId || null,
      params.ipAddress,
      today
    );

    if (existing) {
      // Update existing record
      const newOperationBreakdown = { ...existing.operationBreakdown as any };
      const newCostBreakdown = { ...existing.costBreakdown as any };
      
      newOperationBreakdown[params.operation] = (newOperationBreakdown[params.operation] || 0) + 1;
      newCostBreakdown[params.operation] = (newCostBreakdown[params.operation] || 0) + params.costCentavos;

      await this.storage.updateUserDailyUsage(existing.id, {
        totalOperations: (existing.totalOperations || 0) + 1,
        totalCostBrl: (existing.totalCostBrl || 0) + params.costCentavos,
        operationBreakdown: newOperationBreakdown,
        costBreakdown: newCostBreakdown,
        updatedAt: new Date(),
      });
    } else {
      // Create new daily usage record
      const dailyUsage: InsertUserDailyUsage = {
        userId: params.userId || null,
        ipAddress: params.ipAddress,
        usageDate: today,
        totalOperations: 1,
        totalCostBrl: params.costCentavos,
        operationBreakdown: { [params.operation]: 1 },
        costBreakdown: { [params.operation]: params.costCentavos },
      };

      await this.storage.insertUserDailyUsage(dailyUsage);
    }
  }

  /**
   * Generate daily business metrics summary
   */
  async generateDailyMetrics(date: Date = new Date()): Promise<void> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get metrics for the day
    const dailyStats = await this.storage.getDailyOperationStats(dayStart, dayEnd);
    const userStats = await this.storage.getUserActivityStats(30); // Last 30 days for active users
    
    const metrics: InsertBusinessMetric = {
      metricDate: dayStart,
      totalUsers: userStats.totalUsers,
      activeUsers: userStats.activeUsers,
      totalOperations: dailyStats.totalOperations,
      totalCostBrl: dailyStats.totalCost,
      avgCostPerUser: userStats.activeUsers > 0 ? Math.round(dailyStats.totalCost / userStats.activeUsers) : 0,
      cacheHitRate: Math.round(dailyStats.cacheHitRate * 10000), // Store as percentage * 100
      topOperation: dailyStats.topOperation,
      totalRevenue: 0, // Future: subscription revenue tracking
    };

    await this.storage.insertBusinessMetric(metrics);
  }

  /**
   * Get cost summary for a user/IP in a time period
   */
  async getUserCostSummary(
    identifier: { userId?: string; ipAddress?: string },
    days: number = 30
  ): Promise<{
    totalCostBrl: number;
    totalOperations: number;
    operationBreakdown: Record<string, number>;
    costBreakdown: Record<string, number>;
    averageDailyCost: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const summary = await this.storage.getUserCostSummary(identifier, startDate, endDate);
    
    return {
      totalCostBrl: summary.totalCost,
      totalOperations: summary.totalOperations,
      operationBreakdown: summary.operationBreakdown,
      costBreakdown: summary.costBreakdown,
      averageDailyCost: Math.round(summary.totalCost / days),
    };
  }

  /**
   * Get business overview metrics
   */
  async getBusinessOverview(days: number = 30): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    totalCostBrl: number;
    averageCostPerUser: number;
    topOperations: Array<{ operation: string; count: number; cost: number }>;
    dailyTrends: Array<{ date: string; operations: number; cost: number; users: number }>;
    cacheEfficiency: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const overview = await this.storage.getBusinessOverview(startDate, endDate);
    
    return overview;
  }

  /**
   * Get top cost users for monitoring
   */
  async getTopCostUsers(days: number = 7, limit: number = 20): Promise<Array<{
    userId?: string;
    ipAddress: string;
    totalCost: number;
    totalOperations: number;
    averageOperationCost: number;
    topOperation: string;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return await this.storage.getTopCostUsers(startDate, endDate, limit);
  }
}