import type { 
  TextModificationConfig, 
  TextModificationType,
  WordDifficulty,
  ArgumentTechnique 
} from "@shared/schema";

export class PromptOptimizer {
  // Optimized prompts - 60-70% token reduction while maintaining quality
  
  static buildOptimizedPrompt(text: string, type: string, config: TextModificationConfig): string {
    const commonInstructions = 'CRÍTICO: Retorne o texto COMPLETO modificado, NUNCA truncado ou incompleto. NÃO use formatação markdown (**, *, _, etc). Texto puro. Mantenha tamanho similar (±20% do original).';
    
    switch (type) {
      case 'formalidade':
        const nivel = config.formalityLevel || 50;
        const dificuldade = config.wordDifficulty || 'medio';
        const preservarSentido = true; // Always preserve meaning by default
        
        return `Você é especialista em redação ENEM. Sua tarefa: reescrever TODO o texto abaixo com formalidade ${nivel}% e vocabulário ${dificuldade}.

TEXTO PARA REESCREVER POR COMPLETO:
"${text}"

INSTRUÇÕES:
- ${preservarSentido ? 'Preserve o sentido original' : 'Inverta a argumentação'}
- Use conectivos acadêmicos adequados
- Estrutura clara com 3ª pessoa
- ${commonInstructions}

RETORNE SOMENTE O TEXTO COMPLETO REESCRITO (sem explicações, sem comentários):`;

      case 'argumentativo':
        const tecnica = config.argumentTechnique || 'topico-frasal';
        const estrutura = config.argumentStructure || {};
        const intensidade = config.argumentativeLevel || 50;
        
        const reqs = [];
        if (estrutura.repertoire) reqs.push('repertório');
        if (estrutura.thesis) reqs.push('tese');
        if (estrutura.arguments) reqs.push('argumentos');
        if (estrutura.conclusion) reqs.push('fechamento');

        return `Você é especialista em redação ENEM. Transforme TODO o texto abaixo em parágrafo dissertativo-argumentativo.

TEXTO BASE:
"${text}"

PARÂMETROS:
- Técnica: ${tecnica}
- Intensidade argumentativa: ${intensidade}%
- Estrutura: Tópico → Desenvolvimento → Fechamento
${reqs.length ? '- Incluir: ' + reqs.join(', ') : ''}
- Conectivos acadêmicos, 4-6 linhas
- ${commonInstructions}

RETORNE SOMENTE O PARÁGRAFO COMPLETO (sem explicações):`;

      case 'sinonimos':
        return `Você é especialista em redação ENEM. Reescreva TODO o texto abaixo enriquecendo o vocabulário com sinônimos acadêmicos.

TEXTO PARA ENRIQUECER:
"${text}"

INSTRUÇÕES:
- Substitua palavras simples por sinônimos formais (mostrar→evidenciar, importante→fundamental, grande→significativo)
- Mantenha precisão semântica exata
- ${commonInstructions}

RETORNE SOMENTE O TEXTO COMPLETO COM VOCABULÁRIO ENRIQUECIDO:`;

      case 'antonimos':
        return `Você é especialista em redação ENEM. Reescreva TODO o texto abaixo invertendo a argumentação.

TEXTO BASE:
"${text}"

INSTRUÇÕES:
- Crie argumento oposto bem fundamentado
- Use antônimos inteligentes e conectivos adversativos
- Mantenha estrutura argumentativa clara
- ${commonInstructions}

RETORNE SOMENTE O TEXTO COMPLETO COM ARGUMENTAÇÃO INVERTIDA:`;

      case 'estrutura-causal':
        const tipoEstruturaCausal = config.structureType || 'tese-argumento';
        const conectivos = this.getCausalConnectives(tipoEstruturaCausal);
        
        return `Você é especialista em redação ENEM. Reorganize TODO o texto abaixo usando estrutura causal: ${tipoEstruturaCausal}.

TEXTO BASE:
"${text}"

INSTRUÇÕES:
- Conectivos essenciais: ${conectivos}
- Relações de causa-efeito claras
- Conectivos variados e bem distribuídos
- ${commonInstructions}

RETORNE SOMENTE O PARÁGRAFO COMPLETO COM ESTRUTURA CAUSAL:`;

      case 'estrutura-comparativa':
        const tipoComparativa = config.structureType || 'comparacao-paralela';
        const conectivosComp = this.getComparativeConnectives(tipoComparativa);
        
        return `Você é especialista em redação ENEM. Reorganize TODO o texto abaixo usando estrutura comparativa: ${tipoComparativa}.

TEXTO BASE:
"${text}"

INSTRUÇÕES:
- Conectivos essenciais: ${conectivosComp}
- Analogias esclarecedoras
- Comparações equilibradas e fundamentadas
- ${commonInstructions}

RETORNE SOMENTE O PARÁGRAFO COMPLETO COM ESTRUTURA COMPARATIVA:`;

      case 'estrutura-oposicao':
        const tipoOposicao = config.structureType || 'embora-oposicao';
        const conectivosOp = this.getOppositionConnectives(tipoOposicao);
        
        return `Você é especialista em redação ENEM. Reorganize TODO o texto abaixo usando estrutura de oposição: ${tipoOposicao}.

TEXTO BASE:
"${text}"

INSTRUÇÕES:
- Conectivos essenciais: ${conectivosOp}
- Maturidade argumentativa
- Reconhecimento respeitoso de perspectivas contrárias
- ${commonInstructions}

RETORNE SOMENTE O PARÁGRAFO COMPLETO COM ESTRUTURA DE OPOSIÇÃO:`;

      default:
        return `Você é especialista em redação ENEM. Melhore TODO o texto abaixo para uso em dissertação.

TEXTO BASE:
"${text}"

INSTRUÇÕES:
- Linguagem formal e acadêmica
- Conectivos apropriados
- Estrutura clara e coesa
- ${commonInstructions}

RETORNE SOMENTE O TEXTO COMPLETO MELHORADO:`;
    }
  }

