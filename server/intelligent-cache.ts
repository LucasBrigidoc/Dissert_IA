import { createHash } from "crypto";
import type { TextModificationResult, Repertoire } from "@shared/schema";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  quality: number;
}

interface SemanticCacheEntry {
  hash: string;
  content: string;
  result: any;
  timestamp: number;
  useCount: number;
  quality: number;
}

export class IntelligentCache {
  // Multi-layer cache system
  private userSessionCache = new Map<string, CacheEntry<any>>();
  private globalSemanticCache = new Map<string, SemanticCacheEntry>();
  private templateCache = new Map<string, any>();
  private repertoireCache = new Map<string, Repertoire[]>();
  
  // Cache configuration
  private readonly SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly SEMANTIC_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly TEMPLATE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly MAX_CACHE_SIZE = 1000;

  // Generate semantic hash for content similarity
  private generateSemanticHash(content: string, type: string, config?: any): string {
    const normalized = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const configStr = config ? JSON.stringify(config, Object.keys(config).sort()) : '';
    const hashInput = `${type}_${normalized}_${configStr}`;
    
    return createHash('md5').update(hashInput).digest('hex').substring(0, 16);
  }

  // Get from multi-layer cache
  getTextModification(text: string, type: string, config: any, userId?: string): TextModificationResult | null {
    // 1. Check user session cache first (fastest)
    if (userId) {
      const sessionKey = `${userId}_${type}_${this.generateSemanticHash(text, type, config)}`;
      const sessionEntry = this.userSessionCache.get(sessionKey);
      
      if (sessionEntry && (Date.now() - sessionEntry.timestamp) < this.SESSION_TTL) {
        sessionEntry.accessCount++;
        sessionEntry.lastAccess = Date.now();
        return { ...sessionEntry.data, source: 'session_cache' };
      }
    }

    // 2. Check global semantic cache
    const semanticHash = this.generateSemanticHash(text, type, config);
    const semanticEntry = this.globalSemanticCache.get(semanticHash);
    
    if (semanticEntry && (Date.now() - semanticEntry.timestamp) < this.SEMANTIC_TTL) {
      semanticEntry.useCount++;
      return { ...semanticEntry.result, source: 'semantic_cache' };
    }

    return null;
  }

  // Store in multi-layer cache
  setTextModification(
    text: string, 
    type: string, 
    config: any, 
    result: TextModificationResult, 
    userId?: string
  ): void {
    const semanticHash = this.generateSemanticHash(text, type, config);
    const now = Date.now();

    // Store in global semantic cache
    this.globalSemanticCache.set(semanticHash, {
      hash: semanticHash,
      content: text,
      result,
      timestamp: now,
      useCount: 1,
      quality: this.calculateQuality(result)
    });

    // Store in user session cache if user ID provided
    if (userId) {
      const sessionKey = `${userId}_${type}_${semanticHash}`;
      this.userSessionCache.set(sessionKey, {
        data: result,
        timestamp: now,
        accessCount: 1,
        lastAccess: now,
        quality: this.calculateQuality(result)
      });
    }

    // Cleanup if cache size exceeded
    this.cleanupCaches();
  }

  // Get repertoire from cache
  getRepertoires(query: string, filters: any): Repertoire[] | null {
    const cacheKey = this.generateSemanticHash(query, 'repertoire', filters);
    const cached = this.repertoireCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    return null;
  }

  // Store repertoires in cache
  setRepertoires(query: string, filters: any, repertoires: Repertoire[]): void {
    const cacheKey = this.generateSemanticHash(query, 'repertoire', filters);
    this.repertoireCache.set(cacheKey, repertoires);
  }

  // Get template from cache
  getTemplate(type: string, params: any): any | null {
    const templateKey = `${type}_${this.generateSemanticHash(JSON.stringify(params), type)}`;
    const cached = this.templateCache.get(templateKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.TEMPLATE_TTL) {
      return cached.data;
    }
    
    return null;
  }

  // Store template in cache
  setTemplate(type: string, params: any, template: any): void {
    const templateKey = `${type}_${this.generateSemanticHash(JSON.stringify(params), type)}`;
    this.templateCache.set(templateKey, {
      data: template,
      timestamp: Date.now()
    });
  }

  // Calculate content quality score
  private calculateQuality(result: TextModificationResult): number {
    let score = 50; // Base score
    
    if (result.modifiedText) {
      const length = result.modifiedText.length;
      if (length > 50 && length < 500) score += 20;
      if (result.modifiedText.includes('ademais') || 
          result.modifiedText.includes('outrossim') ||
          result.modifiedText.includes('conquanto')) score += 15;
      if (result.modifiedText.split('.').length > 2) score += 10;
    }
    
    return Math.min(100, score);
  }

  // Cleanup caches when they exceed size limits
  private cleanupCaches(): void {
    // Cleanup semantic cache - keep highest quality and most used
    if (this.globalSemanticCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.globalSemanticCache.entries())
        .sort((a, b) => (b[1].quality + b[1].useCount) - (a[1].quality + a[1].useCount))
        .slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.8));
      
      this.globalSemanticCache.clear();
      entries.forEach(([key, value]) => {
        this.globalSemanticCache.set(key, value);
      });
    }

    // Cleanup session cache - remove old entries
    for (const [key, entry] of this.userSessionCache.entries()) {
      if (Date.now() - entry.timestamp > this.SESSION_TTL) {
        this.userSessionCache.delete(key);
      }
    }

    // Cleanup template cache - remove old entries
    for (const [key, entry] of this.templateCache.entries()) {
      if (Date.now() - entry.timestamp > this.TEMPLATE_TTL) {
        this.templateCache.delete(key);
      }
    }
  }

  // Get cache statistics
  getCacheStats(): any {
    return {
      sessionCache: {
        size: this.userSessionCache.size,
        hitRate: this.calculateHitRate('session')
      },
      semanticCache: {
        size: this.globalSemanticCache.size,
        hitRate: this.calculateHitRate('semantic')
      },
      templateCache: {
        size: this.templateCache.size
      },
      repertoireCache: {
        size: this.repertoireCache.size
      }
    };
  }

  private calculateHitRate(cacheType: string): number {
    // Simplified hit rate calculation
    if (cacheType === 'session') {
      const totalAccesses = Array.from(this.userSessionCache.values())
        .reduce((sum, entry) => sum + entry.accessCount, 0);
      return this.userSessionCache.size > 0 ? (totalAccesses / this.userSessionCache.size) : 0;
    }
    
    if (cacheType === 'semantic') {
      const totalUses = Array.from(this.globalSemanticCache.values())
        .reduce((sum, entry) => sum + entry.useCount, 0);
      return this.globalSemanticCache.size > 0 ? (totalUses / this.globalSemanticCache.size) : 0;
    }
    
    return 0;
  }
}

// Singleton instance
export const intelligentCache = new IntelligentCache();