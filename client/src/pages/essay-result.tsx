import { useState } from "react";
import { ArrowLeft, Download, Copy, Share2, Edit3, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { EssayStructure } from "@shared/schema";

interface EssayResultProps {
  essay: string;
  topic: string;
  structure: EssayStructure;
  instructions?: string;
  onBack: () => void;
  onEdit: () => void;
  onNewEssay: () => void;
}

export function EssayResult({ 
  essay, 
  topic, 
  structure, 
  instructions, 
  onBack, 
  onEdit, 
  onNewEssay 
}: EssayResultProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(essay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Texto copiado!",
        description: "A redação foi copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([essay], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `redacao-${topic.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download iniciado",
      description: "A redação está sendo baixada como arquivo de texto.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Redação: ${topic}`,
          text: essay,
        });
      } catch (error) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const wordCount = essay.split(/\s+/).length;
  const charCount = essay.length;
  const paragraphCount = essay.split('\n\n').filter(p => p.trim()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="mb-4 border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10 hover:border-bright-blue backdrop-blur-sm bg-white/60 transition-all duration-200 shadow-sm" 
            data-testid="button-voltar"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Estrutura Coringa
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue mb-2">
                Redação Gerada
              </h1>
              <p className="text-soft-gray">
                Sua redação foi criada com sucesso usando o modelo "{structure.name}"
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Concluída
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informações da Redação */}
          <LiquidGlassCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-dark-blue mb-3">
                  Detalhes da Redação
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Tema:</span>
                    <span className="text-dark-blue font-medium">{topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Estrutura:</span>
                    <span className="text-dark-blue font-medium">{structure.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Palavras:</span>
                    <span className="text-dark-blue font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Caracteres:</span>
                    <span className="text-dark-blue font-medium">{charCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soft-gray">Parágrafos:</span>
                    <span className="text-dark-blue font-medium">{paragraphCount}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-dark-blue mb-3">
                  Ações
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="border-bright-blue text-bright-blue hover:bg-bright-blue/10"
                    data-testid="button-copiar"
                  >
                    {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    data-testid="button-download"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    data-testid="button-compartilhar"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onEdit}
                    data-testid="button-editar"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
                
                <Button
                  onClick={onNewEssay}
                  className="bg-bright-blue hover:bg-blue-600 w-full mt-3"
                  data-testid="button-nova-redacao"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Nova Redação
                </Button>
              </div>
            </div>

            {instructions && (
              <div className="mt-6 pt-6 border-t border-bright-blue/20">
                <h4 className="font-medium text-dark-blue mb-2">Instruções Aplicadas:</h4>
                <p className="text-sm text-soft-gray">{instructions}</p>
              </div>
            )}
          </LiquidGlassCard>

          {/* Redação */}
          <LiquidGlassCard>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-bright-blue" />
              <h3 className="text-xl font-semibold text-dark-blue">
                {topic}
              </h3>
            </div>
            
            <div className="bg-white rounded-lg border border-bright-blue/20 p-8 shadow-sm">
              <div className="prose max-w-none">
                {essay.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    const title = paragraph.slice(2, -2);
                    return (
                      <h3 key={index} className="text-dark-blue font-bold text-xl mt-6 mb-4 first:mt-0">
                        {title}
                      </h3>
                    );
                  }
                  if (paragraph.trim() === '') {
                    return <div key={index} className="h-4" />;
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={index} className="my-6 border-bright-blue/20" />;
                  }
                  return (
                    <p key={index} className="text-gray-800 leading-relaxed mb-4 text-justify">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </LiquidGlassCard>

          {/* Estatísticas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-dark-blue">Análise Textual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-soft-gray">Média de palavras/parágrafo:</span>
                    <span className="text-sm font-medium">{Math.round(wordCount / paragraphCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-soft-gray">Caracteres sem espaços:</span>
                    <span className="text-sm font-medium">{essay.replace(/\s/g, '').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-dark-blue">Estrutura Utilizada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(structure.sections) && structure.sections.slice(0, 2).map((section, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-dark-blue">{section.title}</span>
                    </div>
                  ))}
                  {Array.isArray(structure.sections) && structure.sections.length > 2 && (
                    <div className="text-xs text-soft-gray">
                      +{structure.sections.length - 2} seções mais
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-dark-blue">Tempo Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-soft-gray">Leitura:</span>
                    <span className="text-sm font-medium">{Math.ceil(wordCount / 200)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-soft-gray">Escrita manual:</span>
                    <span className="text-sm font-medium">{Math.ceil(wordCount / 40)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}