  private static getCausalConnectives(type: string): string {
    const connectives = {
      'tese-argumento': 'uma vez que, visto que, por conseguinte',
      'problema-causa': 'decorre de, resulta de, em razão de',
      'topico-consequencia': 'consequentemente, por isso, de modo que',
      'causa-observacao': 'haja vista, dado que, em decorrência de',
      'efeito-analise': 'decorrente de, em virtude de, logo',
      'fator-impacto': 'ocasiona, promove, por conseguinte',
      'origem-desenvolvimento': 'origina-se, desenvolve-se, por consequência'
    };
    return connectives[type as keyof typeof connectives] || 'devido a, consequentemente, portanto';
  }

  private static getComparativeConnectives(type: string): string {
    const connectives = {
      'comparacao-paralela': 'assim como, tal qual, da mesma forma',
      'forma-similar': 'da mesma forma que, à semelhança de',
      'condicional-se': 'se... então, caso... logo',
      'medida-proporcional': 'na medida em que, quanto mais... mais',
      'enquanto-outro': 'enquanto, por outro lado, ao passo que',
      'tanto-quanto': 'tanto quanto, assim como, bem como',
      'diferente-de': 'diferentemente de, ao contrário de',
      'semelhanca-de': 'à semelhança de, tal qual, como'
    };
    return connectives[type as keyof typeof connectives] || 'assim como, da mesma forma, tal qual';
  }

  private static getOppositionConnectives(type: string): string {
    const connectives = {
      'embora-oposicao': 'embora, conquanto, não obstante',
      'apesar-concessao': 'apesar de, a despeito de, malgrado',
      'conforme-evidencia': 'conforme demonstra, como evidencia',
      'exemplo-confirmacao': 'exemplificado por, como demonstra',
      'no-entanto': 'no entanto, entretanto, todavia',
      'contudo': 'contudo, entretanto, porém',
      'por-sua-vez': 'por sua vez, em contrapartida',
      'entretanto': 'entretanto, no entanto, contudo'
    };
    return connectives[type as keyof typeof connectives] || 'embora, contudo, não obstante';
  }
}