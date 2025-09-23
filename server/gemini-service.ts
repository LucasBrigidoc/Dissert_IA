import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Repertoire } from "@shared/schema";

export class GeminiService {
  private genAI: GoogleGenerativeAI | null;
  private model: any;
  private hasApiKey: boolean;

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
    this.hasApiKey = !!apiKey;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment variables. AI features will be limited.");
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
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

  // Sistema de detecção de contexto educacional
  private detectEducationalContext(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('enem') || queryLower.includes('exame nacional')) {
      return 'enem';
    }
    if (queryLower.includes('vestibular') || queryLower.includes('entrada universidade')) {
      return 'vestibular';
    }
    if (queryLower.includes('concurso') || queryLower.includes('cargo público') || queryLower.includes('servidor público')) {
      return 'concurso_publico';
    }
    if (queryLower.includes('dissertação') || queryLower.includes('mestrado') || queryLower.includes('doutorado') || queryLower.includes('acadêmico')) {
      return 'academico';
    }
    if (queryLower.includes('oab') || queryLower.includes('ordem dos advogados')) {
      return 'oab';
    }
    
    return 'geral';
  }

  // Sistema de detecção temática inteligente
  private detectThematicContext(query: string): string {
    const queryLower = query.toLowerCase();
    
    const thematicPatterns = {
      'tecnologia_digital': ['tecnologia', 'digital', 'internet', 'inteligência artificial', 'ia', '5g', 'lgpd', 'privacidade', 'dados', 'algoritmo'],
      'educacao_ensino': ['educação', 'ensino', 'escola', 'professor', 'aprendizagem', 'pedagógico', 'currículo', 'universitário'],
      'meio_ambiente': ['meio ambiente', 'sustentabilidade', 'clima', 'aquecimento global', 'desmatamento', 'poluição', 'energia renovável', 'biodiversidade'],
      'desigualdade_social': ['desigualdade', 'pobreza', 'exclusão', 'marginalização', 'renda', 'social', 'vulnerabilidade', 'miséria'],
      'saude_publica': ['saúde', 'sus', 'medicina', 'epidemia', 'pandemia', 'doença', 'vacinação', 'hospitais'],
      'violencia_seguranca': ['violência', 'segurança', 'criminalidade', 'homicídio', 'feminicídio', 'drogas', 'policial'],
      'democracia_politica': ['democracia', 'eleições', 'política', 'governo', 'cidadania', 'participação', 'representação'],
      'trabalho_economia': ['trabalho', 'emprego', 'desemprego', 'economia', 'renda', 'salário', 'precarização', 'reforma trabalhista'],
      'cultura_arte': ['cultura', 'arte', 'música', 'cinema', 'literatura', 'identidade cultural', 'patrimônio'],
      'comunicacao_midia': ['comunicação', 'mídia', 'jornalismo', 'fake news', 'redes sociais', 'informação'],
      'direitos_humanos': ['direitos humanos', 'igualdade', 'discriminação', 'preconceito', 'racismo', 'gênero', 'lgbtqia'],
      'urbanizacao': ['cidade', 'urbano', 'mobilidade', 'transporte', 'habitação', 'saneamento', 'periferia']
    };
    
    let bestMatch = 'geral';
    let maxScore = 0;
    
    for (const [theme, keywords] of Object.entries(thematicPatterns)) {
      let score = 0;
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          score += keyword.split(' ').length;
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = theme;
      }
    }
    
    return bestMatch;
  }

  // Detecção de nível do usuário pela query
  private detectUserLevelFromQuery(query: string): 'basic' | 'intermediate' | 'advanced' {
    const queryLower = query.toLowerCase();
    let score = 0;
    
    if (queryLower.includes('não sei') || queryLower.includes('me ajuda') || queryLower.includes('exemplos simples')) {
      score -= 2;
    }
    
    if (queryLower.includes('como usar') || queryLower.includes('aplicar') || queryLower.includes('desenvolver')) {
      score += 1;
    }
    
    if (queryLower.includes('multidisciplinar') || queryLower.includes('complexo') || queryLower.includes('sofisticado') || 
        queryLower.includes('filosófico') || queryLower.includes('sociológico') || queryLower.includes('epistemológico')) {
      score += 3;
    }
    
    const words = queryLower.split(/\s+/);
    const complexWords = words.filter(word => word.length > 8).length;
    if (complexWords > 3) score += 2;
    
    if (query.length > 200) score += 1;
    if (query.length > 400) score += 2;
    
    if (score >= 4) return 'advanced';
    if (score >= 1) return 'intermediate';
    return 'basic';
  }

  // Sistema COMPLETO de examples temáticos por tema e nível  
  private getThematicExamples(theme: string, context: string, level: string): string {
    const examples = {
      'tecnologia_digital': {
        basic: [
          {
            title: "Black Mirror",
            description: "Série que mostra os perigos da tecnologia. COMO USAR: Cite episódios específicos como 'Nosedive' para argumentar contra dependência de redes sociais, ou 'USS Callister' para discutir ética na programação. Conecte com temas de limite tecnológico e impacto social.",
            type: "series", category: "technology", popularity: "very-popular", year: "2011", rating: 47,
            keywords: ["tecnologia", "black mirror", "redes sociais", "ética digital"]
          },
          {
            title: "Lei Geral de Proteção de Dados (LGPD)",
            description: "Lei brasileira de 2020 que protege dados pessoais. COMO USAR: Use na tese para defender regulamentação tech, no desenvolvimento para exemplificar avanços legislativos, ou na conclusão propondo expansão de direitos digitais.",
            type: "laws", category: "technology", popularity: "very-popular", year: "2020", rating: 46,
            keywords: ["lgpd", "privacidade", "dados pessoais", "direitos digitais"]
          }
        ],
        intermediate: [
          {
            title: "O Dilema das Redes",
            description: "Documentário que expõe como algoritmos manipulam comportamento. Ex-executivos do Google e Facebook revelam técnicas de vício digital. COMO USAR: Use para argumentar sobre economia da atenção, citando depoimentos específicos de ex-funcionários para dar credibilidade ao argumento.",
            type: "documentaries", category: "technology", popularity: "popular", year: "2020", rating: 45,
            keywords: ["algoritmos", "manipulação", "vício digital", "big tech"]
          },
          {
            title: "Marco Civil da Internet",
            description: "Lei 12.965/2014 que estabelece direitos e deveres no uso da internet no Brasil. COMO USAR: Compare com legislações internacionais, use para defender neutralidade de rede, ou cite seus princípios ao propor novas regulamentações digitais.",
            type: "laws", category: "technology", popularity: "popular", year: "2014", rating: 44,
            keywords: ["marco civil", "neutralidade", "internet", "regulamentação"]
          }
        ],
        advanced: [
          {
            title: "Capitalismo de Vigilância (Shoshana Zuboff)",
            description: "Obra que analisa como empresas tecnológicas extraem dados comportamentais para prever e modificar ações humanas. COMO USAR: Use conceitos como 'surplus comportamental' para análises críticas sobre autonomia individual na era digital. Conecte com questões filosóficas sobre livre-arbítrio.",
            type: "books", category: "technology", popularity: "moderate", year: "2019", rating: 48,
            keywords: ["capitalismo de vigilância", "zuboff", "dados comportamentais", "autonomia"]
          }
        ]
      },
      'educacao_ensino': {
        basic: [
          {
            title: "Cidade de Deus",
            description: "Filme que retrata jovens na periferia carioca. COMO USAR: Contraste destinos de Buscapé (educação) vs Zé Pequeno (criminalidade) para argumentar sobre educação como ferramenta de transformação social. Use na introdução para impactar ou no desenvolvimento como exemplo concreto.",
            type: "movies", category: "education", popularity: "very-popular", year: "2002", rating: 48,
            keywords: ["educação social", "periferia", "oportunidades", "transformação"]
          },
          {
            title: "Lei de Diretrizes e Bases (LDB)",
            description: "Lei 9.394/96 que organiza a educação brasileira. COMO USAR: Cite artigos específicos sobre direito à educação gratuita para defender ampliação de acesso, ou use dados sobre educação básica obrigatória para propor políticas inclusivas.",
            type: "laws", category: "education", popularity: "very-popular", year: "1996", rating: 45,
            keywords: ["ldb", "educação básica", "direito educação", "estado"]
          }
        ],
        intermediate: [
          {
            title: "IDEB (Índice de Desenvolvimento da Educação Básica)",
            description: "Indicador criado em 2007 que combina fluxo escolar e desempenho. Meta é alcançar 6,0 até 2021. COMO USAR: Use dados específicos (ex: Brasil tem IDEB 5,8) para mostrar desafios quantitativos da educação. Compare com outros países para contextualizar.",
            type: "data", category: "education", popularity: "popular", year: "2007", rating: 44,
            keywords: ["ideb", "qualidade educação", "avaliação", "metas educacionais"]
          },
          {
            title: "Programa Mais Educação",
            description: "Política de 2007 que amplia jornada escolar com atividades complementares. COMO USAR: Use como exemplo de política pública exitosa, conecte com conceito de educação integral, ou cite para propor ampliação de programas similares.",
            type: "laws", category: "education", popularity: "popular", year: "2007", rating: 43,
            keywords: ["educação integral", "jornada ampliada", "atividades complementares"]
          }
        ],
        advanced: [
          {
            title: "Pedagogia do Oprimido (Paulo Freire)",
            description: "Obra fundamental que propõe educação libertadora baseada no diálogo e consciência crítica. COMO USAR: Use conceitos como 'educação bancária' vs 'educação problematizadora' para análises críticas do sistema educacional. Conecte com questões de emancipação social.",
            type: "books", category: "education", popularity: "moderate", year: "1968", rating: 49,
            keywords: ["paulo freire", "pedagogia crítica", "educação libertadora", "conscientização"]
          }
        ]
      },
      'meio_ambiente': {
        basic: [
          {
            title: "Wall-E",
            description: "Animação da Pixar sobre Terra devastada pelo consumismo. COMO USAR: Use a imagem da Terra coberta de lixo para introdução impactante sobre consumo sustentável, ou cite o contraste entre vida artificial (nave) e natural (planta) para defender preservação ambiental.",
            type: "movies", category: "environment", popularity: "very-popular", year: "2008", rating: 47,
            keywords: ["sustentabilidade", "consumismo", "futuro planeta", "responsabilidade ambiental"]
          },
          {
            title: "Código Florestal Brasileiro",
            description: "Lei 12.651/2012 que define regras para proteção da vegetação nativa. COMO USAR: Cite percentuais de Reserva Legal (20% Amazônia, 35% Cerrado) para mostrar legislação específica, ou use conceito de APPs para defender proteção de nascentes.",
            type: "laws", category: "environment", popularity: "very-popular", year: "2012", rating: 45,
            keywords: ["código florestal", "vegetação nativa", "apps", "reserva legal"]
          }
        ],
        intermediate: [
          {
            title: "Acordo de Paris",
            description: "Tratado internacional de 2015 que visa limitar aquecimento global a 2°C. COMO USAR: Cite metas específicas de redução de emissões para argumentar sobre responsabilidade nacional, ou compare adesão de países para mostrar cooperação internacional necessária.",
            type: "laws", category: "environment", popularity: "popular", year: "2015", rating: 46,
            keywords: ["mudanças climáticas", "aquecimento global", "cooperação internacional"]
          },
          {
            title: "Dados INPE Desmatamento",
            description: "Instituto Nacional de Pesquisas Espaciais monitora desmatamento em tempo real. COMO USAR: Use números específicos (ex: 2020 teve 10.851 km² desmatados na Amazônia) para dar precisão aos argumentos. Compare dados anuais para mostrar tendências.",
            type: "data", category: "environment", popularity: "popular", year: "2020", rating: 44,
            keywords: ["desmatamento", "amazônia", "monitoramento", "dados oficiais"]
          }
        ],
        advanced: [
          {
            title: "Antropoceno e Colapso Climático",
            description: "Conceito científico que define nova era geológica marcada pela ação humana no planeta. COMO USAR: Use para análises profundas sobre responsabilidade geracional, conecte com filosofia ambiental e ética intergeracional. Ideal para redações que demandam perspectiva histórica ampla.",
            type: "research", category: "environment", popularity: "moderate", year: "2016", rating: 47,
            keywords: ["antropoceno", "era geológica", "impacto humano", "ética intergeracional"]
          }
        ]
      },
      'desigualdade_social': {
        basic: [
          {
            title: "Cidade de Deus",
            description: "Filme de 2002 sobre periferia carioca. COMO USAR: Contraste entre personagens que tiveram acesso à educação (Buscapé) vs aqueles sem oportunidades (Zé Pequeno) para ilustrar como desigualdade perpetua ciclos de violência.",
            type: "movies", category: "social", popularity: "very-popular", year: "2002", rating: 48,
            keywords: ["desigualdade", "periferia", "violência urbana", "oportunidades"]
          },
          {
            title: "Auxílio Emergencial 2020",
            description: "Programa social que transferiu R$ 321 bilhões para 68 milhões de brasileiros durante pandemia. COMO USAR: Use dados específicos para mostrar eficácia de programas de transferência de renda na redução da pobreza emergencial.",
            type: "data", category: "social", popularity: "very-popular", year: "2020", rating: 45,
            keywords: ["transferência de renda", "pandemia", "proteção social", "pobreza"]
          }
        ],
        intermediate: [
          {
            title: "Coeficiente de Gini Brasil",
            description: "Indicador que mede desigualdade de renda. Brasil tem Gini de 0,543 (2019), um dos maiores do mundo. COMO USAR: Compare com países nórdicos (Gini ~0,25) para dimensionar problema brasileiro, ou cite evolução histórica para mostrar (des)progresso social.",
            type: "data", category: "social", popularity: "popular", year: "2019", rating: 44,
            keywords: ["desigualdade de renda", "gini", "concentração de renda", "comparação internacional"]
          },
          {
            title: "Programa Bolsa Família",
            description: "Maior programa de transferência de renda da América Latina (2003-2021), atendendo 14 milhões de famílias. COMO USAR: Cite dados sobre redução da extrema pobreza (de 9,7% para 2,8%) para defender políticas de redistribuição de renda.",
            type: "laws", category: "social", popularity: "popular", year: "2003", rating: 46,
            keywords: ["bolsa família", "transferência de renda", "combate à pobreza", "condicionalidades"]
          }
        ],
        advanced: [
          {
            title: "Casa-Grande & Senzala (Gilberto Freyre)",
            description: "Obra de 1933 sobre formação social brasileira e herança escravista. COMO USAR: Use conceito de 'democracia racial' como mito para análise crítica sobre persistência de desigualdades estruturais. Conecte com questões contemporâneas de racismo institucional.",
            type: "books", category: "social", popularity: "moderate", year: "1933", rating: 47,
            keywords: ["formação social", "escravidão", "democracia racial", "estrutural"]
          }
        ]
      },
      'saude_publica': {
        basic: [
          {
            title: "SUS (Sistema Único de Saúde)",
            description: "Sistema público de saúde brasileiro criado em 1990, um dos maiores do mundo. COMO USAR: Cite princípios da universalidade e integralidade para defender saúde como direito, ou use dados de cobertura (75% da população) para mostrar importância social.",
            type: "laws", category: "social", popularity: "very-popular", year: "1990", rating: 48,
            keywords: ["sus", "saúde pública", "universalidade", "sistema de saúde"]
          },
          {
            title: "Oswaldo Cruz e Revolta da Vacina",
            description: "Sanitarista brasileiro que modernizou saúde pública no início do século XX. Revolta da Vacina (1904) mostra resistência popular. COMO USAR: Use para mostrar histórico de campanhas sanitárias no Brasil, conectando com debates atuais sobre vacinação obrigatória.",
            type: "events", category: "social", popularity: "popular", year: "1904", rating: 44,
            keywords: ["oswaldo cruz", "revolta da vacina", "saúde pública", "vacinação"]
          }
        ],
        intermediate: [
          {
            title: "Lei Arouca (Lei 8080/90)",
            description: "Lei orgânica que regulamenta o SUS, estabelecendo diretrizes e princípios. COMO USAR: Cite artigos específicos sobre participação social e descentralização para defender gestão democrática da saúde, ou use princípios da integralidade para propor políticas.",
            type: "laws", category: "social", popularity: "popular", year: "1990", rating: 45,
            keywords: ["lei arouca", "sus", "participação social", "integralidade"]
          }
        ],
        advanced: [
          {
            title: "Determinantes Sociais da Saúde (OMS)",
            description: "Conceito que analisa como condições socioeconômicas influenciam saúde das populações. COMO USAR: Use para análises multidisciplinares conectando saúde com educação, renda e habitação. Ideal para argumentos sobre necessidade de políticas intersetoriais.",
            type: "research", category: "social", popularity: "moderate", year: "2005", rating: 46,
            keywords: ["determinantes sociais", "oms", "saúde coletiva", "intersetorialidade"]
          }
        ]
      },
      'violencia_seguranca': {
        basic: [
          {
            title: "Tropa de Elite",
            description: "Filme de 2007 que retrata violência urbana no Rio de Janeiro. COMO USAR: Use críticas do Capitão Nascimento ao sistema para mostrar complexidade da segurança pública, ou contraste entre BOPE e polícia regular para argumentar sobre especialização vs. proximidade comunitária.",
            type: "movies", category: "social", popularity: "very-popular", year: "2007", rating: 46,
            keywords: ["violência urbana", "segurança pública", "rio de janeiro", "bope"]
          },
          {
            title: "Lei Maria da Penha",
            description: "Lei 11.340/2006 que cria mecanismos para coibir violência doméstica contra mulher. COMO USAR: Cite dados de redução de feminicídios pós-lei para demonstrar eficácia legislativa, ou compare com legislações internacionais para mostrar avanço brasileiro.",
            type: "laws", category: "social", popularity: "very-popular", year: "2006", rating: 48,
            keywords: ["maria da penha", "violência doméstica", "feminicídio", "direitos da mulher"]
          }
        ],
        intermediate: [
          {
            title: "Atlas da Violência (IPEA)",
            description: "Relatório anual que mapeia homicídios no Brasil. Taxa de 27,4 homicídios por 100 mil habitantes (2019). COMO USAR: Use dados específicos por região/demografia para mostrar padrões (jovens negros concentram 75% das vítimas). Compare com países desenvolvidos para dimensionar problema.",
            type: "data", category: "social", popularity: "popular", year: "2019", rating: 45,
            keywords: ["atlas da violência", "homicídios", "ipea", "juventude negra"]
          }
        ],
        advanced: [
          {
            title: "Necropolítica (Achille Mbembe)",
            description: "Conceito que analisa como Estados exercem poder de morte sobre populações específicas. COMO USAR: Use para análises críticas sobre seletividade da violência estatal, conectando com questões de racismo estrutural e genocídio da juventude negra brasileira.",
            type: "books", category: "social", popularity: "moderate", year: "2016", rating: 47,
            keywords: ["necropolítica", "mbembe", "racismo estrutural", "poder de morte"]
          }
        ]
      },
      'democracia_politica': {
        basic: [
          {
            title: "Constituição Federal de 1988",
            description: "Constituição Cidadã que redemocratizou o Brasil. COMO USAR: Cite artigo 1º sobre soberania popular para defender participação cidadã, ou use princípios constitucionais para propor fortalecimento democrático. Compare com períodos autoritários para valorizar conquistas.",
            type: "laws", category: "politics", popularity: "very-popular", year: "1988", rating: 49,
            keywords: ["constituição 1988", "democratização", "direitos fundamentais", "cidadania"]
          },
          {
            title: "Diretas Já (1983-1984)",
            description: "Movimento que mobilizou milhões pela eleição direta para presidente. COMO USAR: Use como exemplo de mobilização popular exitosa, cite números de manifestantes (1,5 milhão em São Paulo) para mostrar poder da participação cidadã organizada.",
            type: "events", category: "politics", popularity: "popular", year: "1984", rating: 47,
            keywords: ["diretas já", "redemocratização", "mobilização popular", "eleições diretas"]
          }
        ],
        intermediate: [
          {
            title: "Lei da Ficha Limpa",
            description: "Lei 135/2010 que impede candidatura de condenados. Surgiu de iniciativa popular com 1,3 milhão de assinaturas. COMO USAR: Use como exemplo de participação cidadã efetiva na criação de políticas, cite dados sobre políticos barrados para mostrar impacto prático.",
            type: "laws", category: "politics", popularity: "popular", year: "2010", rating: 46,
            keywords: ["ficha limpa", "iniciativa popular", "combate à corrupção", "moralização política"]
          }
        ],
        advanced: [
          {
            title: "Coronelismo (Victor Nunes Leal)",
            description: "Análise clássica sobre poder local no Brasil e persistência de práticas oligárquicas. COMO USAR: Use conceito de 'compromisso coronelista' para analisar continuidades autoritárias na democracia brasileira. Conecte com discussões sobre clientelismo contemporâneo.",
            type: "books", category: "politics", popularity: "moderate", year: "1949", rating: 48,
            keywords: ["coronelismo", "poder local", "oligarquia", "clientelismo"]
          }
        ]
      },
      'trabalho_economia': {
        basic: [
          {
            title: "CLT (Consolidação das Leis do Trabalho)",
            description: "Marco trabalhista de 1943 que regulamenta relações de trabalho no Brasil. COMO USAR: Cite direitos específicos (férias, 13º, FGTS) para defender proteção trabalhista, ou compare com flexibilizações recentes para mostrar tensões entre capital e trabalho.",
            type: "laws", category: "social", popularity: "very-popular", year: "1943", rating: 47,
            keywords: ["clt", "direitos trabalhistas", "consolidação", "proteção"]
          },
          {
            title: "Tempos Modernos (Charlie Chaplin)",
            description: "Filme de 1936 sobre desumanização do trabalho industrial. COMO USAR: Use cenas icônicas (Chaplin na engrenagem) para introduzir temas sobre alienação do trabalho, ou compare taylorismo histórico com precarização atual (uberização).",
            type: "movies", category: "social", popularity: "very-popular", year: "1936", rating: 48,
            keywords: ["trabalho industrial", "alienação", "chaplin", "taylorismo"]
          }
        ],
        intermediate: [
          {
            title: "Taxa de Desemprego IBGE",
            description: "Indicador oficial que mede população desocupada. Brasil teve 14,2% (2021), recorde histórico. COMO USAR: Compare com períodos históricos para mostrar gravidade da crise, ou use dados por demografia (jovens têm taxa maior) para propor políticas específicas.",
            type: "data", category: "social", popularity: "popular", year: "2021", rating: 44,
            keywords: ["desemprego", "ibge", "crise econômica", "mercado de trabalho"]
          }
        ],
        advanced: [
          {
            title: "Uberização do Trabalho",
            description: "Conceito sociológico sobre precarização através de plataformas digitais. COMO USAR: Use para análises sobre 'falso empreendedorismo' e flexibilização extrema. Conecte com questões de direitos trabalhistas na economia digital e responsabilização de plataformas.",
            type: "research", category: "social", popularity: "moderate", year: "2020", rating: 45,
            keywords: ["uberização", "precarização", "plataformas digitais", "gig economy"]
          }
        ]
      },
      'cultura_arte': {
        basic: [
          {
            title: "Villa-Lobos",
            description: "Compositor brasileiro que fundiu música erudita com popular, criando identidade musical nacional. COMO USAR: Use como exemplo de valorização cultural brasileira, cite obras como 'Bachianas Brasileiras' para mostrar síntese entre tradições locais e universais.",
            type: "events", category: "culture", popularity: "popular", year: "1930", rating: 46,
            keywords: ["villa-lobos", "música brasileira", "identidade cultural", "nacionalismo"]
          },
          {
            title: "Lei Rouanet",
            description: "Lei 8.313/91 que incentiva produção cultural via renúncia fiscal. COMO USAR: Cite dados de investimento (R$ 1,2 bi/ano) para defender políticas culturais, ou use críticas sobre concentração regional para propor democratização do acesso cultural.",
            type: "laws", category: "culture", popularity: "popular", year: "1991", rating: 44,
            keywords: ["lei rouanet", "incentivo cultural", "renúncia fiscal", "políticas culturais"]
          }
        ],
        intermediate: [
          {
            title: "Semana de Arte Moderna de 1922",
            description: "Marco do modernismo brasileiro que revolucionou expressões artísticas nacionais. COMO USAR: Use conceito de 'antropofagia cultural' (Oswald de Andrade) para discutir identidade brasileira, ou cite ruptura com padrões europeus para defender originalidade cultural nacional.",
            type: "events", category: "culture", popularity: "popular", year: "1922", rating: 47,
            keywords: ["semana de 22", "modernismo", "antropofagia cultural", "identidade nacional"]
          }
        ],
        advanced: [
          {
            title: "Indústria Cultural (Adorno e Horkheimer)",
            description: "Conceito frankfurtiano sobre massificação e mercantilização da cultura. COMO USAR: Use para análises críticas sobre padronização cultural, conecte com debates sobre streaming, algoritmos e homogeneização do gosto. Ideal para discussões sobre autonomia estética.",
            type: "books", category: "culture", popularity: "moderate", year: "1947", rating: 48,
            keywords: ["indústria cultural", "escola de frankfurt", "massificação", "mercantilização"]
          }
        ]
      },
      'comunicacao_midia': {
        basic: [
          {
            title: "Redes Sociais e Fake News",
            description: "Fenômeno contemporâneo de desinformação amplificada por algoritmos. COMO USAR: Cite casos específicos (eleições 2018/2022) para mostrar impacto na democracia, ou use dados sobre velocidade de propagação (fake news se espalha 6x mais rápido) para defender educação midiática.",
            type: "research", category: "technology", popularity: "very-popular", year: "2020", rating: 45,
            keywords: ["fake news", "desinformação", "redes sociais", "democracia"]
          }
        ],
        intermediate: [
          {
            title: "Marco Civil da Internet",
            description: "Lei 12.965/2014 que estabelece princípios para internet no Brasil, incluindo neutralidade de rede. COMO USAR: Use artigos sobre liberdade de expressão vs. remoção de conteúdo para discutir limites da regulação digital, ou cite neutralidade para defender acesso igualitário à informação.",
            type: "laws", category: "technology", popularity: "popular", year: "2014", rating: 44,
            keywords: ["marco civil", "neutralidade de rede", "liberdade de expressão", "regulação digital"]
          }
        ],
        advanced: [
          {
            title: "Esfera Pública (Jürgen Habermas)",
            description: "Conceito sobre espaço democrático de debate racional entre cidadãos. COMO USAR: Use para análises sobre deterioração do debate público nas redes sociais, conecte com questões de polarização e fragmentação informacional. Ideal para propor reconstrução dialógica da democracia.",
            type: "books", category: "social", popularity: "moderate", year: "1962", rating: 47,
            keywords: ["esfera pública", "habermas", "debate democrático", "razão comunicativa"]
          }
        ]
      }
    };
    
    const themeExamples = examples[theme as keyof typeof examples];
    if (!themeExamples) {
      return this.getGenericExamples();
    }
    
    const levelExamples = themeExamples[level as keyof typeof themeExamples] || themeExamples.basic;
    return JSON.stringify(levelExamples, null, 2);
  }

  // Examples genéricos robustos para temas não mapeados
  private getGenericExamples(): string {
    return `[
  {
    "title": "Dom Casmurro",
    "description": "Romance de Machado de Assis sobre ciúme e narrativa não-confiável. COMO USAR: Use Capitu como exemplo de personagem complexa para argumentar sobre subjetividade, ou cite a ambiguidade narrativa para discutir diferentes perspectivas sobre a verdade.",
    "type": "books",
    "category": "social",
    "popularity": "very-popular",
    "year": "1899",
    "rating": 48,
    "keywords": ["machado de assis", "ciúme", "capitu", "literatura brasileira"]
  },
  {
    "title": "Declaração Universal dos Direitos Humanos",
    "description": "Marco histórico de 1948 que estabelece direitos fundamentais. COMO USAR: Cite artigo 1º (dignidade e igualdade) para defender direitos universais, ou use como referência para propor políticas inclusivas e combate à discriminação.",
    "type": "laws",
    "category": "social",
    "popularity": "very-popular",
    "year": "1948",
    "rating": 49,
    "keywords": ["direitos humanos", "onu", "dignidade", "igualdade"]
  },
  {
    "title": "1984 - George Orwell",
    "description": "Distopia sobre controle totalitário e manipulação da informação. COMO USAR: Use conceitos como 'Grande Irmão' para criticar vigilância excessiva, ou 'duplipensar' para discutir manipulação de narrativas e fake news.",
    "type": "books",
    "category": "politics",
    "popularity": "very-popular",
    "year": "1949",
    "rating": 48,
    "keywords": ["distopia", "totalitarismo", "vigilância", "manipulação"]
  },
  {
    "title": "Dados COVID-19 Brasil",
    "description": "Pandemia que causou 700+ mil mortes no Brasil, evidenciando desigualdades sociais e importância da ciência. COMO USAR: Use dados de mortalidade por classe social para argumentar sobre desigualdade na saúde, ou cite importância de políticas baseadas em evidência científica.",
    "type": "data",
    "category": "social",
    "popularity": "very-popular", 
    "year": "2020",
    "rating": 45,
    "keywords": ["covid-19", "pandemia", "saúde pública", "desigualdade", "ciência"]
  }
]`;
  }

  // Construtor de prompt inteligente personalizado
  private buildIntelligentPrompt(query: string, userFilters: any, context: any): string {
    const { analysis, educationalContext, thematicContext, userLevel, batchSize, typeInstruction } = context;
    
    // CORREÇÃO CRÍTICA: Aplicar filtros do usuário no prompt
    const categoryFilter = userFilters.category && userFilters.category !== 'all' 
      ? `\nFILTRO CATEGORIA: Gere APENAS repertórios com "category": "${userFilters.category}"`
      : '';
    
    const popularityFilter = userFilters.popularity && userFilters.popularity !== 'all' 
      ? `\nFILTRO POPULARIDADE: Gere APENAS repertórios com "popularity": "${userFilters.popularity}"`
      : '';
    
    // Instruções de diversificação baseadas no contexto
    const diversificationRules = this.getDiversificationRules(thematicContext, educationalContext);
    
    // Adaptações específicas por nível
    const levelInstructions = this.getLevelInstructions(userLevel);
    
    // Examples contextuais
    const contextualExamples = this.getThematicExamples(thematicContext, educationalContext, userLevel);
    
    return `BUSCA INTELIGENTE: "${query}"
${typeInstruction}${categoryFilter}${popularityFilter}

CONTEXTO DETECTADO:
🎓 Contexto: ${educationalContext}
🎯 Tema: ${thematicContext}
📚 Nível: ${userLevel}

${diversificationRules}

${levelInstructions}

REGRA ABSOLUTA: Retorne apenas obras/pessoas/leis/dados ESPECÍFICOS e REAIS, nunca categorias.
${userFilters.category ? `IMPORTANTE: Todos os itens devem ter category="${userFilters.category}".` : ''}
${userFilters.popularity ? `IMPORTANTE: Todos os itens devem ter popularity="${userFilters.popularity}".` : ''}

EXEMPLOS CONTEXTUAIS para "${query}":
${contextualExamples}

Gere ${batchSize} repertórios específicos com INSTRUÇÕES DE USO:

FORMATO OBRIGATÓRIO:
{
  "title": "Nome específico",
  "description": "Descrição detalhada + COMO USAR: explicar onde aplicar na redação (tese/argumento/exemplo) + conexões temáticas",
  "type": "${userFilters.type || 'tipo'}",
  "category": "${userFilters.category || 'categoria'}", 
  "popularity": "${userFilters.popularity || 'popularidade'}",
  "year": "ano",
  "rating": número,
  "keywords": ["palavras-chave"]
}

Se não conseguir gerar títulos específicos reais, retorne array vazio [].`;
  }

  // Regras de diversificação por tema
  private getDiversificationRules(theme: string, context: string): string {
    const rules = {
      'tecnologia_digital': '📱 DIVERSIFICAÇÃO TECNOLOGIA:\n• 35% Séries/Filmes (Black Mirror, Matrix, Ex Machina)\n• 30% Leis/Marcos (LGPD, Marco Civil, GDPR)\n• 20% Documentários (Dilema das Redes, Coded Bias)\n• 15% Pesquisas/Dados (dados de uso, relatórios)',
      'educacao_ensino': '📚 DIVERSIFICAÇÃO EDUCAÇÃO:\n• 40% Leis/Políticas (LDB, PNE, FUNDEB)\n• 25% Dados/Índices (IDEB, PISA, taxa alfabetização)\n• 20% Filmes/Documentários (Escritores da Liberdade, Pro Dia Nascer Feliz)\n• 15% Livros/Autores (Paulo Freire, Darcy Ribeiro)',
      'meio_ambiente': '🌍 DIVERSIFICAÇÃO AMBIENTAL:\n• 35% Acordos/Leis (Acordo Paris, Código Florestal)\n• 25% Dados Ambientais (desmatamento, emissões CO2)\n• 25% Documentários (Uma Verdade Inconveniente, Seaspiracy)\n• 15% Filmes (Wall-E, Avatar, Mad Max)',
      'geral': '🎯 DIVERSIFICAÇÃO EQUILIBRADA:\n• 40% Literatura/Clássicos\n• 25% Marcos legais/Políticas\n• 20% Cinema nacional/internacional\n• 15% Dados oficiais/Pesquisas'
    };
    
    return rules[theme as keyof typeof rules] || rules.geral;
  }

  // Instruções específicas por nível
  private getLevelInstructions(level: string): string {
    const instructions = {
      basic: '🟢 NÍVEL BÁSICO - FOQUE EM:\n• Obras conhecidas e acessíveis\n• Explicações didáticas simples\n• Exemplos claros de como usar\n• Conectivos básicos sugeridos',
      intermediate: '🟡 NÍVEL INTERMEDIÁRIO - FOQUE EM:\n• Misture popular com específico\n• Dados de fontes oficiais\n• Múltiplas perspectivas\n• Conectivos variados',
      advanced: '🔴 NÍVEL AVANÇADO - FOQUE EM:\n• Repertórios sofisticados\n• Análises multidisciplinares\n• Referências acadêmicas\n• Perspectivas filosóficas/sociológicas'
    };
    
    return instructions[level as keyof typeof instructions] || instructions.basic;
  }

  // Sistema de pós-processamento para garantir diversificação
  private enforceDiversificationRules(repertoires: any[], theme: string, targetDistribution: any): any[] {
    if (repertoires.length === 0) return repertoires;
    
    // Definir distribuição ideal por tema
    const themeDistributions = {
      'tecnologia_digital': { 'series': 35, 'laws': 30, 'documentaries': 20, 'data': 15 },
      'educacao_ensino': { 'laws': 40, 'data': 25, 'movies': 20, 'books': 15 },
      'meio_ambiente': { 'laws': 35, 'data': 25, 'documentaries': 25, 'movies': 15 },
      'geral': { 'books': 40, 'laws': 25, 'movies': 20, 'data': 15 }
    };
    
    const idealDistribution = themeDistributions[theme as keyof typeof themeDistributions] || themeDistributions.geral;
    const totalCount = repertoires.length;
    
    // Calcular quantidades ideais
    const idealCounts: any = {};
    for (const [type, percentage] of Object.entries(idealDistribution)) {
      idealCounts[type] = Math.round((totalCount * percentage) / 100);
    }
    
    // Agrupar repertórios por tipo
    const byType: any = {};
    repertoires.forEach(rep => {
      const type = rep.type || 'books';
      if (!byType[type]) byType[type] = [];
      byType[type].push(rep);
    });
    
    // Balancear conforme distribuição ideal
    const balanced: any[] = [];
    for (const [type, idealCount] of Object.entries(idealCounts)) {
      const available = byType[type] || [];
      const toTake = Math.min(idealCount as number, available.length);
      
      // Pegar os melhores por rating
      const selected = available
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, toTake);
      
      balanced.push(...selected);
      
      // Remover dos disponíveis
      if (byType[type]) {
        byType[type] = byType[type].filter((rep: any) => !selected.includes(rep));
      }
    }
    
    // Completar com repertórios restantes se necessário
    const remaining: any[] = [];
    for (const typeArray of Object.values(byType)) {
      remaining.push(...(typeArray as any[]));
    }
    
    // Adicionar os melhores restantes até completar o total
    const stillNeeded = totalCount - balanced.length;
    if (stillNeeded > 0) {
      const bestRemaining = remaining
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, stillNeeded);
      balanced.push(...bestRemaining);
    }
    
    return balanced.slice(0, totalCount);
  }

  // SISTEMA INTELIGENTE: Repertórios contextuais e pedagógicos
  async generateRepertoiresBatch(query: string, userFilters: {
    type?: string;
    category?: string;
    popularity?: string;
  } = {}, batchSize: number = 6): Promise<any[]> {
    // Análise inteligente local (0 tokens)
    const analysis = this.analyzeSearchQueryLocal(query);
    const educationalContext = this.detectEducationalContext(query);
    const thematicContext = this.detectThematicContext(query);
    const userLevel = this.detectUserLevelFromQuery(query);
    
    // Ultra-concise prompt - 80% fewer tokens
    const typeInstruction = userFilters.type && userFilters.type !== 'all' 
      ? `IMPORTANT: Generate ONLY "${userFilters.type}" type repertoires. All items must have "type": "${userFilters.type}".`
      : '';
    
    const allowedTypes = userFilters.type && userFilters.type !== 'all' 
      ? userFilters.type 
      : 'books';
    
    const allowedCategory = userFilters.category || 'education';
    const allowedPopularity = userFilters.popularity || 'popular';

    // Prompt inteligente personalizado
    const prompt = this.buildIntelligentPrompt(query, userFilters, {
      analysis,
      educationalContext,
      thematicContext,
      userLevel,
      batchSize,
      typeInstruction
    });

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Enhanced JSON parsing with multiple fallback strategies
      let repertoires: any[] = [];
      
      try {
        // Strategy 1: Clean and parse directly
        let cleanedResponse = response.replace(/```json|```/g, '').trim();
        
        // Strategy 2: Extract JSON array using regex if direct parsing fails
        if (!cleanedResponse.startsWith('[')) {
          const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
          }
        }
        
        // Strategy 3: Additional cleaning for common malformed patterns
        cleanedResponse = cleanedResponse
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted property names
          .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
          .replace(/\n|\r/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' '); // Normalize whitespace
        
        repertoires = JSON.parse(cleanedResponse);
        
        // Validate the parsed result
        if (!Array.isArray(repertoires)) {
          repertoires = (repertoires as any)?.repertoires || [];
        }
        
        // Filter out invalid objects
        repertoires = repertoires.filter(rep => 
          rep && 
          typeof rep === 'object' && 
          rep.title && 
          rep.description
        );

        // Filter out generic titles - enforce specificity
        const beforeFilter = repertoires.length;
        repertoires = repertoires.filter(rep => {
          const rawTitle = String(rep.title).trim();
          const titleLower = rawTitle.toLowerCase();
          
          // Reject generic category patterns (using lowercase for regex)
          const genericPatterns = [
            /^(livros?|filmes?|artigos?|notícias?|pesquisas?|dados?|eventos?|leis?)\s+(sobre|de|da|do)/i,
            /^(obras?|trabalhos?|estudos?|documentários?)\s+(sobre|de|da|do)/i,
            /(sobre|de|da|do)\s+(educação|tecnologia|meio ambiente|violência|política)$/i,
            /para\s+(jovens|estudantes|crianças)$/i
          ];
          
          const isGeneric = genericPatterns.some(pattern => pattern.test(titleLower));
          if (isGeneric) {
            console.log(`🚫 Filtered generic title: "${rep.title}"`);
            return false;
          }
          
          // Require proper noun heuristics (using original casing for capitalization check)
          const words = rawTitle.split(/\s+/);
          const stopWords = new Set(['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'por', 'com']);
          const capitalizedWords = words.filter((word: string) => 
            word.length > 2 && 
            /^[A-ZÀÁÂÃÄÇÉÊËÍÎÏÑÓÔÕÖÙÚÛÜ]/.test(word) &&
            !stopWords.has(word.toLowerCase())
          );
          
          if (capitalizedWords.length === 0) {
            console.log(`🚫 Filtered non-proper noun title: "${rep.title}"`);
            return false;
          }
          
          return true;
        });
        
        if (beforeFilter > repertoires.length) {
          console.log(`🔍 Filtered ${beforeFilter - repertoires.length} generic titles, keeping ${repertoires.length} specific ones`);
        }
        
        console.log(`✅ Successfully parsed ${repertoires.length} repertoires from AI`);
        
        // CORREÇÃO CRÍTICA: Aplicar filtros do usuário rigorosamente
        if (repertoires.length > 0) {
          const beforeUserFilters = repertoires.length;
          
          // Filtrar por tipo se especificado
          if (userFilters.type && userFilters.type !== 'all') {
            repertoires = repertoires.filter(rep => rep.type === userFilters.type);
          }
          
          // Filtrar por categoria se especificada
          if (userFilters.category && userFilters.category !== 'all') {
            repertoires = repertoires.filter(rep => rep.category === userFilters.category);
          }
          
          // Filtrar por popularidade se especificada
          if (userFilters.popularity && userFilters.popularity !== 'all') {
            repertoires = repertoires.filter(rep => rep.popularity === userFilters.popularity);
          }
          
          if (beforeUserFilters > repertoires.length) {
            console.log(`🔧 User filters applied: ${beforeUserFilters} → ${repertoires.length} repertoires (removed ${beforeUserFilters - repertoires.length} non-matching)`);
          }
        }
        
        // APLICAR DIVERSIFICAÇÃO: Garantir distribuição equilibrada (apenas se não há filtro de tipo específico)
        if (repertoires.length > 0 && (!userFilters.type || userFilters.type === 'all')) {
          const beforeDiversification = repertoires.length;
          repertoires = this.enforceDiversificationRules(repertoires, thematicContext, {});
          console.log(`🎯 Diversification enforced: ${beforeDiversification} → ${repertoires.length} repertoires balanced`);
        }
        
      } catch (parseError: any) {
        console.log("JSON parsing failed, using fallback:", parseError?.message || parseError);
        throw parseError;
      }
      
      return repertoires.length > 0 ? repertoires : this.generateFallbackRepertoires(query, analysis, userFilters);
      
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

  // Detectar perguntas repetidas para orientação mais eficiente
  private detectRepeatedQuestions(userMessages: any[]): boolean {
    if (userMessages.length < 3) return false;
    
    const recentMessages = userMessages.slice(-3);
    const similarities = [];
    
    for (let i = 0; i < recentMessages.length - 1; i++) {
      for (let j = i + 1; j < recentMessages.length; j++) {
        const msg1 = recentMessages[i].content.toLowerCase();
        const msg2 = recentMessages[j].content.toLowerCase();
        
        // Verificar palavras-chave similares
        const keywords1 = msg1.split(' ').filter((word: string) => word.length > 3);
        const keywords2 = msg2.split(' ').filter((word: string) => word.length > 3);
        
        const commonKeywords = keywords1.filter((word: string) => keywords2.includes(word));
        const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
        
        if (similarity > 0.4) {
          similarities.push(similarity);
        }
      }
    }
    
    return similarities.length > 0 && similarities.some(sim => sim > 0.5);
  }

  // Context-aware AI Chat with conversation memory (versão otimizada)
  async generateWithContext(
    summary: string | null,
    recentMessages: any[],
    section: string,
    context: any
  ): Promise<string> {
    try {
      // Build conversation context
      let conversationContext = '';
      
      // Add summary if available
      if (summary) {
        conversationContext += `CONTEXTO DA CONVERSA:\n${summary}\n\n`;
      }
      
      // Add recent messages for immediate context (otimizado para detectar padrões)
      if (recentMessages && recentMessages.length > 0) {
        conversationContext += 'MENSAGENS RECENTES:\n';
        recentMessages.slice(-6).forEach((msg, index) => {
          if (msg && msg.content) {
            const role = msg.type === 'user' ? 'ESTUDANTE' : 'PROFESSOR';
            conversationContext += `${role}: ${msg.content}\n`;
          }
        });
        conversationContext += '\n';
        
        // Análise de padrões na conversa
        const userMessages = recentMessages.filter(msg => msg.type === 'user');
        const hasRepeatedQuestions = this.detectRepeatedQuestions(userMessages);
        if (hasRepeatedQuestions) {
          conversationContext += 'PADRÃO DETECTADO: Usuário fazendo perguntas similares - forneça orientação mais direcionada.\n\n';
        }
      }
      
      // Get the current user message from the last message
      const currentMessage = recentMessages && recentMessages.length > 0 
        ? recentMessages[recentMessages.length - 1]?.content || ''
        : '';
      
      // Build enhanced contextual prompt with conversation memory (usando nova versão)
      const basePrompt = this.buildContextualPrompt(currentMessage, section, context);
      
      // Combine conversation context with base prompt
      const enhancedPrompt = conversationContext 
        ? `${conversationContext}INSTRUÇÃO ATUAL:\n${basePrompt}

IMPORTANTE: Use o contexto da conversa anterior para manter continuidade e referências. Se o estudante se referir a algo mencionado antes, reconheça e construa sobre essa informação.`
        : basePrompt;
      
      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating AI response with context:", error);
      // Fallback to standard suggestion without context
      const currentMessage = recentMessages && recentMessages.length > 0 
        ? recentMessages[recentMessages.length - 1]?.content || ''
        : '';
      return this.getFallbackSuggestion(currentMessage, section, context);
    }
  }

  private buildContextualPrompt(userMessage: string, section: string, context: any): string {
    // Detectar o nível do usuário baseado no conteúdo existente
    const userLevel = this.detectUserLevel(context);
    
    // Detectar se o usuário está com dúvidas específicas que precisam de exemplos
    const needsExamples = this.detectNeedsExamples(userMessage);
    
    const sectionInstructions = {
      optimization: {
        beginner: "REFINAMENTO DE IDEIA - Vou analisar sua ideia e torná-la mais específica e argumentativa.",
        intermediate: "OTIMIZAÇÃO DE IDEIA - Vou aprimorar sua proposta com maior precisão argumentativa.",
        advanced: "SOFISTICAÇÃO CONCEITUAL - Vou refinar com maior complexidade e elegância argumentativa."
      },
      tema: {
        beginner: "DESENVOLVIMENTO DE TEMA - Vou te ajudar a entender e desenvolver o tema da sua redação de forma clara e focada.",
        intermediate: "APRIMORAMENTO TEMÁTICO - Vamos delimitar melhor o recorte e abordagem do tema.",
        advanced: "REFINAMENTO TEMÁTICO - Vamos trabalhar nuances e especificidades temáticas com maior profundidade."
      },
      tese: {
        beginner: "CONSTRUÇÃO DE TESE - Vou te ensinar a criar uma tese clara e bem fundamentada.",
        intermediate: "FORTALECIMENTO DE TESE - Vamos tornar sua tese mais persuasiva e robusta.",
        advanced: "SOFISTICAÇÃO DA TESE - Vamos elaborar uma tese mais complexa e sofisticada."
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
      },
      finalizacao: {
        beginner: "FINALIZAÇÃO - Vamos organizar e revisar todo o seu trabalho.",
        intermediate: "CONCLUSÃO DO PROCESSO - Vamos finalizar com excelência.",
        advanced: "APERFEIÇOAMENTO FINAL - Vamos dar os toques finais para excelência."
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
    
    // Instruções especiais para quando o usuário precisa de exemplos
    if (needsExamples) {
      prompt += `🎯 INSTRUÇÃO ESPECIAL: O usuário demonstrou dúvida específica e precisa de exemplos práticos.\n`;
      prompt += `OBRIGATÓRIO fornecer:\n`;
      prompt += `• 3-5 exemplos concretos e específicos\n`;
      prompt += `• Explicação de como cada exemplo se aplica\n`;
      prompt += `• Orientação pedagógica passo a passo\n`;
      prompt += `• Linguagem encorajadora e didática\n\n`;
    }
    
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
      prompt += `Responda de forma didática, conversacional e encorajadora:\n`;
      prompt += `• Use linguagem simples e amigável como um professor paciente\n`;
      prompt += `• Dê exemplos práticos e específicos (pelo menos 3 quando necessário)\n`;
      prompt += `• Explique o "por quê" por trás de cada sugestão pedagogicamente\n`;
      prompt += `• Ofereça frases/conectivos prontos quando apropriado\n`;
      prompt += `• Seja encorajador e mostre que é possível melhorar\n`;
      prompt += `• Quando o usuário demonstrar dúvida, liste exemplos concretos e explique como usar cada um\n\n`;
    } else if (userLevel === 'intermediate') {
      prompt += `Responda de forma objetiva, prática e educativa:\n`;
      prompt += `• Foque em aprimoramentos específicos com justificativas\n`;
      prompt += `• Sugira exemplos mais elaborados e variados\n`;
      prompt += `• Trabalhe coesão e conectivos sofisticados\n`;
      prompt += `• Aponte caminhos para elevar o nível do texto\n`;
      prompt += `• Forneça exemplos concretos quando solicitado\n\n`;
    } else {
      prompt += `Responda de forma refinada, analítica e pedagógica:\n`;
      prompt += `• Foque em sofisticação argumentativa com fundamentação\n`;
      prompt += `• Sugira abordagens multidisciplinares\n`;
      prompt += `• Trabalhe nuances e complexidade\n`;
      prompt += `• Aponte caminhos para excelência textual\n`;
      prompt += `• Ofereça exemplos sofisticados e bem fundamentados\n\n`;
    }
    
    // Formato de resposta adaptado ao contexto
    if (needsExamples) {
      prompt += `FORMATO DE RESPOSTA PARA DÚVIDAS (use este formato quando o usuário precisar de exemplos):\n\n`;
      prompt += `🎯 [NOME DA SEÇÃO]\n\n`;
      prompt += `Entendo sua dúvida! Vou te ajudar com exemplos práticos.\n\n`;
      prompt += `📚 EXEMPLOS ESPECÍFICOS:\n`;
      prompt += `1. **[Nome do exemplo]** - [Explicação de como usar na redação]\n`;
      prompt += `2. **[Nome do exemplo]** - [Explicação de como usar na redação]\n`;
      prompt += `3. **[Nome do exemplo]** - [Explicação de como usar na redação]\n\n`;
      prompt += `💡 DICA PRÁTICA:\n[Como aplicar esses exemplos especificamente no tema/contexto do usuário]\n\n`;
      prompt += `🔧 PRÓXIMOS PASSOS:\n[Orientação clara do que fazer a seguir]\n\n`;
      prompt += `IMPORTANTE: Seja conversacional, pedagógico e forneça exemplos detalhados e práticos.`;
    } else {
      prompt += `FORMATO DE RESPOSTA PADRÃO:\n🎯 [NOME DA SEÇÃO]\n\n💡 ANÁLISE RÁPIDA\n[1-2 frases diretas sobre o que o usuário escreveu ou perguntou]\n\n📝 SUGESTÃO PRINCIPAL\n[Uma sugestão concreta e específica - máximo 2 frases]\n\n🔧 COMO MELHORAR\n• [Ponto prático 1 - máximo 1 linha]\n• [Ponto prático 2 - máximo 1 linha]\n• [Ponto prático 3 - máximo 1 linha]\n\n❓ PRÓXIMA ETAPA\n[Pergunta ou direcionamento para continuar - máximo 1 frase]\n\nREGRAS:\n- Linguagem direta e clara\n- Foco em ações práticas\n- Sempre termine direcionando o próximo passo`;
    }

    // Instruções de progressão inteligente - FUNDAMENTAL para evitar mensagens duplicadas
    prompt += `

PROGRESSÃO INTELIGENTE (MUITO IMPORTANTE):
Analise se o usuário completou adequadamente o conceito atual:

SE o usuário desenvolveu bem a seção atual (${section}):
- Inclua no FINAL da sua resposta uma orientação natural para avançar
- Use frases como: "Ótimo! Agora que [resumo do que foi feito], vamos para [próximo passo]"
- Fluxo: tema → tese → introdução → desenvolvimento1 → desenvolvimento2 → conclusão

SE o usuário ainda está explorando/tem dúvidas sobre a seção atual:
- Continue no mesmo tópico, aprofunde mais
- Use frases como: "Vamos continuar desenvolvendo este ponto" ou "Que tal explorarmos mais esta ideia"

CONTEXTO ATUAL:
- Seção atual: ${section}
- Conteúdo existente: ${JSON.stringify(context)}

IMPORTANTE: Esta é a ÚNICA fonte de orientação de progresso. NÃO haverá mensagens automáticas separadas.
Sua resposta deve ser completa e incluir orientação de próximos passos de forma natural.`;
    
    return prompt;
  }

  private detectNeedsExamples(userMessage: string): boolean {
    const needsExamplesPatterns = [
      'não sei',
      'não conheço',
      'não lembro',
      'que política',
      'qual política',
      'que lei',
      'qual lei',
      'que exemplo',
      'qual exemplo',
      'como usar',
      'não entendo',
      'me ajuda',
      'me dê exemplo',
      'preciso de exemplo',
      'não faço ideia',
      'nunca ouvi',
      'não tenho conhecimento',
      'pode me dar',
      'você pode sugerir',
      'quais são',
      'me ensina',
      'explica',
      'como funciona',
      'você tem algum',
      'pode citar',
      'me dá uma ideia',
      'estou sem ideias',
      'não consigo pensar',
      'não sei o que',
      'pode me mostrar',
      'tem alguma sugestão'
    ];
    
    const messageLower = userMessage.toLowerCase();
    return needsExamplesPatterns.some(pattern => messageLower.includes(pattern));
  }

  // Nova função para detectar padrões de dificuldade específicos
  private detectStrugglingAreas(userMessage: string, context: any): string[] {
    const struggles = [];
    const messageLower = userMessage.toLowerCase();
    
    // Dificuldades com argumentação
    if (messageLower.includes('argumento') || messageLower.includes('como defender') || messageLower.includes('como justificar')) {
      struggles.push('argumentacao');
    }
    
    // Dificuldades com exemplos
    if (messageLower.includes('exemplo') || messageLower.includes('como usar') || messageLower.includes('política')) {
      struggles.push('exemplificacao');
    }
    
    // Dificuldades com conectivos
    if (messageLower.includes('conectar') || messageLower.includes('ligar') || messageLower.includes('conectivo')) {
      struggles.push('coesao');
    }
    
    // Dificuldades com estrutura
    if (messageLower.includes('estrutura') || messageLower.includes('organizar') || messageLower.includes('como começar')) {
      struggles.push('estrutura');
    }
    
    return struggles;
  }

  private detectUserLevel(context: any, conversationHistory?: any[]): 'beginner' | 'intermediate' | 'advanced' {
    let score = 0;
    
    // Analisar qualidade da tese/ideia (sistema aprimorado)
    if (context.tese) {
      if (context.tese.length > 50) score += 1;
      if (context.tese.length > 100) score += 2;
      if (context.tese.length > 200) score += 1;
      
      // Verificar especificidade da tese
      if (/\b(deve|deveria|é necessário|é fundamental|urge)\b/i.test(context.tese)) score += 1;
      
      // Verificar se tem posicionamento claro
      if (/\b(defendo que|acredito que|é evidente que|conclui-se que)\b/i.test(context.tese)) score += 1;
    }
    
    // Analisar parágrafos existentes com critérios mais refinados
    const paragraphs = context.paragrafos || {};
    Object.values(paragraphs).forEach((paragraph: any) => {
      if (paragraph) {
        // Critérios de tamanho
        if (paragraph.length > 80) score += 1;
        if (paragraph.length > 150) score += 1;
        if (paragraph.length > 250) score += 1;
        
        // Conectivos básicos
        if (/\b(portanto|contudo|entretanto|ademais|além disso|por isso)\b/i.test(paragraph)) score += 1;
        
        // Conectivos sofisticados
        if (/\b(outrossim|destarte|não obstante|conquanto|porquanto|dessarte)\b/i.test(paragraph)) score += 2;
        
        // Estruturas argumentativas
        if (/\b(em primeiro lugar|primeiramente|inicialmente|por conseguinte|em suma)\b/i.test(paragraph)) score += 1;
        
        // Uso de dados e evidências
        if (/\b(segundo|de acordo com|conforme|dados do|pesquisa|estatística|\d+%)\b/i.test(paragraph)) score += 2;
        
        // Referências a autoridades
        if (/\b(especialista|expert|pesquisador|sociólogo|economista|filósofo)\b/i.test(paragraph)) score += 1;
      }
    });
    
    // Analisar histórico da conversa se disponível
    if (conversationHistory && conversationHistory.length > 0) {
      const userMessages = conversationHistory.filter(msg => msg.type === 'user');
      const avgMessageLength = userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length;
      
      if (avgMessageLength > 100) score += 1;
      if (avgMessageLength > 200) score += 1;
      
      // Verificar complexidade das perguntas
      const complexQuestions = userMessages.filter(msg => 
        /\b(como posso|qual seria|você acha que|é possível|existe alguma forma)\b/i.test(msg.content)
      );
      score += Math.min(complexQuestions.length, 2);
    }
    
    // Sistema de classificação aprimorado
    if (score >= 12) return 'advanced';
    if (score >= 6) return 'intermediate';
    return 'beginner';
  }

  private getFallbackSuggestion(userMessage: string, section: string, context: any): string {
    const userLevel = this.detectUserLevel(context);
    const needsExamples = this.detectNeedsExamples(userMessage);
    
    // Detectar se precisa de exemplos de políticas públicas específicamente
    const needsPolicyExamples = userMessage.toLowerCase().includes('política') || 
                               userMessage.toLowerCase().includes('lei') ||
                               userMessage.toLowerCase().includes('governo');
    
    if (needsExamples && needsPolicyExamples) {
      return `🎯 EXEMPLOS DE POLÍTICAS PÚBLICAS\n\nEntendo sua dúvida! Vou te ajudar com exemplos práticos de políticas públicas que você pode usar na redação.\n\n📚 EXEMPLOS ESPECÍFICOS:\n\n1. **Lei Maria da Penha (2006)** - Política de proteção à mulher contra violência doméstica. Use em temas sobre direitos humanos, igualdade de gênero e segurança pública.\n\n2. **Programa Mais Médicos (2013)** - Política de interiorização da medicina. Ideal para temas sobre saúde pública, desigualdades regionais e acesso a serviços básicos.\n\n3. **Lei de Cotas (2012)** - Política de ações afirmativas no ensino superior. Excelente para temas sobre educação, inclusão social e redução de desigualdades.\n\n4. **Auxílio Emergencial (2020)** - Política de transferência de renda durante a pandemia. Use em temas sobre proteção social, desemprego e crises econômicas.\n\n5. **Lei Geral de Proteção de Dados - LGPD (2020)** - Política de proteção da privacidade digital. Perfeita para temas sobre tecnologia, privacidade e direitos digitais.\n\n💡 DICA PRÁTICA:\nSempre explique: o que é a política, quando foi criada, qual problema resolve e como se conecta com seu argumento. Exemplo: \"A Lei Maria da Penha, de 2006, demonstra como políticas específicas podem combater problemas sociais estruturais.\"\n\n🔧 PRÓXIMOS PASSOS:\nEscolha 1-2 dessas políticas que se relacionam com seu tema e me conte qual você quer usar para eu te ajudar a desenvolver o argumento completo!`;
    }
    
    const fallbacks = {
      optimization: {
        beginner: needsExamples ? 
          `🎯 REFINAMENTO DE IDEIA\n\nEntendo sua dúvida! Vou te ajudar com exemplos práticos.\n\n📚 EXEMPLOS DE BOAS IDEIAS:\n1. **Específica**: \"Educação digital nas escolas públicas reduz desigualdades sociais\" (em vez de \"educação é importante\")\n2. **Posicionada**: \"Redes sociais prejudicam a saúde mental dos jovens\" (opinião clara)\n3. **Focada**: \"Políticas de cotas universitárias promovem inclusão social\" (recorte definido)\n\n💡 DICA PRÁTICA:\nUma boa ideia tem 3 elementos: tema específico + sua opinião + justificativa. Exemplo: \"A inteligência artificial (tema) deve ser regulamentada (opinião) para proteger empregos humanos (justificativa)\".\n\n🔧 PRÓXIMOS PASSOS:\nMe conte seu tema para eu te ajudar a criar uma ideia específica e bem posicionada!` :
          "🎯 REFINAMENTO DE IDEIA\n\n💡 ANÁLISE RÁPIDA\nSua pergunta mostra que você quer criar uma boa base para sua redação.\n\n📝 SUGESTÃO PRINCIPAL\nTorne sua ideia específica: em vez de \"educação é importante\", diga \"educação digital prepara jovens para o mercado de trabalho\".\n\n🔧 COMO MELHORAR\n• Defina sua posição clara (a favor, contra, ou perspectiva específica)\n• Seja específico sobre qual aspecto do tema você vai abordar\n• Pense em que argumentos e exemplos você usará\n\n❓ PRÓXIMA ETAPA\nMe conte sobre que tema você quer escrever para eu te ajudar com ideias específicas?",
        intermediate: "🎯 **Aprimorando sua ideia do texto**\n\n📊 **Estrutura ideal:**\n\n1️⃣ **Posicionamento claro:** Sua opinião bem definida sobre o tema\n\n2️⃣ **Especificidade:** Evite generalizações, seja preciso\n\n3️⃣ **Conexão argumentativa:** Sua ideia deve anunciar que argumentos virão\n\n4️⃣ **Relevância social:** Mostre por que o tema importa para a sociedade\n\n💼 **Estratégias avançadas:**\n• Use dados ou contexto atual\n• Mencione diferentes perspectivas\n• Conecte com outros temas sociais\n• Antecipe possíveis objeções\n\n🔗 **Conectivos úteis:** \"Diante disso\", \"Nesse contexto\", \"Considerando que\"\n\n🎯 **Meta:** Sua ideia deve convencer o leitor desde o início!",
        advanced: "🧠 **Refinamento conceitual da ideia**\n\n🎨 **Sofisticação argumentativa:**\n\n1️⃣ **Multidimensionalidade:** Aborde aspectos históricos, sociais, econômicos\n\n2️⃣ **Nuances:** Evite polarizações, explore complexidades\n\n3️⃣ **Inovação:** Apresente perspectivas menos óbvias\n\n4️⃣ **Interdisciplinaridade:** Conecte diferentes áreas do conhecimento\n\n📚 **Técnicas avançadas:**\n• Paradoxos e contradições\n• Analogias elaboradas\n• Referências implícitas\n• Questionamentos filosóficos\n\n✨ **Elegância textual:** Use linguagem sofisticada sem rebuscamento\n\n🎯 **Objetivo:** Demonstrar domínio pleno e originalidade de pensamento!"
      },
      tema: {
        beginner: needsExamples ? 
          `🎯 DESENVOLVIMENTO DE TEMA\n\nEntendo sua dúvida! Vou te ajudar com exemplos de como desenvolver temas.\n\n📚 EXEMPLOS DE TEMAS BEM DESENVOLVIDOS:\n\n1. **\"Desafios da educação digital no Brasil\"** - Específico, atual e relevante. Permite discutir inclusão, tecnologia e políticas públicas.\n\n2. **\"Impactos das redes sociais na saúde mental dos jovens\"** - Recorte claro, problema atual e com dados disponíveis.\n\n3. **\"Sustentabilidade urbana e qualidade de vida\"** - Conecta meio ambiente e sociedade, muito atual.\n\n💡 DICA PRÁTICA:\nTransforme temas amplos em específicos: \"Educação\" → \"Educação digital nas escolas públicas\". \"Meio ambiente\" → \"Reciclagem em centros urbanos\".\n\n🔧 PRÓXIMOS PASSOS:\nMe conte que tema você quer desenvolver para eu te ajudar a torná-lo mais específico e focado!` :
          "🎯 DESENVOLVIMENTO DE TEMA\n\n💡 ANÁLISE RÁPIDA\nVocê quer desenvolver um tema de forma clara e focada.\n\n📝 SUGESTÃO PRINCIPAL\nTorne o tema específico e atual. Em vez de \"educação\", use \"educação digital\" ou \"ensino técnico\".\n\n🔧 COMO MELHORAR\n• Delimite o recorte (que aspecto específico?)\n• Conecte com a atualidade (por que é relevante hoje?)\n• Pense nos argumentos que você vai usar\n\n❓ PRÓXIMA ETAPA\nQual tema você quer trabalhar para eu te ajudar a especificar melhor?",
        intermediate: "🎯 **Aprimorando Desenvolvimento Temático**\n\n📊 **Estratégias avançadas:**\n• Delimite recortes específicos e atuais\n• Conecte com dados e tendências contemporâneas\n• Articule diferentes perspectivas sobre o tema\n• Antecipe contrapontos e nuances\n\n🔗 **Conectivos temáticos:** \"Nesse contexto\", \"Diante desse cenário\", \"Considerando essa realidade\"",
        advanced: "🎯 **Refinamento Temático Sofisticado**\n\n🌐 **Abordagem multidimensional:**\n• Explore paradoxos e complexidades temáticas\n• Integre perspectivas históricas, sociais e culturais\n• Articule diferentes campos do conhecimento\n• Demonstre domínio conceitual e originalidade\n\n✨ **Elegância argumentativa:** Apresente recortes inovadores e análises profundas"
      },
      introducao: {
        beginner: needsExamples ?
          `🎯 ESTRUTURA INTRODUÇÃO\n\nEntendo sua dúvida! Vou te ajudar com exemplos práticos de como estruturar.\n\n📚 EXEMPLOS DE REPERTÓRIOS PARA INTRODUÇÃO:\n\n1. **Dados do IBGE ou IPEA** - \"Segundo o IBGE, 30% dos brasileiros não têm acesso à internet...\"\n2. **Contexto histórico** - \"Desde a Revolução Industrial, a tecnologia transforma o trabalho...\"\n3. **Citação de especialista** - \"Como afirma o sociólogo Zygmunt Bauman...\"\n4. **Comparação internacional** - \"Enquanto países nórdicos investem 7% do PIB em educação...\"\n\n💡 DICA PRÁTICA:\nEstrutura: Contextualização (dados/contexto) + Problematização (por que é importante?) + Tese (sua opinião).\n\n🔧 PRÓXIMOS PASSOS:\nEscolha um tipo de repertório e me conte seu tema para eu te ajudar a construir a introdução!` :
          "🎯 ESTRUTURA INTRODUÇÃO\n\n💡 ANÁLISE RÁPIDA\nVocê precisa organizar sua introdução em três partes bem definidas.\n\n📝 SUGESTÃO PRINCIPAL\nUse a estrutura: Contextualização (apresentar tema) + Problematização (mostrar importância) + Tese (sua opinião).\n\n🔧 COMO MELHORAR\n• Comece com \"No mundo contemporâneo...\" ou dados atuais\n• Explique por que o tema é um problema relevante hoje\n• Termine com sua posição clara sobre o assunto\n\n❓ PRÓXIMA ETAPA\nQuer me mostrar sua introdução atual para eu te dar sugestões específicas?",
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

  // Generate essay with AI based on custom structure and proposal
  async generateEssayFromStructure(
    structureName: string,
    sections: any[],
    topic: string,
    additionalInstructions?: string
  ): Promise<string> {
    try {
      // Build structured prompt based on the custom structure
      const sectionsPrompt = sections.map((section, index) => 
        `${index + 1}. **${section.title}**: ${section.description}`
      ).join('\n');

      const prompt = `
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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const essayText = response.text();

      // Clean up the response to ensure it's just the essay text
      return essayText.trim();

    } catch (error) {
      console.error("Error generating essay from structure:", error);
      // Fallback: generate a basic essay structure
      return this.generateFallbackEssay(structureName, sections, topic, additionalInstructions);
    }
  }

  // Fallback essay generation when AI is unavailable
  private generateFallbackEssay(
    structureName: string,
    sections: any[],
    topic: string,
    additionalInstructions?: string
  ): string {
    let essay = '';
    
    sections.forEach((section, index) => {
      const sectionTitle = section.title || `Seção ${index + 1}`;
      
      // Generate basic content based on section position and description
      switch (index) {
        case 0: // First section (usually introduction)
          essay += `A questão sobre "${topic}" tem se tornado cada vez mais relevante em nossa sociedade contemporânea. `;
          essay += `${section.description} `;
          essay += `Este tema desperta debates importantes e merece uma análise cuidadosa dos seus múltiplos aspectos e implicações sociais.\n\n`;
          break;
        
        case sections.length - 1: // Last section (usually conclusion)
          essay += `Em síntese, a análise sobre "${topic}" revela a complexidade e relevância desta questão. `;
          essay += `${section.description} `;
          essay += `É fundamental que a sociedade e as instituições responsáveis implementem medidas efetivas para abordar adequadamente esta temática, promovendo o bem-estar social e o desenvolvimento sustentável.\n\n`;
          break;
        
        default: // Middle sections (development)
          essay += `No que se refere a ${topic.toLowerCase()}, é fundamental considerarmos os aspectos abordados nesta seção. `;
          essay += `${section.description} `;
          essay += `Os dados atuais demonstram a importância desta perspectiva para uma compreensão mais ampla e fundamentada do tema em questão.\n\n`;
          break;
      }
    });
    
    if (additionalInstructions?.trim()) {
      essay += `\n[Observações: Instruções consideradas - ${additionalInstructions}]`;
    }
    
    return essay.trim();
  }

  // Essay correction using professional ENEM criteria
  async correctEssay(essayText: string, topic: string, examType: string = 'ENEM'): Promise<{
    totalScore: number;
    competencies: Array<{
      name: string;
      score: number;
      maxScore: number;
      feedback: string;
      criteria: string;
    }>;
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: string;
    recommendation: string;
  }> {
    try {
      const prompt = `
Você é um corretor profissional especializado em redações do ${examType} com mais de 15 anos de experiência. Analise a redação a seguir seguindo rigorosamente os critérios oficiais do ${examType}.

TEMA DA REDAÇÃO: "${topic}"

TEXTO DA REDAÇÃO:
"${essayText}"

CRITÉRIOS DE AVALIAÇÃO (${examType === 'ENEM' ? 'ENEM' : 'Vestibular'}):

${examType === 'ENEM' ? `
**COMPETÊNCIAS DO ENEM:**
1. **Competência 1 (0-200 pts)**: Demonstrar domínio da modalidade escrita formal da língua portuguesa
2. **Competência 2 (0-200 pts)**: Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento
3. **Competência 3 (0-200 pts)**: Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista
4. **Competência 4 (0-200 pts)**: Demonstrar conhecimento dos mecanismos linguísticos para a construção da argumentação
5. **Competência 5 (0-200 pts)**: Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos
` : `
**CRITÉRIOS DE VESTIBULAR:**
1. **Adequação ao Tema (0-200 pts)**: Compreensão e desenvolvimento do tema proposto
2. **Tipo Textual (0-200 pts)**: Características do texto dissertativo-argumentativo
3. **Coesão e Coerência (0-200 pts)**: Organização das ideias e articulação textual
4. **Modalidade Linguística (0-200 pts)**: Domínio da norma culta e adequação da linguagem
5. **Proposta de Intervenção (0-200 pts)**: Apresentação de soluções viáveis e detalhadas
`}

FORNEÇA UMA ANÁLISE DETALHADA NO SEGUINTE FORMATO JSON:

{
  "totalScore": [soma das 5 competências],
  "competencies": [
    {
      "name": "Competência 1 - Domínio da Língua",
      "score": [0-200],
      "maxScore": 200,
      "feedback": "[Análise específica da competência com exemplos do texto]",
      "criteria": "[Explicação dos critérios avaliados]"
    },
    // ... outras 4 competências
  ],
  "overallFeedback": "[Comentário geral sobre a redação de 3-4 frases]",
  "strengths": ["[3-4 pontos fortes específicos]"],
  "improvements": ["[3-4 sugestões de melhoria específicas]"],
  "detailedAnalysis": "[Análise detalhada da estrutura: introdução, desenvolvimento, conclusão - 2-3 parágrafos]",
  "recommendation": "[Recomendação final como um professor experiente]"
}

INSTRUÇÕES IMPORTANTES:
- Seja rigoroso mas construtivo na avaliação
- Cite trechos específicos do texto quando pertinente
- Dê notas realistas baseadas nos critérios oficiais
- Forneça feedback actionable para melhoria
- Use linguagem profissional mas acessível
- Considere o nível esperado para ${examType}
- Analise se há proposta de intervenção clara e detalhada
- Verifique argumentação consistente e repertório sociocultural
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const correction = JSON.parse(cleanedResponse);
      
      // Validate response structure
      if (!correction.totalScore || !correction.competencies || !Array.isArray(correction.competencies)) {
        throw new Error("Invalid correction response format");
      }
      
      return correction;
      
    } catch (error) {
      console.error("Error correcting essay:", error);
      return this.generateFallbackCorrection(essayText, topic, examType);
    }
  }

  private generateFallbackCorrection(essayText: string, topic: string, examType: string): any {
    const wordCount = essayText.trim().split(/\s+/).length;
    const hasStructure = essayText.includes('\n') || essayText.length > 800;
    
    // Basic scoring based on text analysis
    const baseScore = Math.min(160, Math.max(80, (wordCount / 6) + (hasStructure ? 40 : 0)));
    
    return {
      totalScore: Math.round(baseScore * 5),
      competencies: [
        {
          name: "Competência 1 - Domínio da Língua",
          score: Math.round(baseScore + 10),
          maxScore: 200,
          feedback: "Análise baseada na extensão e estrutura do texto. Para uma avaliação completa, recomenda-se revisão detalhada.",
          criteria: "Domínio da modalidade escrita formal da língua portuguesa"
        },
        {
          name: "Competência 2 - Compreensão do Tema",
          score: Math.round(baseScore),
          maxScore: 200,
          feedback: "O texto demonstra tentativa de abordar o tema proposto. Seria importante desenvolver mais os conceitos centrais.",
          criteria: "Compreender a proposta e aplicar conhecimentos das várias áreas"
        },
        {
          name: "Competência 3 - Argumentação",
          score: Math.round(baseScore - 10),
          maxScore: 200,
          feedback: "A argumentação pode ser fortalecida com mais exemplos e dados concretos para sustentar o ponto de vista.",
          criteria: "Selecionar e organizar informações em defesa de um ponto de vista"
        },
        {
          name: "Competência 4 - Coesão e Coerência",
          score: Math.round(baseScore),
          maxScore: 200,
          feedback: "A estrutura textual demonstra organização. Sugerimos atenção aos conectivos para melhor fluidez.",
          criteria: "Conhecimento dos mecanismos linguísticos para argumentação"
        },
        {
          name: "Competência 5 - Proposta de Intervenção",
          score: Math.round(baseScore - 20),
          maxScore: 200,
          feedback: "É fundamental incluir uma proposta de intervenção detalhada, com agente, ação, meio e finalidade.",
          criteria: "Elaborar proposta respeitando os direitos humanos"
        }
      ],
      overallFeedback: `Redação avaliada automaticamente com ${wordCount} palavras. A análise completa requer correção manual detalhada.`,
      strengths: [
        "Tentativa de estruturação do texto",
        "Abordagem do tema proposto",
        "Demonstração de conhecimento sobre o assunto"
      ],
      improvements: [
        "Desenvolver melhor a argumentação",
        "Incluir mais repertório sociocultural",
        "Detalhar a proposta de intervenção",
        "Melhorar a articulação entre parágrafos"
      ],
      detailedAnalysis: "Esta é uma análise básica. Para feedback detalhado sobre estrutura, gramática e argumentação, recomenda-se correção completa com IA ativada.",
      recommendation: "Continue praticando a escrita e busque ampliar seu repertório cultural. Foque na elaboração de propostas de intervenção bem estruturadas."
    };
  }

  // ==================== ESSAY STRUCTURE ANALYSIS ====================

  async analyzeEssayStructure(essayText: string, existingStructures: any[] = []): Promise<any> {
    if (!this.model) {
      return this.generateFallbackStructureAnalysis(essayText);
    }

    try {
      // Manual de Redação Dissertativa Argumentativa fornecido
      const redactionGuide = `
MANUAL DE REDAÇÃO DISSERTATIVA ARGUMENTATIVA

1º PARÁGRAFO - INTRODUÇÃO:
- 1ª FRASE: CONECTIVOS: De acordo, Conforme, Segundo, O, A, Na, No
  ESTRATÉGIAS: Contextualização do tema, Afirmação do tema, citação de repertório
  OBJETIVO: Ambientar o leitor no assunto e relacionar com a realidade

- 2ª FRASE: CONECTIVOS: Entretanto, Contudo, No entanto, Todavia  
  ESTRATÉGIAS: Apresentar tema, comparar com realidade atual, apresentar tese
  OBJETIVO: Mostrar o tema/proposta impedindo fuga e trazendo a tese

- 3ª FRASE: CONECTIVOS: Além disso, Logo, Assim sendo
  ESTRATÉGIAS: Apresentar ideias que serão desenvolvidas, mostrar 2 argumentos
  OBJETIVO: Introduzir desenvolvimentos que virão

2º PARÁGRAFO - PRIMEIRO DESENVOLVIMENTO:
- 1ª FRASE: CONECTIVOS: Inicialmente, Primeiramente, Primordialmente, Em primeira análise
  ESTRATÉGIAS: Citação, Afirmação ou Contextualização histórica
  OBJETIVO: Apresentar 1ª ideia com dados, citações ou contexto histórico

- 2ª FRASE: CONECTIVOS: Nesse sentido, Diante disso, Dessa forma
  ESTRATÉGIAS: Apresentação e Retomada da 1ª ideia  
  OBJETIVO: Desenvolver, explicar e aprofundar primeiro argumento

- 3ª FRASE: CONECTIVOS: Assim, Dessarte
  ESTRATÉGIAS: Isolamento da ideia com breve conclusão
  OBJETIVO: Fechar primeiro argumento e fazer transição

3º PARÁGRAFO - SEGUNDO DESENVOLVIMENTO:
- 1ª FRASE: CONECTIVOS: Além disso, Ademais
  ESTRATÉGIAS: Apresentação e Retomada da 2ª ideia
  OBJETIVO: Apresentar segundo argumento retomando ideia da introdução

- 2ª FRASE: CONECTIVOS: Nesse aspecto, Nessa perspectiva, Dessa maneira
  ESTRATÉGIAS: Posicionamento real, explicação, exemplos, citação
  OBJETIVO: Sustentar segundo argumento com fundamentação detalhada

- 3ª FRASE: CONECTIVOS: Assim, Dessarte
  ESTRATÉGIAS: Isolamento da ideia com breve conclusão
  OBJETIVO: Finalizar segundo desenvolvimento preparando para conclusão

4º PARÁGRAFO - CONCLUSÃO:
- 1ª FRASE: CONECTIVOS: Sobre isso, Em suma, Portanto
  ESTRATÉGIAS: Resumo do tema com proposta de solução
  OBJETIVO: Retomar tese e argumentos preparando para intervenção

- 2ª FRASE: CONECTIVOS: Nessa perspectiva, Por conseguinte
  ESTRATÉGIAS: Responder - Quem? O que? Como? Por meio de que? Para que?
  OBJETIVO: Proposta de intervenção completa

- 3ª FRASE: CONECTIVOS: Assim, Por conseguinte
  ESTRATÉGIAS: Isolamento com breve solução, detalhamento da proposta
  OBJETIVO: Finalizar detalhando implementação ou resultado esperado
`;

      // Criar contexto baseado em estruturas existentes
      let existingStructuresContext = "";
      if (existingStructures.length > 0) {
        const qualityStructures = existingStructures.slice(0, 3); // Pegar as 3 melhores
        existingStructuresContext = `
ESTRUTURAS EXISTENTES DE QUALIDADE (para manter mesmo nível):
${qualityStructures.map((struct, index) => `
Estrutura ${index + 1}: "${struct.name}"
Seções: ${JSON.stringify(struct.sections, null, 2)}
`).join('\n')}

Use estas como referência para o nível de qualidade e detalhamento esperado.
`;
      }

      const prompt = `Analise a redação abaixo e crie uma estrutura dissertativa argumentativa seguindo rigorosamente o MANUAL DE REDAÇÃO fornecido.

${redactionGuide}

${existingStructuresContext}

REDAÇÃO PARA ANÁLISE:
"${essayText}"

INSTRUÇÕES ESPECÍFICAS:
1. Analise como a redação está estruturada atualmente
2. Identifique os parágrafos (introdução, desenvolvimentos, conclusão)
3. Crie uma estrutura baseada no manual que preserve o conteúdo bom e melhore o que está inadequado
4. Cada seção deve ter instruções específicas sobre conectivos e estratégias argumentativas
5. Mantenha o mesmo nível de qualidade das estruturas existentes
6. Use o guia para criar instruções pedagógicas detalhadas

FORMATO DE RESPOSTA (JSON):
{
  "name": "Nome descritivo da estrutura baseada no tema da redação",
  "sections": [
    {
      "id": "intro",
      "title": "Introdução",
      "description": "Instruções detalhadas para a introdução seguindo o manual (contextualização + tese + anúncio dos argumentos). Inclua conectivos específicos e estratégias argumentativas."
    },
    {
      "id": "dev1", 
      "title": "Primeiro Desenvolvimento",
      "description": "Instruções para o primeiro argumento seguindo o manual (citação/afirmação + desenvolvimento + conclusão parcial). Inclua conectivos e estratégias específicas."
    },
    {
      "id": "dev2",
      "title": "Segundo Desenvolvimento", 
      "description": "Instruções para o segundo argumento seguindo o manual (nova perspectiva + fundamentação + conclusão parcial). Inclua conectivos e estratégias específicas."
    },
    {
      "id": "conclusao",
      "title": "Conclusão",
      "description": "Instruções para conclusão seguindo o manual (retomada + proposta de intervenção completa + finalização). Inclua os 5 elementos obrigatórios: quem, o que, como, por meio de que, para que."
    }
  ]
}

Gere APENAS o JSON, sem explicações adicionais.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse JSON response
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      // Clean up common formatting issues
      cleanedResponse = cleanedResponse
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted property names
        .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes

      const structureData = JSON.parse(cleanedResponse);
      
      console.log("✅ Successfully analyzed essay structure with AI");
      return structureData;
      
    } catch (error) {
      console.error("Error analyzing essay structure with AI:", error);
      return this.generateFallbackStructureAnalysis(essayText);
    }
  }

  private generateFallbackStructureAnalysis(essayText: string): any {
    // Análise básica local quando AI não está disponível
    const words = essayText.trim().split(/\s+/).length;
    const paragraphs = essayText.split('\n\n').filter(p => p.trim().length > 0);
    
    return {
      name: `Estrutura Dissertativa Argumentativa (${words} palavras)`,
      sections: [
        {
          id: "intro",
          title: "Introdução",
          description: "Desenvolva uma introdução com contextualização do tema usando conectivos como 'De acordo com', 'Conforme' ou 'Segundo'. Apresente sua tese de forma clara usando conectivos de oposição como 'Entretanto', 'Contudo' ou 'No entanto'. Finalize anunciando os dois argumentos que serão desenvolvidos com 'Além disso' ou 'Logo'."
        },
        {
          id: "dev1",
          title: "Primeiro Desenvolvimento",
          description: "Inicie com conectivos como 'Primeiramente', 'Inicialmente' ou 'Em primeira análise'. Apresente seu primeiro argumento com citação, dados ou contextualização histórica. Use 'Nesse sentido', 'Diante disso' para desenvolver e exemplificar o argumento. Conclua o parágrafo com 'Assim' ou 'Dessarte' fazendo transição para o próximo desenvolvimento."
        },
        {
          id: "dev2", 
          title: "Segundo Desenvolvimento",
          description: "Comece com 'Além disso' ou 'Ademais' para apresentar o segundo argumento. Use 'Nesse aspecto', 'Nessa perspectiva' para sustentar com explicações detalhadas, exemplos e citações. Finalize com 'Assim' ou 'Dessarte' para preparar a transição para a conclusão."
        },
        {
          id: "conclusao",
          title: "Conclusão",
          description: "Retome a tese com 'Em suma', 'Portanto' ou 'Sobre isso'. Apresente proposta de intervenção completa respondendo: QUEM deve fazer, O QUE deve ser feito, COMO deve ser executado, POR MEIO DE QUE e PARA QUE finalidade. Use 'Nessa perspectiva' ou 'Por conseguinte' para desenvolver a proposta. Finalize com 'Assim' detalhando a implementação ou resultado esperado."
        }
      ]
    };
  }
}

export const geminiService = new GeminiService();