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
    } else if (keywords.some(k => ['concurso', 'publico', 'cargo', 'cnu', 'cespe', 'fcc', 'vunesp', 'ibfc', 'quadrix', 'cebraspe'].includes(k))) {
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

  // Search for real exam proposals using Gemini's knowledge
  async searchRealProposalsFromKnowledge(query: string, examType?: string, year?: number): Promise<any> {
    if (!this.hasApiKey || !this.model) {
      console.log('⚠️ Cannot search real proposals: Gemini API not available');
      return { found: false, proposals: [], similarProposals: [] };
    }

    try {
      console.log(`🧠 Asking Gemini if it knows about real exam: "${query}"`);
      
      // Ask Gemini directly about its knowledge of this specific exam
      const searchPrompt = `Você tem conhecimento sobre a prova "${query}"?

IMPORTANTE: Responda com base APENAS no seu conhecimento de treinamento. Não invente informações.

Se você CONHECE essa prova específica:
- Diga qual foi a proposta de redação REAL cobrada
- Inclua o título EXATO, comando COMPLETO e textos de apoio
- Marque found: true

Se você NÃO CONHECE essa prova específica:
- Marque found: false
- Sugira propostas de provas SIMILARES que você conhece (mesmo exame de outros anos, ou tema parecido)

Responda APENAS com JSON válido no formato:

{
  "found": true ou false,
  "message": "breve explicação",
  "proposals": [
    {
      "title": "Título EXATO da proposta (se conhece)",
      "statement": "Comando COMPLETO da redação (se conhece)",
      "supportingText": "Textos de apoio fornecidos (se conhece)",
      "examName": "${query}",
      "examType": "${examType || 'enem'}",
      "theme": "tema (social, technology, environment, etc)",
      "difficulty": "medio",
      "year": "${year || new Date().getFullYear()}"
    }
  ],
  "similarProposals": [
    // Se NÃO conhece a prova específica, liste propostas PARECIDAS que você conhece
    {
      "title": "Título de prova similar",
      "statement": "Comando da redação",
      "supportingText": "Textos de apoio",
      "examName": "Nome da prova similar (ex: ENEM 2018)",
      "examType": "enem ou vestibular",
      "theme": "tema",
      "difficulty": "medio",
      "year": "ano"
    }
  ]
}`;

      const result = await this.model.generateContent(searchPrompt);
      const response = result.response.text();
      
      console.log(`📖 Gemini knowledge response received`);
      
      // Parse response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('⚠️ No JSON found in Gemini response');
        return { found: false, proposals: [], similarProposals: [] };
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.found && parsed.proposals && parsed.proposals.length > 0) {
        console.log(`✅ Gemini generated ${parsed.proposals.length} proposal(s) based on knowledge`);
        return {
          found: true,
          proposals: parsed.proposals.map((p: any) => ({
            ...p,
            isAiGenerated: false,
            source: 'gemini_knowledge'
          })),
          similarProposals: [],
          message: parsed.message
        };
      } else if (!parsed.found && parsed.similarProposals && parsed.similarProposals.length > 0) {
        console.log(`ℹ️ Gemini generated ${parsed.similarProposals.length} similar proposal(s)`);
        return {
          found: false,
          proposals: [],
          similarProposals: parsed.similarProposals.map((p: any) => ({
            ...p,
            isAiGenerated: false,
            source: 'gemini_knowledge_similar'
          })),
          message: parsed.message || `Não encontrei informações sobre ${query}, mas conheço estas provas similares:`
        };
      }
      
      console.log(`ℹ️ Gemini doesn't have knowledge about this exam`);
      return {
        found: false,
        proposals: [],
        similarProposals: [],
        message: parsed.message || 'Não encontrei essa prova específica no meu conhecimento'
      };
      
    } catch (error) {
      console.error('Error searching real proposals from Gemini knowledge:', error);
      return { found: false, proposals: [], similarProposals: [] };
    }
  }

  // Generate proposals batch using AI
  async generateProposalsBatch(config: any, keywords: string[] = []): Promise<{ proposals: any[], tokensUsed: number, promptTokens: number, outputTokens: number }> {
    if (!this.hasApiKey || !this.model) {
      // Fallback proposals without AI
      return {
        proposals: this.getFallbackProposals(config),
        tokensUsed: 0,
        promptTokens: 0,
        outputTokens: 0
      };
    }

    try {
      const prompt = this.buildProposalGenerationPrompt(config, keywords);
      
      console.log(`🎯 Generating proposals with Gemini AI (${config.examType} - ${config.theme})`);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract token usage metadata from Gemini response
      const usageMetadata = result.response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const outputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum: number, count: number) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const totalTokens = usageMetadata.totalTokenCount || 0;
      
      console.log(`📊 Gemini Proposal Generation - Tokens: prompt=${promptTokens}, output=${outputTokens}, total=${totalTokens}`);
      
      // Parse AI response
      const proposals = this.parseProposalsResponse(response, config);
      
      console.log(`✅ Generated ${proposals.length} proposals successfully`);
      
      return {
        proposals,
        tokensUsed: totalTokens,
        promptTokens,
        outputTokens
      };
      
    } catch (error) {
      console.error("Error in AI proposal generation:", error);
      return {
        proposals: this.getFallbackProposals(config),
        tokensUsed: 0,
        promptTokens: 0,
        outputTokens: 0
      };
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
          year: '2024',
          isAiGenerated: true
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
        year: '2024',
        isAiGenerated: true
      },
      {
        title: `Desafios contemporâneos: ${themeTitle.toLowerCase()}`,
        statement: `Considerando os desafios do Brasil contemporâneo, discuta em um texto dissertativo-argumentativo a importância de abordar a questão de "${themeTitle.toLowerCase()}" na sociedade atual, propondo soluções viáveis para os problemas identificados.`,
        supportingText: this.getAlternativeSupportingText(config.theme),
        examType,
        theme: config.theme || 'social',
        difficulty: config.difficulty || 'medio',
        year: '2024',
        isAiGenerated: true
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

  async generateEssayOutline(questionnaireData: any): Promise<any> {
    if (!this.hasApiKey || !this.model) {
      throw new Error("GEMINI_API_KEY não configurada. Configure a chave da API para usar esta funcionalidade.");
    }

    try {
      const prompt = this.buildOutlinePrompt(questionnaireData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract token usage metadata from Gemini response
      const usageMetadata = result.response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const outputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum, count) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const totalTokens = usageMetadata.totalTokenCount || 0;

      console.log(`📊 Gemini Essay Outline - Tokens: prompt=${promptTokens}, output=${outputTokens}, total=${totalTokens}`);

      const outline = this.parseOutlineResponse(text, questionnaireData.proposal);
      
      return {
        outline,
        tokensUsed: totalTokens,
        promptTokens,
        outputTokens
      };
    } catch (error) {
      console.error("Erro ao gerar roteiro:", error);
      throw new Error("Erro ao gerar roteiro. Tente novamente.");
    }
  }

  private buildOutlinePrompt(data: any): string {
    const { proposal, familiarityLevel, problemsAndChallenges, knownReferences, detailLevel } = data;

    const familiarityMap: Record<string, string> = {
      'never-studied': 'nunca estudou esse assunto',
      'know-little': 'conhece um pouco sobre o tema',
      'studied-can-develop': 'já estudou e sabe desenvolver',
      'advanced-mastery': 'tem domínio avançado sobre o tema'
    };
    const familiarityText = familiarityMap[familiarityLevel as string] || 'nível não especificado';

    const problemsText = problemsAndChallenges.dontKnow 
      ? 'não conhece problemas ou desafios relacionados ao tema'
      : problemsAndChallenges.text;

    const referencesText = knownReferences.hasReferences && knownReferences.references
      ? knownReferences.references
      : 'não possui repertório sobre este tema';

    const detailText = detailLevel === 'step-by-step' 
      ? 'passo a passo detalhado' 
      : 'direções gerais';

    const detailInstructions = detailLevel === 'step-by-step' 
      ? `
**🎯 ATENÇÃO - MODO PASSO A PASSO ULTRA DETALHADO ATIVADO:**

O estudante solicitou um roteiro EXTREMAMENTE DETALHADO. Este é um nível MÁXIMO de orientação. Cada frase do roteiro deve ser:

📝 **TAMANHO E PROFUNDIDADE:**
- Cada frase deve ter NO MÍNIMO 4-6 linhas de texto corrido
- Inclua 3-5 períodos completos em cada orientação
- Transforme cada ponto em um mini-tutorial explicativo
- Não economize palavras - seja VERBOSO e DIDÁTICO

🎓 **CONTEÚDO ESPECÍFICO:**
- Mencione exemplos CONCRETOS e ESPECÍFICOS ao tema (nomes de leis, datas, números, estatísticas reais)
- Cite repertórios EXATOS (ex: "Mencione o Artigo 5º da Constituição Federal", "Cite dados do IBGE 2023 sobre X")
- Forneça CONECTIVOS EXATOS para começar cada frase (ex: "Inicie com: 'Historicamente, desde...'")
- Explique o RACIOCÍNIO ARGUMENTATIVO por trás de cada escolha

🔧 **INSTRUÇÕES PRÁTICAS:**
- Diga EXATAMENTE como começar a frase (palavras iniciais sugeridas)
- Explique COMO desenvolver o raciocínio (passo 1, passo 2, passo 3...)
- Indique QUANTAS linhas escrever para aquele ponto
- Sugira ESTRUTURA DE FRASE (ex: "Na primeira parte da frase, faça X. Na segunda parte, complemente com Y")

💡 **ORIENTAÇÕES EXTRAS:**
- Adicione DICAS DE REDAÇÃO em cada ponto
- Inclua ALERTAS sobre o que EVITAR
- Sugira SINÔNIMOS e variações de vocabulário
- Explique COMO CONECTAR este ponto com o próximo

**COMPARAÇÃO - O QUE VOCÊ DEVE FAZER:**

❌ **MODO GENÉRICO (NÃO FAÇA ASSIM):**
"Contextualize com repertório sobre o tema e apresente a tese"

✅ **MODO ULTRA DETALHADO (FAÇA ASSIM):**
"Inicie o primeiro parágrafo com uma contextualização histórica ou sociocultural específica ao tema. Você pode começar a frase com conectivos como 'Historicamente,', 'Desde o século XX,', 'De acordo com dados recentes,' ou 'Segundo a pesquisa X de 2023,'. Por exemplo, se o tema for sobre impacto das redes sociais, mencione: 'Segundo pesquisa do IBGE de 2023, 85% dos brasileiros utilizam redes sociais diariamente, o que demonstra a centralidade dessas plataformas na vida contemporânea'. Desenvolva esta contextualização em 2-3 linhas (aproximadamente 40-50 palavras), mostrando a RELEVÂNCIA do repertório escolhido para introduzir o problema. Em seguida, na segunda frase, use um conectivo de contraste como 'Entretanto,', 'Contudo,', 'Todavia,' ou 'No entanto,' para apresentar a PROBLEMÁTICA central. Estruture assim: [Conectivo de contraste] + [apresentação do problema] + [sua tese/posicionamento]. Exemplo: 'Entretanto, esse uso massivo tem gerado debates sobre privacidade e saúde mental, tornando urgente a discussão sobre regulamentação e educação digital'. Esta frase deve ter aproximadamente 25-35 palavras. DICA: evite generalizações como 'sempre foi assim' ou 'todos sabem'; seja específico e use dados/fatos. ATENÇÃO: não cite o repertório sem explicar sua relação com o tema - sempre conecte o repertório à problemática que será discutida."

Cada orientação do roteiro deve ser TÃO DETALHADA quanto o exemplo acima. O estudante deve poder praticamente COPIAR suas instruções como guia de escrita.

⚠️ **IMPORTANTE - FORMATAÇÃO DA RESPOSTA:**
NÃO inclua marcações de quantidade como "(Aprox. 4-5 linhas)", "(60-80 palavras)", "(2-3 linhas)" ou similares no roteiro final. 
Essas instruções são apenas para VOCÊ seguir internamente ao criar o conteúdo, mas o usuário NÃO DEVE VER essas anotações.
`
      : `
**MODO DIREÇÕES GERAIS:**
Forneça orientações objetivas, concisas e diretas. Cada frase do roteiro deve ter 1-2 linhas, indicando apenas o caminho principal sem detalhamento excessivo. Seja direto ao ponto.

⚠️ **IMPORTANTE - FORMATAÇÃO DA RESPOSTA:**
NÃO inclua marcações de quantidade como "(Aprox. 4-5 linhas)", "(60-80 palavras)", "(2-3 linhas)" ou similares no roteiro final.
O usuário NÃO DEVE VER essas anotações técnicas.
`;

    return `Você é um especialista em redações dissertativo-argumentativas nota 1000. Crie um roteiro estruturado para uma redação dissertativo-argumentativa baseado nas seguintes informações:

**PROPOSTA DA REDAÇÃO:**
${proposal}

**PERFIL DO ESTUDANTE:**
- Nível de familiaridade: ${familiarityText}
- Problemas/desafios conhecidos: ${problemsText}
- Repertório disponível: ${referencesText}
- Detalhamento desejado: ${detailText}

${detailInstructions}

**INSTRUÇÕES IMPORTANTES:**
Garanta que o roteiro evite cenários onde o estudante:
- Fique no genérico sem aprofundar
- Cite repertório sem explicar bem
- Faça conclusão incompleta
- Perca foco e fuja do tema

**ANÁLISE CRÍTICA DOS INPUTS DO USUÁRIO:**

1. **Análise dos Repertórios Fornecidos:**
   ${knownReferences.hasReferences && knownReferences.references ? `
   O estudante mencionou: "${referencesText}"
   
   IMPORTANTE: Avalie se esses repertórios se relacionam DIRETAMENTE com o tema "${proposal}".
   - Se os repertórios fornecidos forem relevantes e bem relacionados ao tema, inclua-os nas sugestões e explique como usá-los.
   - Se os repertórios fornecidos NÃO se relacionarem bem com o tema ou forem genéricos demais, SUBSTITUA por repertórios mais adequados e específicos ao tema. Explique por que os alternativos são melhores.
   - Se os repertórios fornecidos forem parcialmente relevantes, mantenha os bons e complemente com outros mais específicos.
   ` : `
   O estudante não possui repertório sobre este tema.
   Forneça repertórios ALTAMENTE ESPECÍFICOS e relacionados ao tema.
   `}

2. **Análise dos Problemas/Desafios/Soluções:**
   ${!problemsAndChallenges.dontKnow && problemsAndChallenges.text ? `
   O estudante mencionou: "${problemsText}"
   
   IMPORTANTE: Avalie se esses problemas/causas/desafios/soluções fazem sentido para o tema "${proposal}" e se podem ser usados na argumentação.
   - Se as ideias fornecidas forem relevantes e bem articuladas, incorpore-as no roteiro.
   - Se as ideias fornecidas NÃO se relacionarem bem com o tema ou não fizerem sentido argumentativo, sugira problemas/causas/desafios/soluções MAIS ADEQUADOS ao tema.
   - No roteiro, use os melhores argumentos (sejam os fornecidos pelo usuário ou os que você sugerir).
   ` : `
   O estudante não conhece problemas ou desafios relacionados ao tema.
   Forneça argumentos sólidos e específicos para este tema.
   `}

**SUGESTÕES DE REPERTÓRIO:**
Forneça 3-4 repertórios ESPECÍFICOS e DIRETAMENTE relacionados ao tema da proposta. Para cada repertório, explique CLARAMENTE:
- Por que ele é relevante para este tema específico
- Como ele pode ser usado na argumentação
- Qual aspecto da proposta ele ajuda a desenvolver

Tipos de repertório: filmes, séries, livros, dados estatísticos, leis/artigos, eventos históricos, pesquisas científicas, obras de arte, músicas, documentários, citações filosóficas/sociológicas.

**ESTRUTURA DO ROTEIRO:**

1. **ANÁLISE DA PROPOSTA:**
   - Proposta reformulada claramente
   - 3-5 palavras-chave obrigatórias
   - Categoria temática (cultura, direitos humanos, tecnologia, educação, meio ambiente, etc.)
   - Alertas de risco (tangenciamento, fuga ao tema, generalizações, etc.)
   - **EXPLICAÇÃO DO TEMA**: Forneça uma explicação clara e didática sobre o que trata o tema da proposta, adaptada ao nível de familiaridade do estudante:
     * Se o estudante NUNCA ESTUDOU o tema (${familiarityText === 'nunca estudou esse assunto' ? 'ESTE É O CASO' : 'não é o caso'}): Explique o tema de forma INTRODUTÓRIA e DIDÁTICA, como se fosse a primeira vez que ele está tendo contato. Use linguagem acessível e defina conceitos básicos.
     * Se o estudante CONHECE UM POUCO (${familiarityText === 'conhece um pouco sobre o tema' ? 'ESTE É O CASO' : 'não é o caso'}): Explique o tema de forma INTERMEDIÁRIA, reforçando pontos-chave e adicionando contextos importantes que ele pode não conhecer completamente.
     * Se o estudante JÁ ESTUDOU E SABE DESENVOLVER (${familiarityText === 'já estudou e sabe desenvolver' ? 'ESTE É O CASO' : 'não é o caso'}): Explique o tema de forma AVANÇADA, destacando nuances, debates contemporâneos e aspectos mais profundos que enriquecerão a redação.
     * Se o estudante TEM DOMÍNIO AVANÇADO (${familiarityText === 'tem domínio avançado sobre o tema' ? 'ESTE É O CASO' : 'não é o caso'}): Explique o tema de forma ESPECIALIZADA, trazendo perspectivas críticas, debates acadêmicos e conexões complexas que demonstrem alto nível de conhecimento.
     
     A explicação deve ter 3-5 frases bem estruturadas e específicas ao tema proposto "${proposal}".

2. **ROTEIRO EM 4 BLOCOS:**

   **1º Parágrafo - Introdução (60-80 palavras):**
   - 1ª frase: Contextualize com repertório PRODUTIVO específico ao tema (use um dos repertórios sugeridos ou similar)
   - 2ª frase: Contraste com "entretanto/contudo/todavia" + formule a TESE
   - 3ª frase: Anuncie os 2 argumentos centrais

   **2º Parágrafo - 1º Desenvolvimento (80-100 palavras):**
   - 1ª frase: Introduza primeira causa/argumento com dados ou exemplo concreto específico ao tema
   - 2ª frase: Explique e aprofunde mostrando consequências
   - 3ª frase: Conclua e conecte com a tese

   **3º Parágrafo - 2º Desenvolvimento (80-100 palavras):**
   - 1ª frase: Apresente segunda causa/argumento
   - 2ª frase: Explique com dados, leis, obras culturais ou pesquisas ESPECÍFICAS ao tema
   - 3ª frase: Feche e prepare para conclusão

   **4º Parágrafo - Conclusão (60-80 palavras):**
   - 1ª frase: Retome problema e tese
   - 2ª frase: Proposta COMPLETA (Quem? O que? Como? Por meio de quê? Para quê?)
   - 3ª frase: Consequência positiva esperada

Retorne APENAS um JSON com esta estrutura:
{
  "proposta": "proposta reformulada",
  "palavrasChave": ["palavra1", "palavra2", "palavra3"],
  "categoriaTematica": "categoria",
  "alertasRisco": ["alerta1", "alerta2"],
  "explicacaoTema": "Explicação didática e clara sobre o tema, adaptada ao nível de familiaridade do estudante (3-5 frases bem estruturadas)",
  "analiseRepertorio": "Se o usuário forneceu repertórios, explique aqui se foram mantidos, ajustados ou substituídos e POR QUÊ. Se não forneceu, omita este campo.",
  "analiseProblemas": "Se o usuário forneceu problemas/causas/soluções, explique aqui se foram incorporados ou se você sugeriu alternativas melhores e POR QUÊ. Se não forneceu, omita este campo.",
  "repertoriosSugeridos": [
    {
      "titulo": "Nome do repertório (ex: Filme 'Pantera Negra', Constituição Federal Art. 216, etc.)",
      "tipo": "tipo (filme/livro/lei/dado/evento/pesquisa/etc)",
      "relacao": "Explicação clara e específica de como este repertório se relaciona com o tema da proposta e como pode ser usado na redação"
    }
  ],
  "introducao": {
    "frase1": "...",
    "frase2": "...",
    "frase3": "..."
  },
  "desenvolvimento1": {
    "frase1": "...",
    "frase2": "...",
    "frase3": "..."
  },
  "desenvolvimento2": {
    "frase1": "...",
    "frase2": "...",
    "frase3": "..."
  },
  "conclusao": {
    "frase1": "...",
    "frase2": "...",
    "frase3": "..."
  }
}`;
  }

  private parseOutlineResponse(text: string, originalProposal: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      throw new Error("Formato de resposta inválido");
    } catch (error) {
      console.error("Erro ao fazer parse da resposta:", error);
      return {
        proposta: originalProposal,
        palavrasChave: ["tema", "sociedade", "Brasil"],
        categoriaTematica: "social",
        alertasRisco: ["Evite generalizações", "Aprofunde os argumentos"],
        introducao: {
          frase1: "Contextualize o tema com repertório produtivo",
          frase2: "Contraste com a realidade e formule sua tese",
          frase3: "Anuncie os dois argumentos centrais"
        },
        desenvolvimento1: {
          frase1: "Introduza a primeira causa com dados concretos",
          frase2: "Explique e aprofunde mostrando consequências",
          frase3: "Conclua e conecte com a tese"
        },
        desenvolvimento2: {
          frase1: "Apresente a segunda causa/argumento",
          frase2: "Explique com dados, leis ou pesquisas",
          frase3: "Feche e prepare para conclusão"
        },
        conclusao: {
          frase1: "Retome o problema e a tese",
          frase2: "Proposta completa: Quem? O que? Como? Por meio de quê? Para quê?",
          frase3: "Consequência positiva esperada"
        }
      };
    }
  }
}

export const geminiService = new GeminiService();