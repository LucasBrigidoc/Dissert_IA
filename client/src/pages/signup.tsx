import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { HeroCharacter } from "@/components/hero-character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Plus } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"vestibulano" | "concurseiro">("vestibulano");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create account with the backend
    // For demo purposes, redirect to dashboard
    setLocation("/dashboard");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <LiquidGlassCard className="rounded-3xl overflow-hidden p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Signup Form */}
            <div className="w-full lg:w-1/2 p-12">
              <h2 className="text-4xl font-bold text-bright-blue mb-8" data-testid="text-signup-title">Sign up</h2>
              
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
                
                <div className="grid grid-cols-2 gap-4">
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
                
                <div className="flex space-x-4">
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
                  className="w-full bg-bright-blue text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale"
                  data-testid="button-signup-submit"
                >
                  Criar Conta
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <span className="text-soft-gray">or </span>
                <Link href="/login" className="text-bright-blue font-semibold hover:underline" data-testid="link-login">
                  Log in
                </Link>
              </div>
            </div>
            
            {/* Illustration */}
            <div className="w-full lg:w-1/2 gradient-bg p-12 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-6xl text-white mb-4">
                  <Plus className="mx-auto" size={64} />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  DISSERT<span className="text-yellow-400">AI</span>
                </h2>
                <HeroCharacter variant="ai" size="md" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
