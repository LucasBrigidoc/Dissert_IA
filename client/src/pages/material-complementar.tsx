import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Download,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import jsPDF from 'jspdf';
import type { MaterialComplementar } from "@shared/schema";

const iconMap = {
  FileText: FileText,
  Target: Target,
  BookOpen: BookOpen,
  Lightbulb: Lightbulb,
  PenTool: PenTool,
  Eye: Eye,
};

const colorSchemeMap = {
  green: "from-green-50/80 to-green-100/50 border-green-200/50 hover:border-green-300/70",
  blue: "from-blue-50/80 to-blue-100/50 border-blue-200/50 hover:border-blue-300/70",
  purple: "from-purple-50/80 to-purple-100/50 border-purple-200/50 hover:border-purple-300/70",
  orange: "from-orange-50/80 to-orange-100/50 border-orange-200/50 hover:border-orange-300/70",
  indigo: "from-indigo-50/80 to-indigo-100/50 border-indigo-200/50 hover:border-indigo-300/70",
  amber: "from-amber-50/80 to-amber-100/50 border-amber-200/50 hover:border-amber-300/70",
};

const iconColorMap = {
  green: "from-green-500 to-green-600",
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  indigo: "from-indigo-500 to-indigo-600",
  amber: "from-amber-500 to-amber-600",
};

const categoryColorMap = {
  Fundamental: "bg-green-100 text-green-800",
  Técnico: "bg-blue-100 text-blue-800",
  Avançado: "bg-purple-100 text-purple-800",
  ENEM: "bg-orange-100 text-orange-800",
  Gramática: "bg-indigo-100 text-indigo-800",
  Exemplos: "bg-amber-100 text-amber-800",
};

export default function MaterialComplementarPage() {
  const [, setLocation] = useLocation();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialComplementar | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // Fetch published materials from API
  const { data: materials = [], isLoading } = useQuery<MaterialComplementar[]>({
    queryKey: ["/api/materiais-complementares"],
  });

  const openMaterialModal = (material: MaterialComplementar) => {
    setSelectedMaterial(material);
    setShowMaterialModal(true);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || FileText;
    return <IconComponent size={18} className="text-white" />;
  };

  const downloadAsPDF = (material: MaterialComplementar) => {
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
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <GraduationCap className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Material Complementar</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                  <GraduationCap className="text-white" size={16} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Material Complementar</h1>
              </div>
            </div>
            <div className="text-sm text-soft-gray">
              Guias educativos para aprimorar sua redação
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
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="animate-spin text-bright-blue" size={32} />
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials?.map((material: MaterialComplementar) => (
              <div 
                key={material.id} 
                onClick={() => openMaterialModal(material)} 
                className="cursor-pointer"
                data-testid={`material-card-${material.id}`}
              >
                <LiquidGlassCard className={`p-4 sm:p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br ${colorSchemeMap[material.colorScheme as keyof typeof colorSchemeMap] || colorSchemeMap.green}`}>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${iconColorMap[material.colorScheme as keyof typeof iconColorMap] || iconColorMap.green} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {getIconComponent(material.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-dark-blue mb-2">{material.title}</h3>
                      <p className="text-xs sm:text-sm text-soft-gray mb-3 leading-relaxed">
                        {material.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={`${categoryColorMap[material.category as keyof typeof categoryColorMap] || categoryColorMap.Fundamental} text-xs`}>
                          {material.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{material.readTime}</span>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            ))}

            {materials?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-lg font-semibold mb-2">Nenhum material disponível</h3>
                <p className="text-muted-foreground">
                  Os materiais complementares estarão disponíveis em breve
                </p>
              </div>
            )}
          </div>
        )}

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