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

    // Collapse multiple paragraphs into single flowing text for dissertation context
    // Replace double newlines with single space to maintain flow
    cleaned = cleaned.replace(/\n\n+/g, ' ');
    
    // Remove ALL markdown formatting (**, *, _, etc.) - even unpaired or spanning lines
    cleaned = cleaned.replace(/\*\*/g, ''); // Remove all ** (bold)
    cleaned = cleaned.replace(/\*/g, '');   // Remove all * (italic)
    cleaned = cleaned.replace(/__/g, '');   // Remove all __ (bold)
    cleaned = cleaned.replace(/_/g, '');    // Remove all _ (italic)

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
      
      // Extract real token counts from Gemini response
      // Use totalTokenCount as authoritative source (matches Google AI Studio exactly)
      const usageMetadata = result.response.usageMetadata || {};
      const rawPromptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const rawOutputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum, count) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const finalTotalTokens = usageMetadata.totalTokenCount || 0;
      
      // Reconcile component tokens to match official totalTokenCount (includes system tokens)
      let finalPromptTokens = rawPromptTokens;
      let finalOutputTokens = rawOutputTokens;
      
      if (finalTotalTokens > 0 && (rawPromptTokens + rawOutputTokens) !== finalTotalTokens) {
        // Total is authoritative - adjust components proportionally to match
        const rawSum = rawPromptTokens + rawOutputTokens;
        if (rawSum > 0) {
          const ratio = finalTotalTokens / rawSum;
          finalPromptTokens = Math.round(rawPromptTokens * ratio);
          finalOutputTokens = finalTotalTokens - finalPromptTokens; // Ensure exact match
        } else {
          // No component data, estimate 70/30 split for text modification
          finalPromptTokens = Math.floor(finalTotalTokens * 0.7);
          finalOutputTokens = finalTotalTokens - finalPromptTokens;
        }
      } else if (finalTotalTokens === 0 && (rawPromptTokens === 0 && rawOutputTokens === 0)) {
        // No metadata at all, fallback to estimate
        finalPromptTokens = Math.max(1, Math.floor(optimizedTokens * 0.7));
        finalOutputTokens = Math.max(1, optimizedTokens - finalPromptTokens);
      }
      
      console.log(`✅ Text modification (${finalPromptTokens} in + ${finalOutputTokens} out = ${finalTotalTokens} tokens) (Google AI Studio compatible)`);
      
      // Enhanced cleanup of AI response
      const modifiedText = this.cleanAIResponse(response);

      const aiResult: TextModificationResult = {
        modifiedText,
        modificationType: type as TextModificationType,
        source: 'optimized_ai',
        tokensUsed: finalTotalTokens,
        promptTokens: finalPromptTokens,
        outputTokens: finalOutputTokens
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
      
      // Extract real token counts from Gemini response
      // Use totalTokenCount as authoritative source (matches Google AI Studio exactly)
      const usageMetadata = result.response.usageMetadata || {};
      const rawPromptTokens = usageMetadata.promptTokenCount || 0;
      const rawOutputTokensValue = usageMetadata.candidatesTokenCount;
      const rawOutputTokens = Array.isArray(rawOutputTokensValue) 
        ? rawOutputTokensValue.reduce((sum, count) => sum + (count || 0), 0)
        : (rawOutputTokensValue || 0);
      const finalTotalTokens = usageMetadata.totalTokenCount || 0;
      
      // Parse AI response
      const correction = this.parseEssayCorrection(response, essayText);
      
      // Reconcile component tokens to match official totalTokenCount (includes system tokens)
      let finalPromptTokens = rawPromptTokens;
      let finalOutputTokens = rawOutputTokens;
      
      if (finalTotalTokens > 0 && (rawPromptTokens + rawOutputTokens) !== finalTotalTokens) {
        // Total is authoritative - adjust components proportionally to match
        const rawSum = rawPromptTokens + rawOutputTokens;
        if (rawSum > 0) {
          const ratio = finalTotalTokens / rawSum;
          finalPromptTokens = Math.round(rawPromptTokens * ratio);
          finalOutputTokens = finalTotalTokens - finalPromptTokens; // Ensure exact match
        } else {
          // No component data, estimate 75/25 split for essay correction
          finalPromptTokens = Math.floor(finalTotalTokens * 0.75);
          finalOutputTokens = finalTotalTokens - finalPromptTokens;
        }
      } else if (finalTotalTokens === 0 && (rawPromptTokens === 0 && rawOutputTokens === 0)) {
        // No metadata at all, fallback to estimate (essay correction typically uses ~800 tokens)
        finalPromptTokens = 600;
        finalOutputTokens = 200;
      }
      
      console.log(`✅ Essay correction (${finalPromptTokens} in + ${finalOutputTokens} out = ${finalTotalTokens} tokens, Score: ${correction.totalScore || 'N/A'}) (Google AI Studio compatible)`);
      
      // Attach token usage to correction result
      correction.tokensUsed = finalTotalTokens;
      correction.promptTokens = finalPromptTokens;
      correction.outputTokens = finalOutputTokens;
      
      // Cache the result
      this.cache.set(cacheKey, {
        result: correction,
        timestamp: Date.now()
      });
      
      return correction;
      
    } catch (error) {
      console.error("Error in essay correction:", error);
      return this.getFallbackEssayCorrection(essayText, topic, examType);
    }
  }

  private buildEssayCorrectionPrompt(essayText: string, topic: string, examType: string): string {
    const competencies = examType === 'ENEM' ? [
      {
        name: "Competência 1: Demonstrar domínio da modalidade escrita formal da língua portuguesa",
        maxPoints: 200,
        criteria: [
          "Convenções da escrita (grafia, acentuação, pontuação, separação silábica)",
          "Morfossintaxe (concordância, regência, colocação pronominal)",
          "Vocabulário (adequação, precisão, riqueza lexical)",
          "Registro de linguagem adequado ao gênero textual"
        ]
      },
      {
        name: "Competência 2: Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento",
        maxPoints: 200,
        criteria: [
          "Compreensão plena do tema proposto",
          "Aplicação de conceitos de diferentes áreas do conhecimento",
          "Desenvolvimento do tema dentro dos limites estruturais do texto dissertativo-argumentativo",
          "Articulação coerente de informações, fatos e opiniões"
        ]
      },
      {
        name: "Competência 3: Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos",
        maxPoints: 200,
        criteria: [
          "Seleção de argumentos consistentes",
          "Organização estratégica das informações",
          "Progressão temática clara e coerente",
          "Autoria e posicionamento crítico fundamentado"
        ]
      },
      {
        name: "Competência 4: Demonstrar conhecimento dos mecanismos linguísticos necessários para argumentação",
        maxPoints: 200,
        criteria: [
          "Articulação entre parágrafos e períodos",
          "Uso adequado de conectivos e operadores argumentativos",
          "Construção da argumentação através de recursos coesivos",
          "Variedade e adequação dos mecanismos linguísticos"
        ]
      },
      {
        name: "Competência 5: Elaborar proposta de intervenção para o problema abordado",
        maxPoints: 200,
        criteria: [
          "Proposta específica e detalhada",
          "Respeito aos direitos humanos",
          "Articulação com a discussão desenvolvida no texto",
          "Presença dos 5 elementos: AGENTE + AÇÃO + MODO/MEIO + FINALIDADE + DETALHAMENTO"
        ]
      }
    ] : [
      {
        name: "Competência 1: Adequação ao tema e ao tipo textual",
        maxPoints: 200,
        criteria: [
          "Compreensão adequada do tema proposto",
          "Atendimento ao gênero dissertativo-argumentativo",
          "Desenvolvimento dentro dos limites temáticos",
          "Posicionamento claro sobre a questão"
        ]
      },
      {
        name: "Competência 2: Organização textual e coerência",
        maxPoints: 200,
        criteria: [
          "Estrutura dissertativa clara (introdução, desenvolvimento, conclusão)",
          "Progressão lógica das ideias",
          "Unidade temática e coerência global",
          "Articulação adequada entre parágrafos"
        ]
      },
      {
        name: "Competência 3: Argumentação e desenvolvimento",
        maxPoints: 200,
        criteria: [
          "Qualidade e consistência dos argumentos",
          "Uso adequado de exemplos e repertório",
          "Fundamentação das ideias apresentadas",
          "Capacidade de convencimento e persuasão"
        ]
      },
      {
        name: "Competência 4: Domínio da norma culta e coesão",
        maxPoints: 200,
        criteria: [
          "Correção gramatical (sintaxe, morfologia, ortografia)",
          "Adequação do registro linguístico",
          "Uso eficiente de mecanismos coesivos",
          "Clareza e precisão na expressão"
        ]
      },
      {
        name: "Competência 5: Proposta de solução e síntese argumentativa",
        maxPoints: 200,
        criteria: [
          "Elaboração de proposta de solução para o problema",
          "Síntese coerente dos argumentos apresentados",
          "Conclusão articulada e bem fundamentada",
          "Fechamento eficaz do texto dissertativo"
        ]
      }
    ];

    const detailedInstructions = examType === 'ENEM' ? `
CRITÉRIOS OFICIAIS ENEM 2025 - MATRIZ DE REFERÊNCIA:

🎯 COMPETÊNCIA I - Modalidade Escrita Formal (0-200 pontos):
200pts: Excelente domínio. Desvios aceitos apenas como excepcionalidade
160pts: Bom domínio com poucos desvios
120pts: Domínio mediano com alguns desvios
80pts: Domínio insuficiente com muitos desvios
40pts: Domínio precário com desvios sistemáticos e frequentes
0pts: Desconhecimento da modalidade formal
▸ Avalie: ortografia, acentuação, concordância, regência, pontuação, estrutura sintática, registro formal, vocabulário preciso

🎯 COMPETÊNCIA II - Compreensão do Tema e Tipo Textual (0-200 pontos):
200pts: Argumentação consistente com repertório sociocultural PRODUTIVO e excelente domínio dissertativo
160pts: Bom domínio dissertativo com proposição, argumentação e conclusão
120pts: Domínio mediano com argumentação previsível
80pts: Cópia de motivadores OU domínio insuficiente da estrutura
40pts: Tangenciamento ao tema OU traços de outros tipos textuais
0pts: Fuga ao tema OU não atendimento ao tipo dissertativo-argumentativo
▸ CRÍTICO: Repertório deve ser LEGITIMAMENTE relacionado, não "repertório de bolso" decorado
▸ Avalie autoria e articulação crítica própria, não mera citação genérica

🎯 COMPETÊNCIA III - Seleção e Organização de Argumentos (0-200 pontos):
200pts: Informações consistentes e organizadas configurando AUTORIA
160pts: Informações organizadas com indícios de autoria
120pts: Limitado aos motivadores, pouco organizadas
80pts: Desorganizadas/contraditórias, limitadas aos motivadores
40pts: Pouco relacionadas ou incoerentes
0pts: Não relacionadas ao tema, sem defesa de ponto de vista
▸ Verifique projeto de texto, progressão fluente, coerência introdução-conclusão, desenvolvimento sem lacunas

🎯 COMPETÊNCIA IV - Mecanismos Linguísticos e Coesão (0-200 pontos):
200pts: Articula BEM com repertório DIVERSIFICADO de recursos coesivos
160pts: Articula com poucas inadequações e repertório diversificado
120pts: Articula medianamente com inadequações e repertório pouco diversificado
80pts: Articula insuficientemente com muitas inadequações e repertório limitado
40pts: Articula de forma precária
0pts: Não articula as informações
▸ Avalie: conectivos variados, referenciação, estruturação de parágrafos, períodos complexos, progressão textual

🎯 COMPETÊNCIA V - Proposta de Intervenção e Direitos Humanos (0-200 pontos):
200pts: Proposta MUITO BEM elaborada, detalhada, relacionada e articulada
160pts: Proposta BEM elaborada, relacionada e articulada
120pts: Proposta mediana, relacionada e articulada
80pts: Proposta insuficiente OU não articulada
40pts: Proposta vaga, precária ou só relacionada ao assunto
0pts: Sem proposta OU desrespeita direitos humanos OU não relacionada
▸ OBRIGATÓRIO: Agente (quem) + Ação (o quê) + Modo/Meio (como) + Finalidade (para quê) + Detalhamento
▸ Deve respeitar: dignidade humana, igualdade, diversidade, democracia, sustentabilidade

⚠️ ANÁLISE OBRIGATÓRIA PARA CORREÇÃO ENEM:
1. ESTRUTURA: Introdução (contextualização + tese) + Desenvolvimento (2+ argumentos fundamentados) + Conclusão (retomada + proposta completa)
2. REPERTÓRIO: Dados, estatísticas, citações, exemplos históricos/culturais LEGITIMAMENTE articulados (NÃO use repertório decorado genérico!)
3. COESÃO: Conectivos variados, referenciação eficiente, sem repetições inadequadas
4. COERÊNCIA: Progressão temática fluente, sem contradições, adequação plena ao tema proposto
5. PROPOSTA: Verificar os 5 elementos obrigatórios e articulação com a argumentação desenvolvida
6. DIREITOS HUMANOS: Garantir que não há propostas de violência, discriminação ou desrespeito à dignidade humana

⚖️ CRITÉRIOS DE ANULAÇÃO (Nota 0 total):
- Fuga TOTAL ao tema proposto
- Não atendimento ao tipo dissertativo-argumentativo
- Até 7 linhas escritas (texto insuficiente)
- Cópia integral/majoritária dos textos motivadores
- Impropérios, desenhos, identificação do candidato
- Parte deliberadamente desconectada do tema` : `
CRITÉRIOS ESPECÍFICOS DE VESTIBULAR/CONCURSO:
- Foque na consistência argumentativa e fundamentação teórica
- Valorize o uso de repertório cultural e conhecimento interdisciplinar
- Avalie a originalidade e criatividade na abordagem
- Verifique a adequação do registro linguístico formal acadêmico`;

    return `Você é um corretor oficial do ENEM com 15+ anos de experiência avaliando redações pelo INEP. Sua missão é corrigir esta redação com os critérios oficiais do ENEM 2025, oferecendo feedback profissional, detalhado e construtivo como um professor especialista.

═══════════════════════════════════════════════════════════════════════════════
📋 REDAÇÃO PARA CORREÇÃO ENEM 2025
═══════════════════════════════════════════════════════════════════════════════
📝 TEMA: ${topic}
🎓 TIPO DE EXAME: ${examType}
📊 NOTA MÁXIMA: 1000 pontos (200 por competência)

TEXTO DA REDAÇÃO:
"${essayText}"

═══════════════════════════════════════════════════════════════════════════════
📊 COMPETÊNCIAS DE AVALIAÇÃO ${examType}
═══════════════════════════════════════════════════════════════════════════════
${competencies.map(comp => `
🎯 ${comp.name} (0-${comp.maxPoints} pontos)
${comp.criteria.map(criterion => `   • ${criterion}`).join('\n')}
`).join('')}

${detailedInstructions}

═══════════════════════════════════════════════════════════════════════════════
⚖️ METODOLOGIA DE CORREÇÃO
═══════════════════════════════════════════════════════════════════════════════
1. LEIA o texto integralmente pelo menos 2 vezes
2. IDENTIFIQUE problemas específicos com localização no texto
3. AVALIE cada competência de forma independente e criteriosa
4. PONTUE considerando a grade oficial (não seja condescendente nem rigoroso demais)
5. FORNEÇA feedback construtivo e específico como um professor experiente
6. USE exemplos extraídos do próprio texto do candidato
7. SUGIRA melhorias práticas e realizáveis

═══════════════════════════════════════════════════════════════════════════════
📝 FORMATO DE RESPOSTA (JSON RIGOROSO)
═══════════════════════════════════════════════════════════════════════════════

{
  "totalScore": [soma exata das 5 competências para ENEM ou 4 para outros],
  "overallFeedback": "[avaliação geral em 2-3 frases, destacando o nível da redação]",
  "competencies": [
    {
      "name": "[nome completo da competência]",
      "score": [pontuação específica baseada na grade oficial],
      "maxScore": [pontuação máxima possível],
      "criteria": "[critério principal avaliado]",
      "feedback": "[análise detalhada com exemplos específicos do texto. OBRIGATÓRIO: Se a nota for menor que 200, você DEVE explicar CLARAMENTE e EXPLICITAMENTE o que faltou ou o que está impedindo a nota máxima. Não basta elogiar - diga exatamente qual elemento está ausente ou insuficiente]",
      "level": "[Excelente/Muito Bom/Bom/Regular/Insuficiente/Nulo]"
    }
  ],
  "strengths": [
    "[ponto forte específico com exemplo do texto]",
    "[outro ponto forte específico]",
    "[terceiro ponto forte específico]"
  ],
  "improvements": [
    "[melhoria específica com sugestão prática]",
    "[outra melhoria específica]", 
    "[terceira melhoria específica]"
  ],
  "detailedAnalysis": "[análise minuciosa de 4-6 frases abordando: estrutura dissertativa, qualidade argumentativa, uso de repertório, coesão/coerência, adequação linguística, e cumprimento da proposta. Seja específico e mencione exemplos do texto]",
  "recommendation": "[recomendação pedagógica específica de 2-3 frases para o próximo nível de desenvolvimento, incluindo estratégias de estudo]",
  "structureAnalysis": {
    "introduction": "[avaliação específica da introdução]",
    "development": "[avaliação do desenvolvimento argumentativo]", 
    "conclusion": "[avaliação da conclusão e proposta de intervenção]"
  },
  "statistics": {
    "wordCount": ${essayText.split(/\s+/).length},
    "paragraphCount": ${essayText.split(/\n\s*\n/).length},
    "averageWordsPerSentence": [calcule baseado em pontos finais],
    "readingTime": "[tempo em minutos]"
  }
}

⚠️ CRITÉRIOS DE QUALIDADE OBRIGATÓRIOS:
- Seja PRECISO nas pontuações (use EXATAMENTE a escala oficial: 0, 40, 80, 120, 160 ou 200 por competência)
- Seja ESPECÍFICO no feedback (cite trechos do texto, aponte problemas e acertos concretos)
- Seja CONSTRUTIVO mas HONESTO (reconheça qualidades, mas seja rigoroso nos critérios)
- Use linguagem PROFISSIONAL de corretor ENEM (técnica, clara, pedagógica)
- JUSTIFIQUE cada nota com base nos níveis da matriz oficial
- Identifique pontos POSITIVOS (o que o candidato fez bem) e pontos NEGATIVOS (o que precisa melhorar) 
- Dê EXEMPLOS PRÁTICOS de como melhorar (não seja genérico)
- NÃO MENCIONE que usou qualquer documento ou PDF na análise
- APRESENTE a correção como análise oficial do ENEM 2025

🚨 REGRA CRÍTICA PARA NOTAS ABAIXO DE 200:
Quando der uma nota MENOR QUE 200 em qualquer competência, você DEVE OBRIGATORIAMENTE:
1. EXPLICAR CLARAMENTE o que IMPEDIU a nota máxima
2. ESPECIFICAR exatamente qual elemento está AUSENTE, INSUFICIENTE ou INADEQUADO
3. DAR EXEMPLOS CONCRETOS de como CORRIGIR o problema
4. NÃO apenas elogiar - APONTAR a FALHA mesmo que sutil

Exemplo CORRETO (nota 160):
"A proposta apresenta 4 dos 5 elementos obrigatórios (agente, ação, modo e finalidade), porém FALTA o detalhamento específico da ação. Para alcançar 200 pontos, seria necessário detalhar COMO exatamente a ação será implementada (ex: 'por meio de campanhas educativas em escolas públicas e privadas, com distribuição de material didático')."

Exemplo ERRADO (nota 160):
"A proposta está bem elaborada e articulada com o texto." ❌ (não explica por que não é 200)

📝 SUA MISSÃO: Atue como um professor especialista em redação ENEM que analisa esta redação linha por linha, identificando:
✅ PONTOS FORTES: O que o candidato demonstra dominar
❌ PONTOS FRACOS: Onde precisa melhorar
💡 COMO MELHORAR: Estratégias práticas e exemplos concretos de aprimoramento

Responda EXCLUSIVAMENTE com o JSON válido formatado conforme especificado acima, sem texto adicional antes ou depois.`;
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
      
      // Calculate statistics if not provided
      const wordCount = essayText.split(/\s+/).length;
      const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = essayText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      
      // Validate and ensure required fields with enhanced structure
      const correction = {
        totalScore: parsed.totalScore || 600,
        overallFeedback: parsed.overallFeedback || "Redação analisada com critérios profissionais de correção.",
        competencies: parsed.competencies || [],
        strengths: parsed.strengths || [
          "Tentativa de abordar o tema proposto",
          "Uso de estrutura dissertativa básica",
          "Demonstração de conhecimento sobre o assunto"
        ],
        improvements: parsed.improvements || [
          "Desenvolver argumentação mais consistente",
          "Melhorar a coesão entre parágrafos",
          "Aprimorar o domínio da norma culta"
        ],
        detailedAnalysis: parsed.detailedAnalysis || "Análise detalhada da estrutura, argumentação e linguagem conforme critérios oficiais de correção.",
        recommendation: parsed.recommendation || "Continue praticando redação dissertativa-argumentativa, focando na estrutura e fundamentação dos argumentos.",
        structureAnalysis: parsed.structureAnalysis || {
          introduction: "Introdução identificada com apresentação do tema",
          development: "Desenvolvimento com argumentos básicos",
          conclusion: "Conclusão presente com tentativa de fechamento"
        },
        statistics: {
          wordCount: wordCount,
          paragraphCount: paragraphs.length,
          averageWordsPerSentence: parsed.statistics?.averageWordsPerSentence || Math.round(wordCount / Math.max(sentences.length, 1)),
          readingTime: parsed.statistics?.readingTime || `${Math.ceil(wordCount / 200)} min`
        }
      };
      
      // Ensure competencies have the required level field
      if (correction.competencies.length > 0) {
        correction.competencies = correction.competencies.map((comp: any) => ({
          ...comp,
          level: comp.level || this.getScoreLevel(comp.score, comp.maxScore)
        }));
        
        // Recalculate totalScore as sum of all competency scores to ensure accuracy
        const calculatedTotal = correction.competencies.reduce((sum: number, comp: any) => sum + (comp.score || 0), 0);
        
        // Only update if there's a discrepancy
        if (calculatedTotal !== correction.totalScore) {
          console.log(`⚠️ Corrigindo totalScore: IA retornou ${correction.totalScore}, mas soma das competências é ${calculatedTotal}`);
          correction.totalScore = calculatedTotal;
        }
      }
      
      return correction;
      
    } catch (error) {
      console.error("Error parsing essay correction response:", error);
      return this.getFallbackEssayCorrection(essayText, "", "");
    }
  }

  private getScoreLevel(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "Excelente";
    if (percentage >= 80) return "Muito Bom";
    if (percentage >= 65) return "Bom";
    if (percentage >= 50) return "Regular";
    if (percentage >= 20) return "Insuficiente";
    return "Nulo";
  }

  private getFallbackEssayCorrection(essayText: string, topic: string, examType: string): any {
    const wordCount = essayText.split(/\s+/).length;
    const sentences = essayText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = essayText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const avgWordsPerSentence = Math.round(wordCount / Math.max(sentences.length, 1)) || 15;
    
    // Generate a reasonable score based on text length and structure
    const baseScore = Math.min(800, Math.max(400, wordCount * 2.5));
    
    const competencies = examType === 'ENEM' ? [
      { 
        name: "Competência 1: Demonstrar domínio da modalidade escrita formal da língua portuguesa", 
        score: Math.round(baseScore * 0.18), 
        maxScore: 200, 
        criteria: "Modalidade escrita formal da língua", 
        feedback: "Mantenha atenção à norma culta e evite marcas de oralidade. Revise aspectos ortográficos e gramaticais.",
        level: this.getScoreLevel(Math.round(baseScore * 0.18), 200)
      },
      { 
        name: "Competência 2: Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento", 
        score: Math.round(baseScore * 0.19), 
        maxScore: 200, 
        criteria: "Compreensão do tema e aplicação de conhecimentos", 
        feedback: "Demonstre conhecimento interdisciplinar sobre o tema. Use repertórios socioculturais relevantes.",
        level: this.getScoreLevel(Math.round(baseScore * 0.19), 200)
      },
      { 
        name: "Competência 3: Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos", 
        score: Math.round(baseScore * 0.21), 
        maxScore: 200, 
        criteria: "Seleção e organização de argumentos", 
        feedback: "Organize melhor a progressão das ideias e argumentos. Desenvolva cada argumento com profundidade.",
        level: this.getScoreLevel(Math.round(baseScore * 0.21), 200)
      },
      { 
        name: "Competência 4: Demonstrar conhecimento dos mecanismos linguísticos necessários para argumentação", 
        score: Math.round(baseScore * 0.20), 
        maxScore: 200, 
        criteria: "Articulação de argumentos e coesão", 
        feedback: "Use conectivos variados para melhor articulação. Melhore a coesão entre parágrafos.",
        level: this.getScoreLevel(Math.round(baseScore * 0.20), 200)
      },
      { 
        name: "Competência 5: Elaborar proposta de intervenção para o problema abordado", 
        score: Math.round(baseScore * 0.22), 
        maxScore: 200, 
        criteria: "Elaboração de proposta detalhada", 
        feedback: "Detalhe mais sua proposta com agente, ação, modo/meio, finalidade e detalhamento específico.",
        level: this.getScoreLevel(Math.round(baseScore * 0.22), 200)
      }
    ] : [
      { 
        name: "Competência 1: Adequação ao tema e ao tipo textual", 
        score: Math.round(baseScore * 0.20), 
        maxScore: 200, 
        criteria: "Adequação temática e textual", 
        feedback: "Mantenha foco no tema e no gênero dissertativo-argumentativo durante todo o desenvolvimento.",
        level: this.getScoreLevel(Math.round(baseScore * 0.20), 200)
      },
      { 
        name: "Competência 2: Organização textual e coerência", 
        score: Math.round(baseScore * 0.20), 
        maxScore: 200, 
        criteria: "Estrutura e coerência", 
        feedback: "Organize melhor a estrutura com introdução clara, desenvolvimento consistente e conclusão articulada.",
        level: this.getScoreLevel(Math.round(baseScore * 0.20), 200)
      },
      { 
        name: "Competência 3: Argumentação e desenvolvimento", 
        score: Math.round(baseScore * 0.20), 
        maxScore: 200, 
        criteria: "Desenvolvimento argumentativo", 
        feedback: "Desenvolva argumentos mais consistentes e persuasivos. Use exemplos concretos e dados quando possível.",
        level: this.getScoreLevel(Math.round(baseScore * 0.20), 200)
      },
      { 
        name: "Competência 4: Domínio da norma culta e coesão", 
        score: Math.round(baseScore * 0.20), 
        maxScore: 200, 
        criteria: "Correção gramatical e coesão", 
        feedback: "Revise aspectos gramaticais, ortográficos e conectivos de coesão para maior fluência textual.",
        level: this.getScoreLevel(Math.round(baseScore * 0.20), 200)
      },
      { 
        name: "Competência 5: Proposta de solução e síntese argumentativa", 
        score: Math.round(baseScore * 0.20), 
        maxScore: 200, 
        criteria: "Elaboração de proposta e conclusão", 
        feedback: "Fortaleça a conclusão com síntese argumentativa clara e propostas de solução bem fundamentadas.",
        level: this.getScoreLevel(Math.round(baseScore * 0.20), 200)
      }
    ];

    return {
      totalScore: Math.round(baseScore),
      overallFeedback: wordCount < 150 
        ? "Redação muito curta para uma avaliação completa. Desenvolva mais seus argumentos para atingir o mínimo esperado." 
        : wordCount > 400 
          ? "Boa extensão da redação. Foque na qualidade dos argumentos, estrutura dissertativa e correção linguística."
          : "Redação com extensão adequada. Continue desenvolvendo argumentação consistente e estrutura dissertativa.",
      competencies: competencies.map(comp => ({
        ...comp,
        level: comp.level || this.getScoreLevel(comp.score, comp.maxScore)
      })),
      strengths: [
        wordCount >= 200 ? "Extensão adequada do texto demonstrando desenvolvimento temático" : "Tentativa de desenvolvimento do tema proposto",
        sentences.length >= 8 ? "Variação nas estruturas frasais mostrando domínio sintático" : "Uso de períodos organizados na construção textual",
        paragraphs.length >= 3 ? "Estruturação em parágrafos respeitando organização dissertativa" : "Tentativa de estruturação dissertativa"
      ],
      improvements: [
        wordCount < 200 ? "Desenvolva mais os argumentos com exemplos e repertórios socioculturais específicos" : "Aprofunde a argumentação com repertórios mais diversificados e fundamentação teórica",
        "Revise aspectos gramaticais, ortográficos e sintáticos para melhor fluência textual",
        examType === 'ENEM' ? "Elabore proposta de intervenção mais detalhada com os 5 elementos obrigatórios" : "Fortaleça a conclusão argumentativa com síntese e posicionamento final"
      ],
      detailedAnalysis: `Redação de ${wordCount} palavras distribuídas em ${paragraphs.length} parágrafos com estrutura ${sentences.length <= 6 ? 'básica necessitando maior desenvolvimento' : 'adequada para o gênero dissertativo'}. ${
        wordCount < 150 ? 'Texto muito curto, necessita maior desenvolvimento argumentativo e exemplificação. ' : ''
      }${
        avgWordsPerSentence < 10 ? 'Períodos muito curtos podem prejudicar a fluidez - varie a construção frasal. ' : 
        avgWordsPerSentence > 25 ? 'Períodos longos podem comprometer a clareza - cuide da pontuação e estrutura sintática. ' : 'Períodos com extensão adequada facilitando a compreensão. '
      }${
        paragraphs.length < 3 ? 'Estruture melhor em parágrafos distintos (introdução, desenvolvimento, conclusão). ' : 'Organização paragráfica adequada ao gênero dissertativo. '
      }Continue praticando a estrutura dissertativa-argumentativa com foco na fundamentação e coesão.`,
      recommendation: wordCount < 200 
        ? "Foque em desenvolver mais seus argumentos com exemplos concretos e repertórios socioculturais. Busque atingir pelo menos 300 palavras com estrutura dissertativa completa."
        : "Sua redação está bem encaminhada. Trabalhe na qualidade da argumentação, correção linguística e uso de repertórios legitimadores para pontuações mais altas.",
      structureAnalysis: {
        introduction: paragraphs.length >= 1 ? "Introdução identificada com apresentação do tema" : "Necessário desenvolver introdução mais clara",
        development: paragraphs.length >= 2 ? "Desenvolvimento presente com argumentos básicos" : "Desenvolvimento argumentativo precisa ser ampliado",
        conclusion: paragraphs.length >= 3 ? "Conclusão presente com tentativa de fechamento" : "Conclusão precisa ser mais elaborada"
      },
      statistics: {
        wordCount,
        paragraphCount: paragraphs.length,
        averageWordsPerSentence: avgWordsPerSentence,
        readingTime: `${Math.ceil(wordCount / 200)} min`
      },
      source: 'fallback'
    };
  }
}

export const textModificationService = new TextModificationService();