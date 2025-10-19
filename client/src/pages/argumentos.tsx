import { useState, useEffect, useRef } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Brain, Send, Map, Eye, BookOpen, Lightbulb, Target, CheckCircle2, Clock, Users, RotateCcw, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AIUsageProgress, refreshAIUsageStats } from "@/components/ai-usage-progress";

// Função para remover JSON estruturado das mensagens da IA
function removeStructuredJSON(text: string): string {
  // Remove blocos JSON entre ```json e ```
  let cleanText = text.replace(/```json\s*\n[\s\S]*?\n```/gi, '');
  
  // Remove JSON solto no final da mensagem (padrão: { ... })
  cleanText = cleanText.replace(/\{[\s\S]*?"tema"[\s\S]*?\}/gi, '');
  
  // Remove linhas vazias extras deixadas pela remoção
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleanText;
}

// Função para processar markdown e retornar JSX formatado
function processMarkdown(text: string) {
  // Primeiro, remover JSON estruturado antes de processar markdown
  const cleanText = removeStructuredJSON(text);
  
  const lines = cleanText.split('\n');
  const elements: JSX.Element[] = [];
  
  lines.forEach((line, lineIndex) => {
    const parts: (string | JSX.Element)[] = [];
    let currentText = line;
    let key = 0;
    
    // Processar negrito (**texto**)
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(currentText)) !== null) {
      // Adicionar texto antes do match
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }
      // Adicionar texto em negrito
      parts.push(<strong key={`bold-${lineIndex}-${key++}`} className="font-semibold">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // Adicionar texto restante
    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }
    
    // Se a linha estiver vazia, adicionar quebra de linha
    if (parts.length === 0) {
      elements.push(<br key={`br-${lineIndex}`} />);
    } else {
      elements.push(<span key={`line-${lineIndex}`}>{parts}{lineIndex < lines.length - 1 && <br />}</span>);
    }
  });
  
  return <>{elements}</>;
}

