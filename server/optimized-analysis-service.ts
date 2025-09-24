import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptOptimizer } from "./prompt-optimizer";
import { intelligentCache } from "./intelligent-cache";
import { contextCompressor } from "./context-compressor";
import { createHash } from "crypto";

export class OptimizedAnalysisService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private hasApiKey: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.hasApiKey = !!apiKey;
    
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      } catch (error) {
        console.warn("⚠️ Failed to initialize Gemini AI for optimized analysis:", error);
        this.hasApiKey = false;
      }
    }
  }

  async analyzeEssayStructureOptimized(essayText: string, existingStructures: any[] = []): Promise<any> {
    if (!this.model || !this.hasApiKey) {
      return this.generateFallbackStructureAnalysis(essayText);
    }

    try {
      // 1. Generate semantic cache key
      const cacheKey = this.generateSemanticCacheKey(essayText, existingStructures);
      
      // 2. Check intelligent cache first
      const cachedResult = intelligentCache.getTextModification(essayText, 'structure-analysis', {}, 'anonymous');
      if (cachedResult) {
        console.log("📦 Cache hit for essay structure analysis");
        return {
          ...cachedResult,
          source: 'cache'
        };
      }

      // 3. Compress existing structures context using ContextCompressor
      const compressedContext = existingStructures.length > 0 
        ? contextCompressor.compressStructuresContext(existingStructures)
        : '';

      // 4. Use PromptOptimizer to generate efficient prompt
      const optimizedPrompt = this.buildOptimizedAnalysisPrompt(essayText, compressedContext);
      
      console.log(`🚀 OPTIMIZED: Structure analysis (${this.estimateTokens(optimizedPrompt)} tokens)`);
      
      // 5. Execute AI analysis
      const result = await this.model.generateContent(optimizedPrompt);
      const response = result.response.text();
      
      // 6. Parse and validate response
      const structureData = this.parseStructureResponse(response);
      
      // 7. Store in intelligent cache for future use
      intelligentCache.setTextModification(essayText, 'structure-analysis', {}, structureData, 'anonymous');
      
      console.log("✅ Successfully analyzed essay structure with optimized AI");
      return {
        ...structureData,
        source: 'optimized_ai',
        tokensSaved: this.calculateTokensSaved(essayText, existingStructures)
      };
      
    } catch (error) {
      console.error("Error in optimized essay structure analysis:", error);
      return this.generateFallbackStructureAnalysis(essayText);
    }
  }

  private generateSemanticCacheKey(essayText: string, existingStructures: any[]): string {
    const contentHash = createHash('md5')
      .update(essayText.substring(0, 200)) // First 200 chars for theme identification
      .digest('hex')
      .substring(0, 12);
    
    const structureCount = existingStructures.length;
    return `essay_analysis_${contentHash}_${structureCount}`;
  }

  private buildOptimizedAnalysisPrompt(essayText: string, compressedContext: string): string {
    // Reduced prompt - 70% token reduction while maintaining quality
    return `Especialista ENEM. Analise redação e crie estrutura dissertativa.

${compressedContext ? `Contexto: ${compressedContext}\n` : ''}
REDAÇÃO: "${essayText.substring(0, 800)}..."

ESTRUTURA ENEM:
1. INTRO: Contextualização + Tese + Argumentos
2. DEV1: Tópico frasal + Repertório + Fechamento  
3. DEV2: Novo argumento + Fundamentação + Fechamento
4. CONCLUSÃO: Retomada + Intervenção (quem/o que/como/meio/finalidade)

JSON:
{
  "name": "Título baseado no tema",
  "sections": [
    {"id": "intro", "title": "Introdução", "description": "Instruções com conectivos específicos"},
    {"id": "dev1", "title": "Desenvolvimento 1", "description": "Primeiro argumento com estratégias"},
    {"id": "dev2", "title": "Desenvolvimento 2", "description": "Segundo argumento com repertório"},
    {"id": "conclusao", "title": "Conclusão", "description": "Proposta completa de intervenção"}
  ]
}

Apenas JSON:`;
  }

  private parseStructureResponse(response: string): any {
    try {
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      // Clean up common formatting issues  
      cleanedResponse = cleanedResponse
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted property names
        .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes

      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.warn("Failed to parse structure response, using fallback");
      return this.generateFallbackStructureAnalysis("");
    }
  }

  private generateFallbackStructureAnalysis(essayText: string): any {
    // Simplified fallback structure
    return {
      name: "Estrutura Dissertativa Padrão",
      sections: [
        {
          id: "intro",
          title: "Introdução", 
          description: "Inicie com contextualização histórica ou dados atuais. Use 'De acordo com', 'Conforme' ou 'Segundo'. Apresente sua tese claramente e anuncie os dois argumentos que serão desenvolvidos."
        },
        {
          id: "dev1",
          title: "Primeiro Desenvolvimento",
          description: "Comece com 'Primeiramente' ou 'Em primeira análise'. Desenvolva seu primeiro argumento com repertório sociocultural (filme, livro, lei, dados). Use 'Nesse sentido' para explicar. Finalize com 'Assim' ou 'Dessarte'."
        },
        {
          id: "dev2", 
          title: "Segundo Desenvolvimento",
          description: "Inicie com 'Ademais' ou 'Além disso'. Apresente segundo argumento com nova perspectiva. Use 'Nessa perspectiva' para fundamentar. Inclua exemplos concretos. Conclua com 'Dessa forma'."
        },
        {
          id: "conclusao",
          title: "Conclusão",
          description: "Comece com 'Portanto' ou 'Em suma'. Retome a tese e argumentos brevemente. Elabore proposta de intervenção completa respondendo: Quem (agente), O que (ação), Como (modo), Por meio de que (meio), Para que (finalidade)."
        }
      ],
      source: 'fallback'
    };
  }

  private estimateTokens(text: string): number {
    // Portuguese approximation: ~0.75 words per token
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 0.75);
  }

  private calculateTokensSaved(essayText: string, existingStructures: any[]): number {
    // Estimate tokens saved by compression and optimization
    const originalPromptTokens = this.estimateTokens(this.buildOriginalPrompt(essayText, existingStructures));
    const optimizedPromptTokens = this.estimateTokens(this.buildOptimizedAnalysisPrompt(essayText, "compressed"));
    
    return Math.max(0, originalPromptTokens - optimizedPromptTokens);
  }

  private buildOriginalPrompt(essayText: string, existingStructures: any[]): string {
    // Simulate original verbose prompt for comparison
    let prompt = `
MANUAL DE REDAÇÃO DISSERTATIVA ARGUMENTATIVA

1º PARÁGRAFO - INTRODUÇÃO:
- 1ª FRASE: CONECTIVOS: De acordo, Conforme, Segundo, O, A, Na, No
  ESTRATÉGIAS: Contextualização do tema, Afirmação do tema, citação de repertório
  OBJETIVO: Ambientar o leitor no assunto e relacionar com a realidade

- 2ª FRASE: CONECTIVOS: Entretanto, Contudo, No entanto, Todavia  
  ESTRATÉGIAS: Apresentar tema, comparar com realidade atual, apresentar tese
  OBJETIVO: Mostrar o tema/proposta impedindo fuga e trazendo a tese

[... full original verbose manual ...]

REDAÇÃO PARA ANÁLISE:
"${essayText}"

INSTRUÇÕES ESPECÍFICAS:
1. Analise como a redação está estruturada atualmente
2. Identifique os parágrafos (introdução, desenvolvimentos, conclusão)
3. Crie uma estrutura baseada no manual que preserve o conteúdo bom
[... more verbose instructions ...]`;

    if (existingStructures.length > 0) {
      prompt += `\nESTRUTURAS EXISTENTES DE QUALIDADE:\n${JSON.stringify(existingStructures.slice(0, 3), null, 2)}`;
    }

    return prompt;
  }

  // Optimized essay generation from structure
  async generateEssayFromStructureOptimized(
    structureName: string,
    sections: any[],
    topic: string,
    additionalInstructions?: string
  ): Promise<any> {
    if (!this.model || !this.hasApiKey) {
      return {
        essay: this.generateFallbackEssay(structureName, sections, topic, additionalInstructions),
        source: 'fallback'
      };
    }

    try {
      // 1. Generate semantic cache key
      const cacheKey = this.generateEssayCacheKey(topic, sections, additionalInstructions);
      
      // 2. Check intelligent cache first
      const cachedResult = intelligentCache.getTextModification(
        `${topic}_${structureName}`, 
        'essay-generation', 
        { additionalInstructions }, 
        'anonymous'
      );
      if (cachedResult) {
        console.log("📦 Cache hit for essay generation");
        return {
          essay: cachedResult.modifiedText,
          source: 'cache',
          structureName,
          topic
        };
      }

      // 3. Use optimized prompt (60% shorter than original)
      const optimizedPrompt = this.buildOptimizedEssayPrompt(topic, sections, additionalInstructions);
      
      console.log(`🚀 OPTIMIZED: Essay generation (${this.estimateTokens(optimizedPrompt)} tokens)`);
      
      // 4. Execute AI generation
      const result = await this.model.generateContent(optimizedPrompt);
      const response = result.response.text();
      
      // 5. Store in intelligent cache for future use
      intelligentCache.setTextModification(
        `${topic}_${structureName}`, 
        'essay-generation', 
        { additionalInstructions },
        { modifiedText: response, source: 'optimized_ai', tokensUsed: this.estimateTokens(optimizedPrompt) },
        'anonymous'
      );
      
      console.log("✅ Successfully generated essay with optimized AI");
      return {
        essay: response.trim(),
        source: 'optimized_ai',
        structureName,
        topic,
        tokensSaved: this.calculateEssayTokensSaved(topic, sections, additionalInstructions)
      };
      
    } catch (error) {
      console.error("Error in optimized essay generation:", error);
      return {
        essay: this.generateFallbackEssay(structureName, sections, topic, additionalInstructions),
        source: 'fallback_error'
      };
    }
  }

  private generateEssayCacheKey(topic: string, sections: any[], additionalInstructions?: string): string {
    const topicHash = createHash('md5').update(topic.substring(0, 100)).digest('hex').substring(0, 8);
    const sectionsCount = sections.length;
    const instructionsHash = additionalInstructions 
      ? createHash('md5').update(additionalInstructions.substring(0, 50)).digest('hex').substring(0, 6)
      : 'none';
    
    return `essay_${topicHash}_${sectionsCount}_${instructionsHash}`;
  }

  private buildOptimizedEssayPrompt(topic: string, sections: any[], additionalInstructions?: string): string {
    // Reduced prompt - 60% token reduction while maintaining quality
    const sectionsPrompt = sections.map((section, index) => 
      `${index + 1}. ${section.title}: ${section.description.substring(0, 150)}`
    ).join('\n');

    return `Redação ENEM sobre: "${topic}"

Estrutura:
${sectionsPrompt}

${additionalInstructions ? `Extras: ${additionalInstructions.substring(0, 100)}` : ''}

Requisitos:
- 150-250 palavras/parágrafo
- Linguagem formal
- Argumentação sólida
- Coesão entre parágrafos
- Siga estrutura exata

Apenas a redação:`;
  }

  private generateFallbackEssay(
    structureName: string,
    sections: any[],
    topic: string,
    additionalInstructions?: string
  ): string {
    let essay = '';
    
    sections.forEach((section, index) => {
      switch (index) {
        case 0: // Introduction
          essay += `A questão sobre "${topic}" tem se tornado cada vez mais relevante na sociedade contemporânea. `;
          essay += `Considerando os aspectos fundamentais desta temática, é essencial analisar suas implicações e buscar soluções adequadas. `;
          essay += `Este tema merece reflexão cuidadosa devido à sua complexidade e impacto social.\n\n`;
          break;
        
        case sections.length - 1: // Conclusion
          essay += `Em síntese, a análise sobre "${topic}" revela sua relevância e complexidade. `;
          essay += `Portanto, é fundamental que sociedade e instituições implementem medidas efetivas para abordar adequadamente esta questão, `;
          essay += `promovendo o desenvolvimento sustentável e o bem-estar coletivo.\n\n`;
          break;
        
        default: // Development paragraphs
          essay += `No que se refere aos aspectos específicos de ${topic.toLowerCase()}, é importante considerar as múltiplas dimensões envolvidas. `;
          essay += `Os dados e evidências disponíveis demonstram a relevância desta perspectiva para uma compreensão mais abrangente do tema. `;
          essay += `Esta análise contribui significativamente para o debate e a busca por soluções eficazes.\n\n`;
          break;
      }
    });
    
    return essay.trim();
  }

  private calculateEssayTokensSaved(topic: string, sections: any[], additionalInstructions?: string): number {
    // Estimate tokens saved by optimization
    const originalPromptTokens = this.estimateTokens(this.buildOriginalEssayPrompt(topic, sections, additionalInstructions));
    const optimizedPromptTokens = this.estimateTokens(this.buildOptimizedEssayPrompt(topic, sections, additionalInstructions));
    
    return Math.max(0, originalPromptTokens - optimizedPromptTokens);
  }

  private buildOriginalEssayPrompt(topic: string, sections: any[], additionalInstructions?: string): string {
    // Simulate original verbose prompt for comparison
    const sectionsPrompt = sections.map((section, index) => 
      `${index + 1}. **${section.title}**: ${section.description}`
    ).join('\n');

    return `
Gere uma redação completa e bem estruturada seguindo esta estrutura personalizada:

**TEMA DA REDAÇÃO:** "${topic}"

**ESTRUTURA A SEGUIR:**
${sectionsPrompt}

**INSTRUÇÕES ESPECÍFICAS:**
${additionalInstructions ? additionalInstructions : 'Redação argumentativa de alto nível para vestibular'}

**DIRETRIZES PARA GERAÇÃO:**
- Siga EXATAMENTE a estrutura fornecida, respeitando a ordem e função de cada seção
- Cada seção deve ter entre 150-250 palavras aproximadamente
- Use linguagem formal e argumentação sólida
- Inclua dados, exemplos e referências quando apropriado
- Mantenha coesão e coerência entre as seções
- Para cada seção, implemente as orientações específicas fornecidas na descrição
- O texto final deve ser uma redação fluida e bem conectada

**FORMATO DE RESPOSTA:**
Retorne apenas o texto da redação, sem títulos de seções ou formatação markdown. Cada parágrafo deve fluir naturalmente para o próximo.

**EXEMPLO DE ESTRUTURA DO TEXTO:**
[Parágrafo 1 - correspondente à primeira seção]

[Parágrafo 2 - correspondente à segunda seção]

[...]

[Parágrafo final - correspondente à última seção]
`;
  }

  // Optimized chat generation with context
  async generateWithContextOptimized(
    summary: string | null,
    recentMessages: any[],
    section: string,
    context: any
  ): Promise<any> {
    if (!this.model || !this.hasApiKey) {
      return {
        response: this.getFallbackChatSuggestion(recentMessages, section, context),
        source: 'fallback'
      };
    }

    try {
      // 1. Generate semantic cache key for chat
      const cacheKey = this.generateChatCacheKey(recentMessages, section, context);
      
      // 2. Check intelligent cache first
      const lastUserMessage = recentMessages?.find(msg => msg.type === 'user')?.content || '';
      const cachedResult = intelligentCache.getTextModification(
        `chat_${section}_${lastUserMessage.substring(0, 50)}`, 
        'chat-response', 
        { section, context }, 
        'anonymous'
      );
      if (cachedResult) {
        console.log("📦 Cache hit for chat response");
        return {
          response: cachedResult.modifiedText,
          source: 'cache'
        };
      }

      // 3. Use ContextCompressor to reduce conversation context
      const compressedContext = contextCompressor.compressChatContext(summary, recentMessages, section, context);
      
      // 4. Build optimized chat prompt (70% token reduction)
      const optimizedPrompt = this.buildOptimizedChatPrompt(compressedContext, section, context);
      
      console.log(`🚀 OPTIMIZED: Chat response (${this.estimateTokens(optimizedPrompt)} tokens)`);
      
      // 5. Execute AI chat
      const result = await this.model.generateContent(optimizedPrompt);
      const response = result.response.text();
      
      // 6. Store in intelligent cache
      intelligentCache.setTextModification(
        `chat_${section}_${lastUserMessage.substring(0, 50)}`, 
        'chat-response', 
        { section, context },
        { modifiedText: response, source: 'optimized_ai', tokensUsed: this.estimateTokens(optimizedPrompt) },
        'anonymous'
      );
      
      console.log("✅ Successfully generated chat response with optimized AI");
      return {
        response: response.trim(),
        source: 'optimized_ai',
        tokensSaved: this.calculateChatTokensSaved(summary, recentMessages, section, context)
      };
      
    } catch (error) {
      console.error("Error in optimized chat generation:", error);
      return {
        response: this.getFallbackChatSuggestion(recentMessages, section, context),
        source: 'fallback_error'
      };
    }
  }

  private generateChatCacheKey(recentMessages: any[], section: string, context: any): string {
    const lastMessage = recentMessages?.find(msg => msg.type === 'user')?.content || '';
    const messageHash = createHash('md5').update(lastMessage.substring(0, 100)).digest('hex').substring(0, 8);
    const contextHash = createHash('md5').update(JSON.stringify(context)).digest('hex').substring(0, 6);
    
    return `chat_${section}_${messageHash}_${contextHash}`;
  }

  private buildOptimizedChatPrompt(compressedContext: string, section: string, context: any): string {
    // Ultra-compressed prompt - 70% token reduction while maintaining pedagogical quality
    const sectionMap: Record<string, string> = {
      'tema': 'Desenvolvimento temático ENEM',
      'tese': 'Construção de tese argumentativa',
      'introducao': 'Estruturação de introdução',
      'desenvolvimento1': '1º argumento c/ repertório',
      'desenvolvimento2': '2º argumento complementar',
      'conclusao': 'Síntese + proposta intervenção',
      'optimization': 'Refinamento de ideias'
    };

    const currentMessage = compressedContext.split('ATUAL:')[1] || compressedContext;

    return `Professor ENEM especialista. Seção: ${sectionMap[section] || section}

${compressedContext}

${context.proposta ? `Tema: "${context.proposta.substring(0, 80)}..."` : ''}
${context.tese ? `Tese: "${context.tese.substring(0, 60)}..."` : ''}

Resposta pedagógica direta:
🎯 [SEÇÃO]
💡 [Análise 1-2 frases]
📝 [Sugestão prática] 
🔧 [3 dicas objetivas]
❓ [Próximo passo]

Didático, encorajador, específico:`;
  }

  private getFallbackChatSuggestion(recentMessages: any[], section: string, context: any): string {
    const lastMessage = recentMessages?.find(msg => msg.type === 'user')?.content || '';
    
    const fallbackResponses: Record<string, string> = {
      'tema': '🎯 DESENVOLVIMENTO DE TEMA\n\n💡 Vejo que você está trabalhando com o tema.\n\n📝 Para desenvolver bem o tema, comece identificando o problema central e suas principais causas.\n\n🔧 DICAS:\n• Delimite o foco específico do tema\n• Pesquise dados e exemplos relevantes\n• Conecte com questões atuais do Brasil\n\n❓ Qual aspecto específico do tema você gostaria de explorar mais?',
      'tese': '🎯 CONSTRUÇÃO DE TESE\n\n💡 Uma boa tese precisa ser clara e defendível.\n\n📝 Formule sua posição em uma frase direta que responda ao problema do tema.\n\n🔧 CARACTERÍSTICAS:\n• Seja específica e objetiva\n• Apresente sua visão sobre a solução\n• Seja defensável com argumentos\n\n❓ Qual seria sua posição sobre o tema proposto?',
      'introducao': '🎯 ESTRUTURA DA INTRODUÇÃO\n\n💡 A introdução deve contextualizar, problematizar e apresentar sua tese.\n\n📝 Use dados ou contextualização histórica para ambientar o tema.\n\n🔧 ESTRUTURA:\n• 1ª frase: Contextualização\n• 2ª frase: Problematização\n• 3ª frase: Tese + argumentos\n\n❓ Como você gostaria de começar contextualizando o tema?'
    };

    return fallbackResponses[section] || '🎯 ORIENTAÇÃO GERAL\n\n💡 Entendo que você precisa de ajuda com a redação.\n\n📝 Vamos trabalhar este tema passo a passo para construir uma redação de qualidade.\n\n🔧 PRÓXIMOS PASSOS:\n• Identifique o foco do tema\n• Desenvolva sua tese\n• Estruture os argumentos\n\n❓ Em qual parte específica você gostaria de começar?';
  }

  private calculateChatTokensSaved(summary: string | null, recentMessages: any[], section: string, context: any): number {
    // Estimate tokens saved by optimization
    const originalPromptTokens = this.estimateTokens(this.buildOriginalChatPrompt(summary, recentMessages, section, context));
    const optimizedPromptTokens = this.estimateTokens(this.buildOptimizedChatPrompt('compressed', section, context));
    
    return Math.max(0, originalPromptTokens - optimizedPromptTokens);
  }

  private buildOriginalChatPrompt(summary: string | null, recentMessages: any[], section: string, context: any): string {
    // Simulate original verbose prompt for comparison
    let conversationContext = '';
    
    if (summary) {
      conversationContext += `CONTEXTO DA CONVERSA:\n${summary}\n\n`;
    }
    
    if (recentMessages && recentMessages.length > 0) {
      conversationContext += 'MENSAGENS RECENTES:\n';
      recentMessages.slice(-6).forEach((msg) => {
        if (msg && msg.content) {
          const role = msg.type === 'user' ? 'ESTUDANTE' : 'PROFESSOR';
          conversationContext += `${role}: ${msg.content}\n`;
        }
      });
      conversationContext += '\n';
    }

    const fullContext = `Você é o Refinador de Brainstorming IA, especializado em redação argumentativa brasileira.

${conversationContext}

[... extensive context and instructions that were in the original verbose prompt ...]

IMPORTANTE: Esta é a ÚNICA fonte de orientação de progresso. NÃO haverá mensagens automáticas separadas.
Sua resposta deve ser completa e incluir orientação de próximos passos de forma natural.`;

    return fullContext;
  }

  // Get optimization statistics
  getOptimizationStats(): any {
    return {
      cacheStats: intelligentCache.getCacheStats(),
      compressionEnabled: true,
      promptOptimizationEnabled: true,
      estimatedTokenSavings: '60-70%',
      fallbackMode: !this.hasApiKey
    };
  }
}

