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
          <div className="py-6 px-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-dark-blue mb-2">Não sabe por onde começar?</h3>
              <p className="text-soft-gray max-w-2xl mx-auto text-sm">
                Escolha um objetivo de aprendizado e siga o fluxo de ferramentas recomendado
              </p>
            </div>

            <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-16">
              <Carousel 
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {/* Objetivo 1: Praticar a Escrita */}
                  <CarouselItem>
                    <div className="p-1 sm:p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow border border-bright-blue/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center shrink-0">
                            <Edit3 className="text-white" size={14} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg font-bold text-dark-blue leading-tight">Praticar a Escrita</h4>
                            <p className="text-[10px] sm:text-xs text-soft-gray truncate">Refine seu texto e aprimore suas habilidades</p>
                          </div>
                        </div>
                        <p className="hidden sm:block text-sm text-soft-gray mb-4">
                          Use o controlador de escrita para melhorar seus textos, enriqueça com repertório cultural e pratique no simulador para consolidar o aprendizado.
                        </p>
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          <Button 
                            onClick={() => handleFeatureAccess("Controlador de Escrita")}
                            className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path1-step1"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">1</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Controlador de Escrita</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Refine e melhore seu texto com IA</div>
                              </div>
                            </div>
                          </Button>
                          <Button 
                            onClick={() => handleFeatureAccess("Explorador de Repertório")}
                            className="bg-gradient-to-r from-dark-blue to-soft-gray text-white hover:from-dark-blue/90 hover:to-soft-gray/90 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path1-step2"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">2</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Explorador de Repertório</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Enriqueça com citações e referências</div>
                              </div>
                            </div>
                          </Button>
                          <Button 
                            onClick={() => handleFeatureAccess("Simulador de Prova")}
                            className="bg-gradient-to-r from-soft-gray to-bright-blue text-white hover:from-soft-gray/90 hover:to-bright-blue/90 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path1-step3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">3</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Simulador de Prova</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Pratique em ambiente realista</div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Objetivo 2: Conhecer e Estruturar Propostas */}
                  <CarouselItem>
                    <div className="p-1 sm:p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow border border-purple-500/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shrink-0">
                            <BookOpen className="text-white" size={14} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg font-bold text-dark-blue leading-tight">Conhecer Propostas</h4>
                            <p className="text-[10px] sm:text-xs text-soft-gray truncate">Explore, estruture e reescreva temas</p>
                          </div>
                        </div>
                        <p className="hidden sm:block text-sm text-soft-gray mb-4">
                          Descubra propostas relevantes, visualize de forma roterizada e use o controlador para reescrever e melhorar sua compreensão dos temas.
                        </p>
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          <Button 
                            onClick={() => handleFeatureAccess("Explorador de Propostas")}
                            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path2-step1"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">1</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Explorador de Propostas</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Conheça propostas atuais e relevantes</div>
                              </div>
                            </div>
                          </Button>
                          <Button 
                            onClick={() => handleFeatureAccess("Estrutura Roterizada")}
                            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path2-step2"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">2</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Estrutura Roterizada</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Veja propostas de forma estruturada</div>
                              </div>
                            </div>
                          </Button>
                          <Button 
                            onClick={() => handleFeatureAccess("Controlador de Escrita")}
                            className="bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:from-purple-800 hover:to-purple-950 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path2-step3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">3</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Controlador de Escrita</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Reescreva e visualize melhor</div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Objetivo 3: Desenvolver Argumentação */}
                  <CarouselItem>
                    <div className="p-1 sm:p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-5 shadow border border-bright-blue/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-bright-blue to-purple-600 rounded-full flex items-center justify-center shrink-0">
                            <Lightbulb className="text-white" size={14} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg font-bold text-dark-blue leading-tight">Desenvolver Argumentação</h4>
                            <p className="text-[10px] sm:text-xs text-soft-gray truncate">Construa ideias sólidas e convincentes</p>
                          </div>
                        </div>
                        <p className="hidden sm:block text-sm text-soft-gray mb-4">
                          Refine suas ideias, busque repertório cultural e teste seus argumentos em redações completas no simulador.
                        </p>
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          <Button 
                            onClick={() => handleFeatureAccess("Refinamento de Ideias")}
                            className="bg-gradient-to-r from-bright-blue to-purple-600 text-white hover:from-bright-blue/90 hover:to-purple-700 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path3-step1"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">1</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Refinamento de Ideias</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Construa argumentos fortes</div>
                              </div>
                            </div>
                          </Button>
                          <Button 
                            onClick={() => handleFeatureAccess("Explorador de Repertório")}
                            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path3-step2"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">2</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Explorador de Repertório</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Fundamente com conhecimento</div>
                              </div>
                            </div>
                          </Button>
                          <Button 
                            onClick={() => handleFeatureAccess("Simulador de Prova")}
                            className="bg-gradient-to-r from-purple-600 to-dark-blue text-white hover:from-purple-700 hover:to-dark-blue/90 w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            data-testid="button-path3-step3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 w-full">
                              <span className="text-base sm:text-lg font-bold w-5 text-center">3</span>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-xs sm:text-sm truncate">Simulador de Prova</div>
                                <div className="text-[10px] sm:text-xs opacity-80 truncate">Aplique na prática completa</div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-14 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-md" data-testid="button-carousel-prev" />
                <CarouselNext className="hidden md:flex -right-14 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-md" data-testid="button-carousel-next" />
              </Carousel>
            </div>

            <div className="text-center mt-4">
              <p className="text-xs text-soft-gray/60">
                💡 Use as setas laterais ou arraste para navegar entre os objetivos
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