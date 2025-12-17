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
      title: "Aprenda a Escrever",
      description: "Domine a arte da redação dissertativa-argumentativa",
      articles: [
        { title: "Estrutura da redação perfeita", content: "Aprenda a construir introdução com contextualização e tese, desenvolvimento com argumentos sólidos e conclusão com proposta de intervenção completa." },
        { title: "Como desenvolver argumentos", content: "Use nossa IA para aprender técnicas de argumentação: causa e consequência, comparação, exemplificação e citação de autoridades." },
        { title: "Repertório sociocultural", content: "Acesse nossa base de repertórios organizados por tema: filosofia, sociologia, história, literatura e atualidades para enriquecer seus textos." },
        { title: "Proposta de intervenção nota 200", content: "Domine os 5 elementos obrigatórios: agente, ação, meio, detalhamento e finalidade respeitando os direitos humanos." }
      ]
    },
    {
      icon: Sparkles,
      title: "Ferramentas de IA",
      description: "Tecnologia avançada para acelerar seu aprendizado",
      articles: [
        { title: "Correção inteligente em segundos", content: "Nossa IA analisa sua redação nas 5 competências do ENEM, identificando pontos fortes e fracos com feedback detalhado e nota estimada de 0 a 1000." },
        { title: "Sugestões de repertório", content: "A IA sugere citações, dados estatísticos e referências culturais relevantes para fortalecer sua argumentação em qualquer tema." },
        { title: "Análise de coesão e coerência", content: "Identifique problemas de conexão entre parágrafos, uso inadequado de conectivos e falhas na progressão de ideias." },
        { title: "Evolução personalizada", content: "Acompanhe seu progresso com gráficos e estatísticas. A IA identifica padrões de erro e sugere exercícios específicos para suas dificuldades." }
      ]
    },
    {
      icon: FileText,
      title: "Competências do ENEM",
      description: "Entenda o que os corretores avaliam",
      articles: [
        { title: "Competência 1: Norma culta (0-200)", content: "Domínio da escrita formal: ortografia, acentuação, pontuação, concordância, regência e uso adequado do registro formal." },
        { title: "Competência 2: Tema e gênero (0-200)", content: "Compreensão da proposta, uso de repertório sociocultural produtivo e manutenção do tipo textual dissertativo-argumentativo." },
        { title: "Competência 3: Argumentação (0-200)", content: "Seleção e organização de argumentos, interpretação de dados e informações para construir um projeto de texto autoral." },
        { title: "Competência 4: Coesão (0-200)", content: "Uso de conectivos variados, referenciação adequada e articulação entre parágrafos e ideias do texto." },
        { title: "Competência 5: Proposta (0-200)", content: "Elaboração de proposta de intervenção detalhada com agente, ação, meio, finalidade e detalhamento, respeitando os direitos humanos." }
      ]
    },
    {
      icon: CreditCard,
      title: "Planos e Preços",
      description: "Escolha o plano ideal para seus estudos",
      articles: [
        { title: "Plano Gratuito", content: "Ideal para conhecer a plataforma: 3 correções por mês, feedback básico nas 5 competências e acesso ao histórico de redações." },
        { title: "Plano Estudante (R$29,90/mês)", content: "Para quem quer praticar mais: 15 correções por mês, análise detalhada, sugestões de repertório e acompanhamento de evolução." },
        { title: "Plano Premium (R$49,90/mês)", content: "Preparação completa: correções ilimitadas, análise aprofundada de repertório, newsletter semanal com temas prováveis e suporte prioritário." },
        { title: "Como assinar ou fazer upgrade", content: "Acesse 'Minha Conta' e escolha seu plano. Pagamos via Pix, cartão de crédito ou boleto. Upgrade é instantâneo e proporcional." },
        { title: "Cancelamento e reembolso", content: "Cancele a qualquer momento sem multa. Oferecemos reembolso integral em até 7 dias após a primeira compra." }
      ]
    },
    {
      icon: Settings,
      title: "Sua Conta",
      description: "Gerencie perfil, assinatura e preferências",
      articles: [
        { title: "Criar e acessar sua conta", content: "Cadastre-se com email ou Google. Confirme seu email para ativar todos os recursos da plataforma." },
        { title: "Gerenciar assinatura", content: "Em 'Minha Conta' você pode ver seu plano atual, histórico de pagamentos, fazer upgrade ou cancelar a assinatura." },
        { title: "Alterar dados e senha", content: "Atualize nome, email e senha em 'Configurações'. Use senhas fortes com letras, números e símbolos." },
        { title: "Notificações e newsletter", content: "Configure alertas de correção, dicas semanais e nossa newsletter com temas prováveis e repertórios atualizados." }
      ]
    },
    {
      icon: Shield,
      title: "Privacidade e Segurança",
      description: "Seus dados e redações protegidos",
      articles: [
        { title: "Suas redações são privadas", content: "Apenas você tem acesso às suas redações. Nem nossa equipe pode visualizar seu conteúdo. Tudo é criptografado." },
        { title: "Proteção de dados (LGPD)", content: "Seguimos a Lei Geral de Proteção de Dados. Seus dados nunca são vendidos ou compartilhados com terceiros." },
        { title: "Pagamento seguro", content: "Processamos pagamentos via Stripe, líder mundial em segurança. Não armazenamos dados do seu cartão." },
        { title: "Exclusão de conta", content: "Você pode solicitar a exclusão completa da sua conta e todos os dados associados a qualquer momento." }
      ]
    }
  ];

  const popularQuestions = [
    {
      question: "O DissertIA realmente me ensina a escrever ou só corrige?",
      answer: "O DissertIA vai muito além da correção! Nossa plataforma é um sistema completo de aprendizado: você recebe feedback detalhado explicando por que errou, sugestões de como melhorar, exemplos de repertório sociocultural, técnicas de argumentação e acompanhamento da sua evolução. A IA identifica seus pontos fracos e sugere exercícios específicos para você melhorar."
    },
    {
      question: "Como funciona a correção com IA?",
      answer: "Você escreve sua redação na plataforma e nossa IA analisa em segundos, avaliando as 5 competências do ENEM (norma culta, tema, argumentação, coesão e proposta de intervenção). Você recebe nota estimada de 0 a 1000, comentários em cada parágrafo, sugestões de repertório e um plano de melhoria personalizado."
    },
    {
      question: "Quantas redações posso corrigir por mês?",
      answer: "Depende do seu plano: Gratuito tem 3 correções/mês com feedback básico, Estudante (R$29,90/mês) tem 15 correções com análise completa, e Premium (R$49,90/mês) tem correções ilimitadas, newsletter com temas prováveis e suporte prioritário."
    },
    {
      question: "A IA pode me ajudar a encontrar repertório sociocultural?",
      answer: "Sim! Essa é uma das funcionalidades mais poderosas do DissertIA. A IA sugere citações de filósofos, dados estatísticos, referências históricas e culturais relevantes para o tema da sua redação. Você aprende repertórios novos enquanto pratica e pode salvá-los para usar em futuras redações."
    },
    {
      question: "Como acompanho minha evolução?",
      answer: "Seu painel mostra gráficos de evolução por competência, histórico de notas, pontos que melhoraram e os que ainda precisam de atenção. A IA identifica padrões nos seus erros e cria um plano de estudos personalizado para você evoluir mais rápido."
    },
    {
      question: "O DissertIA serve para outros vestibulares além do ENEM?",
      answer: "Sim! A estrutura dissertativa-argumentativa e as competências avaliadas são similares na maioria dos vestibulares e concursos brasileiros (FUVEST, UNICAMP, UNESP, concursos públicos). Nossa análise se adapta e você pode praticar para qualquer prova."
    },
    {
      question: "Posso cancelar minha assinatura quando quiser?",
      answer: "Sim! Cancele a qualquer momento pelo seu painel, sem multas ou burocracia. O acesso continua até o fim do período pago. Oferecemos reembolso integral em até 7 dias após a primeira compra, sem perguntas."
    },
    {
      question: "Minhas redações ficam salvas?",
      answer: "Todas as suas redações, correções e feedbacks ficam salvos na nuvem para sempre. Você pode revisar textos antigos, comparar com os novos e ver exatamente o quanto evoluiu ao longo do tempo."
    }
  ];

  const quickLinks = [
    { icon: FileText, title: "Começar a praticar", description: "Crie sua conta", href: "/signup" },
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
              link.href.startsWith("mailto:") ? (
                <a key={index} href={link.href}>
                  <Button variant="outline" className="gap-2" data-testid={`button-quick-${index}`}>
                    <link.icon className="h-4 w-4" />
                    {link.title}
                  </Button>
                </a>
              ) : (
                <Link key={index} href={link.href}>
                  <Button variant="outline" className="gap-2" data-testid={`button-quick-${index}`}>
                    <link.icon className="h-4 w-4" />
                    {link.title}
                  </Button>
                </Link>
              )
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
