import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { HeroCharacter } from "@/components/hero-character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPromptDialog } from "@/components/subscription-prompt-dialog";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { register, isRegistering, user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [userType, setUserType] = useState<"vestibulano" | "concurseiro">("vestibulano");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const validatePhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um número de telefone válido com DDD",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await register(formData.name, formData.email, formData.phone, formData.password, userType);
      if (success) {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect');
        
        // Pequeno delay para garantir que o user foi atualizado
        setTimeout(() => {
          // Verificar se o usuário está no plano gratuito e mostrar popup
          if (user && user.planId === 'plan-free') {
            setShowSubscriptionPrompt(true);
          } else {
            setLocation(redirectTo || "/dashboard");
          }
        }, 100);
      }
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Erro desconhecido ao criar conta",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <LiquidGlassCard className="rounded-3xl overflow-hidden p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Signup Form */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
              <h2 className="text-4xl font-bold text-bright-blue mb-8" data-testid="text-signup-title">Cadastro</h2>
              
              <form onSubmit={handleSignup} className="space-y-6" data-testid="form-signup">
                <div>
                  <Label htmlFor="name" className="block text-bright-blue font-medium mb-2">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Lucas Brigido"
                    className="w-full px-4 py-3 border-2 border-soft-gray rounded-lg focus:border-bright-blue focus:outline-none smooth-transition"
                    data-testid="input-name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="block text-bright-blue font-medium mb-2">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="hello@reallygreatsite.com"
                    className="w-full px-4 py-3 border-2 border-soft-gray rounded-lg focus:border-bright-blue focus:outline-none smooth-transition"
                    data-testid="input-email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="block text-bright-blue font-medium mb-2">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 border-2 border-soft-gray rounded-lg focus:border-bright-blue focus:outline-none smooth-transition"
                    data-testid="input-phone"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="block text-bright-blue font-medium mb-2">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
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
                  <div>
                    <Label htmlFor="confirmPassword" className="block text-bright-blue font-medium mb-2">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="••••••••••"
                        className="w-full px-4 py-3 border-2 border-soft-gray rounded-lg focus:border-bright-blue focus:outline-none smooth-transition pr-12"
                        data-testid="input-confirm-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-gray"
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    type="button"
                    onClick={() => setUserType("vestibulano")}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      userType === "vestibulano" 
                        ? "bg-bright-blue text-white" 
                        : "border-2 border-soft-gray text-soft-gray bg-transparent hover:bg-gray-50"
                    }`}
                    data-testid="button-user-type-vestibulano"
                  >
                    Vestibulano
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setUserType("concurseiro")}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      userType === "concurseiro" 
                        ? "bg-bright-blue text-white" 
                        : "border-2 border-soft-gray text-soft-gray bg-transparent hover:bg-gray-50"
                    }`}
                    data-testid="button-user-type-concurseiro"
                  >
                    Concurseiro
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-signup-submit"
                >
                  {isRegistering ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <span className="text-soft-gray">ou </span>
                <Link href="/login" className="text-bright-blue font-semibold hover:underline" data-testid="link-login">
                  Entrar
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
                  <HeroCharacter variant="ai" size="sm" />
                </div>
                <div className="hidden lg:block">
                  <HeroCharacter variant="ai" size="md" />
                </div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Subscription Prompt Dialog */}
      <SubscriptionPromptDialog
        open={showSubscriptionPrompt}
        onOpenChange={(open) => {
          setShowSubscriptionPrompt(open);
          if (!open) {
            const params = new URLSearchParams(window.location.search);
            const redirectTo = params.get('redirect');
            setLocation(redirectTo || "/dashboard");
          }
        }}
      />
    </div>
  );
}
