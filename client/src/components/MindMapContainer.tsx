import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain,
  Target,
  BookOpen,
  ArrowRight,
  Users,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Star,
  Calendar,
  Quote
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
  category?: string;
  popularity?: string;
}

interface EssayContext {
  tema?: string;
  tese?: string;
  estrutura?: EssayStructure;
  repertorios?: Repertoire[];
  conectivos?: string[];
  etapaAtual?: 'tema' | 'tese' | 'argumentacao' | 'conclusao' | 'revisao';
}

interface MindMapNode {
  id: string;
  label: string;
  type: 'main' | 'section' | 'subsection' | 'detail';
  status: 'completed' | 'current' | 'pending';
  children?: MindMapNode[];
  data?: any;
}

interface MindMapContainerProps {
  essayContext: EssayContext;
  className?: string;
  onNodeSelect?: (nodeId: string, data: any) => void;
}

export function MindMapContainer({ essayContext, className = "", onNodeSelect }: MindMapContainerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['tema', 'estrutura', 'repertorios']));
  
  const { tema, tese, estrutura = {}, repertorios = [], conectivos = [], etapaAtual = 'tema' } = essayContext;

  // Organizar repertórios por categoria
  const repertoriosPorCategoria = useMemo(() => {
    const categorias: Record<string, Repertoire[]> = {};
    repertorios.forEach(rep => {
      const categoria = rep.category || rep.type || 'Outros';
      if (!categorias[categoria]) {
        categorias[categoria] = [];
      }
      categorias[categoria].push(rep);
    });
    return categorias;
  }, [repertorios]);

  // Organizar conectivos por categoria
  const conectivosPorCategoria = useMemo(() => {
    const categorias: Record<string, string[]> = {
      'Adição': ['além disso', 'também', 'ainda', 'bem como', 'igualmente'],
      'Contraste': ['porém', 'contudo', 'entretanto', 'no entanto', 'todavia'],
      'Consequência': ['portanto', 'assim', 'logo', 'consequentemente', 'por isso'],
      'Exemplificação': ['por exemplo', 'como', 'tal como', 'a saber', 'isto é'],
      'Conclusão': ['em suma', 'enfim', 'em síntese', 'finalmente', 'por fim']
    };
    
    // Adicionar conectivos do contexto nas categorias apropriadas
    conectivos.forEach(conectivo => {
      let categorizado = false;
      Object.entries(categorias).forEach(([cat, lista]) => {
        if (lista.some(c => c.toLowerCase().includes(conectivo.toLowerCase()) || 
                           conectivo.toLowerCase().includes(c.toLowerCase()))) {
          if (!lista.includes(conectivo)) {
            lista.push(conectivo);
          }
          categorizado = true;
        }
      });
      
      if (!categorizado) {
        if (!categorias['Outros']) categorias['Outros'] = [];
        categorias['Outros'].push(conectivo);
      }
    });
    
    return categorias;
  }, [conectivos]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'current':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-400 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getNodeStatus = (stage: string) => {
    const stages = ['tema', 'tese', 'argumentacao', 'conclusao', 'revisao'];
    const currentIndex = stages.indexOf(etapaAtual);
    const stageIndex = stages.indexOf(stage);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  const handleNodeClick = (nodeId: string, data?: any) => {
    onNodeSelect?.(nodeId, data);
  };

  return (
    <Card className={`h-full flex flex-col bg-white/90 backdrop-blur-sm border-white/20 shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-dark-blue">
          <Brain size={20} />
          <span>Mapa Mental da Redação</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Visualização hierárquica da estrutura e elementos da sua redação
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            
            {/* Tema Principal */}
            <div className="space-y-2">
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(getNodeStatus('tema'))}`}
                onClick={() => handleNodeClick('tema', { tema })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target size={18} />
                    <div>
                      <h3 className="font-semibold text-sm">Tema Central</h3>
                      {tema ? (
                        <p className="text-xs mt-1 opacity-80">{tema}</p>
                      ) : (
                        <p className="text-xs mt-1 italic opacity-60">Ainda não definido</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Principal
                  </Badge>
                </div>
              </div>

              {/* Tese */}
              {tema && (
                <div className="ml-6 space-y-2">
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getStatusColor(getNodeStatus('tese'))}`}
                    onClick={() => handleNodeClick('tese', { tese })}
                  >
                    <div className="flex items-center space-x-2">
                      <Lightbulb size={16} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">Tese/Posicionamento</h4>
                        {tese ? (
                          <p className="text-xs mt-1 opacity-80 line-clamp-2">{tese}</p>
                        ) : (
                          <p className="text-xs mt-1 italic opacity-60">A ser definida</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Estrutura da Redação */}
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => toggleNode('estrutura')}
              >
                {expandedNodes.has('estrutura') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <FileText size={16} className="text-purple-600" />
                <span className="font-semibold text-sm text-dark-blue">Estrutura da Redação</span>
                <Badge variant="secondary" className="text-xs">
                  {Object.values(estrutura).filter(Boolean).length}/4 seções
                </Badge>
              </div>

              {expandedNodes.has('estrutura') && (
                <div className="ml-6 space-y-2">
                  {/* Introdução */}
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      estrutura.introducao ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => handleNodeClick('introducao', { introducao: estrutura.introducao })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Introdução</span>
                      </div>
                      {estrutura.introducao && <Badge variant="outline" className="text-xs">✓</Badge>}
                    </div>
                    {estrutura.introducao && (
                      <p className="text-xs mt-2 text-gray-600 line-clamp-2">{estrutura.introducao}</p>
                    )}
                  </div>

                  {/* Desenvolvimento 1 */}
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      estrutura.desenvolvimento1 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => handleNodeClick('desenvolvimento1', { desenvolvimento1: estrutura.desenvolvimento1 })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Desenvolvimento I</span>
                      </div>
                      {estrutura.desenvolvimento1 && <Badge variant="outline" className="text-xs">✓</Badge>}
                    </div>
                    {estrutura.desenvolvimento1 && (
                      <p className="text-xs mt-2 text-gray-600 line-clamp-2">{estrutura.desenvolvimento1}</p>
                    )}
                  </div>

                  {/* Desenvolvimento 2 */}
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      estrutura.desenvolvimento2 ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => handleNodeClick('desenvolvimento2', { desenvolvimento2: estrutura.desenvolvimento2 })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Desenvolvimento II</span>
                      </div>
                      {estrutura.desenvolvimento2 && <Badge variant="outline" className="text-xs">✓</Badge>}
                    </div>
                    {estrutura.desenvolvimento2 && (
                      <p className="text-xs mt-2 text-gray-600 line-clamp-2">{estrutura.desenvolvimento2}</p>
                    )}
                  </div>

                  {/* Conclusão */}
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      estrutura.conclusao ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => handleNodeClick('conclusao', { conclusao: estrutura.conclusao })}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Conclusão</span>
                      </div>
                      {estrutura.conclusao && <Badge variant="outline" className="text-xs">✓</Badge>}
                    </div>
                    {estrutura.conclusao && (
                      <p className="text-xs mt-2 text-gray-600 line-clamp-2">{estrutura.conclusao}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Repertórios */}
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => toggleNode('repertorios')}
              >
                {expandedNodes.has('repertorios') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <BookOpen size={16} className="text-yellow-600" />
                <span className="font-semibold text-sm text-dark-blue">Repertórios Culturais</span>
                <Badge variant="secondary" className="text-xs">
                  {repertorios.length} itens
                </Badge>
              </div>

              {expandedNodes.has('repertorios') && (
                <div className="ml-6 space-y-3">
                  {Object.entries(repertoriosPorCategoria).map(([categoria, reps]) => (
                    <div key={categoria} className="space-y-2">
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        onClick={() => toggleNode(`categoria-${categoria}`)}
                      >
                        {expandedNodes.has(`categoria-${categoria}`) ? 
                          <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="text-sm font-medium text-gray-700">{categoria}</span>
                        <Badge variant="outline" className="text-xs">
                          {reps.length}
                        </Badge>
                      </div>

                      {expandedNodes.has(`categoria-${categoria}`) && (
                        <div className="ml-4 space-y-2">
                          {reps.map((rep, index) => (
                            <div 
                              key={index}
                              className="p-2 bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:shadow-sm"
                              onClick={() => handleNodeClick(`repertorio-${index}`, rep)}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <h5 className="text-xs font-medium text-dark-blue">{rep.title}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {rep.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{rep.description}</p>
                              
                              {(rep.author || rep.year) && (
                                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
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
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {repertorios.length === 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
                      <p className="text-sm text-gray-500 italic">
                        Nenhum repertório adicionado ainda
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleNodeClick('add-repertorio', {})}
                      >
                        <Plus size={14} />
                        Adicionar Repertório
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Conectivos */}
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => toggleNode('conectivos')}
              >
                {expandedNodes.has('conectivos') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <ArrowRight size={16} className="text-green-600" />
                <span className="font-semibold text-sm text-dark-blue">Conectivos e Coesão</span>
                <Badge variant="secondary" className="text-xs">
                  {conectivos.length} sugeridos
                </Badge>
              </div>

              {expandedNodes.has('conectivos') && (
                <div className="ml-6 space-y-3">
                  {Object.entries(conectivosPorCategoria).map(([categoria, lista]) => (
                    lista.length > 0 && (
                      <div key={categoria} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">{categoria}</span>
                          <Badge variant="outline" className="text-xs">
                            {lista.length}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {lista.map((conectivo, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="text-xs bg-green-100 text-green-700 border-green-300 cursor-pointer hover:bg-green-200"
                              onClick={() => handleNodeClick(`conectivo-${index}`, { conectivo, categoria })}
                            >
                              {conectivo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Dicas pedagógicas */}
            <div className="bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 border border-bright-blue/20 rounded-lg p-3 mt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb size={14} className="text-bright-blue" />
                <span className="text-sm font-semibold text-bright-blue">Dica do Mapa Mental</span>
              </div>
              <p className="text-xs text-dark-blue">
                💡 Clique nos elementos para interagir com eles no chat! Use o mapa para navegar pela estrutura da sua redação.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}