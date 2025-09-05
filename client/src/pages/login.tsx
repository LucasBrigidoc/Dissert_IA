import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { HeroCharacter } from "@/components/hero-character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate with the backend
    // For demo purposes, redirect to dashboard
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <LiquidGlassCard className="rounded-3xl overflow-hidden p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Login Form */}
            <div className="w-full lg:w-1/2 p-12">
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
                    <Checkbox id="remember" data-testid="checkbox-remember" />
                    <Label htmlFor="remember" className="text-soft-gray italic">Remember Me</Label>
                  </div>
                  <a href="#" className="text-soft-gray italic hover:text-bright-blue smooth-transition" data-testid="link-forgot-password">
                    Esqueceu a senha?
                  </a>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale"
                  data-testid="button-login-submit"
                >
                  Entrar
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <span className="text-soft-gray">or </span>
                <Link href="/signup" className="text-bright-blue font-semibold hover:underline" data-testid="link-signup">
                  Criar Conta
                </Link>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="w-full lg:w-1/2 gradient-bg p-12 flex items-center justify-center relative">
              <div className="text-center">
                <h2 className="text-6xl font-bold mb-4 font-playfair flex items-center justify-center gap-3" style={{color: '#5087ff'}}>
                  <Sparkles size={52} style={{color: '#ffffff'}} />
                  DISSERT<span style={{color: '#ffffff'}}>AI</span>
                </h2>
                <HeroCharacter variant="study" size="md" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
