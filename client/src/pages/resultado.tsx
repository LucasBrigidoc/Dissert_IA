import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/liquid-glass-card';
import { ArrowLeft, CheckCircle, AlertCircle, Target, TrendingUp, Clock, Save, Grid } from 'lucide-react';
import { useLocation } from 'wouter';

export function Resultado() {
  const [, setLocation] = useLocation();

  const handleSaveAndBackToSimulator = () => {
    // Save the essay results to localStorage or database
    const essayResult = {
      date: new Date().toISOString(),
      grade: essayAnalysis.grade,
      maxGrade: essayAnalysis.maxGrade,
      competencies: essayAnalysis.competencies,
      timeAnalysis: timeAnalysis,
      strengths: essayAnalysis.strengths,
      improvements: essayAnalysis.improvements
    };

    // Save to localStorage (in a real app, this would be saved to a database)
    const savedResults = JSON.parse(localStorage.getItem('dissertai-results') || '[]');
    savedResults.push(essayResult);
    localStorage.setItem('dissertai-results', JSON.stringify(savedResults));

    // Navigate to simulator page to start new simulation
    setLocation('/simulador');
  };

  const handleBackToFeatures = () => {
    setLocation('/functionalities');
  };

  // Mock essay analysis data - in a real app this would come from an AI analysis service
  const essayAnalysis = {
    grade: 8.5,
    maxGrade: 10,
    competencies: [
      {
        name: "Domínio da escrita formal",
        score: 9.0,
        feedback: "Excelente uso da norma culta da língua portuguesa com poucos desvios."
      },
      {
        name: "Compreensão da proposta",
        score: 8.5,
        feedback: "Boa compreensão do tema com desenvolvimento adequado dos argumentos."
      },
      {
        name: "Organização das ideias",
        score: 8.0,
        feedback: "Estrutura dissertativo-argumentativa bem organizada com progressão textual clara."
      },
      {
        name: "Conhecimento dos mecanismos linguísticos",
        score: 8.5,
        feedback: "Uso adequado dos conectivos e elementos coesivos."
      },
      {
        name: "Proposta de intervenção",
        score: 8.0,
        feedback: "Proposta de intervenção presente, mas poderia ser mais detalhada."
      }
    ],
    strengths: [
      "Uso correto da norma culta",
      "Argumentação consistente",
      "Boa estrutura textual",
      "Vocabulário diversificado"
    ],
    improvements: [
      "Detalhar mais a proposta de intervenção",
      "Incluir mais dados estatísticos",
      "Aprofundar os argumentos do segundo parágrafo",
      "Revisar algumas concordâncias verbais"
    ]
  };

  // Mock time data - in a real app this would come from the simulation session
  const timeAnalysis = {
    checkpoints: [
      { name: "Brainstorm", timeSpent: 15 * 60, completed: true }, // 15 minutes
      { name: "Rascunho", timeSpent: 45 * 60, completed: true }, // 45 minutes  
      { name: "Passa a Limpo", timeSpent: 30 * 60, completed: true } // 30 minutes
    ],
    totalTime: 90 * 60 // 90 minutes total
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bright-blue/10 via-white to-dark-blue/10 p-4">
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleSaveAndBackToSimulator}
            className="border-green-500/30 text-green-600 hover:bg-green-50"
            data-testid="button-save-and-new-simulation"
          >
            <Save className="mr-2" size={16} />
            Salvar e Novo Simulado
          </Button>
          
          <Button 
            onClick={handleBackToFeatures}
            className="bg-bright-blue hover:bg-bright-blue/90 text-white"
            data-testid="button-back-to-features"
          >
            <Grid className="mr-2" size={16} />
            Ver Todas as Funcionalidades
          </Button>
        </div>
      </div>

      {/* Main Results */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Overall Grade */}
        <LiquidGlassCard className="bg-gradient-to-br from-green-50/80 to-blue-50/80 border-green-200/50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="text-white" size={16} />
              </div>
              <h1 className="text-2xl font-bold text-dark-blue">Resultado da Redação</h1>
            </div>
            
            <div className="space-y-2">
              <div className="text-6xl font-bold text-green-600">
                {essayAnalysis.grade}
              </div>
              <div className="text-lg text-gray-600">
                de {essayAnalysis.maxGrade} pontos
              </div>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {essayAnalysis.grade >= 8 ? 'Excelente' : essayAnalysis.grade >= 6 ? 'Bom' : 'Precisa melhorar'}
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Time Summary */}
        <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
              <Clock className="text-white" size={12} />
            </div>
            <h2 className="text-xl font-bold text-dark-blue">Resumo de Tempos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {timeAnalysis.checkpoints.map((checkpoint, index) => (
              <div key={index} className="text-center p-4 bg-white/50 rounded-lg border">
                <div className="text-2xl font-bold text-bright-blue mb-1">
                  {formatTime(checkpoint.timeSpent)}
                </div>
                <div className="text-sm font-medium text-dark-blue">{checkpoint.name}</div>
              </div>
            ))}
            
            <div className="text-center p-4 bg-bright-blue/10 rounded-lg border border-bright-blue/30">
              <div className="text-2xl font-bold text-dark-blue mb-1">
                {formatTime(timeAnalysis.totalTime)}
              </div>
              <div className="text-sm font-medium text-dark-blue">Tempo Total</div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Competencies Analysis */}
        <LiquidGlassCard className="bg-gradient-to-br from-white/80 to-bright-blue/5 border-bright-blue/20">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <TrendingUp className="text-white" size={12} />
              </div>
              <h2 className="text-xl font-bold text-dark-blue">Análise por Competências</h2>
            </div>
            
            <div className="grid gap-4">
              {essayAnalysis.competencies.map((competency, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-dark-blue">{competency.name}</h3>
                    <div className="text-lg font-bold text-bright-blue">
                      {competency.score.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{competency.feedback}</p>
                  
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-bright-blue to-green-500 h-2 rounded-full"
                      style={{ width: `${(competency.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <LiquidGlassCard className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/50">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={12} />
                </div>
                <h3 className="text-lg font-bold text-green-800">Pontos Fortes</h3>
              </div>
              
              <ul className="space-y-2">
                {essayAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-green-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </LiquidGlassCard>

          {/* Improvements */}
          <LiquidGlassCard className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 border-orange-200/50">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-white" size={12} />
                </div>
                <h3 className="text-lg font-bold text-orange-800">Pontos a Melhorar</h3>
              </div>
              
              <ul className="space-y-2">
                {essayAnalysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-orange-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={handleSaveAndBackToSimulator}
            className="border-green-500/30 text-green-600 hover:bg-green-50"
            data-testid="button-save-and-new-simulation"
          >
            <Save className="mr-2" size={16} />
            Salvar e Novo Simulado
          </Button>
          
          <Button 
            onClick={handleBackToFeatures}
            className="bg-bright-blue hover:bg-bright-blue/90 text-white"
            data-testid="button-back-to-features"
          >
            <Grid className="mr-2" size={16} />
            Ver Todas as Funcionalidades
          </Button>
        </div>
      </div>
    </div>
  );
}