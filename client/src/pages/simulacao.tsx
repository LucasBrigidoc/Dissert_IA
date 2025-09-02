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
  
  // Simulation state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [essayText, setEssayText] = useState('');
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Simulation topic (could come from previous page)
  const [topic] = useState({
    title: "A importância da inteligência artificial na educação brasileira",
    instruction: "Com base na leitura dos textos motivadores seguintes e nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema 'A importância da inteligência artificial na educação brasileira', apresentando proposta de intervenção que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para defesa de seu ponto de vista.",
    examType: "ENEM",
    category: "Tecnologia"
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
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

  // Simulation controls
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
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
    setShowSaveDialog(true);
  };

  const confirmFinish = () => {
    setIsActive(false);
    setShowFinishDialog(false);
    // Here would normally save the simulation results
    setLocation('/simulador');
  };

  const confirmSave = () => {
    setShowSaveDialog(false);
    // Here would normally save as draft
  };

  const handleBack = () => {
    if (isActive || essayText.trim().length > 0) {
      if (confirm('Você tem certeza que deseja sair? Seu progresso será perdido.')) {
        setLocation('/simulador');
      }
    } else {
      setLocation('/simulador');
    }
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeLeft / (90 * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bright-blue/10 via-white to-dark-blue/10 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
            data-testid="button-back-to-simulator"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Button>
          
          {/* Timer and Status */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 ${getTimerColor()}`}>
              <Clock size={20} />
              <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isActive ? (
                <Button 
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-start-timer"
                >
                  <Play className="mr-2" size={16} />
                  Iniciar
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handlePause}
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    data-testid="button-pause-timer"
                  >
                    <Pause className="mr-2" size={16} />
                    {isPaused ? 'Retomar' : 'Pausar'}
                  </Button>
                  
                  <Button 
                    onClick={handleSave}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    data-testid="button-save-draft"
                  >
                    <Save className="mr-2" size={16} />
                    Salvar
                  </Button>
                  
                  <Button 
                    onClick={handleFinish}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-finish-simulation"
                  >
                    <Square className="mr-2" size={16} />
                    Finalizar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Writing Area */}
          <div className="lg:col-span-3">
            <LiquidGlassCard className="bg-gradient-to-br from-white/80 to-bright-blue/5 border-bright-blue/20">
              {/* Topic Section */}
              <div className="mb-6 p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
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

              {/* Writing Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-dark-blue">Sua Redação</h3>
                  
                  {/* Word Counter */}
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
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  placeholder="Digite sua redação aqui... Lembre-se de seguir a estrutura dissertativo-argumentativa: introdução, desenvolvimento e conclusão com proposta de intervenção."
                  className="w-full h-96 p-4 border border-bright-blue/30 rounded-lg resize-none focus:outline-none focus:border-bright-blue focus:ring-2 focus:ring-bright-blue/20 bg-white/80 backdrop-blur-sm text-dark-blue placeholder-soft-gray/60"
                  disabled={!isActive || isPaused}
                  data-testid="textarea-essay"
                  style={{ fontFamily: 'serif', fontSize: '16px', lineHeight: '1.6' }}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Stats */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Progresso</h4>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-3 bg-bright-blue/10 rounded-lg">
                  <div className="text-xl font-bold text-bright-blue mb-1">{wordCount}</div>
                  <div className="text-xs text-soft-gray">Palavras Escritas</div>
                </div>
                
                <div className="text-center p-3 bg-dark-blue/10 rounded-lg">
                  <div className="text-xl font-bold text-dark-blue mb-1">{Math.floor(((90 * 60 - timeLeft) / (90 * 60)) * 100)}%</div>
                  <div className="text-xs text-soft-gray">Tempo Utilizado</div>
                </div>
                
                <div className="text-center p-3 bg-soft-gray/10 rounded-lg">
                  <div className="text-xl font-bold text-dark-blue mb-1">{lineCount}</div>
                  <div className="text-xs text-soft-gray">Linhas</div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Checklist */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Checklist</h4>
              </div>
              
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 ${wordCount >= 800 ? 'text-green-600' : 'text-soft-gray'}`}>
                  <CheckCircle className={wordCount >= 800 ? 'text-green-600' : 'text-gray-300'} size={16} />
                  <span className="text-sm">Mínimo de 800 palavras</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${lineCount >= 25 ? 'text-green-600' : 'text-soft-gray'}`}>
                  <CheckCircle className={lineCount >= 25 ? 'text-green-600' : 'text-gray-300'} size={16} />
                  <span className="text-sm">Mínimo de 25 linhas</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${essayText.includes('introdução') || essayText.length > 100 ? 'text-green-600' : 'text-soft-gray'}`}>
                  <CheckCircle className={essayText.includes('introdução') || essayText.length > 100 ? 'text-green-600' : 'text-gray-300'} size={16} />
                  <span className="text-sm">Introdução clara</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${essayText.includes('portanto') || essayText.includes('logo') || essayText.includes('assim') ? 'text-green-600' : 'text-soft-gray'}`}>
                  <CheckCircle className={essayText.includes('portanto') || essayText.includes('logo') || essayText.includes('assim') ? 'text-green-600' : 'text-gray-300'} size={16} />
                  <span className="text-sm">Conectivos utilizados</span>
                </div>
                
                <div className={`flex items-center space-x-2 ${essayText.includes('proposta') || essayText.includes('solução') ? 'text-green-600' : 'text-soft-gray'}`}>
                  <CheckCircle className={essayText.includes('proposta') || essayText.includes('solução') ? 'text-green-600' : 'text-gray-300'} size={16} />
                  <span className="text-sm">Proposta de intervenção</span>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Quick Tips */}
            <LiquidGlassCard className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-yellow-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Dicas Rápidas</h4>
              </div>
              
              <div className="space-y-2 text-sm text-soft-gray">
                <div>• Use dados e exemplos concretos</div>
                <div>• Mantenha a impessoalidade</div>
                <div>• Conecte ideias com conectivos</div>
                <div>• Conclua com proposta viável</div>
                <div>• Revise gramática e coesão</div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
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
                <div className="font-bold text-dark-blue">{formatTime(90 * 60 - timeLeft)}</div>
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