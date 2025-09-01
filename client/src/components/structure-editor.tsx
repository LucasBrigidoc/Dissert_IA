import { useState } from "react";
import { Plus, Trash2, GripVertical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Section } from "@shared/schema";
import { nanoid } from "nanoid";

interface StructureEditorProps {
  name: string;
  sections: Section[];
  onNameChange: (name: string) => void;
  onSectionsChange: (sections: Section[]) => void;
  isEditing?: boolean;
}

export function StructureEditor({ 
  name, 
  sections, 
  onNameChange, 
  onSectionsChange,
  isEditing = false
}: StructureEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
    <div className="space-y-6">
      {/* Structure Name */}
      <div className="space-y-2">
        <Label htmlFor="structure-name" className="text-dark-blue font-medium">
          Nome da Estrutura
        </Label>
        <Input
          id="structure-name"
          placeholder="Ex: Dissertação Argumentativa modelo 1"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-lg"
          data-testid="input-nome-estrutura"
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-dark-blue">Seções da Estrutura</h3>
            <p className="text-soft-gray text-sm">
              Defina as seções que comporão sua estrutura de redação
            </p>
          </div>
          <Badge variant="secondary" className="text-bright-blue">
            {sections.length} seção{sections.length !== 1 ? 'ões' : ''}
          </Badge>
        </div>

        {/* Section List */}
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
                    Seção {index + 1}
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

        {/* Add Section Button */}
        <Button
          variant="outline"
          className="w-full border-dashed border-bright-blue text-bright-blue hover:bg-bright-blue/5"
          onClick={addSection}
          data-testid="button-adicionar-secao"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Seção
        </Button>

        {sections.length === 0 && (
          <div className="text-center py-8 text-soft-gray">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma seção adicionada ainda</p>
            <p className="text-sm">Clique em "Adicionar Seção" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}