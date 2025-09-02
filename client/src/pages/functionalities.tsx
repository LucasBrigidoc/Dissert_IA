import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Brain, Edit, Newspaper, Archive, Grid3x3, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { mockFeatures } from "@/lib/mock-data";

export default function FunctionalitiesPage() {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setLocation("/");
  };

  const handleFeatureAccess = (featureName: string) => {
    const routeMap: { [key: string]: string } = {
      "Arquiteto de Argumentos": "/argumentos",
      "Explorador de Repertório": "/repertorio?from=functionalities", 
      "Simulador de Prova": "/simulador?from=functionalities",
      "Controlador de Estilo": "/controlador-escrita?from=functionalities",
      "Estrutura Coringa": "/estilo?from=functionalities",
      "Newsletter Educacional": "/dashboard",
      "Criador de Propostas": "/simulador?from=functionalities",
      "Biblioteca Pessoal": "/biblioteca?from=functionalities"
    };
    
    const route = routeMap[featureName] || "/dashboard";
    setLocation(route);
  };

  const iconMap = {
    brain: Brain,
    book: Book,
    clock: Clock,
    comments: MessageCircle,
    search: Search,
    edit: Edit,
    newspaper: Newspaper,
    sliders: Sliders,
    "graduation-cap": GraduationCap,
    lightbulb: Lightbulb,
    archive: Archive
  };

  // Organizar funcionalidades por categorias
  const coreFeatures = mockFeatures.slice(0, 3).filter(feature => feature.name !== "Newsletter Educacional"); // Principais: Argumentos, Repertório (sem Newsletter)
  const practiceFeatures = mockFeatures.slice(4, 6); // Prática: Estilo, Simulador
  const creationFeatures = [mockFeatures[6]]; // Criação: Criador de Propostas

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
              <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-home">
                <Home size={14} />
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-functionalities">
                <Grid3x3 size={14} />
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
                LS
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user-mobile">
                LS
              </div>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                className="p-2 border-soft-gray/30 hover:border-bright-blue text-soft-gray hover:text-bright-blue"
                data-testid="button-mobile-menu"
              >
                <Menu size={16} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-home"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={16} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link 
                  href="/functionalities" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid3x3 size={16} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Book size={16} />
                  <span className="font-medium">Newsletter</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={16} />
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
                    <LogOut size={16} />
                    <span>Sair</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Functionalities Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-blue mb-4">Todas as Funcionalidades</h1>
          <p className="text-lg text-soft-gray">Explore todas as ferramentas do DissertAI para revolucionar sua escrita</p>
        </div>

        {/* Core Features Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-4">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Ferramentas Principais</h2>
              <p className="text-soft-gray">Os pilares fundamentais para uma redação de qualidade</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {coreFeatures.map((feature) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <LiquidGlassCard key={feature.id} className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200 cursor-pointer group h-full" data-testid={`card-feature-${feature.id}`}>
                  <div className="text-center h-full flex flex-col">
                    <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-3">{feature.name}</h3>
                    <p className="text-soft-gray text-sm mb-6 leading-relaxed flex-grow">{feature.description}</p>
                    <Button 
                      onClick={() => handleFeatureAccess(feature.name)}
                      className="w-full bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 mt-auto"
                      data-testid={`button-access-${feature.id}`}
                    >
                      Acessar Ferramenta
                    </Button>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        </div>

        {/* Practice Features Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center mr-4">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Ferramentas de Prática</h2>
              <p className="text-soft-gray">Pratique e aprimore suas habilidades de escrita</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {practiceFeatures.map((feature) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <LiquidGlassCard key={feature.id} className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20 hover:border-dark-blue/40 transition-all duration-200 cursor-pointer group" data-testid={`card-feature-${feature.id}`}>
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark-blue mb-3">{feature.name}</h3>
                      <p className="text-soft-gray mb-4 leading-relaxed">{feature.description}</p>
                      <Button 
                        onClick={() => handleFeatureAccess(feature.name)}
                        className="bg-gradient-to-r from-dark-blue to-soft-gray text-white hover:from-dark-blue/90 hover:to-soft-gray/90"
                        data-testid={`button-access-${feature.id}`}
                      >
                        Começar Prática
                      </Button>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        </div>

        {/* Creation Features Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center mr-4">
              <Lightbulb className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Ferramentas de Criação</h2>
              <p className="text-soft-gray">Crie conteúdo personalizado e organize seu aprendizado</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {creationFeatures.map((feature) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <LiquidGlassCard key={feature.id} className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 hover:border-bright-blue/40 transition-all duration-200 cursor-pointer group" data-testid={`card-feature-${feature.id}`}>
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark-blue mb-3">{feature.name}</h3>
                      <p className="text-soft-gray mb-4 leading-relaxed">{feature.description}</p>
                      <Button 
                        onClick={() => handleFeatureAccess(feature.name)}
                        className="bg-gradient-to-r from-soft-gray to-bright-blue text-white hover:from-soft-gray/90 hover:to-bright-blue/90"
                        data-testid={`button-access-${feature.id}`}
                      >
                        Explorar Ferramenta
                      </Button>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            })}
            
          </div>
        </div>

        {/* Biblioteca Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mr-4">
              <Archive className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Biblioteca</h2>
              <p className="text-soft-gray">Organize e acesse todo seu conteúdo criado</p>
            </div>
          </div>
          <LiquidGlassCard className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50 hover:border-purple-300/70 transition-all duration-200 cursor-pointer group" data-testid="card-biblioteca">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Archive className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-dark-blue mb-3">Biblioteca Pessoal</h3>
                <p className="text-soft-gray mb-4 leading-relaxed">Repositório inteligente de todo seu aprendizado organizado por categorias</p>
                <Button 
                  onClick={() => setLocation('/biblioteca?from=functionalities')}
                  className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
                  data-testid="button-access-biblioteca"
                >
                  Acessar Biblioteca
                </Button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Quick Access Section */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-quick-access">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-dark-blue mb-4">Não sabe por onde começar?</h3>
            <p className="text-soft-gray mb-6 max-w-2xl mx-auto">
              Recomendamos começar com o <strong>Arquiteto de Argumentos</strong> para estruturar suas ideias, 
              depois explorar o <strong>Repertório</strong> para enriquecer seu conhecimento, 
              e finalmente praticar no <strong>Simulador de Provas</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => handleFeatureAccess("Arquiteto de Argumentos")}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                data-testid="button-quick-arguments"
              >
                1. Construir Argumentos
              </Button>
              <Button 
                onClick={() => handleFeatureAccess("Explorador de Repertório")}
                className="bg-gradient-to-r from-dark-blue to-soft-gray text-white hover:from-dark-blue/90 hover:to-soft-gray/90"
                data-testid="button-quick-repertoire"
              >
                2. Explorar Repertório
              </Button>
              <Button 
                onClick={() => handleFeatureAccess("Simulador de Prova")}
                className="bg-gradient-to-r from-soft-gray to-bright-blue text-white hover:from-soft-gray/90 hover:to-bright-blue/90"
                data-testid="button-quick-simulator"
              >
                3. Praticar Redações
              </Button>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}