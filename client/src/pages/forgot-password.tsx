import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HeroCharacter } from "@/components/hero-character";
import LiquidGlassCard from "@/components/LiquidGlassCard";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu email",
        variant: "destructive",
      });
      return;
    }

    forgotPasswordMutation.mutate(email);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <LiquidGlassCard variant="primary">
            <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">
              {/* Success Message */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
                <div className="mb-6 sm:mb-8">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center text-soft-gray hover:text-bright-blue smooth-transition"
                    data-testid="link-back-to-login"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Voltar para login
                  </Link>
                </div>

                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={48} className="text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 font-playfair" style={{color: '#5087ff'}}>
                    Email Enviado!
                  </h1>
                  
                  <div className="space-y-4 text-left bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-3">
                      <Mail className="text-bright-blue mt-1 flex-shrink-0" size={24} />
                      <div>
                        <p className="text-soft-gray dark:text-gray-300 mb-2">
                          Se o email <strong className="text-bright-blue">{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Verifique sua caixa de entrada e também a pasta de spam.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Não recebeu o email?
                    </p>
                    <Button
                      onClick={() => {
                        setEmailSent(false);
                        forgotPasswordMutation.reset();
                      }}
                      variant="outline"
                      className="w-full border-bright-blue text-bright-blue hover:bg-bright-blue hover:text-white"
                      data-testid="button-resend-email"
                    >
                      Enviar novamente
                    </Button>
                  </div>
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
                    <HeroCharacter variant="thinking" size="sm" />
                  </div>
                  <div className="hidden lg:block">
                    <HeroCharacter variant="thinking" size="md" />
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <LiquidGlassCard variant="primary">
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">
            {/* Form */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
              <div className="mb-6 sm:mb-8">
                <Link 
                  href="/login" 
                  className="inline-flex items-center text-soft-gray hover:text-bright-blue smooth-transition"
                  data-testid="link-back-to-login"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Voltar para login
                </Link>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 font-playfair" style={{color: '#5087ff'}}>
                Esqueceu a senha?
              </h1>
              <p className="text-soft-gray mb-6 sm:mb-8">
                Não se preocupe! Digite seu email e enviaremos instruções para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-soft-gray font-semibold mb-2 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-gray" size={20} />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10 py-3 rounded-lg border-soft-gray/30 focus:border-bright-blue"
                      disabled={forgotPasswordMutation.isPending}
                      data-testid="input-email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-send-reset-link"
                >
                  {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <span className="text-soft-gray">Lembrou sua senha? </span>
                <Link 
                  href="/login" 
                  className="text-bright-blue font-semibold hover:underline" 
                  data-testid="link-login"
                >
                  Fazer Login
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
                  <HeroCharacter variant="thinking" size="sm" />
                </div>
                <div className="hidden lg:block">
                  <HeroCharacter variant="thinking" size="md" />
                </div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
