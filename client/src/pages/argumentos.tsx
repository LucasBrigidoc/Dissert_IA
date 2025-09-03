import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, Lightbulb, BookOpen, Target, Zap, MessageSquare, Plus, Trash2, Edit3, Map, Download, Save } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Argumentos() {
  const [location] = useLocation();
  const [backUrl, setBackUrl] = useState('/dashboard');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'ai', content: 'Olá! Sou sua assistente de brainstorming. Vamos organizar suas ideias para a redação? Qual é o tema que você gostaria de desenvolver?' }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [brainstormData, setBrainstormData] = useState({
    tema: '',
    tese: '',
    argumentos: [] as Array<{id: number, content: string}>,
    repertorios: [] as Array<{id: number, content: string}>,
    conclusao: ''
  });
  const [activeTab, setActiveTab] = useState('chat');
  
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
  
  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // Simular resposta da IA (será conectada posteriormente)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Excelente ideia! Vamos desenvolver isso. Que tal organizarmos em argumentos? Pense em 2-3 pontos principais que sustentam sua posição.'
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  // Tentar usar history.back() se possível, caso contrário usar a URL detectada
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
      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'chat' 
                ? 'bg-white text-bright-blue shadow-sm' 
                : 'text-soft-gray hover:text-dark-blue'
            }`}
          >
            <MessageSquare className="inline-block mr-2" size={16} />
            Chat IA
          </button>
          <button
            onClick={() => setActiveTab('organize')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'organize' 
                ? 'bg-white text-bright-blue shadow-sm' 
                : 'text-soft-gray hover:text-dark-blue'
            }`}
          >
            <Target className="inline-block mr-2" size={16} />
            Organizar Ideias
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 h-[600px] flex flex-col">
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-bright-blue/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <Brain className="text-white" size={14} />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-blue">Brainstorming com IA</h3>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-bright-blue text-white' 
                          : 'bg-gray-100 text-dark-blue'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Input Area */}
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Digite sua ideia ou pergunta..."
                    className="flex-1 border-bright-blue/20 focus:border-bright-blue"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button 
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue"
                  >
                    <MessageSquare size={16} />
                  </Button>
                </div>
              </LiquidGlassCard>
            )}

            {/* Organize Tab */}
            {activeTab === 'organize' && (
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-blue">Argumentos</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        const content = prompt('Adicione um argumento:');
                        if (content) addToCategory('argumentos', content);
                      }}
                      className="bg-gradient-to-r from-dark-blue to-bright-blue"
                    >
                      <Plus size={14} />
                    </Button>
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
                    {brainstormData.argumentos.length === 0 && (
                      <p className="text-soft-gray text-sm text-center py-4">Adicione argumentos para sua redação</p>
                    )}
                  </div>
                </LiquidGlassCard>

                {/* Repertórios */}
                <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-blue">Repertórios Culturais</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        const content = prompt('Adicione um repertório (filme, livro, dados, etc.):');
                        if (content) addToCategory('repertorios', content);
                      }}
                      className="bg-gradient-to-r from-soft-gray to-bright-blue"
                    >
                      <Plus size={14} />
                    </Button>
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
                    {brainstormData.repertorios.length === 0 && (
                      <p className="text-soft-gray text-sm text-center py-4">Adicione repertórios para enriquecer sua redação</p>
                    )}
                  </div>
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
                </LiquidGlassCard>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <h4 className="font-semibold text-dark-blue mb-4">Progresso do Brainstorming</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-blue">Tema definido</span>
                  <div className={`w-4 h-4 rounded-full ${brainstormData.tema ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-blue">Tese elaborada</span>
                  <div className={`w-4 h-4 rounded-full ${brainstormData.tese ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-blue">Argumentos (2-3)</span>
                  <div className={`w-4 h-4 rounded-full ${brainstormData.argumentos.length >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-blue">Repertórios</span>
                  <div className={`w-4 h-4 rounded-full ${brainstormData.repertorios.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-blue">Conclusão</span>
                  <div className={`w-4 h-4 rounded-full ${brainstormData.conclusao ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Quick Actions */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <h4 className="font-semibold text-dark-blue mb-4">Ações Rápidas</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-bright-blue/30 hover:bg-bright-blue/10"
                >
                  <Save className="mr-2" size={14} />
                  Salvar Brainstorm
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-dark-blue/30 hover:bg-dark-blue/10"
                >
                  <Download className="mr-2" size={14} />
                  Exportar PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-soft-gray/30 hover:bg-soft-gray/10"
                >
                  <Edit3 className="mr-2" size={14} />
                  Iniciar Redação
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Tips */}
            <LiquidGlassCard className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50">
              <h4 className="font-semibold text-dark-blue mb-4">Dicas de Brainstorming</h4>
              <div className="space-y-3">
                <div className="p-3 bg-purple-100/50 rounded-lg">
                  <div className="font-medium text-dark-blue text-sm mb-1">Converse com a IA</div>
                  <div className="text-soft-gray text-xs">Use o chat para desenvolver e refinar suas ideias</div>
                </div>
                <div className="p-3 bg-purple-100/50 rounded-lg">
                  <div className="font-medium text-dark-blue text-sm mb-1">Organize gradualmente</div>
                  <div className="text-soft-gray text-xs">Vá organizando suas ideias em categorias conforme surgem</div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}