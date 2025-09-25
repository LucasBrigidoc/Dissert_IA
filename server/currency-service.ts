import { createHash } from "crypto";

interface ExchangeRateResponse {
  rates: {
    BRL: number;
  };
  date: string;
}

interface CachedRate {
  rate: number;
  timestamp: number;
  source: string;
  date: string;
}

/**
 * Currency Service for automatic USD to BRL conversion
 * Uses free APIs with intelligent fallback and caching
 */
export class CurrencyService {
  private cachedRate: CachedRate | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
  private readonly FALLBACK_RATE = 5.33; // Safe fallback rate (Sept 2025 average)
  
  private readonly APIs = [
    {
      name: 'Frankfurter',
      url: 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL',
      parseResponse: (data: any) => ({
        rate: data.rates.BRL,
        date: data.date,
        source: 'Frankfurter'
      })
    },
    {
      name: 'ExchangeRate-Host',
      url: 'https://api.exchangerate.host/latest?base=USD&symbols=BRL',
      parseResponse: (data: any) => ({
        rate: data.rates.BRL,
        date: data.date,
        source: 'ExchangeRate-Host'
      })
    }
  ];

  /**
   * Get current USD to BRL exchange rate with intelligent caching
   */
  async getUSDtoBRL(): Promise<number> {
    // Return cached rate if still valid
    if (this.cachedRate && this.isRateValid()) {
      console.log(`💰 Using cached USD/BRL rate: ${this.cachedRate.rate} (${this.cachedRate.source})`);
      return this.cachedRate.rate;
    }

    // Try to fetch fresh rate
    const freshRate = await this.fetchFreshRate();
    if (freshRate) {
      this.cachedRate = {
        rate: freshRate.rate,
        timestamp: Date.now(),
        source: freshRate.source,
        date: freshRate.date
      };
      console.log(`💰 Fetched fresh USD/BRL rate: ${freshRate.rate} (${freshRate.source} - ${freshRate.date})`);
      return freshRate.rate;
    }

    // Use fallback if fresh fetch failed
    if (this.cachedRate) {
      console.log(`⚠️ Using stale cached USD/BRL rate: ${this.cachedRate.rate} (${this.cachedRate.source})`);
      return this.cachedRate.rate;
    }

    console.log(`🚨 Using fallback USD/BRL rate: ${this.FALLBACK_RATE}`);
    return this.FALLBACK_RATE;
  }

  /**
   * Convert USD amount to BRL using current exchange rate
   */
  async convertUSDtoBRL(usdAmount: number): Promise<number> {
    const rate = await this.getUSDtoBRL();
    return usdAmount * rate;
  }

  /**
   * Get detailed rate information for monitoring
   */
  async getRateInfo(): Promise<{
    rate: number;
    source: string;
    date: string;
    cached: boolean;
    age: number;
  }> {
    const rate = await this.getUSDtoBRL();
    
    return {
      rate,
      source: this.cachedRate?.source || 'fallback',
      date: this.cachedRate?.date || new Date().toISOString().split('T')[0],
      cached: this.cachedRate !== null && this.isRateValid(),
      age: this.cachedRate ? Date.now() - this.cachedRate.timestamp : 0
    };
  }

  /**
   * Force refresh the exchange rate (useful for testing)
   */
  async forceRefresh(): Promise<number> {
    this.cachedRate = null;
    return await this.getUSDtoBRL();
  }

  private isRateValid(): boolean {
    if (!this.cachedRate) return false;
    return (Date.now() - this.cachedRate.timestamp) < this.CACHE_TTL;
  }

  private async fetchFreshRate(): Promise<{rate: number, source: string, date: string} | null> {
    for (const api of this.APIs) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(api.url, { 
          signal: controller.signal,
          headers: {
            'User-Agent': 'DissertAI/1.0'
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const parsed = api.parseResponse(data);
        
        // Validate rate is reasonable (between 3-10 BRL per USD)
        if (parsed.rate >= 3 && parsed.rate <= 10) {
          return parsed;
        } else {
          throw new Error(`Invalid rate: ${parsed.rate}`);
        }

      } catch (error) {
        console.log(`⚠️ ${api.name} API failed:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return null;
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();