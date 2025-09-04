import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Menu, Archive } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const name = "Lucas Silva";

  const handleQuickAccess = (feature: string) => {
    const urlParams = new URLSearchParams();
    urlParams.set('from', 'dashboard');
    setLocation(`/${feature}?${urlParams.toString()}`);
  };

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2" data-testid="link-dashboard-logo">
              <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                <Plus className="text-white text-sm" />
              </div>
              <span className="text-2xl font-bold text-dark-blue">
                DISSERT<span className="text-bright-blue">AI</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-home">
                <Home size={14} />
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Plus size={14} />
                <span className="font-medium">Funcionalidades</span>
              </Link>
              <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-newsletter">
                <Book size={14} />
                <span className="font-medium">Newsletter</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-settings">
                <Settings size={14} />
                <span className="font-medium">Configurações</span>
              </Link>
            </div>
            
            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                data-testid="button-logout"
              >
                <LogOut size={12} />
                <span>Sair</span>
              </Button>
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user-mobile">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                className="p-2 border-soft-gray/30 hover:border-bright-blue text-soft-gray hover:text-bright-blue"
                data-testid="button-mobile-menu"
              >
                <Menu size={12} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-home"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={12} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link 
                  href="/functionalities" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus size={10} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Book size={12} />
                  <span className="font-medium">Newsletter</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={12} />
                  <span className="font-medium">Configurações</span>
                </Link>
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="flex items-center space-x-3 w-full text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut size={12} />
                    <span>Sair</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-6 pt-20 space-y-6">
        
        {/* Simulador de Provas */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-simulador-provas">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <GraduationCap className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Simulador de Provas</h4>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="font-medium text-dark-blue mb-2 text-lg">Pratique redações em ambiente simulado 📝</div>
              <p className="text-soft-gray leading-relaxed">Teste seus conhecimentos com simulados completos que replicam o formato das principais provas do país. Cronômetro, temas atuais e correção detalhada.</p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => handleQuickAccess('simulador')}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 px-8 py-3"
                data-testid="button-access-simulador"
              >
                Iniciar Simulado
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Biblioteca Pessoal */}
        <LiquidGlassCard className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50" data-testid="card-biblioteca-pessoal">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Archive className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Biblioteca Pessoal</h4>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="font-medium text-dark-blue mb-2 text-lg">Repositório inteligente do seu aprendizado 📚</div>
              <p className="text-soft-gray leading-relaxed">Organize e acesse todo seu conteúdo criado: redações salvas, estruturas personalizadas, repertórios favoritos e argumentos desenvolvidos, tudo categorizado de forma inteligente.</p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setLocation('/biblioteca')}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 px-8 py-3"
                data-testid="button-access-biblioteca"
              >
                Acessar Biblioteca
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

      </div>
    </div>
  );
}