import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, Menu, X, User, Settings, LogOut, FileEdit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { useToast } from "@/hooks/use-toast";
import { AIUsageProgress } from "@/components/ai-usage-progress";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";

export function EstruturaRoterizada() {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get user data
  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/auth/me'],
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (user: UserType | undefined) => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header Sticky - Estilo Controlador de Escrita com Cores da Estrutura Curinga */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-bright-blue to-dark-blue shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-4">
            {/* Logo e Nome */}
            <div className="flex items-center space-x-6">
              <Link href="/dashboard">
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <span className="text-2xl font-bold text-white">DISSÈRTIA</span>
                </div>
              </Link>
            </div>

            {/* Menu de Navegação Central */}
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  data-testid="link-home"
                >
                  <Home size={16} className="mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/functionalities">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  data-testid="link-funcionalidades"
                >
                  Funcionalidades
                </Button>
              </Link>
              <Link href="/newsletter">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  data-testid="link-newsletter"
                >
                  Newsletter
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white"
                  data-testid="link-configuracoes"
                >
                  Configurações
                </Button>
              </Link>
            </nav>

            {/* User Menu - Desktop */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                data-testid="button-sair"
              >
                <LogOut size={16} className="mr-2" />
                Sair
              </Button>
              <Link href="/settings">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <span className="text-sm font-semibold text-white">
                    {getUserInitials(user)}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/dashboard">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold text-white">DISSÈRTIA</span>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-white/20 py-4 space-y-2">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-home"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={12} />
                  <span>Home</span>
                </Button>
              </Link>
              <Link href="/functionalities">
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-funcionalidades"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileEdit size={12} />
                  <span>Funcionalidades</span>
                </Button>
              </Link>
              <Link href="/newsletter">
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={12} />
                  <span>Newsletter</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-configuracoes"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={12} />
                  <span>Configurações</span>
                </Button>
              </Link>
              <Button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                data-testid="button-mobile-nav-sair"
              >
                <LogOut size={12} />
                <span>Sair</span>
              </Button>
            </div>
          )}
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
            <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
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
