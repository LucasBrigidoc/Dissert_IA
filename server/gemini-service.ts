import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Repertoire } from "@shared/schema";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  // Local analysis mappings - no AI required
  private queryPatterns = {
    'clima': ['environment', 'research', 'documentaries'],
    'tecnologia': ['technology', 'books', 'documentaries'], 
    'educação': ['education', 'books', 'laws'],
    'sociedade': ['social', 'research', 'news'],
    'política': ['politics', 'books', 'news'],
    'meio ambiente': ['environment', 'research', 'documentaries'],
    'direitos humanos': ['social', 'laws', 'events'],
    'economia': ['economy', 'research', 'news'],
    'cultura': ['culture', 'books', 'movies'],
    'saúde': ['health', 'research', 'news'],
    'globalização': ['globalization', 'books', 'research']
  };

  private typeCategories = {
    'movies': ['culture', 'social', 'politics'],
    'books': ['education', 'culture', 'politics', 'social'], 
    'laws': ['politics', 'social', 'education'],
    'research': ['health', 'environment', 'technology', 'social'],
    'news': ['politics', 'economy', 'social'],
    'documentaries': ['environment', 'technology', 'social'],
    'events': ['politics', 'social', 'culture'],
    'data': ['economy', 'health', 'social']
  };

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Local analysis - NO AI TOKENS USED!
  analyzeSearchQueryLocal(query: string): {
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
    normalizedQuery: string;
  } {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    
    // Extract keywords
    const keywords = words.slice(0, 8);
    
    // Find matching patterns
    let suggestedCategories: string[] = [];
    let suggestedTypes: string[] = [];
    
    // Check for theme matches
    for (const [pattern, categories] of Object.entries(this.queryPatterns)) {
      if (normalizedQuery.includes(pattern) || words.some(w => pattern.includes(w))) {
        suggestedCategories.push(...categories);
      }
    }
    
    // If no theme match, use generic suggestions
    if (suggestedCategories.length === 0) {
      suggestedCategories = ['social', 'technology'];
      suggestedTypes = ['books', 'research', 'news'];
    } else {
      // Get types based on categories
      for (const [type, typeCategories] of Object.entries(this.typeCategories)) {
        if (typeCategories.some(cat => suggestedCategories.includes(cat))) {
          suggestedTypes.push(type);
        }
      }
    }
    
    // Remove duplicates and limit
    suggestedCategories = Array.from(new Set(suggestedCategories)).slice(0, 3);
    suggestedTypes = Array.from(new Set(suggestedTypes)).slice(0, 4);
    
    return {
      keywords,
      suggestedTypes,
      suggestedCategories,
      normalizedQuery
    };
  }

  // Keep old method for backward compatibility but use local analysis
  async analyzeSearchQuery(query: string): Promise<{
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
    normalizedQuery: string;
  }> {
    // Use local analysis instead of AI - saves 100% of analysis tokens
    return this.analyzeSearchQueryLocal(query);
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

  // ULTRA-OPTIMIZED: Generate 6 repertoires in 1 request with minimal tokens
  async generateRepertoiresBatch(query: string, userFilters: {
    type?: string;
    category?: string;
    popularity?: string;
  } = {}, batchSize: number = 6): Promise<any[]> {
    // Use local analysis (0 tokens)
    const analysis = this.analyzeSearchQueryLocal(query);
    
    // Ultra-concise prompt - 80% fewer tokens
    const typeInstruction = userFilters.type && userFilters.type !== 'all' 
      ? `IMPORTANT: Generate ONLY "${userFilters.type}" type repertoires. All items must have "type": "${userFilters.type}".`
      : '';
    
    const allowedTypes = userFilters.type && userFilters.type !== 'all' 
      ? userFilters.type 
      : 'books|laws|movies|research|documentaries|news|data|events';
    
    const prompt = `Query: "${query}"
${typeInstruction}
Generate ${batchSize} relevant repertoires as JSON:
[{
  "title": "Title",
  "description": "Use description (80-120 chars)", 
  "type": "${allowedTypes}",
  "category": "${userFilters.category || 'social|environment|technology|education|politics'}",
  "popularity": "${userFilters.popularity || 'very-popular|popular|moderate'}",
  "year": "year",
  "rating": 35-49,
  "keywords": ["k1","k2","k3","k4"]
}]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON array directly
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const repertoires = JSON.parse(cleanedResponse);
      
      return Array.isArray(repertoires) ? repertoires : repertoires.repertoires || [];
    } catch (error) {
      console.error("Error generating batch repertoires:", error);
      return this.generateFallbackRepertoires(query, analysis, userFilters);
    }
  }

  // Keep old method for backward compatibility
  async generateRepertoires(query: string, analysis: {
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
  }, excludeIds: string[] = [], userFilters: {
    type?: string;
    category?: string;
    popularity?: string;
  } = {}): Promise<any[]> {
    // Use user-specified filters or fallback to AI suggestions
    const targetTypes = userFilters.type ? [userFilters.type] : analysis.suggestedTypes;
    const targetCategories = userFilters.category ? [userFilters.category] : analysis.suggestedCategories;
    const targetPopularity = userFilters.popularity;

    const prompt = `
Gere repertórios relevantes para esta consulta de redação:

Consulta: "${query}"
Palavras-chave: ${analysis.keywords.join(', ')}
${userFilters.type ? `TIPO OBRIGATÓRIO: ${userFilters.type} (gere APENAS deste tipo)` : `Tipos sugeridos: ${analysis.suggestedTypes.join(', ')}`}
${userFilters.category ? `CATEGORIA OBRIGATÓRIA: ${userFilters.category} (gere APENAS desta categoria)` : `Categorias sugeridas: ${analysis.suggestedCategories.join(', ')}`}
${userFilters.popularity ? `POPULARIDADE OBRIGATÓRIA: ${userFilters.popularity}` : ''}

Crie EXATAMENTE 4-6 repertórios ${userFilters.type ? `do tipo ${userFilters.type}` : 'diversos'} e relevantes. Responda APENAS em formato JSON válido:

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
${userFilters.type ? `- TODOS os repertórios devem ser do tipo: ${userFilters.type}` : '- Variados em tipos (livros, leis, filmes, pesquisas, dados, etc.)'}
${userFilters.category ? `- TODOS os repertórios devem ser da categoria: ${userFilters.category}` : ''}
${userFilters.popularity ? `- TODOS os repertórios devem ter popularidade: ${userFilters.popularity}` : '- Diferentes níveis de popularidade para dar opções únicas'}
- Específicos para o contexto brasileiro quando aplicável
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
      
      // Fallback: generate repertoires based on query and filters when AI is unavailable
      return this.generateFallbackRepertoires(query, analysis, userFilters);
    }
  }

  private generateFallbackRepertoires(query: string, analysis: {
    keywords: string[];
    suggestedTypes: string[];
    suggestedCategories: string[];
  }, userFilters: {
    type?: string;
    category?: string;
    popularity?: string;
  } = {}): any[] {
    const queryLower = query.toLowerCase();
    
    // Template repertoires organized by themes and types
    const repertoireTemplates = {
      "crise climática": {
        environment: [
          {
            title: "Acordo de Paris",
            description: "Tratado internacional de 2015 sobre mudanças climáticas. Excelente para discutir compromissos globais e ação climática.",
            type: "laws",
            category: "environment",
            popularity: "very-popular",
            year: "2015",
            rating: 45,
            keywords: ["clima", "acordo", "paris", "internacional", "carbono"]
          },
          {
            title: "An Inconvenient Truth",
            description: "Documentário de Al Gore sobre aquecimento global. Referência clássica para conscientização ambiental.",
            type: "documentaries",
            category: "environment",
            popularity: "popular",
            year: "2006",
            rating: 42,
            keywords: ["aquecimento", "global", "gore", "conscientização", "documentário"]
          },
          {
            title: "Relatório IPCC 2023",
            description: "Relatório científico sobre mudanças climáticas. Dados atuais e projeções sobre o futuro do planeta.",
            type: "research",
            category: "environment",
            popularity: "moderate",
            year: "2023",
            rating: 48,
            keywords: ["ipcc", "científico", "mudanças", "climáticas", "dados"]
          },
          {
            title: "Greta Thunberg e o movimento climático",
            description: "Ativismo jovem por justiça climática. Exemplo de mobilização social e protagonismo juvenil.",
            type: "events",
            category: "environment",
            popularity: "very-popular",
            year: "2018",
            rating: 44,
            keywords: ["greta", "ativismo", "juventude", "movimento", "justiça"]
          }
        ],
        books: [
          {
            title: "O Colapso do Clima - David Wallace-Wells",
            description: "Análise científica sobre os impactos das mudanças climáticas. Cenários futuros baseados em evidências.",
            type: "books",
            category: "environment",
            popularity: "moderate",
            year: "2019",
            rating: 46,
            keywords: ["colapso", "científico", "impactos", "futuro", "evidências"]
          }
        ],
        movies: [
          {
            title: "Don't Look Up",
            description: "Sátira sobre negacionismo climático e científico. Metáfora sobre inação diante de crises globais.",
            type: "movies",
            category: "environment",
            popularity: "popular",
            year: "2021",
            rating: 41,
            keywords: ["sátira", "negacionismo", "inação", "crise", "global"]
          }
        ]
      },
      "tecnologia": {
        technology: [
          {
            title: "Lei Geral de Proteção de Dados (LGPD)",
            description: "Marco regulatório brasileiro para proteção de dados pessoais. Essencial para temas sobre privacidade digital.",
            type: "laws",
            category: "technology",
            popularity: "very-popular",
            year: "2020",
            rating: 47,
            keywords: ["lgpd", "proteção", "dados", "privacidade", "digital"]
          },
          {
            title: "The Social Dilemma",
            description: "Documentário sobre os impactos das redes sociais. Aborda vício digital e manipulação algorítmica.",
            type: "documentaries",
            category: "technology",
            popularity: "popular",
            year: "2020",
            rating: 43,
            keywords: ["redes", "sociais", "algoritmo", "vício", "manipulação"]
          },
          {
            title: "Black Mirror",
            description: "Série que explora os aspectos sombrios da tecnologia. Reflexões sobre futuro distópico e dependência digital.",
            type: "series",
            category: "technology",
            popularity: "very-popular",
            year: "2011",
            rating: 46,
            keywords: ["distopia", "futuro", "dependência", "tecnologia", "reflexão"]
          }
        ]
      },
      "educação": {
        education: [
          {
            title: "Constituição Federal Art. 205",
            description: "Direito à educação na Constituição brasileira. Base legal para discutir acesso e qualidade educacional.",
            type: "laws",
            category: "education",
            popularity: "very-popular",
            year: "1988",
            rating: 49,
            keywords: ["constituição", "direito", "educação", "acesso", "qualidade"]
          },
          {
            title: "Paulo Freire - Pedagogia do Oprimido",
            description: "Obra fundamental sobre educação libertadora. Referência mundial em pedagogia crítica.",
            type: "books",
            category: "education",
            popularity: "popular",
            year: "1968",
            rating: 48,
            keywords: ["freire", "pedagogia", "libertadora", "crítica", "educação"]
          }
        ]
      }
    };

    // Determine which repertoires to return based on query and filters
    let selectedRepertoires: any[] = [];
    
    // Try to match the query with known themes
    for (const [theme, categories] of Object.entries(repertoireTemplates)) {
      if (queryLower.includes(theme) || analysis.keywords.some(keyword => theme.includes(keyword))) {
        // If user specified a type, filter by that type
        if (userFilters.type && userFilters.type !== "all") {
          const categoryData = (categories[userFilters.category as keyof typeof categories] || 
                              Object.values(categories).flat()) as any[];
          selectedRepertoires = categoryData.filter((rep: any) => rep.type === userFilters.type);
        } else {
          // Use category if specified, otherwise use environment category as default
          const targetCategory = userFilters.category && userFilters.category !== "all" 
            ? userFilters.category 
            : Object.keys(categories)[0];
          
          selectedRepertoires = categories[targetCategory as keyof typeof categories] || Object.values(categories).flat();
        }
        break;
      }
    }

    // If no specific theme matched, use generic repertoires based on type and category
    if (selectedRepertoires.length === 0) {
      selectedRepertoires = this.generateGenericRepertoires(userFilters, analysis.keywords);
    }

    // Filter by popularity if specified
    if (userFilters.popularity && userFilters.popularity !== "all") {
      selectedRepertoires = selectedRepertoires.filter(rep => rep.popularity === userFilters.popularity);
    }

    // Ensure we have at least 4 repertoires
    while (selectedRepertoires.length < 4) {
      selectedRepertoires.push(...this.generateGenericRepertoires(userFilters, analysis.keywords));
      selectedRepertoires = selectedRepertoires.slice(0, 6); // Limit to 6
    }

    return selectedRepertoires.slice(0, 4);
  }

  private generateGenericRepertoires(userFilters: any, keywords: string[]): any[] {
    const generic = [
      {
        title: "Declaração Universal dos Direitos Humanos",
        description: "Marco histórico de 1948 que estabelece direitos fundamentais. Excelente referência para temas sobre dignidade humana.",
        type: "laws",
        category: "social",
        popularity: "very-popular",
        year: "1948",
        rating: 49,
        keywords: ["direitos", "humanos", "onu", "dignidade", "universal"]
      },
      {
        title: "1984 - George Orwell",
        description: "Distopia clássica sobre vigilância e controle estatal. Ideal para temas de tecnologia e liberdade.",
        type: "books",
        category: "politics",
        popularity: "very-popular",
        year: "1949",
        rating: 48,
        keywords: ["distopia", "vigilância", "controle", "orwell", "liberdade"]
      },
      {
        title: "Pesquisa Datafolha 2024",
        description: "Dados estatísticos atuais sobre comportamento social brasileiro. Fonte confiável para argumentação.",
        type: "research",
        category: "social",
        popularity: "moderate",
        year: "2024",
        rating: 42,
        keywords: ["pesquisa", "dados", "estatística", "brasil", "social"]
      },
      {
        title: "Agenda 2030 da ONU",
        description: "Objetivos de Desenvolvimento Sustentável globais. Referência para temas de sustentabilidade.",
        type: "events",
        category: "environment",
        popularity: "popular",
        year: "2015",
        rating: 45,
        keywords: ["onu", "sustentabilidade", "objetivos", "desenvolvimento", "global"]
      }
    ];

    // Filter by type if specified
    if (userFilters.type && userFilters.type !== "all") {
      return generic.filter(rep => rep.type === userFilters.type);
    }

    return generic;
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