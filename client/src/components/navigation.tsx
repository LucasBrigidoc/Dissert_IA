import { Link, useLocation } from "wouter";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Verifica se é uma página de landing (não internas)
  const isLandingPage = ['/', '/features', '/pricing', '/about', '/blog'].includes(location);
  
  // Função para verificar se o link está ativo
  const isActive = (href: string) => {
    return isLandingPage && location === href;
  };

  // Classes para links ativos (apenas em páginas de landing)
  const getNavLinkClasses = (href: string) => {
    const baseClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200";
    if (isActive(href)) {
      return `${baseClasses} text-bright-blue bg-bright-blue/15 font-semibold text-lg`;
    }
    return `${baseClasses} text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10`;
  };

  // Classes para navegação mobile
  const getMobileNavLinkClasses = (href: string) => {
    const baseClasses = "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200";
    if (isActive(href)) {
      return `${baseClasses} text-bright-blue bg-bright-blue/15 font-semibold text-lg`;
    }
    return `${baseClasses} text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-1" data-testid="link-home" onClick={closeMenu}>
          <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
            <Sparkles className="text-white text-sm" />
          </div>
          <span className="text-3xl font-bold font-playfair" style={{color: '#5087ff'}}>
            DISSERT<span style={{color: '#6b7280'}}>IA</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/" className={getNavLinkClasses("/")} data-testid="link-inicio">
            <span className="font-medium">Início</span>
          </Link>
          <Link href="/features" className={getNavLinkClasses("/features")} data-testid="link-funcionalidades">
            <span className="font-medium">Funcionalidades</span>
          </Link>
          <Link href="/pricing" className={getNavLinkClasses("/pricing")} data-testid="link-planos">
            <span className="font-medium">Planos</span>
          </Link>
          <Link href="/blog" className={getNavLinkClasses("/blog")} data-testid="link-blog">
            <span className="font-medium">Blog</span>
          </Link>
          <Link href="/about" className={getNavLinkClasses("/about")} data-testid="link-sobre">
            <span className="font-medium">Sobre</span>
          </Link>
        </div>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link href="/login" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-soft-gray hover:text-bright-blue border border-soft-gray/30 hover:border-bright-blue transition-all duration-200" data-testid="button-entrar">
            <span className="font-medium">Entrar</span>
          </Link>
          <Link href="/signup" className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 transition-all duration-200" data-testid="button-comecar">
            <span className="font-medium">Criar Conta</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-3">
          <button
            onClick={toggleMenu}
            className="p-2 border border-soft-gray/30 hover:border-bright-blue text-soft-gray hover:text-bright-blue rounded-lg transition-all duration-200"
            data-testid="button-menu-toggle"
            aria-label="Toggle menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-40">
          <div className="container mx-auto px-6 py-4 space-y-2">
            <Link 
              href="/" 
              className={getMobileNavLinkClasses("/")}
              data-testid="link-inicio-mobile"
              onClick={closeMenu}
            >
              <span className="font-medium">Início</span>
            </Link>
            <Link 
              href="/features" 
              className={getMobileNavLinkClasses("/features")}
              data-testid="link-funcionalidades-mobile"
              onClick={closeMenu}
            >
              <span className="font-medium">Funcionalidades</span>
            </Link>
            <Link 
              href="/pricing" 
              className={getMobileNavLinkClasses("/pricing")}
              data-testid="link-planos-mobile"
              onClick={closeMenu}
            >
              <span className="font-medium">Planos</span>
            </Link>
            <Link 
              href="/blog" 
              className={getMobileNavLinkClasses("/blog")}
              data-testid="link-blog-mobile"
              onClick={closeMenu}
            >
              <span className="font-medium">Blog</span>
            </Link>
            <Link 
              href="/about" 
              className={getMobileNavLinkClasses("/about")}
              data-testid="link-sobre-mobile"
              onClick={closeMenu}
            >
              <span className="font-medium">Sobre</span>
            </Link>
            <div className="border-t pt-4">
              <Link 
                href="/login" 
                className="block w-full text-center text-soft-gray hover:text-bright-blue border border-soft-gray/30 hover:border-bright-blue px-6 py-3 rounded-lg mb-3 transition-all duration-200" 
                data-testid="button-entrar-mobile"
                onClick={closeMenu}
              >
                Entrar
              </Link>
              <Link 
                href="/signup" 
                className="block w-full text-center bg-gradient-to-r from-bright-blue to-dark-blue text-white px-6 py-3 rounded-lg transition-all duration-200" 
                data-testid="button-comecar-mobile"
                onClick={closeMenu}
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
