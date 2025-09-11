import { useState, useEffect, useRef } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Brain, Send, Map, Eye, BookOpen, Lightbulb, Target, CheckCircle2, Clock, Users, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Argumentos() {
  const [location] = useLocation();
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

  // Estado do chat principal unificado
  const [chatState, setChatState] = useState({
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

  // Scroll automático sempre que uma nova mensagem for enviada (usuário ou IA)
  useEffect(() => {
    if (chatState.messages.length > 0 && chatEndRef.current) {
      // Para garantir que o DOM foi totalmente renderizado antes do scroll
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (chatEndRef.current) {
            // Sempre rolar para baixo quando qualquer mensagem for enviada
            chatEndRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          }
        }, 100);
      });
    }
  }, [chatState.messages]);

  // Inicializar conversa
  useEffect(() => {
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

  // Mutation para enviar mensagem para a IA
  const sendMessageMutation = useMutation({
    mutationFn: async (data: {message: string, section: string, context: any}) => {
      return apiRequest('/api/chat/argumentative', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      // Adicionar resposta da IA ao chat
      const aiMessage = {
        id: Date.now().toString() + '_ai',
        type: 'ai' as const,
        content: data.response,
        section: data.section,
        timestamp: new Date()
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false
      }));

      // Atualizar dados conforme a conversa progride
      updateBrainstormFromChat(data.response, data.section);
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
    // Sempre tentar persistir algum conteúdo útil da conversa
    persistContentToSection(aiResponse, section);
    
    // Verificar se é hora de avançar para a próxima seção
    checkSectionProgression();
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

  // Extrair conteúdo relevante com múltiplas estratégias
  const extractRelevantContent = (content: string, section: string): string | null => {
    // 1. Tentar extrair citações ou sugestões diretas
    const quotedContent = content.match(/"([^"]{20,300})"/g);
    if (quotedContent && quotedContent.length > 0) {
      const bestQuote = quotedContent[0].replace(/"/g, '').trim();
      if (bestQuote.length > 15) return bestQuote;
    }

    // 2. Buscar por padrões específicos da seção
    const sectionPatterns = {
      tema: [/tema[:\s]*([^.\n]{15,150})/i, /proposta[:\s]*([^.\n]{15,150})/i],
      tese: [/tese[:\s]*([^.\n]{20,200})/i, /posicionamento[:\s]*([^.\n]{20,200})/i, /defendo que[:\s]*([^.\n]{20,200})/i],
      introducao: [/introdução[:\s]*([^.\n]{30,300})/i, /contextualização[:\s]*([^.\n]{30,300})/i],
      desenvolvimento1: [/primeiro[:\s]*([^.\n]{30,300})/i, /argumento[:\s]*([^.\n]{30,300})/i],
      desenvolvimento2: [/segundo[:\s]*([^.\n]{30,300})/i, /outro argumento[:\s]*([^.\n]{30,300})/i],
      conclusao: [/conclusão[:\s]*([^.\n]{30,300})/i, /fechamento[:\s]*([^.\n]{30,300})/i]
    };

    const patterns = sectionPatterns[section as keyof typeof sectionPatterns] || [];
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // 3. Fallback: pegar a primeira frase significativa
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 15 && firstSentence.length < 300) {
        return firstSentence;
      }
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

    // Resetar estado do chat para seção inicial
    setChatState(prev => ({
      ...prev,
      currentSection: 'tema',
      currentMessage: '',
      isLoading: false,
      messages: []
    }));

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
    const userMessage = {
      id: Date.now().toString() + '_user',
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

    // Enviar para IA
    sendMessageMutation.mutate({
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

  // Criar mapa mental em nova tela
  const handleCreateMindMap = () => {
    if (!isEssayComplete()) {
      return;
    }
    
    // Salvar dados atuais no localStorage para passar para a nova tela
    localStorage.setItem('mindMapData', JSON.stringify({
      tema: brainstormData.tema,
      tese: brainstormData.tese,
      paragrafos: brainstormData.paragrafos,
      timestamp: new Date().toISOString()
    }));
    
    // Navegar para tela do mapa mental
    window.location.href = '/mapa-mental';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  if (window.history.length > 1 && document.referrer) {
                    window.history.back();
                  } else {
                    window.location.href = backUrl;
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 h-8 px-2 text-xs"
                data-testid="button-back"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Brain className="text-white" size={14} />
              </div>
            </div>
            <h1 className="text-sm font-bold text-dark-blue truncate">Refinamento do Brainstorming</h1>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={() => {
                  if (window.history.length > 1 && document.referrer) {
                    window.history.back();
                  } else {
                    window.location.href = backUrl;
                  }
                }}
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
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-3 pt-16 sm:pt-20">
        <div className="flex flex-col gap-2">
          
          {/* Chat Principal - Altura Adaptável */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="flex flex-col h-[60vh] sm:h-[32rem]">
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
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-bright-blue to-dark-blue text-white ml-4 sm:ml-12' 
                        : 'bg-white border border-bright-blue/20 text-dark-blue mr-4 sm:mr-12'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2 text-xs text-bright-blue">
                          <Brain size={12} />
                          <span>Refinador Brainstorming IA</span>
                        </div>
                      )}
                      <div className="text-[11px] whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-soft-gray'}`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatState.isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-4 py-3 rounded-2xl bg-white border border-bright-blue/20 text-dark-blue mr-12">
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
              
              {/* Indicadores de etapas */}
              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.tema ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[10px] text-dark-blue text-center">Tema</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.tese ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[10px] text-dark-blue text-center">Tese</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${Object.values(brainstormData.paragrafos).filter(p => p.trim()).length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[10px] text-dark-blue text-center">Argumentos</span>
                </div>
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${brainstormData.paragrafos.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-[10px] text-dark-blue text-center">Conclusão</span>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Preview da Estrutura - Mobile Otimizado */}
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Eye className="text-bright-blue" size={16} />
                <h3 className="text-sm font-semibold text-dark-blue">Preview da Estrutura</h3>
              </div>
              <Button 
                onClick={handleCreateMindMap}
                disabled={!isEssayComplete()}
                className={`text-xs sm:text-sm ${
                  isEssayComplete() 
                    ? "bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                } px-3 py-2`}
                data-testid="button-create-mindmap"
              >
                <Map className="mr-1 sm:mr-2" size={14} />
                {isEssayComplete() ? "Criar Mapa" : "Incomplete"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Tema */}
              <div className="bg-white/50 rounded-lg p-2 border border-bright-blue/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className={`w-4 h-4 ${brainstormData.tema ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-dark-blue">Tema</span>
                </div>
                <p className="text-[10px] text-soft-gray leading-relaxed line-clamp-2">
                  {brainstormData.tema || 'Aguardando definição...'}
                </p>
              </div>

              {/* Tese */}
              <div className="bg-white/50 rounded-lg p-2 border border-bright-blue/10">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className={`w-4 h-4 ${brainstormData.tese ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-dark-blue">Tese</span>
                </div>
                <p className="text-[10px] text-soft-gray leading-relaxed line-clamp-2">
                  {brainstormData.tese || 'Aguardando desenvolvimento...'}
                </p>
              </div>

              {/* Introdução */}
              <div className="bg-white/50 rounded-lg p-2 border border-bright-blue/10">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className={`w-4 h-4 ${brainstormData.paragrafos.introducao ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-dark-blue">Introdução</span>
                </div>
                <p className="text-[10px] text-soft-gray leading-relaxed line-clamp-2">
                  {brainstormData.paragrafos.introducao || 'Aguardando desenvolvimento...'}
                </p>
              </div>

              {/* Desenvolvimento I */}
              <div className="bg-white/50 rounded-lg p-2 border border-bright-blue/10">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className={`w-4 h-4 ${brainstormData.paragrafos.desenvolvimento1 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-dark-blue">Dev I</span>
                </div>
                <p className="text-[10px] text-soft-gray leading-relaxed line-clamp-2">
                  {brainstormData.paragrafos.desenvolvimento1 || 'Aguardando argumento...'}
                </p>
              </div>

              {/* Desenvolvimento II */}
              <div className="bg-white/50 rounded-lg p-2 border border-bright-blue/10">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className={`w-4 h-4 ${brainstormData.paragrafos.desenvolvimento2 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-dark-blue">Dev II</span>
                </div>
                <p className="text-[10px] text-soft-gray leading-relaxed line-clamp-2">
                  {brainstormData.paragrafos.desenvolvimento2 || 'Aguardando argumento...'}
                </p>
              </div>

              {/* Conclusão */}
              <div className="bg-white/50 rounded-lg p-2 border border-bright-blue/10">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 className={`w-4 h-4 ${brainstormData.paragrafos.conclusao ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-dark-blue">Conclusão</span>
                </div>
                <p className="text-[10px] text-soft-gray leading-relaxed line-clamp-2">
                  {brainstormData.paragrafos.conclusao || 'Aguardando desenvolvimento...'}
                </p>
              </div>
            </div>
          </LiquidGlassCard>


        </div>
      </div>
    </div>
  );
}