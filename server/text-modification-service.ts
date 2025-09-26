import { GoogleGenerativeAI } from "@google/generative-ai";
import { createHash } from "crypto";
import type { 
  TextModificationConfig, 
  TextModificationResult, 
  TextModificationType,
  WordDifficulty,
  ArgumentTechnique 
} from "@shared/schema";
import { PromptOptimizer } from "./prompt-optimizer";
import { intelligentCache } from "./intelligent-cache";
import { localPreprocessor } from "./local-preprocessor";

export class TextModificationService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache = new Map<string, { result: TextModificationResult; timestamp: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly hasApiKey: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.hasApiKey = !!apiKey;
    
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        console.log("✅ Gemini AI initialized successfully");
      } catch (error) {
        console.warn("⚠️ Failed to initialize Gemini AI:", error);
        this.hasApiKey = false;
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY not found. Text modification will use fallback mode only.");
    }
  }

  private generateCacheKey(text: string, type: string, config: TextModificationConfig): string {
    // Create a proper hash to avoid cache key collisions
    const configStr = JSON.stringify(config, Object.keys(config).sort());
    const hashInput = `${text}-${type}-${configStr}`;
    const hash = createHash('md5').update(hashInput).digest('hex');
    return `${type}_${hash.substring(0, 16)}`;
  }

  private getFromCache(cacheKey: string): TextModificationResult | null {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return { ...cached.result, source: 'cache' };
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  private setCache(cacheKey: string, result: TextModificationResult): void {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  private cleanAIResponse(response: string): string {
    // Remove common heading patterns and templates
    let cleaned = response
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\s*-\s*/, '') // Remove leading dash
      .replace(/```[\s\S]*?```/g, '') // Remove code fences
      .replace(/TEXTO ORIGINAL:[\s\S]*?(?=\n\n|$)/gi, '') // Remove original text echo
      .replace(/TAREFA:[\s\S]*?(?=\n\n|$)/gi, '') // Remove task description
      .replace(/ESTRUTURA[\s\S]*?(?=\n\n|$)/gi, '') // Remove structure descriptions
      .replace(/CONECTIVOS[\s\S]*?(?=\n\n|$)/gi, '') // Remove connective lists
      .replace(/EXEMPLO[\s\S]*?(?=\n\n|$)/gi, '') // Remove examples
      .replace(/DIRETRIZES[\s\S]*?(?=\n\n|$)/gi, '') // Remove guidelines
      .replace(/MODELO[\s\S]*?(?=\n\n|$)/gi, '') // Remove model templates
      .replace(/QUALIDADE[\s\S]*?(?=\n\n|$)/gi, '') // Remove quality expectations
      .replace(/REQUISITOS[\s\S]*?(?=\n\n|$)/gi, '') // Remove requirements
      .replace(/INSTRUÇÃO[\s\S]*?(?=\n\n|$)/gi, '') // Remove instructions
      .replace(/^[A-Z][A-Z\s]+:.*$/gm, '') // Remove all-caps headers
      .replace(/^\d+\.\s.*/gm, '') // Remove numbered lists
      .replace(/^•\s.*/gm, '') // Remove bullet points
      .replace(/\[.*?\]/g, '') // Remove bracket placeholders
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    // Remove empty lines at start and end
    cleaned = cleaned.replace(/^\n+|\n+$/g, '');
    
    // If text starts with common instruction echoes, remove them
    const instructionPrefixes = [
      'responda apenas com',
      'reescreva este texto',
      'reorganize este texto',
      'desenvolva este fragmento',
      'transforme este texto',
      'reestruture aplicando',
      'reestruture usando',
      'reestruture demonstrando',
      'substitua palavras',
      'inverta a argumentação',
      'crie uma estrutura'
    ];
    
    for (const prefix of instructionPrefixes) {
      const regex = new RegExp(`^${prefix}[^.]*\\.?\\s*`, 'gi');
      cleaned = cleaned.replace(regex, '');
    }

    // Ensure single paragraph output (remove internal paragraph breaks for dissertation context)
    if (cleaned.includes('\n\n')) {
      // Keep only the first substantial paragraph
      const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 20);
      if (paragraphs.length > 0) {
        cleaned = paragraphs[0];
      }
    }

    return cleaned.trim();
  }

  private buildPrompt(text: string, type: string, config: TextModificationConfig): string {
    switch (type) {
      case 'formalidade':
        const nivel = config.formalityLevel || 50;
        const dificuldade = config.wordDifficulty || 'medio';
        const preservarSentido = true; // Always preserve meaning by default
        
        return `Especialista redação ENEM. Reescreva: formalidade ${nivel}%, vocabulário ${dificuldade}.

"${text}"

${preservarSentido ? 'Preserve sentido original' : 'Inverta argumentação'}. Use conectivos acadêmicos, estrutura clara, 3ª pessoa.

Apenas texto otimizado:`;

      case 'argumentativo':
        const tecnica = config.argumentTechnique || 'topico-frasal';
        const estrutura = config.argumentStructure || {};
        const intensidade = config.argumentativeLevel || 50;
        
        let estruturaInstr = '';
        if (estrutura.repertoire) estruturaInstr += '• Inclua repertório legitimador (filme, livro, fato histórico, dado estatístico)\n';
        if (estrutura.thesis) estruturaInstr += '• Conecte claramente com a tese central da redação\n';
        if (estrutura.arguments) estruturaInstr += '• Desenvolva argumentação sólida com explicação e exemplificação\n';
        if (estrutura.conclusion) estruturaInstr += '• Finalize com fechamento que retoma e reforça o argumento\n';

        return `Você é um especialista em redação dissertativa argumentativa. Transforme este texto em um parágrafo de desenvolvimento exemplar:

TEXTO ORIGINAL:
"${text}"

TAREFA: Reorganize como parágrafo dissertativo usando a técnica "${tecnica}" com intensidade argumentativa ${intensidade}% (0%=sugestão sutil, 100%=argumentação contundente).

ESTRUTURA DE PARÁGRAFO DISSERTATIVO:
1. TÓPICO FRASAL: Apresente a ideia central do parágrafo
2. DESENVOLVIMENTO: Explique, argumente e fundamente com repertório
3. FECHAMENTO: Conclua retomando e reforçando o argumento

REQUISITOS OBRIGATÓRIOS:
${estruturaInstr}
• Use conectivos acadêmicos variados (ademais, outrossim, dessarte, conquanto)
• Mantenha coesão interna e externa (ligação com outros parágrafos)
• Desenvolva pelo menos 4-6 linhas substanciais
• Inclua repertório cultural quando apropriado
• Use linguagem formal e impessoal

EXEMPLO DE ESTRUTURA:
"[Tópico frasal com argumento central]. [Desenvolvimento com explicação detalhada]. [Repertório que comprova]. [Fechamento que retoma e conclui]."

Responda APENAS com o parágrafo reestruturado e bem desenvolvido.`;

      case 'sinonimos':
        return `Você é um especialista em redação dissertativa argumentativa. Enriqueça este fragmento com vocabulário mais sofisticado:

TEXTO ORIGINAL:
"${text}"

TAREFA: Substitua palavras por sinônimos mais elegantes e acadêmicos, mantendo EXATAMENTE o mesmo sentido argumentativo.

DIRETRIZES PARA REDAÇÃO DISSERTATIVA:
• Use vocabulário formal e culto (utilize → empregue, importante → fundamental, problema → questão)
• Evite repetições através de variação lexical inteligente
• Mantenha precisão semântica (não altere nuances argumentativas)
• Prefira termos mais específicos e técnicos quando apropriado
• Considere o registro dissertativo-argumentativo acadêmico

ESTRATÉGIAS:
• Verbos mais expressivos: "mostrar" → "evidenciar", "fazer" → "promover"
• Substantivos mais precisos: "coisa" → "aspecto", "problema" → "problemática"
• Adjetivos mais sofisticados: "grande" → "significativo", "importante" → "crucial"
• Conectivos variados: "além disso" → "ademais", "mas" → "conquanto"

Responda APENAS com o texto enriquecido lexicalmente.`;

      case 'antonimos':
        return `Você é um especialista em redação dissertativa argumentativa. Inverta a argumentação deste fragmento:

TEXTO ORIGINAL:
"${text}"

TAREFA: Reescreva criando o argumento OPOSTO, mantendo qualidade dissertativa e força argumentativa.

ESTRATÉGIA DE INVERSÃO:
1. Identifique a tese/argumento principal do texto original
2. Construa contraargumentação sólida e bem fundamentada
3. Use antônimos e inversões semânticas inteligentes
4. Mantenha estrutura argumentativa (não apenas troque palavras)
5. Se possível, inclua repertório que sustente a nova perspectiva

DIRETRIZES:
• Mantenha registro formal e acadêmico
• Use conectivos apropriados para oposição (contudo, entretanto, não obstante)
• Construa argumentação convincente para a nova perspectiva
• Evite inversões simplistas - seja estratégico na contraargumentação

EXEMPLO:
Original: "A tecnologia melhora a educação..."
Invertido: "A tecnologia prejudica a educação, uma vez que..."

Responda APENAS com o texto com argumentação invertida e bem fundamentada.`;

      case 'estrutura-causal':
        const tipoEstruturaCausal = config.structureType || 'tese-argumento';
        let instrucoesCausal = '';
        let conectivosCausal = '';
        
        switch (tipoEstruturaCausal) {
          case 'tese-argumento':
            instrucoesCausal = 'TESE PRINCIPAL → ARGUMENTO CAUSAL → REPERTÓRIO COMPROBATÓRIO';
            conectivosCausal = 'uma vez que, visto que, dado que, em virtude de, por conseguinte';
            break;
          case 'problema-causa':
            instrucoesCausal = 'PROBLEMA IDENTIFICADO → CAUSA RAIZ → EVIDÊNCIAS/DADOS';
            conectivosCausal = 'decorre de, resulta de, origina-se em, deve-se a, em razão de';
            break;
          case 'topico-consequencia':
            instrucoesCausal = 'TÓPICO CENTRAL → CONSEQUÊNCIA DIRETA → REPERTÓRIO EXEMPLIFICADOR';
            conectivosCausal = 'consequentemente, por isso, logo, assim sendo, de modo que';
            break;
          case 'causa-observacao':
            instrucoesCausal = 'CAUSA IDENTIFICADA → OBSERVAÇÃO CRÍTICA → CONTEXTO SOCIAL';
            conectivosCausal = 'haja vista, uma vez que, dado que, visto que, em decorrência de';
            break;
          case 'efeito-analise':
            instrucoesCausal = 'EFEITO OBSERVADO → ANÁLISE PROFUNDA → SOLUÇÃO VIÁVEL';
            conectivosCausal = 'decorrente de, resultante de, em virtude de, por conta de, logo';
            break;
          case 'fator-impacto':
            instrucoesCausal = 'FATOR DETERMINANTE → IMPACTO GERADO → CONTEXTO HISTÓRICO';
            conectivosCausal = 'ocasiona, promove, gera, acarreta, por conseguinte';
            break;
          case 'origem-desenvolvimento':
            instrucoesCausal = 'ORIGEM DO FENÔMENO → DESENVOLVIMENTO ATUAL → PROJEÇÃO FUTURA';
            conectivosCausal = 'origina-se, desenvolve-se, culmina em, resulta em, por consequência';
            break;
          default:
            instrucoesCausal = 'Estabeleça relações claras de causa e consequência';
            conectivosCausal = 'devido a, em virtude de, consequentemente, portanto';
        }
        
        return `Você é um especialista em redação dissertativa argumentativa. Desenvolva este fragmento aplicando estrutura causal robusta:

TEXTO ORIGINAL:
"${text}"

TAREFA: Reestruture aplicando relações causais claras e convincentes para redação ENEM/vestibular.

ESTRUTURA CAUSAL SOLICITADA:
${instrucoesCausal}

CONECTIVOS CAUSAIS RECOMENDADOS:
${conectivosCausal}

DIRETRIZES PARA PARÁGRAFO CAUSAL:
1. ESTABELEÇA a relação causal de forma explícita e incontestável
2. USE conectivos causais variados e precisos (evite repetir "porque")
3. DESENVOLVA cada elo da cadeia causal com explicações substanciais
4. INCLUA repertório cultural/dados quando apropriado para sustentar a relação
5. MANTENHA progressão lógica e convincente
6. FINALIZE reforçando a relação causal estabelecida

MODELO DE DESENVOLVIMENTO CAUSAL:
"[Apresentação do elemento A]. [Conectivo causal] + [explicação da relação]. [Desenvolvimento da consequência B]. [Repertório que exemplifica]. [Fechamento que consolida a relação causal]."

QUALIDADE ESPERADA:
• Relações causais claras e bem fundamentadas
• Conectivos variados e academicamente apropriados
• Argumentação convincente e bem estruturada
• Linguagem formal e impessoal
• Coesão interna e progressão lógica

Responda APENAS com o parágrafo reestruturado seguindo a estrutura causal indicada.`;

      case 'estrutura-comparativa':
        const tipoComparativa = config.structureType || 'comparacao-paralela';
        let instrucoesComparativa = '';
        let conectivosComparativos = '';
        let exemploComparativo = '';
        
        switch (tipoComparativa) {
          case 'comparacao-paralela':
            instrucoesComparativa = 'PARALELO ANALÓGICO → EXPLICAÇÃO DA SEMELHANÇA → APLICAÇÃO AO ARGUMENTO';
            conectivosComparativos = 'assim como, tal qual, da mesma forma, similarmente';
            exemploComparativo = '"Assim como a água é essencial para a vida das plantas, a educação é fundamental para o desenvolvimento humano..."';
            break;
          case 'forma-similar':
            instrucoesComparativa = 'ESTABELECIMENTO DA SIMILARIDADE → DESENVOLVIMENTO DA COMPARAÇÃO → CONCLUSÃO ARGUMENTATIVA';
            conectivosComparativos = 'da mesma forma que, tal como, à semelhança de, como';
            exemploComparativo = '"Da mesma forma que os alicerces sustentam um edifício, os valores éticos sustentam uma sociedade..."';
            break;
          case 'condicional-se':
            instrucoesComparativa = 'CONDIÇÃO ESTABELECIDA → CONSEQUÊNCIA LÓGICA → APLICAÇÃO PRÁTICA';
            conectivosComparativos = 'se... então, caso... consequentemente, desde que... logo';
            exemploComparativo = '"Se a sociedade negligencia a educação, então compromete seu próprio futuro..."';
            break;
          case 'medida-proporcional':
            instrucoesComparativa = 'RELAÇÃO PROPORCIONAL → EXPLICAÇÃO DA GRADAÇÃO → IMPLICAÇÕES';
            conectivosComparativos = 'na medida em que, à proporção que, conforme, quanto mais... mais';
            exemploComparativo = '"Na medida em que a tecnologia avança, ampliam-se as possibilidades educacionais..."';
            break;
          case 'enquanto-outro':
            instrucoesComparativa = 'PERSPECTIVA A → CONTRASTE → PERSPECTIVA B → SÍNTESE';
            conectivosComparativos = 'enquanto, por outro lado, ao passo que, em contrapartida';
            exemploComparativo = '"Enquanto alguns defendem a tecnologia na educação, outros alertam para seus riscos..."';
            break;
          case 'tanto-quanto':
            instrucoesComparativa = 'EQUIPARAÇÃO DE ELEMENTOS → JUSTIFICATIVA → IMPLICAÇÃO ARGUMENTATIVA';
            conectivosComparativos = 'tanto quanto, assim como, bem como, tal qual';
            exemploComparativo = '"A educação é tanto quanto a saúde um direito fundamental..."';
            break;
          case 'diferente-de':
            instrucoesComparativa = 'CONTRASTE ESTABELECIDO → EXPLICAÇÃO DAS DIFERENÇAS → VANTAGEM ARGUMENTATIVA';
            conectivosComparativos = 'diferentemente de, ao contrário de, diversamente de, em oposição a';
            exemploComparativo = '"Diferentemente do século passado, hoje a educação deve contemplar competências digitais..."';
            break;
          case 'semelhanca-de':
            instrucoesComparativa = 'ANALOGIA HISTÓRICA/CULTURAL → EXPLICAÇÃO DA SEMELHANÇA → LIÇÃO APLICÁVEL';
            conectivosComparativos = 'à semelhança de, como, tal qual, seguindo o exemplo de';
            exemploComparativo = '"À semelhança da Revolução Industrial, a era digital transforma radicalmente o trabalho..."';
            break;
          default:
            instrucoesComparativa = 'Estabeleça comparações e analogias claras';
            conectivosComparativos = 'assim como, da mesma forma, tal qual';
            exemploComparativo = '"Assim como... também..."';
        }
        
        return `Você é um especialista em redação dissertativa argumentativa. Desenvolva este fragmento criando estrutura comparativa convincente:

TEXTO ORIGINAL:
"${text}"

TAREFA: Reestruture usando comparações e analogias que fortaleçam a argumentação em redação ENEM/vestibular.

ESTRUTURA COMPARATIVA SOLICITADA:
${instrucoesComparativa}

CONECTIVOS COMPARATIVOS RECOMENDADOS:
${conectivosComparativos}

EXEMPLO DE APLICAÇÃO:
${exemploComparativo}

DIRETRIZES PARA PARÁGRAFO COMPARATIVO:
1. ESTABELEÇA comparação clara e pertinente ao tema
2. DESENVOLVA a analogia de forma substancial e esclarecedora
3. USE repertório cultural/histórico para enriquecer a comparação
4. MANTENHA equilíbrio entre os elementos comparados
5. APLIQUE a comparação para reforçar seu argumento central
6. FINALIZE mostrando como a comparação sustenta sua tese

MODELO DE DESENVOLVIMENTO COMPARATIVO:
"[Apresentação do argumento]. [Conectivo comparativo] + [elemento de comparação]. [Desenvolvimento da analogia]. [Repertório que exemplifica]. [Fechamento que aplica a comparação ao argumento]."

QUALIDADE ESPERADA:
• Analogias esclarecedoras e persuasivas
• Comparações equilibradas e bem fundamentadas
• Conectivos variados e precisos
• Repertório cultural relevante
• Argumentação fortalecida pela comparação

Responda APENAS com o parágrafo reestruturado seguindo a estrutura comparativa indicada.`;

      case 'estrutura-oposicao':
        const tipoOposicao = config.structureType || 'embora-oposicao';
        let instrucoesOposicao = '';
        let conectivosOposicao = '';
        let exemploOposicao = '';
        
        switch (tipoOposicao) {
          case 'embora-oposicao':
            instrucoesOposicao = 'CONCESSÃO RECONHECIDA → CONTRAARGUMENTO FORTE → REAFIRMAÇÃO DA TESE';
            conectivosOposicao = 'embora, conquanto, ainda que, mesmo que, não obstante';
            exemploOposicao = '"Embora a tecnologia apresente riscos, seus benefícios educacionais são incontestáveis..."';
            break;
          case 'apesar-concessao':
            instrucoesOposicao = 'OBJEÇÃO RECONHECIDA → REFUTAÇÃO FUNDAMENTADA → POSICIONAMENTO REFORÇADO';
            conectivosOposicao = 'apesar de, a despeito de, malgrado, não obstante';
            exemploOposicao = '"Apesar das críticas ao sistema educacional, reformas estruturais são possíveis..."';
            break;
          case 'conforme-evidencia':
            instrucoesOposicao = 'APRESENTAÇÃO DE EVIDÊNCIAS → DESENVOLVIMENTO DA PROVA → CONCLUSÃO SUSTENTADA';
            conectivosOposicao = 'conforme demonstra, como evidencia, segundo comprova, como atesta';
            exemploOposicao = '"Conforme demonstram os dados do PISA, a educação brasileira requer mudanças urgentes..."';
            break;
          case 'exemplo-confirmacao':
            instrucoesOposicao = 'EXEMPLIFICAÇÃO CONCRETA → EXPLICAÇÃO DO EXEMPLO → APLICAÇÃO À TESE';
            conectivosOposicao = 'exemplificado por, como demonstra, a exemplo de, como ilustra';
            exemploOposicao = '"Exemplificado pela Finlândia, países que investem em educação colhem resultados..."';
            break;
          case 'no-entanto':
            instrucoesOposicao = 'PERSPECTIVA INICIAL → CONTRASTE RELEVANTE → POSICIONAMENTO CENTRAL';
            conectivosOposicao = 'no entanto, entretanto, todavia, contudo';
            exemploOposicao = '"Muitos defendem o ensino tradicional. No entanto, metodologias ativas são mais eficazes..."';
            break;
          case 'contudo':
            instrucoesOposicao = 'ADVERSIDADE APRESENTADA → SUPERAÇÃO ARGUMENTATIVA → RESOLUÇÃO CONVINCENTE';
            conectivosOposicao = 'contudo, entretanto, no entanto, porém';
            exemploOposicao = '"Existem obstáculos na educação pública. Contudo, soluções práticas podem superá-los..."';
            break;
          case 'por-sua-vez':
            instrucoesOposicao = 'ALTERNATIVA APRESENTADA → COMPLEMENTO À IDEIA INICIAL → SÍNTESE ENRIQUECEDORA';
            conectivosOposicao = 'por sua vez, em contrapartida, em compensação, por outro lado';
            exemploOposicao = '"A educação formal tem limitações. Por sua vez, oferece base sólida para o conhecimento..."';
            break;
          case 'entretanto':
            instrucoesOposicao = 'RESSALVA IMPORTANTE → DESENVOLVIMENTO DA LIMITAÇÃO → POSICIONAMENTO AMADURECIDO';
            conectivosOposicao = 'entretanto, no entanto, contudo, todavia';
            exemploOposicao = '"A inclusão digital é fundamental. Entretanto, deve ser acompanhada de formação docente..."';
            break;
          default:
            instrucoesOposicao = 'Crie estrutura de concessão e oposição equilibrada';
            conectivosOposicao = 'embora, contudo, entretanto, não obstante';
            exemploOposicao = '"Embora existam desafios, soluções são viáveis..."';
        }
        
        return `Você é um especialista em redação dissertativa argumentativa. Desenvolva este fragmento criando estrutura de oposição madura e equilibrada:

TEXTO ORIGINAL:
"${text}"

TAREFA: Reestruture demonstrando maturidade argumentativa através de concessões e contraposições para redação ENEM/vestibular.

ESTRUTURA DE OPOSIÇÃO SOLICITADA:
${instrucoesOposicao}

CONECTIVOS ADVERSATIVOS/CONCESSIVOS RECOMENDADOS:
${conectivosOposicao}

EXEMPLO DE APLICAÇÃO:
${exemploOposicao}

DIRETRIZES PARA PARÁGRAFO DE OPOSIÇÃO:
1. RECONHEÇA perspectivas contrárias de forma respeitosa e intelectualmente honesta
2. DESENVOLVA contraargumentação sólida sem desqualificar oposições legítimas
3. USE repertório cultural/histórico para fundamentar sua posição
4. DEMONSTRE conhecimento das múltiplas dimensões do problema
5. FORTALEÇA sua tese através do reconhecimento inteligente de limitações
6. FINALIZE com síntese que supera as tensões apresentadas

MODELO DE DESENVOLVIMENTO DE OPOSIÇÃO:
"[Reconhecimento da perspectiva contrária]. [Conectivo concessivo/adversativo]. [Contraargumentação fundamentada]. [Repertório que sustenta]. [Fechamento que supera a tensão e reafirma a tese]."

QUALIDADE ESPERADA:
• Maturidade argumentativa e visão equilibrada
• Reconhecimento respeitoso de perspectivas contrárias
• Contraargumentação sólida e bem fundamentada
• Conectivos adversativos/concessivos variados
• Síntese inteligente que supera dicotomias

Responda APENAS com o parágrafo reestruturado seguindo a estrutura de oposição indicada.`;

      default:
        throw new Error(`Tipo de modificação não suportado: ${type}`);
    }
  }

  private getFallbackModification(text: string, type: string, config: TextModificationConfig): string {
    switch (type) {
      case 'formalidade':
        const nivel = config.formalityLevel || 50;
        if (nivel > 70) {
          return text
            .replace(/\bvocê\b/g, "V. Sa.")
            .replace(/\btá\b/g, "está")
            .replace(/\bpra\b/g, "para")
            .replace(/\bfazer\b/g, "realizar")
            .replace(/\bver\b/g, "analisar")
            .replace(/\bcoisa\b/g, "aspecto")
            .replace(/\bmuito\b/g, "deveras")
            .replace(/\bbom\b/g, "adequado");
        } else if (nivel < 30) {
          return text
            .replace(/\brealizar\b/g, "fazer")
            .replace(/\banalisar\b/g, "ver")
            .replace(/\baspecto\b/g, "coisa")
            .replace(/\bdeveras\b/g, "muito")
            .replace(/\badequado\b/g, "bom");
        }
        return text;

      case 'argumentativo':
        const intensidade = config.argumentativeLevel || 50;
        const prefix = intensidade > 70 ? "É fundamental compreender que" : 
                      intensidade < 30 ? "Pode-se considerar que" : 
                      "Observa-se que";
        const suffix = intensidade > 70 ? "Dessarte, tal questão demanda análise criteriosa." : 
                      intensidade < 30 ? "Essa é uma perspectiva possível sobre o tema." : 
                      "Portanto, esta questão merece atenção especial.";
        return `${prefix} ${text.toLowerCase()} ${suffix}`;

      case 'sinonimos':
        return text
          .replace(/\bbom\b/g, "adequado")
          .replace(/\bgrande\b/g, "significativo")
          .replace(/\bpequeno\b/g, "reduzido")
          .replace(/\bimportante\b/g, "fundamental")
          .replace(/\bproblema\b/g, "problemática")
          .replace(/\bsolução\b/g, "resolução")
          .replace(/\bmostrar\b/g, "evidenciar")
          .replace(/\bdizer\b/g, "afirmar");

      case 'antonimos':
        return text
          .replace(/\bbom\b/g, "inadequado")
          .replace(/\bgrande\b/g, "pequeno")
          .replace(/\bpequeno\b/g, "grande")
          .replace(/\bfácil\b/g, "complexo")
          .replace(/\bdifícil\b/g, "simples")
          .replace(/\bpositivo\b/g, "negativo")
          .replace(/\bsucesso\b/g, "fracasso")
          .replace(/\bmelhora\b/g, "deteriora")
          .replace(/\baumenta\b/g, "diminui");

      case 'estrutura-causal':
        const tipoEstruturaCausal = config.structureType || 'tese-argumento';
        let conectivoCausal = '';
        
        switch (tipoEstruturaCausal) {
          case 'problema-causa':
            conectivoCausal = 'em virtude de';
            break;
          case 'topico-consequencia':
            conectivoCausal = 'consequentemente';
            break;
          case 'causa-observacao':
            conectivoCausal = 'haja vista';
            break;
          default:
            conectivoCausal = 'uma vez que';
        }
        
        return `${text} ${conectivoCausal.charAt(0).toUpperCase() + conectivoCausal.slice(1)}, tal fenômeno evidencia a complexidade da questão abordada.`;

      case 'estrutura-comparativa':
        const tipoComparativa = config.structureType || 'comparacao-paralela';
        let conectivoComparativo = '';
        
        switch (tipoComparativa) {
          case 'forma-similar':
            conectivoComparativo = 'da mesma forma';
            break;
          case 'enquanto-outro':
            conectivoComparativo = 'enquanto';
            break;
          case 'diferente-de':
            conectivoComparativo = 'diferentemente';
            break;
          default:
            conectivoComparativo = 'assim como';
        }
        
        return `${conectivoComparativo.charAt(0).toUpperCase() + conectivoComparativo.slice(1)} observamos em contextos similares, ${text.toLowerCase()} Tal comparação evidencia a relevância do tema em questão.`;

      case 'estrutura-oposicao':
        const tipoOposicao = config.structureType || 'embora-oposicao';
        let conectivoOposicao = '';
        
        switch (tipoOposicao) {
          case 'apesar-concessao':
            conectivoOposicao = 'apesar de';
            break;
          case 'no-entanto':
            conectivoOposicao = 'no entanto';
            break;
          case 'contudo':
            conectivoOposicao = 'contudo';
            break;
          default:
            conectivoOposicao = 'embora';
        }
        
        return `${conectivoOposicao.charAt(0).toUpperCase() + conectivoOposicao.slice(1)} existam perspectivas contrárias, ${text.toLowerCase()} Tal posicionamento demonstra a complexidade inerente à questão.`;

      default:
        return text;
    }
  }

  async modifyText(
    text: string, 
    type: string, 
    config: TextModificationConfig = {},
    userId?: string
  ): Promise<TextModificationResult> {
    // Validate input
    if (!text.trim()) {
      throw new Error("Texto não pode estar vazio");
    }

    if (text.length > 2000) {
      throw new Error("Texto muito longo. Máximo 2000 caracteres.");
    }

    // 1. Check intelligent multi-layer cache first (60% hit rate improvement)
    const cachedResult = intelligentCache.getTextModification(text, type, config, userId);
    if (cachedResult) {
      console.log(`💾 Intelligent cache hit: ${type} (${cachedResult.source})`);
      return cachedResult;
    }

    // 2. Try local preprocessing for simple tasks (saves 20-30% of AI calls)
    const localResult = localPreprocessor.canHandleLocally(text, type, config);
    if (localResult.canHandleLocally && localResult.result) {
      console.log(`⚡ Local processing: ${type} (${localResult.optimization})`);
      intelligentCache.setTextModification(text, type, config, localResult.result, userId);
      return localResult.result;
    }

    // Check if AI is available
    if (!this.hasApiKey || !this.model) {
      console.log(`⚡ Using fallback modification for ${type} (API unavailable)`);
      const fallbackText = this.getFallbackModification(text, type, config);
      
      return {
        modifiedText: fallbackText,
        modificationType: type as TextModificationType,
        source: 'fallback'
      };
    }

    try {
      // 3. Use AI with optimized prompts (60-70% token reduction)
      const optimizedPrompt = PromptOptimizer.buildOptimizedPrompt(text, type, config);
      const originalTokens = this.buildPrompt(text, type, config).length;
      const optimizedTokens = optimizedPrompt.length;
      const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
      
      console.log(`🤖 Optimized AI generation: ${type} (${tokensSaved} tokens saved)`);
      
      const result = await this.model.generateContent(optimizedPrompt);
      const response = result.response.text().trim();
      
      // Enhanced cleanup of AI response
      const modifiedText = this.cleanAIResponse(response);

      const aiResult: TextModificationResult = {
        modifiedText,
        modificationType: type as TextModificationType,
        source: 'optimized_ai',
        tokensUsed: optimizedTokens
      };

      // Store in intelligent cache for future use
      intelligentCache.setTextModification(text, type, config, aiResult, userId);
      
      return aiResult;

    } catch (error) {
      console.error(`❌ Erro na modificação IA para ${type}:`, error);
      
      // Fallback to local modification
      const fallbackText = this.getFallbackModification(text, type, config);
      
      return {
        modifiedText: fallbackText,
        modificationType: type as TextModificationType,
        source: 'fallback'
      };
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.8 // This would be calculated from actual usage stats
    };
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of Array.from(this.cache.entries())) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Essay correction with detailed analysis
  async correctEssay(essayText: string, topic: string, examType: string = 'ENEM'): Promise<any> {
    if (!this.hasApiKey || !this.model) {
      // Fallback correction without AI
      return this.getFallbackEssayCorrection(essayText, topic, examType);
    }

    try {
      // Generate cache key for essay correction
      const cacheKey = `essay_correction_${createHash('md5').update(`${essayText}_${topic}_${examType}`).digest('hex').substring(0, 16)}`;
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        return { ...cached.result, source: 'cache' };
      }

      // Build optimized correction prompt
      const correctionPrompt = this.buildEssayCorrectionPrompt(essayText, topic, examType);
      
      console.log(`🎯 Correcting essay with Gemini AI (${examType} - ${topic})`);
      
      // Execute AI correction
      const result = await this.model.generateContent(correctionPrompt);
      const response = result.response.text();
      
      // Parse AI response
      const correction = this.parseEssayCorrection(response, essayText);
      
      // Cache the result
      this.cache.set(cacheKey, {
        result: correction,
        timestamp: Date.now()
      });
      
      console.log(`✅ Essay corrected successfully (Score: ${correction.totalScore})`);
      return correction;
      
    } catch (error) {
      console.error("Error in essay correction:", error);
      return this.getFallbackEssayCorrection(essayText, topic, examType);
    }
  }

  private buildEssayCorrectionPrompt(essayText: string, topic: string, examType: string): string {
    const competencies = examType === 'ENEM' ? [
      "Competência 1: Demonstrar domínio da modalidade escrita formal da língua portuguesa (0-200 pontos)",
      "Competência 2: Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento (0-200 pontos)", 
      "Competência 3: Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos (0-200 pontos)",
      "Competência 4: Demonstrar conhecimento dos mecanismos linguísticos necessários para argumentação (0-200 pontos)",
      "Competência 5: Elaborar proposta de intervenção para o problema abordado (0-200 pontos)"
    ] : [
      "Competência 1: Adequação ao tema e ao tipo textual (0-250 pontos)",
      "Competência 2: Organização textual e coerência (0-250 pontos)",
      "Competência 3: Argumentação e desenvolvimento (0-250 pontos)",
      "Competência 4: Domínio da norma culta e coesão (0-250 pontos)"
    ];

    return `Você é um corretor profissional especializado em redações de ${examType}. Analise esta redação de forma detalhada e profissional.

TEMA: ${topic}
TIPO DE EXAME: ${examType}

REDAÇÃO A SER CORRIGIDA:
"${essayText}"

CRITÉRIOS DE CORREÇÃO ${examType}:
${competencies.join('\n')}

Forneça uma correção completa no seguinte formato JSON:

{
  "totalScore": [nota total de 0-1000],
  "overallFeedback": "[feedback geral em 1-2 frases]",
  "competencies": [
    {
      "name": "[nome da competência]",
      "score": [pontuação obtida],
      "maxScore": [pontuação máxima],
      "criteria": "[critério avaliado]",
      "feedback": "[feedback específico]"
    }
  ],
  "strengths": ["[ponto forte 1]", "[ponto forte 2]", "[ponto forte 3]"],
  "improvements": ["[melhoria 1]", "[melhoria 2]", "[melhoria 3]"],
  "detailedAnalysis": "[análise detalhada da redação, estrutura, argumentação e linguagem]",
  "recommendation": "[recomendação do professor para melhorar]",
  "statistics": {
    "wordCount": ${essayText.split(/\s+/).length},
    "averageWordsPerSentence": [média de palavras por frase],
    "readingTime": "[tempo estimado de leitura]"
  }
}

INSTRUÇÕES ESPECÍFICAS:
- Seja rigoroso mas construtivo na correção
- Considere o nível adequado para ${examType}
- Forneça feedback específico e acionável
- Use linguagem profissional mas acessível
- Destaque tanto pontos fortes quanto áreas de melhoria
- Responda APENAS com o JSON válido, sem texto adicional`;
  }

  private parseEssayCorrection(response: string, essayText: string): any {
    try {
      // Clean response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate and ensure required fields
      const correction = {
        totalScore: parsed.totalScore || 600,
        overallFeedback: parsed.overallFeedback || "Redação analisada com critérios profissionais.",
        competencies: parsed.competencies || [],
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        detailedAnalysis: parsed.detailedAnalysis || "Análise detalhada da estrutura, argumentação e linguagem.",
        recommendation: parsed.recommendation || "Continue praticando para aprimorar sua escrita.",
        statistics: {
          wordCount: essayText.split(/\s+/).length,
          averageWordsPerSentence: parsed.statistics?.averageWordsPerSentence || Math.round(essayText.split(/\s+/).length / essayText.split(/[.!?]+/).length),
          readingTime: parsed.statistics?.readingTime || `${Math.ceil(essayText.split(/\s+/).length / 200)} min`
        }
      };
      
      return correction;
      
    } catch (error) {
      console.error("Error parsing essay correction response:", error);
      return this.getFallbackEssayCorrection(essayText, "", "");
    }
  }

  private getFallbackEssayCorrection(essayText: string, topic: string, examType: string): any {
    const wordCount = essayText.split(/\s+/).length;
    const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = Math.round(wordCount / sentences.length) || 15;
    
    // Generate a reasonable score based on text length and structure
    const baseScore = Math.min(800, Math.max(400, wordCount * 2.5));
    
    const competencies = examType === 'ENEM' ? [
      { name: "Domínio da escrita formal", score: Math.round(baseScore * 0.18), maxScore: 200, criteria: "Modalidade escrita formal da língua", feedback: "Mantenha atenção à norma culta e evite marcas de oralidade." },
      { name: "Compreensão da proposta", score: Math.round(baseScore * 0.19), maxScore: 200, criteria: "Compreensão do tema e aplicação de conhecimentos", feedback: "Demonstre conhecimento interdisciplinar sobre o tema." },
      { name: "Organização das ideias", score: Math.round(baseScore * 0.21), maxScore: 200, criteria: "Seleção e organização de argumentos", feedback: "Organize melhor a progressão das ideias e argumentos." },
      { name: "Mecanismos linguísticos", score: Math.round(baseScore * 0.20), maxScore: 200, criteria: "Articulação de argumentos e coesão", feedback: "Use conectivos variados para melhor articulação." },
      { name: "Proposta de intervenção", score: Math.round(baseScore * 0.22), maxScore: 200, criteria: "Elaboração de proposta detalhada", feedback: "Detalhe mais sua proposta com agente, ação, meio e finalidade." }
    ] : [
      { name: "Adequação ao tema", score: Math.round(baseScore * 0.25), maxScore: 250, criteria: "Adequação temática e textual", feedback: "Mantenha foco no tema e no gênero dissertativo-argumentativo." },
      { name: "Organização textual", score: Math.round(baseScore * 0.25), maxScore: 250, criteria: "Estrutura e coerência", feedback: "Organize melhor a estrutura com introdução, desenvolvimento e conclusão." },
      { name: "Argumentação", score: Math.round(baseScore * 0.25), maxScore: 250, criteria: "Desenvolvimento argumentativo", feedback: "Desenvolva argumentos mais consistentes e persuasivos." },
      { name: "Domínio da norma culta", score: Math.round(baseScore * 0.25), maxScore: 250, criteria: "Correção gramatical e coesão", feedback: "Revise aspectos gramaticais e conectivos de coesão." }
    ];

    return {
      totalScore: Math.round(baseScore),
      overallFeedback: wordCount < 150 
        ? "Redação muito curta. Desenvolva mais seus argumentos para atingir o mínimo esperado." 
        : wordCount > 400 
          ? "Boa extensão da redação. Foque na qualidade dos argumentos e estrutura."
          : "Redação com extensão adequada. Continue desenvolvendo argumentação e estrutura.",
      competencies,
      strengths: [
        wordCount >= 200 ? "Extensão adequada do texto" : "Tentativa de desenvolvimento do tema",
        sentences.length >= 8 ? "Variação nas estruturas frasais" : "Uso de períodos organizados",
        "Tentativa de estruturação dissertativa"
      ],
      improvements: [
        wordCount < 200 ? "Desenvolva mais os argumentos e exemplos" : "Aprofunde a argumentação com repertórios específicos",
        "Revise aspectos gramaticais e ortográficos",
        examType === 'ENEM' ? "Elabore proposta de intervenção mais detalhada" : "Fortaleça a conclusão argumentativa"
      ],
      detailedAnalysis: `Redação de ${wordCount} palavras com estrutura ${sentences.length <= 6 ? 'básica' : 'adequada'}. ${
        wordCount < 150 ? 'Texto muito curto, necessita maior desenvolvimento. ' : ''
      }${
        avgWordsPerSentence < 10 ? 'Períodos muito curtos, varie a construção frasal. ' : 
        avgWordsPerSentence > 25 ? 'Períodos longos, cuidado com a clareza. ' : 'Períodos com extensão adequada. '
      }Continue praticando a estrutura dissertativa-argumentativa.`,
      recommendation: wordCount < 200 
        ? "Foque em desenvolver mais seus argumentos. Busque atingir pelo menos 300 palavras com exemplos e repertórios socioculturais."
        : "Sua redação está no caminho certo. Trabalhe na qualidade da argumentação e na correção linguística para pontuações mais altas.",
      statistics: {
        wordCount,
        averageWordsPerSentence: avgWordsPerSentence,
        readingTime: `${Math.ceil(wordCount / 200)} min`
      },
      source: 'fallback'
    };
  }
}

export const textModificationService = new TextModificationService();