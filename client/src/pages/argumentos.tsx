import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageCircle, Lightbulb, BookOpen, Target, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Argumentos() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-soft-gray hover:text-bright-blue" data-testid="button-back">
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <MessageCircle className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Arquiteto de Argumentos</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Construa argumentos sólidos e persuasivos
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Tool */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Target className="text-white" size={14} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Defina seu Tema</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Tema da Redação</label>
                  <Input 
                    placeholder="Ex: O impacto da tecnologia na educação brasileira"
                    className="border-bright-blue/20 focus:border-bright-blue"
                    data-testid="input-theme"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Tipo de Texto</label>
                  <Select data-testid="select-text-type">
                    <SelectTrigger className="border-bright-blue/20">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dissertativo">Dissertativo-argumentativo</SelectItem>
                      <SelectItem value="artigo">Artigo de opinião</SelectItem>
                      <SelectItem value="carta">Carta argumentativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Sua Posição Inicial</label>
                  <Textarea 
                    placeholder="Descreva brevemente qual sua opinião sobre o tema..."
                    className="border-bright-blue/20 focus:border-bright-blue h-24"
                    data-testid="textarea-position"
                  />
                </div>
                
                <Button className="w-full bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" data-testid="button-generate-arguments">
                  <Zap className="mr-2" size={16} />
                  Gerar Argumentos
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Results Section */}
            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-bright-blue/5 border-dark-blue/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-bright-blue rounded-full flex items-center justify-center">
                  <Lightbulb className="text-white" size={14} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Argumentos Gerados</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                  <h4 className="font-semibold text-dark-blue mb-2">Argumento 1: Tecnológico</h4>
                  <p className="text-soft-gray text-sm mb-3">A democratização do acesso à internet e dispositivos móveis tem transformado a forma como os estudantes brasileiros aprendem, permitindo o acesso a conteúdos educacionais de qualidade independentemente da localização geográfica.</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-bright-blue/20 text-bright-blue px-2 py-1 rounded">Dados estatísticos</span>
                    <span className="text-xs bg-dark-blue/20 text-dark-blue px-2 py-1 rounded">Democratização</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 rounded-lg border border-dark-blue/20">
                  <h4 className="font-semibold text-dark-blue mb-2">Argumento 2: Social</h4>
                  <p className="text-soft-gray text-sm mb-3">A integração tecnológica na educação pode reduzir desigualdades sociais ao oferecer oportunidades de aprendizado personalizado e recursos adaptativos para diferentes necessidades educacionais.</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-bright-blue/20 text-bright-blue px-2 py-1 rounded">Inclusão social</span>
                    <span className="text-xs bg-dark-blue/20 text-dark-blue px-2 py-1 rounded">Personalização</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <BookOpen className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Dicas de Argumentação</h4>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-bright-blue/10 rounded-lg">
                  <div className="font-medium text-dark-blue text-sm mb-1">Use dados concretos</div>
                  <div className="text-soft-gray text-xs">Estatísticas e pesquisas fortalecem seus argumentos</div>
                </div>
                
                <div className="p-3 bg-dark-blue/10 rounded-lg">
                  <div className="font-medium text-dark-blue text-sm mb-1">Varie os tipos</div>
                  <div className="text-soft-gray text-xs">Combine argumentos de autoridade, exemplificação e causa-consequência</div>
                </div>
                
                <div className="p-3 bg-soft-gray/10 rounded-lg">
                  <div className="font-medium text-dark-blue text-sm mb-1">Conecte os argumentos</div>
                  <div className="text-soft-gray text-xs">Use conectivos adequados para criar fluidez</div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Quick Actions */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <h4 className="font-semibold text-dark-blue mb-4">Ações Rápidas</h4>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-save-arguments"
                >
                  Salvar Argumentos
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-dark-blue/30 hover:bg-dark-blue/10"
                  data-testid="button-export-pdf"
                >
                  Exportar PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-soft-gray/30 hover:bg-soft-gray/10"
                  data-testid="button-new-theme"
                >
                  Novo Tema
                </Button>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}