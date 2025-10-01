import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Menu, AlertTriangle, Sparkles, DollarSign, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { 
    subscription, 
    plan, 
    limits, 
    transactions, 
    isLoading,
    cancelSubscription, 
    reactivateSubscription,
    isCanceling,
    isReactivating
  } = useSubscription();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // User profile data from auth context
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "Usuário",
    email: user?.email || "",
    phone: "(11) 99999-9999",
    studentType: String(user?.userType || "vestibulano")
  });

  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSaveProfile = () => {
    setUserProfile(tempProfile);
    setIsEditingProfile(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleCancelProfile = () => {
    setTempProfile(userProfile);
    setIsEditingProfile(false);
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(cancellationReason);
      toast({
        title: "Assinatura cancelada",
        description: "Você ainda terá acesso até o fim do período pago.",
      });
      setShowCancelDialog(false);
      setCancellationReason("");
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
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user-mobile">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
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
        </div>

        {/* Account Status + Plan Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          
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
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 rounded-lg border border-soft-gray/20">
                <div>
                  <div className="font-medium text-dark-blue">Tipo de Conta</div>
                  <div className="text-sm text-soft-gray capitalize">{user?.userType || "Vestibulando"}</div>
                </div>
                <Clock className="text-soft-gray" size={20} />
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
                    <div>
                      <div className="text-xl font-bold text-bright-blue" data-testid="text-plan-name">
                        {plan?.name || "Plano Gratuito"}
                      </div>
                      <div className="text-sm text-soft-gray">
                        {plan?.description || "Acesso limitado às funcionalidades"}
                      </div>
                    </div>
                    {plan?.priceMonthly && plan.priceMonthly > 0 && (
                      <div className="text-2xl font-bold text-dark-blue">
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
                {subscription && subscription.status === 'active' && (
                  <Button 
                    onClick={() => setShowCancelDialog(true)}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    data-testid="button-cancel-subscription"
                  >
                    <XCircle size={16} className="mr-2" />
                    Cancelar Assinatura
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
                
                {!subscription && (
                  <Link href="/pricing">
                    <Button className="w-full bg-bright-blue hover:bg-bright-blue/90" data-testid="button-upgrade">
                      Fazer Upgrade
                    </Button>
                  </Link>
                )}
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
              
              <div className="grid grid-cols-2 gap-4 mt-4">
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
              Você ainda terá acesso até o fim do período pago. Sua assinatura será cancelada após essa data.
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
    </div>
  );
}
