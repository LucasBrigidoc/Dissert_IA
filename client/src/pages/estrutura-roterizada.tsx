import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Edit, BookOpen, Brain, Lightbulb, Target, Settings2, CheckCircle2, AlertTriangle, Sparkles, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { AIUsageProgress, refreshAIUsageStats } from "@/components/ai-usage-progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { essayOutlineQuestionnaireSchema, type EssayOutlineQuestionnaire } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";

export function EstruturaRoterizada() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [generatedOutline, setGeneratedOutline] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [lastQuestionnaire, setLastQuestionnaire] = useState<EssayOutlineQuestionnaire | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  const form = useForm<EssayOutlineQuestionnaire>({
    resolver: zodResolver(essayOutlineQuestionnaireSchema),
    defaultValues: {
      proposal: "",
      familiarityLevel: undefined,
      problemsAndChallenges: {
        dontKnow: false,
        text: "",
      },
      knownReferences: {
        hasReferences: true,
        references: "",
      },
      detailLevel: undefined,
    },
  });

  // Garantir que a página sempre abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    navigate(backUrl);
  };

  const generateOutlineMutation = useMutation({
    mutationFn: async (data: EssayOutlineQuestionnaire) => {
      const response = await apiRequest("/api/generate-outline", {
        method: "POST",
        body: data,
      });
      return { outline: response.outline, questionnaireData: data };
    },
    onSuccess: (data) => {
      setGeneratedOutline(data.outline);
      setLastQuestionnaire(data.questionnaireData);
      toast({
        title: "Roteiro gerado com sucesso!",
        description: "Seu roteiro personalizado está pronto.",
      });
      
      // Atualizar barra de progresso de IA após uso de tokens
      refreshAIUsageStats();
      
      // Scroll to outline
      setTimeout(() => {
        document.getElementById('generated-outline')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar roteiro",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const saveOutlineMutation = useMutation({
    mutationFn: async (data: { title: string }) => {
      if (!generatedOutline || !lastQuestionnaire) throw new Error("Nenhum roteiro para salvar");
      
      const response = await apiRequest("/api/saved-outlines", {
        method: "POST",
        body: {
          title: data.title,
          proposalTitle: lastQuestionnaire.proposal.substring(0, 200),
          proposalStatement: lastQuestionnaire.proposal,
          outlineData: generatedOutline,
        },
      });
      return response;
    },
    onSuccess: () => {
      setShowSaveDialog(false);
      setSaveTitle("");
      toast({
        title: "Roteiro salvo!",
        description: "Seu roteiro foi salvo na biblioteca com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar roteiro",
        description: error.message || "Não foi possível salvar o roteiro.",
      });
    },
  });

  const handleSaveOutline = () => {
    if (!saveTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Título obrigatório",
        description: "Por favor, digite um título para o roteiro.",
      });
      return;
    }
    saveOutlineMutation.mutate({ title: saveTitle });
  };

  const handleDownloadPDF = () => {
    if (!generatedOutline) return;

    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Cores do DissertIA
    const brightBlue = [80, 135, 255]; // #5087ff
    const softGray = [107, 114, 128]; // #6b7280
    const darkBlue = [5, 8, 53]; // hsl(243 82% 11%)
    const greenAccent = [34, 197, 94];
    const purpleAccent = [168, 85, 247];
    const amberAccent = [245, 158, 11];
    const blueAccent = [59, 130, 246];

    // Header com gradiente visual
    doc.setFillColor(brightBlue[0], brightBlue[1], brightBlue[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Logo DissertIA - Quadrado branco com borda
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, yPosition - 2, 10, 10, 1.5, 1.5, 'F');
    
    // Texto DISSERTIA com fonte Times
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("DISSERT", margin + 13, yPosition + 6);
    
    doc.setFontSize(22);
    doc.text("IA", margin + 13 + doc.getTextWidth("DISSERT"), yPosition + 6);
    
    // Subtítulo no header
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    const headerSubtitle = "Roteiro Personalizado";
    doc.text(headerSubtitle, pageWidth - margin - doc.getTextWidth(headerSubtitle), yPosition + 6);
    
    yPosition = 45;

    // Análise da Proposta - Seção com borda lateral colorida
    doc.setDrawColor(blueAccent[0], blueAccent[1], blueAccent[2]);
    doc.setLineWidth(3);
    doc.line(margin - 5, yPosition, margin - 5, yPosition + 8);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(blueAccent[0], blueAccent[1], blueAccent[2]);
    doc.text("ANALISE DA PROPOSTA", margin, yPosition + 6);
    yPosition += 15;

    // Fundo cinza claro para conteúdo
    const proposalLines = doc.splitTextToSize(generatedOutline.proposta, maxWidth - 6);
    const proposalHeight = proposalLines.length * 5 + 12;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin - 2, yPosition - 5, maxWidth + 4, proposalHeight, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.text("Proposta:", margin, yPosition);
    yPosition += 6;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(proposalLines, margin, yPosition);
    yPosition += proposalLines.length * 5 + 8;

    if (generatedOutline.palavrasChave && generatedOutline.palavrasChave.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      doc.text("Palavras-chave:", margin, yPosition);
      yPosition += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(brightBlue[0], brightBlue[1], brightBlue[2]);
      const keywordsText = generatedOutline.palavrasChave.join(" | ");
      const keywordsLines = doc.splitTextToSize(keywordsText, maxWidth - 6);
      doc.text(keywordsLines, margin + 3, yPosition);
      yPosition += keywordsLines.length * 5 + 5;
    }

    if (generatedOutline.categoriaTematica) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
      doc.text("Categoria Tematica:", margin, yPosition);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text(generatedOutline.categoriaTematica, margin + doc.getTextWidth("Categoria Tematica: ") + 2, yPosition);
      yPosition += 10;
    }

    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Análise de Ideias
    const invalidPhrases = ['não forneceu', 'não possui', 'não conhece', 'não sabe', 'não tem', 'usuário não'];
    const hasValidRepertorio = generatedOutline.analiseRepertorio && 
      !invalidPhrases.some(phrase => generatedOutline.analiseRepertorio.toLowerCase().includes(phrase));
    const hasValidProblemas = generatedOutline.analiseProblemas && 
      !invalidPhrases.some(phrase => generatedOutline.analiseProblemas.toLowerCase().includes(phrase));

    if (hasValidRepertorio || hasValidProblemas) {
      // Borda lateral colorida
      doc.setDrawColor(blueAccent[0], blueAccent[1], blueAccent[2]);
      doc.setLineWidth(3);
      doc.line(margin - 5, yPosition, margin - 5, yPosition + 8);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(blueAccent[0], blueAccent[1], blueAccent[2]);
      doc.text("ANALISE DE SUAS IDEIAS", margin, yPosition + 6);
      yPosition += 15;

      doc.setFontSize(10);

      if (hasValidRepertorio) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        doc.text("Sobre os Repertorios:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const repertorioLines = doc.splitTextToSize(generatedOutline.analiseRepertorio, maxWidth - 6);
        doc.text(repertorioLines, margin + 3, yPosition);
        yPosition += repertorioLines.length * 5 + 8;
      }

      if (hasValidProblemas) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        doc.text("Sobre os Problemas/Argumentos:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const problemasLines = doc.splitTextToSize(generatedOutline.analiseProblemas, maxWidth - 6);
        doc.text(problemasLines, margin + 3, yPosition);
        yPosition += problemasLines.length * 5 + 8;
      }
    }

    // Repertórios Sugeridos
    if (generatedOutline.repertoriosSugeridos && generatedOutline.repertoriosSugeridos.length > 0) {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }

      // Borda lateral verde
      doc.setDrawColor(greenAccent[0], greenAccent[1], greenAccent[2]);
      doc.setLineWidth(3);
      doc.line(margin - 5, yPosition, margin - 5, yPosition + 8);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
      doc.text("REPERTORIOS SUGERIDOS", margin, yPosition + 6);
      yPosition += 15;

      doc.setFontSize(10);
      generatedOutline.repertoriosSugeridos.forEach((rep: any, idx: number) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Número com fundo colorido
        doc.setFillColor(greenAccent[0], greenAccent[1], greenAccent[2]);
        doc.circle(margin + 3, yPosition - 2, 3.5, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text((idx + 1).toString(), margin + (idx + 1 > 9 ? 1.5 : 2.2), yPosition);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
        doc.text(rep.titulo, margin + 9, yPosition);
        yPosition += 5;
        
        doc.setTextColor(greenAccent[0], greenAccent[1], greenAccent[2]);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(`(${rep.tipo})`, margin + 9, yPosition);
        yPosition += 6;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const relacaoLines = doc.splitTextToSize(`Como usar: ${rep.relacao}`, maxWidth - 12);
        doc.text(relacaoLines, margin + 9, yPosition);
        yPosition += relacaoLines.length * 5 + 6;
      });
    }

    // Roteiro em 4 Blocos com cores e design profissional
    const sections = [
      { title: "1 PARAGRAFO - INTRODUCAO", shortTitle: "Introducao", data: generatedOutline.introducao, color: blueAccent, number: "1" },
      { title: "2 PARAGRAFO - 1 DESENVOLVIMENTO", shortTitle: "1 Desenvolvimento", data: generatedOutline.desenvolvimento1, color: purpleAccent, number: "2" },
      { title: "3 PARAGRAFO - 2 DESENVOLVIMENTO", shortTitle: "2 Desenvolvimento", data: generatedOutline.desenvolvimento2, color: amberAccent, number: "3" },
      { title: "4 PARAGRAFO - CONCLUSAO", shortTitle: "Conclusao", data: generatedOutline.conclusao, color: greenAccent, number: "4" }
    ];

    sections.forEach((section) => {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      // Barra lateral colorida
      doc.setDrawColor(section.color[0], section.color[1], section.color[2]);
      doc.setLineWidth(3);
      doc.line(margin - 5, yPosition, margin - 5, yPosition + 8);
      
      // Número circular grande
      doc.setFillColor(section.color[0], section.color[1], section.color[2]);
      doc.circle(margin + 5, yPosition + 4, 5, 'F');
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(section.number, margin + 3.2, yPosition + 6.5);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(section.color[0], section.color[1], section.color[2]);
      doc.text(section.title, margin + 14, yPosition + 6);
      yPosition += 16;

      doc.setFontSize(10);

      if (section.data?.frase1) {
        // Fundo cinza para a frase
        const frase1Lines = doc.splitTextToSize(section.data.frase1, maxWidth - 10);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(margin - 1, yPosition - 4, maxWidth + 2, frase1Lines.length * 5 + 8, 1.5, 1.5, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.text("1a frase:", margin + 2, yPosition);
        yPosition += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(frase1Lines, margin + 2, yPosition);
        yPosition += frase1Lines.length * 5 + 8;
      }

      if (section.data?.frase2) {
        const frase2Lines = doc.splitTextToSize(section.data.frase2, maxWidth - 10);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(margin - 1, yPosition - 4, maxWidth + 2, frase2Lines.length * 5 + 8, 1.5, 1.5, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.text("2a frase:", margin + 2, yPosition);
        yPosition += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(frase2Lines, margin + 2, yPosition);
        yPosition += frase2Lines.length * 5 + 8;
      }

      if (section.data?.frase3) {
        const frase3Lines = doc.splitTextToSize(section.data.frase3, maxWidth - 10);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(margin - 1, yPosition - 4, maxWidth + 2, frase3Lines.length * 5 + 8, 1.5, 1.5, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(section.color[0], section.color[1], section.color[2]);
        doc.text("3a frase:", margin + 2, yPosition);
        yPosition += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(frase3Lines, margin + 2, yPosition);
        yPosition += frase3Lines.length * 5 + 10;
      }
    });

    // Salvar o PDF
    doc.save("roteiro-personalizado.pdf");
    
    toast({
      title: "PDF baixado!",
      description: "Seu roteiro foi baixado com sucesso.",
    });
  };

  const onSubmit = async (data: EssayOutlineQuestionnaire) => {
    generateOutlineMutation.mutate(data);
  };

  const hasReferences = form.watch("knownReferences.hasReferences");
  const knowsProblems = !form.watch("problemsAndChallenges.dontKnow");
  const selectedFamiliarity = form.watch("familiarityLevel");
  const proposalText = form.watch("proposal");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Sticky */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 h-8 px-2 text-xs"
              data-testid="button-back"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Edit className="text-white" size={14} />
              </div>
              <h1 className="text-sm font-bold text-dark-blue truncate">Estrutura Roterizada</h1>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-back"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center">
                  <Edit className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold text-dark-blue">Estrutura Roterizada</h1>
              </div>
            </div>
            <p className="text-soft-gray">Sistema inteligente de roteirização de redações</p>
          </div>
        </div>
        
        {/* AI Usage Progress - Integrado no header */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
            <AIUsageProgress variant="inline" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 py-4 pt-32">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Questionário em um único card - Estilo Simulador */}
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                  <Target className="text-white" size={14} />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue">Questionário de Roteirização</h3>
              </div>

              <div className="space-y-8">
                {/* Question 1: Proposta da redação */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="text-white" size={14} />
                    </div>
                    <label className="block text-sm font-medium text-dark-blue">
                      Proposta da redação
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="proposal"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Os desafios para a valorização de comunidades e povos tradicionais no Brasil"
                            className="min-h-[100px] resize-none border-bright-blue/20"
                            data-testid="textarea-proposal"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Question 2: Nível de familiaridade */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="text-white" size={14} />
                    </div>
                    <label className="block text-sm font-medium text-dark-blue">
                      Qual o seu nível de familiaridade com a proposta?
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="familiarityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                            data-testid="radiogroup-familiarity"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-blue-50/50 transition-colors border border-bright-blue/10">
                              <RadioGroupItem value="never-studied" id="never-studied" data-testid="radio-never-studied" />
                              <label
                                htmlFor="never-studied"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-never-studied"
                              >
                                Nunca estudei esse assunto
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-blue-50/50 transition-colors border border-bright-blue/10">
                              <RadioGroupItem value="know-little" id="know-little" data-testid="radio-know-little" />
                              <label
                                htmlFor="know-little"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-know-little"
                              >
                                Conheço um pouco
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-blue-50/50 transition-colors border border-bright-blue/10">
                              <RadioGroupItem value="studied-can-develop" id="studied-can-develop" data-testid="radio-studied-can-develop" />
                              <label
                                htmlFor="studied-can-develop"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-studied-can-develop"
                              >
                                Já estudei e sei desenvolver
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-blue-50/50 transition-colors border border-bright-blue/10">
                              <RadioGroupItem value="advanced-mastery" id="advanced-mastery" data-testid="radio-advanced-mastery" />
                              <label
                                htmlFor="advanced-mastery"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-advanced-mastery"
                              >
                                Tenho domínio avançado
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Question 3: Problemas e desafios */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="text-white" size={14} />
                    </div>
                    <label className="block text-sm font-medium text-dark-blue">
                      Quais seriam os principais problemas, causas ou desafios ligados a esse tema que você acha importante destacar e sua solução?
                    </label>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="problemsAndChallenges.dontKnow"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3 p-3 rounded-lg bg-white/50 border border-bright-blue/10">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-dont-know-problems"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer text-sm font-medium" data-testid="label-checkbox-dont-know-problems">
                            Não conheço problemas ou desafios relacionados a este tema
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {knowsProblems && (
                    <FormField
                      control={form.control}
                      name="problemsAndChallenges.text"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Falta de políticas públicas efetivas, invisibilidade social, conflitos territoriais..."
                              className="min-h-[100px] resize-none border-bright-blue/20"
                              data-testid="textarea-problems"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Question 4: Autores e conceitos conhecidos */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="text-white" size={14} />
                    </div>
                    <label className="block text-sm font-medium text-dark-blue">
                      Quais autores, conceitos, obras, estatísticas ou exemplos você já conhece que podem se conectar a essa proposta?
                    </label>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="knownReferences.hasReferences"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3 p-3 rounded-lg bg-white/50 border border-bright-blue/10">
                        <FormControl>
                          <Checkbox
                            checked={!field.value}
                            onCheckedChange={(checked) => field.onChange(!checked)}
                            data-testid="checkbox-no-references"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer text-sm font-medium" data-testid="label-checkbox-no-references">
                            Não possuo repertório sobre este tema
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {hasReferences && (
                    <FormField
                      control={form.control}
                      name="knownReferences.references"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Darcy Ribeiro (O Povo Brasileiro), Ailton Krenak, dados do IBGE sobre povos indígenas..."
                              className="min-h-[80px] resize-none border-bright-blue/20"
                              data-testid="textarea-references"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Question 5: Nível de detalhamento */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-bright-blue to-dark-blue rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings2 className="text-white" size={14} />
                    </div>
                    <label className="block text-sm font-medium text-dark-blue">
                      Nível de detalhamento do roteiro desejado
                    </label>
                  </div>
                  <FormField
                    control={form.control}
                    name="detailLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                            data-testid="radiogroup-detail-level"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-blue-50/50 transition-colors border border-bright-blue/10">
                              <RadioGroupItem value="step-by-step" id="step-by-step" data-testid="radio-step-by-step" />
                              <label
                                htmlFor="step-by-step"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-detail-step-by-step"
                              >
                                Estrutura passo a passo
                                <span className="block text-xs text-soft-gray font-normal mt-1">
                                  Roteiro detalhado com cada etapa bem explicada
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 hover:bg-blue-50/50 transition-colors border border-bright-blue/10">
                              <RadioGroupItem value="general-directions" id="general-directions" data-testid="radio-general-directions" />
                              <label
                                htmlFor="general-directions"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-detail-general-directions"
                              >
                                Apenas direções gerais
                                <span className="block text-xs text-soft-gray font-normal mt-1">
                                  Orientações principais sem tantos detalhes
                                </span>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8 pt-6 border-t border-bright-blue/20">
                <Button
                  type="submit"
                  size="lg"
                  disabled={generateOutlineMutation.isPending}
                  className="bg-gradient-to-r from-dark-blue to-bright-blue hover:from-dark-blue/90 hover:to-bright-blue/90 text-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  data-testid="button-generate-outline"
                >
                  {generateOutlineMutation.isPending ? (
                    <>
                      <Sparkles className="mr-2 animate-spin" size={20} />
                      Gerando Roteiro...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2" size={20} />
                      Gerar Roteiro Personalizado
                    </>
                  )}
                </Button>
              </div>
            </LiquidGlassCard>
          </form>
        </Form>

        {/* Generated Outline Display */}
        {generatedOutline && (
          <div id="generated-outline" className="mt-8">
            <LiquidGlassCard className="bg-gradient-to-br from-green-50/50 to-blue-50/50 border-green-200/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <h3 className="text-2xl font-bold text-dark-blue">Roteiro Personalizado</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="bg-white hover:bg-green-50 border-green-300"
                    data-testid="button-download-pdf"
                  >
                    <Download className="mr-2" size={16} />
                    Baixar PDF
                  </Button>
                  <Button
                    onClick={() => setShowSaveDialog(true)}
                    variant="outline"
                    className="bg-white hover:bg-blue-50 border-blue-300"
                    data-testid="button-save-outline"
                  >
                    <Save className="mr-2" size={16} />
                    Salvar na Biblioteca
                  </Button>
                </div>
              </div>

              {/* Análise da Proposta */}
              <div className="mb-8 p-4 bg-white/60 rounded-xl border border-bright-blue/20">
                <h4 className="text-lg font-semibold text-dark-blue mb-4">📋 Análise da Proposta</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-soft-gray mb-1">Proposta:</p>
                    <p className="text-dark-blue">{generatedOutline.proposta}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-soft-gray mb-1">Palavras-chave obrigatórias:</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedOutline.palavrasChave?.map((palavra: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-bright-blue/10 text-bright-blue rounded-full text-sm font-medium">
                          {palavra}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-soft-gray mb-1">Categoria Temática:</p>
                    <p className="text-dark-blue capitalize">{generatedOutline.categoriaTematica}</p>
                  </div>
                  {generatedOutline.alertasRisco && generatedOutline.alertasRisco.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-soft-gray mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" />
                        Alertas de Risco:
                      </p>
                      <ul className="space-y-1">
                        {generatedOutline.alertasRisco.map((alerta: string, idx: number) => (
                          <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{alerta}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Explicação do Tema adaptada ao nível de familiaridade */}
              {generatedOutline.explicacaoTema && (
                <div className="mb-8 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-300/40">
                  <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <Lightbulb className="text-blue-600" size={20} />
                    Entendendo o Tema
                  </h4>
                  <p className="text-sm text-soft-gray leading-relaxed">
                    {generatedOutline.explicacaoTema}
                  </p>
                </div>
              )}

              {/* Análise Crítica das Ideias do Usuário */}
              {(() => {
                const invalidPhrases = ['não forneceu', 'não possui', 'não conhece', 'não sabe', 'não tem', 'usuário não'];
                const hasValidRepertorio = generatedOutline.analiseRepertorio && 
                  !invalidPhrases.some(phrase => generatedOutline.analiseRepertorio.toLowerCase().includes(phrase));
                const hasValidProblemas = generatedOutline.analiseProblemas && 
                  !invalidPhrases.some(phrase => generatedOutline.analiseProblemas.toLowerCase().includes(phrase));
                
                return (hasValidRepertorio || hasValidProblemas) && (
                  <div className="mb-8 p-4 bg-blue-50/60 rounded-xl border border-blue-300/30">
                    <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                      <span className="text-blue-600">🔍</span>
                      Análise de suas Ideias
                    </h4>
                    <div className="space-y-3">
                      {hasValidRepertorio && (
                        <div className="p-3 bg-white/70 rounded-lg border border-blue-200/40">
                          <p className="text-sm font-semibold text-dark-blue mb-1 flex items-center gap-2">
                            <span className="text-blue-500">📚</span>
                            Sobre os Repertórios:
                          </p>
                          <p className="text-sm text-soft-gray">{generatedOutline.analiseRepertorio}</p>
                        </div>
                      )}
                      {hasValidProblemas && (
                        <div className="p-3 bg-white/70 rounded-lg border border-blue-200/40">
                          <p className="text-sm font-semibold text-dark-blue mb-1 flex items-center gap-2">
                            <span className="text-blue-500">💭</span>
                            Sobre os Problemas/Argumentos:
                          </p>
                          <p className="text-sm text-soft-gray">{generatedOutline.analiseProblemas}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Repertórios Sugeridos */}
              {generatedOutline.repertoriosSugeridos && generatedOutline.repertoriosSugeridos.length > 0 && (
                <div className="mb-8 p-4 bg-white/60 rounded-xl border border-emerald-200/50">
                  <h4 className="text-lg font-semibold text-dark-blue mb-4 flex items-center gap-2">
                    <span className="text-emerald-600">💡</span>
                    Repertórios Sugeridos
                  </h4>
                  <div className="space-y-4">
                    {generatedOutline.repertoriosSugeridos.map((repertorio: any, idx: number) => (
                      <div key={idx} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/30">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-dark-blue">{repertorio.titulo}</p>
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 rounded text-xs">
                                {repertorio.tipo}
                              </span>
                            </div>
                            <p className="text-sm text-soft-gray">
                              <strong className="text-dark-blue">Como usar:</strong> {repertorio.relacao}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roteiro em 4 Blocos */}
              <div className="space-y-6">
                {/* Introdução */}
                <div className="p-4 bg-white/60 rounded-xl border border-blue-200/50">
                  <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm">1</span>
                    1º Parágrafo - Introdução
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
                      <p className="text-xs font-medium text-blue-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Contextualização com repertório sociocultural que apresente o tema</p>
                      <p className="text-dark-blue"><strong>1ª frase:</strong> {generatedOutline.introducao?.frase1}</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
                      <p className="text-xs font-medium text-blue-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Apresentação do problema ou desafio central do tema</p>
                      <p className="text-dark-blue"><strong>2ª frase:</strong> {generatedOutline.introducao?.frase2}</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/30">
                      <p className="text-xs font-medium text-blue-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Tese com os dois argumentos que serão desenvolvidos</p>
                      <p className="text-dark-blue"><strong>3ª frase:</strong> {generatedOutline.introducao?.frase3}</p>
                    </div>
                  </div>
                </div>

                {/* 1º Desenvolvimento */}
                <div className="p-4 bg-white/60 rounded-xl border border-purple-200/50">
                  <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-sm">2</span>
                    2º Parágrafo - 1º Desenvolvimento
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/30">
                      <p className="text-xs font-medium text-purple-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Tópico frasal apresentando o primeiro argumento</p>
                      <p className="text-dark-blue"><strong>1ª frase:</strong> {generatedOutline.desenvolvimento1?.frase1}</p>
                    </div>
                    <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/30">
                      <p className="text-xs font-medium text-purple-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Repertório legitimado (dados, citações, fatos) que comprove o argumento</p>
                      <p className="text-dark-blue"><strong>2ª frase:</strong> {generatedOutline.desenvolvimento1?.frase2}</p>
                    </div>
                    <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/30">
                      <p className="text-xs font-medium text-purple-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Análise crítica conectando o repertório ao tema e mostrando as consequências</p>
                      <p className="text-dark-blue"><strong>3ª frase:</strong> {generatedOutline.desenvolvimento1?.frase3}</p>
                    </div>
                  </div>
                </div>

                {/* 2º Desenvolvimento */}
                <div className="p-4 bg-white/60 rounded-xl border border-amber-200/50">
                  <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-amber-500 text-white rounded-full text-sm">3</span>
                    3º Parágrafo - 2º Desenvolvimento
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
                      <p className="text-xs font-medium text-amber-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Tópico frasal apresentando o segundo argumento</p>
                      <p className="text-dark-blue"><strong>1ª frase:</strong> {generatedOutline.desenvolvimento2?.frase1}</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
                      <p className="text-xs font-medium text-amber-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Repertório legitimado (dados, citações, fatos) que comprove o argumento</p>
                      <p className="text-dark-blue"><strong>2ª frase:</strong> {generatedOutline.desenvolvimento2?.frase2}</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/30">
                      <p className="text-xs font-medium text-amber-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Análise crítica conectando o repertório ao tema e mostrando as consequências</p>
                      <p className="text-dark-blue"><strong>3ª frase:</strong> {generatedOutline.desenvolvimento2?.frase3}</p>
                    </div>
                  </div>
                </div>

                {/* Conclusão */}
                <div className="p-4 bg-white/60 rounded-xl border border-green-200/50">
                  <h4 className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-sm">4</span>
                    4º Parágrafo - Conclusão
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                      <p className="text-xs font-medium text-green-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Retomada da tese apresentada na introdução</p>
                      <p className="text-dark-blue"><strong>1ª frase:</strong> {generatedOutline.conclusao?.frase1}</p>
                    </div>
                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                      <p className="text-xs font-medium text-green-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Proposta de intervenção com agente + ação + meio/modo + finalidade</p>
                      <p className="text-dark-blue"><strong>2ª frase:</strong> {generatedOutline.conclusao?.frase2}</p>
                    </div>
                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                      <p className="text-xs font-medium text-green-600 mb-1">💡 O que deve ter:</p>
                      <p className="text-xs text-soft-gray mb-2">Detalhamento da proposta de intervenção (como será feito)</p>
                      <p className="text-dark-blue"><strong>3ª frase:</strong> {generatedOutline.conclusao?.frase3}</p>
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}
      </div>

      {/* Dialog para salvar roteiro */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent data-testid="dialog-save-outline">
          <DialogHeader>
            <DialogTitle>Salvar Roteiro na Biblioteca</DialogTitle>
            <DialogDescription>
              Digite um título para identificar este roteiro na sua biblioteca.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Ex: Roteiro - Valorização Povos Tradicionais"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              data-testid="input-outline-title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveOutline();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveTitle("");
              }}
              data-testid="button-cancel-save"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveOutline}
              disabled={saveOutlineMutation.isPending}
              data-testid="button-confirm-save"
            >
              {saveOutlineMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
