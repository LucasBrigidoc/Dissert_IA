import { useState, useEffect } from "react";
import { PedagogicalChatContainer } from "@/components/PedagogicalChatContainer";

// Interface para contexto inicial da redação
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

export default function Argumentos() {
  const [backUrl, setBackUrl] = useState('/dashboard');
  const [initialContext] = useState<EssayContext>({
    etapaAtual: 'tema'
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

  const handleBack = () => {
    if (window.history.length > 1 && document.referrer) {
      window.history.back();
    } else {
      window.location.href = backUrl;
    }
  };

  return (
    <PedagogicalChatContainer 
      onBack={handleBack}
      initialContext={initialContext}
    />
  );
}