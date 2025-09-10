import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Map, BookOpen, Home, RefreshCw, Download } from "lucide-react";
import { useLocation } from "wouter";

interface MindMapData {
  tema: string;
  tese: string;
  paragrafos: {
    introducao: string;
    desenvolvimento1: string;
    desenvolvimento2: string;
    conclusao: string;
  };
  timestamp: string;
}

export default function MapaMental() {
  const [location, setLocation] = useLocation();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Carregar dados do localStorage
    const savedData = localStorage.getItem('mindMapData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setMindMapData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados do mapa mental:', error);
        // Redirecionar para argumentos se não houver dados
        setLocation('/argumentos');
      }
    } else {
      // Redirecionar para argumentos se não houver dados
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

  // Criar novo mapa mental (limpar dados e voltar)
  const handleCreateNew = () => {
    localStorage.removeItem('mindMapData');
    setLocation('/argumentos');
  };

  if (!mindMapData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-blue mx-auto mb-4"></div>
          <p className="text-soft-gray">Carregando mapa mental...</p>
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
                  <Map className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Mapa Mental da Redação</h1>
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
          
          {/* Mapa Mental Visualização */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="space-y-8">
              
              {/* Centro - Tema Principal */}
              {mindMapData.tema && (
                <div className="text-center">
                  <div className="inline-block bg-gradient-to-r from-bright-blue to-dark-blue text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg">
                    {mindMapData.tema}
                  </div>
                  <div className="mt-2 text-sm text-soft-gray">Tema Central</div>
                </div>
              )}

              {/* Tese Principal */}
              {mindMapData.tese && (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-bright-blue/10 border-2 border-bright-blue/30 rounded-xl p-6 text-center">
                    <div className="text-sm font-bold text-bright-blue mb-2 uppercase tracking-wide">Tese Principal</div>
                    <div className="text-lg text-dark-blue font-medium leading-relaxed">{mindMapData.tese}</div>
                  </div>
                </div>
              )}

              {/* Conectores Visuais */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-gradient-to-b from-bright-blue/50 to-transparent"></div>
              </div>

              {/* Estrutura dos Parágrafos - Layout em Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                
                {/* Introdução */}
                {mindMapData.paragrafos.introducao && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      1. INTRODUÇÃO
                    </div>
                    <div className="mt-2 text-sm text-dark-blue leading-relaxed">
                      {mindMapData.paragrafos.introducao}
                    </div>
                  </div>
                )}
                
                {/* Desenvolvimento I */}
                {mindMapData.paragrafos.desenvolvimento1 && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      2. DESENVOLVIMENTO I
                    </div>
                    <div className="mt-2 text-sm text-dark-blue leading-relaxed">
                      {mindMapData.paragrafos.desenvolvimento1}
                    </div>
                  </div>
                )}
                
                {/* Desenvolvimento II */}
                {mindMapData.paragrafos.desenvolvimento2 && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      3. DESENVOLVIMENTO II
                    </div>
                    <div className="mt-2 text-sm text-dark-blue leading-relaxed">
                      {mindMapData.paragrafos.desenvolvimento2}
                    </div>
                  </div>
                )}
                
                {/* Conclusão */}
                {mindMapData.paragrafos.conclusao && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl p-5 relative lg:col-span-2">
                    <div className="absolute -top-3 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      4. CONCLUSÃO
                    </div>
                    <div className="mt-2 text-sm text-dark-blue leading-relaxed">
                      {mindMapData.paragrafos.conclusao}
                    </div>
                  </div>
                )}
              </div>

              {/* Informações do Mapa */}
              <div className="text-center border-t border-bright-blue/10 pt-6">
                <div className="text-xs text-soft-gray">
                  Mapa mental gerado em: {new Date(mindMapData.timestamp).toLocaleString('pt-BR')}
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
              Criar Novo Mapa Mental
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}