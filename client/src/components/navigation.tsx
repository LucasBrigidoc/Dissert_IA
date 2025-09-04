import { Link, useLocation } from "wouter";
import { Plus, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 liquid-glass border-b border-white/20">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" data-testid="link-home" onClick={closeMenu}>
          <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
            <Plus className="text-white text-sm" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-dark-blue">
            DISSERT<span className="text-bright-blue">AI</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link href="/" className="text-dark-blue hover:text-bright-blue smooth-transition" data-testid="link-inicio">
            Início
          </Link>
          <Link href="/features" className="text-dark-blue hover:text-bright-blue smooth-transition" data-testid="link-funcionalidades">
            Funcionalidades
          </Link>
          <Link href="/pricing" className="text-dark-blue hover:text-bright-blue smooth-transition" data-testid="link-planos">
            Planos
          </Link>
          <Link href="/about" className="text-dark-blue hover:text-bright-blue smooth-transition" data-testid="link-sobre">
            Sobre
          </Link>
        </div>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          <Link href="/login" className="bg-bright-blue text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-blue-600 smooth-transition hover-scale text-sm lg:text-base" data-testid="button-entrar">
            Entrar
          </Link>
          <Link href="/signup" className="bg-bright-blue text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-blue-600 smooth-transition hover-scale text-sm lg:text-base" data-testid="button-comecar">
            Começar Agora
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-dark-blue hover:text-bright-blue smooth-transition"
          data-testid="button-menu-toggle"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
          data-testid="overlay-mobile-menu"
        />
      )}

      {/* Mobile Navigation Menu */}
      <div className={`fixed top-[73px] right-0 h-[calc(100vh-73px)] w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`} data-testid="menu-mobile">
        <div className="p-6 space-y-6">
          {/* Mobile Navigation Links */}
          <div className="space-y-4">
            <Link 
              href="/" 
              className="block text-lg text-dark-blue hover:text-bright-blue smooth-transition py-2 border-b border-gray-100" 
              data-testid="link-inicio-mobile"
              onClick={closeMenu}
            >
              Início
            </Link>
            <Link 
              href="/features" 
              className="block text-lg text-dark-blue hover:text-bright-blue smooth-transition py-2 border-b border-gray-100" 
              data-testid="link-funcionalidades-mobile"
              onClick={closeMenu}
            >
              Funcionalidades
            </Link>
            <Link 
              href="/pricing" 
              className="block text-lg text-dark-blue hover:text-bright-blue smooth-transition py-2 border-b border-gray-100" 
              data-testid="link-planos-mobile"
              onClick={closeMenu}
            >
              Planos
            </Link>
            <Link 
              href="/about" 
              className="block text-lg text-dark-blue hover:text-bright-blue smooth-transition py-2 border-b border-gray-100" 
              data-testid="link-sobre-mobile"
              onClick={closeMenu}
            >
              Sobre
            </Link>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="space-y-3 pt-4">
            <Link 
              href="/login" 
              className="block w-full text-center text-bright-blue border border-bright-blue px-6 py-3 rounded-lg smooth-transition hover:bg-bright-blue/10" 
              data-testid="button-entrar-mobile"
              onClick={closeMenu}
            >
              Entrar
            </Link>
            <Link 
              href="/signup" 
              className="block w-full text-center bg-bright-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 smooth-transition" 
              data-testid="button-comecar-mobile"
              onClick={closeMenu}
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
