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
          <div className="flex items-center justify-center">
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
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8" data-testid="text-comparison-title">
            Comparação entre os Planos:
          </h3>
          <LiquidGlassCard className="p-0 overflow-hidden" data-testid="table-comparison">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-bright-blue text-white">
                  <tr>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Funcionalidade</th>
                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base">Gratuito</th>
                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base">Base</th>
                    <th className="p-3 sm:p-4 text-center text-sm sm:text-base">Pro</th>
                  </tr>
                </thead>
                <tbody className="text-dark-blue">
                  <tr className="border-b border-gray-200">
                    <td className="p-3 sm:p-4 text-sm sm:text-base">Arquiteto de Argumentos</td>
                    <td className="p-3 sm:p-4 text-center text-sm sm:text-base">Limitado</td>
                    <td className="p-3 sm:p-4 text-center text-sm sm:text-base">Completo</td>
                    <td className="p-3 sm:p-4 text-center text-sm sm:text-base">Completo</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-3 sm:p-4 text-sm sm:text-base">Explorador de Repertório</td>
                    <td className="p-3 sm:p-4 text-center text-sm sm:text-base">Limitado</td>
                    <td className="p-3 sm:p-4 text-center text-sm sm:text-base">Completo</td>
                    <td className="p-3 sm:p-4 text-center text-sm sm:text-base">Completo</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-3 sm:p-4 text-sm sm:text-base">Dashboard com IA</td>
                    <td className="p-3 sm:p-4 text-center text-red-500">❌</td>
                    <td className="p-3 sm:p-4 text-center text-red-500">❌</td>
                    <td className="p-3 sm:p-4 text-center text-green-500">✅</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-3 sm:p-4 text-sm sm:text-base">Material Complementar</td>
                    <td className="p-3 sm:p-4 text-center text-red-500">❌</td>
                    <td className="p-3 sm:p-4 text-center text-red-500">❌</td>
                    <td className="p-3 sm:p-4 text-center text-green-500">✅</td>
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
