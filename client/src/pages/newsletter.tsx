import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Sparkles, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Brain, Edit, Plus, Archive, ArrowRight, Eye, Menu, Newspaper, BookOpen, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Newsletter } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NewsletterOnboardingTour } from "@/components/NewsletterOnboardingTour";

export default function NewsletterPage() {
  const [, setLocation] = useLocation();
  const { user, logout, loading } = useAuth();
  const [selectedNewsletter, setSelectedNewsletter] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  // Check if user should see newsletter onboarding tour
  useEffect(() => {
    const hasSeenNewsletterOnboarding = localStorage.getItem('hasSeenNewsletterOnboarding');
    if (user && !hasSeenNewsletterOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const completeNewsletterOnboardingMutation = useMutation({
    mutationFn: async () => {
      localStorage.setItem('hasSeenNewsletterOnboarding', 'true');
      return { success: true };
    },
    onSuccess: () => {
      setShowOnboarding(false);
    },
  });

  const handleOnboardingComplete = () => {
    completeNewsletterOnboardingMutation.mutate();
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenNewsletterOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Fetch newsletters from API (public feed of sent newsletters)
  const { data: newsletters = [], isLoading: loadingNewsletters } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletter/feed"],
  });

  // Fetch saved newsletters
  const { data: savedNewslettersData } = useQuery<{results: Newsletter[], count: number}>({
    queryKey: ["/api/newsletters/saved"],
    enabled: !!user,
  });

  const savedNewsletters = savedNewslettersData?.results || [];

  // Check if a newsletter is saved
  const isNewsletterSaved = (newsletterId: string) => {
    return savedNewsletters.some(n => n.id === newsletterId);
  };

  // Save newsletter mutation
  const saveNewsletter = useMutation({
    mutationFn: async (newsletterId: string) => {
      return await apiRequest(`/api/newsletters/${newsletterId}/save`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters/saved"] });
      toast({
        title: "Newsletter salva!",
        description: "A newsletter foi adicionada à sua biblioteca.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a newsletter. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Remove saved newsletter mutation
  const removeSavedNewsletter = useMutation({
    mutationFn: async (newsletterId: string) => {
      return await apiRequest(`/api/newsletters/${newsletterId}/save`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters/saved"] });
      toast({
        title: "Newsletter removida",
        description: "A newsletter foi removida da sua biblioteca.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a newsletter. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleToggleSave = (newsletterId: string) => {
    if (isNewsletterSaved(newsletterId)) {
      removeSavedNewsletter.mutate(newsletterId);
    } else {
      saveNewsletter.mutate(newsletterId);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleReadNewsletter = (newsletterId: string) => {
    setSelectedNewsletter(newsletterId);
  };

  const handleBackToList = () => {
    setSelectedNewsletter(null);
  };

  // Filter newsletters to only show sent ones
  const sentNewsletters = newsletters.filter(n => n.status === "sent");
  
  // Get the latest newsletter (marked as new) or the most recently published
  const latestNewsletter = sentNewsletters.find(n => n.isNew) || 
    sentNewsletters.sort((a, b) => new Date(b.publishDate || b.createdAt!).getTime() - new Date(a.publishDate || a.createdAt!).getTime())[0];
  
  // Get previous newsletters (not marked as new and not the latest)
  const previousNewsletters = sentNewsletters.filter(n => n.id !== latestNewsletter?.id && !n.isNew);
  
  const currentNewsletter = selectedNewsletter ? sentNewsletters.find(n => n.id === selectedNewsletter) : null;

  // Loading state - wait for both auth and newsletters to load
  if (loading || loadingNewsletters) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-bright-blue" size={32} />
      </div>
    );
  }

  // Se uma newsletter específica foi selecionada, mostra a visualização completa
  if (currentNewsletter) {
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
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Plus size={14} />
                <span className="font-medium">Funcionalidades</span>
              </Link>
              <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-newsletter">
                <Newspaper size={14} />
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
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus size={10} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Newspaper size={12} />
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

        {/* Newsletter Content */}
        <div className="container mx-auto px-6 py-8 pt-24">
          <div className="mb-6">
            <Button
              onClick={handleBackToList}
              variant="outline"
              className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
              data-testid="button-back-to-list"
            >
              ← Voltar para Lista de Newsletters
            </Button>
          </div>
          
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 max-w-4xl mx-auto" data-testid="card-newsletter-content">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Newspaper className="text-white" size={24} />
                </div>
                <div>
                  <Badge className="bg-bright-blue/20 text-bright-blue mb-2">{currentNewsletter.category}</Badge>
                  <h1 className="text-3xl font-bold text-dark-blue">{currentNewsletter.title}</h1>
                </div>
              </div>
              {currentNewsletter.isNew && (
                <Badge className="bg-green-500 text-white">Nova</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-6 mb-8 text-sm text-soft-gray">
              <div className="flex items-center">
                <Calendar className="mr-2" size={16} />
                <span>{new Date(currentNewsletter.publishDate || currentNewsletter.createdAt!).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span>{currentNewsletter.readTime || "5 min"} de leitura</span>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div className="text-lg text-soft-gray mb-8 leading-relaxed italic border-l-4 border-bright-blue pl-6">
                {currentNewsletter.excerpt}
              </div>
              
              <div className="text-dark-blue leading-relaxed whitespace-pre-line">
                {currentNewsletter.content}
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    );
  }

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
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Plus size={14} />
                <span className="font-medium">Funcionalidades</span>
              </Link>
              <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-newsletter">
                <Newspaper size={14} />
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
            <div className="lg:hidden flex items-center space-x-4">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                {getInitials(user?.name)}
              </div>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                size="sm"
                className="p-2"
                data-testid="button-mobile-menu"
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-40">
              <div className="container mx-auto px-6 py-4 space-y-2">
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
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus size={10} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Newspaper size={12} />
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
                <div className="border-t pt-4">
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
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

      {/* Newsletter Content */}
      <div className="container mx-auto px-3 md:px-6 py-6 md:py-8 pt-20 md:pt-24 space-y-6 md:space-y-8">
        
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-dark-blue mb-3 md:mb-4">Newsletter Educacional</h1>
          <p className="text-base md:text-lg text-soft-gray">Conteúdo semanal curado para enriquecer suas redações</p>
        </div>

        {/* Latest Newsletter Section */}
        <div className="mb-8 md:mb-12 latest-newsletter-section">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-3 md:mr-4">
              <Newspaper className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-dark-blue">Newsletter da Semana</h2>
              <p className="text-sm md:text-base text-soft-gray">Conteúdo mais recente e relevante</p>
            </div>
          </div>
          
          {latestNewsletter ? (
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200" data-testid={`card-newsletter-${latestNewsletter.id}`}>
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Badge className="bg-green-500 text-white text-xs">Nova</Badge>
                  <Badge className="bg-bright-blue/20 text-bright-blue text-xs">{latestNewsletter.category || "Newsletter"}</Badge>
                </div>
                <div className="text-xs md:text-sm text-soft-gray">{latestNewsletter.readTime || "5 min"} de leitura</div>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-dark-blue mb-3 md:mb-4">{latestNewsletter.title}</h3>
              <p className="text-sm md:text-base text-soft-gray mb-4 md:mb-6 leading-relaxed">{latestNewsletter.excerpt || latestNewsletter.previewText || "Confira o conteúdo desta newsletter."}</p>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="flex items-center text-xs md:text-sm text-soft-gray">
                  <Calendar className="mr-2" size={14} />
                  <span>Publicada em {new Date(latestNewsletter.publishDate || latestNewsletter.createdAt!).toLocaleDateString('pt-BR')}</span>
                </div>
                <Button 
                  onClick={() => handleReadNewsletter(latestNewsletter.id)}
                  className="w-full md:w-auto bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                  data-testid={`button-read-newsletter-${latestNewsletter.id}`}
                >
                  <Eye className="mr-2" size={14} />
                  <span className="text-sm md:text-base">Ler</span>
                </Button>
              </div>
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="text-center py-12">
                <Newspaper className="mx-auto mb-4 text-soft-gray" size={48} />
                <h3 className="text-lg font-semibold mb-2 text-dark-blue">Nenhuma newsletter publicada ainda</h3>
                <p className="text-soft-gray">
                  Aguarde pela primeira newsletter! Quando publicada, ela aparecerá aqui.
                </p>
              </div>
            </LiquidGlassCard>
          )}
        </div>

        {/* Previous Newsletters Section */}
        <div className="previous-newsletters-section">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center mr-3 md:mr-4">
              <Archive className="text-white" size={16} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-dark-blue">Newsletters Anteriores</h2>
              <p className="text-sm md:text-base text-soft-gray">Acesse todo o conteúdo educacional já publicado</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {previousNewsletters.length > 0 ? (
              previousNewsletters.map((newsletter) => (
                <LiquidGlassCard key={newsletter.id} className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 hover:border-bright-blue/40 transition-all duration-200 cursor-pointer group" data-testid={`card-newsletter-${newsletter.id}`}>
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <Badge className="bg-soft-gray/20 text-dark-blue text-xs">{newsletter.category || "Newsletter"}</Badge>
                    <div className="text-xs md:text-sm text-soft-gray">{newsletter.readTime || "5 min"}</div>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-semibold text-dark-blue mb-2 md:mb-3 group-hover:text-bright-blue transition-colors">{newsletter.title}</h3>
                  <p className="text-soft-gray text-xs md:text-sm mb-3 md:mb-4 leading-relaxed line-clamp-3">{newsletter.excerpt || newsletter.previewText || "Confira o conteúdo desta newsletter."}</p>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div className="text-xs text-soft-gray">
                      {new Date(newsletter.publishDate || newsletter.createdAt!).toLocaleDateString('pt-BR')}
                    </div>
                    <Button 
                      onClick={() => handleReadNewsletter(newsletter.id)}
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 group-hover:border-bright-blue/50"
                      data-testid={`button-read-newsletter-${newsletter.id}`}
                    >
                      <Eye className="mr-2" size={12} />
                      <span className="text-xs md:text-sm">Ler</span>
                    </Button>
                  </div>
                </LiquidGlassCard>
              ))
            ) : (
              <div className="col-span-full">
                <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
                  <div className="text-center py-12">
                    <Archive className="mx-auto mb-4 text-soft-gray" size={48} />
                    <h3 className="text-lg font-semibold mb-2 text-dark-blue">Nenhuma newsletter anterior ainda</h3>
                    <p className="text-soft-gray">
                      Quando novas newsletters forem publicadas, as anteriores aparecerão aqui.
                    </p>
                  </div>
                </LiquidGlassCard>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Onboarding Tour */}
      {showOnboarding && (
        <NewsletterOnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}