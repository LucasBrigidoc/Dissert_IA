import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  MessageCircle, 
  Search, 
  Edit, 
  Sliders, 
  GraduationCap, 
  Lightbulb, 
  Archive, 
  Newspaper,
  Home,
  Settings,
  Bell,
  LogOut,
  Plus,
  User,
  Shield,
  Mail,
  Palette,
  Clock,
  Target,
  Brain
} from "lucide-react";

export default function Configuracoes() {
  const [location, setLocation] = useLocation();
  const [notifications, setNotifications] = useState({
    newsletter: true,
    reminders: true,
    progress: false,
    tips: true
  });

  const handleLogout = () => {
    setLocation('/');
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const name = "Lucas Silva";

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
                <Link href="/configuracoes" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-settings">
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
                {name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-blue mb-4" data-testid="text-settings-title">
            Configurações e Funcionalidades
          </h1>
          <p className="text-xl text-soft-gray">Personalize sua experiência e explore todas as ferramentas disponíveis</p>
        </div>

        {/* Hero Feature Card */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/10 border-bright-blue/20 p-12 mb-12" data-testid="card-hero-settings">
          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <h2 className="text-3xl font-bold text-dark-blue mb-4">
                Refine seu processo de escrita com IA
              </h2>
              <p className="text-soft-gray mb-6">
                Nosso sistema é projetado para te ajudar em cada etapa do processo de escrita com funcionalidades que utilizam IA para maximizar seus resultados. Desde a geração de ideias até a revisão final, tenha um professor que vai lhe ajudar a melhorar sua escrita.
              </p>
              <Button className="bg-gradient-to-r from-bright-blue to-dark-blue text-white px-6 py-3 rounded-lg hover:from-bright-blue/90 hover:to-dark-blue/90" data-testid="button-explore-features">
                Explorar Todas as Funcionalidades
              </Button>
            </div>
            <div className="w-1/2 text-center">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Brain className="text-white" size={80} />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Personal Settings Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-dark-blue mb-8" data-testid="text-personal-settings-title">
            Configurações Pessoais
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 p-6" data-testid="card-profile-settings">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center mr-4">
                  <User className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Perfil do Usuário</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark-blue block mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    value={name}
                    className="w-full p-3 border border-bright-blue/30 rounded-lg focus:border-bright-blue focus:outline-none"
                    data-testid="input-full-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark-blue block mb-2">Meta de Nota</label>
                  <select className="w-full p-3 border border-bright-blue/30 rounded-lg focus:border-bright-blue focus:outline-none" data-testid="select-target-score">
                    <option value="900">900 pontos</option>
                    <option value="950">950 pontos</option>
                    <option value="1000">1000 pontos</option>
                  </select>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 p-6" data-testid="card-notification-settings">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-lg flex items-center justify-center mr-4">
                  <Bell className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Notificações</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-blue">Newsletter Semanal</span>
                  <Switch 
                    checked={notifications.newsletter}
                    onCheckedChange={() => handleNotificationChange('newsletter')}
                    data-testid="switch-newsletter"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-blue">Lembretes de Estudo</span>
                  <Switch 
                    checked={notifications.reminders}
                    onCheckedChange={() => handleNotificationChange('reminders')}
                    data-testid="switch-reminders"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-blue">Progresso Semanal</span>
                  <Switch 
                    checked={notifications.progress}
                    onCheckedChange={() => handleNotificationChange('progress')}
                    data-testid="switch-progress"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-blue">Dicas Diárias</span>
                  <Switch 
                    checked={notifications.tips}
                    onCheckedChange={() => handleNotificationChange('tips')}
                    data-testid="switch-tips"
                  />
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Pre-writing Tools */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-dark-blue mb-6">Ferramentas de Pré-escrita:</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 p-8" data-testid="card-argument-architect">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center mr-4">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-dark-blue">Arquiteto de Argumentos</h4>
              </div>
              <p className="text-soft-gray mb-4">
                Ferramenta de diálogo socrático que te faz perguntas inteligentes e profundas sobre o tema proposto para você encontrar argumentos sólidos.
              </p>
              <ul className="text-sm text-soft-gray space-y-1 mb-4">
                <li>• Perguntas personalizadas baseadas no tema</li>
                <li>• Desenvolvimento de raciocínio crítico</li>
                <li>• Sugestões de contra-argumentos</li>
              </ul>
              <Button 
                onClick={() => setLocation('/argumentos')}
                variant="outline" 
                className="w-full border-bright-blue/30 hover:bg-bright-blue/10"
                data-testid="button-access-arguments"
              >
                Acessar Ferramenta
              </Button>
            </LiquidGlassCard>

            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20 p-8" data-testid="card-repertoire-explorer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-lg flex items-center justify-center mr-4">
                  <Search className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-dark-blue">Explorador de Repertório</h4>
              </div>
              <p className="text-soft-gray mb-4">
                Banco de dados inteligente conectado com mais de 50 fontes de notícias, artigos acadêmicos e bases de dados estatísticas atualizadas.
              </p>
              <ul className="text-sm text-soft-gray space-y-1 mb-4">
                <li>• Conexão com fontes confiáveis</li>
                <li>• Sugestões contextualizadas</li>
                <li>• Dados estatísticos relevantes</li>
              </ul>
              <Button 
                onClick={() => setLocation('/repertorio')}
                variant="outline" 
                className="w-full border-dark-blue/30 hover:bg-dark-blue/10"
                data-testid="button-access-repertoire"
              >
                Acessar Ferramenta
              </Button>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Writing Tools */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-dark-blue mb-6">Ferramentas de Escrita:</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 p-8" data-testid="card-structure-creator">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center mr-4">
                  <Edit className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-dark-blue">Criador de Estrutura Personalizada</h4>
              </div>
              <p className="text-soft-gray mb-4">
                A partir da análise do seu estilo de escrita, a IA cria estruturas de redação modelo que incorporam suas preferências e pontos fortes.
              </p>
              <ul className="text-sm text-soft-gray space-y-1 mb-4">
                <li>• Análise do estilo pessoal</li>
                <li>• Estruturas personalizadas</li>
                <li>• Adaptação contínua</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full border-bright-blue/30 hover:bg-bright-blue/10"
                data-testid="button-access-structure"
              >
                Acessar Ferramenta
              </Button>
            </LiquidGlassCard>

            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 p-8" data-testid="card-style-controller">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-lg flex items-center justify-center mr-4">
                  <Sliders className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-semibold text-dark-blue">Controlador de Estilo</h4>
              </div>
              <p className="text-soft-gray mb-4">
                Ajustes interativos de formalidade, tom e complexidade vocabular com visualização em tempo real das alterações no texto.
              </p>
              <ul className="text-sm text-soft-gray space-y-1 mb-4">
                <li>• Controle de formalidade</li>
                <li>• Ajuste de complexidade</li>
                <li>• Visualização em tempo real</li>
              </ul>
              <Button 
                onClick={() => setLocation('/estilo')}
                variant="outline" 
                className="w-full border-soft-gray/30 hover:bg-soft-gray/10"
                data-testid="button-access-style"
              >
                Acessar Ferramenta
              </Button>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Complementary Tools */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-dark-blue mb-6">Ferramentas Complementares:</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 p-6 text-center" data-testid="card-exam-simulator">
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-dark-blue mb-2">Simulador de Prova</h4>
              <p className="text-soft-gray text-sm mb-4">Ambiente realista com cronômetro e condições idênticas ao exame</p>
              <Button 
                onClick={() => setLocation('/simulador')}
                variant="outline" 
                size="sm"
                className="w-full border-bright-blue/30 hover:bg-bright-blue/10"
                data-testid="button-access-simulator"
              >
                Acessar
              </Button>
            </LiquidGlassCard>

            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20 p-6 text-center" data-testid="card-proposal-creator">
              <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-dark-blue mb-2">Criador de Propostas</h4>
              <p className="text-soft-gray text-sm mb-4">Elabore temas personalizados com textos motivadores</p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-dark-blue/30 hover:bg-dark-blue/10"
                data-testid="button-access-proposals"
              >
                Acessar
              </Button>
            </LiquidGlassCard>

            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 p-6 text-center" data-testid="card-personal-library">
              <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                <Archive className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-dark-blue mb-2">Biblioteca Pessoal</h4>
              <p className="text-soft-gray text-sm mb-4">Repositório inteligente de todo seu processo de aprendizado</p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-soft-gray/30 hover:bg-soft-gray/10"
                data-testid="button-access-library"
              >
                Acessar
              </Button>
            </LiquidGlassCard>

            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 p-6 text-center" data-testid="card-educational-newsletter">
              <div className="w-12 h-12 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                <Newspaper className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-dark-blue mb-2">Newsletter Educacional</h4>
              <p className="text-soft-gray text-sm mb-4">Curadoria semanal dos temas mais relevantes</p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-bright-blue/30 hover:bg-bright-blue/10"
                data-testid="button-access-newsletter"
              >
                Acessar
              </Button>
            </LiquidGlassCard>
          </div>
        </div>

        {/* CTA Section */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue to-dark-blue p-12 text-center text-white" data-testid="card-cta">
          <h2 className="text-3xl font-bold mb-4">Pronto para Transformar sua Escrita?</h2>
          <p className="text-xl mb-8 text-white/90">
            Explore todas as funcionalidades e personalize sua experiência de aprendizado
          </p>
          <Button 
            onClick={() => setLocation('/dashboard')}
            className="bg-white text-dark-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100" 
            data-testid="button-return-dashboard"
          >
            Voltar ao Dashboard
          </Button>
        </LiquidGlassCard>
      </div>
    </div>
  );
}