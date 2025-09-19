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

      case 'estrutura-causal':
        const tipoEstruturaCausal = config.structureType || 'tese-argumento';
        let instrucoesCausal = '';
        
        switch (tipoEstruturaCausal) {
          case 'tese-argumento':
            instrucoesCausal = 'Organize como: Tese principal → Argumento de apoio → Repertório que comprova';
            break;
          case 'problema-causa':
            instrucoesCausal = 'Estruture como: Problema identificado → Causa raiz → Dados/evidências que fundamentam';
            break;
          case 'topico-consequencia':
            instrucoesCausal = 'Desenvolva como: Tópico central → Consequência direta → Repertório que exemplifica';
            break;
          case 'causa-observacao':
            instrucoesCausal = 'Organize como: Causa identificada → Observação crítica → Repertório contextual';
            break;
          case 'efeito-analise':
            instrucoesCausal = 'Estruture como: Efeito observado → Análise aprofundada → Solução proposta';
            break;
          case 'fator-impacto':
            instrucoesCausal = 'Desenvolva como: Fator determinante → Impacto gerado → Contexto histórico/social';
            break;
          case 'origem-desenvolvimento':
            instrucoesCausal = 'Organize como: Origem do fenômeno → Desenvolvimento atual → Resultado/projeção';
            break;
          default:
            instrucoesCausal = 'Organize estabelecendo relações claras de causa e consequência';
        }
        
        return `Reescreva este texto aplicando uma estrutura causal sólida e acadêmica. Use conectivos causais apropriados (devido a, em virtude de, por causa de, consequentemente, portanto, assim sendo) para estabelecer relações lógicas claras.

"${text}"

${instrucoesCausal}

Requisitos:
- Use linguagem dissertativa e formal
- Conecte ideias com conectivos causais precisos  
- Mantenha coesão e coerência argumentativa
- Desenvolva cada etapa de forma substancial

Responda apenas com o texto reestruturado seguindo a estrutura causal indicada.`;

      case 'estrutura-comparativa':
        const tipoComparativa = config.structureType || 'comparacao-paralela';
        let instrucoesComparativa = '';
        
        switch (tipoComparativa) {
          case 'comparacao-paralela':
            instrucoesComparativa = 'Use "assim como... também" para criar paralelos convincentes';
            break;
          case 'forma-similar':
            instrucoesComparativa = 'Empregue "da mesma forma que..." para estabelecer similaridades';
            break;
          case 'condicional-se':
            instrucoesComparativa = 'Estruture com "se... então" criando relações condicionais lógicas';
            break;
          case 'medida-proporcional':
            instrucoesComparativa = 'Use "na medida em que..." para mostrar proporcionalidade';
            break;
          case 'enquanto-outro':
            instrucoesComparativa = 'Empregue "enquanto... por outro lado" para contrastar perspectivas';
            break;
          case 'tanto-quanto':
            instrucoesComparativa = 'Use "tanto quanto..." para equiparar importâncias ou intensidades';
            break;
          case 'diferente-de':
            instrucoesComparativa = 'Empregue "diferentemente de..." para destacar contrastes significativos';
            break;
          case 'semelhanca-de':
            instrucoesComparativa = 'Use "à semelhança de..." para criar analogias esclarecedoras';
            break;
          default:
            instrucoesComparativa = 'Estabeleça comparações e analogias claras';
        }
        
        return `Reescreva este texto criando uma estrutura comparativa rica e persuasiva. Use conectivos comparativos variados para estabelecer relações analógicas que fortaleçam a argumentação.

"${text}"

Instrução específica: ${instrucoesComparativa}

Requisitos:
- Desenvolva analogias esclarecedoras e pertinentes
- Use conectivos comparativos precisos e variados
- Mantenha equilíbrio entre os elementos comparados
- Fortaleça a argumentação através das comparações
- Use linguagem dissertativa e sofisticada

Responda apenas com o texto reestruturado seguindo a estrutura comparativa indicada.`;

      case 'estrutura-oposicao':
        const tipoOposicao = config.structureType || 'embora-oposicao';
        let instrucoesOposicao = '';
        
        switch (tipoOposicao) {
          case 'embora-oposicao':
            instrucoesOposicao = 'Use "embora..." para apresentar concessão seguida de contraargumento forte';
            break;
          case 'apesar-concessao':
            instrucoesOposicao = 'Empregue "apesar de..." para reconhecer objeções e depois refutá-las';
            break;
          case 'conforme-evidencia':
            instrucoesOposicao = 'Use "conforme demonstra..." para apresentar evidências que comprovam o ponto';
            break;
          case 'exemplo-confirmacao':
            instrucoesOposicao = 'Empregue "exemplificado por..." para dar exemplos concretos que confirmam a tese';
            break;
          case 'no-entanto':
            instrucoesOposicao = 'Use "no entanto..." para criar contraste e apresentar a perspectiva central';
            break;
          case 'contudo':
            instrucoesOposicao = 'Empregue "contudo..." para introduzir adversidade e depois superá-la argumentativamente';
            break;
          case 'por-sua-vez':
            instrucoesOposicao = 'Use "por sua vez..." para apresentar alternativa ou complemento à ideia inicial';
            break;
          case 'entretanto':
            instrucoesOposicao = 'Empregue "entretanto..." para introduzir ressalva importante e depois desenvolver';
            break;
          default:
            instrucoesOposicao = 'Crie estrutura de concessão e oposição equilibrada';
        }
        
        return `Reescreva este texto criando uma estrutura de oposição sofisticada que demonstre maturidade argumentativa. Reconheça perspectivas contrárias de forma respeitosa antes de apresentar seu posicionamento fundamentado.

"${text}"

Instrução específica: ${instrucoesOposicao}

Requisitos:
- Apresente concessões ou contrapontos de forma equilibrada
- Use conectivos adversativos e concessivos apropriados
- Desenvolva argumentação madura e reflexiva
- Demonstre conhecimento de múltiplas perspectivas
- Fortaleça sua tese através do reconhecimento de limitações
- Mantenha tom acadêmico e respeitoso

Responda apenas com o texto reestruturado seguindo a estrutura de oposição indicada.`;

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