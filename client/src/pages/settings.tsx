import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Menu, AlertTriangle, Sparkles, DollarSign, XCircle, RefreshCw, AlertCircle, Trash2, ChevronDown, Key } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SubscriptionPlan } from "@shared/schema";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, logout, checkAuth } = useAuth();
  const { 
    subscription, 
    plan: subscriptionPlan, 
    limits, 
    transactions, 
    isLoading,
    cancelSubscription, 
    reactivateSubscription,
    isCanceling,
    isReactivating
  } = useSubscription();
  const { toast } = useToast();
  
  // Fetch user's current plan based on their planId
  const { data: userPlanData } = useQuery<SubscriptionPlan>({
    queryKey: [`/api/subscription/plan/${user?.planId}`],
    enabled: !!user?.planId,
  });
  
  // Use the user's actual plan, not the subscription plan
  const plan = userPlanData || subscriptionPlan;
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showManagePlanDialog, setShowManagePlanDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLocation, setFeedbackLocation] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // User profile data from auth context
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "Usuário",
    email: user?.email || "",
    phone: user?.phone || "",
    studentType: String(user?.userType || "vestibulano")
  });

  const [tempProfile, setTempProfile] = useState(userProfile);

  // Update userProfile when user data changes
  useEffect(() => {
    if (user) {
      const updatedProfile = {
        name: user.name || "Usuário",
        email: user.email || "",
        phone: user.phone || "",
        studentType: String(user.userType || "vestibulano")
      };
      setUserProfile(updatedProfile);
      setTempProfile(updatedProfile);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await apiRequest("/api/users/account", {
        method: "DELETE",
      });
      
      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada com sucesso.",
      });
      
      // Redirect to home page
      setLocation("/");
    } catch (error) {
      toast({
        title: "Erro ao deletar conta",
        description: error instanceof Error ? error.message : "Não foi possível deletar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountDialog(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tempProfile.name,
          email: tempProfile.email,
          phone: tempProfile.phone,
          userType: tempProfile.studentType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar perfil");
      }

      const updatedUser = await response.json();
      
      // Update local state
      setUserProfile(tempProfile);
      setIsEditingProfile(false);
      
      // Update auth context by refetching user
      await checkAuth();
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    }
  };

  const handleCancelProfile = () => {
    setTempProfile(userProfile);
    setIsEditingProfile(false);
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSavingPassword(true);
      
      const response = await apiRequest("/api/users/change-password", {
        method: "POST",
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      });

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsEditingPassword(false);
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Não foi possível alterar a senha. Verifique sua senha atual.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setIsEditingPassword(false);
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(cancellationReason);
      toast({
        title: "Assinatura cancelada",
        description: "Sua conta foi movida para o plano gratuito.",
      });
      setShowCancelDialog(false);
      setCancellationReason("");
      // Refresh auth to update user plan
      await checkAuth();
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscription();
      toast({
        title: "Assinatura reativada",
        description: "Sua assinatura foi reativada com sucesso!",
      });
      setShowReactivateDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao reativar",
        description: "Não foi possível reativar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpgradeToAnnual = async () => {
    try {
      setIsUpgrading(true);
      
      // Create checkout session for annual plan
      const response = await apiRequest('/api/checkout/create-session', {
        method: 'POST',
        body: {
          planId: 'annual',
          userId: user?.id
        }
      });

      if (response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      toast({
        title: "Erro ao fazer upgrade",
        description: "Não foi possível processar o upgrade. Tente novamente.",
        variant: "destructive",
      });
      setIsUpgrading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva o problema encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingFeedback(true);
      
      const locationInfo = [
        feedbackCategory && `Ferramenta: ${feedbackCategory}`,
        feedbackType && `Tipo: ${feedbackType}`,
        feedbackLocation && `Detalhes: ${feedbackLocation}`
      ].filter(Boolean).join(' | ');
      
      await apiRequest('/api/feedback', {
        method: 'POST',
        body: {
          message: feedbackMessage,
          location: locationInfo || null,
          userEmail: user?.email,
          userName: user?.name,
        }
      });

      toast({
        title: "Feedback enviado!",
        description: "Obrigado pelo seu feedback. Vamos analisar e trabalhar na melhoria do sistema.",
      });
      
      setFeedbackMessage("");
      setFeedbackLocation("");
      setFeedbackCategory("");
      setFeedbackType("");
      setIsFeedbackOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar feedback",
        description: "Não foi possível enviar seu feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "Ativa", color: "bg-green-500", icon: CheckCircle2 },
      cancelled: { label: "Cancelada", color: "bg-red-500", icon: XCircle },
      paused: { label: "Pausada", color: "bg-yellow-500", icon: Clock },
      expired: { label: "Expirada", color: "bg-gray-500", icon: AlertCircle },
      trial: { label: "Período de Teste", color: "bg-blue-500", icon: Sparkles },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    const Icon = statusInfo.icon;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
        <Icon className="w-4 h-4" />
        <span className="font-medium text-sm">{statusInfo.label}</span>
      </div>
    );
  };

  const getUsagePercentage = () => {
    if (!limits) return 0;
    if (!limits.weeklyLimit || limits.weeklyLimit === 0) return 0; // Unlimited
    return limits.percentageUsed || 0;
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-1" data-testid="link-dashboard-logo">
              <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                <Sparkles className="text-white text-sm" />
              </div>
              <span className="text-3xl font-bold font-playfair" style={{color: '#5087ff'}}>
                DISSERT<span style={{color: '#6b7280'}}>IA</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-home">
                <Home size={14} />
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Plus size={14} />
                <span className="font-medium">Funcionalidades</span>
              </Link>
              <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-newsletter">
                <Book size={14} />
                <span className="font-medium">Newsletter</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-settings">
                <Settings size={14} />
                <span className="font-medium">Configurações</span>
              </Link>
            </div>
            
            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center space-x-8">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                data-testid="button-logout"
              >
                <LogOut size={12} />
                <span>Sair</span>
              </Button>
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                {getInitials(userProfile.name)}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user-mobile">
                {getInitials(userProfile.name)}
              </div>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                className="p-2 border-soft-gray/30 hover:border-bright-blue text-soft-gray hover:text-bright-blue"
                data-testid="button-mobile-menu"
              >
                <Menu size={16} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-home"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={12} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link 
                  href="/functionalities" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus size={10} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Book size={12} />
                  <span className="font-medium">Newsletter</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={12} />
                  <span className="font-medium">Configurações</span>
                </Link>
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="flex items-center space-x-3 w-full text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut size={12} />
                    <span>Sair</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-blue mb-2">Configurações</h1>
          <p className="text-soft-gray">Gerencie seu perfil, assinatura e informações da conta</p>
        </div>

        {/* Profile Section */}
        <div className="grid gap-6">
          
          {/* Profile Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-profile">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Perfil do Usuário</h3>
              </div>
              {!isEditingProfile ? (
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  variant="outline"
                  size="sm"
                  className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-edit-profile"
                >
                  <Edit3 size={16} className="mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveProfile}
                    size="sm"
                    className="bg-bright-blue text-white hover:bg-bright-blue/90"
                    data-testid="button-save-profile"
                  >
                    <Save size={16} className="mr-2" />
                    Salvar
                  </Button>
                  <Button
                    onClick={handleCancelProfile}
                    variant="outline"
                    size="sm"
                    className="text-soft-gray border-soft-gray/30"
                    data-testid="button-cancel-profile"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-dark-blue">Nome Completo</Label>
                {isEditingProfile ? (
                  <Input
                    id="name"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    className="mt-1"
                    data-testid="input-name"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-name">{userProfile.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-dark-blue">Email</Label>
                {isEditingProfile ? (
                  <Input
                    id="email"
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                    className="mt-1"
                    data-testid="input-email"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-email">{userProfile.email}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-dark-blue">Telefone</Label>
                {isEditingProfile ? (
                  <Input
                    id="phone"
                    value={tempProfile.phone}
                    onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                    className="mt-1"
                    data-testid="input-phone"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-phone">{userProfile.phone}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="studentType" className="text-sm font-medium text-dark-blue">Tipo de Estudante</Label>
                {isEditingProfile ? (
                  <select
                    id="studentType"
                    value={tempProfile.studentType}
                    onChange={(e) => setTempProfile({...tempProfile, studentType: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-bright-blue/30 rounded-md focus:outline-none focus:ring-2 focus:ring-bright-blue/50 focus:border-bright-blue bg-white text-dark-blue"
                    data-testid="select-student-type"
                  >
                    <option value="Vestibulando">Vestibulando</option>
                    <option value="Concurseiro">Concurseiro</option>
                  </select>
                ) : (
                  <p className="mt-1 text-dark-blue capitalize" data-testid="text-student-type">{userProfile.studentType}</p>
                )}
              </div>
            </div>
          </LiquidGlassCard>

          {/* Password Change Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-password">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Key className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Segurança</h3>
              </div>
              {!isEditingPassword ? (
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  variant="outline"
                  size="sm"
                  className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-change-password"
                >
                  <Edit3 size={16} className="mr-2" />
                  Alterar Senha
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSavePassword}
                    size="sm"
                    disabled={isSavingPassword}
                    className="bg-bright-blue text-white hover:bg-bright-blue/90"
                    data-testid="button-save-password"
                  >
                    <Save size={16} className="mr-2" />
                    {isSavingPassword ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    onClick={handleCancelPassword}
                    variant="outline"
                    size="sm"
                    disabled={isSavingPassword}
                    className="text-soft-gray border-soft-gray/30"
                    data-testid="button-cancel-password"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
            
            {!isEditingPassword ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                  <div className="flex items-center gap-3">
                    <Key className="text-bright-blue" size={20} />
                    <div>
                      <div className="font-medium text-dark-blue">Senha</div>
                      <div className="text-sm text-soft-gray">••••••••</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-soft-gray">
                  Mantenha sua conta segura usando uma senha forte e única.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-password" className="text-sm font-medium text-dark-blue">
                      Senha Atual *
                    </Label>
                    <Link href="/forgot-password">
                      <button
                        type="button"
                        className="text-xs text-bright-blue hover:text-dark-blue hover:underline transition-colors"
                        data-testid="link-forgot-password"
                      >
                        Esqueci minha senha
                      </button>
                    </Link>
                  </div>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Digite sua senha atual"
                    className="mt-1"
                    disabled={isSavingPassword}
                    data-testid="input-current-password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-password" className="text-sm font-medium text-dark-blue">
                    Nova Senha *
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Digite a nova senha (mínimo 8 caracteres)"
                    className="mt-1"
                    disabled={isSavingPassword}
                    data-testid="input-new-password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-dark-blue">
                    Confirmar Nova Senha *
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Digite a nova senha novamente"
                    className="mt-1"
                    disabled={isSavingPassword}
                    data-testid="input-confirm-password"
                  />
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-blue-700 dark:text-blue-400">
                      Sua senha deve ter no mínimo 8 caracteres. Use uma combinação de letras, números e símbolos para maior segurança.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </LiquidGlassCard>
        </div>

        {/* Usage Limits Section */}
        {limits && (
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-usage-limits">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue">Limites de Uso de IA</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-soft-gray">Uso {limits.periodLabel || 'periódico'}</span>
                  <span className="text-sm font-medium text-dark-blue">
                    {limits.percentageUsed.toFixed(1)}% usado
                  </span>
                </div>
                {limits.weeklyLimit > 0 ? (
                  <Progress value={getUsagePercentage()} className="h-2" />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles size={16} />
                    <span>Uso ilimitado</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg">
                  <div className="text-sm text-soft-gray">Plano</div>
                  <div className="text-lg font-bold text-dark-blue">
                    {limits.planName}
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 rounded-lg">
                  <div className="text-sm text-soft-gray">Créditos Restantes</div>
                  <div className="text-lg font-bold text-dark-blue">
                    {limits.weeklyLimit > 0 
                      ? `${(100 - limits.percentageUsed).toFixed(1)}%` 
                      : "Ilimitado"}
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 rounded-lg">
                  <div className="text-sm text-soft-gray mb-1">Tokens Usados</div>
                  <div className="text-lg font-bold text-dark-blue" data-testid="text-tokens-used">
                    {limits.weeklyLimit > 0 
                      ? `${formatTokens(limits.weeklyLimit - limits.remainingCredits)} / ${formatTokens(limits.weeklyLimit)} usados`
                      : "Ilimitado"}
                  </div>
                </div>
              </div>
              
              {!limits.canUseAI && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <div className="font-medium text-red-600">Limite atingido</div>
                    <div className="text-sm text-red-500 mt-1">
                      Você atingiu o limite de uso. Faça upgrade para continuar usando IA.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </LiquidGlassCard>
        )}

        {/* Feedback Section - Collapsible */}
        <Collapsible open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-feedback">
            <CollapsibleTrigger className="w-full" data-testid="button-toggle-feedback">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                    <AlertCircle className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-blue">Reportar Problema</h3>
                </div>
                <ChevronDown 
                  className={`text-dark-blue transition-transform duration-200 ${isFeedbackOpen ? 'transform rotate-180' : ''}`} 
                  size={24} 
                />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-4 pb-3">
                <p className="text-sm text-soft-gray">
                  Encontrou algum problema ou erro? Relate aqui para nos ajudar a melhorar sua experiência.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feedback-category" className="text-sm font-medium text-dark-blue">
                      Qual ferramenta? *
                    </Label>
                    <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                      <SelectTrigger className="mt-2" data-testid="select-feedback-category">
                        <SelectValue placeholder="Selecione a ferramenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correcao-redacao">Correção de Redação</SelectItem>
                        <SelectItem value="gerador-propostas">Gerador de Propostas</SelectItem>
                        <SelectItem value="estrutura-roterizada">Estrutura Roterizada</SelectItem>
                        <SelectItem value="controlador-escrita">Controlador de Escrita</SelectItem>
                        <SelectItem value="repertorio">Banco de Repertórios</SelectItem>
                        <SelectItem value="simulacao">Simulação ENEM</SelectItem>
                        <SelectItem value="dashboard">Dashboard / Início</SelectItem>
                        <SelectItem value="configuracoes">Configurações</SelectItem>
                        <SelectItem value="planos">Planos e Pagamento</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedback-type" className="text-sm font-medium text-dark-blue">
                      Tipo de problema *
                    </Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger className="mt-2" data-testid="select-feedback-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="erro-tecnico">Erro Técnico (bug)</SelectItem>
                        <SelectItem value="resultado-incorreto">Resultado Incorreto da IA</SelectItem>
                        <SelectItem value="performance-lenta">Sistema Lento</SelectItem>
                        <SelectItem value="nao-carrega">Não Carrega / Não Funciona</SelectItem>
                        <SelectItem value="perda-dados">Perda de Dados</SelectItem>
                        <SelectItem value="design-problema">Problema de Interface</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="feedback-location" className="text-sm font-medium text-dark-blue">
                    Contexto adicional (opcional)
                  </Label>
                  <Input
                    id="feedback-location"
                    value={feedbackLocation}
                    onChange={(e) => setFeedbackLocation(e.target.value)}
                    placeholder="Ex: Ao corrigir uma redação sobre meio ambiente"
                    className="mt-2"
                    data-testid="input-feedback-location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="feedback-message" className="text-sm font-medium text-dark-blue">
                    Descreva o que aconteceu *
                  </Label>
                  <Textarea
                    id="feedback-message"
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Descreva detalhadamente:&#10;• O que você estava fazendo?&#10;• O que aconteceu de errado?&#10;• Qual erro apareceu?&#10;• O que você esperava que acontecesse?"
                    className="mt-2"
                    rows={6}
                    data-testid="textarea-feedback-message"
                  />
                </div>
                
                <Button
                  onClick={handleSendFeedback}
                  disabled={isSendingFeedback || !feedbackMessage.trim() || !feedbackCategory || !feedbackType}
                  className="w-full bg-bright-blue hover:bg-bright-blue/90"
                  data-testid="button-send-feedback"
                >
                  <MessageCircle size={16} className="mr-2" />
                  {isSendingFeedback ? "Enviando..." : "Enviar Relatório"}
                </Button>
              </div>
            </CollapsibleContent>
          </LiquidGlassCard>
        </Collapsible>

        {/* Account Status + Plan Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          
          {/* Account Status Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-account-status">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue">Status da Conta</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <div>
                  <div className="font-medium text-dark-blue">Status</div>
                  <div className="text-sm text-soft-gray">Conta ativa e verificada</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" data-testid="status-indicator"></div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 rounded-lg border border-dark-blue/20">
                <div>
                  <div className="font-medium text-dark-blue">Membro desde</div>
                  <div className="text-sm text-soft-gray">{user?.createdAt ? formatDate(user.createdAt) : "—"}</div>
                </div>
                <Calendar className="text-dark-blue" size={20} />
              </div>
              
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-700 dark:text-red-400">Deletar permanentemente</div>
                    <div className="text-sm text-red-600 dark:text-red-500">Zona de Perigo</div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteAccountDialog(true)}
                    data-testid="button-delete-account"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="mr-2" size={16} />
                    Deletar Conta
                  </Button>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Plan Information Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-plan-info">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Plano Atual</h3>
              </div>
              {subscription && getStatusBadge(subscription.status)}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bright-blue"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-xl font-bold text-bright-blue mb-2" data-testid="text-plan-name">
                        {plan?.name || "Plano Gratuito"}
                      </div>
                      <div className="text-sm text-soft-gray leading-relaxed">
                        {plan?.description || "Acesso limitado às funcionalidades"}
                      </div>
                    </div>
                    {plan && plan.priceMonthly > 0 && (
                      <div className="text-2xl font-bold text-dark-blue ml-4">
                        {formatCurrency(plan.priceMonthly)}/mês
                      </div>
                    )}
                  </div>
                  
                  {subscription && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-bright-blue/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-soft-gray">Início:</span>
                        <span className="text-dark-blue font-medium" data-testid="text-start-date">
                          {formatDate(subscription.startDate)}
                        </span>
                      </div>
                      {subscription.endDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-soft-gray">Próxima cobrança:</span>
                          <span className="text-dark-blue font-medium" data-testid="text-next-billing">
                            {formatDate(subscription.endDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                {/* Show manage plan button for paid active subscriptions (not free plan) */}
                {subscription && subscription.status === 'active' && plan && (plan.priceMonthly > 0 || (plan.priceYearly && plan.priceYearly > 0)) && (
                  <Button 
                    onClick={() => setShowManagePlanDialog(true)}
                    variant="outline"
                    className="w-full text-dark-blue border-bright-blue/30 hover:bg-bright-blue/10"
                    data-testid="button-manage-plan"
                  >
                    <Settings size={16} className="mr-2" />
                    Gerenciar Plano
                  </Button>
                )}
                
                {subscription && subscription.status === 'cancelled' && (
                  <Button 
                    onClick={() => setShowReactivateDialog(true)}
                    variant="outline"
                    className="w-full text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                    data-testid="button-reactivate-subscription"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Reativar Assinatura
                  </Button>
                )}
                
                {/* Show upgrade button for free plan users only (not Pro monthly or annual) */}
                {(!subscription || (plan && plan.priceMonthly === 0 && (!plan.priceYearly || plan.priceYearly === 0))) && (
                  <Link href="/pricing">
                    <Button className="w-full bg-bright-blue hover:bg-bright-blue/90" data-testid="button-upgrade">
                      Assinar Plano Pro
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </LiquidGlassCard>
        </div>

        {/* Transactions History */}
        {transactions && transactions.length > 0 && (
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-transactions">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <DollarSign className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue">Histórico de Transações</h3>
            </div>
            
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-bright-blue/30 transition-colors"
                  data-testid={`transaction-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bright-blue/10 rounded-full flex items-center justify-center">
                      <DollarSign className="text-bright-blue" size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-dark-blue">
                        {transaction.description || "Pagamento de assinatura"}
                      </div>
                      <div className="text-sm text-soft-gray">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-dark-blue">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-soft-gray capitalize">
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        )}
      </div>
      
      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription>
              Sua assinatura será cancelada imediatamente e sua conta voltará para o plano gratuito. As cobranças no Stripe serão interrompidas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo do cancelamento (opcional)</Label>
              <Textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Nos ajude a melhorar. Por que você está cancelando?"
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCanceling}
            >
              Voltar
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Subscription Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="text-bright-blue" />
              Reativar Assinatura
            </DialogTitle>
            <DialogDescription>
              Sua assinatura será reativada imediatamente e você terá acesso completo a todas as funcionalidades.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReactivateDialog(false)}
              disabled={isReactivating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReactivateSubscription}
              disabled={isReactivating}
              className="bg-bright-blue hover:bg-bright-blue/90"
            >
              {isReactivating ? "Reativando..." : "Confirmar Reativação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Plan Dialog */}
      <Dialog open={showManagePlanDialog} onOpenChange={setShowManagePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="text-bright-blue" />
              Gerenciar Plano
            </DialogTitle>
            <DialogDescription>
              Escolha uma das opções abaixo para gerenciar sua assinatura.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Show upgrade to annual option only for monthly subscribers */}
            {plan && plan.id === 'plan-pro-monthly' && (
              <Button
                onClick={() => {
                  setShowManagePlanDialog(false);
                  handleUpgradeToAnnual();
                }}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue"
                data-testid="button-upgrade-to-annual"
              >
                <TrendingUp size={16} className="mr-2" />
                {isUpgrading ? "Processando..." : "Fazer Upgrade para Plano Anual"}
              </Button>
            )}
            
            {/* Cancel subscription option */}
            <Button
              onClick={() => {
                setShowManagePlanDialog(false);
                setShowCancelDialog(true);
              }}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
              data-testid="button-open-cancel-dialog"
            >
              <XCircle size={16} className="mr-2" />
              Cancelar Assinatura
            </Button>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowManagePlanDialog(false)}
            >
              Voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent data-testid="dialog-delete-account">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="text-red-600" />
              Deletar Conta Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold text-red-700 dark:text-red-400">
                Esta ação não pode ser desfeita!
              </p>
              <p>
                Ao deletar sua conta, todos os seus dados serão permanentemente removidos, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Todas as suas redações e correções</li>
                <li>Seu progresso e estatísticas</li>
                <li>Estruturas e materiais salvos</li>
                <li>Repertórios e propostas salvas</li>
                <li>Histórico de conversas e simulações</li>
                <li>Dados de assinatura e pagamento</li>
              </ul>
              <p className="font-medium">
                Você precisará criar uma nova conta se quiser usar o DissertIA novamente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeletingAccount}
              data-testid="button-cancel-delete"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete"
            >
              {isDeletingAccount ? "Deletando..." : "Sim, deletar minha conta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
