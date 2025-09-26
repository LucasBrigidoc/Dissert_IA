import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Zap, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIUsageStats {
  currentUsageCentavos: number;
  limitCentavos: number;
  remainingCentavos: number;
  usagePercentage: number;
  remainingPercentage: number;
  operationCount: number;
  operationBreakdown: Record<string, number>;
  costBreakdown: Record<string, number>;
  weekStart: Date;
  weekEnd: Date;
  daysUntilReset: number;
  formattedUsage: {
    currentBRL: string;
    limitBRL: string;
    remainingBRL: string;
  };
}

interface AIUsageProgressProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
  variant?: "default" | "minimal" | "detailed" | "header" | "inline";
}

// Criar uma função global para refresh das estatísticas de uso
let refreshUsageStats: (() => void) | null = null;

export function refreshAIUsageStats() {
  if (refreshUsageStats) {
    refreshUsageStats();
  }
}

export function AIUsageProgress({ 
  className, 
  showDetails = true, 
  compact = false, 
  variant = "default" 
}: AIUsageProgressProps) {
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch usage stats
  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/weekly-usage/stats", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch usage stats");
      }

      const data = await response.json();
      setUsageStats(data.stats);
      setError(null);
    } catch (err) {
      console.error("Error fetching usage stats:", err);
      setError("Erro ao carregar estatísticas de uso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Atribuir a função de refresh para acesso global
    refreshUsageStats = fetchUsageStats;
    
    fetchUsageStats();
    
    // Refresh stats every 30 seconds when on visible page
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUsageStats();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      // Limpar a referência global quando o componente é desmontado
      if (refreshUsageStats === fetchUsageStats) {
        refreshUsageStats = null;
      }
    };
  }, []);

  // Determine progress bar color based on usage
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    if (percentage < 95) return "bg-orange-500";
    return "bg-red-500";
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage < 50) return "default";
    if (percentage < 80) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-6 bg-gray-200 rounded-md" />
      </div>
    );
  }

  if (error || !usageStats) {
    return (
      <div className={cn("text-xs text-gray-500", className)}>
        <Zap className="inline w-3 h-3 mr-1" />
        IA indisponível
      </div>
    );
  }

  // Format operation names for display
  const getOperationName = (operation: string): string => {
    const names: Record<string, string> = {
      "repertoire_search": "Buscar Repertórios",
      "repertoire_generate": "Gerar Repertórios",
      "proposal_search": "Buscar Propostas",
      "proposal_generate": "Gerar Propostas",
      "essay_generation": "Gerar Redações",
      "structure_analysis": "Análise de Estruturas",
      "ai_chat": "Chat com IA",
      "text_correction": "Correção de Textos",
      "text_modification": "Modificação de Textos",
    };
    return names[operation] || operation;
  };

  // Header variant - Padronizado para integração com cabeçalho das páginas (altura reduzida)
  if (variant === "header") {
    return (
      <div className={cn(
        "sticky top-0 z-40 w-full border-b border-white/20 backdrop-blur-md bg-white/80 shadow-sm",
        "supports-[backdrop-filter]:bg-white/60",
        className
      )}>
        <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center sm:justify-between">
                  {/* Mobile: Centered layout */}
                  <div className="flex items-center space-x-2 sm:hidden">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-bright-blue" />
                      <span className="text-xs font-medium text-gray-700">IA</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-300", getProgressColor(usageStats.usagePercentage))}
                          style={{ width: `${Math.min(100, usageStats.usagePercentage)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-800">
                        {usageStats.usagePercentage.toFixed(0)}%
                      </span>
                      {/* Só mostra dias restantes quando uso está 100% */}
                      {usageStats.usagePercentage >= 100 && (
                        <span className="text-xs text-gray-500">
                          {usageStats.daysUntilReset}d restantes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop: Full layout */}
                  <div className="hidden sm:flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3.5 h-3.5 text-bright-blue" />
                      <span className="text-sm font-medium text-gray-700">Uso de IA</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-300", getProgressColor(usageStats.usagePercentage))}
                            style={{ width: `${Math.min(100, usageStats.usagePercentage)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 min-w-[3rem]">
                          {usageStats.usagePercentage.toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Só mostra dias restantes quando uso está 100% */}
                      {usageStats.usagePercentage >= 100 && (
                        <div className="text-xs text-gray-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{usageStats.daysUntilReset}d restantes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <div className="font-medium">Limite de IA</div>
                  <div>{usageStats.usagePercentage.toFixed(1)}% do limite usado</div>
                  <div className="text-gray-500">
                    Reset em {usageStats.daysUntilReset} dias
                  </div>
                  <div className="text-gray-500">
                    {usageStats.operationCount} operações esta semana
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Inline variant - Apenas o conteúdo para integração em outros componentes
  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center justify-center sm:justify-between", className)}>
              {/* Mobile: Centered layout */}
              <div className="flex items-center space-x-2 sm:hidden">
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-bright-blue" />
                  <span className="text-xs font-medium text-gray-700">IA</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", getProgressColor(usageStats.usagePercentage))}
                      style={{ width: `${Math.min(100, usageStats.usagePercentage)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">
                    {usageStats.usagePercentage.toFixed(0)}%
                  </span>
                  {/* Só mostra dias restantes quando uso está 100% */}
                  {usageStats.usagePercentage >= 100 && (
                    <span className="text-xs text-gray-500">
                      {usageStats.daysUntilReset}d restantes
                    </span>
                  )}
                </div>
              </div>

              {/* Desktop: Full layout */}
              <div className="hidden sm:flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-bright-blue" />
                  <span className="text-sm font-medium text-gray-700">Uso de IA</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300", getProgressColor(usageStats.usagePercentage))}
                        style={{ width: `${Math.min(100, usageStats.usagePercentage)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 min-w-[3rem]">
                      {usageStats.usagePercentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  {/* Só mostra dias restantes quando uso está 100% */}
                  {usageStats.usagePercentage >= 100 && (
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{usageStats.daysUntilReset}d restantes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="text-xs space-y-1">
              <div className="font-medium">Limite de IA</div>
              <div>{usageStats.usagePercentage.toFixed(1)}% do limite usado</div>
              <div className="text-gray-500">
                Reset em {usageStats.daysUntilReset} dias
              </div>
              <div className="text-gray-500">
                {usageStats.operationCount} operações esta semana
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Minimal variant for mobile or small spaces
  if (variant === "minimal" || compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center space-x-2 text-xs", className)}>
              <Zap className="w-3 h-3 text-bright-blue" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-300", getProgressColor(usageStats.usagePercentage))}
                      style={{ width: `${Math.min(100, usageStats.usagePercentage)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {usageStats.usagePercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="text-xs space-y-1">
              <div className="font-medium">Uso de IA</div>
              <div>{usageStats.usagePercentage.toFixed(0)}% do limite usado</div>
              <div className="text-gray-500">
                {usageStats.daysUntilReset} dias até renovar
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant with progress bar - now shows only percentage
  if (variant === "default") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-bright-blue" />
            <span className="font-medium text-gray-700">Uso de IA</span>
            {showDetails && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="text-xs space-y-1">
                      <div>Limite semanal de IA</div>
                      <div>Funcionalidades incluídas: busca, geração, chat, correção</div>
                      <div>Reset toda segunda-feira às 00:00</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="text-right">
            <div className="font-medium">
              {usageStats.usagePercentage.toFixed(0)}%
            </div>
            {showDetails && (
              <div className="text-gray-500 flex items-center space-x-1">
                <Calendar className="w-2.5 h-2.5" />
                <span>{usageStats.daysUntilReset}d até renovar</span>
              </div>
            )}
          </div>
        </div>
        
        <Progress 
          value={usageStats.usagePercentage} 
          className="h-2"
        />
        
        {showDetails && usageStats.operationCount > 0 && (
          <div className="text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>{usageStats.operationCount} operações esta semana</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant with operation breakdown
  return (
    <Card className={cn("p-3 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Uso de IA</h3>
            <p className="text-xs text-gray-500">
              {usageStats.usagePercentage.toFixed(0)}% do limite usado
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-bright-blue">
            {usageStats.usagePercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <Calendar className="w-2.5 h-2.5" />
            <span>{usageStats.daysUntilReset} dias</span>
          </div>
        </div>
      </div>

      <Progress 
        value={usageStats.usagePercentage} 
        className="h-3"
      />

      {usageStats.operationCount > 0 && Object.keys(usageStats.operationBreakdown).length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">Operações desta semana</div>
          <div className="space-y-1">
            {Object.entries(usageStats.operationBreakdown)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([operation, count]) => {
                const cost = usageStats.costBreakdown[operation] || 0;
                const percentage = ((cost / usageStats.currentUsageCentavos) * 100) || 0;
                
                return (
                  <div key={operation} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{getOperationName(operation)}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{count}x</span>
                      <span className="text-gray-400">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <span className="text-gray-500">Disponível</span>
        <span className="font-medium text-green-600">
          {usageStats.remainingPercentage.toFixed(0)}%
        </span>
      </div>
    </Card>
  );
}