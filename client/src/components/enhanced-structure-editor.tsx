import { useState } from "react";
import { Plus, Trash2, GripVertical, FileText, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Section } from "@shared/schema";
import { nanoid } from "nanoid";

interface EnhancedStructureEditorProps {
  name: string;
  sections: Section[];
  onNameChange: (name: string) => void;
  onSectionsChange: (sections: Section[]) => void;
  isEditing?: boolean;
}

const ESSAY_STYLES = {
  "dissertativo-argumentativo": {
    name: "Dissertativo-Argumentativo",
    description: "Estrutura clássica do ENEM com tese, argumentos e proposta",
    defaultSections: [
      {
        title: "Introdução",
        description: "Apresente o tema, contextualize o problema e declare sua tese principal"
      },
      {
        title: "Desenvolvimento 1",
        description: "Desenvolva seu primeiro argumento com dados, exemplos e análise crítica"
      },
      {
        title: "Desenvolvimento 2", 
        description: "Apresente seu segundo argumento complementando a argumentação"
      },
      {
        title: "Conclusão",
        description: "Retome a tese e apresente proposta de intervenção detalhada"
      }
    ]
  },
  "artigo-opiniao": {
    name: "Artigo de Opinião",
    description: "Texto jornalístico que expressa ponto de vista sobre tema atual",
    defaultSections: [
      {
        title: "Lead/Abertura",
        description: "Inicie com gancho interessante, fato atual ou pergunta provocativa"
      },
      {
        title: "Contextualização",
        description: "Apresente o contexto do tema e sua relevância social"
      },
      {
        title: "Argumentação Principal",
        description: "Desenvolva sua opinião com argumentos sólidos e exemplos"
      },
      {
        title: "Contra-argumentação",
        description: "Aborde possíveis objeções e refute-as consistentemente"
      },
      {
        title: "Fechamento",
        description: "Conclua reforçando sua opinião e provocando reflexão"
      }
    ]
  },
  "texto-expositivo": {
    name: "Texto Expositivo",
    description: "Apresentação objetiva e informativa sobre um tema",
    defaultSections: [
      {
        title: "Introdução",
        description: "Apresente o tema e delimite o que será abordado"
      },
      {
        title: "Desenvolvimento - Conceitos",
        description: "Defina conceitos fundamentais e características principais"
      },
      {
        title: "Desenvolvimento - Exemplos",
        description: "Apresente exemplos práticos e casos específicos"
      },
      {
        title: "Desenvolvimento - Análise",
        description: "Analise causas, consequências ou relações do tema"
      },
      {
        title: "Conclusão",
        description: "Sintetize as informações e feche o raciocínio"
      }
    ]
  },
  "personalizada": {
    name: "Estrutura Personalizada",
    description: "Crie sua própria estrutura do zero",
    defaultSections: []
  }
};

