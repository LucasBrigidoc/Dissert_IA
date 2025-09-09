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
      introducao: {
        beginner: "Para a introdução, vou te ensinar a estrutura básica: 1) Contextualização (apresentar o tema), 2) Problematização (mostrar por que é importante) e 3) Tese (sua opinião clara).",
        intermediate: "Para a introdução, vamos aprimorar sua apresentação do tema com dados relevantes, contextualização histórica/social e uma tese mais persuasiva e bem fundamentada.",
        advanced: "Para a introdução, vamos refinar a contextualização com abordagens mais sofisticadas, conectores mais elaborados e uma tese que dialogue melhor com a complexidade do tema."
      },
      desenvolvimento1: {
        beginner: "No primeiro desenvolvimento, vou te mostrar como construir um argumento: 1) Tópico frasal (ideia principal), 2) Fundamentação (explicar a ideia), 3) Exemplificação (dados, casos, pesquisas) e 4) Conclusão do parágrafo.",
        intermediate: "No primeiro desenvolvimento, vamos fortalecer sua argumentação com exemplos mais específicos, dados atualizados e uma melhor articulação entre as ideias para maior coesão textual.",
        advanced: "No primeiro desenvolvimento, vamos sofisticar a argumentação com perspectivas multidisciplinares, exemplos menos óbvios e conexões mais profundas com a tese proposta."
      },
      desenvolvimento2: {
        beginner: "No segundo desenvolvimento, vou te ajudar a criar um argumento diferente do primeiro, mas que também defenda sua tese. Lembre-se da mesma estrutura: tópico frasal + fundamentação + exemplos + conclusão.",
        intermediate: "No segundo desenvolvimento, vamos construir um argumento complementar que dialogue com o primeiro, variando os tipos de exemplos e fortalecendo a linha argumentativa geral.",
        advanced: "No segundo desenvolvimento, vamos elaborar uma perspectiva que enriqueça e complexifique a argumentação, evitando redundâncias e criando uma progressão argumentativa consistente."
      },
      conclusao: {
        beginner: "Na conclusão, vou te ensinar a estrutura: 1) Retomar a tese, 2) Sintetizar os argumentos principais e 3) Propor uma solução (intervenção) com agente + ação + meio + finalidade + detalhamento.",
        intermediate: "Na conclusão, vamos criar uma síntese mais elegante dos argumentos e desenvolver uma proposta de intervenção mais detalhada e viável, considerando diferentes agentes sociais.",
        advanced: "Na conclusão, vamos elaborar uma síntese que demonstre a complexidade da questão e propor intervenções inovadoras e bem fundamentadas, considerando múltiplas dimensões do problema."
      }
    };

    let prompt = `Você é um tutor de redação especializado em vestibulares brasileiros, com didática adaptada ao nível do estudante. Seja acolhedor, encorajador e prático.\n\n`;
    
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
    if (userLevel === 'beginner') {
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
    
    prompt += `Estruture sua resposta com emojis e seções claras para facilitar a leitura.`;
    
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
      introducao: {
        beginner: "🎯 **Estrutura da Introdução**\n\n📍 **1º Passo - Contextualização:**\nComece apresentando o tema de forma geral. Ex: \"No mundo contemporâneo...\"\n\n📍 **2º Passo - Problematização:**\nMostre por que o tema é importante. Ex: \"Esse cenário evidencia...\"\n\n📍 **3º Passo - Tese:**\nApresente sua opinião clara. Ex: \"Nesse sentido, é necessário...\"\n\n💡 **Dica:** Use dados ou estatísticas para fortalecer sua contextualização!",
        intermediate: "🎯 **Aprimorando sua Introdução**\n\n📈 **Contextualização mais rica:**\nUse dados atuais, contexto histórico ou comparações internacionais\n\n🔍 **Problematização sofisticada:**\nMostre causas e consequências do problema\n\n💭 **Tese mais persuasiva:**\nUse argumentos de autoridade ou dados para sustentar sua posição\n\n🔗 **Conectivos eficazes:** \"Diante desse cenário\", \"Nessa perspectiva\", \"Sob essa ótica\"",
        advanced: "🎯 **Refinando sua Introdução**\n\n🌐 **Contextualização multidimensional:**\nAborde aspectos históricos, sociais, econômicos e culturais\n\n🧠 **Problematização complexa:**\nExplore paradoxos, contradições e múltiplas causas\n\n✨ **Tese sofisticada:**\nProponha soluções inovadoras com base em evidências robustas\n\n📚 **Conectivos refinados:** \"Sob essa perspectiva\", \"Nessa conjuntura\", \"À luz dessas considerações\""
      },
      desenvolvimento1: {
        beginner: "🎯 **Estrutura do 1º Desenvolvimento**\n\n📌 **Tópico frasal:**\nComece com a ideia principal do parágrafo. Ex: \"Em primeiro lugar...\"\n\n📖 **Fundamentação:**\nExplique sua ideia com mais detalhes\n\n📊 **Exemplificação:**\nUse dados, pesquisas, casos históricos ou atuais\n\n🔚 **Conclusão do parágrafo:**\nAmarre a ideia conectando com sua tese\n\n💡 **Conectivos úteis:** \"Ademais\", \"Nesse sentido\", \"Por conseguinte\"",
        intermediate: "🎯 **Fortalecendo seu 1º Argumento**\n\n🎪 **Diversifique exemplos:**\nCombine dados estatísticos + casos reais + referências culturais\n\n📚 **Fundamentação robusta:**\nCite especialistas, pesquisas acadêmicas ou organismos oficiais\n\n🔗 **Coesão textual:**\nConecte claramente com a tese da introdução\n\n💪 **Argumento convincente:**\nMostre causa-efeito, compare cenários ou apresente evidências contundentes",
        advanced: "🎯 **Sofisticando seu 1º Argumento**\n\n🧩 **Perspectiva multidisciplinar:**\nIntegre visões sociológicas, filosóficas, econômicas\n\n🎭 **Exemplos não-óbvios:**\nUse referencias culturais elaboradas, casos internacionais, dados comparativos\n\n🌊 **Progressão argumentativa:**\nCrie uma linha de raciocínio que evolui logicamente\n\n🎨 **Sofisticação textual:**\nUse períodos mais complexos e vocabulário técnico apropriado"
      },
      desenvolvimento2: {
        beginner: "🎯 **Estrutura do 2º Desenvolvimento**\n\n🔄 **Argumento diferente:**\nTraga uma nova perspectiva que também defenda sua tese\n\n📌 **Mesma estrutura:**\nTópico frasal + fundamentação + exemplos + conclusão\n\n🎯 **Tipos de argumento:**\n• Econômico, social, ambiental, cultural, histórico\n\n🔗 **Conecte com o 1º:**\nUse \"Além disso\", \"Outrossim\", \"Paralelamente\"\n\n💡 **Varie os exemplos:** Se usou dados no 1º, use casos históricos no 2º",
        intermediate: "🎯 **Complementando sua Argumentação**\n\n🔄 **Argumento complementar:**\nAborde outra dimensão do problema (ex: se falou de causas, fale de consequências)\n\n📊 **Varie evidências:**\nAlterne entre dados nacionais/internacionais, casos históricos/contemporâneos\n\n🧭 **Linha argumentativa:**\nMantenha coerência com o conjunto da argumentação\n\n🎨 **Conectivos variados:** \"Ademais\", \"Por outro lado\", \"Simultaneamente\"",
        advanced: "🎯 **Complexificando a Argumentação**\n\n🌐 **Perspectiva dialética:**\nExplore tensões, contradições ou múltiplas facetas do problema\n\n🎭 **Abordagem inovadora:**\nUse analogias sofisticadas, casos paradigmáticos, análises comparativas\n\n🧠 **Articulação sofisticada:**\nCrie pontes conceituais entre os argumentos\n\n✨ **Excelência textual:** Demonstre domínio pleno da modalidade culta"
      },
      conclusao: {
        beginner: "🎯 **Estrutura da Conclusão**\n\n🔄 **1º Passo - Retomada:**\nLembre rapidamente sua tese principal\n\n📝 **2º Passo - Síntese:**\nResumir os argumentos mais importantes\n\n🛠️ **3º Passo - Proposta (obrigatória):**\n• **Agente:** Quem vai fazer (governo, sociedade, escola...)\n• **Ação:** O que vai fazer especificamente\n• **Meio:** Como vai fazer\n• **Finalidade:** Para que/por que\n• **Detalhamento:** Mais informações sobre como\n\n💡 **Exemplo:** \"O governo federal deve implementar (ação) políticas de conscientização (detalhamento) por meio de campanhas educativas (meio) a fim de reduzir a violência urbana (finalidade).\"",
        intermediate: "🎯 **Aprimorando sua Conclusão**\n\n🎪 **Síntese elegante:**\nRetome argumentos de forma articulada, não apenas listando\n\n🛠️ **Proposta detalhada:**\nApresente soluções viáveis com múltiplos agentes\n\n🎯 **Especificidade:**\nEvite propostas genéricas (\"educação\" → \"campanhas nas redes sociais\")\n\n🔗 **Coesão total:**\nAmarre todos os elementos do texto de forma harmônica\n\n✨ **Impacto:** Termine com uma frase marcante que reforce sua tese",
        advanced: "🎯 **Excelência na Conclusão**\n\n🧠 **Síntese sofisticada:**\nDemonste a complexidade da questão e sua compreensão profunda\n\n🌍 **Proposta inovadora:**\nApresente soluções criativas, com múltiplas dimensões\n\n🎭 **Articulação magistral:**\nIntegre todos os elementos textuais com maestria\n\n💫 **Fechamento impactante:**\nTermine com reflexão profunda ou perspectiva visionária\n\n🏆 **Demonstração de excelência:** Evidencie domínio completo da escrita argumentativa"
      }
    };
    
    const sectionFallbacks = fallbacks[section as keyof typeof fallbacks];
    if (sectionFallbacks) {
      return sectionFallbacks[userLevel];
    }
    
    return "🎯 Continue desenvolvendo sua ideia com exemplos específicos e mantenha a coesão com sua tese principal. Lembre-se de conectar todas as partes do seu texto de forma harmônica!";
  }
}

export const geminiService = new GeminiService();