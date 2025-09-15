import React, { useEffect, useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, GraduationCap, Clock, FileText, Award, Target, Play, CheckCircle, Sparkles, Copy, MoreHorizontal, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Simulador() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  
  // Sistema inteligente de detecção de origem
  const getBackUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('from');
    const fromSession = sessionStorage.getItem('simulador-origin');
    const fromPage = fromUrl || fromSession || 'dashboard';
    
    console.log('Detectando origem da página:');
    console.log('- URL param "from":', fromUrl);
    console.log('- SessionStorage "simulador-origin":', fromSession);
    console.log('- Origem final detectada:', fromPage);
    
    // Salvar a origem atual se vier da URL (isso sobrescreve qualquer valor anterior)
    if (fromUrl) {
      sessionStorage.setItem('simulador-origin', fromUrl);
      console.log('- Salvando nova origem no sessionStorage:', fromUrl);
    }
    
    // Retornar URL correta baseada na origem
    switch (fromPage) {
      case 'functionalities':
        return '/functionalities';
      case 'dashboard':
        return '/dashboard';
      default:
        return '/dashboard'; // fallback seguro
    }
  };
  
  const backUrl = getBackUrl();

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Estados para os campos obrigatórios
  const [examType, setExamType] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [theme, setTheme] = useState("");
  const [timerDisplay, setTimerDisplay] = useState("");
  
  // Estados para campos opcionais
  const [customTheme, setCustomTheme] = useState("");
  const [textProposal, setTextProposal] = useState("");
  
  // Estados para propostas geradas com IA
  const [generatedProposals, setGeneratedProposals] = useState<any[]>([]);
  const [showAllSimulations, setShowAllSimulations] = useState(false);
  
  // Verificar se todos os campos obrigatórios estão preenchidos
  const isFormComplete = examType && timeLimit && theme && timerDisplay;
  
  const { toast } = useToast();
  
  // Mutação para gerar propostas com IA
  const generateProposalsMutation = useMutation({
    mutationFn: async () => {
      const themeToUse = theme === 'custom' ? customTheme : theme;
      const selectedTheme = theme === 'random' ? 'social' : themeToUse;
      
      return apiRequest('/api/proposals/generate', {
        method: 'POST',
        body: {
          theme: selectedTheme,
          difficulty: 'medio',
          examType: examType || 'enem',
          keywords: themeToUse ? [themeToUse] : []
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedProposals(data.results);
      toast({
        title: "Propostas geradas com sucesso!",
        description: `${data.results.length} propostas foram criadas com IA para sua simulação.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar propostas",
        description: "Não foi possível gerar propostas no momento. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao gerar propostas:', error);
    }
  });

  // Função para copiar proposta para o campo de texto
  const copyProposalToField = (proposal: any) => {
    const fullText = `${proposal.title}\n\n${proposal.statement}\n\n${proposal.supportingText || ''}`;
    setTextProposal(fullText);
    toast({
      title: "Proposta copiada!",
      description: "A proposta foi copiada para o campo de texto.",
    });
  };

  // Buscar simulações da API usando React Query
  const { data: simulationsData, isLoading: isLoadingSimulations } = useQuery({
    queryKey: ['/api/simulations'],
    staleTime: 60000, // Cache por 1 minuto
  });

  // Mutation para criar uma nova simulação
  const createSimulationMutation = useMutation({
    mutationFn: (simulationData: any) => apiRequest('/api/simulations', {
      method: 'POST',
      body: simulationData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
    },
  });

  // Mutation para atualizar simulação existente
  const updateSimulationMutation = useMutation({
    mutationFn: ({ id, ...updateData }: { id: string; [key: string]: any }) => 
      apiRequest(`/api/simulations/${id}`, {
        method: 'PUT',
        body: updateData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simulations'] });
    },
  });

  const allSimulations = simulationsData?.results || [];
  const simulationsToShow = showAllSimulations ? allSimulations : allSimulations.slice(0, 2);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Função para formatar tempo
  const formatTime = (minutes: number | null) => {
    if (!minutes) return '--';
    return `${minutes}min`;
  };
  
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
                <Select onValueChange={setExamType} data-testid="select-exam-type">
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
                <Select onValueChange={setTimeLimit} data-testid="select-time-limit">
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
                <Select onValueChange={setTheme} data-testid="select-theme">
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
                <Select onValueChange={setTimerDisplay} data-testid="select-timer-display">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Como mostrar o tempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Sempre visível</SelectItem>
                    <SelectItem value="5min">Atualizar a cada 5 minutos</SelectItem>
                    <SelectItem value="10min">Atualizar a cada 10 minutos</SelectItem>
                    <SelectItem value="15min">Atualizar a cada 15 minutos</SelectItem>
                    <SelectItem value="30min">Atualizar a cada 30 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-blue mb-2">Tema Personalizado (opcional)</label>
              <Input 
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="Digite seu tema específico aqui..."
                className="border-bright-blue/20"
                data-testid="input-custom-theme"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-blue mb-2">Proposta de Texto (opcional)</label>
              <Textarea 
                value={textProposal}
                onChange={(e) => setTextProposal(e.target.value)}
                placeholder="Cole aqui uma proposta específica de redação que você gostaria de usar..."
                className="border-bright-blue/20 min-h-[100px]"
                data-testid="textarea-text-proposal"
              />
            </div>

            {/* IA Proposal Generation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-blue mb-3">Gerar Propostas com IA</label>
              <Button
                type="button"
                variant="outline"
                onClick={() => generateProposalsMutation.mutate()}
                disabled={!theme || !examType || generateProposalsMutation.isPending}
                className="w-full flex items-center justify-center space-x-2 py-3"
                data-testid="button-generate-proposals"
              >
                <Sparkles className={`w-4 h-4 ${generateProposalsMutation.isPending ? 'animate-spin' : ''}`} />
                <span>
                  {generateProposalsMutation.isPending 
                    ? 'Gerando propostas...' 
                    : generatedProposals.length > 0 
                      ? 'Gerar Novas Propostas (substitui as atuais)' 
                      : 'Gerar Propostas com IA'}
                </span>
              </Button>
              
              {generatedProposals.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm text-soft-gray mb-2">
                    {generatedProposals.length} propostas geradas com textos de apoio completos:
                  </div>
                  {generatedProposals.map((proposal, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 rounded-lg border border-bright-blue/20">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-dark-blue text-sm">{proposal.title}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyProposalToField(proposal)}
                          className="text-bright-blue hover:text-dark-blue flex items-center space-x-1"
                          data-testid={`button-copy-proposal-${index}`}
                        >
                          <Copy className="w-3 h-3" />
                          <span className="text-xs">Usar</span>
                        </Button>
                      </div>
                      <p className="text-xs text-soft-gray mb-2 leading-relaxed">{proposal.statement}</p>
                      {proposal.supportingText && (
                        <div className="text-xs text-dark-blue/80 bg-white/50 p-2 rounded border-l-2 border-bright-blue/30">
                          <strong>Texto de apoio:</strong> {proposal.supportingText}
                        </div>
                      )}
                      <div className="flex items-center space-x-3 mt-2 text-xs text-soft-gray">
                        <span>Dificuldade: {proposal.difficulty}</span>
                        <span>Tema: {proposal.theme}</span>
                        <span>Tipo: {proposal.examType?.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              onClick={async () => {
                if (isFormComplete) {
                  try {
                    // Criar simulação no backend primeiro
                    const newSimulation = await createSimulationMutation.mutateAsync({
                      title: `${examType} - ${theme === 'custom' ? customTheme : theme}`,
                      examType,
                      theme: theme === 'custom' ? customTheme : theme,
                      timeLimit: parseInt(timeLimit === "no-limit" ? "0" : timeLimit),
                      textProposal,
                      progress: 0,
                      isCompleted: false,
                      sessionId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    });

                    // Salvar todas as configurações escolhidas
                    const simulationConfig = {
                      simulationId: newSimulation.simulation.id,
                      examType,
                      timeLimit: parseInt(timeLimit === "no-limit" ? "0" : timeLimit),
                      theme,
                      timerDisplay,
                      customTheme,
                      textProposal
                    };
                    
                    // Salvar configurações no sessionStorage
                    sessionStorage.setItem('simulation-config', JSON.stringify(simulationConfig));
                    
                    // Garantir que a origem está salva antes de navegar
                    const urlParams = new URLSearchParams(window.location.search);
                    const currentFrom = urlParams.get('from') || sessionStorage.getItem('simulador-origin') || 'dashboard';
                    sessionStorage.setItem('simulador-origin', currentFrom);
                    setLocation('/simulacao');
                  } catch (error) {
                    console.error('Erro ao criar simulação:', error);
                    toast({
                      title: "Erro",
                      description: "Não foi possível iniciar a simulação. Tente novamente.",
                      variant: "destructive",
                    });
                  }
                }
              }}
              disabled={!isFormComplete}
              className={`w-full ${
                isFormComplete 
                  ? 'bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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

          {/* Complete Simulations History */}
          <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">
                  {showAllSimulations ? 'Histórico Completo' : 'Simulações Recentes'}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllSimulations(!showAllSimulations)}
                className="flex items-center space-x-2"
                data-testid="button-toggle-history"
              >
                <Calendar className="w-4 h-4" />
                <span>{showAllSimulations ? 'Ver Recentes' : 'Ver Todas'}</span>
              </Button>
            </div>
            
            <div className="space-y-4">
              {isLoadingSimulations ? (
                <div className="text-center py-8">
                  <div className="text-soft-gray">Carregando histórico de simulações...</div>
                </div>
              ) : simulationsToShow.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-soft-gray">Nenhuma simulação realizada ainda</div>
                  <div className="text-xs text-soft-gray mt-1">
                    Complete sua primeira simulação para ver o histórico aqui
                  </div>
                </div>
              ) : (
                simulationsToShow.map((simulation: any, index: number) => (
                  <div key={simulation.id} className={`p-4 rounded-lg border ${
                    index % 2 === 0 
                      ? 'bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 border-bright-blue/20'
                      : 'bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 border-dark-blue/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-dark-blue">{simulation.title}</h4>
                      <div className="flex items-center space-x-1">
                        <Award className={index % 2 === 0 ? "text-bright-blue" : "text-dark-blue"} size={16} />
                        <span className={`font-semibold ${index % 2 === 0 ? "text-bright-blue" : "text-dark-blue"}`}>
                          {simulation.score || '--'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-soft-gray mb-2">
                      <span>Realizado em {formatDate(simulation.createdAt)}</span>
                      <span>Tempo: {formatTime(simulation.timeTaken)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={simulation.progress || 0} className="flex-1 h-2" />
                      <span className={`text-xs font-medium ${index % 2 === 0 ? "text-bright-blue" : "text-dark-blue"}`}>
                        {simulation.progress || 0}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 text-xs text-soft-gray">
                      <span className="capitalize">{simulation.examType}</span>
                      <span>•</span>
                      <span>{simulation.theme}</span>
                      {simulation.isCompleted && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">✓ Concluída</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {!isLoadingSimulations && showAllSimulations && allSimulations.length > 6 && (
                <div className="text-center pt-4">
                  <div className="text-sm text-soft-gray">
                    Total de {allSimulations.length} simulações realizadas
                  </div>
                </div>
              )}
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
}