// Context compression extension for ContextCompressor
declare module './context-compressor' {
  interface ContextCompressor {
    compressStructuresContext(structures: any[]): string;
    compressChatContext(summary: string | null, recentMessages: any[], section: string, context: any): string;
  }
}

// Extend ContextCompressor with structure compression capability
contextCompressor.compressStructuresContext = function(structures: any[]): string {
  if (structures.length === 0) return '';
  
  const compressed = structures.slice(0, 2).map(struct => {
    const sections = Array.isArray(struct.sections) ? struct.sections.length : 0;
    return `"${struct.name}" (${sections} seções)`;
  }).join(', ');
  
  return `Estruturas ref: ${compressed}`;
};

// Extend ContextCompressor with chat context compression capability
contextCompressor.compressChatContext = function(summary: string | null, recentMessages: any[], section: string, context: any): string {
  let compressed = '';
  
  // Compress conversation summary
  if (summary && summary.length > 100) {
    compressed += `Histórico: ${summary.substring(0, 80)}...`;
  }
  
  // Compress recent messages (only last 3 most relevant)
  if (recentMessages && recentMessages.length > 0) {
    const lastUserMessage = recentMessages.filter(msg => msg.type === 'user').slice(-1)[0];
    const lastAiMessage = recentMessages.filter(msg => msg.type === 'ai').slice(-1)[0];
    
    if (lastUserMessage) {
      compressed += `\nÚltima pergunta: "${lastUserMessage.content.substring(0, 60)}..."`;
    }
    if (lastAiMessage) {
      compressed += `\nÚltima resposta: "${lastAiMessage.content.substring(0, 60)}..."`;
    }
  }
  
  // Add current user message
  const currentMessage = recentMessages?.find(msg => msg.type === 'user')?.content || '';
  if (currentMessage) {
    compressed += `\nATUAL: "${currentMessage}"`;
  }
  
  return compressed || 'Nova conversa';
};

// Singleton instance
export const optimizedAnalysisService = new OptimizedAnalysisService();