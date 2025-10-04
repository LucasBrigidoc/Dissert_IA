import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, FileEdit, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { AIUsageProgress } from "@/components/ai-usage-progress";

export function EstruturaRoterizada() {
  const [, navigate] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    navigate(backUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header Sticky - Estilo Controlador de Escrita */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-back"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center flex-shrink-0">
                <FileEdit className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Estrutura Roterizada</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <FileEdit className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Estrutura Roterizada</h1>
              </div>
            </div>
            <p className="text-soft-gray">Sistema inteligente de roteirização de redações</p>
          </div>
        </div>
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-8">
        {/* Título da Página */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
              <FileEdit className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-bold text-dark-blue">Estrutura Roterizada</h1>
          </div>
          <p className="text-lg text-soft-gray max-w-2xl mx-auto">
            Sistema inteligente de roteirização de redações com análise estrutural avançada
          </p>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Exemplo de funcionalidade */}
          <LiquidGlassCard className="p-6 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <FileEdit className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark-blue">Roteirização Inteligente</h3>
              <p className="text-soft-gray text-sm">
                Crie roteiros estruturados para suas redações com análise automática de coesão e coerência
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:opacity-90"
                data-testid="button-roteirizar"
              >
                Iniciar Roteirização
              </Button>
            </div>
          </LiquidGlassCard>

          {/* Card 2 - Exemplo de funcionalidade */}
          <LiquidGlassCard className="p-6 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark-blue">Análise Estrutural</h3>
              <p className="text-soft-gray text-sm">
                Analise a estrutura da sua redação e receba sugestões de melhoria em tempo real
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:opacity-90"
                data-testid="button-analisar"
              >
                Analisar Estrutura
              </Button>
            </div>
          </LiquidGlassCard>

          {/* Card 3 - Exemplo de funcionalidade */}
          <LiquidGlassCard className="p-6 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Settings className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-dark-blue">Configurações Avançadas</h3>
              <p className="text-soft-gray text-sm">
                Personalize os parâmetros de roteirização de acordo com suas necessidades
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:opacity-90"
                data-testid="button-configurar"
              >
                Configurar
              </Button>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Informational Section */}
        <LiquidGlassCard className="p-8 bg-gradient-to-br from-white/50 to-bright-blue/5">
          <h2 className="text-2xl font-bold text-dark-blue mb-4">Como Funciona a Estrutura Roterizada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-dark-blue mb-2">📝 Passo 1: Roteirização</h3>
              <p className="text-soft-gray text-sm">
                Defina a estrutura da sua redação com tópicos, argumentos e exemplos organizados de forma lógica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-dark-blue mb-2">🎯 Passo 2: Análise</h3>
              <p className="text-soft-gray text-sm">
                Receba feedback instantâneo sobre a coesão, coerência e desenvolvimento dos seus argumentos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-dark-blue mb-2">✨ Passo 3: Refinamento</h3>
              <p className="text-soft-gray text-sm">
                Aplique as sugestões de melhoria e otimize sua estrutura para máxima efetividade argumentativa.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-dark-blue mb-2">🚀 Passo 4: Exportação</h3>
              <p className="text-soft-gray text-sm">
                Exporte seu roteiro finalizado e use-o como guia para escrever redações nota 1000.
              </p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
