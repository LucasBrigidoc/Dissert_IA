import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Sliders, Type, Zap, Eye, Download, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function Estilo() {
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
                <div className="w-10 h-10 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <Sliders className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Controlador de Estilo</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Refine e ajuste seu estilo de escrita
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Text Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Type className="text-white" size={14} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Texto para Análise</h3>
              </div>
              
              <div className="space-y-4">
                <Textarea 
                  placeholder="Cole aqui o texto que você deseja analisar e melhorar..."
                  className="border-bright-blue/20 focus:border-bright-blue h-40"
                  data-testid="textarea-input-text"
                />
                
                <div className="flex space-x-4">
                  <Button className="bg-gradient-to-r from-bright-blue to-dark-blue hover:from-dark-blue hover:to-bright-blue" data-testid="button-analyze">
                    <Zap className="mr-2" size={16} />
                    Analisar Texto
                  </Button>
                  
                  <Button variant="outline" className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10" data-testid="button-clear">
                    <RefreshCw className="mr-2" size={16} />
                    Limpar
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Results */}
            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-soft-gray/5 border-dark-blue/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <Eye className="text-white" size={16} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Análise de Estilo</h3>
              </div>
              
              <div className="space-y-6">
                {/* Style Metrics */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-dark-blue">Formalidade</span>
                      <span className="text-sm text-bright-blue font-semibold">Alto</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-bright-blue to-dark-blue h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 rounded-lg border border-dark-blue/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-dark-blue">Clareza</span>
                      <span className="text-sm text-dark-blue font-semibold">Médio</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-dark-blue to-soft-gray h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 rounded-lg border border-soft-gray/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-dark-blue">Coesão</span>
                      <span className="text-sm text-dark-blue font-semibold">Bom</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-soft-gray to-bright-blue h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-bright-blue/10 to-soft-gray/10 rounded-lg border border-bright-blue/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-dark-blue">Originalidade</span>
                      <span className="text-sm text-bright-blue font-semibold">Alto</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-bright-blue to-soft-gray h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="p-4 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 rounded-lg border border-bright-blue/10">
                  <h4 className="font-semibold text-dark-blue mb-3">Sugestões de Melhoria</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-bright-blue rounded-full mt-2"></div>
                      <div className="text-sm text-soft-gray">Considere variar o tamanho das frases para criar mais ritmo no texto</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-dark-blue rounded-full mt-2"></div>
                      <div className="text-sm text-soft-gray">Use mais conectivos para melhorar a fluidez entre os parágrafos</div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-soft-gray rounded-full mt-2"></div>
                      <div className="text-sm text-soft-gray">Substitua algumas palavras repetitivas por sinônimos mais precisos</div>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Style Settings */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Sliders className="text-white" size={16} />
                </div>
                <h4 className="font-semibold text-dark-blue">Configurações</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Estilo Desejado</label>
                  <Select data-testid="select-style">
                    <SelectTrigger className="border-bright-blue/20">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Acadêmico</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="persuasive">Persuasivo</SelectItem>
                      <SelectItem value="creative">Criativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Nível de Formalidade</label>
                  <Slider
                    defaultValue={[7]}
                    max={10}
                    step={1}
                    className="py-2"
                    data-testid="slider-formality"
                  />
                  <div className="flex justify-between text-xs text-soft-gray mt-1">
                    <span>Informal</span>
                    <span>Formal</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Complexidade</label>
                  <Slider
                    defaultValue={[6]}
                    max={10}
                    step={1}
                    className="py-2"
                    data-testid="slider-complexity"
                  />
                  <div className="flex justify-between text-xs text-soft-gray mt-1">
                    <span>Simples</span>
                    <span>Complexo</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">Criatividade</label>
                  <Slider
                    defaultValue={[5]}
                    max={10}
                    step={1}
                    className="py-2"
                    data-testid="slider-creativity"
                  />
                  <div className="flex justify-between text-xs text-soft-gray mt-1">
                    <span>Conservador</span>
                    <span>Criativo</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Quick Fixes */}
            <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
              <h4 className="font-semibold text-dark-blue mb-4">Correções Rápidas</h4>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-fix-grammar"
                >
                  Corrigir Gramática
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-dark-blue/30 hover:bg-dark-blue/10"
                  data-testid="button-improve-flow"
                >
                  Melhorar Fluidez
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-soft-gray/30 hover:bg-soft-gray/10"
                  data-testid="button-enhance-vocabulary"
                >
                  Enriquecer Vocabulário
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-optimize-length"
                >
                  Otimizar Tamanho
                </Button>
              </div>
            </LiquidGlassCard>

            {/* Export Options */}
            <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-bright-blue/5 border-dark-blue/20">
              <h4 className="font-semibold text-dark-blue mb-4">Exportar Análise</h4>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-bright-blue/30 hover:bg-bright-blue/10"
                  data-testid="button-export-pdf"
                >
                  <Download className="mr-2" size={16} />
                  Baixar PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-dark-blue/30 hover:bg-dark-blue/10"
                  data-testid="button-export-word"
                >
                  <Download className="mr-2" size={16} />
                  Baixar Word
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-left justify-start border-soft-gray/30 hover:bg-soft-gray/10"
                  data-testid="button-share-analysis"
                >
                  Compartilhar Análise
                </Button>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}