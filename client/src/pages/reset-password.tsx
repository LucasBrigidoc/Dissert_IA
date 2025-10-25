import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Sparkles, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HeroCharacter } from "@/components/hero-character";
import LiquidGlassCard from "@/components/LiquidGlassCard";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: "Erro",
        description: "Token de recuperação não encontrado",
        variant: "destructive",
      });
      navigate("/forgot-password");
    }
  }, [navigate, toast]);

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      return response.json();
    },
    onSuccess: () => {
      setPasswordReset(true);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível redefinir sua senha. Verifique se o link não expirou.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  if (passwordReset) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <LiquidGlassCard variant="primary">
            <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl">
              {/* Success Message */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={48} className="text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 font-playfair" style={{color: '#5087ff'}}>
                    Senha Redefinida!
                  </h1>
                  
                  <div className="space-y-4 text-center">
                    <p className="text-soft-gray dark:text-gray-300">
                      Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700/30">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Por segurança, recomendamos que você:
                      </p>
                      <ul className="text-sm text-left text-gray-600 dark:text-gray-400 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-bright-blue mt-0.5">✓</span>
                          <span>Use uma senha forte e única</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-bright-blue mt-0.5">✓</span>
                          <span>Não compartilhe sua senha com ninguém</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-bright-blue mt-0.5">✓</span>
                          <span>Atualize sua senha regularmente</span>
                        </li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => navigate("/login")}
                      className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale mt-6"
                      data-testid="button-go-to-login"
                    >
                      Ir para Login
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
                    <HeroCharacter variant="celebrate" size="sm" />
                  </div>
                  <div className="hidden lg:block">
                    <HeroCharacter variant="celebrate" size="md" />
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
                Redefinir Senha
              </h1>
              <p className="text-soft-gray mb-6 sm:mb-8">
                Digite sua nova senha abaixo. Certifique-se de escolher uma senha forte e única.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword" className="text-soft-gray font-semibold mb-2 block">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-gray" size={20} />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-10 pr-10 py-3 rounded-lg border-soft-gray/30 focus:border-bright-blue"
                      disabled={resetPasswordMutation.isPending}
                      data-testid="input-new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-gray hover:text-bright-blue"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-soft-gray font-semibold mb-2 block">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-soft-gray" size={20} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a senha novamente"
                      className="pl-10 pr-10 py-3 rounded-lg border-soft-gray/30 focus:border-bright-blue"
                      disabled={resetPasswordMutation.isPending}
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soft-gray hover:text-bright-blue"
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
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
                  <HeroCharacter variant="lock" size="sm" />
                </div>
                <div className="hidden lg:block">
                  <HeroCharacter variant="lock" size="md" />
                </div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
