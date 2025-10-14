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
      const searchPrompt = `Você tem conhecimento EXATO e VERIFICÁVEL sobre a prova "${query}"?

⚠️ **REGRAS CRÍTICAS - LEIA COM ATENÇÃO:**

1. **ZERO TOLERÂNCIA A INFORMAÇÕES IMPRECISAS:**
   - Se você NÃO tem certeza ABSOLUTA da proposta de redação dessa prova específica, marque found: false
   - NUNCA invente, estime ou "aproxime" informações
   - NUNCA confunda com propostas de outros anos do mesmo exame
   - NUNCA misture temas de provas diferentes

2. **SE VOCÊ CONHECE ESSA PROVA ESPECÍFICA (found: true):**
   - Você DEVE ter o título EXATO da proposta de redação
   - Você DEVE ter o comando COMPLETO e LITERAL da redação (não parafraseado)
   - Você DEVE ter os textos de apoio que foram fornecidos na prova (se houver)
   - Você DEVE ter certeza ABSOLUTA do ano correto
   - Você DEVE verificar que tudo corresponde EXATAMENTE à prova "${query}"

3. **SE VOCÊ NÃO CONHECE ESSA PROVA ESPECÍFICA (found: false):**
   - Marque found: false imediatamente
   - NÃO tente criar uma proposta genérica
   - OPCIONALMENTE, sugira propostas REAIS de provas SIMILARES que você conhece com certeza
   - Deixe claro que são provas DIFERENTES

4. **VALIDAÇÃO OBRIGATÓRIA:**
   - Verifique se o examName retornado É EXATAMENTE "${query}"
   - Verifique se o year retornado corresponde ao ano pesquisado${year ? ` (deve ser ${year})` : ''}
   - Verifique se o título da proposta FAZ SENTIDO para esse exame e ano específicos

**EXEMPLO DE RESPOSTA CORRETA (found: true):**
Prova pesquisada: "ENEM 2022"
- Você TEM CERTEZA ABSOLUTA que o tema foi "Desafios para a valorização de comunidades e povos tradicionais no Brasil"
- Você TEM o comando exato: "A partir da leitura dos textos motivadores... desenvolva um texto dissertativo-argumentativo..."
- Você TEM os textos de apoio que foram fornecidos
- Você VERIFICOU que este tema é especificamente do ENEM 2022, NÃO de outro ano

**EXEMPLO DE RESPOSTA CORRETA (found: true):**
Prova pesquisada: "ENEM 2023"
- Você TEM CERTEZA ABSOLUTA que o tema foi "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil"
- Você TEM o comando exato da prova de 2023
- Você VERIFICOU que NÃO é "Desafios da persistência da violência contra a mulher" (que foi em 2015)
- Você VERIFICOU que este tema é especificamente do ENEM 2023, NÃO de 2015, 2022 ou outro ano

**EXEMPLO DE RESPOSTA INCORRETA (NÃO FAÇA ASSIM):**
Prova pesquisada: "ENEM 2023"
- Você retorna "Desafios da persistência da violência contra a mulher" pensando que é 2023, mas NA VERDADE é do ENEM 2015 ❌
- Você retorna uma proposta do ENEM 2022 pensando que é 2023 ❌
- Você retorna um tema "parecido" mas não é o tema real daquele ano específico ❌
- Você inventa um comando genérico de redação ❌

⚠️ ATENÇÃO CRÍTICA: O ENEM tem propostas SIMILARES em anos DIFERENTES. NUNCA confunda:
- ENEM 2015: "Desafios da persistência da violência contra a mulher na sociedade brasileira"
- ENEM 2023: "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil"
São temas DIFERENTES de anos DIFERENTES! Verifique o ANO correto!

Responda APENAS com JSON válido no formato:

{
  "found": true ou false,
  "confidence": "alta, media ou baixa - o quanto você tem certeza (OBRIGATÓRIO: se não for 'alta', marque found: false)",
  "message": "Explicação clara: se encontrou, confirme o ano e exame. Se não encontrou, explique por quê",
  "proposals": [
    {
      "title": "Título LITERAL e EXATO da proposta de redação (não parafraseie)",
      "statement": "Comando COMPLETO e LITERAL da redação, exatamente como foi cobrado na prova (não parafraseie)",
      "supportingText": "Textos de apoio COMPLETOS fornecidos na prova original (transcreva literalmente ou indique 'Não disponível' se não souber)",
      "examName": "Nome EXATO como aparece oficialmente - PREENCHA COM O VALOR REAL, NÃO copie '${query}' se não souber",
      "examType": "Tipo EXATO (enem, fuvest, unicamp, etc) - PREENCHA COM O VALOR REAL",
      "theme": "tema (social, technology, environment, education, culture, health, politics, economy)",
      "difficulty": "facil, medio ou dificil",
      "year": "Ano NUMÉRICO EXATO da prova - PREENCHA COM O ANO REAL, NÃO invente"
    }
  ],
  "similarProposals": [
    // APENAS se NÃO conhece a prova específica (found: false), liste propostas REAIS e VERIFICÁVEIS de provas similares
    {
      "title": "Título EXATO de prova similar que você CONHECE COM CERTEZA",
      "statement": "Comando LITERAL da redação",
      "supportingText": "Textos de apoio ou 'Não disponível'",
      "examName": "Nome EXATO da prova (ex: ENEM 2021, FUVEST 2023)",
      "examType": "enem, fuvest, unicamp, etc",
      "theme": "tema",
      "difficulty": "facil, medio ou dificil",
      "year": "ano EXATO numérico"
    }
  ]
}

⚠️ VALIDAÇÃO FINAL: Se você marcou found: true mas confidence NÃO é "alta", você DEVE mudar found para false!

⚠️ LEMBRE-SE: É MELHOR retornar found: false do que retornar informações INCORRETAS ou IMPRECISAS!`;

      const result = await this.model.generateContent(searchPrompt);
      const response = result.response.text();
      
      // Extract token usage metadata from Gemini response
      // Use totalTokenCount as authoritative source (matches Google AI Studio exactly)
      const usageMetadata = result.response.usageMetadata || {};
      const rawPromptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const rawOutputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum: number, count: number) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const totalTokens = usageMetadata.totalTokenCount || 0;
      
      // Reconcile component tokens to match official totalTokenCount (includes system tokens)
      let promptTokens = rawPromptTokens;
      let outputTokens = rawOutputTokens;
      
      if (totalTokens > 0 && (rawPromptTokens + rawOutputTokens) !== totalTokens) {
        // Total is authoritative - adjust components proportionally to match
        const rawSum = rawPromptTokens + rawOutputTokens;
        if (rawSum > 0) {
          const ratio = totalTokens / rawSum;
          promptTokens = Math.round(rawPromptTokens * ratio);
          outputTokens = totalTokens - promptTokens; // Ensure exact match
        } else {
          // No component data, estimate 70/30 split
          promptTokens = Math.floor(totalTokens * 0.7);
          outputTokens = totalTokens - promptTokens;
        }
      }
      
      console.log(`📖 Gemini knowledge response - Tokens: prompt=${promptTokens}, output=${outputTokens}, total=${totalTokens} (Google AI Studio compatible)`);
      
      // Parse response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('⚠️ No JSON found in Gemini response');
        return { found: false, proposals: [], similarProposals: [], tokensUsed: totalTokens, promptTokens, outputTokens };
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Log the raw response from Gemini for debugging
      console.log(`📋 Gemini raw response for "${query}":`, JSON.stringify(parsed, null, 2));
      
      // 🛡️ RUNTIME VALIDATION: Enforce accuracy requirements
      if (parsed.found && parsed.proposals && parsed.proposals.length > 0) {
        // Validation 0: Confidence field is MANDATORY
        if (!parsed.confidence || parsed.confidence !== 'alta') {
          const confidenceValue = parsed.confidence || 'missing';
          console.log(`⚠️ Gemini confidence is "${confidenceValue}" (not "alta") - treating as NOT FOUND to prevent inaccuracies`);
          parsed.found = false;
          // Move proposals to similarProposals since they're uncertain
          if (!parsed.similarProposals) parsed.similarProposals = [];
          parsed.similarProposals = [...parsed.similarProposals, ...parsed.proposals];
          parsed.proposals = [];
        } else {
          // Extract expected year from query if not provided as parameter
          const normalizedQuery = query.toLowerCase().trim();
          let expectedYear = year;
          
          if (!expectedYear) {
            // Try to extract year from query using regex (e.g., "enem 2022", "fuvest 2023")
            const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/);
            if (yearMatch) {
              expectedYear = parseInt(yearMatch[1]);
              console.log(`📅 Extracted year ${expectedYear} from query "${query}"`);
            }
          }
          
          // Validation 2: Verify year and examName match expectations
          for (const proposal of parsed.proposals) {
            let validationFailed = false;
            
            // CRITICAL: If we expect a year, proposal MUST have a year field
            if (expectedYear && !proposal.year) {
              console.log(`⚠️ Proposal is missing year field but we expect year ${expectedYear} - rejecting`);
              validationFailed = true;
            }
            
            // Check if year is provided and is numeric
            if (proposal.year) {
              const proposalYear = parseInt(String(proposal.year));
              if (isNaN(proposalYear)) {
                console.log(`⚠️ Proposal year "${proposal.year}" is not numeric - rejecting`);
                validationFailed = true;
              } else {
                // If we have an expected year (from param or query), verify it matches
                if (expectedYear && proposalYear !== expectedYear) {
                  console.log(`⚠️ Proposal year ${proposalYear} doesn't match expected year ${expectedYear} - rejecting`);
                  validationFailed = true;
                }
                
                // Year should be reasonable (between 1990 and current year + 1)
                const currentYear = new Date().getFullYear();
                if (proposalYear < 1990 || proposalYear > currentYear + 1) {
                  console.log(`⚠️ Proposal year ${proposalYear} is unrealistic - rejecting`);
                  validationFailed = true;
                }
              }
            }
            
            // Check if examName matches query (including year if present)
            if (proposal.examName) {
              const proposalExamNormalized = proposal.examName.toLowerCase().trim();
              
              // Extract year from proposal examName
              const proposalExamYearMatch = proposal.examName.match(/\b(19\d{2}|20\d{2})\b/);
              const proposalExamYear = proposalExamYearMatch ? parseInt(proposalExamYearMatch[1]) : null;
              
              // CRITICAL: If we expect a year, examName MUST contain that year
              if (expectedYear && !proposalExamYear) {
                console.log(`⚠️ Proposal examName "${proposal.examName}" is missing year but we expect ${expectedYear} - rejecting`);
                validationFailed = true;
              }
              
              // If we expect a year and proposal examName has a year, they must match
              if (expectedYear && proposalExamYear && proposalExamYear !== expectedYear) {
                console.log(`⚠️ Proposal examName "${proposal.examName}" has year ${proposalExamYear} but expected ${expectedYear} - rejecting`);
                validationFailed = true;
              }
              
              // Check if key exam identifier (e.g., "enem", "fuvest") matches
              const queryParts = normalizedQuery.split(/\s+/).filter((p: string) => p.length > 2 && !/^\d+$/.test(p));
              const examParts = proposalExamNormalized.split(/\s+/).filter((p: string) => p.length > 2 && !/^\d+$/.test(p));
              const hasExamMatch = queryParts.some((qp: string) => examParts.some((ep: string) => 
                qp.includes(ep) || ep.includes(qp)
              ));
              
              if (!hasExamMatch) {
                console.log(`⚠️ Proposal examName "${proposal.examName}" doesn't match query "${query}" (exam identifier mismatch) - rejecting`);
                validationFailed = true;
              }
            } else if (expectedYear) {
              // If we expect a year but examName is missing, reject
              console.log(`⚠️ Proposal is missing examName field but we expect specific exam with year ${expectedYear} - rejecting`);
              validationFailed = true;
            }
            
            if (validationFailed) {
              console.log(`🚫 Validation failed for proposal "${proposal.title}" (examName: "${proposal.examName}", year: ${proposal.year}) - treating as NOT FOUND`);
              parsed.found = false;
              if (!parsed.similarProposals) parsed.similarProposals = [];
              parsed.similarProposals.push(proposal);
              parsed.proposals = parsed.proposals.filter((p: any) => p !== proposal);
            } else {
              console.log(`✅ Validation passed for proposal "${proposal.title}" (examName: "${proposal.examName}", year: ${proposal.year})`);
            }
          }
          
          // If all proposals were rejected, mark as not found
          if (parsed.proposals.length === 0) {
            parsed.found = false;
            console.log(`⚠️ All proposals rejected by validation - marking as NOT FOUND`);
          }
        }
      }
      
      if (parsed.found && parsed.proposals && parsed.proposals.length > 0) {
        console.log(`✅ Gemini generated ${parsed.proposals.length} VALIDATED proposal(s) based on knowledge`);
        return {
          found: true,
          proposals: parsed.proposals.map((p: any) => ({
            ...p,
            isAiGenerated: false,
            source: 'gemini_knowledge'
          })),
          similarProposals: [],
          message: parsed.message,
          tokensUsed: totalTokens,
          promptTokens,
          outputTokens
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
          message: parsed.message || `Não encontrei informações sobre ${query}, mas conheço estas provas similares:`,
          tokensUsed: totalTokens,
          promptTokens,
          outputTokens
        };
      }
      
      console.log(`ℹ️ Gemini doesn't have knowledge about this exam`);
      return {
        found: false,
        proposals: [],
        similarProposals: [],
        message: parsed.message || 'Não encontrei essa prova específica no meu conhecimento',
        tokensUsed: totalTokens,
        promptTokens,
        outputTokens
      };
      
    } catch (error) {
      console.error('Error searching real proposals from Gemini knowledge:', error);
      return { found: false, proposals: [], similarProposals: [], tokensUsed: 0, promptTokens: 0, outputTokens: 0 };
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
      // Use totalTokenCount as authoritative source (matches Google AI Studio exactly)
      const usageMetadata = result.response.usageMetadata || {};
      const rawPromptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const rawOutputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum: number, count: number) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const totalTokens = usageMetadata.totalTokenCount || 0;
      
      // Reconcile component tokens to match official totalTokenCount (includes system tokens)
      let promptTokens = rawPromptTokens;
      let outputTokens = rawOutputTokens;
      
      if (totalTokens > 0 && (rawPromptTokens + rawOutputTokens) !== totalTokens) {
        // Total is authoritative - adjust components proportionally to match
        const rawSum = rawPromptTokens + rawOutputTokens;
        if (rawSum > 0) {
          const ratio = totalTokens / rawSum;
          promptTokens = Math.round(rawPromptTokens * ratio);
          outputTokens = totalTokens - promptTokens; // Ensure exact match
        } else {
          // No component data, estimate 70/30 split
          promptTokens = Math.floor(totalTokens * 0.7);
          outputTokens = totalTokens - promptTokens;
        }
      }
      
      console.log(`📊 Gemini Proposal Generation - Tokens: prompt=${promptTokens}, output=${outputTokens}, total=${totalTokens} (Google AI Studio compatible)`);
      
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
    const hasContext = config.context && config.context.trim().length > 0;
    
    const contextInstructions = hasContext 
      ? `\n\n📋 TEXTO BASE FORNECIDO PELO USUÁRIO:\n"${config.context}"\n\n🎯 INSTRUÇÃO ESPECIAL: Use o texto base acima como INSPIRAÇÃO e REFERÊNCIA para criar propostas DIFERENTES mas RELACIONADAS ao tema. Mantenha o estilo e a qualidade, mas crie variações melhoradas com:\n- Novo enfoque ou perspectiva sobre o tema\n- Textos de apoio diferentes e complementares\n- Abordagem mais profunda ou alternativa\n- NÃO copie o texto base, apenas use-o como inspiração\n`
      : '';
    
    return `Gere 2 propostas de redação completas e realistas para ${config.examType} sobre o tema "${config.theme}".

CONFIGURAÇÃO:
- Tipo de exame: ${config.examType}
- Tema: ${config.theme}
- Dificuldade: ${config.difficulty || 'medio'}
- Palavras-chave: ${keywordString}${contextInstructions}

Responda APENAS com JSON válido no formato:

{
  "proposals": [
    {
      "title": "Título específico da proposta",
      "statement": "Comando CURTO da redação (máximo 2-3 linhas, direto ao ponto)",
      "supportingText": "Textos de apoio com dados, citações ou contexto relevante",
      "examType": "${config.examType}",
      "theme": "${config.theme}",
      "difficulty": "${config.difficulty || 'medio'}",
      "year": "2024"
    }
  ]
}

INSTRUÇÕES IMPORTANTES:
- Propostas realistas como em provas oficiais
- "statement" deve ser MUITO CURTO (máximo 2-3 linhas), apenas a instrução principal
- Exemplo de "statement" curto: "Redija um texto dissertativo-argumentativo sobre os impactos da tecnologia digital na democracia moderna."
- NÃO faça o "statement" longo com várias frases explicativas
- Textos de apoio informativos e atuais
- Temas relevantes para ${config.examType}
- Responda APENAS o JSON, sem texto adicional`;
  }

  private cleanSupportingText(supportingText: string): string {
    if (!supportingText) return "";
    
    try {
      // Check if it's a JSON string that needs parsing
      if (supportingText.startsWith('{') || supportingText.startsWith('[')) {
        const parsed = JSON.parse(supportingText);
        
        // If it's an array of content objects
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: any) => item.content || item.text || '')
            .filter(Boolean)
            .join('\n\n');
        }
        
        // If it's a single object with content
        if (parsed.type === 'paragraph' && parsed.content) {
          return parsed.content;
        }
        
        // If it has a content field
        if (parsed.content) {
          return typeof parsed.content === 'string' 
            ? parsed.content 
            : JSON.stringify(parsed.content);
        }
      }
      
      // Return as is if it's already clean text
      return supportingText;
    } catch (e) {
      // If parsing fails, return the original text
      return supportingText;
    }
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
          supportingText: this.cleanSupportingText(proposal.supportingText) || "Considere os aspectos sociais, econômicos e culturais do tema.",
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
      // Use totalTokenCount as authoritative source (matches Google AI Studio exactly)
      const usageMetadata = result.response.usageMetadata || {};
      const rawPromptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const rawOutputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum, count) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const totalTokens = usageMetadata.totalTokenCount || 0;
      
      // Reconcile component tokens to match official totalTokenCount (includes system tokens)
      let promptTokens = rawPromptTokens;
      let outputTokens = rawOutputTokens;
      
      if (totalTokens > 0 && (rawPromptTokens + rawOutputTokens) !== totalTokens) {
        // Total is authoritative - adjust components proportionally to match
        const rawSum = rawPromptTokens + rawOutputTokens;
        if (rawSum > 0) {
          const ratio = totalTokens / rawSum;
          promptTokens = Math.round(rawPromptTokens * ratio);
          outputTokens = totalTokens - promptTokens; // Ensure exact match
        } else {
          // No component data, estimate 70/30 split
          promptTokens = Math.floor(totalTokens * 0.7);
          outputTokens = totalTokens - promptTokens;
        }
      }

      console.log(`📊 Gemini Essay Outline - Tokens: prompt=${promptTokens}, output=${outputTokens}, total=${totalTokens} (Google AI Studio compatible)`);

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
**🎯 MODO PASSO A PASSO ULTRA DETALHADO ATIVADO:**

