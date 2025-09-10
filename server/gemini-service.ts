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

  // REMOVED: AI ranking function replaced with local ranking for cost optimization
  // Local ranking is now handled directly in routes.ts with keyword matching
  // This saves 100% of ranking tokens and provides faster response times
  rankRepertoiresLocal(query: string, repertoires: Repertoire[]): Repertoire[] {
    if (repertoires.length <= 1) return repertoires;
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    return repertoires.sort((a, b) => {
      const aScore = queryWords.reduce((score, word) => {
        if (a.title.toLowerCase().includes(word)) score += 3;
        if (a.description.toLowerCase().includes(word)) score += 2;
        if (a.keywords && (a.keywords as string[]).some((k: string) => k.toLowerCase().includes(word))) score += 1;
        return score;
      }, 0);
      
      const bScore = queryWords.reduce((score, word) => {
        if (b.title.toLowerCase().includes(word)) score += 3;
        if (b.description.toLowerCase().includes(word)) score += 2;
        if (b.keywords && (b.keywords as string[]).some((k: string) => k.toLowerCase().includes(word))) score += 1;
        return score;
      }, 0);
      
      return bScore - aScore;
    });
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
  "description": "Detailed description explaining what this repertoire is, how to use it effectively in essays, which themes it supports, and specific argumentative angles it provides. Include practical usage tips and contexts where it's most powerful (200-300 characters)", 
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
      "description": "Descrição completa e detalhada explicando: 1) O que é este repertório, 2) Como usá-lo efetivamente em redações, 3) Em quais temas se aplica, 4) Quais argumentos e perspectivas oferece, 5) Dicas práticas de aplicação e contextos onde é mais poderoso (200-400 caracteres)",
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

  // AI Chat for argumentative structure - optimized for cost and relevance
  async generateArgumentativeSuggestion(
    userMessage: string, 
    section: string, 
    context: {
      proposta?: string;
      tese?: string;
      paragrafos?: {
        introducao?: string;
        desenvolvimento1?: string;
        desenvolvimento2?: string;
        conclusao?: string;
      };
    }
  ): Promise<string> {
    try {
      // Create contextual prompt based on section and user's work
      let prompt = this.buildContextualPrompt(userMessage, section, context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      // Fallback to contextual suggestions without AI
      return this.getFallbackSuggestion(userMessage, section, context);
    }
  }

  private buildContextualPrompt(userMessage: string, section: string, context: any): string {
    // Detectar o nível do usuário baseado no conteúdo existente
    const userLevel = this.detectUserLevel(context);
    
    const sectionInstructions = {
      optimization: {
        beginner: "REFINAMENTO DE IDEIA - Vou analisar sua ideia e torná-la mais específica e argumentativa.",
        intermediate: "OTIMIZAÇÃO DE IDEIA - Vou aprimorar sua proposta com maior precisão argumentativa.",
        advanced: "SOFISTICAÇÃO CONCEITUAL - Vou refinar com maior complexidade e elegância argumentativa."
      },
      tema: {
        beginner: "DEFINIÇÃO DE TEMA - Vou te ajudar a tornar o tema mais específico e focado.",
        intermediate: "APRIMORAMENTO TEMÁTICO - Vamos delimitar melhor o recorte e abordagem.",
        advanced: "REFINAMENTO TEMÁTICO - Vamos trabalhar nuances e especificidades temáticas."
      },
      tese: {
        beginner: "CONSTRUÇÃO DE TESE - Vou te ensinar a criar uma tese clara.",
        intermediate: "FORTALECIMENTO DE TESE - Vamos tornar sua tese mais persuasiva.",
        advanced: "SOFISTICAÇÃO DA TESE - Vamos elaborar uma tese mais robusta."
      },
      introducao: {
        beginner: "ESTRUTURA INTRODUÇÃO - Contextualização + Problematização + Tese.",
        intermediate: "APRIMORAMENTO INTRODUÇÃO - Vamos melhorar com dados e contextualização rica.",
        advanced: "SOFISTICAÇÃO INTRODUÇÃO - Vamos criar abordagem mais elaborada."
      },
      desenvolvimento1: {
        beginner: "1º ARGUMENTO - Tópico frasal + Fundamentação + Exemplos + Conclusão.",
        intermediate: "FORTALECIMENTO 1º ARG - Vamos melhorar com exemplos específicos.",
        advanced: "SOFISTICAÇÃO 1º ARG - Vamos usar perspectivas multidisciplinares."
      },
      desenvolvimento2: {
        beginner: "2º ARGUMENTO - Argumento diferente que também defende sua tese.",
        intermediate: "COMPLEMENTO ARGUMENTATIVO - Argumento que dialogue com o primeiro.",
        advanced: "COMPLEXIDADE ARGUMENTATIVA - Vamos explorar nuances que enriqueçam a discussão."
      },
      conclusao: {
        beginner: "ESTRUTURA CONCLUSÃO - Retomada + Síntese + Proposta de Intervenção.",
        intermediate: "APRIMORAMENTO CONCLUSÃO - Síntese elaborada e proposta detalhada.",
        advanced: "SOFISTICAÇÃO CONCLUSÃO - Síntese sofisticada e proposta inovadora."
      }
    };

    let prompt = `Você é o Refinador de Brainstorming IA, especializado em redação argumentativa brasileira.\n\n`;
    
    // Instrução adaptada ao nível
    const instruction = sectionInstructions[section as keyof typeof sectionInstructions][userLevel];
    prompt += `${instruction}\n\n`;
    
    // Adicionar contexto do trabalho do estudante
    if (context.proposta) {
      prompt += `📝 PROPOSTA: "${context.proposta}"\n`;
    }
    
    if (context.tese) {
      prompt += `💡 IDEIA DO TEXTO: "${context.tese}"\n`;
    }
    
    // Adicionar parágrafos existentes para contexto
    if (context.paragrafos) {
      if (context.paragrafos.introducao && section !== 'introducao') {
        prompt += `📖 SUA INTRODUÇÃO: "${context.paragrafos.introducao}"\n`;
      }
      if (context.paragrafos.desenvolvimento1 && section !== 'desenvolvimento1') {
        prompt += `🎯 SEU 1º ARGUMENTO: "${context.paragrafos.desenvolvimento1}"\n`;
      }
      if (context.paragrafos.desenvolvimento2 && section !== 'desenvolvimento2') {
        prompt += `🎯 SEU 2º ARGUMENTO: "${context.paragrafos.desenvolvimento2}"\n`;
      }
    }
    
    prompt += `\n❓ SUA PERGUNTA: "${userMessage}"\n\n`;
    
    // Instruções de resposta adaptadas ao nível
    if (section === 'optimization') {
      // Verificar se há conteúdo para otimizar ou se é orientação inicial
      if (!context.tese && !context.proposta) {
        prompt += `Responda como um professor experiente em redação dando orientações iniciais sobre como criar uma boa ideia do texto.\n`;
        prompt += `Use uma estrutura didática com passos claros, exemplos práticos e dicas úteis.\n`;
        prompt += `Seja encorajador e mostre que é possível aprender!\n\n`;
      } else if (context.proposta && !context.tese) {
        prompt += `O usuário tem a proposta "${context.proposta}" mas não sabe como formular sua ideia.\n`;
        prompt += `Dê orientações específicas para este tema, sugerindo possíveis abordagens e perspectivas.\n`;
        prompt += `Ofereça 2-3 exemplos de boas ideias para este tema específico.\n\n`;
      } else if (!context.proposta && context.tese) {
        prompt += `O usuário tem uma ideia ("${context.tese}") mas não definiu uma proposta específica.\n`;
        prompt += `Analise a ideia e sugira como aprimorá-la, tornando-a mais específica e argumentativa.\n\n`;
      } else {
        // Caso normal de otimização
        prompt += `Responda seguindo esta estrutura exata:\n\n`;
        prompt += `1. **📝 Análise da sua ideia atual:**\n[Breve análise do que está bom e o que pode melhorar]\n\n`;
        prompt += `2. **✨ Versão otimizada:**\n"[Aqui coloque a versão melhorada da ideia entre aspas]"\n\n`;
        prompt += `3. **💡 Principais melhorias:**\n[Liste 2-3 pontos específicos que foram aprimorados]\n\n`;
        prompt += `4. **🎯 Dica extra:**\n[Uma sugestão adicional para fortalecer ainda mais a ideia]\n\n`;
        prompt += `IMPORTANTE: A versão otimizada deve estar entre aspas para facilitar a aplicação automática.`;
      }
    } else if (userLevel === 'beginner') {
      prompt += `Responda de forma didática e passo a passo (máximo 250 palavras):\n`;
      prompt += `• Use linguagem simples e amigável\n`;
      prompt += `• Dê exemplos práticos e específicos\n`;
      prompt += `• Explique o "por quê" por trás de cada sugestão\n`;
      prompt += `• Ofereça frases/conectivos prontos quando apropriado\n`;
      prompt += `• Seja encorajador e mostre que é possível melhorar\n\n`;
    } else if (userLevel === 'intermediate') {
      prompt += `Responda de forma objetiva e prática (máximo 200 palavras):\n`;
      prompt += `• Foque em aprimoramentos específicos\n`;
      prompt += `• Sugira exemplos mais elaborados\n`;
      prompt += `• Trabalhe coesão e conectivos sofisticados\n`;
      prompt += `• Aponte caminhos para elevar o nível do texto\n\n`;
    } else {
      prompt += `Responda de forma refinada e analítica (máximo 180 palavras):\n`;
      prompt += `• Foque em sofisticação argumentativa\n`;
      prompt += `• Sugira abordagens multidisciplinares\n`;
      prompt += `• Trabalhe nuances e complexidade\n`;
      prompt += `• Aponte caminhos para excelência textual\n\n`;
    }
    
    prompt += `FORMATO DE RESPOSTA OBRIGATÓRIO:\n🎯 [NOME DA SEÇÃO]\n\n💡 ANÁLISE RÁPIDA\n[1-2 frases diretas sobre o que o usuário escreveu ou perguntou]\n\n📝 SUGESTÃO PRINCIPAL\n[Uma sugestão concreta e específica - máximo 2 frases]\n\n🔧 COMO MELHORAR\n• [Ponto prático 1 - máximo 1 linha]\n• [Ponto prático 2 - máximo 1 linha]\n• [Ponto prático 3 - máximo 1 linha]\n\n❓ PRÓXIMA ETAPA\n[Pergunta ou direcionamento para continuar - máximo 1 frase]\n\nREGRAS RÍGIDAS:\n- Máximo 5 linhas por seção\n- Linguagem direta e clara\n- Foco em ações práticas\n- Sempre termine direcionando o próximo passo`;
    
    return prompt;
  }

  private detectUserLevel(context: any): 'beginner' | 'intermediate' | 'advanced' {
    let score = 0;
    
    // Analisar qualidade da tese/ideia
    if (context.tese && context.tese.length > 50) score += 1;
    if (context.tese && context.tese.length > 100) score += 1;
    
    // Analisar parágrafos existentes
    const paragraphs = context.paragrafos || {};
    Object.values(paragraphs).forEach((paragraph: any) => {
      if (paragraph && paragraph.length > 80) score += 1;
      if (paragraph && paragraph.length > 150) score += 1;
      // Verifica conectivos sofisticados
      if (paragraph && /\b(portanto|contudo|outrossim|ademais|destarte)\b/i.test(paragraph)) score += 1;
    });
    
    if (score >= 6) return 'advanced';
    if (score >= 3) return 'intermediate';
    return 'beginner';
  }

  private getFallbackSuggestion(userMessage: string, section: string, context: any): string {
    const userLevel = this.detectUserLevel(context);
    
    const fallbacks = {
      optimization: {
        beginner: "🎯 REFINAMENTO DE IDEIA\n\n💡 ANÁLISE RÁPIDA\nSua pergunta mostra que você quer criar uma boa base para sua redação.\n\n📝 SUGESTÃO PRINCIPAL\nTorne sua ideia específica: em vez de \"educação é importante\", diga \"educação digital prepara jovens para o mercado de trabalho\".\n\n🔧 COMO MELHORAR\n• Defina sua posição clara (a favor, contra, ou perspectiva específica)\n• Seja específico sobre qual aspecto do tema você vai abordar\n• Pense em que argumentos e exemplos você usará\n\n❓ PRÓXIMA ETAPA\nMe conte sobre que tema você quer escrever para eu te ajudar com ideias específicas?",
        intermediate: "🎯 **Aprimorando sua ideia do texto**\n\n📊 **Estrutura ideal:**\n\n1️⃣ **Posicionamento claro:** Sua opinião bem definida sobre o tema\n\n2️⃣ **Especificidade:** Evite generalizações, seja preciso\n\n3️⃣ **Conexão argumentativa:** Sua ideia deve anunciar que argumentos virão\n\n4️⃣ **Relevância social:** Mostre por que o tema importa para a sociedade\n\n💼 **Estratégias avançadas:**\n• Use dados ou contexto atual\n• Mencione diferentes perspectivas\n• Conecte com outros temas sociais\n• Antecipe possíveis objeções\n\n🔗 **Conectivos úteis:** \"Diante disso\", \"Nesse contexto\", \"Considerando que\"\n\n🎯 **Meta:** Sua ideia deve convencer o leitor desde o início!",
        advanced: "🧠 **Refinamento conceitual da ideia**\n\n🎨 **Sofisticação argumentativa:**\n\n1️⃣ **Multidimensionalidade:** Aborde aspectos históricos, sociais, econômicos\n\n2️⃣ **Nuances:** Evite polarizações, explore complexidades\n\n3️⃣ **Inovação:** Apresente perspectivas menos óbvias\n\n4️⃣ **Interdisciplinaridade:** Conecte diferentes áreas do conhecimento\n\n📚 **Técnicas avançadas:**\n• Paradoxos e contradições\n• Analogias elaboradas\n• Referências implícitas\n• Questionamentos filosóficos\n\n✨ **Elegância textual:** Use linguagem sofisticada sem rebuscamento\n\n🎯 **Objetivo:** Demonstrar domínio pleno e originalidade de pensamento!"
      },
      introducao: {
        beginner: "🎯 ESTRUTURA INTRODUÇÃO\n\n💡 ANÁLISE RÁPIDA\nVocê precisa organizar sua introdução em três partes bem definidas.\n\n📝 SUGESTÃO PRINCIPAL\nUse a estrutura: Contextualização (apresentar tema) + Problematização (mostrar importância) + Tese (sua opinião).\n\n🔧 COMO MELHORAR\n• Comece com \"No mundo contemporâneo...\" ou dados atuais\n• Explique por que o tema é um problema relevante hoje\n• Termine com sua posição clara sobre o assunto\n\n❓ PRÓXIMA ETAPA\nQuer me mostrar sua introdução atual para eu te dar sugestões específicas?",
        intermediate: "🎯 **Aprimorando sua Introdução**\n\n📈 **Contextualização mais rica:**\nUse dados atuais, contexto histórico ou comparações internacionais\n\n🔍 **Problematização sofisticada:**\nMostre causas e consequências do problema\n\n💭 **Tese mais persuasiva:**\nUse argumentos de autoridade ou dados para sustentar sua posição\n\n🔗 **Conectivos eficazes:** \"Diante desse cenário\", \"Nessa perspectiva\", \"Sob essa ótica\"",
        advanced: "🎯 **Refinando sua Introdução**\n\n🌐 **Contextualização multidimensional:**\nAborde aspectos históricos, sociais, econômicos e culturais\n\n🧠 **Problematização complexa:**\nExplore paradoxos, contradições e múltiplas causas\n\n✨ **Tese sofisticada:**\nProponha soluções inovadoras com base em evidências robustas\n\n📚 **Conectivos refinados:** \"Sob essa perspectiva\", \"Nessa conjuntura\", \"À luz dessas considerações\""
      },
      desenvolvimento1: {
        beginner: "🎯 ESTRUTURA 1º ARGUMENTO\n\n💡 ANÁLISE RÁPIDA\nVocê precisa construir um parágrafo com começo, meio e fim bem organizados.\n\n📝 SUGESTÃO PRINCIPAL\nUse: Tópico frasal + Fundamentação + Exemplos + Conclusão do parágrafo.\n\n🔧 COMO MELHORAR\n• Comece com \"Em primeiro lugar\" ou \"Primeiramente\"\n• Explique sua ideia principal com detalhes\n• Use dados, pesquisas ou casos atuais como prova\n\n❓ PRÓXIMA ETAPA\nQue argumento você quer desenvolver primeiro?",
        intermediate: "🎯 **Fortalecendo seu 1º Argumento**\n\n🎪 **Diversifique exemplos:**\nCombine dados estatísticos + casos reais + referências culturais\n\n📚 **Fundamentação robusta:**\nCite especialistas, pesquisas acadêmicas ou organismos oficiais\n\n🔗 **Coesão textual:**\nConecte claramente com a tese da introdução\n\n💪 **Argumento convincente:**\nMostre causa-efeito, compare cenários ou apresente evidências contundentes",
        advanced: "🎯 **Sofisticando seu 1º Argumento**\n\n🧩 **Perspectiva multidisciplinar:**\nIntegre visões sociológicas, filosóficas, econômicas\n\n🎭 **Exemplos não-óbvios:**\nUse referencias culturais elaboradas, casos internacionais, dados comparativos\n\n🌊 **Progressão argumentativa:**\nCrie uma linha de raciocínio que evolui logicamente\n\n🎨 **Sofisticação textual:**\nUse períodos mais complexos e vocabulário técnico apropriado"
      },
      desenvolvimento2: {
        beginner: "🎯 **Estrutura do 2º Desenvolvimento**\n\n🔄 **Argumento diferente:**\nTraga uma nova perspectiva que também defenda sua tese\n\n📌 **Mesma estrutura:**\nTópico frasal + fundamentação + exemplos + conclusão\n\n🎯 **Tipos de argumento:**\n• Econômico, social, ambiental, cultural, histórico\n\n🔗 **Conecte com o 1º:**\nUse \"Além disso\", \"Outrossim\", \"Paralelamente\"\n\n💡 **Varie os exemplos:** Se usou dados no 1º, use casos históricos no 2º",
        intermediate: "🎯 **Complementando sua Argumentação**\n\n🔄 **Argumento complementar:**\nAborde outra dimensão do problema (ex: se falou de causas, fale de consequências)\n\n📊 **Varie evidências:**\nAlterne entre dados nacionais/internacionais, casos históricos/contemporâneos\n\n🧭 **Linha argumentativa:**\nMantenha coerência com o conjunto da argumentação\n\n🎨 **Conectivos variados:** \"Ademais\", \"Por outro lado\", \"Simultaneamente\"",
        advanced: "🎯 **Complexificando a Argumentação**\n\n🌐 **Perspectiva dialética:**\nExplore tensões, contradições ou múltiplas facetas do problema\n\n🎭 **Abordagem inovadora:**\nUse analogias sofisticadas, casos paradigmáticos, análises comparativas\n\n🧠 **Articulação sofisticada:**\nCrie pontes conceituais entre os argumentos\n\n✨ **Excelência textual:** Demonstre domínio pleno da modalidade culta"
      },
      conclusao: {
        beginner: "🎯 ESTRUTURA CONCLUSÃO\n\n💡 ANÁLISE RÁPIDA\nSua conclusão deve retomar a tese, resumir argumentos e propor uma solução.\n\n📝 SUGESTÃO PRINCIPAL\nUse: Retomada da tese + Síntese dos argumentos + Proposta de intervenção completa.\n\n🔧 COMO MELHORAR\n• Retome sua opinião principal rapidamente\n• Resuma os argumentos mais fortes\n• Proponha quem fará, o que fará, como fará e para quê\n\n❓ PRÓXIMA ETAPA\nMe mostre sua conclusão atual para eu te ajudar a melhorar?",
        intermediate: "🎯 **Aprimorando sua Conclusão**\n\n🎪 **Síntese elegante:**\nRetome argumentos de forma articulada, não apenas listando\n\n🛠️ **Proposta detalhada:**\nApresente soluções viáveis com múltiplos agentes\n\n🎯 **Especificidade:**\nEvite propostas genéricas (\"educação\" → \"campanhas nas redes sociais\")\n\n🔗 **Coesão total:**\nAmarre todos os elementos do texto de forma harmônica\n\n✨ **Impacto:** Termine com uma frase marcante que reforce sua tese",
        advanced: "🎯 **Excelência na Conclusão**\n\n🧠 **Síntese sofisticada:**\nDemonste a complexidade da questão e sua compreensão profunda\n\n🌍 **Proposta inovadora:**\nApresente soluções criativas, com múltiplas dimensões\n\n🎭 **Articulação magistral:**\nIntegre todos os elementos textuais com maestria\n\n💫 **Fechamento impactante:**\nTermine com reflexão profunda ou perspectiva visionária\n\n🏆 **Demonstração de excelência:** Evidencie domínio completo da escrita argumentativa"
      }
    };
    
    const sectionFallbacks = fallbacks[section as keyof typeof fallbacks];
    if (sectionFallbacks) {
      return sectionFallbacks[userLevel];
    }
    
    return "🎯 DESENVOLVIMENTO GERAL\n\n💡 ANÁLISE RÁPIDA\nVocê está no caminho certo, continue desenvolvendo suas ideias.\n\n📝 SUGESTÃO PRINCIPAL\nUse exemplos específicos e mantenha conexão clara com sua tese principal.\n\n🔧 COMO MELHORAR\n• Adicione dados ou casos concretos\n• Conecte cada ideia com sua opinião principal\n• Use conectivos para ligar as partes do texto\n\n❓ PRÓXIMA ETAPA\nEm que parte específica você quer trabalhar agora?";
  }

  // ==================== PROPOSAL METHODS ====================

  // Local analysis for proposal search - NO AI TOKENS USED!
  analyzeProposalSearchLocal(query: string): {
    keywords: string[];
    suggestedThemes: string[];
    suggestedExamTypes: string[];
    normalizedQuery: string;
  } {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    
    // Extract keywords
    const keywords = words.slice(0, 8);
    
    // Proposal-specific patterns
    const proposalPatterns = {
      'enem': ['enem'],
      'vestibular': ['vestibular', 'fuvest', 'unesp', 'unicamp'],
      'concurso': ['concurso', 'público'],
      'educação': ['education'],
      'tecnologia': ['technology'], 
      'meio ambiente': ['environment'],
      'sociedade': ['social'],
      'política': ['politics'],
      'economia': ['economy'],
      'cultura': ['culture'],
      'saúde': ['health']
    };
    
    let suggestedThemes: string[] = [];
    let suggestedExamTypes: string[] = [];
    
    // Check for pattern matches
    for (const [pattern, themes] of Object.entries(proposalPatterns)) {
      if (normalizedQuery.includes(pattern) || words.some(w => pattern.includes(w))) {
        if (['enem', 'vestibular', 'concurso'].includes(pattern)) {
          suggestedExamTypes.push(pattern);
        } else {
          suggestedThemes.push(...themes);
        }
      }
    }
    
    // Default suggestions if no matches
    if (suggestedThemes.length === 0) {
      suggestedThemes = ['social', 'education'];
    }
    if (suggestedExamTypes.length === 0) {
      suggestedExamTypes = ['enem', 'vestibular'];
    }
    
    return {
      keywords,
      suggestedThemes: Array.from(new Set(suggestedThemes)),
      suggestedExamTypes: Array.from(new Set(suggestedExamTypes)),
      normalizedQuery
    };
  }

  // Generate proposals using AI
  async generateProposalsBatch(userFilters: any, keywords: string[]): Promise<any[]> {
    try {
      const theme = userFilters.theme || 'social';
      const difficulty = userFilters.difficulty || 'medio';
      const examType = userFilters.examType || 'enem';
      
      const prompt = `Crie 3 propostas de redação para ${examType.toUpperCase()} sobre o tema "${theme}" com dificuldade "${difficulty}".

Para cada proposta, forneça:

1. **title**: Título curto e direto (máximo 60 caracteres)
2. **statement**: A proposta completa com comando da redação (200-300 palavras)
3. **supportingText**: Textos de apoio com dados, citações ou contexto (150-200 palavras)
4. **examName**: Nome específico do exame (ex: "ENEM 2023", "FUVEST 2024")
5. **year**: Ano da prova (2020-2024)
6. **keywords**: 5-8 palavras-chave relacionadas

Níveis de dificuldade:
- facil: Temas cotidianos, linguagem simples
- medio: Temas sociais relevantes, complexidade média  
- dificil: Temas complexos, múltiplas perspectivas
- muito-dificil: Temas abstratos, alta complexidade conceitual

Temas disponíveis: social, environment, technology, education, politics, economy, culture, health, ethics, globalization

Retorne APENAS um JSON válido:
[
  {
    "title": "...",
    "statement": "...",
    "supportingText": "...",
    "examName": "...",
    "year": 2023,
    "keywords": ["palavra1", "palavra2", ...]
  }
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log("No JSON found in response:", text);
        return this.generateFallbackProposals(userFilters, keywords);
      }
      
      const proposals = JSON.parse(jsonMatch[0]);
      
      return proposals.map((proposal: any) => ({
        ...proposal,
        theme,
        difficulty,
        examType,
        isAiGenerated: true,
        rating: Math.floor(Math.random() * 3) + 3 // 3-5 rating
      }));
      
    } catch (error) {
      console.error("Error generating proposals:", error);
      return this.generateFallbackProposals(userFilters, keywords);
    }
  }

  private generateFallbackProposals(userFilters: any, keywords: string[]): any[] {
    const { theme = 'social', difficulty = 'medio', examType = 'enem' } = userFilters;
    
    const fallbackProposals = [
      {
        title: "Desafios da Educação Digital no Brasil",
        statement: "Com a crescente digitalização da sociedade, a educação brasileira enfrenta o desafio de se adaptar às novas tecnologias. A partir da leitura dos textos motivadores e com base nos seus conhecimentos, redija um texto dissertativo-argumentativo sobre o tema 'Os desafios da implementação da educação digital no Brasil'. Apresente proposta de intervenção que respeite os direitos humanos.",
        supportingText: "Segundo dados do IBGE, apenas 67% dos domicílios brasileiros têm acesso à internet. Durante a pandemia, essa desigualdade digital se evidenciou ainda mais, com muitos estudantes sem conseguir acompanhar as aulas remotas.",
        examName: `${examType.toUpperCase()} 2023`,
        year: 2023,
        keywords: ["educação", "tecnologia", "desigualdade", "digital", "pandemia"]
      },
      {
        title: "Sustentabilidade e Consumo Consciente", 
        statement: "O consumismo excessivo tem gerado graves impactos ambientais. Com base nos textos de apoio e em seus conhecimentos, elabore um texto dissertativo-argumentativo sobre 'A importância do consumo consciente para a sustentabilidade ambiental'. Proponha medidas que promovam mudanças de comportamento na sociedade.",
        supportingText: "Dados da ONU indicam que a humanidade consome 70% mais recursos naturais do que o planeta consegue regenerar anualmente. O Brasil produz cerca de 79 milhões de toneladas de resíduos sólidos por ano.",
        examName: `${examType.toUpperCase()} 2024`,
        year: 2024,
        keywords: ["sustentabilidade", "consumo", "meio ambiente", "consciente", "recursos"]
      }
    ];
    
    return fallbackProposals.map(proposal => ({
      ...proposal,
      theme,
      difficulty,
      examType,
      isAiGenerated: true,
      rating: Math.floor(Math.random() * 2) + 3
    }));
  }
}

export const geminiService = new GeminiService();