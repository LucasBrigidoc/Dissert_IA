import { PedagogicalChatContainer } from "@/components/PedagogicalChatContainer";
import { useLocation } from "wouter";

export default function ChatPedagogico() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Detectar origem ou voltar para dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    
    switch (fromParam) {
      case 'functionalities':
        setLocation('/functionalities');
        break;
      case 'dashboard':
        setLocation('/dashboard');
        break;
      default:
        // Verificar se há histórico de navegação
        if (window.history.length > 1 && document.referrer) {
          window.history.back();
        } else {
          setLocation('/dashboard');
        }
    }
  };

  // Contexto inicial opcional baseado em parâmetros da URL
  const getInitialContext = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tema = urlParams.get('tema');
    const tese = urlParams.get('tese');
    
    const context: any = {};
    if (tema) context.tema = decodeURIComponent(tema);
    if (tese) context.tese = decodeURIComponent(tese);
    
    return Object.keys(context).length > 0 ? context : undefined;
  };

  return (
    <PedagogicalChatContainer 
      onBack={handleBack}
      initialContext={getInitialContext()}
    />
  );
}