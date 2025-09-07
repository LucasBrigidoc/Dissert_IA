import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Repertoire } from "@shared/schema";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeSearchQuery(query: string): Promise<{
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
    normalizedQuery: string;
  }> {
    const prompt = `
Analise esta consulta de busca por repertórios para redações e extraia:

Consulta: "${query}"

Responda APENAS em formato JSON válido com:
{
  "keywords": ["palavra1", "palavra2", ...], // 5-10 palavras-chave principais
  "suggestedTypes": ["tipo1", "tipo2", ...], // tipos de repertório mais adequados
  "suggestedCategories": ["categoria1", "categoria2", ...], // categorias temáticas
  "normalizedQuery": "consulta normalizada em minúsculas"
}

Tipos disponíveis: movies, laws, books, news, events, music, series, documentaries, research, data
Categorias disponíveis: social, environment, technology, education, politics, economy, culture, health, ethics, globalization

Foque em identificar o tema central e sugerir os tipos mais relevantes.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(cleanedResponse);
      
      return {
        keywords: analysis.keywords || [],
        suggestedTypes: analysis.suggestedTypes || [],
        suggestedCategories: analysis.suggestedCategories || [],
        normalizedQuery: analysis.normalizedQuery || query.toLowerCase().trim()
      };
    } catch (error) {
      console.error("Error analyzing query with Gemini:", error);
      
      // Fallback analysis
      const normalizedQuery = query.toLowerCase().trim();
      const words = normalizedQuery.split(' ').filter(w => w.length > 2);
      
      return {
        keywords: words.slice(0, 5),
        suggestedTypes: ["books", "news", "research"],
        suggestedCategories: ["social", "technology"],
        normalizedQuery
      };
    }
  }

  async rankRepertoires(query: string, repertoires: Repertoire[]): Promise<Repertoire[]> {
    if (repertoires.length === 0) return [];
    
    const prompt = `
Ranqueie estes repertórios por relevância para a consulta: "${query}"

Repertórios:
${repertoires.map((rep, index) => `
${index + 1}. ${rep.title}
   Descrição: ${rep.description}
   Tipo: ${rep.type}
   Categoria: ${rep.category}
   Palavras-chave: ${(rep.keywords as string[]).join(', ')}
`).join('')}

Responda APENAS com uma lista de números em ordem de relevância (do mais para o menos relevante):
Exemplo: [3, 1, 5, 2, 4]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract array from response
      const matches = response.match(/\[[\d,\s]+\]/);
      if (matches) {
        const ranking = JSON.parse(matches[0]);
        
        // Reorder repertoires based on ranking
        const rankedRepertoires: Repertoire[] = [];
        ranking.forEach((index: number) => {
          if (index > 0 && index <= repertoires.length) {
            rankedRepertoires.push(repertoires[index - 1]);
          }
        });
        
        // Add any remaining repertoires
        repertoires.forEach(rep => {
          if (!rankedRepertoires.find(r => r.id === rep.id)) {
            rankedRepertoires.push(rep);
          }
        });
        
        return rankedRepertoires;
      }
    } catch (error) {
      console.error("Error ranking with Gemini:", error);
    }
    
    // Fallback: return original order
    return repertoires;
  }

  async generateRepertoires(query: string, analysis: {
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
  }, excludeIds: string[] = []): Promise<any[]> {
    const prompt = `
Gere repertórios relevantes para esta consulta de redação:

Consulta: "${query}"
Palavras-chave: ${analysis.keywords.join(', ')}
Tipos sugeridos: ${analysis.suggestedTypes.join(', ')}
Categorias sugeridas: ${analysis.suggestedCategories.join(', ')}

Crie EXATAMENTE 4-6 repertórios diversos e relevantes. Responda APENAS em formato JSON válido:

{
  "repertoires": [
    {
      "title": "Título exato do repertório",
      "description": "Descrição detalhada de como usar na redação (100-150 caracteres)",
      "type": "um dos tipos: movies, laws, books, news, events, music, series, documentaries, research, data",
      "category": "uma das categorias: social, environment, technology, education, politics, economy, culture, health, ethics, globalization",
      "popularity": "um dos níveis: very-popular, popular, moderate, uncommon, rare",
      "year": "ano como string ou período",
      "rating": número de 30-50,
      "keywords": ["palavra1", "palavra2", "palavra3", "palavra4", "palavra5"]
    }
  ]
}

REGRAS IMPORTANTES:
- Repertórios reais e verificáveis (não ficcionais)
- Variados em tipos (livros, leis, filmes, pesquisas, dados, etc.)
- Específicos para o contexto brasileiro quando aplicável
- Diferentes níveis de popularidade para dar opções únicas
- Keywords relevantes e específicas
- Descrições práticas de como usar na redação
${excludeIds.length > 0 ? `- EVITE repertórios similares aos já mostrados (IDs: ${excludeIds.join(', ')})` : ''}
- Seja criativo e diverso para oferecer opções únicas
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const generated = JSON.parse(cleanedResponse);
      
      return generated.repertoires || [];
    } catch (error) {
      console.error("Error generating repertoires with Gemini:", error);
      
      // Fallback: return empty array to use existing search logic
      return [];
    }
  }

  normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const geminiService = new GeminiService();