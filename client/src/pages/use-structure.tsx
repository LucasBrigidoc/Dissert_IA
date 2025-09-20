import { useState } from "react";
import { ArrowLeft, FileText, Play, Search, Edit3, PenTool, Loader2, Save, X, HelpCircle, Info, Lightbulb } from "lucide-react";
import { EssayResult } from "@/pages/essay-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { StructurePreview } from "@/components/structure-preview";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EssayStructure, Section } from "@shared/schema";

interface StructureGuide {
  whenToUse: string[];
  whenNotToUse: string[];
  advantages: string[];
}

interface StructureWithGuide extends EssayStructure {
  guide?: StructureGuide;
}

interface UseStructureProps {
  structures: EssayStructure[];
  onBack: () => void;
  onSaveStructure?: (structure: EssayStructure) => void;
}

export function UseStructure({ structures, onBack, onSaveStructure }: UseStructureProps) {
  // 7 Estruturas Predefinidas Coringa
  const predefinedStructures: StructureWithGuide[] = [
    {
      id: "model-1",
      name: "Modelo 1: Universal Clássico", 
      userId: "system",
      sections: [
        {
          id: "m1-intro",
          title: "Introdução",
          description: "Contextualização com filósofo + problema + falhas implementação + desengajamento social",
          guidelines: "O filósofo John Rawls defendia... Contudo, a realidade brasileira apresenta... agravada por falhas sistemáticas e desengajamento..."
        },
        {
          id: "m1-dev1",
          title: "Primeiro Desenvolvimento - Falhas de Implementação",
          description: "Evidências estatísticas + deficiências na implementação de soluções",
          guidelines: "Dados revelam... observam-se falhas sistemáticas evidenciadas por: inadequação de recursos, descontinuidade, falta de coordenação..."
        },
        {
          id: "m1-dev2",
          title: "Segundo Desenvolvimento - Desengajamento Social", 
          description: "Robert Putnam + falta de engajamento dos atores sociais",
          guidelines: "Robert Putnam demonstrou... verifica-se desengajamento manifestado por: indiferença social, falta de mobilização..."
        },
        {
          id: "m1-concl",
          title: "Conclusão",
          description: "Síntese + órgão competente + programa integrado + ações específicas",
          guidelines: "Superar essa problemática exige... [Órgão competente] deve desenvolver [programa integrado] por meio de [ações específicas]..."
        }
      ],
      guide: {
        whenToUse: ["Qualquer tema que você não souber exatamente como abordar", "Temas sobre direitos fundamentais (educação, saúde, moradia)", "Problemas de gestão pública e eficiência estatal", "Questões de cidadania e participação democrática"],
        whenNotToUse: ["Quando outro modelo se encaixa perfeitamente no tema", "Temas muito específicos que pedem abordagem especializada"],
        advantages: ["Funciona para 95% dos temas", "Argumentação sólida e respeitada", "Linguagem acadêmica que impressiona corretores"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-2", 
      name: "Modelo 2: Desigualdades Estruturais",
      userId: "system",
      sections: [
        {
          id: "m2-intro",
          title: "Introdução",
          description: "Pierre Bourdieu + diferentes formas de capital + concentração inadequada + exclusão sistemática",
          guidelines: "Pierre Bourdieu demonstrou como diferentes formas de capital se combinam... intensificada pela concentração inadequada e exclusão sistemática..."
        },
        {
          id: "m2-dev1",
          title: "Primeiro Desenvolvimento - Concentração Inadequada",
          description: "Dados sobre concentração + monopolização de benefícios por grupos privilegiados",
          guidelines: "Dados demonstram... concentração inadequada evidenciada por: monopolização de benefícios, barreiras estruturais, centralização excessiva..."
        },
        {
          id: "m2-dev2",
          title: "Segundo Desenvolvimento - Exclusão Sistemática",
          description: "Amartya Sen + desenvolvimento verdadeiro + exclusão de grupos vulneráveis",
          guidelines: "Amartya Sen argumentava... grupos vulneráveis enfrentam exclusão caracterizada por: discriminação estrutural, falta de representatividade..."
        },
        {
          id: "m2-concl",
          title: "Conclusão",
          description: "Redistribuição de recursos + inclusão efetiva + programa de inclusão e redistribuição",
          guidelines: "Enfrentar essa questão demanda redistribuição... [Ministério competente] deve implementar [programa de inclusão] através de [medidas específicas]..."
        }
      ],
      guide: {
        whenToUse: ["Temas sobre desigualdade social e concentração de renda", "Problemas de acesso a oportunidades", "Questões de exclusão social e marginalização", "Discriminação racial, de gênero ou social"],
        whenNotToUse: ["Problemas comportamentais ou psicológicos", "Questões ambientais sem componente social forte", "Temas puramente técnicos ou legais"],
        advantages: ["Excelente para questões de equidade e justiça social", "Abordagem sociológica sofisticada", "Muito atual e relevante para debates contemporâneos"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-3",
      name: "Modelo 3: Herança Histórico-Cultural", 
      userId: "system",
      sections: [
        {
          id: "m3-intro",
          title: "Introdução",
          description: "Sérgio Buarque de Holanda + padrões históricos + estruturas excludentes + mentalidades naturalizadoras",
          guidelines: "Sérgio Buarque de Holanda demonstrou como padrões históricos se perpetuam... alimentada pela manutenção de estruturas excludentes..."
        },
        {
          id: "m3-dev1",
          title: "Primeiro Desenvolvimento - Estruturas Excludentes",
          description: "Persistência de estruturas excludentes + concentração de privilégios em grupos tradicionais",
          guidelines: "Pesquisas revelam... persistem estruturas excludentes manifestando-se por: concentração de privilégios, manutenção de hierarquias..."
        },
        {
          id: "m3-dev2",
          title: "Segundo Desenvolvimento - Mentalidades Naturalizadoras",
          description: "Paulo Freire + mentalidades que naturalizam + reprodução de preconceitos estruturais",
          guidelines: "Paulo Freire alertava... observa-se reprodução de mentalidades caracterizada por: aceitação passiva, normalização de injustiças..."
        },
        {
          id: "m3-concl",
          title: "Conclusão",
          description: "Democratização de estruturas + transformação de mentalidades + programa de transformação social",
          guidelines: "Superar heranças históricas requer democratização... [Órgão governamental] deve implementar [programa de transformação] mediante [ações específicas]..."
        }
      ],
      guide: {
        whenToUse: ["Questões raciais e discriminação histórica", "Problemas de coronelismo e concentração de poder", "Machismo e questões de gênero", "Questões agrárias e concentração de terras"],
        whenNotToUse: ["Problemas técnicos ou tecnológicos recentes", "Questões globais sem raiz histórica nacional", "Temas que exigem abordagem econômica"],
        advantages: ["Conecta passado e presente de forma convincente", "Abordagem histórica respeitada por corretores", "Muito eficaz para temas brasileiros específicos"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-4",
      name: "Modelo 4: Fatores Econômico-Sociais",
      userId: "system", 
      sections: [
        {
          id: "m4-intro",
          title: "Introdução",
          description: "Amartya Sen + desenvolvimento como liberdade + distribuição inadequada + insuficiência de mecanismos democratizadores",
          guidelines: "Amartya Sen argumentava que o verdadeiro progresso deve expandir capacidades... intensificada pela distribuição inadequada e insuficiência de mecanismos..."
        },
        {
          id: "m4-dev1",
          title: "Primeiro Desenvolvimento - Distribuição Inadequada",
          description: "Dados econômicos + concentração de recursos + desigualdade no acesso a oportunidades",
          guidelines: "Dados demonstram... distribuição inadequada evidenciada por: concentração de recursos, desigualdade no acesso, monopolização de setores..."
        },
        {
          id: "m4-dev2",
          title: "Segundo Desenvolvimento - Insuficiência de Mecanismos Democratizadores",
          description: "Joseph Stiglitz + necessidade de mecanismos redistributivos + limitações de políticas",
          guidelines: "Joseph Stiglitz demonstrou... insuficiência de mecanismos caracterizada por: limitações redistributivas, ausência de programas de inclusão..."
        },
        {
          id: "m4-concl",
          title: "Conclusão",
          description: "Desenvolvimento econômico-social equitativo + redistribuição + programa de desenvolvimento inclusivo",
          guidelines: "Construir modelo equitativo requer redistribuição... [Ministério competente] deve implementar [programa de desenvolvimento inclusivo]..."
        }
      ],
      guide: {
        whenToUse: ["Questões de distribuição de renda", "Acesso ao ensino superior e mercado de trabalho", "Políticas de desenvolvimento regional", "Microcrédito e inclusão bancária"],
        whenNotToUse: ["Questões puramente sociais sem componente econômico", "Problemas comportamentais", "Temas culturais sem aspecto econômico"],
        advantages: ["Abordagem econômica sofisticada", "Conecta teoria econômica com política social", "Muito adequado para temas de desenvolvimento"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-5",
      name: "Modelo 5: Mudanças Comportamentais",
      userId: "system",
      sections: [
        {
          id: "m5-intro",
          title: "Introdução",
          description: "Albert Bandura + teoria da aprendizagem social + padrões comportamentais inadequados + ausência de modelos positivos",
          guidelines: "Albert Bandura demonstrou que comportamentos são aprendidos... intensificada pela reprodução de padrões inadequados e ausência de modelos positivos..."
        },
        {
          id: "m5-dev1",
          title: "Primeiro Desenvolvimento - Padrões Inadequados",
          description: "Dados comportamentais + reprodução sistemática + normalização de comportamentos problemáticos",
          guidelines: "Pesquisas revelam... reprodução sistemática caracterizada por: normalização de comportamentos problemáticos, resistência a mudanças..."
        },
        {
          id: "m5-dev2",
          title: "Segundo Desenvolvimento - Ausência de Modelos Positivos",
          description: "Viktor Frankl + presença de modelos significativos + carência de referências inspiradoras",
          guidelines: "Viktor Frankl demonstrou... carência de modelos positivos evidenciada por: ausência de referências inspiradoras, falta de exemplos transformadores..."
        },
        {
          id: "m5-concl",
          title: "Conclusão",
          description: "Transformação comportamental + desconstrução de modelos inadequados + programa de transformação comportamental",
          guidelines: "Transformar padrões coletivos requer desconstrução... [Ministério competente] deve implementar [programa de transformação comportamental]..."
        }
      ],
      guide: {
        whenToUse: ["Bullying e violência escolar", "Violência contra mulher e machismo", "Preconceito e discriminação social", "Consumismo e meio ambiente"],
        whenNotToUse: ["Problemas estruturais ou institucionais", "Questões econômicas complexas", "Temas que exigem abordagem legal"],
        advantages: ["Foca na mudança de mentalidade", "Abordagem psicológica respeitada", "Ideal para temas comportamentais"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-6", 
      name: "Modelo 6: Questões Jurídico-Institucionais",
      userId: "system",
      sections: [
        {
          id: "m6-intro",
          title: "Introdução",
          description: "Ronald Dworkin + integridade do direito + deficiências na aplicação + inadequação institucional",
          guidelines: "Ronald Dworkin defendia que princípios devem ser concretamente efetivados... intensificada por deficiências nos sistemas de aplicação..."
        },
        {
          id: "m6-dev1",
          title: "Primeiro Desenvolvimento - Deficiências de Aplicação",
          description: "Dados institucionais + morosidade nos processos + custos elevados de acesso",
          guidelines: "Dados revelam... deficiências sistemáticas evidenciadas por: morosidade nos processos, custos elevados, complexidade excessiva..."
        },
        {
          id: "m6-dev2",
          title: "Segundo Desenvolvimento - Inadequação Institucional",
          description: "Norberto Bobbio + proliferação normativa + desatualização de marcos normativos",
          guidelines: "Norberto Bobbio alertava... inadequação das estruturas caracterizada por: desatualização normativa, conflitos de competências..."
        },
        {
          id: "m6-concl",
          title: "Conclusão",
          description: "Efetivação de direitos + modernização dos sistemas + reforma institucional",
          guidelines: "Efetivação plena requer modernização... [Poder competente] deve promover [reforma institucional] mediante [ações específicas]..."
        }
      ],
      guide: {
        whenToUse: ["Morosidade do judiciário", "Efetivação de direitos constitucionais", "Problemas no sistema prisional", "Acesso à justiça e defensoria pública"],
        whenNotToUse: ["Problemas comportamentais ou culturais", "Questões econômicas sem aspecto legal", "Temas que exigem abordagem social"],
        advantages: ["Abordagem jurídica técnica e respeitada", "Ideal para temas sobre direitos e justiça", "Linguagem sofisticada para o direito"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "model-7",
      name: "Modelo 7: Informação e Comunicação Social", 
      userId: "system",
      sections: [
        {
          id: "m7-intro",
          title: "Introdução",
          description: "Jürgen Habermas + esfera pública + manipulação informacional + passividade crítica",
          guidelines: "Jürgen Habermas defendia que a democracia depende de espaços comunicacionais... agravada pela manipulação de informações e passividade crítica..."
        },
        {
          id: "m7-dev1",
          title: "Primeiro Desenvolvimento - Manipulação Informacional",
          description: "Dados sobre mídia + controle de narrativas + produção direcionada de conteúdos",
          guidelines: "Dados revelam... manipulação sistemática evidenciada por: controle de narrativas, produção direcionada, uso de algoritmos..."
        },
        {
          id: "m7-dev2",
          title: "Segundo Desenvolvimento - Passividade Crítica",
          description: "Neil Postman + privilégio do entretenimento + consumo acrítico de informações",
          guidelines: "Neil Postman alertava... passividade crítica caracterizada por: consumo acrítico, preferência por conteúdos superficiais..."
        },
        {
          id: "m7-concl",
          title: "Conclusão",
          description: "Democratização da comunicação + regulação de práticas + programa de educação midiática",
          guidelines: "Democratizar a comunicação requer regulação... [Ministério competente] deve criar [programa de educação midiática] através de [ações específicas]..."
        }
      ],
      guide: {
        whenToUse: ["Fake news e desinformação", "Concentração de mídia", "Redes sociais e polarização", "Educação midiática"],
        whenNotToUse: ["Problemas que não envolvem comunicação", "Questões puramente econômicas ou sociais", "Temas técnicos sem componente comunicacional"],
        advantages: ["Muito atual e relevante", "Conecta tecnologia com questões sociais", "Abordagem comunicacional sofisticada"]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const [selectedStructure, setSelectedStructure] = useState<EssayStructure | null>(null);
  
  // Combinar estruturas predefinidas com estruturas do usuário
  const allStructures = [...predefinedStructures, ...structures];
  
  const selectedPredefinedStructure = selectedStructure && predefinedStructures.find(s => s.id === selectedStructure.id);
  const [essayTopic, setEssayTopic] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEssay, setGeneratedEssay] = useState("");
  const [editingStructure, setEditingStructure] = useState<EssayStructure | null>(null);
  const [editedStructure, setEditedStructure] = useState<EssayStructure | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [usedStructure, setUsedStructure] = useState<EssayStructure | null>(null);
  const [suggestedStructure, setSuggestedStructure] = useState<EssayStructure | null>(null);
  const { toast } = useToast();


  const generateEssayContent = (structure: EssayStructure, topic: string, instructions: string): string => {
    const sections = Array.isArray(structure.sections) ? structure.sections as Section[] : [];
    let essay = "";
    
    essay += `**${topic}**\n\n`;
    
    sections.forEach((section, index) => {
      essay += `**${section.title || `Seção ${index + 1}`}**\n\n`;
      
      if (section.description) {
        essay += `${section.description}\n\n`;
      }
      
      // Gerar conteúdo baseado no tipo de seção e tema
      switch (section.title?.toLowerCase()) {
        case 'introdução':
          essay += `A questão sobre "${topic}" tem se tornado cada vez mais relevante em nossa sociedade contemporânea. Este tema desperta debates importantes e merece uma análise cuidadosa dos seus múltiplos aspectos.\n\n`;
          break;
        case 'desenvolvimento':
        case 'desenvolvimento 1':
        case 'desenvolvimento 2':
          essay += `No que se refere a ${topic.toLowerCase()}, é fundamental considerarmos os diversos fatores que influenciam esta questão. Os dados atuais demonstram a complexidade do tema e a necessidade de uma abordagem multidisciplinar para sua compreensão.\n\n`;
          break;
        case 'conclusão':
          essay += `Em síntese, a questão sobre "${topic}" demanda atenção especial da sociedade e das instituições. É necessário que sejam implementadas medidas efetivas para abordar adequadamente esta temática, promovendo o bem-estar social e o desenvolvimento sustentável.\n\n`;
          break;
        default:
          essay += `Em relação a ${topic.toLowerCase()}, esta seção aborda aspectos fundamentais que contribuem para uma compreensão mais ampla do tema proposto.\n\n`;
      }
    });
    
    if (instructions.trim()) {
      essay += `\n---\n**Instruções consideradas:** ${instructions}\n`;
    }
    
    return essay;
  };

  // Função para sugerir o melhor modelo baseado no tema
  const suggestBestModel = () => {
    if (!essayTopic.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Insira o tema da redação para receber sugestões.",
        variant: "destructive",
      });
      return;
    }

    const topic = essayTopic.toLowerCase();
    let bestMatch = predefinedStructures[0]; // Padrão: Universal Clássico
    
    // Análise de palavras-chave para sugerir o melhor modelo
    if (topic.includes('desigualdade') || topic.includes('distribuição') || topic.includes('renda') || topic.includes('exclusão') || topic.includes('discriminação')) {
      bestMatch = predefinedStructures[1]; // Desigualdades Estruturais
    } else if (topic.includes('histórico') || topic.includes('cultura') || topic.includes('tradição') || topic.includes('racial') || topic.includes('gênero') || topic.includes('machismo')) {
      bestMatch = predefinedStructures[2]; // Herança Histórico-Cultural
    } else if (topic.includes('econômic') || topic.includes('desenvolviment') || topic.includes('mercado') || topic.includes('emprego') || topic.includes('renda')) {
      bestMatch = predefinedStructures[3]; // Fatores Econômico-Sociais
    } else if (topic.includes('comportament') || topic.includes('violênc') || topic.includes('bullying') || topic.includes('preconceito') || topic.includes('consumismo')) {
      bestMatch = predefinedStructures[4]; // Mudanças Comportamentais
    } else if (topic.includes('justiça') || topic.includes('direito') || topic.includes('lei') || topic.includes('judiciário') || topic.includes('constitucional')) {
      bestMatch = predefinedStructures[5]; // Questões Jurídico-Institucionais
    } else if (topic.includes('mídia') || topic.includes('informação') || topic.includes('comunicação') || topic.includes('fake news') || topic.includes('redes sociais')) {
      bestMatch = predefinedStructures[6]; // Informação e Comunicação Social
    }

    setSelectedStructure(bestMatch);
    setSuggestedStructure(bestMatch);
    
    toast({
      title: "✨ Modelo sugerido!",
      description: `"${bestMatch.name}" é o melhor modelo para seu tema.`,
    });
  };

  const handleGenerateEssay = async () => {
    if (!essayTopic.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Insira o tema da redação.",
        variant: "destructive",
      });
      return;
    }

    // Usar estrutura selecionada ou estrutura de exemplo por padrão
    const structureToUse = selectedStructure || predefinedStructures[0];
    if (!structureToUse) {
      toast({
        title: "Erro",
        description: "Nenhuma estrutura disponível.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate essay using AI
      const response = await apiRequest("/api/essays/generate", {
        method: "POST",
        body: JSON.stringify({
          structureName: structureToUse.name,
          sections: Array.isArray(structureToUse.sections) ? structureToUse.sections : [],
          topic: essayTopic.trim(),
          additionalInstructions: additionalInstructions.trim() || undefined
        }),
      });

      if (response.success) {
        setGeneratedEssay(response.essay);
        setUsedStructure(structureToUse);
        setShowResult(true);
        
        toast({
          title: "Redação gerada com sucesso!",
          description: "Sua redação foi criada com IA seguindo a estrutura selecionada.",
        });
      } else {
        throw new Error(response.message || "Failed to generate essay");
      }
    } catch (error: any) {
      console.error("Essay generation error:", error);
      
      // Check for rate limiting (HTTP 429 status)
      if (error.status === 429) {
        toast({
          title: "Limite de uso atingido",
          description: "Você pode gerar 3 redações por hora. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        // Fallback to local generation if AI fails
        const fallbackEssay = generateEssayContent(structureToUse, essayTopic, additionalInstructions);
        setGeneratedEssay(fallbackEssay);
        setUsedStructure(structureToUse);
        setShowResult(true);
        
        const errorMessage = error.status >= 400 && error.status < 500 
          ? "Erro na solicitação. Verifique os dados informados." 
          : "A IA está indisponível. Redação gerada com estrutura básica.";
        
        toast({
          title: "Redação gerada (modo offline)",
          description: errorMessage,
          variant: "default",
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Se estiver mostrando resultado, renderizar tela de resultado
  if (showResult && generatedEssay && usedStructure) {
    return (
      <EssayResult
        essay={generatedEssay}
        topic={essayTopic}
        structure={usedStructure}
        instructions={additionalInstructions}
        onBack={() => {
          // Voltar direto para tela principal (estilo.tsx)
          onBack();
        }}
        onEdit={() => {
          setShowResult(false);
          // Manter os dados para continuar editando
        }}
        onNewEssay={() => {
          setShowResult(false);
          setGeneratedEssay("");
          setUsedStructure(null);
          setEssayTopic("");
          setAdditionalInstructions("");
          setSelectedStructure(null);
        }}
      />
    );
  }

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
            Voltar
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-dark-blue mb-2">
              Usar Estrutura Existente
            </h1>
            <p className="text-soft-gray">
              Selecione uma estrutura salva e gere redações seguindo esse modelo
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Proposta de Redação - PRIMEIRO ELEMENTO */}
          <LiquidGlassCard>
            <div className="flex items-center gap-2 mb-4">
              <PenTool className="h-5 w-5 text-bright-blue" />
              <h3 className="text-lg font-semibold text-dark-blue">
                1. Proposta de Redação
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="essay-topic" className="text-dark-blue font-medium">
                  Tema da Redação *
                </Label>
                <Textarea
                  id="essay-topic"
                  placeholder="Ex: A importância da educação digital no século XXI"
                  value={essayTopic}
                  onChange={(e) => setEssayTopic(e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid="textarea-tema-redacao"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Defina claramente o tema central da sua redação
                </p>
              </div>

              <div>
                <Label htmlFor="additional-instructions" className="text-dark-blue font-medium">
                  Instruções Especiais (opcional)
                </Label>
                <Textarea
                  id="additional-instructions"
                  placeholder="Ex: Abordagem argumentativa, público jovem, incluir dados estatísticos..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-testid="textarea-instrucoes-adicionais"
                />
                <p className="text-xs text-soft-gray mt-1">
                  Requisitos específicos, tom, estilo ou público-alvo
                </p>
              </div>
            </div>
            
            {/* Botão de sugerir modelo */}
            <div className="mt-4 pt-4 border-t border-bright-blue/20">
              <div className="flex justify-center">
                <Button
                  onClick={suggestBestModel}
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  data-testid="button-sugerir-modelo"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Sugerir Melhor Modelo para este Tema
                </Button>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Modelos Disponíveis - UNIFICADO */}
          <LiquidGlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-blue">
                2. Selecione um Modelo
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                  {predefinedStructures.length} predefinidos
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {structures.length} personalizadas
                </Badge>
              </div>
            </div>

            {/* Busca integrada */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-soft-gray" />
                <Input
                  placeholder="Buscar estruturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-buscar-estruturas"
                />
              </div>
            </div>

            {/* Modelos Predefinidos */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-dark-blue mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs text-emerald-600">P</span>
                Modelos Predefinidos Coringa
              </h3>
              
              {predefinedStructures.filter(structure =>
                structure.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="text-center py-6 text-soft-gray">
                  <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum modelo predefinido encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedStructures.filter(structure =>
                    structure.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((structure) => (
                    <Card 
                      key={structure.id}
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        selectedStructure?.id === structure.id 
                          ? 'ring-2 ring-bright-blue bg-bright-blue/5 border-bright-blue' 
                          : suggestedStructure?.id === structure.id
                          ? 'ring-2 ring-emerald-500 bg-emerald-50/50 border-emerald-300'
                          : 'hover:bg-gray-50 border-emerald-200'
                      }`}
                      onClick={() => setSelectedStructure(structure)}
                      data-testid={`card-estrutura-${structure.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base text-dark-blue">
                            {structure.name}
                            {suggestedStructure?.id === structure.id && (
                              <Badge variant="outline" className="ml-2 text-xs text-emerald-600 border-emerald-600">
                                ✨ Sugerido
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                            </Badge>
                            {structure.userId === 'system' && 'guide' in structure && structure.guide && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-bright-blue hover:bg-bright-blue/10"
                                    onClick={(e) => e.stopPropagation()}
                                    data-testid={`button-guide-${structure.id}`}
                                  >
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-dark-blue">
                                      Guia de Uso: {structure.name}
                                    </DialogTitle>
                                  </DialogHeader>

                                  {structure.guide && (
                                    <div className="space-y-6">
                                      {/* Quando Usar */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-emerald-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2 text-sm">✓</span>
                                          Quando Usar
                                        </h3>
                                        <ul className="space-y-2">
                                          {structure.guide.whenToUse.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                              <span className="text-emerald-500 mt-1">•</span>
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Quando NÃO Usar */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 text-sm">✗</span>
                                          Quando NÃO Usar
                                        </h3>
                                        <ul className="space-y-2">
                                          {structure.guide.whenNotToUse.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                              <span className="text-red-500 mt-1">•</span>
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Vantagens */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-blue-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-sm">⭐</span>
                                          Vantagens
                                        </h3>
                                        <ul className="space-y-2">
                                          {structure.guide.advantages.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                              <span className="text-blue-500 mt-1">•</span>
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Estrutura do Modelo */}
                                      <div>
                                        <h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center">
                                          <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-sm">📝</span>
                                          Estrutura do Modelo
                                        </h3>
                                        <div className="grid gap-3">
                                          {Array.isArray(structure.sections) && (structure.sections as Section[]).map((section, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                                              <h4 className="font-semibold text-gray-800 mb-2">
                                                {section.title}
                                              </h4>
                                              <p className="text-sm text-gray-600 mb-2">
                                                {section.description}
                                              </p>
                                              {section.guidelines && (
                                                <p className="text-xs text-gray-500 italic">
                                                  {section.guidelines}
                                                </p>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-xs">
                          Modelo predefinido com guia de uso
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="text-sm text-soft-gray">
                          {Array.isArray(structure.sections) && structure.sections.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(structure.sections as Section[]).slice(0, 2).map((section, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {section.title || `Seção ${index + 1}`}
                                </Badge>
                              ))}
                              {structure.sections.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{structure.sections.length - 2} mais
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Estruturas Personalizadas */}
            {structures.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-dark-blue mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600">U</span>
                  Suas Estruturas Personalizadas
                </h3>
                
                {structures.filter(structure =>
                  structure.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 ? (
                  <div className="text-center py-6 text-soft-gray">
                    <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchTerm ? 'Nenhuma estrutura personalizada encontrada' : 'Crie suas estruturas na página "Criar Estrutura"'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {structures.filter(structure =>
                      structure.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((structure) => (
                      <Card 
                        key={structure.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                          selectedStructure?.id === structure.id 
                            ? 'ring-2 ring-bright-blue bg-bright-blue/5 border-bright-blue' 
                            : 'hover:bg-gray-50 border-blue-200'
                        }`}
                        onClick={() => setSelectedStructure(structure)}
                        data-testid={`card-estrutura-user-${structure.id}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base text-dark-blue">
                              {structure.name}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {Array.isArray(structure.sections) ? structure.sections.length : 0} seções
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            Criada em {new Date(structure.createdAt!).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="text-sm text-soft-gray">
                            {Array.isArray(structure.sections) && structure.sections.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {(structure.sections as Section[]).slice(0, 2).map((section, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {section.title || `Seção ${index + 1}`}
                                  </Badge>
                                ))}
                                {structure.sections.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{structure.sections.length - 2} mais
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </LiquidGlassCard>

          {/* Estrutura Selecionada - Segunda linha */}
          {selectedStructure && (
            <LiquidGlassCard>
              <div className="flex items-start justify-between gap-6">
                {/* Informações da estrutura */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-dark-blue">
                      {selectedStructure.name}
                    </h2>
                    <Badge variant="secondary">
                      {Array.isArray(selectedStructure.sections) ? selectedStructure.sections.length : 0} seções
                    </Badge>
                    {selectedStructure.userId === 'system' && (
                      <Badge variant="outline" className="text-bright-blue border-bright-blue">
                        Modelo Predefinido
                      </Badge>
                    )}
                  </div>
                  
                  {/* Preview das seções */}
                  <div className="space-y-2">
                    {Array.isArray(selectedStructure.sections) && selectedStructure.sections.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(selectedStructure.sections as Section[]).map((section, index) => (
                          <div key={index} className="p-3 bg-bright-blue/5 rounded-lg border border-bright-blue/20">
                            <h4 className="font-medium text-dark-blue text-sm">
                              {section.title || `Seção ${index + 1}`}
                            </h4>
                            <p className="text-xs text-soft-gray mt-1 line-clamp-2">
                              {section.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  {selectedPredefinedStructure?.guide && (
                    <Button
                      variant="outline"
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {}}
                      data-testid="button-view-guide"
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Ver Guia de Uso
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-bright-blue text-bright-blue hover:bg-bright-blue/10"
                    onClick={() => {
                      setEditingStructure(selectedStructure);
                      setEditedStructure({ ...selectedStructure });
                    }}
                    data-testid="button-editar-estrutura"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Editar Estrutura
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          )}

          {/* Botão de Geração - SEMPRE VISÍVEL NO FINAL */}
          <LiquidGlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-5 w-5 text-bright-blue" />
              <h3 className="text-lg font-semibold text-dark-blue">
                3. Gerar Redação
              </h3>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-soft-gray mb-4">
                {selectedStructure 
                  ? `✅ Gerar redação com: ${selectedStructure.name}` 
                  : '⚠️ Selecione um modelo ou use a estrutura padrão'
                }
              </p>
              <Button
                onClick={handleGenerateEssay}
                disabled={!essayTopic.trim() || isGenerating}
                className="bg-bright-blue hover:bg-blue-600 px-8 py-3 text-lg"
                data-testid="button-gerar-redacao"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                {isGenerating ? "Gerando Redação..." : "Gerar Redação com IA"}
              </Button>
            </div>
          </LiquidGlassCard>


          {/* Modal de Edição */}
          {editingStructure && editedStructure && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-dark-blue">
                    Editar Estrutura
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingStructure(null);
                      setEditedStructure(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-dark-blue font-medium">Nome da Estrutura</Label>
                    <Input
                      value={editedStructure.name}
                      onChange={(e) => setEditedStructure({
                        ...editedStructure,
                        name: e.target.value
                      })}
                      placeholder="Nome da estrutura"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-dark-blue font-medium">Seções</Label>
                    <div className="space-y-3 mt-2">
                      {Array.isArray(editedStructure.sections) && (editedStructure.sections as Section[]).map((section, index) => (
                        <div key={index} className="p-3 border border-bright-blue/20 rounded-lg">
                          <Input
                            value={section.title || ''}
                            onChange={(e) => {
                              const newSections = [...(editedStructure.sections as Section[])];
                              newSections[index] = { ...section, title: e.target.value };
                              setEditedStructure({ ...editedStructure, sections: newSections });
                            }}
                            placeholder="Título da seção"
                            className="mb-2"
                          />
                          <Textarea
                            value={section.description || ''}
                            onChange={(e) => {
                              const newSections = [...(editedStructure.sections as Section[])];
                              newSections[index] = { ...section, description: e.target.value };
                              setEditedStructure({ ...editedStructure, sections: newSections });
                            }}
                            placeholder="Descrição da seção"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingStructure(null);
                      setEditedStructure(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (editedStructure && onSaveStructure) {
                        const structureToSave = {
                          ...editedStructure,
                          id: editingStructure.id === 'example-1' ? `user-${Date.now()}` : editedStructure.id,
                          updatedAt: new Date()
                        };
                        onSaveStructure(structureToSave);
                        setSelectedStructure(structureToSave);
                        toast({
                          title: "Estrutura salva!",
                          description: "Sua estrutura foi salva em 'Suas Estruturas'."
                        });
                      }
                      setEditingStructure(null);
                      setEditedStructure(null);
                    }}
                    className="bg-bright-blue hover:bg-blue-600"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Estrutura
                  </Button>
                </div>
              </div>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}