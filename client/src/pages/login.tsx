import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { HeroCharacter } from "@/components/hero-character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticating } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect');
        setLocation(redirectTo || "/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Erro desconhecido ao fazer login",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <LiquidGlassCard className="rounded-3xl overflow-hidden p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Login Form */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
              <h2 className="text-4xl font-bold text-bright-blue mb-8" data-testid="text-login-title">Login</h2>
              
              <form onSubmit={handleLogin} className="space-y-6" data-testid="form-login">
                <div>
                  <Label htmlFor="email" className="block text-bright-blue font-medium mb-2">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@reallygreatsite.com"
                    className="w-full px-4 py-3 border-2 border-soft-gray rounded-lg focus:border-bright-blue focus:outline-none smooth-transition"
                    data-testid="input-email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="block text-bright-blue font-medium mb-2">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full px-4 py-3 border-2 border-soft-gray rounded-lg focus:border-bright-blue focus:outline-none smooth-transition pr-12"
                      data-testid="input-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-gray"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      data-testid="checkbox-remember" 
                    />
                    <Label htmlFor="remember" className="text-soft-gray italic">Lembrar de mim</Label>
                  </div>
                  <a href="#" className="text-soft-gray italic hover:text-bright-blue smooth-transition" data-testid="link-forgot-password">
                    Esqueceu a senha?
                  </a>
                </div>
                
                <Button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-login-submit"
                >
                  {isAuthenticating ? "Entrando..." : "Entrar"}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <span className="text-soft-gray">ou </span>
                <Link 
                  href={`/signup${window.location.search}`} 
                  className="text-bright-blue font-semibold hover:underline" 
                  data-testid="link-signup"
                >
                  Criar Conta
                </Link>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="w-full lg:w-1/2 gradient-bg p-6 sm:p-8 lg:p-12 flex items-center justify-center relative">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 font-playfair flex items-center justify-center gap-2 sm:gap-3" style={{color: '#5087ff'}}>
                  <Sparkles size={28} className="sm:w-8 sm:h-8 lg:w-[52px] lg:h-[52px]" style={{color: '#ffffff'}} />
                  DISSERT<span style={{color: '#ffffff'}}>IA</span>
                </h2>
                <div className="block lg:hidden">
                  <HeroCharacter variant="study" size="sm" />
                </div>
                <div className="hidden lg:block">
                  <HeroCharacter variant="study" size="md" />
                </div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
