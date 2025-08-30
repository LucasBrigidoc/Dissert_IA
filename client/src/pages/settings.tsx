import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, User, CreditCard, Shield, Edit3, Save, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Mock data for user settings
  const [userGoals, setUserGoals] = useState({
    weeklyEssays: 2,
    weeklyStudyHours: 10,
    targetScore: 900
  });
  
  const [userProfile, setUserProfile] = useState({
    name: "Lucas Silva",
    email: "lucas.silva@email.com",
    phone: "(11) 99999-9999",
    school: "Colégio Exemplo"
  });

  const [tempGoals, setTempGoals] = useState(userGoals);
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleLogout = () => {
    setLocation("/");
  };

  const handleSaveGoals = () => {
    setUserGoals(tempGoals);
    setIsEditingGoals(false);
  };

  const handleCancelGoals = () => {
    setTempGoals(userGoals);
    setIsEditingGoals(false);
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
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2" data-testid="link-dashboard-logo">
                <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                  <Plus className="text-white text-sm" />
                </div>
                <span className="text-2xl font-bold text-dark-blue">
                  DISSERT<span className="text-bright-blue">AI</span>
                </span>
              </Link>
              
              {/* Navigation Menu */}
              <div className="flex items-center space-x-6">
                <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-home">
                  <Home size={18} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                  <Plus size={18} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-settings">
                  <Settings size={18} />
                  <span className="font-medium">Configurações</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-soft-gray hover:text-bright-blue transition-colors" data-testid="button-notifications">
                <Bell size={20} />
              </button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                data-testid="button-logout"
              >
                <LogOut size={16} />
                <span>Sair</span>
              </Button>
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-blue mb-2">Configurações</h1>
          <p className="text-soft-gray">Gerencie suas metas, perfil e informações da conta</p>
        </div>

        {/* First Row: Profile + Goals */}
        <div className="grid lg:grid-cols-2 gap-6">
          
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
                <Label htmlFor="school" className="text-sm font-medium text-dark-blue">Escola</Label>
                {isEditingProfile ? (
                  <Input
                    id="school"
                    value={tempProfile.school}
                    onChange={(e) => setTempProfile({...tempProfile, school: e.target.value})}
                    className="mt-1"
                    data-testid="input-school"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-school">{userProfile.school}</p>
                )}
              </div>
            </div>
          </LiquidGlassCard>

          {/* Goals Management Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-goals-management">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Gerenciar Metas</h3>
              </div>
              {!isEditingGoals ? (
                <Button
                  onClick={() => setIsEditingGoals(true)}
                  variant="outline"
                  size="sm"
                  className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-edit-goals"
                >
                  <Edit3 size={16} className="mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveGoals}
                    size="sm"
                    className="bg-bright-blue text-white hover:bg-bright-blue/90"
                    data-testid="button-save-goals"
                  >
                    <Save size={16} className="mr-2" />
                    Salvar
                  </Button>
                  <Button
                    onClick={handleCancelGoals}
                    variant="outline"
                    size="sm"
                    className="text-soft-gray border-soft-gray/30"
                    data-testid="button-cancel-goals"
                  >
                    <X size={16} />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="weeklyEssays" className="text-sm font-medium text-dark-blue">Redações por Semana</Label>
                {isEditingGoals ? (
                  <Input
                    id="weeklyEssays"
                    type="number"
                    min="1"
                    max="10"
                    value={tempGoals.weeklyEssays}
                    onChange={(e) => setTempGoals({...tempGoals, weeklyEssays: parseInt(e.target.value)})}
                    className="mt-1"
                    data-testid="input-weekly-essays"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-weekly-essays">{userGoals.weeklyEssays} redações</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="weeklyStudyHours" className="text-sm font-medium text-dark-blue">Horas de Estudo por Semana</Label>
                {isEditingGoals ? (
                  <Input
                    id="weeklyStudyHours"
                    type="number"
                    min="1"
                    max="50"
                    value={tempGoals.weeklyStudyHours}
                    onChange={(e) => setTempGoals({...tempGoals, weeklyStudyHours: parseInt(e.target.value)})}
                    className="mt-1"
                    data-testid="input-weekly-study-hours"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-weekly-study-hours">{userGoals.weeklyStudyHours} horas</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="targetScore" className="text-sm font-medium text-dark-blue">Meta de Nota</Label>
                {isEditingGoals ? (
                  <Input
                    id="targetScore"
                    type="number"
                    min="200"
                    max="1000"
                    value={tempGoals.targetScore}
                    onChange={(e) => setTempGoals({...tempGoals, targetScore: parseInt(e.target.value)})}
                    className="mt-1"
                    data-testid="input-target-score"
                  />
                ) : (
                  <p className="mt-1 text-dark-blue" data-testid="text-target-score">{userGoals.targetScore} pontos</p>
                )}
              </div>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Second Row: Account Status + Plan */}
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
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  className="flex-1 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-change-plan"
                >
                  Alterar Plano
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10"
                  data-testid="button-cancel-subscription"
                >
                  Cancelar Assinatura
                </Button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
}