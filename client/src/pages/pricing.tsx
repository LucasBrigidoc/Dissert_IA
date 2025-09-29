import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { mockPricingPlans, mockFAQ } from "@/lib/mock-data";
import { Check, X, Mail, BarChart3, BookOpen, Settings, Brain, Gauge, Gift, Rocket } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      <div className="container mx-auto px-3 sm:px-6 pt-16 sm:pt-20 pb-6 sm:pb-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white sm:mb-3 mt-[10px] mb-[10px]" data-testid="text-pricing-title">
            Escolha o Plano Ideal para Você:
          </h1>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <div className="flex items-center">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`relative px-4 py-2 rounded-full transition-all duration-300 text-xs sm:text-sm font-semibold ${
                    !isAnnual 
                      ? "bg-bright-blue text-white shadow-lg" 
                      : "text-white/80 hover:text-white"
                  }`}
                  data-testid="button-monthly"
                >
                  Mensal
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`relative px-4 py-2 rounded-full transition-all duration-300 text-xs sm:text-sm font-semibold ${
                    isAnnual 
                      ? "bg-bright-blue text-white shadow-lg" 
                      : "text-white/80 hover:text-white"
                  }`}
                  data-testid="button-annual"
                >
                  Anual
                </button>
              </div>
            </div>
            <p className="text-white/70 text-xs sm:text-sm">
              No plano anual você paga menos mensalmente
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${mockPricingPlans.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12 justify-items-center`}>
            {mockPricingPlans.map((plan, index) => {
              const showMostPopular = plan.id === "pro" && isAnnual;
              return (
                <LiquidGlassCard 
                  key={plan.id} 
                  dark={plan.id === "free" || plan.id === "pro"}
                  className={`relative group w-full max-w-sm ${
                    plan.id === "pro"
                      ? "bg-gradient-to-br from-bright-blue/5 to-purple-500/5 p-4 sm:p-6 transition-all duration-300" 
                      : "border border-gray-200/30 p-4 sm:p-6"
                  }`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.id === "pro" && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-bright-blue via-purple-500 to-bright-blue rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                  {showMostPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-600 via-bright-blue to-indigo-600 text-white px-4 py-1.5 text-xs font-bold shadow-xl border-2 border-white/30" data-testid="badge-most-popular">
                        ⭐ MAIS PROCURADO
                      </Badge>
                    </div>
                  )}
              
                  <div className="text-center mb-4 sm:mb-6">
                <div className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${
                  plan.id === "pro" 
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200" 
                    : plan.id === "free" 
                      ? "text-white" 
                      : "text-dark-blue"
                }`}>
                  {plan.id === "base" && isAnnual 
                    ? "R$39,90" 
                    : plan.id === "pro" && isAnnual 
                    ? "R$49,90" 
                    : plan.price}
                  {plan.period && <span className="text-sm sm:text-lg">{plan.period}</span>}
                </div>
                {plan.annualPrice && isAnnual && (
                  <div className={`text-sm sm:text-base mb-1 sm:mb-2 ${plan.id === "free" || plan.id === "pro" ? "text-white/80" : "text-soft-gray"}`}>
                    {plan.annualPrice}
                  </div>
                )}
                <h3 className={`text-lg sm:text-xl font-bold ${plan.id === "free" || plan.id === "pro" ? "text-white" : "text-dark-blue"}`}>
                  {plan.id === "pro" && <span className="mr-2">⚡</span>}
                  {plan.name}
                  {plan.id === "pro" && <span className="ml-2 text-bright-blue">✨</span>}
                </h3>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 min-h-[120px] sm:min-h-[140px]">
                {plan.features.map((feature, featureIndex) => {
                  const hasFeature = plan.id === "pro" ? true : !feature.includes("limitado") && !feature.includes("limitada") && !feature.includes("mínimo");
                  return (
                    <li key={featureIndex} className={`flex items-start text-xs sm:text-sm ${
                      plan.id === "pro" 
                        ? "text-white font-medium" 
                        : plan.id === "free" 
                          ? "text-white" 
                          : "text-dark-blue"
                    }`}>
                      <div className="mr-3 mt-0.5">
                        {hasFeature ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.id === "pro" 
                              ? "bg-gradient-to-br from-bright-blue to-purple-500 shadow-lg shadow-bright-blue/50 ring-2 ring-bright-blue/30" 
                              : "bg-green-500"
                          }`}>
                            <Check className="text-white" size={12} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="text-white" size={12} />
                          </div>
                        )}
                      </div>
                      <span className="flex-1">{feature}</span>
                    </li>
                  );
                })}
              </ul>
              
              <Button
                asChild
                className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base smooth-transition hover-scale relative overflow-hidden ${
                  plan.id === "pro"
                    ? "bg-gradient-to-r from-bright-blue to-purple-500 text-white hover:from-bright-blue hover:to-purple-600 shadow-xl shadow-bright-blue/30 border border-bright-blue/50"
                    : plan.id === "free" 
                      ? "bg-transparent text-white border-2 border-white/50 hover:bg-white/10" 
                      : "bg-bright-blue text-white hover:bg-blue-600"
                }`}
                data-testid={`button-plan-${plan.id}`}
              >
                <Link href={plan.id === "free" ? "/signup" : "/signup"}>
                  {plan.id === "pro" && <span className="mr-2">🚀</span>}
                  {plan.buttonText}
                  {plan.id === "pro" && <span className="ml-2">→</span>}
                </Link>
              </Button>
                </LiquidGlassCard>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-4 sm:mb-6" data-testid="text-comparison-title">
            Comparação Detalhada dos Planos
          </h3>
          <LiquidGlassCard className="p-0 overflow-hidden border-2 border-[#5087ff]/60" data-testid="table-comparison">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] sm:min-w-[600px]">
                <thead className="bg-gradient-to-r from-[#5087ff] to-[#4c7fff]">
                  <tr>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base font-bold text-white border-r border-white/30">
                      Recursos
                    </th>
                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-bold text-white border-r border-white/30">
                      <div className="flex flex-col items-center">
                        <span>Gratuito</span>
                        <span className="text-xs font-normal text-white/90 mt-1">R$0</span>
                      </div>
                    </th>
                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base font-bold text-white bg-gradient-to-b from-purple-500/20 to-violet-600/20">
                      <div className="flex flex-col items-center">
                        <span>Pro</span>
                        <span className="text-xs font-normal text-white/90 mt-1">R$59,90/mês</span>
                        {isAnnual && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs mt-1 px-2 py-0.5 font-bold shadow-lg">MAIS PROCURADO</Badge>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-b from-[#09072e]/95 to-[#0d0b3a]/95 backdrop-blur-sm">
                  <tr className="border-b border-[#5087ff]/40 hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Settings className="text-blue-400" size={16} />
                        <span className="hidden sm:inline">Acesso às Funcionalidades</span>
                        <span className="sm:hidden">Funcionalidades</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="text-orange-400 border-orange-400/60 bg-orange-500/20 text-xs px-1.5 py-0.5">
                          Básicas
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-gradient-to-r from-[#5087ff] to-blue-500 text-white text-xs px-1.5 py-0.5 shadow-md">
                          Completas
                        </Badge>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#5087ff]/40 hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Mail className="text-cyan-400" size={16} />
                        <span className="hidden sm:inline">Newsletter Educacional Semanal</span>
                        <span className="sm:hidden">Newsletter</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#5087ff]/40 hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <BarChart3 className="text-purple-400" size={16} />
                        <span className="hidden sm:inline">Dashboard Personalizado</span>
                        <span className="sm:hidden">Dashboard</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#5087ff]/40 hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <BookOpen className="text-pink-400" size={16} />
                        Biblioteca Pessoal
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="text-orange-400 border-orange-400/60 bg-orange-500/20 text-xs px-1.5 py-0.5">
                          Até 5 itens
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#5087ff]/40 hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Brain className="text-violet-400" size={16} />
                        <span className="hidden sm:inline">IA Avançada para Correção</span>
                        <span className="sm:hidden">IA Avançada</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-full">
                        <X className="text-red-400" size={14} />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-[#5087ff]/40 hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Gauge className="text-emerald-400" size={16} />
                        <span className="hidden sm:inline">Uso de IA por Dia</span>
                        <span className="sm:hidden">Uso IA</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="text-orange-400 border-orange-400/60 bg-orange-500/20 text-xs px-1.5 py-0.5">
                          3 por dia
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-1.5 py-0.5 shadow-md">
                          Ilimitado
                        </Badge>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#5087ff]/10 transition-all duration-300">
                    <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white border-r border-[#5087ff]/40">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Gift className="text-yellow-400" size={16} />
                        <span className="hidden sm:inline">Material Exclusivo + Suporte</span>
                        <span className="sm:hidden">Extras</span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center border-r border-[#5087ff]/40">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-full">
                        <X className="text-red-400" size={14} />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-full">
                        <Check className="text-green-400" size={14} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </LiquidGlassCard>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8" id="faq">
          <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-4 sm:mb-6" data-testid="text-faq-title">
            Perguntas Frequentes
          </h3>
          <LiquidGlassCard className="p-0 overflow-hidden border-2 border-[#5087ff]/60" data-testid="faq-container">
            <div className="bg-gradient-to-r from-[#5087ff] to-[#4c7fff] p-3 sm:p-4">
              <h4 className="text-sm sm:text-base font-bold text-white text-center">
                Tire todas suas dúvidas sobre os planos
              </h4>
            </div>
            <div className="bg-gradient-to-b from-[#09072e]/95 to-[#0d0b3a]/95 backdrop-blur-sm">
              <Accordion type="single" collapsible className="space-y-0" data-testid="accordion-faq">
                {mockFAQ.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border-0">
                    <div className={`${index < mockFAQ.length - 1 ? 'border-b border-[#5087ff]/40' : ''} hover:bg-[#5087ff]/10 transition-all duration-300`}>
                      <AccordionTrigger className="px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white hover:no-underline text-left">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-[#5087ff] to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{faq.id}</span>
                          </div>
                          <span className="text-sm sm:text-base">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 text-white/90 text-xs sm:text-sm leading-relaxed">
                        <div className="ml-7 sm:ml-9 pl-2 border-l-2 border-[#5087ff]/30">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </LiquidGlassCard>
        </div>

        <div className="flex justify-center">
          <Button
            className="bg-gradient-to-r from-[#5087ff] to-[#4c7fff] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold hover:from-[#4c7fff] hover:to-[#4570e6] smooth-transition hover-scale shadow-lg flex items-center gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-testid="button-ready-start"
          >
            <Rocket className="w-4 h-4" />
            Pronto para Começar?
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
