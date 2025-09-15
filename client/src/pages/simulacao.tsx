import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/liquid-glass-card';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Save,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SimulacaoPage() {
  const [, setLocation] = useLocation();
  
  // Configuration settings from simulator
  const [config] = useState(() => {
    // Tentar recuperar configurações salvas do simulador
    const savedConfig = sessionStorage.getItem('simulation-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        return {
          examType: parsedConfig.examType || 'ENEM',
          timeLimit: parsedConfig.timeLimit || 90, // minutes
          theme: parsedConfig.theme || 'technology',
          customTheme: parsedConfig.customTheme || '',
          textProposal: parsedConfig.textProposal || '',
          timerDisplay: parsedConfig.timerDisplay || 'always',
          showWordCount: true,
          autoSave: true,
          spellCheck: true,
          fontSize: 'medium', // small, medium, large
          autoSaveInterval: 30, // seconds
          focusMode: false
        };
      } catch (error) {
        console.error('Erro ao parsear configurações:', error);
      }
    }
    
    // Configurações padrão caso não tenha configuração salva
    return {
      examType: 'ENEM',
      timeLimit: 90, // minutes
      theme: 'technology',
      customTheme: '',
      textProposal: '',
      timerDisplay: 'always',
      showWordCount: true,
      autoSave: true,
      spellCheck: true,
      fontSize: 'medium',
      autoSaveInterval: 30,
      focusMode: false
    };
  });
  
  // Simulation state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit * 60);
  const [essayText, setEssayText] = useState('');
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [lastSave, setLastSave] = useState(Date.now());
  const [timerUpdateCounter, setTimerUpdateCounter] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(config.timeLimit * 60);
  const [showTimeDetails, setShowTimeDetails] = useState(false);
  
  // Checkpoint system
  const [checkpoints, setCheckpoints] = useState([
    { id: 'brainstorm', name: 'Brainstorm', completed: false, timeSpent: 0, completedAt: null as Date | null },
    { id: 'rascunho', name: 'Rascunho', completed: false, timeSpent: 0, completedAt: null as Date | null },
    { id: 'limpo', name: 'Passa a Limpo', completed: false, timeSpent: 0, completedAt: null as Date | null }
  ]);
  const [lastCheckpointTime, setLastCheckpointTime] = useState(0);
  
  // Generate topic based on configuration
  const getTopicByTheme = (theme: string, customTheme: string, customProposal: string, examType: string) => {
    if (customProposal) {
      return {
        title: customTheme || "Tema Personalizado",
        instruction: customProposal,
        examType: examType,
        category: "Personalizado"
      };
    }
    
    const topics: Record<string, any> = {
      'random': {
        title: "A importância da inteligência artificial na educação brasileira",
        instruction: "Com base na leitura dos textos motivadores seguintes e nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema 'A importância da inteligência artificial na educação brasileira', apresentando proposta de intervenção que respeite os direitos humanos.",
        category: "Tema Aleatório"
      },
      'technology': {
        title: "A importância da inteligência artificial na educação brasileira",
        instruction: "Com base na leitura dos textos motivadores seguintes e nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema 'A importância da inteligência artificial na educação brasileira', apresentando proposta de intervenção que respeite os direitos humanos.",
        category: "Tecnologia e Sociedade"
      },
      'environment': {
        title: "Sustentabilidade e preservação ambiental no Brasil contemporâneo",
        instruction: "Redija um texto dissertativo-argumentativo sobre os desafios da sustentabilidade e preservação ambiental no Brasil, propondo soluções viáveis que conciliem desenvolvimento econômico e conservação.",
        category: "Meio Ambiente e Sustentabilidade"
      },
      'education': {
        title: "Democratização do ensino superior no Brasil: avanços e desafios",
        instruction: "Desenvolva uma dissertação sobre a democratização do acesso ao ensino superior brasileiro, analisando políticas públicas e propondo melhorias para ampliar oportunidades educacionais.",
        category: "Educação e Conhecimento"
      },
      'social': {
        title: "Desigualdade social e seus reflexos na sociedade brasileira",
        instruction: "Elabore um texto dissertativo-argumentativo sobre os impactos da desigualdade social no Brasil, apresentando causas, consequências e propostas de intervenção.",
        category: "Questões Sociais"
      },
      'politics': {
        title: "Participação política e cidadania na democracia brasileira",
        instruction: "Desenvolva um texto dissertativo-argumentativo sobre a importância da participação política ativa na consolidação da democracia brasileira, propondo formas de engajamento cidadão.",
        category: "Política e Cidadania"
      },
      'economy': {
        title: "Desafios do mercado de trabalho na era digital",
        instruction: "Redija uma dissertação sobre as transformações no mercado de trabalho causadas pela digitalização, analisando impactos e propondo soluções para adaptação profissional.",
        category: "Economia e Trabalho"
      },
      'health': {
        title: "Saúde mental na sociedade contemporânea",
        instruction: "Elabore um texto dissertativo-argumentativo sobre os desafios da saúde mental no Brasil atual, apresentando causas e propostas de intervenção para promoção do bem-estar.",
        category: "Saúde e Bem-estar"
      },
      'culture': {
        title: "Preservação da diversidade cultural brasileira",
        instruction: "Desenvolva uma dissertação sobre a importância de preservar a diversidade cultural do Brasil, analisando ameaças e propondo estratégias de valorização.",
        category: "Cultura e Arte"
      },
      'human-rights': {
        title: "Combate ao preconceito e promoção dos direitos humanos",
        instruction: "Redija um texto dissertativo-argumentativo sobre a necessidade de combater o preconceito para garantir os direitos humanos, propondo ações efetivas.",
        category: "Direitos Humanos"
      },
      'media': {
        title: "O papel da mídia na formação da opinião pública",
        instruction: "Elabore uma dissertação sobre a influência dos meios de comunicação na sociedade brasileira, analisando responsabilidades e propondo melhorias.",
        category: "Mídia e Comunicação"
      },
      'ethics': {
        title: "Dilemas éticos na sociedade digital",
        instruction: "Desenvolva um texto dissertativo-argumentativo sobre os principais dilemas éticos enfrentados na era digital, propondo diretrizes para conduta responsável.",
        category: "Ética e Moral"
      },
      'science': {
        title: "Ciência e inovação como motores do desenvolvimento nacional",
        instruction: "Redija uma dissertação sobre o papel da pesquisa científica e inovação no desenvolvimento do Brasil, propondo políticas de incentivo.",
        category: "Ciência e Inovação"
      },
      'custom': {
        title: customTheme || "Tema Personalizado",
        instruction: "Desenvolva um texto dissertativo-argumentativo sobre o tema escolhido, seguindo a estrutura formal da redação e apresentando proposta de intervenção.",
        category: "Tema Personalizado"
      }
    };
    
    const selectedTopic = topics[theme] || topics['technology'];
    return {
      ...selectedTopic,
      title: customTheme || selectedTopic.title,
      examType: examType
    };
  };
  
  const [topic] = useState(getTopicByTheme(config.theme, config.customTheme, config.textProposal, config.examType));

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect with configurable display updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
        setTimerUpdateCounter(counter => counter + 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setShowFinishDialog(true);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);
  
  // Update displayed time based on timer display configuration
  useEffect(() => {
    if (config.timerDisplay === 'always') {
      setDisplayedTime(timeLeft);
    } else {
      const intervalMap: Record<string, number> = {
        '5min': 300,
        '10min': 600,
        '15min': 900,
        '30min': 1800
      };
      const updateInterval = intervalMap[config.timerDisplay] || 300;
      
      if (Math.floor(timerUpdateCounter / updateInterval) !== Math.floor((timerUpdateCounter - 1) / updateInterval)) {
        setDisplayedTime(timeLeft);
      }
    }
  }, [timeLeft, timerUpdateCounter, config.timerDisplay]);
  
  // Auto-save effect
  useEffect(() => {
    if (config.autoSave && isActive && essayText.trim().length > 0) {
      const now = Date.now();
      if (now - lastSave >= config.autoSaveInterval * 1000) {
        console.log('Auto-saving...'); // In real app, this would save to backend
        setLastSave(now);
      }
    }
  }, [essayText, isActive, config.autoSave, config.autoSaveInterval, lastSave]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count words and lines
  const wordCount = essayText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = essayText.split('\n').length;
  const charCount = essayText.length;

  // Checkpoint functions
  const handleCheckpointComplete = (checkpointId: string) => {
    const currentTime = 90 * 60 - timeLeft;
    const timeSpent = currentTime - lastCheckpointTime;
    
    setCheckpoints(prev => prev.map(checkpoint => {
      if (checkpoint.id === checkpointId) {
        return {
          ...checkpoint,
          completed: !checkpoint.completed,
          timeSpent: checkpoint.completed ? 0 : timeSpent,
          completedAt: checkpoint.completed ? null : new Date()
        };
      }
      return checkpoint;
    }));
    
    if (!checkpoints.find(cp => cp.id === checkpointId)?.completed) {
      setLastCheckpointTime(currentTime);
    }
  };

  // Simulation controls
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setLastCheckpointTime(0);
    setDisplayedTime(timeLeft);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    setShowFinishDialog(true);
  };

  const handleSave = () => {
    // Navigate to results page with essay data
    setIsActive(false);
    setLocation('/resultado');
  };

  const confirmFinish = () => {
    // Reset everything
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(config.timeLimit * 60);
    setEssayText('');
    setCheckpoints(prev => prev.map(checkpoint => ({
      ...checkpoint,
      completed: false,
      timeSpent: 0,
      completedAt: null
    })));
    setLastCheckpointTime(0);
    setShowFinishDialog(false);
    // Stay on the same page after reset
  };

  const confirmSave = () => {
    setShowSaveDialog(false);
    // Here would normally save as draft
  };

  const handleBack = () => {
    const savedOrigin = sessionStorage.getItem('simulador-origin');
    const backUrl = savedOrigin ? `/simulador?from=${savedOrigin}` : '/simulador';
    
    if (isActive || essayText.trim().length > 0) {
      if (confirm('Você tem certeza que deseja sair? Seu progresso será perdido.')) {
        setLocation(backUrl);
      }
    } else {
      setLocation(backUrl);
    }
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeLeft / (config.timeLimit * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get timer status text based on update frequency
  const getTimerStatusText = () => {
    const statusMap = {
      'always': 'Tempo atualizado em tempo real',
      '5min': 'Próxima atualização em 5 minutos',
      '10min': 'Próxima atualização em 10 minutos', 
      '15min': 'Próxima atualização em 15 minutos',
      '30min': 'Próxima atualização em 30 minutos'
    };
    return statusMap[config.timerDisplay as keyof typeof statusMap] || 'Tempo controlado';
  };
  
  // Get font size based on config
  const getFontSize = () => {
    const sizes: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    return sizes[config.fontSize] || sizes.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bright-blue/10 via-white to-dark-blue/10 p-4">
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-start">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
            data-testid="button-back-to-simulator"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Button>
        </div>
      </div>
      
      {/* First Row - Topic/Proposal Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <LiquidGlassCard className="bg-gradient-to-br from-white/80 to-bright-blue/5 border-bright-blue/20">
          <div className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
            <div className="flex items-center space-x-2 mb-3">
              <div className="px-2 py-1 bg-bright-blue text-white text-xs rounded-full font-medium">
                {topic.examType}
              </div>
              <div className="px-2 py-1 bg-dark-blue/20 text-dark-blue text-xs rounded-full">
                {topic.category}
              </div>
            </div>
            <h2 className="text-lg font-bold text-dark-blue mb-3">{topic.title}</h2>
            <p className="text-sm text-soft-gray leading-relaxed">{topic.instruction}</p>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Second Row - Steps, Timer and Time Summary */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Writing Process Checkpoints - Left */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={12} />
              </div>
              <h4 className="font-medium text-dark-blue">Etapas da Redação</h4>
            </div>
            
            <div className="space-y-2">
              {checkpoints.map((checkpoint, index) => {
                const isAvailable = index === 0 || checkpoints[index - 1]?.completed;
                return (
                  <div 
                    key={checkpoint.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                      checkpoint.completed 
                        ? 'bg-green-50 border-green-200'
                        : isAvailable
                          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAvailable && handleCheckpointComplete(checkpoint.id)}
                    data-testid={`checkpoint-${checkpoint.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle 
                          className={checkpoint.completed ? 'text-green-600' : 'text-gray-400'} 
                          size={16} 
                        />
                        <span className="font-medium text-dark-blue">{checkpoint.name}</span>
                      </div>
                      {checkpoint.completed && (
                        <div className="text-green-600 text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </LiquidGlassCard>
          
          {/* Timer Display - Center */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <Clock className="text-white" size={12} />
              </div>
              <h4 className="font-medium text-dark-blue">Timer</h4>
            </div>
            
            <div className="text-center space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-mono font-bold mb-1 transition-all duration-500 ${
                  isActive && !isPaused ? 'text-green-600' : 
                  isPaused ? 'text-yellow-600' : 
                  'text-gray-600'
                }`}>
                  {formatTime(displayedTime)}
                </div>
                <div className="text-sm text-gray-600">Tempo Restante</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getTimerStatusText()}
                </div>
                {isPaused && (
                  <div className="text-xs text-yellow-600 mt-1 font-medium">
                    ⏸️ PAUSADO
                  </div>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="space-y-2">
                {!isActive ? (
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleStart}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                      data-testid="button-start-timer"
                    >
                      <Play className="mr-1" size={14} />
                      Iniciar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <Button 
                        onClick={handlePause}
                        variant="outline"
                        className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-2 py-1 text-xs"
                        data-testid="button-pause-timer"
                      >
                        <Pause className="mr-1" size={10} />
                        {isPaused ? 'Retomar' : 'Pausar'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={handleSave}
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-1 text-xs"
                        data-testid="button-save-draft"
                      >
                        <CheckCircle className="mr-1" size={10} />
                        Corrigir Redação
                      </Button>
                      
                      <Button 
                        onClick={handleFinish}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                        data-testid="button-finish-simulation"
                      >
                        <Square className="mr-1" size={10} />
                        Parar sem Salvar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </LiquidGlassCard>

          {/* Time Summary - Right */}
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => setShowTimeDetails(!showTimeDetails)}
              data-testid="toggle-time-details"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <Clock className="text-white" size={12} />
                </div>
                <h4 className="font-medium text-dark-blue">Resumo de Tempos</h4>
              </div>
              <div className="text-gray-400">
                {showTimeDetails ? '−' : '+'}
              </div>
            </div>
            
            {/* Always show total time */}
            <div className="mb-4">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-dark-blue">Tempo Total Usado</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatTime(config.timeLimit * 60 - timeLeft)}
                </span>
              </div>
            </div>
            
            {/* Collapsible details */}
            {showTimeDetails && (
              <div className="space-y-2 border-t border-gray-200 pt-4">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-sm text-soft-gray">{checkpoint.name}</span>
                    <span className={`text-sm font-medium ${checkpoint.completed ? 'text-green-600' : 'text-gray-400'}`}>
                      {checkpoint.completed && checkpoint.timeSpent > 0 
                        ? formatTime(checkpoint.timeSpent)
                        : '--:--'
                      }
                    </span>
                  </div>
                ))}
              </div>
            )}
          </LiquidGlassCard>
        </div>
      </div>

      {/* Writing Area */}
      <div className="max-w-7xl mx-auto mb-6">
        <LiquidGlassCard className="bg-gradient-to-br from-white/80 to-bright-blue/5 border-bright-blue/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark-blue">Sua Redação</h3>
              
              {/* Word Counter - Conditional */}
              {config.showWordCount && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className={`flex items-center space-x-1 ${wordCount >= 800 && wordCount <= 1000 ? 'text-green-600' : wordCount > 1000 ? 'text-red-600' : 'text-soft-gray'}`}>
                    <FileText size={16} />
                    <span className="font-medium">{wordCount} palavras</span>
                  </div>
                  <div className="text-soft-gray">
                    {lineCount} linhas
                  </div>
                  <div className="text-soft-gray">
                    {charCount} caracteres
                  </div>
                  {config.autoSave && (
                    <div className="text-xs text-green-600">
                      ✓ Salvamento automático
                    </div>
                  )}
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Digite sua redação aqui... Lembre-se de seguir a estrutura dissertativo-argumentativa: introdução, desenvolvimento e conclusão com proposta de intervenção."
              className={`w-full h-96 p-4 border border-bright-blue/30 rounded-lg resize-none focus:outline-none focus:border-bright-blue focus:ring-2 focus:ring-bright-blue/20 bg-white/80 backdrop-blur-sm text-dark-blue placeholder-soft-gray/60 ${config.focusMode ? 'focus:bg-white focus:shadow-2xl' : ''}`}
              disabled={!isActive || isPaused}
              data-testid="textarea-essay"
              spellCheck={config.spellCheck}
              style={{ fontFamily: 'serif', fontSize: getFontSize(), lineHeight: '1.6' }}
            />

            {/* Writing Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={`p-3 rounded-lg border ${wordCount >= 800 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                <div className="font-medium mb-1">Palavras</div>
                <div>Mínimo: 800 | Máximo: 1000</div>
              </div>
              
              <div className={`p-3 rounded-lg border ${lineCount >= 25 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                <div className="font-medium mb-1">Linhas</div>
                <div>Mínimo: 25 | Máximo: 30</div>
              </div>
              
              <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-700">
                <div className="font-medium mb-1">Estrutura</div>
                <div>Introdução + 2 Desenvolvimentos + Conclusão</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Statistics Row - Bottom */}
      <div className="max-w-7xl mx-auto mb-6">
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <FileText className="text-white" size={12} />
              </div>
              <h4 className="font-medium text-dark-blue">Estatísticas</h4>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center px-4 py-2 bg-bright-blue/10 rounded-lg">
                <div className="text-lg font-bold text-bright-blue">{wordCount}</div>
                <div className="text-xs text-gray-600">Palavras</div>
              </div>
              
              <div className="text-center px-4 py-2 bg-dark-blue/10 rounded-lg">
                <div className="text-lg font-bold text-dark-blue">{lineCount}</div>
                <div className="text-xs text-gray-600">Linhas</div>
              </div>
              
              <div className="text-center px-4 py-2 bg-gray-100 rounded-lg">
                <div className="text-lg font-bold text-dark-blue">{charCount}</div>
                <div className="text-xs text-gray-600">Caracteres</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Finish Simulation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-finish-simulation">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
              <Square className="mr-3 text-red-600" size={20} />
              Finalizar Simulação
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-soft-gray">
              Tem certeza que deseja finalizar a simulação? Sua redação será avaliada e você receberá o resultado.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-bright-blue/10 rounded-lg text-center">
                <div className="font-bold text-bright-blue">{wordCount}</div>
                <div className="text-soft-gray">Palavras</div>
              </div>
              <div className="p-3 bg-dark-blue/10 rounded-lg text-center">
                <div className="font-bold text-dark-blue">{formatTime(config.timeLimit * 60 - timeLeft)}</div>
                <div className="text-soft-gray">Tempo Usado</div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFinishDialog(false)}
                className="flex-1"
                data-testid="button-cancel-finish"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmFinish}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-confirm-finish"
              >
                Finalizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Draft Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-save-draft">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
              <Save className="mr-3 text-blue-600" size={20} />
              Salvar Rascunho
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-soft-gray">
              Sua redação será salva como rascunho. Você pode continuar editando posteriormente.
            </p>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
                data-testid="button-cancel-save"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-confirm-save"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}