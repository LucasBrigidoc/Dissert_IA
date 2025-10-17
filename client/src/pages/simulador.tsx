import React, { useEffect, useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, GraduationCap, Clock, FileText, Award, Target, Play, CheckCircle, Sparkles, Copy, MoreHorizontal, Calendar, ChevronDown, ChevronRight, TrendingUp, ThumbsUp, Lightbulb, Edit3, Info } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AIUsageProgress } from "@/components/ai-usage-progress";
import { useAuth } from "@/contexts/AuthContext";

export default function Simulador() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
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
  const [difficulty, setDifficulty] = useState("");
  
  // Estados para campos opcionais
  const [textProposal, setTextProposal] = useState("");
  
  // Estado para controlar visibilidade da seção avançada
  const [showTextProposal, setShowTextProposal] = useState(false);
  
  // Estado para rastrear a proposta selecionada
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  
  // Estados para propostas geradas com IA
  const [generatedProposals, setGeneratedProposals] = useState<any[]>([]);
  const [showAllSimulations, setShowAllSimulations] = useState(false);
  
  // Estado para controlar expansão de simulações
  const [expandedSimulations, setExpandedSimulations] = useState<Set<string>>(new Set());
  
  const toggleSimulationExpansion = (simulationId: string) => {
    setExpandedSimulations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(simulationId)) {
        newSet.delete(simulationId);
      } else {
        newSet.add(simulationId);
      }
      return newSet;
    });
  };
  
  // Verificar se todos os campos obrigatórios estão preenchidos
  // Incluindo a obrigatoriedade de ter uma proposta (personalizada ou selecionada)
  const isFormComplete = examType && timeLimit && theme && timerDisplay && textProposal.trim();
  
  const { toast } = useToast();
  
  // Mutação para gerar propostas com IA
  const generateProposalsMutation = useMutation({
    mutationFn: async () => {
      const selectedTheme = theme === 'random' ? 'social' : theme;
      
      return apiRequest('/api/proposals/generate', {
        method: 'POST',
        body: {
          theme: selectedTheme,
          difficulty: 'medio',
          examType: examType || 'enem',
          keywords: selectedTheme ? [selectedTheme] : []
        }
      });
    },
    onSuccess: (data) => {
      setGeneratedProposals(data.results);
      setSelectedProposal(null); // Limpar seleção anterior
      toast({
        title: "Propostas geradas com sucesso!",
        description: `2 propostas foram criadas com IA para sua simulação.`,
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

  // Função para limpar supportingText de JSON malformado
  const cleanSupportingText = (supportingText: string): string => {
    if (!supportingText) return "";
    
    try {
      // Remove JSON structure if present
      if (supportingText.startsWith('{') || supportingText.startsWith('[')) {
        const parsed = JSON.parse(supportingText);
        
        // Extract content from various JSON structures
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: any) => item.content || item.text || '')
            .filter(Boolean)
            .join('\n\n');
        }
        
        if (parsed.type === 'paragraph' && parsed.content) {
          return parsed.content;
        }
        
        if (parsed.content) {
          return typeof parsed.content === 'string' ? parsed.content : '';
        }
      }
      
      // Clean up escaped characters and JSON artifacts
      let cleaned = supportingText
        .replace(/^\{\\"/g, '')  // Remove {\" at start
        .replace(/\\"}/g, '')     // Remove \"} at end
        .replace(/\\"/g, '"')     // Replace \" with "
        .replace(/\\n/g, '\n')    // Replace \n with actual newlines
        .replace(/^["']|["']$/g, ''); // Remove quotes at start/end
      
      return cleaned;
    } catch (e) {
      // If parsing fails, clean the text anyway
      return supportingText
        .replace(/^\{\\"/g, '')
        .replace(/\\"}/g, '')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/^["']|["']$/g, '');
    }
  };

  // Função para copiar proposta para o campo de texto
  const copyProposalToField = (proposal: any, index: number) => {
    const cleanedSupportingText = cleanSupportingText(proposal.supportingText || '');
    const fullText = `${proposal.title}\n\n${proposal.statement}\n\n--- TEXTOS DE APOIO ---\n\n${cleanedSupportingText}`;
    setTextProposal(fullText);
    setSelectedProposal(index);
    toast({
      title: "Proposta selecionada!",
      description: "A proposta foi copiada para o campo de texto e está selecionada.",
    });
  };

  // Buscar simulações da API usando React Query
  const { data: simulationsData, isLoading: isLoadingSimulations } = useQuery({
    queryKey: ['/api/simulations'],
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

  const allSimulations = Array.isArray(simulationsData) ? simulationsData : [];
  const simulationsToShow = showAllSimulations ? allSimulations : allSimulations.slice(0, 2);

  // Calcular estatísticas reais do usuário
  const calculateStats = () => {
    const completedSimulations = allSimulations.filter((sim: any) => sim.isCompleted);
    const totalSimulations = allSimulations.length;
    
    // Calcular nota média (apenas simulações com score)
    const simulationsWithScore = completedSimulations.filter((sim: any) => sim.score != null);
    const averageScore = simulationsWithScore.length > 0
      ? Math.round(simulationsWithScore.reduce((sum: number, sim: any) => sum + sim.score, 0) / simulationsWithScore.length)
      : 0;
    
    // Calcular tempo médio (apenas simulações com tempo registrado)
    const simulationsWithTime = completedSimulations.filter((sim: any) => sim.timeTaken != null && sim.timeTaken > 0);
    const averageTime = simulationsWithTime.length > 0
      ? Math.round(simulationsWithTime.reduce((sum: number, sim: any) => sum + sim.timeTaken, 0) / simulationsWithTime.length)
      : 0;
    
    return {
      totalSimulations,
      averageScore,
      averageTime
    };
  };

  const stats = calculateStats();

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };
  
  // Função para formatar data e hora completa
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Link href={backUrl} data-testid="button-back">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 h-8 px-2 text-xs"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                <GraduationCap className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Simulador de Prova</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
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
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-4 pt-32">
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
                <label className="block text-sm font-medium text-dark-blue mb-2">Dificuldade</label>
                <Select onValueChange={setDifficulty} data-testid="select-difficulty">
                  <SelectTrigger className="border-bright-blue/20">
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                    <SelectItem value="muito-dificil">Muito Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-6">
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
            
            {/* Seção Avançada - Proposta Personalizada */}
            <div className="mb-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowTextProposal(!showTextProposal)}
                className="w-full justify-between p-3 h-auto text-left bg-soft-gray/5 hover:bg-soft-gray/10 border border-soft-gray/20"
                data-testid="button-toggle-text-proposal"
              >
                <span className="text-sm font-medium text-dark-blue">
                  Proposta de Texto Personalizada<span className="hidden sm:inline"> (opcional)</span>
                </span>
                {showTextProposal ? (
                  <ChevronDown className="w-4 h-4 text-soft-gray" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-soft-gray" />
                )}
              </Button>
              
              {showTextProposal && (
                <div className="mt-3">
                  <Textarea 
                    value={textProposal}
                    onChange={(e) => {
                      setTextProposal(e.target.value);
                      setSelectedProposal(null); // Limpar seleção quando escrever proposta manual
                    }}
                    placeholder="Cole aqui uma proposta específica de redação que você gostaria de usar..."
                    className="border-bright-blue/20 min-h-[100px]"
                    data-testid="textarea-text-proposal"
                  />
                </div>
              )}
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
                    2 propostas geradas com textos de apoio completos:
                  </div>
                  {generatedProposals.slice(0, 2).map((proposal, index) => (
                    <div key={index} className={`p-5 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 rounded-lg border ${
                      selectedProposal === index 
                        ? 'border-bright-blue border-2' 
                        : 'border-bright-blue/20'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-bright-blue mb-1">PROPOSTA DE REDAÇÃO</div>
                          <h4 className="font-bold text-dark-blue text-lg mb-2">{proposal.title}</h4>
                          <div className="mt-2 mb-3">
                            <div className="text-[10px] font-bold text-dark-blue/70 mb-1 uppercase tracking-wide">📝 Enunciado</div>
                            <p className="text-sm text-dark-blue font-normal leading-relaxed">{proposal.statement}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyProposalToField(proposal, index)}
                          className="text-bright-blue hover:text-dark-blue flex items-center space-x-1 ml-3"
                          data-testid={`button-copy-proposal-${index}`}
                        >
                          <Copy className="w-3 h-3" />
                          <span className="text-xs">Usar</span>
                        </Button>
                      </div>
                      
                      {proposal.supportingText && (
                        <div className="mt-4 p-4 bg-white/80 rounded-lg border border-bright-blue/30">
                          <div className="text-xs font-bold text-dark-blue mb-2 uppercase tracking-wide">📚 Textos de Apoio</div>
                          <div className="text-base text-dark-blue leading-relaxed font-normal whitespace-pre-wrap">
                            {cleanSupportingText(proposal.supportingText)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-bright-blue/20 text-xs text-soft-gray">
                        <span className="font-medium">Dificuldade: {proposal.difficulty}</span>
                        <span>•</span>
                        <span>Tema: {proposal.theme}</span>
                        <span>•</span>
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
                      title: `${examType} - ${theme}`,
                      examType,
                      theme: theme,
                      timeLimit: parseInt(timeLimit === "no-limit" ? "0" : timeLimit),
                      textProposal,
                      progress: 0,
                      isCompleted: false,
                      userId: user?.id || null,
                      sessionId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    });

                    // Salvar todas as configurações escolhidas
                    const simulationConfig = {
                      simulationId: newSimulation.simulation.id,
                      examType,
                      timeLimit: parseInt(timeLimit === "no-limit" ? "0" : timeLimit),
                      theme,
                      timerDisplay,
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

          {/* Info card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 border-bright-blue/30" data-testid="card-simulator-evolution-info">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Info className="text-white" size={16} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-dark-blue mb-2" data-testid="text-evolution-title">Acompanhe sua Evolução</h4>
                <div className="space-y-2 text-sm text-soft-gray">
                  <div className="flex items-start space-x-2" data-testid="text-dashboard-info">
                    <TrendingUp className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                    <p>Veja sua evolução e estatísticas completas na <span className="font-medium text-dark-blue">Dashboard</span> da página inicial</p>
                  </div>
                  <div className="flex items-start space-x-2" data-testid="text-library-info">
                    <FileText className="text-bright-blue flex-shrink-0 mt-0.5" size={16} />
                    <p>Todas as informações de cada simulado são automaticamente salvas na sua <span className="font-medium text-dark-blue">Biblioteca Pessoal</span></p>
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

        </div>
      </div>
    </div>
  );
}