import { IStorage } from "./storage";
import { InsertUserCost, InsertUserDailyUsage, InsertBusinessMetric, UserCost } from "@shared/schema";
import { currencyService } from "./currency-service";

/**
 * Cost Tracking Service for DissertAI
 * Monitors AI usage costs and generates business metrics with dynamic pricing
 */
export class CostTrackingService {
  constructor(private storage: IStorage) {}

  /**
   * Gemini 2.5 Flash-Lite pricing in USD per million tokens
   * Updated: December 2025 - More cost-effective model
   */
  private static readonly GEMINI_PRICING_USD = {
    input: 0.10,   // $0.10 per million tokens
    output: 0.40,  // $0.40 per million tokens
  };

  /**
   * Calculate cost in centavos (1/100 BRL) for AI operation using dynamic exchange rates
   */
  private async calculateCostCentavos(inputTokens: number, outputTokens: number): Promise<number> {
    // Calculate cost in USD first
    const inputCostUSD = (inputTokens / 1_000_000) * CostTrackingService.GEMINI_PRICING_USD.input;
    const outputCostUSD = (outputTokens / 1_000_000) * CostTrackingService.GEMINI_PRICING_USD.output;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    
    // Convert to BRL using current exchange rate
    const totalCostBRL = await currencyService.convertUSDtoBRL(totalCostUSD);
    
    // Convert to centavos (R$ 0.01 = 1 centavo)
    const centavos = Math.ceil(totalCostBRL * 100);
    
    console.log(`💰 Cost calculation: ${inputTokens} in + ${outputTokens} out = $${totalCostUSD.toFixed(4)} USD = R$ ${totalCostBRL.toFixed(4)} BRL = ${centavos} centavos`);
    
    return centavos;
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
    const costCentavos = await this.calculateCostCentavos(params.tokensInput, params.tokensOutput);
    
    const costRecord: InsertUserCost = {
      userId: params.userId || null,
      ipAddress: params.ipAddress,
      operation: params.operation as any,
      tokensInput: params.tokensInput,
      tokensOutput: params.tokensOutput,
      costBrl: costCentavos,
      modelUsed: params.modelUsed || "gemini-2.5-flash-lite",
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

  /**
   * Get current pricing information for monitoring
   */
  async getCurrentPricing(): Promise<{
    model: string;
    pricing: {
      inputUSD: number;
      outputUSD: number;
      inputBRL: number;
      outputBRL: number;
    };
    exchangeRate: {
      rate: number;
      source: string;
      date: string;
      cached: boolean;
      age: number;
    };
    costExamples: {
      small: { tokens: { input: number; output: number }; costUSD: number; costBRL: number; costCentavos: number };
      medium: { tokens: { input: number; output: number }; costUSD: number; costBRL: number; costCentavos: number };
      large: { tokens: { input: number; output: number }; costUSD: number; costBRL: number; costCentavos: number };
    };
  }> {
    const rateInfo = await currencyService.getRateInfo();
    
    // Calculate BRL costs per million tokens
    const inputBRL = await currencyService.convertUSDtoBRL(CostTrackingService.GEMINI_PRICING_USD.input);
    const outputBRL = await currencyService.convertUSDtoBRL(CostTrackingService.GEMINI_PRICING_USD.output);

    // Cost examples for different operation sizes
    const examples = [
      { name: 'small', input: 500, output: 200 },    // Small chat response
      { name: 'medium', input: 2000, output: 800 },  // Essay generation
      { name: 'large', input: 5000, output: 2000 }   // Large repertoire generation
    ];

    const costExamples: any = {};
    for (const example of examples) {
      const costUSD = (example.input / 1_000_000) * CostTrackingService.GEMINI_PRICING_USD.input + 
                     (example.output / 1_000_000) * CostTrackingService.GEMINI_PRICING_USD.output;
      const costBRL = await currencyService.convertUSDtoBRL(costUSD);
      const costCentavos = Math.ceil(costBRL * 100);
      
      costExamples[example.name] = {
        tokens: { input: example.input, output: example.output },
        costUSD: parseFloat(costUSD.toFixed(6)),
        costBRL: parseFloat(costBRL.toFixed(4)),
        costCentavos
      };
    }

    return {
      model: "gemini-2.5-flash-lite",
      pricing: {
        inputUSD: CostTrackingService.GEMINI_PRICING_USD.input,
        outputUSD: CostTrackingService.GEMINI_PRICING_USD.output,
        inputBRL: parseFloat(inputBRL.toFixed(4)),
        outputBRL: parseFloat(outputBRL.toFixed(4))
      },
      exchangeRate: rateInfo,
      costExamples
    };
  }

  /**
   * Estimate cost for a planned operation
   */
  async estimateOperationCost(inputTokens: number, outputTokens: number): Promise<{
    tokens: { input: number; output: number };
    costs: {
      usd: number;
      brl: number;
      centavos: number;
    };
    breakdown: {
      inputUSD: number;
      outputUSD: number;
      inputBRL: number;
      outputBRL: number;
    };
  }> {
    const inputCostUSD = (inputTokens / 1_000_000) * CostTrackingService.GEMINI_PRICING_USD.input;
    const outputCostUSD = (outputTokens / 1_000_000) * CostTrackingService.GEMINI_PRICING_USD.output;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    
    const inputCostBRL = await currencyService.convertUSDtoBRL(inputCostUSD);
    const outputCostBRL = await currencyService.convertUSDtoBRL(outputCostUSD);
    const totalCostBRL = await currencyService.convertUSDtoBRL(totalCostUSD);
    const totalCostCentavos = Math.ceil(totalCostBRL * 100);

    return {
      tokens: { input: inputTokens, output: outputTokens },
      costs: {
        usd: parseFloat(totalCostUSD.toFixed(6)),
        brl: parseFloat(totalCostBRL.toFixed(4)),
        centavos: totalCostCentavos
      },
      breakdown: {
        inputUSD: parseFloat(inputCostUSD.toFixed(6)),
        outputUSD: parseFloat(outputCostUSD.toFixed(6)),
        inputBRL: parseFloat(inputCostBRL.toFixed(4)),
        outputBRL: parseFloat(outputCostBRL.toFixed(4))
      }
    };
  }
}