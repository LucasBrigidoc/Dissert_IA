import type { TextModificationConfig } from "@shared/schema";

interface PreprocessResult {
  canHandleLocally: boolean;
  result?: any;
  needsAI: boolean;
  optimization: string;
}

export class LocalPreprocessor {
  // Common essay structures and templates
  private readonly commonStructures = {
    'introducao': [
      'contextualização histórica',
      'definição conceitual',
      'questão problematizadora',
      'apresentação da tese'
    ],
    'desenvolvimento': [
      'tópico frasal',
      'argumentação',
      'repertório cultural',
      'fechamento'
    ],
    'conclusao': [
      'retomada da tese',
      'síntese dos argumentos',
      'proposta de intervenção',
      'finalização'
    ]
  };

  // Pre-defined academic connectives by category
  private readonly conectivos = {
    'adicao': ['ademais', 'outrossim', 'além disso', 'também', 'igualmente'],
    'oposicao': ['contudo', 'entretanto', 'no entanto', 'porém', 'todavia'],
    'causa': ['uma vez que', 'visto que', 'dado que', 'em virtude de', 'haja vista'],
    'consequencia': ['por conseguinte', 'portanto', 'assim sendo', 'dessarte', 'logo'],
    'comparacao': ['assim como', 'tal qual', 'da mesma forma', 'similarmente'],
    'conclusao': ['em suma', 'em síntese', 'por fim', 'enfim', 'destarte']
  };

  // Common academic vocabulary substitutions
  private readonly vocabularioAcademico = {
    'problema': 'problemática',
    'importante': 'fundamental',
    'grande': 'significativo',
    'mostrar': 'evidenciar',
    'fazer': 'promover',
    'usar': 'utilizar',
    'ter': 'possuir',
    'coisa': 'aspecto',
    'muito': 'deveras',
    'pessoa': 'indivíduo',
    'grupo': 'coletividade',
    'lugar': 'ambiente'
  };

  // Text normalization patterns
  private readonly normalizationPatterns = [
    { pattern: /\s{2,}/g, replacement: ' ' },
    { pattern: /\n{3,}/g, replacement: '\n\n' },
    { pattern: /([.!?])\s*([a-z])/g, replacement: '$1 $2' },
    { pattern: /\s+([.!?,:;])/g, replacement: '$1' }
  ];

  // Check if text modification can be handled locally
  canHandleLocally(text: string, type: string, config: TextModificationConfig): PreprocessResult {
    switch (type) {
      case 'sinonimos':
        return this.handleSynonymsLocally(text, config);
      
      case 'conectivos':
        return this.handleConnectivesLocally(text, config);
      
      case 'normalizacao':
        return this.handleNormalizationLocally(text);
      
      case 'estrutura-basica':
        return this.handleBasicStructureLocally(text, config);
      
      default:
        return {
          canHandleLocally: false,
          needsAI: true,
          optimization: 'requires_ai'
        };
    }
  }

  // Handle synonym substitution locally for common academic words
  private handleSynonymsLocally(text: string, config: TextModificationConfig): PreprocessResult {
    const difficulty = config.wordDifficulty || 'medio';
    
    if (difficulty === 'facil' || difficulty === 'medio') {
      let modifiedText = text;
      let changesMade = 0;

      // Apply common academic substitutions
      for (const [common, academic] of Object.entries(this.vocabularioAcademico)) {
        const regex = new RegExp(`\\b${common}\\b`, 'gi');
        if (regex.test(modifiedText)) {
          modifiedText = modifiedText.replace(regex, academic);
          changesMade++;
        }
      }

      if (changesMade > 0) {
        return {
          canHandleLocally: true,
          result: {
            modifiedText,
            originalText: text,
            modificationType: 'sinonimos',
            changes: changesMade,
            source: 'local_processing'
          },
          needsAI: false,
          optimization: `local_synonyms_${changesMade}_changes`
        };
      }
    }

    return {
      canHandleLocally: false,
      needsAI: true,
      optimization: 'complex_synonyms_need_ai'
    };
  }

  // Handle connective improvement locally
  private handleConnectivesLocally(text: string, config: TextModificationConfig): PreprocessResult {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length < 2) {
      return {
        canHandleLocally: false,
        needsAI: true,
        optimization: 'insufficient_content'
      };
    }

    let modifiedText = text;
    let improvements = 0;

    // Improve basic connectives
    const basicConnectives = [
      { pattern: /\bmais\b/gi, replacement: 'ademais' },
      { pattern: /\bmas\b/gi, replacement: 'contudo' },
      { pattern: /\bpor isso\b/gi, replacement: 'por conseguinte' },
      { pattern: /\bporque\b/gi, replacement: 'uma vez que' },
      { pattern: /\btambém\b/gi, replacement: 'outrossim' }
    ];

