import { useState } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  FileText, 
  Target, 
  BookOpen, 
  Lightbulb, 
  PenTool, 
  Eye, 
  GraduationCap,
  Clock,
  Download
} from "lucide-react";
import { useLocation } from "wouter";
import jsPDF from 'jspdf';

const materialContent = {
  estrutura: {
    title: "Guia de Estrutura Dissertativa",
    category: "Fundamental",
    readTime: "12 min de leitura",
    content: "Manual completo sobre introdução, desenvolvimento e conclusão. Aprenda as técnicas fundamentais da estrutura dissertativa para conquistar a nota máxima."
  },
  conectivos: {
    title: "Conectivos e Coesão Textual",
    category: "Técnico", 
    readTime: "8 min de leitura",
    content: "Lista completa de conectivos por categoria com exemplos práticos para melhorar a fluidez do seu texto e garantir coesão argumentativa."
  },
  repertorio: {
    title: "Como Usar Repertório Cultural",
    category: "Avançado",
    readTime: "15 min de leitura", 
    content: "Estratégias para incorporar referências históricas, filosóficas e culturais de forma natural e produtiva em sua argumentação."
  },
  intervencao: {
    title: "Proposta de Intervenção Eficaz",
    category: "ENEM",
    readTime: "10 min de leitura",
    content: "Guia completo para elaborar propostas viáveis, detalhadas e que respeitem os direitos humanos conforme critérios do ENEM."
  },
  norma: {
    title: "Domínio da Norma Culta", 
    category: "Gramática",
    readTime: "20 min de leitura",
    content: "Principais regras gramaticais, concordância, regência e pontuação para redações nota máxima no ENEM e vestibulares."
  },
  analise: {
    title: "Análise de Redações Nota 1000",
    category: "Exemplos",
    readTime: "25 min de leitura",
    content: "Estudo detalhado de redações que obtiveram nota máxima no ENEM com comentários e técnicas aplicadas pelos candidatos."
  }
};

export default function MaterialComplementarPage() {
  const [, setLocation] = useLocation();
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const openMaterialModal = (materialKey: keyof typeof materialContent) => {
    const material = materialContent[materialKey];
    setSelectedMaterial(material);
    setShowMaterialModal(true);
  };

  const downloadAsPDF = (material: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(material.title, 20, 20);
    doc.setFontSize(12);
    doc.text(`Categoria: ${material.category}`, 20, 35);
    doc.text(`Tempo: ${material.readTime}`, 20, 45);
    doc.text(material.content, 20, 60, { maxWidth: 170 });
    doc.save(`${material.title}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="outline"
                size="sm"
                className="border-soft-gray/30 text-soft-gray hover:border-bright-blue hover:text-bright-blue"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft size={16} className="mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-dark-blue">Material Complementar</h1>
                <p className="text-sm text-soft-gray">Guias educativos para aprimorar sua redação</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-8">
        
        {/* Introduction */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue mb-4">
            Aprimore suas Técnicas de Redação
          </h2>
          <p className="text-soft-gray max-w-3xl mx-auto text-lg">
            Explore nossos guias educativos essenciais para dominar as técnicas de escrita dissertativa e conquistar a nota máxima.
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Estrutura Dissertativa */}
          <div onClick={() => openMaterialModal('estrutura')} className="cursor-pointer">
            <LiquidGlassCard className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50/80 to-green-100/50 border-green-200/50 hover:border-green-300/70">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">Guia de Estrutura Dissertativa</h3>
                  <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                    Manual completo sobre introdução, desenvolvimento e conclusão.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800 text-xs">Fundamental</Badge>
                    <span className="text-xs text-gray-500">12 min</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Conectivos */}
          <div onClick={() => openMaterialModal('conectivos')} className="cursor-pointer">
            <LiquidGlassCard className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50/80 to-blue-100/50 border-blue-200/50 hover:border-blue-300/70">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">Conectivos e Coesão Textual</h3>
                  <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                    Lista completa de conectivos por categoria com exemplos práticos.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">Técnico</Badge>
                    <span className="text-xs text-gray-500">8 min</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Repertório Cultural */}
          <div onClick={() => openMaterialModal('repertorio')} className="cursor-pointer">
            <LiquidGlassCard className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50 hover:border-purple-300/70">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">Como Usar Repertório Cultural</h3>
                  <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                    Estratégias para incorporar referências históricas e culturais.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">Avançado</Badge>
                    <span className="text-xs text-gray-500">15 min</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Proposta de Intervenção */}
          <div onClick={() => openMaterialModal('intervencao')} className="cursor-pointer">
            <LiquidGlassCard className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-orange-50/80 to-orange-100/50 border-orange-200/50 hover:border-orange-300/70">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">Proposta de Intervenção Eficaz</h3>
                  <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                    Guia completo para elaborar propostas viáveis e detalhadas.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800 text-xs">ENEM</Badge>
                    <span className="text-xs text-gray-500">10 min</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Norma Culta */}
          <div onClick={() => openMaterialModal('norma')} className="cursor-pointer">
            <LiquidGlassCard className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 border-indigo-200/50 hover:border-indigo-300/70">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <PenTool className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">Domínio da Norma Culta</h3>
                  <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                    Principais regras gramaticais para redações nota máxima.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-indigo-100 text-indigo-800 text-xs">Gramática</Badge>
                    <span className="text-xs text-gray-500">20 min</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Análise Redações */}
          <div onClick={() => openMaterialModal('analise')} className="cursor-pointer">
            <LiquidGlassCard className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-amber-50/80 to-amber-100/50 border-amber-200/50 hover:border-amber-300/70">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">Análise de Redações Nota 1000</h3>
                  <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                    Estudo detalhado de redações que obtiveram nota máxima.
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-100 text-amber-800 text-xs">Exemplos</Badge>
                    <span className="text-xs text-gray-500">25 min</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>

        </div>

      </div>

      {/* Material Modal */}
      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <GraduationCap className="text-white" size={16} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-dark-blue">
                  {selectedMaterial?.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {selectedMaterial?.category}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {selectedMaterial?.readTime}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {selectedMaterial && (
            <div className="mt-4">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-soft-gray leading-relaxed">
                  {selectedMaterial.content}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowMaterialModal(false)}
                  className="text-soft-gray border-soft-gray/30 hover:border-bright-blue hover:text-bright-blue"
                >
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                  onClick={() => downloadAsPDF(selectedMaterial)}
                >
                  <Download size={14} className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}