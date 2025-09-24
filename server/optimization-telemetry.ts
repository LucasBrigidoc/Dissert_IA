interface OptimizationMetric {
  route: string;
  operation: string;
  tokensOriginal: number;
  tokensOptimized: number;
  tokensSaved: number;
  percentageSaved: number;
  cacheHit: boolean;
  source: 'cache' | 'optimized_ai' | 'fallback' | 'fallback_error';
  timestamp: Date;
  responseTime: number;
}

interface TelemetryStats {
  totalRequests: number;
  totalTokensSaved: number;
  averageTokensSaved: number;
  cacheHitRate: number;
  routeBreakdown: Record<string, {
    requests: number;
    tokensSaved: number;
    averageSavings: number;
    cacheHits: number;
  }>;
  optimizationSources: Record<string, number>;
  last24Hours: {
    requests: number;
    tokensSaved: number;
    cacheHits: number;
  };
}

class OptimizationTelemetry {
  private metrics: OptimizationMetric[] = [];
  private readonly MAX_METRICS = 10000; // Keep only last 10k metrics
  
  constructor() {
    // Clean old metrics every hour
    setInterval(() => {
      this.cleanOldMetrics();
    }, 60 * 60 * 1000);
  }

  // Record a new optimization metric
  recordMetric(data: {
    route: string;
    operation: string;
    tokensOriginal: number;
    tokensOptimized: number;
    cacheHit: boolean;
    source: OptimizationMetric['source'];
    responseTime: number;
  }) {
    const tokensSaved = Math.max(0, data.tokensOriginal - data.tokensOptimized);
    const percentageSaved = data.tokensOriginal > 0 
      ? Math.round((tokensSaved / data.tokensOriginal) * 100)
      : 0;

    const metric: OptimizationMetric = {
      route: data.route,
      operation: data.operation,
      tokensOriginal: data.tokensOriginal,
      tokensOptimized: data.tokensOptimized,
      tokensSaved,
      percentageSaved,
      cacheHit: data.cacheHit,
      source: data.source,
      timestamp: new Date(),
      responseTime: data.responseTime
    };

    this.metrics.push(metric);

    // Keep metrics array bounded
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    console.log(`📊 TELEMETRY: ${data.route} - ${data.operation} | ${tokensSaved} tokens saved (${percentageSaved}%) | Source: ${data.source} | ${data.responseTime}ms`);
  }

  // Get comprehensive statistics
  getStats(): TelemetryStats {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const totalRequests = this.metrics.length;
    const totalTokensSaved = this.metrics.reduce((sum, m) => sum + m.tokensSaved, 0);
    const averageTokensSaved = totalRequests > 0 ? Math.round(totalTokensSaved / totalRequests) : 0;
    
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0;

    // Route breakdown
    const routeBreakdown: Record<string, any> = {};
    this.metrics.forEach(metric => {
      const key = `${metric.route}_${metric.operation}`;
      if (!routeBreakdown[key]) {
        routeBreakdown[key] = {
          requests: 0,
          tokensSaved: 0,
          cacheHits: 0
        };
      }
      routeBreakdown[key].requests++;
      routeBreakdown[key].tokensSaved += metric.tokensSaved;
      if (metric.cacheHit) routeBreakdown[key].cacheHits++;
    });

    // Calculate averages for route breakdown
    Object.keys(routeBreakdown).forEach(key => {
      const data = routeBreakdown[key];
      data.averageSavings = data.requests > 0 ? Math.round(data.tokensSaved / data.requests) : 0;
    });

    // Source breakdown
    const optimizationSources: Record<string, number> = {};
    this.metrics.forEach(metric => {
      optimizationSources[metric.source] = (optimizationSources[metric.source] || 0) + 1;
    });

    // Last 24 hours stats
    const recent24h = this.metrics.filter(m => m.timestamp >= last24Hours);
    const last24Hours_stats = {
      requests: recent24h.length,
      tokensSaved: recent24h.reduce((sum, m) => sum + m.tokensSaved, 0),
      cacheHits: recent24h.filter(m => m.cacheHit).length
    };

    return {
      totalRequests,
      totalTokensSaved,
      averageTokensSaved,
      cacheHitRate,
      routeBreakdown,
      optimizationSources,
      last24Hours: last24Hours_stats
    };
  }

