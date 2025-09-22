import { useState } from "react";
import { Plus, Trash2, GripVertical, FileText, Upload, Wand2, Edit3, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Section } from "@shared/schema";
import { nanoid } from "nanoid";

interface EnhancedStructureEditorProps {
  name: string;
  sections: Section[];
  onNameChange: (name: string) => void;
  onSectionsChange: (sections: Section[]) => void;
  isEditing?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  showSaveButton?: boolean;
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
  isEditing = false,
  onSave,
  isSaving = false,
  showSaveButton = false
}: EnhancedStructureEditorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [modelEssay, setModelEssay] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showModelAnalysis, setShowModelAnalysis] = useState(false);
  const [isModelSectionExpanded, setIsModelSectionExpanded] = useState(false);
  const [creationMode, setCreationMode] = useState<"model" | "manual">("model");

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

  const createManualStructure = () => {
    if (!name.trim()) {
      onNameChange("Estrutura Dissertativa Argumentativa");
    }
    
    const guidedSections: Section[] = [
      {
        id: nanoid(),
        title: "1º Parágrafo - Introdução",
        description: `1ª FRASE: Use conectivos (De acordo, Conforme, Segundo, O, A, Na, No) + Contextualização do tema/citação de repertório
2ª FRASE: Use conectivos (Entretanto, Contudo, No entanto, Todavia) + Apresentar o tema e sua tese
3ª FRASE: Use conectivos (Além disso, Logo, Assim sendo) + Apresentar as ideias que serão desenvolvidas`
      },
      {
        id: nanoid(),
        title: "2º Parágrafo - Primeiro Desenvolvimento", 
        description: `1ª FRASE: Use conectivos (Inicialmente, Primeiramente, Primordialmente, Em primeira análise) + Citação/afirmação/contextualização histórica
2ª FRASE: Use conectivos (Nesse sentido, Diante disso, Dessa forma) + Retomada e desenvolvimento da 1ª ideia
3ª FRASE: Use conectivos (Assim, Dessarte) + Isolamento da ideia com breve conclusão`
      },
      {
        id: nanoid(),
        title: "3º Parágrafo - Segundo Desenvolvimento",
        description: `1ª FRASE: Use conectivos (Além disso, Ademais) + Apresentação da 2ª ideia
2ª FRASE: Use conectivos (Nesse aspecto, Nessa perspectiva, Dessa maneira) + Seu posicionamento com explicação/exemplos
3ª FRASE: Use conectivos (Assim, Dessarte) + Isolamento da ideia preparando para conclusão`
      },
      {
        id: nanoid(),
        title: "4º Parágrafo - Conclusão",
        description: `1ª FRASE: Use conectivos (Sobre isso, Em suma, Portanto) + Resumo do tema com proposta de solução
2ª FRASE: Use conectivos (Nessa perspectiva, Por conseguinte) + Responda: Quem deve fazer? O que? Como? Por meio do que? Para que?
3ª FRASE: Use conectivos (Assim, Por conseguinte) + Detalhamento da proposta e resultado esperado`
      }
    ];
    
    onSectionsChange(guidedSections);
    setCreationMode("manual");
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
      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="model" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Analisar Redação Modelo
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Criar do Zero
          </TabsTrigger>
        </TabsList>

        {/* Tab: Analisar Redação Modelo */}
        <TabsContent value="model" className="space-y-6">
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
        </TabsContent>

        {/* Tab: Criar do Zero */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="border-bright-blue/20">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Criar Estrutura do Zero
              </CardTitle>
              <p className="text-sm text-soft-gray">
                Crie uma estrutura dissertativa argumentativa seguindo o modelo pedagógico com conectivos e estratégias específicas
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome da Estrutura */}
              <div className="space-y-2">
                <Label htmlFor="manual-structure-name" className="text-dark-blue font-medium">
                  Nome da Estrutura
                </Label>
                <Input
                  id="manual-structure-name"
                  placeholder="Ex: Dissertação Argumentativa personalizada"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="h-10"
                  data-testid="input-nome-estrutura-manual"
                />
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="border border-dashed border-bright-blue/30 rounded-lg py-8 bg-gradient-to-br from-bright-blue/5 to-transparent">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-bright-blue opacity-50" />
                    <p className="font-medium text-dark-blue mb-2">Estrutura Dissertativa Argumentativa</p>
                    <p className="text-sm text-soft-gray mb-1">Crie uma redação seguindo o modelo pedagógico</p>
                    <p className="text-xs text-soft-gray mb-4">4 parágrafos com conectivos e estratégias específicas</p>
                    <Button 
                      onClick={createManualStructure}
                      className="bg-bright-blue hover:bg-bright-blue/90 text-white"
                      size="lg"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Estrutura Guiada
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-dark-blue">Seções da Estrutura</h4>
                    <Badge variant="secondary" className="text-bright-blue">
                      {sections.length} seção{sections.length !== 1 ? 'ões' : ''}
                    </Badge>
                  </div>
                  
                  {/* Lista de Seções */}
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
                             index === sections.length - 1 && sections.length > 1 ? 'Conclusão' :
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
                          <Label htmlFor={`manual-section-title-${index}`} className="text-sm font-medium">
                            Título da Seção
                          </Label>
                          <Input
                            id={`manual-section-title-${index}`}
                            placeholder="Ex: Introdução"
                            value={section.title}
                            onChange={(e) => updateSection(index, 'title', e.target.value)}
                            data-testid={`input-titulo-secao-${index}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`manual-section-description-${index}`} className="text-sm font-medium">
                            Descrição/Instruções
                          </Label>
                          <Textarea
                            id={`manual-section-description-${index}`}
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

                  {/* Botão Salvar Estrutura */}
                  {showSaveButton && onSave && (
                    <div className="pt-4 border-t border-bright-blue/20">
                      <Button
                        onClick={onSave}
                        disabled={!name.trim() || sections.length === 0 || sections.some(s => !s.title.trim() || !s.description.trim()) || isSaving}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        data-testid="button-salvar-estrutura-manual"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Estrutura
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estrutura Gerada (para redação modelo) */}
      {showModelAnalysis && sections.length > 0 && (
        <Card className="border-bright-blue/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-dark-blue flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Estrutura Gerada
                </CardTitle>
                <p className="text-sm text-soft-gray">
                  Estrutura criada baseada na redação modelo - você pode editar conforme necessário
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
              <Label htmlFor="generated-structure-name" className="text-dark-blue font-medium">
                Nome da Estrutura
              </Label>
              <Input
                id="generated-structure-name"
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
                      <Label htmlFor={`generated-section-title-${index}`} className="text-sm font-medium">
                        Título da Seção
                      </Label>
                      <Input
                        id={`generated-section-title-${index}`}
                        placeholder="Ex: Introdução"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        data-testid={`input-titulo-secao-${index}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`generated-section-description-${index}`} className="text-sm font-medium">
                        Descrição/Instruções
                      </Label>
                      <Textarea
                        id={`generated-section-description-${index}`}
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

            {/* Botão Salvar Estrutura */}
            {showSaveButton && onSave && (
              <div className="pt-4 border-t border-bright-blue/20">
                <Button
                  onClick={onSave}
                  disabled={!name.trim() || sections.length === 0 || sections.some(s => !s.title.trim() || !s.description.trim()) || isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-salvar-estrutura-gerada"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Estrutura
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}