O estudante solicitou o nível MÁXIMO de orientação. Cada frase do roteiro deve ser um GUIA COMPLETO DE ESCRITA.

📋 **ESTRUTURA OBRIGATÓRIA PARA CADA FRASE:**

Cada orientação de frase DEVE incluir estas 6 partes na ordem:

1️⃣ **COMO INICIAR** (Primeiras palavras):
   - Forneça 2-3 opções de conectivos ou palavras iniciais EXATAS
   - Exemplo: "Inicie com: 'Historicamente,' OU 'Desde o século XX,' OU 'De acordo com dados do...'"

2️⃣ **O QUE ESCREVER** (Conteúdo específico):
   - Indique EXATAMENTE qual informação incluir (nome de lei, dado estatístico, evento, conceito)
   - Seja ULTRA ESPECÍFICO ao tema da proposta "${proposal}"
   - Exemplo: "Mencione o Artigo 5º da Constituição Federal de 1988" OU "Cite que segundo o IBGE (2023), X% da população..."

3️⃣ **COMO DESENVOLVER** (Estrutura da frase):
   - Explique a SEQUÊNCIA da construção frasal em etapas
   - Exemplo: "Primeira parte da frase: apresente o repertório. Segunda parte: conecte com o tema usando 'o que demonstra/evidencia/comprova'. Terceira parte: finalize com a implicação"

