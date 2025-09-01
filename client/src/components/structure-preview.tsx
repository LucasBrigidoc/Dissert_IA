import { FileText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Section } from "@shared/schema";

interface StructurePreviewProps {
  name: string;
  sections: Section[];
  className?: string;
}

export function StructurePreview({ name, sections, className }: StructurePreviewProps) {
  if (!name || sections.length === 0) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-soft-gray">
          <Eye className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-center">Prévia da estrutura aparecerá aqui</p>
          <p className="text-sm text-center">Adicione um nome e seções para visualizar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="preview-estrutura">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-bright-blue" />
          <div>
            <CardTitle className="text-dark-blue">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {sections.length} seção{sections.length !== 1 ? 'ões' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {index + 1}
              </Badge>
              <h4 className="font-medium text-dark-blue">
                {section.title || `Seção ${index + 1}`}
              </h4>
            </div>
            <p className="text-sm text-soft-gray pl-8">
              {section.description || "Sem descrição"}
            </p>
            {index < sections.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}