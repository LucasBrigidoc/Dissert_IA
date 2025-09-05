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
    paragrafos: {
      introducao: '',
      desenvolvimento1: '',
      desenvolvimento2: '',
      conclusao: ''
    }
  });
  const [chatStates, setChatStates] = useState({
    introducao: { 
      messages: [{ id: 1, type: 'ai', content: 'Vamos trabalhar na sua introdução. Como você vai apresentar e contextualizar o tema?' }], 
      currentMessage: '',
      isOpen: false
    },
    desenvolvimento1: { 
      messages: [{ id: 1, type: 'ai', content: 'Que argumento você vai desenvolver neste parágrafo? Que exemplos podem sustentá-lo?' }], 
      currentMessage: '',
      isOpen: false
    },
    desenvolvimento2: { 
      messages: [{ id: 1, type: 'ai', content: 'Qual será seu segundo argumento? Como ele se conecta com o primeiro?' }], 
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
        introducao: [
          'Ótima contextualização! Como você vai apresentar sua tese de forma clara?',
          'Interessante abordagem! Você pode ser mais específico sobre sua posição?',
          'Boa introdução! Como isso conecta com seus argumentos principais?'
        ],
        desenvolvimento1: [
          'Excelente argumento! Que exemplos concretos podem fortalecê-lo?',
          'Muito bom! Como você pode relacionar isso com dados ou estatísticas?',
          'Interessante ponto! Que autoridades ou especialistas apoiam essa visão?'
        ],
        desenvolvimento2: [
          'Ótimo segundo argumento! Como ele complementa o primeiro?',
          'Perfeito! Que exemplos históricos ou atuais sustentam essa ideia?',
          'Excelente! Como isso impacta a sociedade brasileira especificamente?'
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
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

            

            {/* Estrutura dos Parágrafos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Introdução */}
              <LiquidGlassCard className="bg-gradient-to-br from-green-50/80 to-green-100/50 border-green-200/50">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">1. Introdução</h3>
                <p className="text-soft-gray text-sm mb-3">Apresentação do tema, contextualização e tese</p>
                <Textarea
                  value={brainstormData.paragrafos.introducao}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, introducao: e.target.value }
                  }))}
                  placeholder="Escreva sua introdução aqui..."
                  className="border-green-200/50 focus:border-green-300 h-24"
                />
                <ChatMini section="introducao" title="introdução" />
              </LiquidGlassCard>

              {/* Desenvolvimento 1 */}
              <LiquidGlassCard className="bg-gradient-to-br from-blue-50/80 to-blue-100/50 border-blue-200/50">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">2. Desenvolvimento I</h3>
                <p className="text-soft-gray text-sm mb-3">Primeiro argumento com sustentação e exemplos</p>
                <Textarea
                  value={brainstormData.paragrafos.desenvolvimento1}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, desenvolvimento1: e.target.value }
                  }))}
                  placeholder="Desenvolva seu primeiro argumento..."
                  className="border-blue-200/50 focus:border-blue-300 h-24"
                />
                <ChatMini section="desenvolvimento1" title="primeiro argumento" />
              </LiquidGlassCard>

              {/* Desenvolvimento 2 */}
              <LiquidGlassCard className="bg-gradient-to-br from-orange-50/80 to-orange-100/50 border-orange-200/50">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">3. Desenvolvimento II</h3>
                <p className="text-soft-gray text-sm mb-3">Segundo argumento com sustentação e exemplos</p>
                <Textarea
                  value={brainstormData.paragrafos.desenvolvimento2}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, desenvolvimento2: e.target.value }
                  }))}
                  placeholder="Desenvolva seu segundo argumento..."
                  className="border-orange-200/50 focus:border-orange-300 h-24"
                />
                <ChatMini section="desenvolvimento2" title="segundo argumento" />
              </LiquidGlassCard>

              {/* Conclusão */}
              <LiquidGlassCard className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">4. Conclusão</h3>
                <p className="text-soft-gray text-sm mb-3">Síntese dos argumentos e proposta de intervenção</p>
                <Textarea
                  value={brainstormData.paragrafos.conclusao}
                  onChange={(e) => setBrainstormData(prev => ({
                    ...prev,
                    paragrafos: { ...prev.paragrafos, conclusao: e.target.value }
                  }))}
                  placeholder="Escreva sua conclusão e proposta de intervenção..."
                  className="border-purple-200/50 focus:border-purple-300 h-24"
                />
                <ChatMini section="conclusao" title="conclusão" />
              </LiquidGlassCard>
            </div>


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
                    <span className="text-xs text-dark-blue">Parágrafos</span>
                    <div className={`w-3 h-3 rounded-full ${Object.values(brainstormData.paragrafos).filter(p => p.trim()).length >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-dark-blue">Conclusão</span>
                    <div className={`w-3 h-3 rounded-full ${brainstormData.paragrafos.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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