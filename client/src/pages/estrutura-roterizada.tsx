import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, FileEdit, BookOpen, Brain, Lightbulb, Target, Settings2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { AIUsageProgress } from "@/components/ai-usage-progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { essayOutlineQuestionnaireSchema, type EssayOutlineQuestionnaire } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export function EstruturaRoterizada() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  const backUrl = fromPage === 'functionalities' ? '/functionalities' : '/dashboard';

  const form = useForm<EssayOutlineQuestionnaire>({
    resolver: zodResolver(essayOutlineQuestionnaireSchema),
    defaultValues: {
      proposal: "",
      familiarityLevel: undefined,
      problemsAndChallenges: "",
      knownReferences: {
        hasReferences: false,
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

  const onSubmit = async (data: EssayOutlineQuestionnaire) => {
    console.log("Dados do questionário:", data);
    toast({
      title: "Roteiro em processamento",
      description: "Estamos criando seu roteiro personalizado...",
    });
  };

  const hasReferences = form.watch("knownReferences.hasReferences");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Header Sticky - Estilo Controlador de Escrita */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 supports-[backdrop-filter]:bg-white/60">
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
              <div className="w-8 h-8 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center flex-shrink-0">
                <FileEdit className="text-white" size={14} />
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
                <div className="w-12 h-12 bg-gradient-to-br from-dark-blue to-soft-gray rounded-full flex items-center justify-center">
                  <FileEdit className="text-white" size={20} />
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
      <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Question 1: Proposta da redação */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={24} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-1">
                      Proposta da redação
                    </h3>
                    <p className="text-sm text-soft-gray">
                      Cole ou descreva o tema da redação que você precisa desenvolver
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="proposal"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Os desafios para a valorização de comunidades e povos tradicionais no Brasil"
                            className="min-h-[120px] resize-none"
                            data-testid="textarea-proposal"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Question 2: Nível de familiaridade */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="text-white" size={24} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-1">
                      Qual o seu nível de familiaridade com a proposta?
                    </h3>
                    <p className="text-sm text-soft-gray">
                      Isso nos ajuda a personalizar o roteiro para o seu conhecimento
                    </p>
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
                            className="space-y-3"
                            data-testid="radiogroup-familiarity"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                              <RadioGroupItem value="never-studied" id="never-studied" data-testid="radio-never-studied" />
                              <label
                                htmlFor="never-studied"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-never-studied"
                              >
                                Nunca estudei esse assunto
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                              <RadioGroupItem value="know-little" id="know-little" data-testid="radio-know-little" />
                              <label
                                htmlFor="know-little"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-know-little"
                              >
                                Conheço um pouco
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
                              <RadioGroupItem value="studied-can-develop" id="studied-can-develop" data-testid="radio-studied-can-develop" />
                              <label
                                htmlFor="studied-can-develop"
                                className="text-sm font-medium leading-none cursor-pointer flex-1"
                                data-testid="label-familiarity-studied-can-develop"
                              >
                                Já estudei e sei desenvolver
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
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
              </div>
            </LiquidGlassCard>

            {/* Question 3: Problemas e desafios */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-white" size={24} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-1">
                      Problemas, causas e desafios
                    </h3>
                    <p className="text-sm text-soft-gray">
                      Quais seriam os principais pontos ligados a esse tema que você acha importante destacar e sua solução?
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="problemsAndChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Falta de políticas públicas efetivas, invisibilidade social, conflitos territoriais..."
                            className="min-h-[120px] resize-none"
                            data-testid="textarea-problems"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Question 4: Autores e conceitos conhecidos */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="text-white" size={24} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-1">
                      Repertório que você conhece
                    </h3>
                    <p className="text-sm text-soft-gray">
                      Quais autores, conceitos, obras, estatísticas ou exemplos você já conhece que podem se conectar a essa proposta?
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="knownReferences.hasReferences"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-has-references"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer" data-testid="label-checkbox-has-references">
                            Possuo repertório sobre este tema
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
                              className="min-h-[100px] resize-none"
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
              </div>
            </LiquidGlassCard>

            {/* Question 5: Nível de detalhamento */}
            <LiquidGlassCard className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings2 className="text-white" size={24} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-1">
                      Nível de detalhamento do roteiro desejado
                    </h3>
                    <p className="text-sm text-soft-gray">
                      Escolha como prefere receber o roteiro da sua redação
                    </p>
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
                            className="space-y-3"
                            data-testid="radiogroup-detail-level"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
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
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors">
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
            </LiquidGlassCard>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-dark-blue to-bright-blue hover:from-dark-blue/90 hover:to-bright-blue/90 text-white px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="button-generate-outline"
              >
                <CheckCircle2 className="mr-2" size={20} />
                Gerar Roteiro Personalizado
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