export default function Argumentos() {
  const [location, setLocation] = useLocation();
  const [backUrl, setBackUrl] = useState('/dashboard');
  const [showMindMap, setShowMindMap] = useState(false);

  // Estado unificado para o brainstorm
  const [brainstormData, setBrainstormData] = useState({
    tema: '',
    tese: '',
    paragrafos: {
      introducao: '',
      desenvolvimento1: '',
      desenvolvimento2: '',
      conclusao: ''
    },
    repertorios: [] as Array<{tipo: string, titulo: string, descricao: string, relevancia: string}>,
    conectivos: [] as Array<{tipo: string, conectivo: string, uso: string}>
  });

  // Estado do chat principal unificado com conversationId
  const [chatState, setChatState] = useState({
    conversationId: null as string | null,
    messages: [] as Array<{id: string, type: 'user' | 'ai', content: string, section?: string, timestamp: Date}>,
    currentMessage: '',
    isLoading: false,
    currentSection: 'tema' as 'tema' | 'tese' | 'introducao' | 'desenvolvimento1' | 'desenvolvimento2' | 'conclusao' | 'finalizacao'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Garantir que a página sempre abra no topo apenas na primeira carga
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Mantém apenas para carregamento inicial

  // Scroll automático APENAS na caixa de conversa: início da mensagem da IA, final para mensagens do usuário
  useEffect(() => {
    if (chatState.messages.length > 0 && chatContainerRef.current) {
      const chatContainer = chatContainerRef.current;
      
      // Para garantir que o DOM foi totalmente renderizado antes do scroll
      requestAnimationFrame(() => {
        setTimeout(() => {
          const lastMessage = chatState.messages[chatState.messages.length - 1];
          
          if (lastMessage.type === 'ai') {
            // Para mensagens da IA: rolar para o INÍCIO da mensagem dentro do container
            const lastAiMessageElement = chatContainer.querySelector(`[data-message-id="${lastMessage.id}"]`) as HTMLElement;
            if (lastAiMessageElement) {
              // Calcular posição relativa da mensagem da IA dentro do container
              const relativeTop = lastAiMessageElement.offsetTop - chatContainer.scrollTop;
              
              // Scroll manual dentro do container apenas
              chatContainer.scrollTo({
                top: lastAiMessageElement.offsetTop - 20, // 20px de margem superior
                behavior: 'smooth'
              });
            }
          } else {
            // Para mensagens do usuário: rolar para o final do container
            chatContainer.scrollTo({
              top: chatContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 100);
      });
    }
  }, [chatState.messages]);

  // Inicializar conversa com persistência
  useEffect(() => {
    // Tentar carregar conversationId do localStorage
    const savedConversationId = localStorage.getItem('argumentos-conversation-id');
    
    if (savedConversationId && chatState.messages.length === 0) {
      // TODO: Implementar carregamento do histórico da conversa
      // Por enquanto, apenas restaurar o ID e inicializar com mensagem de boas-vindas
      setChatState(prev => ({
        ...prev,
        conversationId: savedConversationId
      }));
    }
    
    // Inicializar com mensagem de boas-vindas se não houver mensagens
    if (chatState.messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai' as const,
        content: `🎯 REFINAMENTO DO BRAINSTORMING

✨ DESENVOLVA SUA REDAÇÃO COM AJUDA DA IA
Chat inteligente para estruturação argumentativa

💡 O QUE EU FAÇO POR VOCÊ:
• Desenvolvo sua tese principal de forma estruturada
• Construo argumentos sólidos com fundamentação
• Organizo parágrafos de introdução, desenvolvimento e conclusão
• Sugiro repertórios culturais relevantes para seu tema
• Refino sua linguagem argumentativa

🏗️ COMO FUNCIONA:
1️⃣ Você me conta o tema da redação
2️⃣ Desenvolvemos juntos sua tese principal
3️⃣ Construímos argumentos persuasivos
4️⃣ Estruturamos cada parágrafo
5️⃣ Geramos um mapa mental completo

📝 VAMOS COMEÇAR
Compartilhe comigo o tema da sua redação (proposta de vestibular, tema social, concurso público, etc.) para iniciarmos a construção dos seus argumentos!`,
        section: 'tema' as const,
        timestamp: new Date()
      };
      setChatState(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }));
    }
    
    // Detectar página de origem
    const detectPreviousPage = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get('from');
      
      if (fromParam === 'functionalities') return '/functionalities';
      if (document.referrer) {
        const referrerUrl = new URL(document.referrer);
        const referrerPath = referrerUrl.pathname;
        if (referrerPath === '/functionalities') return '/functionalities';
        if (referrerPath === '/dashboard') return '/dashboard';
      }
      return '/dashboard';
    };
    
    const detectedUrl = detectPreviousPage();
    setBackUrl(detectedUrl);
  }, []);

  // Salvar automaticamente dados da conversa no localStorage para o visualizador
  useEffect(() => {
    if (chatState.messages.length > 1) { // Só salvar se houver conversa real (mais que a mensagem de boas-vindas)
      const conversationData = {
        conversationId: chatState.conversationId || 'session-' + Date.now(),
        messages: chatState.messages,
        currentSection: chatState.currentSection,
        brainstormData: brainstormData,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('conversationData', JSON.stringify(conversationData));
    }
  }, [chatState.messages, chatState.currentSection, brainstormData]);

  // Mutation para enviar mensagem para a IA
  const sendMessageMutation = useMutation({
    mutationFn: async (data: {conversationId?: string | null, messageId: string, message: string, section: string, context: any}) => {
      return apiRequest('/api/chat/argumentative', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      // Salvar conversationId se recebido
      if (data.conversationId) {
        localStorage.setItem('argumentos-conversation-id', data.conversationId);
        
        // Atualizar estado com conversationId se não tivermos
        setChatState(prev => ({
          ...prev,
          conversationId: prev.conversationId || data.conversationId,
          isLoading: false
        }));
      } else {
        setChatState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
      
      // Adicionar resposta da IA ao chat (sem o JSON técnico)
      const cleanResponse = removeJsonFromResponse(data.response);
      const aiMessage = {
        id: Date.now().toString() + '_ai',
        type: 'ai' as const,
        content: cleanResponse,
        section: data.section,
        timestamp: new Date()
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

      // Atualizar dados conforme a conversa progride (usa a resposta completa com JSON)
      updateBrainstormFromChat(data.response, data.section);
      
      // Atualizar barra de progresso de IA após uso de tokens
      refreshAIUsageStats();
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  });

  // Sequência lógica das seções para progressão automática
  const sectionFlow = ['tema', 'tese', 'introducao', 'desenvolvimento1', 'desenvolvimento2', 'conclusao', 'finalizacao'] as const;

  // Atualizar brainstorm baseado na conversa
  const updateBrainstormFromChat = (aiResponse: string, section: string) => {
    // 1. PRIORIDADE: Tentar extrair JSON estruturado da resposta da IA
    const extractedData = extractStructuredDataFromAI(aiResponse);
    
    if (extractedData) {
      // Se encontrou JSON, atualizar diretamente com os dados estruturados
      console.log('[ARGUMENTOS] Dados estruturados encontrados:', extractedData);
      setBrainstormData(prev => ({
        ...prev,
        tema: extractedData.tema || prev.tema,
        tese: extractedData.tese || prev.tese,
        paragrafos: {
          introducao: extractedData.introducao || prev.paragrafos.introducao,
          desenvolvimento1: extractedData.desenvolvimento1 || prev.paragrafos.desenvolvimento1,
          desenvolvimento2: extractedData.desenvolvimento2 || prev.paragrafos.desenvolvimento2,
          conclusao: extractedData.conclusao || prev.paragrafos.conclusao
        }
      }));
    } else {
      // 2. FALLBACK: Se não encontrou JSON, usar extração por padrões (método antigo)
      persistContentToSection(aiResponse, section);
    }
    
    // Verificar se é hora de avançar para a próxima seção
    checkSectionProgression();
  };

  // Função para extrair dados estruturados do JSON retornado pela IA
  const extractStructuredDataFromAI = (aiResponse: string): any | null => {
    try {
      // Procurar por bloco JSON entre ```json e ```
      const jsonBlockRegex = /```json\s*\n([\s\S]*?)\n```/i;
      const match = aiResponse.match(jsonBlockRegex);
      
      if (match && match[1]) {
        const jsonString = match[1].trim();
        const parsedData = JSON.parse(jsonString);
        
        // Validar que tem pelo menos um campo preenchido
        if (parsedData.tema || parsedData.tese || parsedData.introducao || 
            parsedData.desenvolvimento1 || parsedData.desenvolvimento2 || parsedData.conclusao) {
          return parsedData;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('[ARGUMENTOS] Não foi possível extrair JSON da resposta da IA:', error);
      return null;
    }
  };

  // Função para remover JSON da resposta antes de exibir ao usuário
  const removeJsonFromResponse = (aiResponse: string): string => {
    // Remover bloco JSON entre ```json e ```
    const jsonBlockRegex = /```json\s*\n[\s\S]*?\n```/i;
    return aiResponse.replace(jsonBlockRegex, '').trim();
  };

  // Função para persistir conteúdo na seção atual com fallback robusto
  const persistContentToSection = (content: string, section: string) => {
    // Limpar e preparar o conteúdo
    const cleanContent = content.trim();
    if (!cleanContent || cleanContent.length < 10) return;

    // Extrair conteúdo relevante de forma mais robusta
    const relevantContent = extractRelevantContent(cleanContent, section);
    
    if (relevantContent) {
      setBrainstormData(prev => {
        const updated = { ...prev };
        
        switch (section) {
          case 'tema':
            if (!updated.tema && relevantContent.length > 15) {
              updated.tema = relevantContent;
            }
            break;
          case 'tese':
            if (!updated.tese && relevantContent.length > 20) {
              updated.tese = relevantContent;
            }
            break;
          case 'introducao':
            if (!updated.paragrafos.introducao && relevantContent.length > 30) {
              updated.paragrafos = { ...updated.paragrafos, introducao: relevantContent };
            }
            break;
          case 'desenvolvimento1':
            if (!updated.paragrafos.desenvolvimento1 && relevantContent.length > 30) {
              updated.paragrafos = { ...updated.paragrafos, desenvolvimento1: relevantContent };
            }
            break;
          case 'desenvolvimento2':
            if (!updated.paragrafos.desenvolvimento2 && relevantContent.length > 30) {
              updated.paragrafos = { ...updated.paragrafos, desenvolvimento2: relevantContent };
            }
            break;
          case 'conclusao':
            if (!updated.paragrafos.conclusao && relevantContent.length > 30) {
              updated.paragrafos = { ...updated.paragrafos, conclusao: relevantContent };
            }
            break;
        }
        
        return updated;
      });
    }
  };

  // Extrair conteúdo relevante com estratégias inteligentes melhoradas
  const extractRelevantContent = (content: string, section: string): string | null => {
    // Limpar o conteúdo de caracteres especiais e formatação desnecessária
    const cleanContent = content
      .replace(/[🎯✨💡🏗️📝🔍⭐]/g, '') // Remove emojis comuns
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove markdown bold
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1') // Remove markdown italic
      .replace(/\n+/g, ' ') // Replace line breaks with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    // IMPORTANTE: Detectar se é um exemplo/sugestão da IA (NÃO deve ser salvo automaticamente)
    const isExample = /(?:exemplo|sugestão|sugiro|poderia ser|você poderia|você pode usar|tente usar|experimente|uma opção seria|considere usar)/gi.test(cleanContent);
    
    // Se for claramente um exemplo da IA, NÃO extrair automaticamente
    if (isExample) {
      return null;
    }

    // 1. Estratégia prioritária: Buscar por palavras-chave específicas da seção com contexto
    const contextPatterns = {
      tema: [
        /(?:tema|assunto|proposta|questão)(?:[:\s-]+)([^.!?\n]{15,200})/gi,
        /(?:sobre|acerca de|a respeito de|tratando de)\s+([^.!?\n]{15,200})/gi,
        /(?:o tema é|trata-se de|refere-se a)\s+([^.!?\n]{15,200})/gi
      ],
      tese: [
        /(?:tese|posicionamento|defendo que|acredito que|penso que|argumento que)[\s:,]+([^.!?\n]{20,300})/gi,
        /(?:minha visão é|considero que|entendo que|sustento que)[\s:,]+([^.!?\n]{20,300})/gi,
        /(?:a posição é|o ponto de vista|a perspectiva)[\s:,]+([^.!?\n]{20,300})/gi
      ],
      introducao: [
        /(?:introdução|início|abertura|contextualização)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:para começar|inicialmente|em primeiro lugar|primeiramente)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:o contexto|a situação|o cenário)[\s:,]+([^.!?\n]{30,300})/gi
      ],
      desenvolvimento1: [
        /(?:primeiro argumento|primeira razão|argumento inicial)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:em primeiro lugar|primeiramente)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:o argumento que|a razão pela qual|evidência de que)[\s:,]+([^.!?\n]{30,300})/gi
      ],
      desenvolvimento2: [
        /(?:segundo argumento|segunda razão|outro argumento|próximo argumento)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:em segundo lugar|além disso|adicionalmente)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:outra evidência|outro exemplo|mais um ponto)[\s:,]+([^.!?\n]{30,300})/gi
      ],
      conclusao: [
        /(?:conclusão|fechamento|finalização|síntese)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:para concluir|em conclusão|finalizando|por fim)[\s:,]+([^.!?\n]{30,300})/gi,
        /(?:portanto|assim|dessa forma|em suma)[\s:,]+([^.!?\n]{30,300})/gi
      ]
    };

    const patterns = contextPatterns[section as keyof typeof contextPatterns] || [];
    for (const pattern of patterns) {
      const matches = Array.from(cleanContent.matchAll(pattern));
      for (const match of matches) {
        const extracted = match[1]?.trim();
        if (extracted && extracted.length >= 15 && extracted.length <= 400) {
          return extracted;
        }
      }
    }

    // 2. Estratégia: Buscar por citações diretas (após tentar padrões específicos da seção)
    const quotedPatterns = [
      /"([^"]{15,400})"/g,  // Aspas duplas
      /'([^']{15,400})'/g,  // Aspas simples
      /[""]([^""]{15,400})[""]|["]([^"]{15,400})["]|[']([^']{15,400})[']/g,  // Aspas curvas
    ];
    
    for (const pattern of quotedPatterns) {
      const matches = Array.from(cleanContent.matchAll(pattern));
      if (matches.length > 0) {
        const bestMatch = matches
          .map(match => (match[1] || match[2] || match[3])?.trim())
          .filter(text => text && text.length >= 15 && text.length <= 400)
          .sort((a, b) => b.length - a.length)[0]; // Pega o mais longo
        
        if (bestMatch) return bestMatch;
      }
    }

    // 3. Estratégia: Análise de relevância semântica (buscar frases mais significativas)
    const sentences = cleanContent
      .split(/[.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 15 && s.length <= 400);

    if (sentences.length > 0) {
      // Critérios de relevância baseados no contexto da seção
      const relevanceScoring = (sentence: string, sectionType: string): number => {
        let score = 0;
        
        // Pontuação base pelo tamanho (favorece frases medianas)
        if (sentence.length >= 30 && sentence.length <= 200) score += 10;
        else if (sentence.length >= 15 && sentence.length <= 300) score += 5;
        
        // Palavras-chave específicas da seção
        const keywords = {
          tema: ['tema', 'assunto', 'questão', 'problema', 'proposta', 'tópico'],
          tese: ['defendo', 'acredito', 'considero', 'penso', 'sustento', 'posição', 'visão'],
          introducao: ['contexto', 'situação', 'cenário', 'background', 'história', 'origem'],
          desenvolvimento1: ['primeiro', 'inicial', 'primeiramente', 'argumento', 'razão', 'evidência'],
          desenvolvimento2: ['segundo', 'outro', 'além', 'também', 'adicionalmente', 'próximo'],
          conclusao: ['conclusão', 'portanto', 'assim', 'fim', 'síntese', 'resumindo']
        };
        
        const sectionKeywords = keywords[sectionType as keyof typeof keywords] || [];
        const lowerSentence = sentence.toLowerCase();
        
        sectionKeywords.forEach(keyword => {
          if (lowerSentence.includes(keyword)) score += 5;
        });
        
        // Penalizar perguntas (menos úteis para extração)
        if (sentence.includes('?')) score -= 3;
        
        // Penalizar frases muito genéricas
        const genericPhrases = ['vamos', 'agora', 'então', 'bom', 'bem', 'ok', 'certo'];
        genericPhrases.forEach(phrase => {
          if (lowerSentence.includes(phrase)) score -= 2;
        });
        
        return score;
      };

      // Encontrar a frase com maior pontuação de relevância
      const scoredSentences = sentences
        .map(sentence => ({
          text: sentence,
          score: relevanceScoring(sentence, section)
        }))
        .sort((a, b) => b.score - a.score);

      if (scoredSentences.length > 0 && scoredSentences[0].score > 0) {
        return scoredSentences[0].text;
      }
    }

    // 4. Fallback final: pegar a frase mais longa que não seja muito genérica
    const meaningfulSentences = sentences.filter(s => {
      const lower = s.toLowerCase();
      return !lower.includes('vamos') && 
             !lower.includes('agora vou') && 
             !lower.includes('agora eu') &&
             s.length >= 20;
    });

    if (meaningfulSentences.length > 0) {
      // Retorna a frase mais longa e significativa
      return meaningfulSentences
        .sort((a, b) => b.length - a.length)[0];
    }

    return null;
  };

  // Verificar progressão e avançar seções automaticamente (sem mensagens automáticas)
  const checkSectionProgression = () => {
    const currentIndex = sectionFlow.indexOf(chatState.currentSection);
    if (currentIndex === -1) return;

    // Verificar se a seção atual tem conteúdo suficiente
    const hasCurrentSectionContent = () => {
      switch (chatState.currentSection) {
        case 'tema': return !!brainstormData.tema;
        case 'tese': return !!brainstormData.tese;
        case 'introducao': return !!brainstormData.paragrafos.introducao;
        case 'desenvolvimento1': return !!brainstormData.paragrafos.desenvolvimento1;
        case 'desenvolvimento2': return !!brainstormData.paragrafos.desenvolvimento2;
        case 'conclusao': return !!brainstormData.paragrafos.conclusao;
        case 'finalizacao': return true; // Sempre considera finalizada
        default: return false;
      }
    };

    // Se a seção atual tem conteúdo, avançar para a próxima (apenas mudança de estado)
    if (hasCurrentSectionContent() && currentIndex < sectionFlow.length - 1) {
      const nextSection = sectionFlow[currentIndex + 1];
      setChatState(prev => ({ ...prev, currentSection: nextSection }));
    }
  };

  // Mensagens de orientação para cada seção
  const getSectionGuidanceMessage = (section: string): string => {
    const messages = {
      tema: `🎯 DESENVOLVIMENTO DO TEMA\n\nÓtimo! Agora vamos trabalhar no tema da sua redação.\n\n💡 O QUE PRECISO SABER:\nMe conte qual é o tema ou proposta que você quer desenvolver. Pode ser de vestibular, concurso, ou um tema livre.\n\n✍️ EXEMPLO:\n"Quero escrever sobre os desafios da educação digital no Brasil"`,
      
      tese: `🎯 DEFINIÇÃO DA TESE\n\nPerfeito! Agora vamos definir sua tese (sua opinião sobre o tema).\n\n💡 O QUE PRECISO SABER:\nQual é sua posição sobre o tema? O que você defende?\n\n✍️ EXEMPLO:\n"Defendo que a educação digital é essencial mas precisa de investimento público"`,
      
      introducao: `🎯 ESTRUTURAÇÃO DA INTRODUÇÃO\n\nExcelente! Agora vamos construir sua introdução.\n\n💡 O QUE PRECISO SABER:\nVamos criar um parágrafo que apresente o tema, mostre sua importância e termine com sua tese.\n\n✍️ ESTRUTURA:\nContextualização + Problematização + Tese`,
      
      desenvolvimento1: `🎯 PRIMEIRO ARGUMENTO\n\nÓtimo! Agora vamos desenvolver seu primeiro argumento.\n\n💡 O QUE PRECISO SABER:\nQual é o primeiro argumento que você quer usar para defender sua tese?\n\n✍️ DICA:\nPense em dados, exemplos, ou causas que justifiquem sua opinião.`,
      
      desenvolvimento2: `🎯 SEGUNDO ARGUMENTO\n\nPerfeito! Agora vamos ao segundo argumento.\n\n💡 O QUE PRECISO SABER:\nQual é outro argumento diferente do primeiro que você quer usar?\n\n✍️ DICA:\nPode ser uma consequência, comparação, ou outra perspectiva do problema.`,
      
      conclusao: `🎯 CONCLUSÃO\n\nQuase lá! Agora vamos fechar sua redação.\n\n💡 O QUE PRECISO SABER:\nComo você quer concluir? Quer propor soluções ou fazer uma síntese?\n\n✍️ ESTRUTURA:\nRetomada da tese + Síntese dos argumentos + Proposta/Reflexão final`,
      
      finalizacao: `🎯 FINALIZAÇÃO\n\n🎉 PARABÉNS! Você completou todas as seções da sua redação!\n\n✅ SUA ESTRUTURA ESTÁ PRONTA:\n• Tema definido\n• Tese estabelecida\n• Introdução estruturada\n• Argumentos desenvolvidos\n• Conclusão elaborada\n\n🗺️ PRÓXIMO PASSO:\nAgora você pode criar o mapa mental para visualizar sua estrutura completa!`
    };

    return messages[section as keyof typeof messages] || 'Vamos continuar desenvolvendo sua redação!';
  };

  // Também processar mensagens do usuário
  const processUserMessage = (userMessage: string, section: string) => {
    // Persistir o conteúdo da mensagem do usuário na seção atual
    persistContentToSection(userMessage, section);
  };

  // Função para recomeçar a conversa
  const handleRestartConversation = () => {
    // Resetar estado do brainstorm
    setBrainstormData({
      tema: '',
      tese: '',
      paragrafos: {
        introducao: '',
        desenvolvimento1: '',
        desenvolvimento2: '',
        conclusao: ''
      },
      repertorios: [],
      conectivos: []
    });

    // Resetar estado do chat para seção inicial e limpar conversationId
    setChatState(prev => ({
      ...prev,
      conversationId: null,
      currentSection: 'tema',
      currentMessage: '',
      isLoading: false,
      messages: []
    }));

    // Remover conversationId do localStorage para garantir nova conversa
    localStorage.removeItem('argumentos-conversation-id');

    // Adicionar mensagem de boas-vindas novamente
    setTimeout(() => {
      const welcomeMessage = {
        id: 'welcome_restart',
        type: 'ai' as const,
        content: `🎯 REFINAMENTO DO BRAINSTORMING

✨ DESENVOLVA SUA REDAÇÃO COM AJUDA DA IA
Chat inteligente para estruturação argumentativa

💡 O QUE EU FAÇO POR VOCÊ:
• Desenvolvo sua tese principal de forma estruturada
• Construo argumentos sólidos com fundamentação
• Organizo parágrafos de introdução, desenvolvimento e conclusão
• Sugiro repertórios culturais relevantes para seu tema
• Refino sua linguagem argumentativa

🏗️ COMO FUNCIONA:
1️⃣ Você me conta o tema da redação
2️⃣ Desenvolvemos juntos sua tese principal
3️⃣ Construímos argumentos persuasivos
4️⃣ Estruturamos cada parágrafo
5️⃣ Geramos um mapa mental completo

📝 VAMOS COMEÇAR
Compartilhe comigo o tema da sua redação (proposta de vestibular, tema social, concurso público, etc.) para iniciarmos a construção dos seus argumentos!`,
        section: 'tema' as const,
        timestamp: new Date()
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [welcomeMessage]
      }));
    }, 100);
  };

  // Enviar mensagem
  const handleSendMessage = (event?: React.FormEvent) => {
    // Prevenir comportamento padrão que pode causar scroll
    if (event) {
      event.preventDefault();
    }

    if (!chatState.currentMessage.trim() || chatState.isLoading) return;

    const currentMessage = chatState.currentMessage;
    const currentSection = chatState.currentSection;

    // Processar mensagem do usuário para extração de dados
    processUserMessage(currentMessage, currentSection);

    // Adicionar mensagem do usuário
    const messageId = Date.now().toString() + '_user';
    const userMessage = {
      id: messageId,
      type: 'user' as const,
      content: currentMessage,
      section: currentSection,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentMessage: '',
      isLoading: true
    }));

    // Enviar para IA com conversationId e messageId
    sendMessageMutation.mutate({
      conversationId: chatState.conversationId,
      messageId: messageId,
      message: currentMessage,
      section: currentSection,
      context: {
        proposta: brainstormData.tema,
        tese: brainstormData.tese,
        paragrafos: brainstormData.paragrafos
      }
    });
  };

  // Calcular progresso
  const calculateProgress = () => {
    let completed = 0;
    const total = 6;
    
    if (brainstormData.tema) completed++;
    if (brainstormData.tese) completed++;
    if (brainstormData.paragrafos.introducao) completed++;
    if (brainstormData.paragrafos.desenvolvimento1) completed++;
    if (brainstormData.paragrafos.desenvolvimento2) completed++;
    if (brainstormData.paragrafos.conclusao) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Verificar se todos os pontos da redação foram preenchidos
  const isEssayComplete = () => {
    return brainstormData.tema.trim() !== '' &&
           brainstormData.tese.trim() !== '' &&
           brainstormData.paragrafos.introducao.trim() !== '' &&
           brainstormData.paragrafos.desenvolvimento1.trim() !== '' &&
           brainstormData.paragrafos.desenvolvimento2.trim() !== '' &&
           brainstormData.paragrafos.conclusao.trim() !== '';
  };

  // Ver conversa organizada no visualizador
  const handleViewConversation = () => {
    // Salvar dados da conversa atual para o visualizador
    const conversationData = {
      conversationId: chatState.conversationId || 'session-' + Date.now(),
      messages: chatState.messages,
      currentSection: chatState.currentSection,
      brainstormData: brainstormData,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('conversationData', JSON.stringify(conversationData));
    window.location.href = '/mapa-mental';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button
              onClick={() => setLocation('/functionalities')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-back"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Brain className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Refinamento do Brainstorming</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={() => setLocation('/functionalities')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Brain className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Refinamento do Brainstorming</h1>
              </div>
            </div>
            <p className="text-soft-gray">Desenvolva sua estrutura argumentativa com IA</p>
          </div>
        </div>
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1 sm:py-1.5">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-3 pt-24 sm:pt-28">
        <div className="flex flex-col gap-2 h-[calc(100vh-4rem)] sm:h-auto">
          
          {/* Chat Principal - Altura Adaptável - Maior em Mobile */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 min-h-[calc(100vh-12rem)] sm:min-h-0 py-4 sm:py-6">
            <div className="flex flex-col h-[calc(100vh-14rem)] sm:h-[32rem]">
              {/* Header do Chat - Compacto no Mobile */}
              <div className="flex items-center justify-between pb-1.5 sm:pb-3 border-b border-bright-blue/20">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={12} />
                  </div>
                  <h3 className="text-xs font-semibold text-dark-blue">Refinador Brainstorming IA</h3>
                </div>
                <Button
                  onClick={handleRestartConversation}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs border-bright-blue/20 text-bright-blue hover:bg-bright-blue/10"
                  data-testid="button-restart-conversation"
                >
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">Nova Conversa</span>
                </Button>
              </div>

              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto py-1.5 sm:py-3 space-y-1.5 sm:space-y-3 scroll-smooth overscroll-contain" 
                data-testid="chat-messages"
                style={{ scrollBehavior: 'smooth' }}
              >
                {chatState.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`} data-message-id={message.id}>
                    <div className={`max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-bright-blue to-dark-blue text-white ml-4 sm:ml-12' 
                        : 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/40 backdrop-blur-sm text-slate-700 mr-4 sm:mr-12'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2 text-xs text-bright-blue">
                          <Brain size={12} />
                          <span>Refinador Brainstorming IA</span>
                        </div>
                      )}
                      <div className="text-[11px] leading-relaxed">{processMarkdown(message.content)}</div>
                      <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-soft-gray'}`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatState.isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-4 py-3 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/40 backdrop-blur-sm text-slate-700 mr-12">
                      <div className="flex items-center space-x-2 mb-2 text-xs text-bright-blue">
                        <Brain size={12} />
                        <span>Refinador Brainstorming IA</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bright-blue"></div>
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-bright-blue/20 pt-3">
                <div className="flex space-x-3">
                  <Input
                    value={chatState.currentMessage}
                    onChange={(e) => setChatState(prev => ({ ...prev, currentMessage: e.target.value }))}
                    placeholder="Digite sua mensagem para o Refinador Brainstorming IA..."
                    className="flex-1 border-bright-blue/20 focus:border-bright-blue"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={chatState.isLoading}
                    data-testid="input-chat-message"
                  />
                  
                  {/* Botão de Ajuda com Guia para a Seção Atual */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-bright-blue/20 text-bright-blue hover:bg-bright-blue/10"
                        data-testid="button-help-guidance"
                      >
                        <HelpCircle size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-dark-blue flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-bright-blue" />
                          Guia para: {chatState.currentSection.charAt(0).toUpperCase() + chatState.currentSection.slice(1)}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {getSectionGuidanceMessage(chatState.currentSection)}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    disabled={!chatState.currentMessage.trim() || chatState.isLoading}
                    className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue"
                    data-testid="button-send-message"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Progresso da Construção - Organizado e Visível */}
          <LiquidGlassCard className="bg-gradient-to-r from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="space-y-2">
              {/* Header com título e porcentagem */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-dark-blue text-sm">Progresso da Redação</h4>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-bold text-dark-blue">{calculateProgress()}%</div>
                  <div className="text-xs text-soft-gray">Completo</div>
                </div>
              </div>
              
              {/* Barra de progresso visual */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-bright-blue to-dark-blue h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              
              {/* Indicadores de etapas detalhadas */}
              <div className="grid grid-cols-6 gap-1.5">
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.tema ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[9px] text-dark-blue text-center">Tema</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.tese ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[9px] text-dark-blue text-center">Tese</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.paragrafos.introducao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[9px] text-dark-blue text-center">Introdução</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.paragrafos.desenvolvimento1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[9px] text-dark-blue text-center">Desenv. 1</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.paragrafos.desenvolvimento2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[9px] text-dark-blue text-center">Desenv. 2</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.paragrafos.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[9px] text-dark-blue text-center">Conclusão</span>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Preview da Estrutura - Mobile Otimizado */}
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center space-x-3">
                <Eye className="text-bright-blue" size={20} />
                <h3 className="text-base font-semibold text-dark-blue">Preview da Estrutura</h3>
              </div>
              <Button 
                onClick={handleViewConversation}
                disabled={chatState.messages.length <= 1}
                className={`text-sm ${
                  chatState.messages.length > 1
                    ? "bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } px-4 py-2.5`}
                data-testid="button-view-conversation"
              >
                <Map className="mr-2" size={16} />
                {chatState.messages.length > 1 ? "Ver Histórico" : "Inicie uma Conversa"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tema */}
              <div className="bg-white/60 rounded-xl p-4 border border-bright-blue/20 min-h-[120px] flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className={`w-5 h-5 ${brainstormData.tema ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-dark-blue">Tema</span>
                </div>
                <div className="text-xs text-soft-gray leading-relaxed flex-1 overflow-hidden">
                  {brainstormData.tema || 'Aguardando definição do tema da redação...'}
                </div>
              </div>

              {/* Tese */}
              <div className="bg-white/60 rounded-xl p-4 border border-bright-blue/20 min-h-[120px] flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <Lightbulb className={`w-5 h-5 ${brainstormData.tese ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-dark-blue">Tese</span>
                </div>
                <div className="text-xs text-soft-gray leading-relaxed flex-1 overflow-hidden">
                  {brainstormData.tese || 'Aguardando desenvolvimento da tese principal...'}
                </div>
              </div>

              {/* Introdução */}
              <div className="bg-white/60 rounded-xl p-4 border border-bright-blue/20 min-h-[120px] flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle2 className={`w-5 h-5 ${brainstormData.paragrafos.introducao ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-dark-blue">Introdução</span>
                </div>
                <div className="text-xs text-soft-gray leading-relaxed flex-1 overflow-hidden">
                  {brainstormData.paragrafos.introducao || 'Aguardando desenvolvimento da introdução...'}
                </div>
              </div>

              {/* Desenvolvimento I */}
              <div className="bg-white/60 rounded-xl p-4 border border-bright-blue/20 min-h-[120px] flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle2 className={`w-5 h-5 ${brainstormData.paragrafos.desenvolvimento1 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-dark-blue">Desenvolvimento I</span>
                </div>
                <div className="text-xs text-soft-gray leading-relaxed flex-1 overflow-hidden">
                  {brainstormData.paragrafos.desenvolvimento1 || 'Aguardando primeiro argumento...'}
                </div>
              </div>

              {/* Desenvolvimento II */}
              <div className="bg-white/60 rounded-xl p-4 border border-bright-blue/20 min-h-[120px] flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle2 className={`w-5 h-5 ${brainstormData.paragrafos.desenvolvimento2 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-dark-blue">Desenvolvimento II</span>
                </div>
                <div className="text-xs text-soft-gray leading-relaxed flex-1 overflow-hidden">
                  {brainstormData.paragrafos.desenvolvimento2 || 'Aguardando segundo argumento...'}
                </div>
              </div>

              {/* Conclusão */}
              <div className="bg-white/60 rounded-xl p-4 border border-bright-blue/20 min-h-[120px] flex flex-col">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle2 className={`w-5 h-5 ${brainstormData.paragrafos.conclusao ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-dark-blue">Conclusão</span>
                </div>
                <div className="text-xs text-soft-gray leading-relaxed flex-1 overflow-hidden">
                  {brainstormData.paragrafos.conclusao || 'Aguardando desenvolvimento da conclusão...'}
                </div>
              </div>
            </div>
          </LiquidGlassCard>


        </div>
      </div>
    </div>
  );
}