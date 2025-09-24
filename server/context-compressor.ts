interface ConversationContext {
  turns: ConversationTurn[];
  summary: string;
  keyPoints: string[];
  lastCompression: number;
}

interface ConversationTurn {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tokens?: number;
}

interface CompressedStructure {
  essentials: {
    title: string;
    type: string;
    mainPoints: string[];
  };
  metadata: {
    difficulty: string;
    examType: string;
    theme: string;
  };
}

export class ContextCompressor {
  private readonly COMPRESSION_THRESHOLD = 3; // Compress after 3 turns
  private readonly MAX_SUMMARY_TOKENS = 150;
  private readonly MAX_CONTEXT_TOKENS = 400;

  // Compress conversation context to reduce tokens by 30-40%
  compressConversation(context: ConversationContext): string {
    const recentTurns = context.turns.slice(-2); // Keep last 2 turns
    const summary = this.generateConversationSummary(context.turns.slice(0, -2));
    
    let compressed = '';
    
    if (summary && summary.length > 20) {
      compressed += `Contexto anterior: ${summary}\n\n`;
    }
    
    // Add recent turns with essential info only
    for (const turn of recentTurns) {
      const essentialContent = this.extractEssentialContent(turn.content);
      compressed += `${turn.type === 'user' ? 'U' : 'A'}: ${essentialContent}\n`;
    }
    
    return compressed.trim();
  }

  // Generate rolling summary every 3 turns
  generateConversationSummary(turns: ConversationTurn[]): string {
    if (turns.length === 0) return '';
    
    const keyTopics = this.extractKeyTopics(turns);
    const mainRequests = this.extractMainRequests(turns);
    const decisions = this.extractDecisions(turns);
    
    let summary = '';
    if (keyTopics.length > 0) {
      summary += `Temas: ${keyTopics.join(', ')}. `;
    }
    if (mainRequests.length > 0) {
      summary += `Solicitações: ${mainRequests.join(', ')}. `;
    }
    if (decisions.length > 0) {
      summary += `Decisões: ${decisions.join(', ')}.`;
    }
    
    return this.truncateToTokenLimit(summary, this.MAX_SUMMARY_TOKENS);
  }

  // Extract essential content removing verbose instructions
  private extractEssentialContent(content: string): string {
    // Remove verbose system instructions
    let essential = content
      .replace(/^(Você é um|Como|Por favor|Preciso que|Gostaria que).*?[.:]\s*/gi, '')
      .replace(/\b(obrigatoriamente|necessariamente|impreterivelmente)\b/gi, '')
      .replace(/\b(IMPORTANTE|ATENÇÃO|OBS|OBSERVAÇÃO):[^.]*\./gi, '')
      .replace(/\(.*?\)/g, '') // Remove parenthetical explanations
      .replace(/\s{2,}/g, ' ') // Normalize whitespace
      .trim();
    
    // Keep only the core request/content
    const sentences = essential.split(/[.!?]+/).filter(s => s.trim().length > 10);
    essential = sentences.slice(0, 2).join('. ');
    
    return this.truncateToTokenLimit(essential, 100);
  }

  // Compress essay structure objects
  compressStructure(structure: any): CompressedStructure {
    return {
      essentials: {
        title: structure.title || 'Estrutura personalizada',
        type: structure.type || 'dissertativa',
        mainPoints: this.extractMainPoints(structure)
      },
      metadata: {
        difficulty: structure.difficulty || 'medio',
        examType: structure.examType || 'enem',
        theme: structure.theme || 'geral'
      }
    };
  }

  // Extract only main structural points
  private extractMainPoints(structure: any): string[] {
    const points = [];
    
    if (structure.introduction) {
      points.push(`Intro: ${this.summarizeSection(structure.introduction)}`);
    }
    
    if (structure.development && Array.isArray(structure.development)) {
      structure.development.forEach((dev: any, index: number) => {
        points.push(`D${index + 1}: ${this.summarizeSection(dev)}`);
      });
    }
    
    if (structure.conclusion) {
      points.push(`Conclusão: ${this.summarizeSection(structure.conclusion)}`);
    }
    
    return points.slice(0, 4); // Max 4 main points
  }

  // Summarize a section to essential keywords
  private summarizeSection(section: any): string {
    if (typeof section === 'string') {
      return this.extractKeywords(section, 5).join(' ');
    }
    
    if (section.content) {
      return this.extractKeywords(section.content, 5).join(' ');
    }
    
    if (section.topic) {
      return this.extractKeywords(section.topic, 3).join(' ');
    }
    
    return 'seção personalizada';
  }

  // Extract key topics from conversation
  private extractKeyTopics(turns: ConversationTurn[]): string[] {
    const allContent = turns.map(t => t.content).join(' ');
    return this.extractKeywords(allContent, 3, ['redação', 'texto', 'parágrafo', 'estrutura']);
  }

  // Extract main user requests
  private extractMainRequests(turns: ConversationTurn[]): string[] {
    const userTurns = turns.filter(t => t.type === 'user');
    const requests = [];
    
    for (const turn of userTurns) {
      const content = turn.content.toLowerCase();
      if (content.includes('modific') || content.includes('alter')) {
        requests.push('modificação');
      }
      if (content.includes('gera') || content.includes('cri')) {
        requests.push('geração');
      }
      if (content.includes('anális') || content.includes('avali')) {
        requests.push('análise');
      }
      if (content.includes('estrutur')) {
        requests.push('estruturação');
      }
    }
    
    return Array.from(new Set(requests)).slice(0, 3);
  }

  // Extract decisions made
  private extractDecisions(turns: ConversationTurn[]): string[] {
    const assistantTurns = turns.filter(t => t.type === 'assistant');
    const decisions = [];
    
    for (const turn of assistantTurns) {
      const content = turn.content.toLowerCase();
      if (content.includes('optim') || content.includes('melhor')) {
        decisions.push('otimizado');
      }
      if (content.includes('estrutur')) {
        decisions.push('estruturado');
      }
      if (content.includes('formal')) {
        decisions.push('formalizado');
      }
    }
    
    return Array.from(new Set(decisions)).slice(0, 3);
  }

  // Extract keywords from text
  private extractKeywords(text: string, maxKeywords: number, exclude: string[] = []): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !exclude.includes(word) &&
        !['para', 'uma', 'com', 'que', 'por', 'como', 'seu', 'mais', 'pode', 'ser', 'ter', 'dos', 'das', 'nos', 'nas'].includes(word)
      );
    
    // Count frequency
    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Return most frequent words
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  // Truncate text to approximate token limit
  private truncateToTokenLimit(text: string, maxTokens: number): string {
    // Approximate: 1 token ≈ 0.75 words in Portuguese
    const maxWords = Math.floor(maxTokens * 0.75);
    const words = text.split(/\s+/);
    
    if (words.length <= maxWords) {
      return text;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  }

  // Calculate compression ratio
  calculateCompressionRatio(original: string, compressed: string): number {
    const originalTokens = this.estimateTokens(original);
    const compressedTokens = this.estimateTokens(compressed);
    
    return originalTokens > 0 ? (compressedTokens / originalTokens) : 1;
  }

  // Estimate token count (Portuguese approximation)
  private estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 0.75); // Portuguese: ~0.75 words per token
  }
}

// Singleton instance
export const contextCompressor = new ContextCompressor();