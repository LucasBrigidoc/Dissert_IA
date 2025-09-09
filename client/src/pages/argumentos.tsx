import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Brain, MessageSquare, Plus, Trash2, Save, Download, Map } from "lucide-react";
import { useLocation } from "wouter";

export default function Argumentos() {
  const [location] = useLocation();
  const [backUrl, setBackUrl] = useState('/dashboard');
  const [showMindMap, setShowMindMap] = useState(false);
  const [isOptimizingIdea, setIsOptimizingIdea] = useState(false);
  const [brainstormData, setBrainstormData] = useState({
    tema: '',
    tese: '',
    paragrafos: {
      introducao: '',
      desenvolvimento1: '',
      desenvolvimento2: '',
      conclusao: ''
    }
  });
  const [chatStates, setChatStates] = useState({
    introducao: { 
      messages: [] as Array<{id: number, type: string, content: string}>, 
      currentMessage: '',
      isOpen: false
    },
    desenvolvimento1: { 
      messages: [] as Array<{id: number, type: string, content: string}>, 
      currentMessage: '',
      isOpen: false
    },
    desenvolvimento2: { 
      messages: [] as Array<{id: number, type: string, content: string}>, 
      currentMessage: '',
      isOpen: false
    },
    conclusao: { 
      messages: [] as Array<{id: number, type: string, content: string}>, 
      currentMessage: '',
      isOpen: false
    }
  });
  
  useEffect(() => {
    // Detectar página de origem através de múltiplas fontes
    const detectPreviousPage = () => {
      // 1. Verificar parâmetro 'from' na URL
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get('from');
      
      if (fromParam === 'functionalities') {
        return '/functionalities';
      }
      
      // 2. Verificar o referrer do documento
      if (document.referrer) {
        const referrerUrl = new URL(document.referrer);
        const referrerPath = referrerUrl.pathname;
        
        if (referrerPath === '/functionalities') {
          return '/functionalities';
        }
        if (referrerPath === '/dashboard') {
          return '/dashboard';
        }
      }
      
      // 3. Padrão
      return '/dashboard';
    };
    
    const detectedUrl = detectPreviousPage();
    setBackUrl(detectedUrl);
  }, []);

  const handleGenerateMindMap = () => {
    // Verificar se há dados suficientes para gerar o mapa mental
    if (!brainstormData.tema || !brainstormData.tese) {
      alert('Por favor, preencha pelo menos a proposta e a tese antes de gerar o mapa mental.');
      return;
    }
    setShowMindMap(true);
  };

  const handleOptimizeIdea = async () => {
    setIsOptimizingIdea(true);
    
    try {
      // Definir o tipo de mensagem baseado no conteúdo disponível
      let message = '';
      if (!brainstormData.tema && !brainstormData.tese) {
        message = 'Não sei por onde começar a escrever minha ideia do texto. Como posso criar uma boa ideia para uma redação argumentativa?';
      } else if (brainstormData.tema && !brainstormData.tese) {
        message = `Tenho a proposta "${brainstormData.tema}" mas não sei como formular minha ideia do texto. Me ajude a criar uma ideia clara e argumentativa sobre este tema.`;
      } else if (!brainstormData.tema && brainstormData.tese) {
        message = `Tenho esta ideia: "${brainstormData.tese}". Como posso melhorá-la e torná-la mais específica e argumentativa?`;
      } else {
        message = `Analise e otimize minha ideia do texto: "${brainstormData.tese}". Sugira melhorias para torná-la mais clara, específica e argumentativa. Mantenha a essência da minha ideia, mas aprimore a formulação.`;
      }

      const response = await fetch('/api/chat/argumentative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          section: 'optimization',
          context: {
            proposta: brainstormData.tema,
            tese: brainstormData.tese,
            paragrafos: brainstormData.paragrafos
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de consultas de IA atingido. Tente novamente em uma hora.');
        }
        throw new Error('Erro ao conectar com a IA');
      }

      const data = await response.json();
      
      // Se há uma ideia para otimizar, perguntar se quer aplicar
      if (brainstormData.tese) {
        const shouldApply = confirm(
          `Sugestão da IA:\n\n${data.response}\n\n` +
          `Deseja aplicar esta otimização à sua ideia do texto?`
        );
        
        if (shouldApply) {
          const optimizedText = extractOptimizedText(data.response);
          if (optimizedText) {
            setBrainstormData(prev => ({...prev, tese: optimizedText}));
          }
        }
      } else {
        // Se não há ideia ainda, apenas mostrar as orientações
        alert(`Orientações da IA:\n\n${data.response}`);
      }
      
    } catch (error: any) {
      console.error('Optimization error:', error);
      alert(`Erro ao obter ajuda: ${error.message || 'Tente novamente.'}`);
    } finally {
      setIsOptimizingIdea(false);
    }
  };

  const extractOptimizedText = (aiResponse: string): string | null => {
    // Tentar extrair a versão otimizada da resposta da IA
    // Procurar por padrões como "Versão otimizada:", "Sugestão:", etc.
    const patterns = [
      /(?:versão otimizada|sugestão melhorada|ideia aprimorada):\s*"([^"]+)"/i,
      /(?:recomendo|sugiro):\s*"([^"]+)"/i,
      /"([^"]+)"/g
    ];
    
    for (const pattern of patterns) {
      const match = aiResponse.match(pattern);
      if (match && match[1] && match[1].length > 20) {
        return match[1].trim();
      }
    }
    
    return null;
  };
  
  const sendMessageToSection = async (section: string) => {
    const currentChat = chatStates[section as keyof typeof chatStates];
    const currentMessage = currentChat.currentMessage.trim();
    if (!currentMessage) return;
    
    // Clear input immediately for better UX
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage
    };
    
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: '🤔 Analisando seu texto e preparando sugestões...'
    };
    
    // Single state update with user message, cleared input, and loading message
    setChatStates(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        currentMessage: '', // Clear input immediately
        messages: [...prev[section as keyof typeof prev].messages, userMessage, loadingMessage]
      }
    }));
    
    try {
      // Send request to AI API with context
      const response = await fetch('/api/chat/argumentative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          section,
          context: {
            proposta: brainstormData.tema,
            tese: brainstormData.tese,
            paragrafos: brainstormData.paragrafos
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de consultas de IA atingido. Tente novamente em uma hora.');
        }
        throw new Error('Erro ao conectar com a IA');
      }

      const data = await response.json();
      
      // Replace loading message with actual AI response
      const aiResponse = {
        id: Date.now() + 2,
        type: 'ai',
        content: data.response
      };
      
      setChatStates(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          messages: prev[section as keyof typeof prev].messages.map(msg => 
            msg.id === loadingMessage.id ? aiResponse : msg
          )
        }
      }));
      
    } catch (error: any) {
      console.error('AI Chat error:', error);
      
      // Replace loading message with error message
      const errorMessage = {
        id: Date.now() + 3,
        type: 'ai',
        content: `❌ ${error.message || 'Erro ao gerar resposta. Tente novamente.'}`
      };
      
      setChatStates(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          messages: prev[section as keyof typeof prev].messages.map(msg => 
            msg.id === loadingMessage.id ? errorMessage : msg
          )
        }
      }));
    }
  };
  
  const updateChatMessage = (section: string, message: string) => {
    setChatStates(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        currentMessage: message
      }
    }));
  };

  const toggleChat = (section: string) => {
    setChatStates(prev => {
      const currentChat = prev[section as keyof typeof prev];
      const isOpening = !currentChat.isOpen;
      
      // Add initial welcome message when opening chat for the first time
      let updatedMessages = currentChat.messages;
      if (isOpening && currentChat.messages.length === 0) {
        const welcomeMessages = {
          introducao: '👋 **Olá! Vamos trabalhar juntos na sua introdução!**\n\n🎯 Posso te ajudar com:\n• Estrutura da introdução (contextualização → problematização → tese)\n• Sugestões de dados e estatísticas\n• Conectivos e transições\n• Revisar o que você já escreveu\n\n💬 **Me conte:** que dúvida você tem sobre a introdução? Ou me mostre o que já escreveu para eu dar dicas!',
          desenvolvimento1: '👋 **Oi! Vamos construir seu primeiro argumento juntos!**\n\n🎯 Posso te ajudar com:\n• Estrutura do parágrafo (tópico frasal → fundamentação → exemplos → conclusão)\n• Sugestões de exemplos e dados\n• Conectivos argumentativos\n• Conexão com sua tese\n\n💬 **Me conte:** qual argumento você quer desenvolver? Ou me mostre o que já escreveu para eu te dar sugestões!',
          desenvolvimento2: '👋 **Vamos trabalhar no seu segundo argumento!**\n\n🎯 Posso te ajudar com:\n• Criar um argumento complementar ao primeiro\n• Variar tipos de exemplos (históricos, atuais, científicos)\n• Conectivos de progressão argumentativa\n• Manter coesão textual\n\n💬 **Me conte:** que perspectiva diferente você quer explorar? Ou me mostre o que já escreveu para eu dar dicas!',
          conclusao: '👋 **Vamos criar uma conclusão impactante!**\n\n🎯 Posso te ajudar com:\n• Estrutura da conclusão (retomada → síntese → proposta)\n• Criar proposta de intervenção detalhada\n• Conectivos conclusivos\n• Amarrar todos os argumentos\n\n💬 **Me conte:** que solução você pensa para o problema? Ou me mostre o que já escreveu para eu aperfeiçoar!'
        };
        
        updatedMessages = [{
          id: Date.now(),
          type: 'ai',
          content: welcomeMessages[section as keyof typeof welcomeMessages]
        }];
      }
      
      return {
        ...prev,
        [section]: {
          ...currentChat,
          isOpen: isOpening,
          messages: updatedMessages
        }
      };
    });
  };
  

  const ChatMini = ({ section, title }: { section: string, title: string }) => {
    const chatData = chatStates[section as keyof typeof chatStates];
    const hasRequiredContext = brainstormData.tema.trim() && brainstormData.tese.trim();
    
    return (
      <div className="mt-4">
        {/* Texto explicativo sobre a funcionalidade de IA */}
        <div className="mb-2 text-xs text-soft-gray bg-gray-50 p-2 rounded-lg border border-gray-200">
          <span className="font-medium">💡 Assistente de IA:</span> 
          {hasRequiredContext 
            ? " Clique no botão abaixo para conversar com a IA e receber sugestões personalizadas para esta seção da sua redação."
            : " Complete a proposta e tese primeiro para liberar a IA que te ajudará a desenvolver cada parágrafo."
          }
        </div>
        
        <Button
          onClick={() => hasRequiredContext ? toggleChat(section) : null}
          variant="outline"
          disabled={!hasRequiredContext}
          className={`w-full justify-start text-left transition-all duration-200 ${
            hasRequiredContext 
              ? 'border-bright-blue/40 text-bright-blue hover:bg-bright-blue/5 hover:border-bright-blue/60' 
              : 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400'
          }`}
          title={!hasRequiredContext ? 'Preencha a proposta e tese primeiro para ativar a IA' : 'Clique para conversar com a IA'}
        >
          <MessageSquare size={14} className={`mr-2 ${hasRequiredContext ? 'text-bright-blue' : 'text-gray-400'}`} />
          {hasRequiredContext 
            ? (chatData.isOpen ? 'Fechar chat com IA' : 'Conversar com IA sobre ' + title)
            : 'IA: Complete proposta e tese primeiro'
          }
        </Button>
        
        {chatData.isOpen && (
          <LiquidGlassCard className="mt-3 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            {/* Messages Area */}
            <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
              {chatData.messages.map((message: any) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-sm px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user' 
                      ? 'bg-bright-blue text-white' 
                      : 'bg-gray-100 text-dark-blue'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="flex space-x-2 items-end">
              <Textarea
                value={chatData.currentMessage}
                onChange={(e) => {
                  const newValue = e.target.value;
                  updateChatMessage(section, newValue);
                  
                  // Optimized auto-resize with debouncing
                  requestAnimationFrame(() => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    const newHeight = Math.min(Math.max(40, target.scrollHeight), 128);
                    target.style.height = newHeight + 'px';
                  });
                }}
                placeholder="Digite sua mensagem..."
                className="flex-1 border-bright-blue/20 focus:border-bright-blue text-sm resize-none min-h-[40px] max-h-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessageToSection(section);
                  }
                }}
                autoFocus={chatData.isOpen}
                style={{
                  minHeight: '40px',
                  maxHeight: '128px',
                }}
              />
              <Button 
                onClick={() => sendMessageToSection(section)}
                size="sm"
                className="bg-gradient-to-r from-bright-blue to-dark-blue h-10"
              >
                <MessageSquare size={14} />
              </Button>
            </div>
          </LiquidGlassCard>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  if (window.history.length > 1 && document.referrer) {
                    window.history.back();
                  } else {
                    window.location.href = backUrl;
                  }
                }}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200 border border-soft-gray/20 hover:border-bright-blue/30 text-xs h-8" 
                data-testid="button-back"
              >
                <ArrowLeft size={14} />
                <span className="font-medium">Voltar</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Brain className="text-white" size={14} />
              </div>
            </div>
            <h1 className="text-sm font-bold text-dark-blue truncate">Brainstorming</h1>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (window.history.length > 1 && document.referrer) {
                    window.history.back();
                  } else {
                    window.location.href = backUrl;
                  }
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200 border border-soft-gray/20 hover:border-bright-blue/30" 
                data-testid="button-back"
              >
                <ArrowLeft size={14} />
                <span className="text-sm font-medium">Voltar</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Brain className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Refinamento do Brainstorming</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Brainstorming com IA para construção de redação
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pt-16 sm:pt-24">
        <div className="grid gap-6">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Tema e Tese */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Proposta e Tese</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Proposta</label>
                  <Input
                    value={brainstormData.tema}
                    onChange={(e) => setBrainstormData(prev => ({...prev, tema: e.target.value}))}
                    placeholder="Ex: A proposta de redução da violência urbana"
                    className="border-bright-blue/20 focus:border-bright-blue"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-dark-blue">Ideia do texto</label>
                    <Button
                      onClick={handleOptimizeIdea}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 border-bright-blue/40 text-bright-blue hover:bg-bright-blue/5 hover:border-bright-blue/60"
                      disabled={isOptimizingIdea}
                    >
                      {isOptimizingIdea ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-bright-blue mr-1"></div>
                          <span>Otimizando...</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-1">✨</span>
                          <span>{brainstormData.tese ? 'Otimizar com IA' : 'Ajuda da IA'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={brainstormData.tese}
                    onChange={(e) => setBrainstormData(prev => ({...prev, tese: e.target.value}))}
                    placeholder="Descreva a ideia principal do que você planeja escrever..."
                    className="border-bright-blue/20 focus:border-bright-blue h-20"
                  />
                  <p className="text-xs text-soft-gray mt-1">
                    💡 {brainstormData.tese 
                      ? 'Clique em "Otimizar com IA" para melhorar sua ideia'
                      : 'Clique em "Ajuda da IA" para receber orientações sobre como começar'}
                  </p>
                </div>
              </div>
            </LiquidGlassCard>

            

            {/* Estrutura dos Parágrafos */}
            <div className="space-y-4">
              {/* Introdução */}
              <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">1. Introdução</h3>
                <p className="text-soft-gray text-sm mb-3">Apresentação do tema, contextualização e tese</p>
                <Textarea
                  value={brainstormData.paragrafos.introducao}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, introducao: e.target.value }
                  }))}
                  placeholder="Escreva sua introdução aqui..."
                  className="border-bright-blue/20 focus:border-bright-blue h-24"
                />
                <ChatMini section="introducao" title="introdução" />
              </LiquidGlassCard>

              {/* Desenvolvimento 1 */}
              <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-bright-blue/5 border-dark-blue/20">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">2. Desenvolvimento I</h3>
                <p className="text-soft-gray text-sm mb-3">Primeiro argumento com sustentação e exemplos</p>
                <Textarea
                  value={brainstormData.paragrafos.desenvolvimento1}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, desenvolvimento1: e.target.value }
                  }))}
                  placeholder="Desenvolva seu primeiro argumento..."
                  className="border-dark-blue/20 focus:border-dark-blue h-24"
                />
                <ChatMini section="desenvolvimento1" title="primeiro argumento" />
              </LiquidGlassCard>

              {/* Desenvolvimento 2 */}
              <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">3. Desenvolvimento II</h3>
                <p className="text-soft-gray text-sm mb-3">Segundo argumento com sustentação e exemplos</p>
                <Textarea
                  value={brainstormData.paragrafos.desenvolvimento2}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, desenvolvimento2: e.target.value }
                  }))}
                  placeholder="Desenvolva seu segundo argumento..."
                  className="border-soft-gray/20 focus:border-soft-gray h-24"
                />
                <ChatMini section="desenvolvimento2" title="segundo argumento" />
              </LiquidGlassCard>

              {/* Conclusão */}
              <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-soft-gray/5 border-bright-blue/20">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">4. Conclusão</h3>
                <p className="text-soft-gray text-sm mb-3">Síntese dos argumentos e proposta de intervenção</p>
                <Textarea
                  value={brainstormData.paragrafos.conclusao}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, conclusao: e.target.value }
                  }))}
                  placeholder="Escreva sua conclusão e proposta de intervenção..."
                  className="border-bright-blue/20 focus:border-bright-blue h-24"
                />
                <ChatMini section="conclusao" title="conclusão" />
              </LiquidGlassCard>
            </div>


            {/* Progress Bar - Mobile Optimized */}
            <LiquidGlassCard className="bg-gradient-to-r from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="space-y-3 sm:space-y-0">
                <h4 className="font-semibold text-dark-blue text-sm">Progresso do Brainstorming</h4>
                
                {/* Mobile: Grid Layout */}
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Tema</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.tema ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Ideia</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.tese ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Parágrafos</span>
                    <div className={`w-3 h-3 rounded-full ${Object.values(brainstormData.paragrafos).filter(p => p.trim()).length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Conclusão</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.paragrafos.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                
                {/* Desktop: Horizontal Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-dark-blue">Tema</span>
                      <div className={`w-3 h-3 rounded-full ${brainstormData.tema ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-dark-blue">Ideia</span>
                      <div className={`w-3 h-3 rounded-full ${brainstormData.tese ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-dark-blue">Parágrafos</span>
                      <div className={`w-3 h-3 rounded-full ${Object.values(brainstormData.paragrafos).filter(p => p.trim()).length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-dark-blue">Conclusão</span>
                      <div className={`w-3 h-3 rounded-full ${brainstormData.paragrafos.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Botão para Mapa Mental - Mobile Optimized */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="text-center py-4 sm:py-6">
                <Map size={40} className="text-bright-blue mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-2">Visualizar Mapa Mental</h3>
                <p className="text-soft-gray mb-4 text-sm sm:text-base px-2">
                  Organize suas ideias visualmente em um mapa mental interativo
                </p>
                <Button 
                  onClick={handleGenerateMindMap}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue w-full sm:w-auto text-sm sm:text-base"
                >
                  <Map className="mr-2" size={14} />
                  <span className="hidden sm:inline">Gerar Mapa Mental</span>
                  <span className="sm:hidden">Gerar Mapa</span>
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Resultado do Mapa Mental */}
            {showMindMap && (
              <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 border-bright-blue/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-dark-blue">Seu Mapa Mental</h3>
                  <Button 
                    onClick={() => setShowMindMap(false)}
                    variant="outline"
                    size="sm"
                    className="text-soft-gray hover:text-dark-blue"
                  >
                    Fechar
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Centro do Mapa - Proposta */}
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-bright-blue to-dark-blue text-white px-6 py-4 rounded-full text-lg font-semibold max-w-md">
                      {brainstormData.tema || 'Sua Proposta'}
                    </div>
                  </div>

                  {/* Tese */}
                  <div className="text-center">
                    <div className="bg-bright-blue/10 border border-bright-blue/20 rounded-lg p-4 max-w-2xl mx-auto">
                      <h4 className="font-semibold text-dark-blue mb-2">Tese Principal</h4>
                      <p className="text-soft-gray">{brainstormData.tese || 'Desenvolva sua tese aqui...'}</p>
                    </div>
                  </div>

                  {/* Estrutura dos Parágrafos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-blue/5 border border-dark-blue/20 rounded-lg p-4">
                      <h4 className="font-semibold text-dark-blue mb-2">1. Introdução</h4>
                      <p className="text-sm text-soft-gray">{brainstormData.paragrafos.introducao || 'Apresentação do tema...'}</p>
                    </div>
                    
                    <div className="bg-soft-gray/5 border border-soft-gray/20 rounded-lg p-4">
                      <h4 className="font-semibold text-dark-blue mb-2">2. Desenvolvimento I</h4>
                      <p className="text-sm text-soft-gray">{brainstormData.paragrafos.desenvolvimento1 || 'Primeiro argumento...'}</p>
                    </div>
                    
                    <div className="bg-bright-blue/5 border border-bright-blue/20 rounded-lg p-4">
                      <h4 className="font-semibold text-dark-blue mb-2">3. Desenvolvimento II</h4>
                      <p className="text-sm text-soft-gray">{brainstormData.paragrafos.desenvolvimento2 || 'Segundo argumento...'}</p>
                    </div>
                    
                    <div className="bg-dark-blue/5 border border-dark-blue/20 rounded-lg p-4">
                      <h4 className="font-semibold text-dark-blue mb-2">4. Conclusão</h4>
                      <p className="text-sm text-soft-gray">{brainstormData.paragrafos.conclusao || 'Síntese e proposta...'}</p>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-xs text-soft-gray">
                      Este mapa mental representa a estrutura da sua redação baseada nos dados preenchidos
                    </p>
                  </div>
                </div>
              </LiquidGlassCard>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
}