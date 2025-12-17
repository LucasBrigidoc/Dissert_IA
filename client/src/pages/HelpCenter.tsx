import { Link } from "wouter";
import { ArrowLeft, BookOpen, MessageCircle, Mail, CreditCard, Settings, Sparkles, FileText, Shield, HelpCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function HelpCenter() {
  const categories = [
    {
      icon: BookOpen,
      title: "Primeiros Passos",
      description: "Aprenda como usar o DissertIA pela primeira vez",
      articles: [
        { title: "Como criar sua conta", content: "Acesse a página inicial e clique em 'Criar Conta'. Preencha seus dados e confirme seu email." },
        { title: "Escrevendo sua primeira redação", content: "No painel, clique em 'Nova Redação', escolha um tema e comece a escrever. A IA irá analisar seu texto em tempo real." },
        { title: "Entendendo o painel de controle", content: "O painel mostra suas redações recentes, estatísticas de progresso e acesso rápido às ferramentas de escrita." },
        { title: "Configurando seu perfil", content: "Acesse 'Configurações' para personalizar seu perfil, definir metas de estudo e preferências de notificação." }
      ]
    },
    {
      icon: Sparkles,
      title: "Ferramentas de IA",
      description: "Tudo sobre o assistente de redação inteligente",
      articles: [
        { title: "Como funciona a correção automática", content: "Nossa IA analisa sua redação baseada nas 5 competências do ENEM, oferecendo feedback detalhado em cada aspecto." },
        { title: "Análise de repertório sociocultural", content: "A IA identifica e avalia suas referências culturais, sugerindo melhorias e citações relevantes para seu argumento." },
        { title: "Feedback em tempo real", content: "Enquanto você escreve, a IA destaca problemas de gramática, coesão e argumentação instantaneamente." },
        { title: "Sugestões de melhoria personalizadas", content: "Receba dicas específicas baseadas no seu histórico de redações e pontos que precisam de mais atenção." }
      ]
    },
    {
      icon: FileText,
      title: "Competências do ENEM",
      description: "Entenda cada competência avaliada",
      articles: [
        { title: "Competência 1: Norma culta", content: "Avalia o domínio da modalidade escrita formal da língua portuguesa, incluindo ortografia, acentuação e pontuação." },
        { title: "Competência 2: Tema e gênero", content: "Verifica a compreensão da proposta de redação e aplicação de conceitos de diversas áreas do conhecimento." },
        { title: "Competência 3: Argumentação", content: "Analisa a seleção, organização e interpretação de informações para defender seu ponto de vista." },
        { title: "Competência 4: Coesão textual", content: "Avalia o uso de mecanismos linguísticos para construir a argumentação de forma conectada." },
        { title: "Competência 5: Proposta de intervenção", content: "Verifica a elaboração de proposta detalhada, respeitando os direitos humanos." }
      ]
    },
    {
      icon: CreditCard,
      title: "Planos e Pagamentos",
      description: "Informações sobre assinaturas e cobrança",
      articles: [
        { title: "Comparando os planos disponíveis", content: "Oferecemos planos Gratuito, Básico e Premium com diferentes quantidades de redações e recursos exclusivos." },
        { title: "Como fazer upgrade do plano", content: "Acesse 'Minha Assinatura' nas configurações e escolha o novo plano. A cobrança é proporcional." },
        { title: "Formas de pagamento aceitas", content: "Aceitamos cartões de crédito, débito, Pix e boleto bancário para sua comodidade." },
        { title: "Política de reembolso", content: "Oferecemos reembolso integral em até 7 dias após a compra, sem perguntas." }
      ]
    },
    {
      icon: Settings,
      title: "Conta e Configurações",
      description: "Gerencie sua conta e preferências",
      articles: [
        { title: "Alterando dados pessoais", content: "Acesse 'Configurações > Perfil' para atualizar nome, email e outras informações pessoais." },
        { title: "Redefinindo sua senha", content: "Use a opção 'Esqueci minha senha' na tela de login ou altere em 'Configurações > Segurança'." },
        { title: "Gerenciando notificações", content: "Configure quais emails deseja receber: newsletter, dicas de estudo, lembretes e novidades." },
        { title: "Excluindo sua conta", content: "Você pode excluir sua conta em 'Configurações > Conta'. Todos os dados serão removidos permanentemente." }
      ]
    },
    {
      icon: Shield,
      title: "Privacidade e Segurança",
      description: "Proteção dos seus dados e redações",
      articles: [
        { title: "Como protegemos seus dados", content: "Utilizamos criptografia de ponta a ponta e servidores seguros para proteger todas as suas informações." },
        { title: "Política de privacidade", content: "Seus dados nunca são compartilhados com terceiros. Leia nossa política completa para mais detalhes." },
        { title: "Suas redações são privadas", content: "Apenas você tem acesso às suas redações. Nem nossa equipe pode visualizar seu conteúdo." },
        { title: "Autenticação em duas etapas", content: "Ative a verificação em duas etapas para adicionar uma camada extra de segurança à sua conta." }
      ]
    }
  ];

  const popularQuestions = [
    {
      question: "Como funciona a correção automática de redações?",
      answer: "O DissertIA utiliza inteligência artificial avançada baseada nas 5 competências do ENEM para analisar sua redação. A IA avalia gramática, coesão, coerência, estrutura argumentativa, uso de repertório sociocultural e proposta de intervenção. Você recebe uma nota estimada de 0 a 1000, com feedback detalhado em cada competência e sugestões específicas de melhoria."
    },
    {
      question: "Quantas redações posso escrever por mês?",
      answer: "O número de redações depende do seu plano: o plano Gratuito permite 3 redações por mês com feedback básico, o plano Básico (R$29,90/mês) permite 15 redações com análise completa, e o plano Premium (R$49,90/mês) oferece redações ilimitadas, análise aprofundada de repertório e acesso à newsletter exclusiva com temas prováveis."
    },
    {
      question: "A IA substitui um professor de redação?",
      answer: "A IA do DissertIA é uma ferramenta complementar poderosa que oferece feedback instantâneo e consistente. Ela ajuda você a praticar mais e identificar pontos de melhoria rapidamente. No entanto, recomendamos combinar o uso da plataforma com orientação de professores quando possível, especialmente para desenvolver seu estilo próprio de escrita."
    },
    {
      question: "Como funciona a newsletter com temas prováveis?",
      answer: "Assinantes do plano Premium recebem semanalmente uma newsletter exclusiva com análise de notícias atuais, temas prováveis para vestibulares e concursos, dicas de repertório sociocultural e exercícios práticos. Nossa equipe analisa tendências e eventos relevantes para mantê-lo preparado para qualquer tema."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim! Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta, sem multas ou burocracia. O acesso aos recursos premium permanecerá ativo até o final do período já pago. Suas redações e histórico ficam salvos mesmo após o cancelamento."
    },
    {
      question: "Como a IA analisa o repertório sociocultural?",
      answer: "Nossa IA identifica referências a filósofos, autores, eventos históricos, dados estatísticos e outras fontes que você utiliza. Ela avalia a pertinência dessas referências ao tema, a profundidade da análise e sugere citações e repertórios adicionais que poderiam fortalecer sua argumentação."
    },
    {
      question: "Minhas redações ficam salvas na plataforma?",
      answer: "Sim! Todas as suas redações são salvas automaticamente na nuvem, organizadas por data. Você pode acessar seu histórico completo, revisar feedbacks anteriores e acompanhar sua evolução ao longo do tempo através de gráficos e estatísticas detalhadas."
    },
    {
      question: "O DissertIA funciona para outros vestibulares além do ENEM?",
      answer: "Sim! Embora a análise principal seja baseada nas competências do ENEM (que são similares às de muitos vestibulares), nossa IA também oferece feedback sobre estrutura dissertativa-argumentativa, que é o formato mais comum em vestibulares e concursos públicos no Brasil."
    }
  ];

  const quickLinks = [
    { icon: FileText, title: "Começar a praticar", description: "Veja nossos planos", href: "/pricing" },
    { icon: CreditCard, title: "Ver Planos", description: "Compare recursos e preços", href: "/pricing" },
    { icon: HelpCircle, title: "FAQ Completo", description: "Todas as perguntas frequentes", href: "/faq" },
    { icon: Mail, title: "Contato", description: "Fale com nossa equipe", href: "mailto:suporte@dissertia.com" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bright-blue/10 to-white dark:from-bright-blue/5 dark:to-gray-900">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-bright-blue hover:text-bright-blue/80 smooth-transition" data-testid="link-back-home">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar para Início</span>
          </Link>
        </div>
      </header>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy dark:text-white mb-4">
            Central de Ajuda
          </h1>
          <p className="text-lg text-deep-navy/70 dark:text-white/70 mb-8 max-w-2xl mx-auto">
            Encontre respostas rápidas para suas dúvidas sobre o DissertIA. Explore nossos guias, tutoriais e perguntas frequentes.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href}>
                <Button variant="outline" className="gap-2" data-testid={`button-quick-${index}`}>
                  <link.icon className="h-4 w-4" />
                  {link.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-white mb-8 text-center">
            Categorias de Ajuda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg smooth-transition" data-testid={`card-category-${index}`}>
                <CardHeader>
                  <category.icon className="h-10 w-10 text-bright-blue mb-3" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.articles.map((article, idx) => (
                      <AccordionItem key={idx} value={`${index}-${idx}`} className="border-b-0">
                        <AccordionTrigger className="text-sm text-left py-2 hover:no-underline" data-testid={`accordion-cat-${index}-${idx}`}>
                          <span className="text-bright-blue hover:text-bright-blue/80">{article.title}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-deep-navy/70 dark:text-white/70 pb-3">
                          {article.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-bright-blue" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>As dúvidas mais comuns de nossos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {popularQuestions.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left" data-testid={`accordion-faq-${index}`}>
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-deep-navy/70 dark:text-white/70" data-testid={`accordion-content-${index}`}>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 border-bright-blue/20">
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-deep-navy dark:text-white mb-2">
                  Dica para maximizar seus resultados
                </h3>
                <p className="text-deep-navy/70 dark:text-white/70 max-w-2xl mx-auto mb-4">
                  Para evoluir mais rápido, recomendamos escrever pelo menos 2 redações por semana. Use o feedback da IA para identificar seus pontos fracos e foque em melhorá-los gradualmente. Leia os artigos da nossa newsletter para expandir seu repertório sociocultural.
                </p>
                <Link href="/pricing">
                  <Button className="bg-bright-blue text-white" data-testid="button-tip-cta">
                    Conhecer Planos
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-bright-blue/5 dark:bg-bright-blue/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-white mb-4">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-deep-navy/70 dark:text-white/70 mb-6 max-w-xl mx-auto">
            Nossa equipe de suporte está disponível para ajudar você. Responderemos em até 24 horas úteis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:suporte@dissertia.com"
              className="inline-flex items-center justify-center gap-2 bg-bright-blue text-white px-6 py-3 rounded-lg hover:bg-bright-blue/90 smooth-transition"
              data-testid="button-contact-email"
            >
              <Mail className="h-5 w-5" />
              suporte@dissertia.com
            </a>
            <Link href="/faq">
              <Button variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-view-faq">
                <HelpCircle className="h-5 w-5" />
                Ver FAQ Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
