import { useState, useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Sparkles, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Brain, Edit, Newspaper, Archive, Grid3x3, Menu, PenTool, Award, Zap, BookOpen, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { mockFeatures } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { FunctionalitiesOnboardingTour } from "@/components/FunctionalitiesOnboardingTour";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function FunctionalitiesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user should see functionalities onboarding tour
  useEffect(() => {
    const hasSeenFunctionalitiesOnboarding = localStorage.getItem('hasSeenFunctionalitiesOnboarding');
    if (user && !hasSeenFunctionalitiesOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const completeFunctionalitiesOnboardingMutation = useMutation({
    mutationFn: async () => {
      localStorage.setItem('hasSeenFunctionalitiesOnboarding', 'true');
      return { success: true };
    },
    onSuccess: () => {
      setShowOnboarding(false);
    },
  });

  const handleOnboardingComplete = () => {
    completeFunctionalitiesOnboardingMutation.mutate();
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenFunctionalitiesOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    setLocation("/");
  };

  const handleFeatureAccess = (featureName: string) => {
    const routeMap: { [key: string]: string } = {
      "Refinamento de Ideias": "/argumentos",
      "Explorador de Repertório": "/repertorio?from=functionalities", 
      "Simulador de Prova": "/simulador?from=functionalities",
      "Controlador de Escrita": "/controlador-escrita?from=functionalities",
      "Estrutura Roterizada": "/estrutura-roterizada?from=functionalities",
      "Newsletter Educacional": "/dashboard",
      "Explorador de Propostas": "/propostas?from=functionalities",
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
    pen: PenTool,
    edit3: Edit3,
    "graduation-cap": GraduationCap,
    lightbulb: Lightbulb,
    archive: Archive
  };

  // Organizar funcionalidades por categorias
  const coreFeatures = mockFeatures.filter(feature => 
    feature.name === "Refinamento de Ideias" || 
    feature.name === "Explorador de Repertório"
  );
  const practiceFeatures = mockFeatures.filter(feature => 
    feature.name === "Simulador de Prova" ||
    feature.name === "Controlador de Escrita"
  );
  const creationFeatures = mockFeatures.filter(feature => 
    feature.name === "Estrutura Roterizada" ||
    feature.name === "Explorador de Propostas"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-1" data-testid="link-dashboard-logo">
              <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                <Sparkles className="text-white text-sm" />
              </div>
              <span className="text-3xl font-bold font-playfair" style={{color: '#5087ff'}}>
                DISSERT<span style={{color: '#6b7280'}}>IA</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-4">
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
            <div className="hidden lg:flex items-center space-x-8">
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
                {getInitials(user?.name)}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user-mobile">
                {getInitials(user?.name)}
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
                  <Home size={12} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link 
                  href="/functionalities" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid3x3 size={10} />
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
      {/* Functionalities Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-blue mb-4">Todas as Funcionalidades</h1>
          <p className="text-lg text-soft-gray">Explore todas as ferramentas do DissertIA para revolucionar sua escrita</p>
        </div>

        {/* Core Features Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-4">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Ferramentas de Refinamento</h2>
              <p className="text-soft-gray">Os pilares fundamentais para refinar a base da escrita</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((feature) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <LiquidGlassCard key={feature.id} className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200 cursor-pointer group" data-testid={`card-feature-${feature.id}`}>
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark-blue mb-3">{feature.name}</h3>
                      <p className="text-soft-gray mb-4 leading-relaxed">{feature.description}</p>
                      <Button 
                        onClick={() => handleFeatureAccess(feature.name)}
                        className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                        data-testid={`button-access-${feature.id}`}
                      >
                        Acessar Ferramenta
                      </Button>
                    </div>
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
              <p className="text-soft-gray">Crie conteúdo personalizado e aprenda vendo exemplos</p>
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

        {/* Quick Access Section - Learning Paths Carousel */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-quick-access">
          <div className="py-8 px-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-blue mb-4">Não sabe por onde começar?</h3>
              <p className="text-soft-gray mb-2 max-w-3xl mx-auto text-lg">
                Escolha um fluxo de aprendizado personalizado para maximizar seus resultados
              </p>
              <p className="text-soft-gray/80 max-w-2xl mx-auto text-sm">
                Cada caminho foi criado para combinar ferramentas específicas e ajudá-lo a desenvolver habilidades essenciais na escrita de redações
              </p>
            </div>

            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent>
                {/* Path 1: Iniciante - Construção de Base */}
                <CarouselItem>
                  <div className="p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-bright-blue/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center shrink-0">
                          <BookOpen className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-dark-blue">Caminho Iniciante</h4>
                          <p className="text-bright-blue font-semibold">Construindo Sua Base de Escrita</p>
                        </div>
                      </div>
                      <p className="text-soft-gray mb-6 leading-relaxed">
                        <strong className="text-dark-blue">Por que usar esse caminho?</strong> Ideal para quem está começando ou precisa fortalecer os fundamentos da escrita argumentativa. Este fluxo ajuda você a construir uma base sólida de conhecimentos e desenvolver argumentos coerentes antes de partir para a prática intensiva.
                      </p>
                      <div className="bg-bright-blue/10 rounded-lg p-5 mb-6">
                        <p className="text-sm font-semibold text-dark-blue mb-3">📚 O que você vai desenvolver:</p>
                        <ul className="text-sm text-soft-gray space-y-2 ml-4">
                          <li>• Capacidade de construir argumentos sólidos e convincentes</li>
                          <li>• Repertório cultural amplo com citações e referências confiáveis</li>
                          <li>• Confiança para começar a escrever suas primeiras redações</li>
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={() => handleFeatureAccess("Refinamento de Ideias")}
                          className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path1-step1"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">1</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Construir Argumentos</div>
                              <div className="text-xs opacity-90">Desenvolva ideias fortes e estruturadas</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Explorador de Repertório")}
                          className="bg-gradient-to-r from-dark-blue to-soft-gray text-white hover:from-dark-blue/90 hover:to-soft-gray/90 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path1-step2"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">2</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Explorar Repertório</div>
                              <div className="text-xs opacity-90">Enriqueça seus textos com conhecimento</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Simulador de Prova")}
                          className="bg-gradient-to-r from-soft-gray to-bright-blue text-white hover:from-soft-gray/90 hover:to-bright-blue/90 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path1-step3"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">3</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Praticar Redações</div>
                              <div className="text-xs opacity-90">Aplique tudo que aprendeu na prática</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Path 2: Intermediário - Prática Guiada */}
                <CarouselItem>
                  <div className="p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-purple-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shrink-0">
                          <FileText className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-dark-blue">Caminho Intermediário</h4>
                          <p className="text-purple-600 font-semibold">Prática Guiada e Aperfeiçoamento</p>
                        </div>
                      </div>
                      <p className="text-soft-gray mb-6 leading-relaxed">
                        <strong className="text-dark-blue">Por que usar esse caminho?</strong> Perfeito para quem já tem noções básicas e quer praticar de forma estruturada. Este fluxo equilibra prática intensiva com revisão guiada, permitindo que você identifique e corrija seus pontos fracos enquanto desenvolve fluência na escrita.
                      </p>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 mb-6">
                        <p className="text-sm font-semibold text-dark-blue mb-3">📝 O que você vai desenvolver:</p>
                        <ul className="text-sm text-soft-gray space-y-2 ml-4">
                          <li>• Habilidade de escrever sob pressão e prazos limitados</li>
                          <li>• Capacidade de autocrítica e revisão estruturada</li>
                          <li>• Domínio das técnicas de argumentação e contra-argumentação</li>
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={() => handleFeatureAccess("Simulador de Prova")}
                          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path2-step1"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">1</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Praticar no Simulador</div>
                              <div className="text-xs opacity-90">Escreva em ambiente realista de prova</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Controlador de Escrita")}
                          className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path2-step2"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">2</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Refinar com IA</div>
                              <div className="text-xs opacity-90">Receba feedback detalhado e melhore</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Refinamento de Ideias")}
                          className="bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:from-purple-800 hover:to-purple-950 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path2-step3"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">3</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Fortalecer Argumentos</div>
                              <div className="text-xs opacity-90">Aprimore pontos identificados na revisão</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Path 3: Avançado - Excelência e Criatividade */}
                <CarouselItem>
                  <div className="p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-amber-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shrink-0">
                          <Award className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-dark-blue">Caminho Avançado</h4>
                          <p className="text-amber-600 font-semibold">Excelência e Criatividade</p>
                        </div>
                      </div>
                      <p className="text-soft-gray mb-6 leading-relaxed">
                        <strong className="text-dark-blue">Por que usar esse caminho?</strong> Desenvolvido para quem busca nota máxima e quer se destacar. Este fluxo combina exploração criativa de temas, estruturação profissional e prática variada para elevar sua escrita ao nível de excelência esperado nos vestibulares mais competitivos.
                      </p>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-5 mb-6">
                        <p className="text-sm font-semibold text-dark-blue mb-3">🏆 O que você vai desenvolver:</p>
                        <ul className="text-sm text-soft-gray space-y-2 ml-4">
                          <li>• Originalidade e profundidade na abordagem de temas complexos</li>
                          <li>• Domínio completo da estrutura dissertativa-argumentativa</li>
                          <li>• Repertório diversificado e relevante para qualquer tema</li>
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={() => handleFeatureAccess("Explorador de Propostas")}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path3-step1"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">1</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Explorar Temas</div>
                              <div className="text-xs opacity-90">Descubra propostas relevantes e atuais</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Estrutura Roterizada")}
                          className="bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path3-step2"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">2</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Criar Estrutura Personalizada</div>
                              <div className="text-xs opacity-90">Monte roteiros adaptados ao seu estilo</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Simulador de Prova")}
                          className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path3-step3"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">3</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Executar com Excelência</div>
                              <div className="text-xs opacity-90">Aplique técnicas avançadas na prática</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Path 4: Preparação Intensiva - Foco em Vestibular */}
                <CarouselItem>
                  <div className="p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border-2 border-red-500/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shrink-0">
                          <Zap className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-dark-blue">Preparação Intensiva</h4>
                          <p className="text-red-600 font-semibold">Foco Total em Vestibular</p>
                        </div>
                      </div>
                      <p className="text-soft-gray mb-6 leading-relaxed">
                        <strong className="text-dark-blue">Por que usar esse caminho?</strong> Ideal para quem está próximo da prova e precisa de preparação intensiva e objetiva. Este fluxo maximiza seu tempo combinando prática realista, feedback rápido e revisão estratégica para garantir desempenho consistente no dia da prova.
                      </p>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-5 mb-6">
                        <p className="text-sm font-semibold text-dark-blue mb-3">⚡ O que você vai desenvolver:</p>
                        <ul className="text-sm text-soft-gray space-y-2 ml-4">
                          <li>• Velocidade e precisão na escrita sob pressão de tempo</li>
                          <li>• Estratégias para diferentes tipos de propostas</li>
                          <li>• Confiança e controle emocional para o dia da prova</li>
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button 
                          onClick={() => handleFeatureAccess("Explorador de Propostas")}
                          className="bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path4-step1"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">1</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Selecionar Tema Estratégico</div>
                              <div className="text-xs opacity-90">Escolha temas com alta chance de cair</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Simulador de Prova")}
                          className="bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path4-step2"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">2</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Simular Condições Reais</div>
                              <div className="text-xs opacity-90">Pratique com cronômetro e ambiente real</div>
                            </div>
                          </div>
                        </Button>
                        <Button 
                          onClick={() => handleFeatureAccess("Biblioteca Pessoal")}
                          className="bg-gradient-to-r from-red-700 to-red-900 text-white hover:from-red-800 hover:to-red-950 w-full justify-start h-auto py-4 px-6"
                          data-testid="button-path4-step3"
                        >
                          <div className="flex items-center gap-4 w-full">
                            <span className="text-2xl font-bold">3</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-base">Revisar e Consolidar</div>
                              <div className="text-xs opacity-90">Analise padrões e mantenha evolução</div>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" data-testid="button-carousel-prev" />
              <CarouselNext className="hidden md:flex" data-testid="button-carousel-next" />
            </Carousel>

            <div className="text-center mt-6">
              <p className="text-xs text-soft-gray/70">
                💡 Dica: Use as setas laterais para navegar entre os diferentes caminhos de aprendizado
              </p>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Functionalities Onboarding Tour */}
      {showOnboarding && (
        <FunctionalitiesOnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}