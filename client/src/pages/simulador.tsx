import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GraduationCap, Clock, FileText, Award, Target, Play, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Simulador() {
  const [, setLocation] = useLocation();
  
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
                  <GraduationCap className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Simulador de Prova</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Pratique em condições reais de exame
            </div>
          </div>
        </div>
      </div>

      {/* Statistics - Top Section */}
      <div className="container mx-auto px-6 py-6">
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
          <div className="flex items-center space-x-3 mb-6">
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
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-blue mb-2">Tema do Simulado</label>
                <Select data-testid="select-theme">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Escolha um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Tema Aleatório</SelectItem>
                    <SelectItem value="technology">Tecnologia e Sociedade</SelectItem>
                    <SelectItem value="environment">Meio Ambiente</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="social">Questões Sociais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => setLocation('/simulacao')}
                className="w-full bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" 
                data-testid="button-start-simulation"
              >
                <Play className="mr-2" size={16} />
                Iniciar Simulação
              </Button>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <Clock className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Dicas para o Simulado</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-bright-blue mt-0.5" size={16} />
                  <div className="text-sm text-soft-gray">Leia atentamente a proposta antes de começar</div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-bright-blue mt-0.5" size={16} />
                  <div className="text-sm text-soft-gray">Faça um rascunho para organizar as ideias</div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-bright-blue mt-0.5" size={16} />
                  <div className="text-sm text-soft-gray">Reserve tempo para revisão final</div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-bright-blue mt-0.5" size={16} />
                  <div className="text-sm text-soft-gray">Simule as condições reais do exame</div>
                </div>
              </div>
            </LiquidGlassCard>

          </div>
        </div>
      </div>
    </div>
  );
}