4️⃣ **TAMANHO E PROPORÇÃO**:
   - Especifique o tamanho estimado SEM usar marcações visíveis
   - Integre naturalmente: "Esta primeira parte deve ser desenvolvida com riqueza de detalhes" ao invés de "(4-5 linhas)"

5️⃣ **EXEMPLO PRÁTICO APLICADO**:
   - Forneça um exemplo COMPLETO e ESCRITO de como a frase ficaria
   - Use aspas para mostrar: "Exemplo: 'Historicamente, desde a promulgação da Lei X em 2015, observa-se que...'"
   - O exemplo deve ser ESPECÍFICO ao tema da proposta

6️⃣ **DICAS E ALERTAS**:
   - DICA: técnica de redação para melhorar (vocabulário, conectivos, argumentação)
   - ATENÇÃO/EVITE: erro comum que prejudica a redação
   - CONECTE: como fazer transição para a próxima frase

📝 **MODELO DE ORIENTAÇÃO COMPLETA (siga este padrão):**

"[1-COMO INICIAR] Inicie a frase com conectivos temporais como 'Historicamente,', 'Desde o século XX,' ou contextuais como 'De acordo com estudos recentes,', 'Segundo dados de 2023,'. [2-O QUE ESCREVER] Apresente um repertório sociocultural específico relacionado a [tema da proposta]: pode ser o Artigo 5º da Constituição Federal (se tratar de direitos), dados do IBGE sobre [aspecto específico do tema], ou o filme/livro [nome específico] que aborda [conexão com tema]. [3-COMO DESENVOLVER] Estruture a frase assim: primeiro apresente o repertório com sua fonte/data, depois use conectivos causais como 'o que demonstra', 'evidenciando', 'comprovando' para fazer a ponte, e finalize mostrando a RELAÇÃO direta com o problema central da proposta. [4-TAMANHO] Desenvolva esta contextualização com riqueza de detalhes, equilibrando dados objetivos e interpretação crítica. [5-EXEMPLO] Exemplo aplicado ao tema: 'Segundo o relatório da ONU de 2023, aproximadamente 2 bilhões de pessoas no mundo não têm acesso à água potável, o que evidencia a urgência de políticas públicas de saneamento básico e distribuição equitativa de recursos hídricos'. [6-DICAS] DICA: Use dados recentes (últimos 5 anos) para fortalecer credibilidade. EVITE: Citar repertório sem conectá-lo ao tema - sempre explique a relação. CONECTE com a próxima frase: Após apresentar o repertório, use conectivo de contraste ('Entretanto,', 'Contudo,') para introduzir a problemática."

