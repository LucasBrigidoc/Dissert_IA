import React, { useEffect } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, GraduationCap, Clock, FileText, Award, Target, Play, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Simulador() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || sessionStorage.getItem('simulador-origin') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';
  
  // Salvar a origem no sessionStorage quando a página carrega
  useEffect(() => {
    const currentFrom = urlParams.get('from');
    if (currentFrom) {
      sessionStorage.setItem('simulador-origin', currentFrom);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href={backUrl} data-testid="button-back">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-dark-blue">Simulador de Prova</h1>
                </div>
              </div>
            </div>
            <div>
              <p className="text-soft-gray">Pratique em condições reais de exame</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics - Top Section */}
      <div className="container mx-auto px-6 py-3 pt-24">
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
              <Award className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Suas Estatísticas</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-bright-blue/10 rounded-lg">
              <div className="text-2xl font-bold text-bright-blue mb-1">12</div>
              <div className="text-xs text-soft-gray">Simulações Realizadas</div>
            </div>
            
            <div className="text-center p-4 bg-dark-blue/10 rounded-lg">
              <div className="text-2xl font-bold text-dark-blue mb-1">876</div>
              <div className="text-xs text-soft-gray">Nota Média</div>
            </div>
            
            <div className="text-center p-4 bg-soft-gray/10 rounded-lg">
              <div className="text-2xl font-bold text-dark-blue mb-1">68min</div>
              <div className="text-xs text-soft-gray">Tempo Médio</div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-4">
        <div className="space-y-6">
          {/* Exam Selection */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Target className="text-white" size={14} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue">Configurar Simulação</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-dark-blue mb-2">Tipo de Exame</label>
                <Select data-testid="select-exam-type">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Selecione o exame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enem">ENEM</SelectItem>
                    <SelectItem value="vestibular">Vestibular</SelectItem>
                    <SelectItem value="concurso">Concurso Público</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-blue mb-2">Tempo Limite</label>
                <Select data-testid="select-time-limit">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">60 minutos (ENEM)</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                    <SelectItem value="no-limit">Sem limite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-dark-blue mb-2">Tema do Simulado</label>
                <Select data-testid="select-theme">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Escolha um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Tema Aleatório</SelectItem>
                    <SelectItem value="technology">Tecnologia e Sociedade</SelectItem>
                    <SelectItem value="environment">Meio Ambiente e Sustentabilidade</SelectItem>
                    <SelectItem value="education">Educação e Conhecimento</SelectItem>
                    <SelectItem value="social">Questões Sociais</SelectItem>
                    <SelectItem value="politics">Política e Cidadania</SelectItem>
                    <SelectItem value="economy">Economia e Trabalho</SelectItem>
                    <SelectItem value="health">Saúde e Bem-estar</SelectItem>
                    <SelectItem value="culture">Cultura e Arte</SelectItem>
                    <SelectItem value="human-rights">Direitos Humanos</SelectItem>
                    <SelectItem value="media">Mídia e Comunicação</SelectItem>
                    <SelectItem value="ethics">Ética e Moral</SelectItem>
                    <SelectItem value="science">Ciência e Inovação</SelectItem>
                    <SelectItem value="custom">Tema Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-blue mb-2">Exibição do Timer</label>
                <Select data-testid="select-timer-display">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Como mostrar o tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Sempre visível</SelectItem>
                    <SelectItem value="1min">Atualizar a cada 1 minuto</SelectItem>
                    <SelectItem value="5min">Atualizar a cada 5 minutos</SelectItem>
                    <SelectItem value="10min">Atualizar a cada 10 minutos</SelectItem>
                    <SelectItem value="hidden">Oculto (apenas no final)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-blue mb-2">Tema Personalizado (opcional)</label>
              <Input 
                placeholder="Digite seu tema específico aqui..."
                className="border-bright-blue/20"
                data-testid="input-custom-theme"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-blue mb-2">Proposta de Texto (opcional)</label>
              <Textarea 
                placeholder="Cole aqui uma proposta específica de redação que você gostaria de usar..."
                className="border-bright-blue/20 min-h-[100px]"
                data-testid="textarea-text-proposal"
              />
            </div>
            
            
            
            <Button 
              onClick={() => {
                // Garantir que a origem está salva antes de navegar
                const currentFrom = urlParams.get('from') || sessionStorage.getItem('simulador-origin') || 'dashboard';
                sessionStorage.setItem('simulador-origin', currentFrom);
                setLocation('/simulacao');
              }}
              className="w-full bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" 
              data-testid="button-start-simulation"
            >
              <Play className="mr-2" size={16} />
              Iniciar Simulação
            </Button>
          </LiquidGlassCard>

          {/* Tips */}
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                <Clock className="text-white" size={16} />
              </div>
              <h4 className="font-semibold text-dark-blue">Dicas para o Simulado</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-bright-blue flex-shrink-0" size={16} />
                <div className="text-sm text-soft-gray">Leia atentamente a proposta antes de começar</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-bright-blue flex-shrink-0" size={16} />
                <div className="text-sm text-soft-gray">Faça um rascunho para organizar as ideias</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-bright-blue flex-shrink-0" size={16} />
                <div className="text-sm text-soft-gray">Reserve tempo para revisão final</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-bright-blue flex-shrink-0" size={16} />
                <div className="text-sm text-soft-gray">Simule as condições reais do exame</div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Recent Simulations */}
          <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                <FileText className="text-white" size={16} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue">Simulações Recentes</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-dark-blue">ENEM - Tecnologia na Educação</h4>
                  <div className="flex items-center space-x-1">
                    <Award className="text-bright-blue" size={16} />
                    <span className="text-bright-blue font-semibold">850</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-soft-gray mb-2">
                  <span>Realizado em 23/08/2024</span>
                  <span>Tempo: 58min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={85} className="flex-1 h-2" />
                  <span className="text-xs text-bright-blue font-medium">85%</span>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 rounded-lg border border-dark-blue/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-dark-blue">Vestibular - Meio Ambiente</h4>
                  <div className="flex items-center space-x-1">
                    <Award className="text-dark-blue" size={16} />
                    <span className="text-dark-blue font-semibold">920</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-soft-gray mb-2">
                  <span>Realizado em 20/08/2024</span>
                  <span>Tempo: 75min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={92} className="flex-1 h-2" />
                  <span className="text-xs text-dark-blue font-medium">92%</span>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
}