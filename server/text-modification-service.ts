import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";
import type { 
  TextModificationConfig, 
  TextModificationResult, 
  TextModificationType,
  WordDifficulty,
  ArgumentTechnique 
} from "@shared/schema";

export class TextModificationService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache = new Map<string, { result: TextModificationResult; timestamp: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly hasApiKey: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.hasApiKey = !!apiKey;
    
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("✅ Gemini AI initialized successfully");
      } catch (error) {
        console.warn("⚠️ Failed to initialize Gemini AI:", error);
        this.hasApiKey = false;
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY not found. Text modification will use fallback mode only.");
    }
  }

  private generateCacheKey(text: string, type: string, config: TextModificationConfig): string {
    // Create a proper hash to avoid cache key collisions
    const configStr = JSON.stringify(config, Object.keys(config).sort());
    const hashInput = `${text}-${type}-${configStr}`;
    const hash = createHash('md5').update(hashInput).digest('hex');
    return `${type}_${hash.substring(0, 16)}`;
  }

  private getFromCache(cacheKey: string): TextModificationResult | null {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return { ...cached.result, source: 'cache' };
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  private setCache(cacheKey: string, result: TextModificationResult): void {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  private buildPrompt(text: string, type: string, config: TextModificationConfig): string {
    switch (type) {
      case 'formalidade':
        const nivel = config.formalityLevel || 50;
        const dificuldade = config.wordDifficulty || 'medio';
        return `Reescreva este texto ajustando a formalidade para ${nivel}% (0%=muito informal, 100%=muito formal) e use vocabulário ${dificuldade}:

"${text}"

Mantenha o significado original. Responda apenas com o texto reescrito.`;

      case 'argumentativo':
        const tecnica = config.argumentTechnique || 'topico-frasal';
        const estrutura = config.argumentStructure || {};
        const intensidade = config.argumentativeLevel || 50;
        
        let estruturaInstr = '';
        if (estrutura.repertoire) estruturaInstr += '- Inclua repertório legitimador\n';
        if (estrutura.thesis) estruturaInstr += '- Conecte com tese central\n';
        if (estrutura.arguments) estruturaInstr += '- Desenvolva argumentação sólida\n';
        if (estrutura.conclusion) estruturaInstr += '- Arremate conclusivo\n';

        return `Reorganize este texto como parágrafo dissertativo usando a técnica "${tecnica}" com intensidade argumentativa ${intensidade}%:

"${text}"

Estrutura desejada:
${estruturaInstr}

Responda apenas com o parágrafo reestruturado.`;

      case 'sinonimos':
        return `Reescreva este texto substituindo palavras por sinônimos mais ricos e variados, mantendo exatamente o mesmo sentido:

"${text}"

Responda apenas com o texto reescrito.`;

      case 'antonimos':
        return `Reescreva este texto invertendo o sentido através de antônimos, criando o argumento oposto:

"${text}"

Responda apenas com o texto com sentido invertido.`;

      default:
        throw new Error(`Tipo de modificação não suportado: ${type}`);
    }
  }

  private getFallbackModification(text: string, type: string, config: TextModificationConfig): string {
    switch (type) {
      case 'formalidade':
        const nivel = config.formalityLevel || 50;
        if (nivel > 70) {
          return text
            .replace(/\bvocê\b/g, "Vossa Senhoria")
            .replace(/\btá\b/g, "está")
            .replace(/\bpra\b/g, "para")
            .replace(/\bfazer\b/g, "realizar")
            .replace(/\bver\b/g, "analisar")
            .replace(/\bcoisa\b/g, "elemento");
        } else if (nivel < 30) {
          return text
            .replace(/\bVossa Senhoria\b/g, "você")
            .replace(/\bestá\b/g, "tá")
            .replace(/\bpara\b/g, "pra")
            .replace(/\brealizar\b/g, "fazer")
            .replace(/\banalisar\b/g, "ver");
        }
        return text;

      case 'argumentativo':
        const intensidade = config.argumentativeLevel || 50;
        if (intensidade > 70) {
          return `É fundamental compreender que ${text.toLowerCase()} Portanto, torna-se evidente a necessidade de uma análise mais aprofundada desta questão.`;
        } else if (intensidade < 30) {
          return `${text} Essa é apenas uma perspectiva possível sobre o assunto.`;
        }
        return `Considerando que ${text.toLowerCase()}, pode-se argumentar que esta questão merece atenção especial.`;

      case 'sinonimos':
        return text
          .replace(/\bbom\b/g, "excelente")
          .replace(/\bgrande\b/g, "amplo")
          .replace(/\bpequeno\b/g, "reduzido")
          .replace(/\bimportante\b/g, "relevante")
          .replace(/\bproblema\b/g, "questão")
          .replace(/\bsolução\b/g, "resolução");

      case 'antonimos':
        return text
          .replace(/\bbom\b/g, "ruim")
          .replace(/\bgrande\b/g, "pequeno")
          .replace(/\bpequeno\b/g, "grande")
          .replace(/\bfácil\b/g, "difícil")
          .replace(/\bdifícil\b/g, "fácil")
          .replace(/\bpositivo\b/g, "negativo")
          .replace(/\bsucesso\b/g, "fracasso");

      default:
        return text;
    }
  }

  async modifyText(
    text: string, 
    type: string, 
    config: TextModificationConfig = {}
  ): Promise<TextModificationResult> {
    // Validate input
    if (!text.trim()) {
      throw new Error("Texto não pode estar vazio");
    }

    if (text.length > 2000) {
      throw new Error("Texto muito longo. Máximo 2000 caracteres.");
    }

    const cacheKey = this.generateCacheKey(text, type, config);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`💾 Cache hit para modificação: ${type}`);
      return cached;
    }

    // Check if AI is available
    if (!this.hasApiKey || !this.model) {
      console.log(`⚡ Using fallback modification for ${type} (API unavailable)`);
      const fallbackText = this.getFallbackModification(text, type, config);
      
      return {
        modifiedText: fallbackText,
        modificationType: type as TextModificationType,
        source: 'fallback'
      };
    }

    try {
      // Generate with AI
      const prompt = this.buildPrompt(text, type, config);
      console.log(`🤖 Gerando modificação IA: ${type}`);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text().trim();
      
      // Clean up response
      const modifiedText = response
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^\s*-\s*/, '') // Remove leading dash
        .trim();

      const aiResult: TextModificationResult = {
        modifiedText,
        modificationType: type as TextModificationType,
        source: 'ai',
        tokensUsed: prompt.length // Approximate token count
      };

      // Cache the result
      this.setCache(cacheKey, aiResult);
      
      return aiResult;

    } catch (error) {
      console.error(`❌ Erro na modificação IA para ${type}:`, error);
      
      // Fallback to local modification
      const fallbackText = this.getFallbackModification(text, type, config);
      
      return {
        modifiedText: fallbackText,
        modificationType: type as TextModificationType,
        source: 'fallback'
      };
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.8 // This would be calculated from actual usage stats
    };
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of Array.from(this.cache.entries())) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const textModificationService = new TextModificationService();