export function EnhancedStructureEditor({ 
  name, 
  sections, 
  onNameChange, 
  onSectionsChange,
  isEditing = false
}: EnhancedStructureEditorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [modelEssay, setModelEssay] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showModelAnalysis, setShowModelAnalysis] = useState(false);
  const [isModelSectionExpanded, setIsModelSectionExpanded] = useState(false);

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    if (style !== "personalizada" && ESSAY_STYLES[style as keyof typeof ESSAY_STYLES]) {
      const styleConfig = ESSAY_STYLES[style as keyof typeof ESSAY_STYLES];
      const newSections: Section[] = styleConfig.defaultSections.map(section => ({
        id: nanoid(),
        title: section.title,
        description: section.description
      }));
      onSectionsChange(newSections);
      onNameChange(styleConfig.name);
    } else if (style === "personalizada") {
      onSectionsChange([]);
      onNameChange("");
    }
  };

  const analyzeModelEssay = () => {
    if (!modelEssay.trim()) return;
    
    // Análise básica do texto modelo para sugerir estrutura
    const paragraphs = modelEssay.split('\n\n').filter(p => p.trim());
    const suggestedSections: Section[] = paragraphs.map((paragraph, index) => {
      let title = "";
      let description = "";
      
      if (index === 0) {
        title = "Introdução";
        description = "Parágrafo introdutório que apresenta o tema e contextualização";
      } else if (index === paragraphs.length - 1) {
        title = "Conclusão";
        description = "Parágrafo final que conclui o raciocínio";
      } else {
        title = `Desenvolvimento ${index}`;
        description = "Parágrafo de desenvolvimento com argumentos e exemplos";
      }
      
      return {
        id: nanoid(),
        title,
        description: `${description}\n\nExemplo do texto: "${paragraph.substring(0, 100)}..."`
      };
    });
    
    onSectionsChange(suggestedSections);
    setShowModelAnalysis(true);
  };

  const addSection = () => {
    const newSection: Section = {
      id: nanoid(),
      title: "",
      description: ""
    };
    onSectionsChange([...sections, newSection]);
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const updatedSections = sections.map((section, i) => 
      i === index ? { ...section, [field]: value } : section
    );
    onSectionsChange(updatedSections);
  };

  const removeSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    onSectionsChange(updatedSections);
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    const updatedSections = [...sections];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);
    onSectionsChange(updatedSections);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveSection(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Análise de Redação Modelo */}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="text-dark-blue flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Analisar Redação Modelo
          </CardTitle>
          <p className="text-sm text-soft-gray">
            Cole uma redação modelo para analisar sua estrutura e criar seções automaticamente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Cole aqui uma redação que serve como modelo para a estrutura..."
            value={modelEssay}
            onChange={(e) => setModelEssay(e.target.value)}
            rows={8}
            className="border-green-500/20 min-h-[200px]"
          />
          <Button 
            onClick={analyzeModelEssay}
            disabled={!modelEssay.trim()}
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Analisar e Criar Estrutura
          </Button>
          
          {!modelEssay.trim() && (
            <div className="text-center py-6 text-soft-gray border border-dashed border-soft-gray/30 rounded-lg">
              <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="font-medium">Cole uma redação modelo acima</p>
              <p className="text-sm">A estrutura será criada automaticamente baseada no texto</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estrutura Gerada */}
      {sections.length > 0 && (
        <Card className="border-bright-blue/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-dark-blue flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estrutura Gerada
                </CardTitle>
                <p className="text-sm text-soft-gray">
                  {showModelAnalysis 
                    ? "Estrutura criada baseada na redação modelo - você pode editar conforme necessário"
                    : "Seções da sua estrutura de redação"
                  }
                </p>
              </div>
              <Badge variant="secondary" className="text-bright-blue">
                {sections.length} seção{sections.length !== 1 ? 'ões' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome da Estrutura */}
            <div className="space-y-2">
              <Label htmlFor="structure-name" className="text-dark-blue font-medium">
                Nome da Estrutura
              </Label>
              <Input
                id="structure-name"
                placeholder="Ex: Estrutura baseada em redação modelo"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="h-10"
                data-testid="input-nome-estrutura"
              />
            </div>

            {/* Lista de Seções */}
            <div className="space-y-3">
              {sections.map((section, index) => (
                <Card 
                  key={section.id} 
                  className={`transition-all duration-200 ${
                    draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-soft-gray cursor-move" />
                      <Badge variant="outline" className="text-xs">
                        {index === 0 ? 'Introdução' : 
                         index === sections.length - 1 ? 'Conclusão' :
                         `Parágrafo ${index + 1}`}
                      </Badge>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-remover-secao-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`section-title-${index}`} className="text-sm font-medium">
                        Título da Seção
                      </Label>
                      <Input
                        id={`section-title-${index}`}
                        placeholder="Ex: Introdução"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        data-testid={`input-titulo-secao-${index}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`section-description-${index}`} className="text-sm font-medium">
                        Descrição/Instruções
                      </Label>
                      <Textarea
                        id={`section-description-${index}`}
                        placeholder="Ex: Apresente o tema e sua tese principal"
                        value={section.description}
                        onChange={(e) => updateSection(index, 'description', e.target.value)}
                        rows={3}
                        data-testid={`textarea-descricao-secao-${index}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Botão Adicionar Seção */}
            <Button
              variant="outline"
              className="w-full border-dashed border-bright-blue text-bright-blue hover:bg-bright-blue/5"
              onClick={addSection}
              data-testid="button-adicionar-secao"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Seção
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}