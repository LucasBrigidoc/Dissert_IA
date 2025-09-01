import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Brain, Edit, Newspaper, Archive, Grid3x3, ArrowRight, Eye, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { mockNewsletters } from "@/lib/mock-data";
import { useState } from "react";

export default function NewsletterPage() {
  const [, setLocation] = useLocation();
  const [selectedNewsletter, setSelectedNewsletter] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setLocation("/");
  };

  const handleReadNewsletter = (newsletterId: number) => {
    setSelectedNewsletter(newsletterId);
  };

  const handleBackToList = () => {
    setSelectedNewsletter(null);
  };

  const currentNewsletter = selectedNewsletter ? mockNewsletters.find(n => n.id === selectedNewsletter) : null;
  const latestNewsletter = mockNewsletters.find(n => n.isNew) || mockNewsletters[0];
  const previousNewsletters = mockNewsletters.filter(n => !n.isNew);

  // Se uma newsletter específica foi selecionada, mostra a visualização completa
  if (currentNewsletter) {
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
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Grid3x3 size={14} />
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
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid3x3 size={16} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Newspaper size={16} />
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
                <span>{new Date(currentNewsletter.publishDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span>{currentNewsletter.readTime} de leitura</span>
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
                <Home size={18} />
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Grid3x3 size={18} />
                <span className="font-medium">Funcionalidades</span>
              </Link>
              <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-newsletter">
                <Newspaper size={18} />
                <span className="font-medium">Newsletter</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-settings">
                <Settings size={18} />
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
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                LS
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                LS
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
                  <Home size={20} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link 
                  href="/functionalities" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid3x3 size={20} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Newspaper size={20} />
                  <span className="font-medium">Newsletter</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={20} />
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
                    <LogOut size={16} />
                    <span>Sair</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Newsletter Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-blue mb-4">Newsletter Educacional</h1>
          <p className="text-lg text-soft-gray">Conteúdo semanal curado para enriquecer suas redações</p>
        </div>

        {/* Latest Newsletter Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-4">
              <Newspaper className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Newsletter da Semana</h2>
              <p className="text-soft-gray">Conteúdo mais recente e relevante</p>
            </div>
          </div>
          
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 hover:border-bright-blue/40 transition-all duration-200" data-testid={`card-newsletter-${latestNewsletter.id}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-500 text-white">Nova</Badge>
                <Badge className="bg-bright-blue/20 text-bright-blue">{latestNewsletter.category}</Badge>
              </div>
              <div className="text-sm text-soft-gray">{latestNewsletter.readTime} de leitura</div>
            </div>
            
            <h3 className="text-2xl font-bold text-dark-blue mb-4">{latestNewsletter.title}</h3>
            <p className="text-soft-gray mb-6 leading-relaxed">{latestNewsletter.excerpt}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-soft-gray">
                <Calendar className="mr-2" size={16} />
                <span>Publicada em {new Date(latestNewsletter.publishDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <Button 
                onClick={() => handleReadNewsletter(latestNewsletter.id)}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                data-testid={`button-read-newsletter-${latestNewsletter.id}`}
              >
                <Eye className="mr-2" size={16} />
                Ler Newsletter Completa
              </Button>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Previous Newsletters Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center mr-4">
              <Archive className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-blue">Newsletters Anteriores</h2>
              <p className="text-soft-gray">Acesse todo o conteúdo educacional já publicado</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousNewsletters.map((newsletter) => (
              <LiquidGlassCard key={newsletter.id} className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 hover:border-bright-blue/40 transition-all duration-200 cursor-pointer group" data-testid={`card-newsletter-${newsletter.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-soft-gray/20 text-dark-blue">{newsletter.category}</Badge>
                  <div className="text-sm text-soft-gray">{newsletter.readTime}</div>
                </div>
                
                <h3 className="text-lg font-semibold text-dark-blue mb-3 group-hover:text-bright-blue transition-colors">{newsletter.title}</h3>
                <p className="text-soft-gray text-sm mb-4 leading-relaxed line-clamp-3">{newsletter.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-soft-gray">
                    {new Date(newsletter.publishDate).toLocaleDateString('pt-BR')}
                  </div>
                  <Button 
                    onClick={() => handleReadNewsletter(newsletter.id)}
                    variant="outline"
                    size="sm"
                    className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 group-hover:border-bright-blue/50"
                    data-testid={`button-read-newsletter-${newsletter.id}`}
                  >
                    <Eye className="mr-2" size={14} />
                    Ler
                  </Button>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 text-center" data-testid="card-newsletter-cta">
          <div className="py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Newspaper className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-dark-blue mb-4">Não perca nenhuma newsletter!</h3>
            <p className="text-soft-gray mb-6 max-w-2xl mx-auto">
              Receba notificações toda semana quando uma nova newsletter for publicada. 
              Conteúdo sempre atualizado com os temas mais relevantes para suas redações.
            </p>
            <Button 
              className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
              data-testid="button-enable-notifications"
            >
              <Newspaper className="mr-2" size={16} />
              Ativar Notificações
            </Button>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}