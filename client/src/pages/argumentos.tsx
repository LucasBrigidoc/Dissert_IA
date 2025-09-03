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
  const [brainstormData, setBrainstormData] = useState({
    tema: '',
    tese: '',
    argumentos: [] as Array<{id: number, content: string}>,
    repertorios: [] as Array<{id: number, content: string}>,
    conclusao: ''
  });
  const [newArgument, setNewArgument] = useState('');
  const [newRepertorio, setNewRepertorio] = useState('');
  const [chatStates, setChatStates] = useState({
    argumentos: { 
      messages: [{ id: 1, type: 'ai', content: 'Vou te ajudar a desenvolver argumentos sólidos. Qual é o tema da sua redação?' }], 
      currentMessage: '',
      isOpen: false
    },
    repertorios: { 
      messages: [{ id: 1, type: 'ai', content: 'Que repertórios culturais você conhece sobre esse tema? Filmes, livros, dados estatísticos?' }], 
      currentMessage: '',
      isOpen: false
    },
    conclusao: { 
      messages: [{ id: 1, type: 'ai', content: 'Vamos criar uma conclusão impactante com proposta de intervenção. O que você propõe?' }], 
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
  
  const sendMessageToSection = (section: string) => {
    const currentMessage = chatStates[section as keyof typeof chatStates].currentMessage;
    if (!currentMessage.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage
    };
    
    setChatStates(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        messages: [...prev[section as keyof typeof prev].messages, newMessage],
        currentMessage: ''
      }
    }));
    
    // Simular resposta da IA contextual
    setTimeout(() => {
      const responses = {
        argumentos: [
          'Ótimo argumento! Agora pense em evidências para sustentá-lo. Que dados ou exemplos você pode usar?',
          'Esse ponto é muito forte! Você pode conectar isso com algum exemplo prático?',
          'Interessante! Como isso se relaciona com o contexto brasileiro atual?'
        ],
        repertorios: [
          'Excelente referência! Como você pode conectar isso ao seu argumento principal?',
          'Essa fonte é muito relevante. Você tem mais exemplos nessa linha?',
          'Perfeito! Isso vai enriquecer muito sua argumentação.'
        ],
        conclusao: [
          'Boa proposta! Como garantir que seja viável e realista?',
          'Interessante ideia! Quem seria responsável por implementar isso?',
          'Excelente conclusão! Isso resolve o problema apresentado?'
        ]
      };
      
      const randomResponse = responses[section as keyof typeof responses][Math.floor(Math.random() * 3)];
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: randomResponse
      };
      
      setChatStates(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          messages: [...prev[section as keyof typeof prev].messages, aiResponse]
        }
      }));
    }, 1000);
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
    setChatStates(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        isOpen: !prev[section as keyof typeof prev].isOpen
      }
    }));
  };
  
  const addToCategory = (category: string, content: string) => {
    setBrainstormData(prev => ({
      ...prev,
      [category]: category === 'argumentos' || category === 'repertorios' 
        ? [...prev[category], { id: Date.now(), content }]
        : content
    }));
  };
  
  const removeFromCategory = (category: string, id: number) => {
    setBrainstormData(prev => ({
      ...prev,
      [category]: category === 'argumentos' || category === 'repertorios' 
        ? (prev[category as keyof typeof prev] as Array<{id: number, content: string}>).filter(item => item.id !== id)
        : prev[category as keyof typeof prev]
    }));
  };

  const ChatMini = ({ section, title }: { section: string, title: string }) => {
    const chatData = chatStates[section as keyof typeof chatStates];
    
    return (
      <div className="mt-4">
        <Button
          onClick={() => toggleChat(section)}
          variant="outline"
          className="w-full justify-start text-left border-bright-blue/30 hover:bg-bright-blue/10"
        >
          <MessageSquare size={14} className="mr-2" />
          {chatData.isOpen ? 'Fechar' : 'Conversar com'} IA sobre {title}
        </Button>
        
        {chatData.isOpen && (
          <LiquidGlassCard className="mt-3 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            {/* Messages Area */}
            <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
              {chatData.messages.map((message: any) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user' 
                      ? 'bg-bright-blue text-white' 
                      : 'bg-gray-100 text-dark-blue'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={chatData.currentMessage}
                onChange={(e) => updateChatMessage(section, e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 border-bright-blue/20 focus:border-bright-blue text-sm"
                onKeyPress={(e) => e.key === 'Enter' && sendMessageToSection(section)}
              />
              <Button 
                onClick={() => sendMessageToSection(section)}
                size="sm"
                className="bg-gradient-to-r from-bright-blue to-dark-blue"
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
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
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
            <div className="text-sm text-soft-gray">
              Brainstorming com IA para construção de redação
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 pt-24">
        <div className="grid gap-6">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Tema e Tese */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Tema e Tese</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Tema</label>
                  <Input
                    value={brainstormData.tema}
                    onChange={(e) => setBrainstormData(prev => ({...prev, tema: e.target.value}))}
                    placeholder="Ex: O impacto da tecnologia na educação"
                    className="border-bright-blue/20 focus:border-bright-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Tese</label>
                  <Textarea
                    value={brainstormData.tese}
                    onChange={(e) => setBrainstormData(prev => ({...prev, tese: e.target.value}))}
                    placeholder="Sua posição sobre o tema..."
                    className="border-bright-blue/20 focus:border-bright-blue h-20"
                  />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Argumentos */}
            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-bright-blue/5 border-dark-blue/20">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Argumentos</h3>
              
              {/* Adicionar novo argumento */}
              <div className="mb-4">
                <p className="text-soft-gray text-sm mb-2">Adicione argumentos para sua redação</p>
                <div className="flex space-x-2">
                  <Input
                    value={newArgument}
                    onChange={(e) => setNewArgument(e.target.value)}
                    placeholder="Digite um novo argumento..."
                    className="flex-1 border-dark-blue/20 focus:border-dark-blue"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newArgument.trim()) {
                        addToCategory('argumentos', newArgument.trim());
                        setNewArgument('');
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {brainstormData.argumentos.map((arg, index) => (
                  <div key={arg.id} className="p-3 bg-white rounded-lg border border-dark-blue/20 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-dark-blue text-sm">Argumento {index + 1}</span>
                      <p className="text-soft-gray text-sm mt-1">{arg.content}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCategory('argumentos', arg.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
              <ChatMini section="argumentos" title="argumentos" />
            </LiquidGlassCard>

            {/* Repertórios */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Repertórios Culturais</h3>
              
              {/* Adicionar novo repertório */}
              <div className="mb-4">
                <p className="text-soft-gray text-sm mb-2">Adicione repertórios para enriquecer sua redação</p>
                <div className="flex space-x-2">
                  <Input
                    value={newRepertorio}
                    onChange={(e) => setNewRepertorio(e.target.value)}
                    placeholder="Digite um repertório (filme, livro, dados, etc.)..."
                    className="flex-1 border-soft-gray/20 focus:border-soft-gray"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newRepertorio.trim()) {
                        addToCategory('repertorios', newRepertorio.trim());
                        setNewRepertorio('');
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {brainstormData.repertorios.map((rep, index) => (
                  <div key={rep.id} className="p-3 bg-white rounded-lg border border-soft-gray/20 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-dark-blue text-sm">Repertório {index + 1}</span>
                      <p className="text-soft-gray text-sm mt-1">{rep.content}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCategory('repertorios', rep.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
              <ChatMini section="repertorios" title="repertórios" />
            </LiquidGlassCard>

            {/* Conclusão */}
            <LiquidGlassCard className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Conclusão</h3>
              <Textarea
                value={brainstormData.conclusao}
                onChange={(e) => setBrainstormData(prev => ({...prev, conclusao: e.target.value}))}
                placeholder="Esboce sua proposta de intervenção e conclusão..."
                className="border-purple-200/50 focus:border-purple-300 h-24"
              />
              <ChatMini section="conclusao" title="conclusão" />
            </LiquidGlassCard>

            {/* Progress Bar */}
            <LiquidGlassCard className="bg-gradient-to-r from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-dark-blue text-sm">Progresso do Brainstorming</h4>
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
                    <div className={`w-3 h-3 rounded-full ${brainstormData.argumentos.length >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Repertórios</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.repertorios.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Conclusão</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Botão para Mapa Mental */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="text-center py-6">
                <Map size={48} className="text-bright-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-blue mb-2">Visualizar Mapa Mental</h3>
                <p className="text-soft-gray mb-4">
                  Organize suas ideias visualmente em um mapa mental interativo
                </p>
                <Button className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue">
                  <Map className="mr-2" size={16} />
                  Gerar Mapa Mental
                </Button>
              </div>
            </LiquidGlassCard>
          </div>

          
        </div>
      </div>
    </div>
  );
}