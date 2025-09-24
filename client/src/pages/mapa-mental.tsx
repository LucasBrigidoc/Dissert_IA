import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, MessageSquare, BookOpen, Home, RefreshCw, User, Bot, Clock, Target } from "lucide-react";
import { useLocation } from "wouter";

interface ConversationData {
  conversationId: string;
  messages: Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    section?: string;
    timestamp: Date;
  }>;
  currentSection: string;
  brainstormData: {
    tema: string;
    tese: string;
    paragrafos: {
      introducao: string;
      desenvolvimento1: string;
      desenvolvimento2: string;
      conclusao: string;
    };
  };
  timestamp: string;
}

export default function VisualizadorConversa() {
  const [location, setLocation] = useLocation();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Carregar dados da conversa do localStorage
    const savedChatData = localStorage.getItem('conversationData');
    if (savedChatData) {
      try {
        const parsedData = JSON.parse(savedChatData);
        // Converter timestamps de string para Date
        parsedData.messages = parsedData.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) || [];
        setConversationData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados da conversa:', error);
        setLocation('/argumentos');
      }
    } else {
      setLocation('/argumentos');
    }
  }, [setLocation]);

  // Simular salvamento na biblioteca
  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    try {
      // Aqui seria a chamada real para salvar no backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar na biblioteca:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Navegar para funcionalidades
  const handleGoToFunctionalities = () => {
    setLocation('/functionalities');
  };

  // Voltar para argumentos
  const handleBackToArguments = () => {
    setLocation('/argumentos');
  };

  // Criar nova conversa (limpar dados e voltar)
  const handleCreateNew = () => {
    localStorage.removeItem('conversationData');
    setLocation('/argumentos');
  };

  // Função para obter ícone da seção
  const getSectionIcon = (section: string) => {
    const icons: Record<string, string> = {
      tema: '🎯',
      tese: '💡', 
      introducao: '📝',
      desenvolvimento1: '🔍',
      desenvolvimento2: '📊',
      conclusao: '✅',
      finalizacao: '🎉'
    };
    return icons[section] || '💬';
  };

  // Função para obter nome da seção
  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      tema: 'Desenvolvimento do Tema',
      tese: 'Construção da Tese',
      introducao: 'Introdução',
      desenvolvimento1: 'Primeiro Desenvolvimento',
      desenvolvimento2: 'Segundo Desenvolvimento', 
      conclusao: 'Conclusão',
      finalizacao: 'Finalização'
    };
    return names[section] || 'Conversa Geral';
  };

  if (!conversationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-blue mx-auto mb-4"></div>
          <p className="text-soft-gray">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToArguments}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200 border border-soft-gray/20 hover:border-bright-blue/30" 
                data-testid="button-back"
              >
                <ArrowLeft size={14} />
                <span className="text-sm font-medium">Voltar</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <MessageSquare className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Visualizador de Conversa</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {savedSuccess && (
                <div className="flex items-center space-x-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Salvo na biblioteca!</span>
                </div>
              )}
              <Button 
                onClick={handleSaveToLibrary}
                variant="outline"
                disabled={isSaving}
                className="text-bright-blue border-bright-blue/40 hover:bg-bright-blue/5"
                data-testid="button-save-library"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bright-blue mr-2"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    <span>Salvar na Biblioteca</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 pt-24">
        <div className="space-y-6">
          
          {/* Resumo da Conversa */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="space-y-6">
              
              {/* Header da Conversa */}
              <div className="text-center border-b border-bright-blue/10 pb-6">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 px-6 py-3 rounded-full">
                  <MessageSquare className="text-bright-blue" size={20} />
                  <span className="text-lg font-bold text-dark-blue">
                    {getSectionName(conversationData.currentSection)}
                  </span>
                  <span className="text-2xl">{getSectionIcon(conversationData.currentSection)}</span>
                </div>
                <div className="mt-2 text-sm text-soft-gray">
                  {conversationData.messages.length} mensagens trocadas
                </div>
              </div>

              {/* Timeline da Conversa */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversationData.messages.map((message, index) => (
                  <div key={message.id} className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-bright-blue to-dark-blue text-white'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-dark-blue border border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {message.type === 'user' ? (
                          <User size={14} className="text-white/80" />
                        ) : (
                          <Bot size={14} className="text-bright-blue" />
                        )}
                        <span className={`text-xs font-medium ${
                          message.type === 'user' ? 'text-white/80' : 'text-soft-gray'
                        }`}>
                          {message.type === 'user' ? 'Você' : 'IA Assistant'}
                        </span>
                        <Clock size={12} className={message.type === 'user' ? 'text-white/60' : 'text-soft-gray/60'} />
                        <span className={`text-xs ${
                          message.type === 'user' ? 'text-white/60' : 'text-soft-gray/60'
                        }`}>
                          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`text-sm leading-relaxed ${
                        message.type === 'user' ? 'text-white' : 'text-dark-blue'
                      }`}>
                        {message.content}
                      </div>
                      {message.section && (
                        <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                          message.type === 'user' 
                            ? 'bg-white/20 text-white/80'
                            : 'bg-bright-blue/10 text-bright-blue'
                        }`}>
                          {getSectionIcon(message.section)} {getSectionName(message.section)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progresso Construído */}
              {conversationData.brainstormData && (
                <div className="border-t border-bright-blue/10 pt-6">
                  <h3 className="text-lg font-bold text-dark-blue mb-4 text-center">
                    🎯 Progresso da Redação
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Tema */}
                    {conversationData.brainstormData.tema && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-blue-700 mb-2">🎯 Tema</div>
                        <div className="text-sm text-dark-blue">{conversationData.brainstormData.tema}</div>
                      </div>
                    )}
                    
                    {/* Tese */}
                    {conversationData.brainstormData.tese && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-purple-700 mb-2">💡 Tese</div>
                        <div className="text-sm text-dark-blue">{conversationData.brainstormData.tese}</div>
                      </div>
                    )}
                    
                    {/* Introdução */}
                    {conversationData.brainstormData.paragrafos.introducao && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-green-700 mb-2">📝 Introdução</div>
                        <div className="text-sm text-dark-blue">{conversationData.brainstormData.paragrafos.introducao}</div>
                      </div>
                    )}
                    
                    {/* Desenvolvimento 1 */}
                    {conversationData.brainstormData.paragrafos.desenvolvimento1 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-orange-700 mb-2">🔍 Desenvolvimento I</div>
                        <div className="text-sm text-dark-blue">{conversationData.brainstormData.paragrafos.desenvolvimento1}</div>
                      </div>
                    )}
                    
                    {/* Desenvolvimento 2 */}
                    {conversationData.brainstormData.paragrafos.desenvolvimento2 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-indigo-700 mb-2">📊 Desenvolvimento II</div>
                        <div className="text-sm text-dark-blue">{conversationData.brainstormData.paragrafos.desenvolvimento2}</div>
                      </div>
                    )}
                    
                    {/* Conclusão */}
                    {conversationData.brainstormData.paragrafos.conclusao && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:col-span-2">
                        <div className="text-sm font-semibold text-red-700 mb-2">✅ Conclusão</div>
                        <div className="text-sm text-dark-blue">{conversationData.brainstormData.paragrafos.conclusao}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informações da Conversa */}
              <div className="text-center border-t border-bright-blue/10 pt-4">
                <div className="text-xs text-soft-gray">
                  Conversa iniciada em: {new Date(conversationData.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>

            </div>
          </LiquidGlassCard>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoToFunctionalities}
              variant="outline"
              className="text-soft-gray border-soft-gray/40 hover:bg-soft-gray/5 hover:text-dark-blue"
              data-testid="button-functionalities"
            >
              <Home className="mr-2" size={16} />
              Ir para Funcionalidades
            </Button>
            
            <Button 
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue"
              data-testid="button-create-new"
            >
              <RefreshCw className="mr-2" size={16} />
              Nova Conversa
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}