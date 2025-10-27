import { Link } from "wouter";
import { ArrowLeft, Search, BookOpen, MessageCircle, Mail, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpCenter() {
  const categories = [
    {
      icon: BookOpen,
      title: "Começando",
      description: "Aprenda como usar o DissertIA pela primeira vez",
      articles: ["Como criar sua primeira redação", "Entendendo as funcionalidades", "Configurando seu perfil"]
    },
    {
      icon: MessageCircle,
      title: "Redação com IA",
      description: "Tudo sobre o assistente de redação",
      articles: ["Como funciona a IA", "Dicas para melhores resultados", "Limitações e capacidades"]
    },
    {
      icon: Video,
      title: "Planos e Assinaturas",
      description: "Informações sobre planos e pagamentos",
      articles: ["Escolhendo o plano certo", "Como atualizar seu plano", "Política de reembolso"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bright-blue/10 to-white dark:from-bright-blue/5 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-bright-blue hover:text-bright-blue/80 smooth-transition" data-testid="link-back-home">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar para Início</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy dark:text-white mb-4">
            Como podemos ajudar?
          </h1>
          <p className="text-lg text-deep-navy/70 dark:text-white/70 mb-8 max-w-2xl mx-auto">
            Encontre respostas rápidas para suas dúvidas sobre o DissertIA
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-deep-navy/40 dark:text-white/40" />
            <Input
              placeholder="Pesquisar artigos de ajuda..."
              className="pl-12 h-12 text-base"
              data-testid="input-search-help"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg smooth-transition" data-testid={`card-category-${index}`}>
                <CardHeader>
                  <category.icon className="h-10 w-10 text-bright-blue mb-3" />
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx}>
                        <a href="#" className="text-sm text-bright-blue hover:underline" data-testid={`link-article-${index}-${idx}`}>
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Popular Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Populares</CardTitle>
              <CardDescription>As dúvidas mais comuns de nossos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger data-testid="accordion-trigger-1">
                    Como funciona a correção automática de redações?
                  </AccordionTrigger>
                  <AccordionContent data-testid="accordion-content-1">
                    O DissertIA utiliza inteligência artificial avançada para analisar sua redação em múltiplos aspectos: 
                    gramática, coesão, coerência, estrutura argumentativa e adequação ao tema. A IA fornece feedback 
                    detalhado e sugestões de melhoria em tempo real.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger data-testid="accordion-trigger-2">
                    Quantas redações posso criar por mês?
                  </AccordionTrigger>
                  <AccordionContent data-testid="accordion-content-2">
                    O número de redações depende do seu plano: o plano Gratuito permite 5 redações por mês, 
                    o plano Básico permite 20 redações, e o plano Premium oferece redações ilimitadas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger data-testid="accordion-trigger-3">
                    Posso cancelar minha assinatura a qualquer momento?
                  </AccordionTrigger>
                  <AccordionContent data-testid="accordion-content-3">
                    Sim! Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. 
                    O acesso permanecerá ativo até o final do período pago.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-bright-blue/5 dark:bg-bright-blue/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-white mb-4">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-deep-navy/70 dark:text-white/70 mb-6">
            Nossa equipe está pronta para ajudar você
          </p>
          <a
            href="mailto:suporte@dissertia.com"
            className="inline-flex items-center gap-2 bg-bright-blue text-white px-6 py-3 rounded-lg hover:bg-bright-blue/90 smooth-transition"
            data-testid="button-contact-support"
          >
            <Mail className="h-5 w-5" />
            Entrar em Contato
          </a>
        </div>
      </section>
    </div>
  );
}
