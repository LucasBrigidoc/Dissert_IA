import { useState, useEffect, useRef } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Brain, Send, Map, Eye, BookOpen, Lightbulb, Target, CheckCircle2, Clock, Users } from "lucide-react";
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
  const queryClient = useQueryClient();

  // Scroll automático para o final do chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Inicializar conversa
  useEffect(() => {
    if (chatState.messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai' as const,
        content: '🎯 Olá! Sou sua assistente pedagógica e vou te ajudar a construir uma redação incrível passo a passo!\\n\\n📝 Vamos começar entendendo sobre o que você quer escrever. Qual é o tema ou proposta de redação que você gostaria de desenvolver?\\n\\n💡 *Dica: Você pode me contar sobre um tema do vestibular, uma questão social que te interessa, ou qualquer assunto sobre o qual gostaria de argumentar.*',
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

  // Atualizar brainstorm baseado na conversa
  const updateBrainstormFromChat = (aiResponse: string, section: string) => {
    // Lógica para extrair e atualizar dados estruturais baseado na conversa
    // Por enquanto, mantém estrutura básica
  };

  // Enviar mensagem
  const handleSendMessage = () => {
    if (!chatState.currentMessage.trim() || chatState.isLoading) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now().toString() + '_user',
      type: 'user' as const,
      content: chatState.currentMessage,
      section: chatState.currentSection,
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
      message: chatState.currentMessage,
      section: chatState.currentSection,
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

  // Gerar mapa mental
  const handleGenerateMindMap = () => {
    setShowMindMap(!showMindMap);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
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
            <div className="text-sm text-soft-gray flex items-center space-x-4">
              <span>Progresso: {calculateProgress()}%</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-bright-blue to-dark-blue rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 pt-24">
        <div className="grid gap-6">
          
          {/* Chat Principal - Largura Total */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="flex flex-col h-96">
              {/* Header do Chat */}
              <div className="flex items-center justify-between pb-4 border-b border-bright-blue/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={14} />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-blue">Assistente Pedagógica de Redação</h3>
                </div>
                <div className="flex items-center space-x-2 text-sm text-soft-gray">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4" data-testid="chat-messages">
                {chatState.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl px-4 py-3 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-bright-blue to-dark-blue text-white ml-12' 
                        : 'bg-white border border-bright-blue/20 text-dark-blue mr-12'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2 text-xs text-bright-blue">
                          <Brain size={12} />
                          <span>Assistente Pedagógica</span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
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
                        <span>Assistente Pedagógica</span>
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
              <div className="border-t border-bright-blue/20 pt-4">
                <div className="flex space-x-3">
                  <Input
                    value={chatState.currentMessage}
                    onChange={(e) => setChatState(prev => ({ ...prev, currentMessage: e.target.value }))}
                    placeholder="Digite sua mensagem para a assistente pedagógica..."
                    className="flex-1 border-bright-blue/20 focus:border-bright-blue"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={chatState.isLoading}
                    data-testid="input-chat-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
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

          {/* Preview em Tempo Real - Abaixo do Chat */}
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Estrutura da Redação */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="text-bright-blue" size={20} />
                <h3 className="text-lg font-semibold text-dark-blue">Preview da Estrutura</h3>
              </div>
              
              <div className="space-y-4">
                {/* Tema */}
                <div className="bg-white/50 rounded-lg p-3 border border-bright-blue/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className={`w-4 h-4 ${brainstormData.tema ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-dark-blue">Tema</span>
                  </div>
                  <p className="text-sm text-soft-gray">
                    {brainstormData.tema || 'Aguardando definição do tema...'}
                  </p>
                </div>

                {/* Tese */}
                <div className="bg-white/50 rounded-lg p-3 border border-bright-blue/10">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className={`w-4 h-4 ${brainstormData.tese ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-dark-blue">Tese Principal</span>
                  </div>
                  <p className="text-sm text-soft-gray">
                    {brainstormData.tese || 'Aguardando desenvolvimento da tese...'}
                  </p>
                </div>

                {/* Parágrafos */}
                {Object.entries(brainstormData.paragrafos).map(([key, value], index) => (
                  <div key={key} className="bg-white/50 rounded-lg p-3 border border-soft-gray/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className={`w-4 h-4 ${value ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-dark-blue">
                        {index + 1}. {
                          key === 'introducao' ? 'Introdução' :
                          key === 'desenvolvimento1' ? 'Desenvolvimento I' :
                          key === 'desenvolvimento2' ? 'Desenvolvimento II' :
                          'Conclusão'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-soft-gray">
                      {value || `Aguardando desenvolvimento ${
                        key === 'introducao' ? 'da introdução' :
                        key === 'desenvolvimento1' ? 'do primeiro argumento' :
                        key === 'desenvolvimento2' ? 'do segundo argumento' :
                        'da conclusão'
                      }...`}
                    </p>
                  </div>
                ))}
              </div>
            </LiquidGlassCard>

            {/* Mapa Mental */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Map className="text-bright-blue" size={20} />
                  <h3 className="text-lg font-semibold text-dark-blue">Mapa Mental</h3>
                </div>
                <Button 
                  onClick={handleGenerateMindMap}
                  variant="outline"
                  size="sm"
                  className="text-bright-blue border-bright-blue/40 hover:bg-bright-blue/5"
                  data-testid="button-toggle-mindmap"
                >
                  {showMindMap ? 'Ocultar' : 'Visualizar'}
                </Button>
              </div>

              {showMindMap ? (
                <div className="space-y-4">
                  {/* Centro - Tema */}
                  {brainstormData.tema && (
                    <div className="text-center">
                      <div className="inline-block bg-gradient-to-r from-bright-blue to-dark-blue text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {brainstormData.tema}
                      </div>
                    </div>
                  )}

                  {/* Tese */}
                  {brainstormData.tese && (
                    <div className="bg-bright-blue/10 rounded-lg p-3 border border-bright-blue/20">
                      <div className="text-xs font-semibold text-bright-blue mb-1">TESE</div>
                      <div className="text-sm text-dark-blue">{brainstormData.tese}</div>
                    </div>
                  )}

                  {/* Argumentos */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(brainstormData.paragrafos).map(([key, value]) => 
                      value && (
                        <div key={key} className="bg-white/50 rounded-lg p-2 border border-soft-gray/20">
                          <div className="text-xs font-semibold text-soft-gray mb-1">
                            {key.toUpperCase().replace('DESENVOLVIMENTO', 'ARG')}
                          </div>
                          <div className="text-xs text-dark-blue">{value.slice(0, 80)}...</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Map size={48} className="text-bright-blue/40 mx-auto mb-3" />
                  <p className="text-soft-gray text-sm">
                    Clique em "Visualizar" para ver o mapa mental das suas ideias
                  </p>
                </div>
              )}
            </LiquidGlassCard>
          </div>

          {/* Progresso e Status */}
          <LiquidGlassCard className="bg-gradient-to-r from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h4 className="font-semibold text-dark-blue">Progresso da Construção</h4>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Tema</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.tema ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Tese</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.tese ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Argumentos</span>
                    <div className={`w-3 h-3 rounded-full ${Object.values(brainstormData.paragrafos).filter(p => p.trim()).length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Conclusão</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.paragrafos.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-dark-blue">{calculateProgress()}% Completo</div>
                <div className="text-xs text-soft-gray">Continue conversando com a IA para desenvolver mais</div>
              </div>
            </div>
          </LiquidGlassCard>

        </div>
      </div>
    </div>
  );
}