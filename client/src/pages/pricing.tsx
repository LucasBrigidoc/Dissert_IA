import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { mockPricingPlans, mockFAQ } from "@/lib/mock-data";
import { Check, X } from "lucide-react";
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
      
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4" data-testid="text-pricing-title">
            Escolha o Plano Ideal para Você:
          </h1>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <div className="flex items-center">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`relative px-6 py-3 rounded-full transition-all duration-300 text-sm font-semibold ${
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
                  className={`relative px-6 py-3 rounded-full transition-all duration-300 text-sm font-semibold ${
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16">
          {mockPricingPlans.map((plan, index) => (
            <LiquidGlassCard 
              key={plan.id} 
              dark={plan.id === "free" || plan.id === "pro"}
              className={`relative p-8 ${
                plan.popular 
                  ? "border-2 border-bright-blue shadow-xl scale-105 transform" 
                  : "border border-gray-200/30"
              }`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-bright-blue text-white px-4 py-1 text-sm font-bold" data-testid="badge-most-popular">
                    MAIS PROCURADO
                  </Badge>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-2 ${plan.id === "free" || plan.id === "pro" ? "text-white" : "text-dark-blue"}`}>
                  {plan.id === "base" && isAnnual 
                    ? "R$39,90" 
                    : plan.id === "pro" && isAnnual 
                    ? "R$49,90" 
                    : plan.price}
                  {plan.period && <span className="text-xl">{plan.period}</span>}
                </div>
                {plan.annualPrice && isAnnual && (
                  <div className={`text-lg mb-2 ${plan.id === "free" || plan.id === "pro" ? "text-white/80" : "text-soft-gray"}`}>
                    {plan.annualPrice}
                  </div>
                )}
                <h3 className={`text-xl font-bold ${plan.id === "free" || plan.id === "pro" ? "text-white" : "text-dark-blue"}`}>
                  {plan.name}
                </h3>
              </div>
              
              <ul className="space-y-3 mb-8 min-h-[160px]">
                {plan.features.map((feature, featureIndex) => {
                  const hasFeature = !feature.includes("limitado") && !feature.includes("limitada");
                  return (
                    <li key={featureIndex} className={`flex items-start text-sm ${plan.id === "free" || plan.id === "pro" ? "text-white" : "text-dark-blue"}`}>
                      <div className="mr-3 mt-0.5">
                        {hasFeature ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
                className={`w-full py-4 rounded-xl font-bold text-base smooth-transition hover-scale ${
                  plan.popular
                    ? "bg-bright-blue text-white hover:bg-blue-600 shadow-lg"
                    : plan.id === "free" 
                      ? "bg-transparent text-white border-2 border-white/50 hover:bg-white/10" 
                      : "bg-bright-blue text-white hover:bg-blue-600"
                }`}
                data-testid={`button-plan-${plan.id}`}
              >
                <Link href={plan.id === "free" ? "/signup" : "/signup"}>
                  {plan.buttonText}
                </Link>
              </Button>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8" data-testid="text-comparison-title">
            Comparação Detalhada dos Planos
          </h3>
          <LiquidGlassCard className="p-0 overflow-hidden border border-white/20" data-testid="table-comparison">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gradient-to-r from-bright-blue to-blue-600">
                  <tr>
                    <th className="p-4 sm:p-6 text-left text-base sm:text-lg font-bold text-white border-r border-white/20">
                      Recursos e Funcionalidades
                    </th>
                    <th className="p-4 sm:p-6 text-center text-base sm:text-lg font-bold text-white border-r border-white/20">
                      <div className="flex flex-col items-center">
                        <span>Gratuito</span>
                        <span className="text-sm font-normal text-white/80 mt-1">R$0</span>
                      </div>
                    </th>
                    <th className="p-4 sm:p-6 text-center text-base sm:text-lg font-bold text-white border-r border-white/20 bg-yellow-500/20">
                      <div className="flex flex-col items-center">
                        <span>Base</span>
                        <span className="text-sm font-normal text-white/80 mt-1">R$45,90/mês</span>
                        <Badge className="bg-yellow-500 text-yellow-900 text-xs mt-1 px-2 py-0.5">POPULAR</Badge>
                      </div>
                    </th>
                    <th className="p-4 sm:p-6 text-center text-base sm:text-lg font-bold text-white">
                      <div className="flex flex-col items-center">
                        <span>Pro</span>
                        <span className="text-sm font-normal text-white/80 mt-1">R$59,90/mês</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/95 backdrop-blur-sm">
                  <tr className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Acesso à Newsletter Educacional
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Dashboard e Cronograma de Estudos
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Biblioteca Pessoal
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-xs px-2 py-1">
                          Limitada
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Acesso às Funcionalidades
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-xs px-2 py-1">
                          Limitado
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-bright-blue text-white text-xs px-2 py-1">
                          Completo
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-bright-blue text-white text-xs px-2 py-1">
                          Completo
                        </Badge>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Resposta Aprofundada da IA
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="text-red-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200/50 hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Limite de Uso das Funcionalidades
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-xs px-2 py-1">
                          Básico
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-bright-blue text-white text-xs px-2 py-1">
                          Maior
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-green-600 text-white text-xs px-2 py-1">
                          Máximo
                        </Badge>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="p-4 sm:p-6 text-sm sm:text-base font-medium text-dark-blue border-r border-gray-200/50">
                      Material Complementar Exclusivo
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="text-red-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center border-r border-gray-200/50 bg-yellow-50/50">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <X className="text-red-600" size={16} />
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <Check className="text-green-600" size={16} />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </LiquidGlassCard>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12" id="faq">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8" data-testid="text-faq-title">
            Seção de Perguntas Frequentes (FAQ):
          </h3>
          <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
            {mockFAQ.map((faq) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                <LiquidGlassCard className="p-0">
                  <AccordionTrigger className="px-6 py-4 font-semibold text-dark-blue hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-soft-gray text-sm">
                    {faq.answer}
                  </AccordionContent>
                </LiquidGlassCard>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center">
          <Button
            asChild
            className="bg-white text-dark-blue px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 smooth-transition hover-scale"
            data-testid="button-ready-start"
          >
            <Link href="/signup">Pronto para Começar?</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
