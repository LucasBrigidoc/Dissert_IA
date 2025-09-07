import { Link } from "wouter";
import { Sparkles, Facebook, Instagram, Twitter, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark-blue text-white py-8 md:py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
                <Sparkles className="text-sm" style={{color: '#5087ff'}} />
              </div>
              <span className="text-3xl font-bold font-playfair" style={{color: '#5087ff'}}>
                DISSERT<span style={{color: '#ffffff'}}>AI</span>
              </span>
            </div>
            <p className="text-white/70 mb-4">
              Revolucionando a escrita educacional com inteligência artificial para estudantes brasileiros.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="max-w-full md:order-last">
            <h4 className="font-semibold mb-3 md:mb-4">Newsletter</h4>
            <p className="text-white/70 mb-3 md:mb-4 text-sm md:text-base">Receba dicas semanais de redação</p>
            <div className="flex w-full max-w-full overflow-hidden">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 min-w-0 px-3 py-2 bg-white/10 rounded-l-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-bright-blue text-sm md:text-base"
                data-testid="input-newsletter-email"
              />
              <button className="bg-bright-blue px-3 py-2 rounded-r-lg hover:bg-blue-600 smooth-transition flex-shrink-0" data-testid="button-newsletter-submit">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4">Company</h4>
            <ul className="space-y-1 md:space-y-2 text-white/70">
              <li>
                <Link href="/about" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-sobre">
                  Sobre
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-blog">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-carreiras">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-contato">
                  Contato
                </a>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 md:mb-4">Recursos</h4>
            <ul className="space-y-1 md:space-y-2 text-white/70">
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-help">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-faq">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-privacy">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-bright-blue smooth-transition text-sm md:text-base" data-testid="link-footer-terms">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-white/70">
          <p className="text-sm md:text-base">&copy; 2025 DissertAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
