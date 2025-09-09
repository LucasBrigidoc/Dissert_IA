import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Target, 
  Brain, 
  CheckCircle2, 
  Circle, 
  BookOpen,
  Quote,
  ArrowRight,
  Lightbulb,
  Users,
  Calendar
} from "lucide-react";

interface EssayStructure {
  introducao?: string;
  desenvolvimento1?: string;
  desenvolvimento2?: string;
  conclusao?: string;
}

interface Repertoire {
  title: string;
  description: string;
  type: string;
  year?: string;
  author?: string;
}

interface EssayContext {
  tema?: string;
  tese?: string;
  estrutura?: EssayStructure;
  repertorios?: Repertoire[];
  conectivos?: string[];
  etapaAtual?: 'tema' | 'tese' | 'argumentacao' | 'conclusao' | 'revisao';
}

interface EssayPreviewProps {
  essayContext: EssayContext;
  progressPercent?: number;
  className?: string;
}

export function EssayPreview({ essayContext, progressPercent = 0, className = "" }: EssayPreviewProps) {
  const { tema, tese, estrutura = {}, repertorios = [], conectivos = [], etapaAtual = 'tema' } = essayContext;

  const getStageStatus = (stage: string) => {
    const stages = ['tema', 'tese', 'argumentacao', 'conclusao', 'revisao'];
    const currentIndex = stages.indexOf(etapaAtual);
    const stageIndex = stages.indexOf(stage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'current':
        return <Circle size={16} className="text-bright-blue animate-pulse" />;
      case 'pending':
        return <Circle size={16} className="text-gray-300" />;
      default:
        return <Circle size={16} className="text-gray-300" />;
    }
  };

  const formatText = (text: string) => {
    if (!text) return '';
    
    // Limitar texto para preview
    const words = text.split(' ');
    if (words.length > 50) {
      return words.slice(0, 50).join(' ') + '...';
    }
    return text;
  };

  return (
    <Card className={`h-full flex flex-col bg-white/90 backdrop-blur-sm border-white/20 shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-dark-blue">
            <FileText size={20} />
            <span>Preview da Redação</span>
          </CardTitle>
          <Badge variant="outline" className="text-bright-blue border-bright-blue/30">
            {progressPercent}% concluído
          </Badge>
        </div>
        
        {/* Barra de progresso geral */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Planejamento</span>
            <span>Desenvolvimento</span>
            <span>Conclusão</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {/* Tema da redação */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              {getStatusIcon(getStageStatus('tema'))}
              <div className="flex-1">
                <h3 className="font-semibold text-dark-blue text-sm mb-1">Tema da Redação</h3>
                {tema ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-dark-blue font-medium">{tema}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-500 italic">Tema ainda não definido</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Tese */}
            <div className="flex items-start space-x-3">
              {getStatusIcon(getStageStatus('tese'))}
              <div className="flex-1">
                <h3 className="font-semibold text-dark-blue text-sm mb-1 flex items-center space-x-2">
                  <Target size={14} />
                  <span>Tese (Posicionamento)</span>
                </h3>
                {tese ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-dark-blue">{formatText(tese)}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-500 italic">Tese ainda não definida</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Estrutura da redação */}
            <div className="flex items-start space-x-3">
              {getStatusIcon(getStageStatus('argumentacao'))}
              <div className="flex-1">
                <h3 className="font-semibold text-dark-blue text-sm mb-3 flex items-center space-x-2">
                  <Brain size={14} />
                  <span>Estrutura da Redação</span>
                </h3>
                
                <div className="space-y-3">
                  {/* Introdução */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-blue-600 uppercase">Introdução</span>
                    </div>
                    {estrutura.introducao ? (
                      <p className="text-sm text-gray-700">{formatText(estrutura.introducao)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">A ser desenvolvida...</p>
                    )}
                  </div>

                  {/* Desenvolvimento 1 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-green-600 uppercase">Desenvolvimento I</span>
                    </div>
                    {estrutura.desenvolvimento1 ? (
                      <p className="text-sm text-gray-700">{formatText(estrutura.desenvolvimento1)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Primeiro argumento a ser desenvolvido...</p>
                    )}
                  </div>

                  {/* Desenvolvimento 2 */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-orange-600 uppercase">Desenvolvimento II</span>
                    </div>
                    {estrutura.desenvolvimento2 ? (
                      <p className="text-sm text-gray-700">{formatText(estrutura.desenvolvimento2)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Segundo argumento a ser desenvolvido...</p>
                    )}
                  </div>

                  {/* Conclusão */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-purple-600 uppercase">Conclusão</span>
                    </div>
                    {estrutura.conclusao ? (
                      <p className="text-sm text-gray-700">{formatText(estrutura.conclusao)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Proposta de intervenção a ser criada...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Repertórios sugeridos */}
            {repertorios.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-dark-blue text-sm flex items-center space-x-2">
                    <BookOpen size={14} />
                    <span>Repertórios Sugeridos</span>
                    <Badge variant="secondary" className="text-xs">
                      {repertorios.length}
                    </Badge>
                  </h3>
                  
                  <div className="space-y-2">
                    {repertorios.slice(0, 3).map((rep, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-dark-blue">{rep.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rep.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{formatText(rep.description)}</p>
                        
                        {(rep.author || rep.year) && (
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            {rep.author && (
                              <div className="flex items-center space-x-1">
                                <Users size={10} />
                                <span>{rep.author}</span>
                              </div>
                            )}
                            {rep.year && (
                              <div className="flex items-center space-x-1">
                                <Calendar size={10} />
                                <span>{rep.year}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {repertorios.length > 3 && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          +{repertorios.length - 3} repertórios adicionais
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Conectivos sugeridos */}
            {conectivos.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-dark-blue text-sm flex items-center space-x-2">
                    <ArrowRight size={14} />
                    <span>Conectivos para Usar</span>
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {conectivos.slice(0, 8).map((conectivo, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-green-100 text-green-700 border-green-300"
                      >
                        {conectivo}
                      </Badge>
                    ))}
                    
                    {conectivos.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{conectivos.length - 8}
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Dicas pedagógicas */}
            <div className="bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 border border-bright-blue/20 rounded-lg p-3 mt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb size={14} className="text-bright-blue" />
                <span className="text-sm font-semibold text-bright-blue">Dica Pedagógica</span>
              </div>
              <p className="text-xs text-dark-blue">
                {etapaAtual === 'tema' && 'Foque em compreender bem o tema antes de definir sua posição. Analise as palavras-chave!'}
                {etapaAtual === 'tese' && 'Sua tese deve ser clara e defendível. Pense nos argumentos que irá usar.'}
                {etapaAtual === 'argumentacao' && 'Use repertórios relevantes e conectivos para dar fluência ao texto.'}
                {etapaAtual === 'conclusao' && 'Retome sua tese e apresente uma proposta de intervenção viável.'}
                {etapaAtual === 'revisao' && 'Revise a coesão, coerência e se seguiu todos os critérios da redação.'}
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}