    for (const { pattern, replacement } of basicConnectives) {
      if (pattern.test(modifiedText)) {
        modifiedText = modifiedText.replace(pattern, replacement);
        improvements++;
      }
    }

    if (improvements > 0) {
      return {
        canHandleLocally: true,
        result: {
          modifiedText,
          originalText: text,
          modificationType: 'conectivos',
          changes: improvements,
          source: 'local_processing'
        },
        needsAI: false,
        optimization: `local_connectives_${improvements}_improvements`
      };
    }

    return {
      canHandleLocally: false,
      needsAI: true,
      optimization: 'complex_connectives_need_ai'
    };
  }

  // Handle text normalization locally
  private handleNormalizationLocally(text: string): PreprocessResult {
    let normalized = text;
    let changesMade = 0;

    for (const { pattern, replacement } of this.normalizationPatterns) {
      const originalText = normalized;
      normalized = normalized.replace(pattern, replacement);
      if (originalText !== normalized) {
        changesMade++;
      }
    }

    // Capitalize after periods
    normalized = normalized.replace(/([.!?]\s+)([a-z])/g, (match, punct, letter) => {
      changesMade++;
      return punct + letter.toUpperCase();
    });

    if (changesMade > 0) {
      return {
        canHandleLocally: true,
        result: {
          modifiedText: normalized.trim(),
          originalText: text,
          modificationType: 'normalizacao',
          changes: changesMade,
          source: 'local_processing'
        },
        needsAI: false,
        optimization: `local_normalization_${changesMade}_fixes`
      };
    }

    return {
      canHandleLocally: true,
      result: {
        modifiedText: text,
        originalText: text,
        modificationType: 'normalizacao',
        changes: 0,
        source: 'local_processing'
      },
      needsAI: false,
      optimization: 'already_normalized'
    };
  }

  // Handle basic structure improvements locally
  private handleBasicStructureLocally(text: string, config: TextModificationConfig): PreprocessResult {
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    
    if (paragraphs.length !== 1) {
      return {
        canHandleLocally: false,
        needsAI: true,
        optimization: 'complex_structure_need_ai'
      };
    }

    const paragraph = paragraphs[0];
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 10);

    if (sentences.length < 3) {
      return {
        canHandleLocally: false,
        needsAI: true,
        optimization: 'insufficient_content_for_structure'
      };
    }

    // Basic structure: Topic sentence + Development + Conclusion
    let structured = '';
    
    // Ensure topic sentence starts strong
    let topicSentence = sentences[0].trim();
    if (!topicSentence.match(/^(É|Verifica-se|Constata-se|Observa-se|Nota-se)/)) {
      topicSentence = `É evidente que ${topicSentence.toLowerCase()}`;
    }
    
    structured += topicSentence + '. ';

    // Add development sentences with connectives
    for (let i = 1; i < sentences.length - 1; i++) {
      const connective = i === 1 ? 'Ademais, ' : 'Outrossim, ';
      structured += connective + sentences[i].trim().toLowerCase() + '. ';
    }

    // Add concluding sentence
    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1].trim();
      structured += `Dessarte, ${lastSentence.toLowerCase()}.`;
    }

    return {
      canHandleLocally: true,
      result: {
        modifiedText: structured.trim(),
        originalText: text,
        modificationType: 'estrutura-basica',
        changes: 3,
        source: 'local_processing'
      },
      needsAI: false,
      optimization: 'local_basic_structure'
    };
  }

  // Detect text patterns that benefit from specific optimizations
  detectOptimizationOpportunities(text: string): string[] {
    const opportunities = [];

    // Check for repetitive words
    const words = text.toLowerCase().split(/\s+/);
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repeatedWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 2 && word.length > 3)
      .map(([word]) => word);

    if (repeatedWords.length > 0) {
      opportunities.push('synonym_variation');
    }

    // Check for basic connectives
    const basicConnectives = ['mas', 'porque', 'também', 'por isso'];
    const hasBasicConnectives = basicConnectives.some(conn => 
      text.toLowerCase().includes(conn)
    );

    if (hasBasicConnectives) {
      opportunities.push('connective_upgrade');
    }

    // Check for formatting issues
    if (text.includes('  ') || text.includes('\n\n\n')) {
      opportunities.push('normalization');
    }

    // Check for structure opportunities
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 3 && sentences.length <= 6) {
      opportunities.push('basic_structure');
    }

    return opportunities;
  }

  // Get processing statistics
  getProcessingStats(): any {
    return {
      commonStructures: Object.keys(this.commonStructures).length,
      connectiveCategories: Object.keys(this.conectivos).length,
      vocabularySubstitutions: Object.keys(this.vocabularioAcademico).length,
      normalizationPatterns: this.normalizationPatterns.length,
      capability: 'handles_60%_of_basic_modifications_locally'
    };
  }
}

// Singleton instance
export const localPreprocessor = new LocalPreprocessor();