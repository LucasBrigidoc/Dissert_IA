import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private readonly hasApiKey: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.hasApiKey = !!apiKey;
    
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      } catch (error) {
        console.warn("⚠️ Failed to initialize Gemini AI in GeminiService:", error);
        this.hasApiKey = false;
      }
    }
  }

  // Normalize query for consistent cache keys
  normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .substring(0, 100); // Limit length
  }

  // Local analysis of search queries (no AI tokens used)
  analyzeSearchQueryLocal(query: string): any {
    const normalizedQuery = query.toLowerCase();
    
    // Extract keywords
    const keywords = normalizedQuery
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['para', 'sobre', 'como', 'que', 'com', 'uma', 'das', 'dos', 'ser'].includes(word));

    // Suggest types based on keywords
    const suggestedTypes = [];
    if (keywords.some(k => ['filme', 'cinema', 'movie'].includes(k))) suggestedTypes.push('movies');
    if (keywords.some(k => ['lei', 'codigo', 'legal', 'juridico'].includes(k))) suggestedTypes.push('laws');
    if (keywords.some(k => ['livro', 'autor', 'literatura'].includes(k))) suggestedTypes.push('books');
    if (keywords.some(k => ['serie', 'tv', 'netflix'].includes(k))) suggestedTypes.push('series');
    if (keywords.some(k => ['pesquisa', 'estudo', 'dados', 'estatistica'].includes(k))) suggestedTypes.push('research');
    if (keywords.some(k => ['noticia', 'jornal', 'imprensa'].includes(k))) suggestedTypes.push('news');
    
    if (suggestedTypes.length === 0) {
      suggestedTypes.push('movies', 'books', 'research'); // Default suggestions
    }

    // Suggest categories based on keywords  
    const suggestedCategories = [];
    if (keywords.some(k => ['ambiente', 'sustentabilidade', 'ecologia', 'clima'].includes(k))) suggestedCategories.push('environment');
    if (keywords.some(k => ['tecnologia', 'digital', 'internet', 'ia'].includes(k))) suggestedCategories.push('technology');
    if (keywords.some(k => ['educacao', 'escola', 'ensino', 'professor'].includes(k))) suggestedCategories.push('education');
    if (keywords.some(k => ['saude', 'medicina', 'hospital', 'doenca'].includes(k))) suggestedCategories.push('health');
    if (keywords.some(k => ['politica', 'governo', 'eleicao', 'democracia'].includes(k))) suggestedCategories.push('politics');
    if (keywords.some(k => ['economia', 'trabalho', 'emprego', 'renda'].includes(k))) suggestedCategories.push('economy');
    if (keywords.some(k => ['cultura', 'arte', 'musica', 'teatro'].includes(k))) suggestedCategories.push('culture');
    if (keywords.some(k => ['social', 'sociedade', 'direitos', 'igualdade'].includes(k))) suggestedCategories.push('social');
    
    if (suggestedCategories.length === 0) {
      suggestedCategories.push('social', 'education', 'technology'); // Default suggestions
    }

    return {
      keywords,
      suggestedTypes,
      suggestedCategories,
      queryComplexity: keywords.length > 3 ? 'complex' : 'simple',
      searchIntent: this.determineSearchIntent(normalizedQuery)
    };
  }

  // Local analysis of proposal search queries 
  analyzeProposalSearchLocal(query: string): any {
    const normalizedQuery = query.toLowerCase();
    
    // Extract keywords
    const keywords = normalizedQuery
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['para', 'sobre', 'como', 'que', 'com', 'uma', 'das', 'dos', 'ser', 'redacao', 'tema'].includes(word));

    // Determine exam types based on keywords
    const suggestedExamTypes = [];
    if (keywords.some(k => ['enem', 'vestibular', 'universidade'].includes(k))) {
      suggestedExamTypes.push('enem', 'vestibular');
    } else if (keywords.some(k => ['concurso', 'publico', 'cargo'].includes(k))) {
      suggestedExamTypes.push('concurso');
    } else {
      suggestedExamTypes.push('enem', 'vestibular'); // Default
    }

    // Suggest themes based on keywords
    const suggestedThemes = [];
    if (keywords.some(k => ['tecnologia', 'digital', 'internet', 'inteligencia', 'artificial'].includes(k))) suggestedThemes.push('technology');
    if (keywords.some(k => ['ambiente', 'sustentabilidade', 'clima', 'preservacao'].includes(k))) suggestedThemes.push('environment');
    if (keywords.some(k => ['educacao', 'ensino', 'escola', 'conhecimento'].includes(k))) suggestedThemes.push('education');
    if (keywords.some(k => ['saude', 'medicina', 'bem-estar', 'pandemia'].includes(k))) suggestedThemes.push('health');
    if (keywords.some(k => ['politica', 'cidadania', 'democracia', 'direitos'].includes(k))) suggestedThemes.push('politics');
    if (keywords.some(k => ['economia', 'trabalho', 'desemprego', 'renda'].includes(k))) suggestedThemes.push('economy');
    if (keywords.some(k => ['cultura', 'diversidade', 'identidade', 'tradicao'].includes(k))) suggestedThemes.push('culture');
    if (keywords.some(k => ['violencia', 'seguranca', 'criminalidade', 'drogas'].includes(k))) suggestedThemes.push('social');
    
    if (suggestedThemes.length === 0) {
      suggestedThemes.push('social', 'technology', 'education'); // Default themes
    }

    return {
      keywords,
      suggestedExamTypes,
      suggestedThemes,
      difficulty: keywords.length > 4 ? 'dificil' : 'medio',
      searchComplexity: this.determineProposalComplexity(normalizedQuery)
    };
  }

  // Generate proposals batch using AI
  async generateProposalsBatch(config: any, keywords: string[] = []): Promise<any[]> {
    if (!this.hasApiKey || !this.model) {
      // Fallback proposals without AI
      return this.getFallbackProposals(config);
    }

    try {
      const prompt = this.buildProposalGenerationPrompt(config, keywords);
      
      console.log(`🎯 Generating proposals with Gemini AI (${config.examType} - ${config.theme})`);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse AI response
      const proposals = this.parseProposalsResponse(response, config);
      
      console.log(`✅ Generated ${proposals.length} proposals successfully`);
      return proposals;
      
    } catch (error) {
      console.error("Error in AI proposal generation:", error);
      return this.getFallbackProposals(config);
    }
  }

  private determineSearchIntent(query: string): string {
    if (query.includes('exemplo') || query.includes('modelo')) return 'examples';
    if (query.includes('melhor') || query.includes('top') || query.includes('famoso')) return 'popular';
    if (query.includes('recente') || query.includes('atual') || query.includes('novo')) return 'recent';
    return 'general';
  }

  private determineProposalComplexity(query: string): string {
    const complexWords = ['implementacao', 'desenvolvimento', 'impactos', 'consequencias', 'analise', 'discussao'];
    const hasComplexWords = complexWords.some(word => query.includes(word));
    return hasComplexWords ? 'complex' : 'simple';
  }

  private buildProposalGenerationPrompt(config: any, keywords: string[]): string {
    const keywordString = keywords.length > 0 ? keywords.join(', ') : 'geral';
    
    return `Gere 2 propostas de redação completas e realistas para ${config.examType} sobre o tema "${config.theme}".

CONFIGURAÇÃO:
- Tipo de exame: ${config.examType}
- Tema: ${config.theme}
- Dificuldade: ${config.difficulty || 'medio'}
- Palavras-chave: ${keywordString}

Responda APENAS com JSON válido no formato:

{
  "proposals": [
    {
      "title": "Título específico da proposta",
      "statement": "Comando da redação completo como em provas reais",
      "supportingText": "Textos de apoio com dados, citações ou contexto relevante",
      "examType": "${config.examType}",
      "theme": "${config.theme}",
      "difficulty": "${config.difficulty || 'medio'}",
      "year": "2024"
    }
  ]
}

INSTRUÇÕES:
- Propostas realistas como em provas oficiais
- Comandos claros e específicos
- Textos de apoio informativos e atuais
- Temas relevantes para ${config.examType}
- Responda APENAS o JSON, sem texto adicional`;
  }

  private parseProposalsResponse(response: string, config: any): any[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.proposals && Array.isArray(parsed.proposals)) {
        return parsed.proposals.map((proposal: any) => ({
          title: proposal.title || `Proposta sobre ${config.theme}`,
          statement: proposal.statement || `Redija um texto dissertativo-argumentativo sobre ${config.theme}.`,
          supportingText: proposal.supportingText || "Considere os aspectos sociais, econômicos e culturais do tema.",
          examType: config.examType || 'enem',
          theme: config.theme || 'social',
          difficulty: config.difficulty || 'medio',
          year: '2024'
        }));
      }
      
      throw new Error("Invalid proposals format");
      
    } catch (error) {
      console.error("Error parsing proposals response:", error);
      return this.getFallbackProposals(config);
    }
  }

  private getFallbackProposals(config: any): any[] {
    const themeTitle = this.getThemeTitle(config.theme);
    const examType = config.examType || 'enem';
    
    return [
      {
        title: themeTitle,
        statement: `Com base na leitura dos textos motivadores e nos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema "${themeTitle}", apresentando proposta de intervenção que respeite os direitos humanos.`,
        supportingText: this.getSupportingText(config.theme),
        examType,
        theme: config.theme || 'social',
        difficulty: config.difficulty || 'medio',
        year: '2024'
      },
      {
        title: `Desafios contemporâneos: ${themeTitle.toLowerCase()}`,
        statement: `Considerando os desafios do Brasil contemporâneo, discuta em um texto dissertativo-argumentativo a importância de abordar a questão de "${themeTitle.toLowerCase()}" na sociedade atual, propondo soluções viáveis para os problemas identificados.`,
        supportingText: this.getAlternativeSupportingText(config.theme),
        examType,
        theme: config.theme || 'social',
        difficulty: config.difficulty || 'medio',
        year: '2024'
      }
    ];
  }

  private getThemeTitle(theme: string): string {
    const themes: Record<string, string> = {
      'technology': 'A influência da tecnologia na sociedade contemporânea',
      'environment': 'Sustentabilidade e preservação ambiental no Brasil',
      'education': 'Desafios da educação brasileira no século XXI',
      'health': 'Saúde pública e qualidade de vida no Brasil',
      'politics': 'Participação política e cidadania no Brasil',
      'economy': 'Desigualdade econômica e oportunidades no Brasil',
      'culture': 'Diversidade cultural e identidade nacional',
      'social': 'Questões sociais e direitos humanos no Brasil contemporâneo'
    };
    return themes[theme] || 'Desafios da sociedade brasileira contemporânea';
  }

  private getSupportingText(theme: string): string {
    const supportingTexts: Record<string, string> = {
      'technology': 'A revolução digital transformou profundamente as relações sociais, o mercado de trabalho e os processos educacionais. Dados do IBGE mostram que mais de 80% dos brasileiros possuem acesso à internet, evidenciando a necessidade de políticas públicas que garantam inclusão digital e uso consciente da tecnologia.',
      'environment': 'O Brasil abriga a maior biodiversidade do planeta e possui 60% da Floresta Amazônica. Segundo o INPE, o desmatamento aumentou 30% nos últimos anos, evidenciando a urgência de políticas de preservação que conciliem desenvolvimento econômico e sustentabilidade ambiental.',
      'education': 'O Índice de Desenvolvimento da Educação Básica (IDEB) revela disparidades significativas na qualidade do ensino brasileiro. Dados do PISA mostram que o Brasil ocupa posições baixas em rankings internacionais, demandando reformas estruturais no sistema educacional.',
      'social': 'O Brasil enfrenta desafios históricos relacionados à desigualdade social, violência urbana e garantia de direitos fundamentais. Dados do IBGE indicam que milhões de brasileiros ainda vivem em situação de vulnerabilidade, requerendo políticas públicas efetivas de inclusão social.'
    };
    return supportingTexts[theme] || 'A sociedade brasileira contemporânea enfrenta diversos desafios que exigem análise crítica e propostas de soluções estruturais para o desenvolvimento sustentável e a garantia dos direitos fundamentais.';
  }

  private getAlternativeSupportingText(theme: string): string {
    const alternativeTexts: Record<string, string> = {
      'technology': 'A inteligência artificial e a automação estão redefinindo o futuro do trabalho. Estudos indicam que até 2030, milhões de empregos serão transformados pela tecnologia, exigindo capacitação profissional e políticas de transição para os trabalhadores.',
      'environment': 'As mudanças climáticas representam um dos maiores desafios do século XXI. O Acordo de Paris estabelece metas ambiciosas de redução de emissões, e o Brasil tem papel fundamental nesse contexto devido à sua matriz energética e recursos naturais.',
      'education': 'A pandemia de COVID-19 evidenciou as desigualdades educacionais no Brasil. Milhões de estudantes ficaram sem acesso ao ensino remoto, ampliando as disparidades sociais e demandando investimentos em infraestrutura e tecnologia educacional.',
      'social': 'Os direitos humanos fundamentais, estabelecidos pela Constituição Federal de 1988, ainda não são plenamente garantidos para todos os brasileiros. Questões como moradia, segurança alimentar e acesso à justiça permanecem como desafios sociais urgentes.'
    };
    return alternativeTexts[theme] || 'A construção de uma sociedade mais justa e igualitária requer o comprometimento de todos os setores sociais na implementação de políticas públicas efetivas e na promoção da cidadania plena.';
  }
}

export const geminiService = new GeminiService();