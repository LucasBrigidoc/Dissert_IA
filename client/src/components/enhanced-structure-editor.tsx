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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Seleção de Estilo */}
      <Card className="border-bright-blue/20">
        <CardHeader>
          <CardTitle className="text-dark-blue flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Qual o estilo de redação?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedStyle} onValueChange={handleStyleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o estilo de redação" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ESSAY_STYLES).map(([key, style]) => (
                <SelectItem key={key} value={key}>
                  <div>
                    <div className="font-medium">{style.name}</div>
                    <div className="text-sm text-soft-gray">{style.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedStyle && selectedStyle !== "personalizada" && (
            <div className="p-4 bg-bright-blue/5 rounded-lg border border-bright-blue/20">
              <p className="text-sm text-dark-blue">
                <strong>Estrutura sugerida:</strong> {ESSAY_STYLES[selectedStyle as keyof typeof ESSAY_STYLES].description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise de Redação Modelo */}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="text-dark-blue flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Redação Modelo (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-soft-gray">
            Cole uma redação modelo para analisar sua estrutura e criar seções baseadas nela
          </p>
          <Textarea
            placeholder="Cole aqui uma redação que serve como modelo para a estrutura..."
            value={modelEssay}
            onChange={(e) => setModelEssay(e.target.value)}
            rows={6}
            className="border-green-500/20"
          />
          <Button 
            onClick={analyzeModelEssay}
            disabled={!modelEssay.trim()}
            variant="outline"
            className="border-green-500/30 text-green-600 hover:bg-green-500/10"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Analisar e Criar Estrutura
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Nome da Estrutura */}
      <div className="space-y-2">
        <Label htmlFor="structure-name" className="text-dark-blue font-medium text-lg">
          Nome da Estrutura
        </Label>
        <Input
          id="structure-name"
          placeholder="Ex: Dissertação Argumentativa modelo 1"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-lg h-12"
          data-testid="input-nome-estrutura"
        />
      </div>

      {/* Seções */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-dark-blue">Seções da Estrutura</h3>
            <p className="text-soft-gray text-sm">
              {showModelAnalysis 
                ? "Estrutura gerada baseada na redação modelo - ajuste conforme necessário"
                : "Defina as seções que comporão sua estrutura de redação"
              }
            </p>
          </div>
          <Badge variant="secondary" className="text-bright-blue">
            {sections.length} seção{sections.length !== 1 ? 'ões' : ''}
          </Badge>
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

        {sections.length === 0 && !selectedStyle && (
          <div className="text-center py-8 text-soft-gray">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Selecione um estilo de redação para começar</p>
            <p className="text-sm">Ou adicione seções manualmente</p>
          </div>
        )}
      </div>
    </div>
  );
}