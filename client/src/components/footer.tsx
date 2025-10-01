import { useState } from "react";
import { Link } from "wouter";
import { Sparkles, Facebook, Instagram, Youtube, ArrowRight, Loader2 } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeNewsletter = useMutation({
    mutationFn: (email: string) => apiRequest("/api/newsletter", {
      method: "POST",
      body: { email },
    }),
    onSuccess: () => {
      setEmail("");
      toast({
        title: "Sucesso! 🎉",
        description: "Inscrição realizada com sucesso! Verifique seu email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao inscrever",
        description: error?.message || "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }
    subscribeNewsletter.mutate(email);
  };

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
                DISSERT<span style={{color: '#ffffff'}}>IA</span>
              </span>
            </div>
            <p className="text-white/70 mb-4">
              Revolucionando a escrita educacional com inteligência artificial para estudantes brasileiros.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-facebook">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/dissert_ia" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-youtube">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-bright-blue smooth-transition" data-testid="link-tiktok">
                <SiTiktok size={20} />
              </a>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="max-w-full md:order-last">
            <h4 className="font-semibold mb-3 md:mb-4">Newsletter</h4>
            <p className="text-white/70 mb-3 md:mb-4 text-sm md:text-base">Receba dicas semanais de redação</p>
            <form onSubmit={handleSubmit} className="flex w-full max-w-full overflow-hidden">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                className="flex-1 min-w-0 px-3 py-2 bg-white/10 rounded-l-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-bright-blue text-sm md:text-base"
                data-testid="input-newsletter-email"
                disabled={subscribeNewsletter.isPending}
              />
              <button 
                type="submit"
                disabled={subscribeNewsletter.isPending}
                className="bg-bright-blue px-3 py-2 rounded-r-lg hover:bg-blue-600 smooth-transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
                data-testid="button-newsletter-submit"
              >
                {subscribeNewsletter.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            </form>
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
          <p className="text-sm md:text-base">&copy; 2025 DissertIA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