🎓 **CONTEÚDO ULTRA ESPECÍFICO:**
- Mencione nomes REAIS e ESPECÍFICOS: leis com número/ano, artigos da Constituição, dados com fonte e ano, nomes de filmes/livros/obras, eventos históricos com data
- Para o tema "${proposal}", busque repertórios que tenham RELAÇÃO DIRETA
- Forneça conectivos VARIADOS (não repita): causais (pois, visto que), adversativos (entretanto, contudo), conclusivos (portanto, logo), temporais (desde, historicamente)
- Sugira SINÔNIMOS para palavras-chave do tema

🔧 **PROGRESSÃO ARGUMENTATIVA:**
Explique como cada frase se conecta com a próxima:
- Da frase 1 para 2: "Após contextualizar, use contraste para problematizar"
- Da frase 2 para 3: "Após apresentar a tese, anuncie os caminhos argumentativos"
- Entre parágrafos: "Use conectivos de adição (Além disso,) ou de contraste (Por outro lado,)"

💡 **CHECKLIST DE QUALIDADE (garanta que cada orientação tenha):**
✅ Conectivos específicos sugeridos
✅ Repertório/dado REAL e ESPECÍFICO ao tema
✅ Estrutura frasal passo a passo
✅ Exemplo completo escrito
✅ Dica de técnica de redação
✅ Alerta do que evitar
✅ Indicação de conexão com próxima frase

⚠️ **FORMATAÇÃO:**
NÃO use marcações como "(4-5 linhas)", "(60 palavras)", "(Aprox. X linhas)" - integre instruções de tamanho naturalmente no texto.
O estudante NÃO deve ver anotações técnicas entre parênteses.
`
      : `
**MODO DIREÇÕES GERAIS:**
Forneça orientações objetivas e diretas. Cada frase do roteiro deve ter 1-2 linhas com o caminho principal, sem detalhamento excessivo.

⚠️ **FORMATAÇÃO:**
NÃO inclua marcações técnicas como "(Aprox. 4-5 linhas)", "(60-80 palavras)". O usuário NÃO DEVE VER essas anotações.
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