  // Get detailed metrics for a specific route
  getRouteMetrics(route: string, operation?: string): OptimizationMetric[] {
    return this.metrics.filter(m => {
      if (m.route !== route) return false;
      if (operation && m.operation !== operation) return false;
      return true;
    });
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalTokensSaved: number;
    estimatedCostSavings: number;
    averageResponseTime: number;
    bestPerformingRoute: string;
    cacheEfficiency: number;
  } {
    const stats = this.getStats();
    
    // Estimate cost savings (approximate: $0.000002 per token for Gemini 1.5 Flash)
    const estimatedCostSavings = stats.totalTokensSaved * 0.000002;
    
    const avgResponseTime = this.metrics.length > 0
      ? Math.round(this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length)
      : 0;

    // Find best performing route
    let bestRoute = 'none';
    let bestSavings = 0;
    Object.entries(stats.routeBreakdown).forEach(([route, data]) => {
      if (data.tokensSaved > bestSavings) {
        bestSavings = data.tokensSaved;
        bestRoute = route;
      }
    });

    return {
      totalTokensSaved: stats.totalTokensSaved,
      estimatedCostSavings: Math.round(estimatedCostSavings * 100) / 100,
      averageResponseTime: avgResponseTime,
      bestPerformingRoute: bestRoute,
      cacheEfficiency: stats.cacheHitRate
    };
  }

  // Clean old metrics (keep only last 7 days)
  private cleanOldMetrics() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    
    const beforeCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    const afterCount = this.metrics.length;
    
    if (beforeCount > afterCount) {
      console.log(`🧹 TELEMETRY: Cleaned ${beforeCount - afterCount} old metrics (keeping ${afterCount})`);
    }
  }

  // Generate optimization report
  generateReport(): string {
    const stats = this.getStats();
    const performance = this.getPerformanceSummary();
    
    let report = '\n📊 OPTIMIZATION TELEMETRY REPORT\n';
    report += '═══════════════════════════════════\n\n';
    
    report += '🎯 OVERALL PERFORMANCE:\n';
    report += `  • Total Requests: ${stats.totalRequests}\n`;
    report += `  • Total Tokens Saved: ${stats.totalTokensSaved.toLocaleString()}\n`;
    report += `  • Average Tokens Saved: ${stats.averageTokensSaved}/request\n`;
    report += `  • Estimated Cost Savings: $${performance.estimatedCostSavings}\n`;
    report += `  • Cache Hit Rate: ${stats.cacheHitRate}%\n`;
    report += `  • Average Response Time: ${performance.averageResponseTime}ms\n\n`;
    
    report += '📈 LAST 24 HOURS:\n';
    report += `  • Requests: ${stats.last24Hours.requests}\n`;
    report += `  • Tokens Saved: ${stats.last24Hours.tokensSaved.toLocaleString()}\n`;
    report += `  • Cache Hits: ${stats.last24Hours.cacheHits}\n\n`;
    
    report += '🚀 ROUTE BREAKDOWN:\n';
    Object.entries(stats.routeBreakdown).forEach(([route, data]) => {
      const cacheRate = data.requests > 0 ? Math.round((data.cacheHits / data.requests) * 100) : 0;
      report += `  • ${route}: ${data.requests} req, ${data.tokensSaved} tokens saved (avg: ${data.averageSavings}), ${cacheRate}% cache\n`;
    });
    
    report += '\n💾 SOURCE DISTRIBUTION:\n';
    Object.entries(stats.optimizationSources).forEach(([source, count]) => {
      const percentage = Math.round((count / stats.totalRequests) * 100);
      report += `  • ${source}: ${count} (${percentage}%)\n`;
    });
    
    return report;
  }
}

// Singleton instance
export const optimizationTelemetry = new OptimizationTelemetry();

// Helper function to wrap API routes with telemetry
export function withTelemetry(route: string, operation: string) {
  return (originalFunction: Function) => {
    return async (...args: any[]) => {
      const startTime = Date.now();
      
      try {
        const result = await originalFunction(...args);
        const endTime = Date.now();
        
        // Extract metrics from result if available
        const tokensOriginal = result?.tokensOriginal || 1000; // Estimated
        const tokensOptimized = result?.tokensUsed || result?.tokensSaved || 300; // Estimated
        const cacheHit = result?.source === 'cache';
        const source = result?.source || 'optimized_ai';
        
        optimizationTelemetry.recordMetric({
          route,
          operation,
          tokensOriginal,
          tokensOptimized,
          cacheHit,
          source,
          responseTime: endTime - startTime
        });
        
        return result;
      } catch (error) {
        const endTime = Date.now();
        
        // Record fallback metrics
        optimizationTelemetry.recordMetric({
          route,
          operation,
          tokensOriginal: 1000,
          tokensOptimized: 0,
          cacheHit: false,
          source: 'fallback_error',
          responseTime: endTime - startTime
        });
        
        throw error;
      }
    };
  };
}