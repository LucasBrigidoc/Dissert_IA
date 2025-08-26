import { Link, useLocation } from "wouter";
import { Plus } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 liquid-glass border-b border-white/20">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
          <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
            <Plus className="text-white text-sm" />
          </div>
          <span className="text-2xl font-bold text-dark-blue">
            DISSERT<span className="text-bright-blue">AI</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
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
          <a href="#faq" className="text-dark-blue hover:text-bright-blue smooth-transition" data-testid="link-faq">
            FAQ
          </a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-bright-blue hover:bg-bright-blue/10 px-4 py-2 rounded-lg smooth-transition" data-testid="button-entrar">
            Entrar
          </Link>
          <Link href="/signup" className="bg-bright-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 smooth-transition hover-scale" data-testid="button-comecar">
            Começar Agora
          </Link>
        </div>
      </nav>
    </header>
  );
}
