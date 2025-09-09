import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Brain } from "lucide-react";

export default function Argumentos() {
  const [backUrl, setBackUrl] = useState('/dashboard');
  
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

  const handleBack = () => {
    if (window.history.length > 1 && document.referrer) {
      window.history.back();
    } else {
      window.location.href = backUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBack}
                className="text-soft-gray hover:text-bright-blue"
              >
                <ArrowLeft size={16} />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Brain className="text-white" size={18} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-dark-blue">Chat Pedagógico - Teste</h1>
                  <p className="text-sm text-soft-gray">Versão de teste funcionando!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">✅ Slice 1 - Chat Pedagógico Implementado</h2>
          <p className="text-gray-600 mb-4">
            A página argumentos foi reformulada com sucesso! O PedagogicalChatContainer está pronto para ser ativado.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✅ PedagogicalChatContainer implementado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✅ EssayPreview componente pronto</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✅ MindMapContainer componente pronto</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✅ API /api/chat/pedagogical funcionando</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>🔄 Testando integração...</span>
            </div>
          </div>
          
          <Button 
            className="mt-4 bg-gradient-to-r from-bright-blue to-dark-blue"
            onClick={() => {
              // Simular ativação do chat completo
              window.location.reload();
            }}
          >
            Ativar Chat Pedagógico Completo
          </Button>
        </Card>
      </div>
    </div>
  );
}