import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X, Menu, AlertTriangle, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPlanOptions, setShowPlanOptions] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  
  // Mock data for user settings
  const [userProfile, setUserProfile] = useState({
    name: "Lucas Silva",
    email: "lucas.silva@email.com",
    phone: "(11) 99999-9999",
    studentType: "Vestibulando"
  });

  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleLogout = () => {
    setLocation("/");
  };

  const handleSaveProfile = () => {
    setUserProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setTempProfile(userProfile);
    setIsEditingProfile(false);
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
                DISSERT<span style={{color: '#6b7280'}}>AI</span>
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
          <p className="text-soft-gray">Gerencie seu perfil e informações da conta</p>
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
                    <option value="Ambos">Ambos (Vestibulando e Concurseiro)</option>
                  </select>
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-student-type">{userProfile.studentType}</p>
                )}
              </div>
            </div>
          </LiquidGlassCard>

          
        </div>

        

        {/* Third Row: Account Status + Plan */}
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
                  <div className="text-sm text-soft-gray">Janeiro 2024</div>
                </div>
                <Calendar className="text-dark-blue" size={20} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 rounded-lg border border-soft-gray/20">
                <div>
                  <div className="font-medium text-dark-blue">Última atividade</div>
                  <div className="text-sm text-soft-gray">Hoje às 14:30</div>
                </div>
                <Clock className="text-soft-gray" size={20} />
              </div>
            </div>
          </LiquidGlassCard>

          {/* Plan Information Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-plan-info">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <CreditCard className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue">Plano Atual</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold text-bright-blue">Plano Premium</div>
                    <div className="text-sm text-soft-gray">Acesso completo a todas as funcionalidades</div>
                  </div>
                  <div className="text-2xl font-bold text-dark-blue">R$ 49,90/mês</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-dark-blue">
                    <CheckCircle2 className="text-bright-blue mr-2" size={16} />
                    Redações ilimitadas
                  </div>
                  <div className="flex items-center text-sm text-dark-blue">
                    <CheckCircle2 className="text-bright-blue mr-2" size={16} />
                    Correção com IA avançada
                  </div>
                  <div className="flex items-center text-sm text-dark-blue">
                    <CheckCircle2 className="text-bright-blue mr-2" size={16} />
                    Relatórios detalhados
                  </div>
                  <div className="flex items-center text-sm text-dark-blue">
                    <CheckCircle2 className="text-bright-blue mr-2" size={16} />
                    Suporte prioritário
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowPlanOptions(!showPlanOptions)}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white"
                data-testid="button-plan-settings"
              >
                Configurações do Plano
              </Button>
              
              {/* Plan Options Card */}
              {showPlanOptions && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <Button 
                    onClick={() => {
                      setSelectedAction('Alterar Plano');
                      setShowWarning(true);
                    }}
                    variant="outline"
                    className="w-full text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                    data-testid="button-change-plan"
                  >
                    Alterar Plano
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedAction('Cancelar Assinatura');
                      setShowWarning(true);
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    data-testid="button-cancel-subscription"
                  >
                    Cancelar Assinatura
                  </Button>
                </div>
              )}
              
            </div>
          </LiquidGlassCard>
        </div>
      </div>
      
      {/* Warning Dialog - Outside all containers to cover everything */}
      {showWarning && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] backdrop-blur-sm"
          onClick={() => setShowWarning(false)}
        >
          <div 
            className="bg-white rounded-lg p-8 max-w-lg mx-4 shadow-2xl border-2 border-red-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-4">⚠️ CUIDADO, TEM CERTEZA?</h3>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Você está prestes a <span className="font-semibold text-red-600">{selectedAction.toLowerCase()}</span>. 
                <br />
                <span className="text-red-500">Esta ação pode afetar permanentemente seu acesso às funcionalidades premium.</span>
              </p>
              <div className="flex space-x-4 w-full">
                <Button 
                  onClick={() => setShowWarning(false)}
                  variant="outline"
                  className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50 py-3"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    setShowWarning(false);
                    setShowPlanOptions(false);
                    // Aqui você adicionaria a lógica para executar a ação
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 font-semibold"
                >
                  ⚠️ Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}