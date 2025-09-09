import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Brain, 
  BookOpen, 
  Target, 
  Clock,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Map,
  Layout,
  Columns3
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EssayPreview } from "./EssayPreview";
import { MindMapContainer } from "./MindMapContainer";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface EssayContext {
  tema?: string;
  tese?: string;
  estrutura?: {
    introducao?: string;
    desenvolvimento1?: string;
    desenvolvimento2?: string;
    conclusao?: string;
  };
  repertorios?: Array<{title: string, description: string, type: string}>;
  conectivos?: Array<string>;
  etapaAtual?: 'tema' | 'tese' | 'argumentacao' | 'conclusao' | 'revisao';
}

interface ProgressoAtual {
  etapa: string;
  percentualCompleto: number;
  proximaEtapa?: string;
}

interface PedagogicalChatContainerProps {
  onBack?: () => void;
  initialContext?: EssayContext;
}

export function PedagogicalChatContainer({ onBack, initialContext = {} }: PedagogicalChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [essayContext, setEssayContext] = useState<EssayContext>(initialContext);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [suggestedNextSteps, setSuggestedNextSteps] = useState<string[]>([]);
  const [progressoAtual, setProgressoAtual] = useState<ProgressoAtual>({
    etapa: 'tema',
    percentualCompleto: 0
  });
  const [showPreview, setShowPreview] = useState(true);
  const [showMindMap, setShowMindMap] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'full' | 'chat-preview' | 'chat-mindmap' | 'three-column'>('three-column');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enviar primeira mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: '👋 **Olá! Seja bem-vindo(a) ao seu tutor de redação pessoal!**\n\n🎯 Estou aqui para te guiar passo a passo na criação de uma redação argumentativa incrível! Vamos trabalhar juntos desde a escolha do tema até a conclusão.\n\n📝 **Para começar, me conte:**\n• Qual é o tema ou proposta que você precisa trabalhar?\n• Ou se preferir, podemos escolher um tema juntos!\n\nVou te ensinar tudo sobre estrutura, argumentação e como impressionar na sua redação! 🚀',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("/api/chat/pedagogical", {
        method: "POST",
        body: {
          message,
          sessionId,
          essayContext,
          conversationHistory: messages
        }
      });
    },
    onSuccess: (data) => {
      // Adicionar resposta da IA
      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Atualizar contexto e sugestões
      if (data.essayContext) {
        setEssayContext(data.essayContext);
      }
      if (data.suggestedNextSteps) {
        setSuggestedNextSteps(data.suggestedNextSteps);
      }
      if (data.progressoAtual) {
        setProgressoAtual(data.progressoAtual);
      }
    },
    onError: (error: any) => {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.status === 429 
          ? "Limite de consultas atingido. Tente novamente em uma hora."
          : "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Enviar para IA
    sendMessageMutation.mutate(currentMessage.trim());
    
    // Limpar input
    setCurrentMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedAction = (suggestion: string) => {
    setCurrentMessage(suggestion);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCurrentMessage(value);
    
    // Auto-resize
    requestAnimationFrame(() => {
      const target = e.target as HTMLTextAreaElement;
      target.style.height = 'auto';
      const newHeight = Math.min(Math.max(44, target.scrollHeight), 120);
      target.style.height = newHeight + 'px';
    });
  };

  const getStageLabel = (stage: string) => {
    const labels = {
      tema: 'Escolha do Tema',
      tese: 'Definição da Tese',
      argumentacao: 'Desenvolvimento',
      conclusao: 'Conclusão',
      revisao: 'Revisão Final'
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  const handleMindMapNodeSelect = (nodeId: string, data: any) => {
    // Quando um nó do mapa mental é clicado, adicionar sugestão ao chat
    let suggestionText = "";
    
    switch (nodeId) {
      case 'tema':
        suggestionText = "Vamos trabalhar mais no tema da redação";
        break;
      case 'tese':
        suggestionText = "Quero desenvolver melhor minha tese";
        break;
      case 'introducao':
        suggestionText = "Preciso de ajuda com a introdução";
        break;
      case 'desenvolvimento1':
        suggestionText = "Vamos trabalhar no primeiro argumento";
        break;
      case 'desenvolvimento2':
        suggestionText = "Preciso desenvolver o segundo argumento";
        break;
      case 'conclusao':
        suggestionText = "Vamos criar a conclusão com proposta de intervenção";
        break;
      default:
        if (nodeId.startsWith('repertorio-')) {
          suggestionText = `Como posso usar o repertório "${data.title}" na minha redação?`;
        } else if (nodeId.startsWith('conectivo-')) {
          suggestionText = `Como usar conectivos de ${data.categoria.toLowerCase()} no meu texto?`;
        }
    }
    
    if (suggestionText) {
      setCurrentMessage(suggestionText);
      textareaRef.current?.focus();
    }
  };

  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'full':
        return 'grid-cols-1 max-w-4xl mx-auto';
      case 'chat-preview':
        return 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto';
      case 'chat-mindmap':
        return 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto';
      case 'three-column':
        return 'grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto';
      default:
        return 'grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto';
    }
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      tema: BookOpen,
      tese: Target,
      argumentacao: Brain,
      conclusao: CheckCircle2,
      revisao: Lightbulb
    };
    const Icon = icons[stage as keyof typeof icons] || BookOpen;
    return <Icon size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header com progresso */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBack}
                  className="text-soft-gray hover:text-bright-blue"
                >
                  ← Voltar
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Brain className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-dark-blue">Tutor de Redação IA</h1>
                  <p className="text-sm text-soft-gray">Vamos criar sua redação juntos!</p>
                </div>
              </div>
            </div>
            
            {/* Controles de layout e progresso */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Toggle Preview */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-soft-gray hover:text-bright-blue"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              
              {/* Toggle Mind Map */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMindMap(!showMindMap)}
                className="text-soft-gray hover:text-bright-blue"
              >
                {showMindMap ? <Map size={16} /> : <Map size={16} />}
              </Button>
              
              {/* Layout Mode */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const modes: typeof layoutMode[] = ['three-column', 'chat-preview', 'chat-mindmap', 'full'];
                  const currentIndex = modes.indexOf(layoutMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  setLayoutMode(nextMode);
                }}
                className="text-soft-gray hover:text-bright-blue"
              >
                <Columns3 size={16} />
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-2">
                {getStageIcon(progressoAtual.etapa)}
                <span className="text-sm font-medium text-dark-blue">
                  {getStageLabel(progressoAtual.etapa)}
                </span>
              </div>
              <div className="w-24">
                <Progress value={progressoAtual.percentualCompleto} className="h-2" />
              </div>
              <span className="text-sm text-soft-gray">
                {progressoAtual.percentualCompleto}%
              </span>
            </div>
          </div>
          
          {/* Progresso mobile */}
          <div className="md:hidden mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStageIcon(progressoAtual.etapa)}
                <span className="text-sm font-medium text-dark-blue">
                  {getStageLabel(progressoAtual.etapa)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-soft-gray hover:text-bright-blue h-7 px-2"
                >
                  {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMindMap(!showMindMap)}
                  className="text-soft-gray hover:text-bright-blue h-7 px-2"
                >
                  <Map size={14} />
                </Button>
                <span className="text-sm text-soft-gray">
                  {progressoAtual.percentualCompleto}%
                </span>
              </div>
            </div>
            <Progress value={progressoAtual.percentualCompleto} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className={`grid gap-4 h-[70vh] ${getLayoutClasses()}`}>
          
          {/* Chat Container */}
          <Card className={`h-full flex flex-col bg-white/80 backdrop-blur-sm border-white/20 shadow-lg ${
            layoutMode === 'three-column' ? 'lg:col-span-5' : 
            layoutMode === 'chat-preview' || layoutMode === 'chat-mindmap' ? 'lg:col-span-1' : 
            'col-span-1'
          }`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-bright-blue to-dark-blue text-white' 
                    : 'bg-gray-50 text-dark-blue border border-gray-200'
                  } rounded-2xl px-4 py-3 shadow-sm`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain size={16} className="text-bright-blue" />
                      <span className="text-xs font-medium text-bright-blue">Tutor IA</span>
                    </div>
                  )}
                  <div 
                    className="whitespace-pre-wrap break-words text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Brain size={16} className="text-bright-blue" />
                    <span className="text-xs font-medium text-bright-blue">Tutor IA</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-bright-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-bright-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-bright-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
              <div ref={messagesEndRef} />
            </div>

            <Separator />

            {/* Sugestões rápidas */}
            {suggestedNextSteps.length > 0 && (
              <div className="px-6 py-3 bg-gray-50/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb size={14} className="text-bright-blue" />
                  <span className="text-xs font-medium text-bright-blue">Sugestões:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedNextSteps.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedAction(suggestion)}
                      className="text-xs h-7 border-bright-blue/20 text-bright-blue hover:bg-bright-blue/5"
                      disabled={sendMessageMutation.isPending}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 pt-4">
              <div className="flex space-x-3 items-end">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={currentMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                    className="min-h-[44px] max-h-[120px] resize-none border-bright-blue/20 focus:border-bright-blue text-sm"
                    disabled={sendMessageMutation.isPending}
                    style={{ height: '44px' }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue h-11 px-4"
                  data-testid="button-send-message"
                >
                  <Send size={18} />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>💡 Use Shift+Enter para nova linha</span>
                <div className="flex items-center space-x-2">
                  <Clock size={12} />
                  <span>Resposta em tempo real</span>
                </div>
              </div>
            </div>
          </Card>
        
        {/* Essay Preview */}
        {showPreview && (layoutMode === 'chat-preview' || layoutMode === 'three-column') && (
          <EssayPreview 
            essayContext={essayContext}
            progressPercent={progressoAtual.percentualCompleto}
            className={`hidden lg:block ${
              layoutMode === 'three-column' ? 'lg:col-span-4' : 'lg:col-span-1'
            }`}
          />
        )}
        
        {/* Mind Map */}
        {showMindMap && (layoutMode === 'chat-mindmap' || layoutMode === 'three-column') && (
          <MindMapContainer 
            essayContext={essayContext}
            onNodeSelect={handleMindMapNodeSelect}
            className={`hidden lg:block ${
              layoutMode === 'three-column' ? 'lg:col-span-3' : 'lg:col-span-1'
            }`}
          />
        )}
        
        </div>
        
        {/* Mobile sections - below chat */}
        <div className="lg:hidden space-y-4 mt-6">
          {showPreview && (
            <EssayPreview 
              essayContext={essayContext}
              progressPercent={progressoAtual.percentualCompleto}
              className="h-96"
            />
          )}
          
          {showMindMap && (
            <MindMapContainer 
              essayContext={essayContext}
              onNodeSelect={handleMindMapNodeSelect}
              className="h-96"
            />
          )}
        </div>
      </div>
    </div>
  );
}