import { Link } from "wouter";
import { ArrowLeft, BookOpen, MessageCircle, Mail, CreditCard, Settings, Sparkles, FileText, Shield, HelpCircle, ChevronRight, PenTool, Target, Lightbulb, Library } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

export default function HelpCenter() {
  const categories = [
    {
      icon: Sparkles,
      title: "Ferramentas de IA",
      description: "Conheça todas as funcionalidades da plataforma",
      articles: [
        { 
          title: "Refinamento de Ideias", 
          content: "Uma conversa inteligente que transforma pensamentos desorganizados em argumentos estruturados. A IA faz perguntas estratégicas para organizar e desenvolver suas ideias antes de escrever. Ideal para a fase de planejamento da redação." 
        },
        { 
          title: "Explorador de Repertório", 
          content: "Encontre citações, dados estatísticos, referências históricas, filosóficas e culturais organizadas por tema. A IA busca repertórios relevantes para fortalecer sua argumentação em qualquer tema de redação." 
        },
        { 
          title: "Controlador de Escrita", 
          content: "Ajuste o tamanho, complexidade vocabular e estrutura do seu texto com controles interativos. Escolha entre estruturas de causa-consequência, comparação ou oposição. Ideal para refinar parágrafos específicos." 
        },
        { 
          title: "Estrutura Roterizada", 
          content: "Crie roteiros personalizados para sua redação respondendo a um questionário sobre o tema. A IA gera uma estrutura completa com introdução, desenvolvimentos e conclusão adaptados ao seu nível de conhecimento." 
        },
        { 
          title: "Simulador de Prova", 
          content: "Simule condições reais de prova com timer, propostas autênticas e ambiente focado. Ao finalizar, receba correção detalhada por competência do ENEM com nota estimada e feedback personalizado." 
        },
        { 
          title: "Gerador de Propostas", 
          content: "Acesse propostas de redação reais de vestibulares e concursos ou gere novas propostas personalizadas com temas atuais. Inclui textos motivadores no estilo de provas oficiais." 
        }
      ]
    },
    {
      icon: FileText,
      title: "Competências do ENEM",
      description: "Entenda o que os corretores avaliam na sua redação",
      articles: [
        { 
          title: "Competência 1: Norma Culta (0-200)", 
          content: "Avalia o domínio da escrita formal: ortografia, acentuação, pontuação, concordância verbal e nominal, regência e uso adequado do registro formal da língua portuguesa." 
        },
        { 
          title: "Competência 2: Tema e Gênero (0-200)", 
          content: "Avalia a compreensão da proposta de redação, o uso produtivo de repertório sociocultural e a manutenção do tipo textual dissertativo-argumentativo ao longo de todo o texto." 
        },
        { 
          title: "Competência 3: Argumentação (0-200)", 
          content: "Avalia a seleção, organização e interpretação de informações e argumentos para defender um ponto de vista, demonstrando autoria e conhecimento sobre o tema." 
        },
        { 
          title: "Competência 4: Coesão (0-200)", 
          content: "Avalia o uso de conectivos variados, referenciação adequada (pronomes, sinônimos) e articulação fluida entre parágrafos e ideias ao longo do texto." 
        },
        { 
          title: "Competência 5: Proposta de Intervenção (0-200)", 
          content: "Avalia a elaboração de proposta detalhada com os 5 elementos: Agente (quem), Ação (o quê), Modo/Meio (como), Efeito/Finalidade (para quê) e Detalhamento, respeitando os direitos humanos." 
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Planos e Preços",
      description: "Escolha o plano ideal para seus estudos",
      articles: [
        { 
          title: "Plano Gratuito (R$0)", 
          content: "Ideal para conhecer a plataforma. Inclui: acesso a funcionalidades básicas, newsletter educacional semanal, material complementar, dashboard personalizado, biblioteca pessoal limitada (20 arquivos) e uso limitado de IA (limite zera a cada 15 dias)." 
        },
        { 
          title: "Plano Pro Mensal (R$55/mês)", 
          content: "Para quem quer evoluir rápido. Inclui: todas as funcionalidades, IA avançada com correção por competência, Estrutura Roterizada, Repertório Inteligente com milhares de referências, Controlador de Escrita, Simulador completo, biblioteca ilimitada, suporte prioritário e limite de IA zera em 7 dias." 
        },
        { 
          title: "Plano Pro Anual (R$479,88/ano)", 
          content: "Melhor custo-benefício com 27% de economia. Inclui todos os recursos do Plano Pro Mensal por um ano completo. Equivale a R$39,99/mês - ideal para quem está se preparando para o próximo ENEM ou concurso." 
        },
        { 
          title: "Como assinar ou fazer upgrade", 
          content: "Acesse seu Dashboard, clique em 'Fazer Upgrade' e escolha seu plano. O pagamento é processado de forma segura pelo Stripe. O upgrade é instantâneo e você já pode usar todos os recursos imediatamente." 
        },
        { 
          title: "Cancelamento", 
          content: "Cancele a qualquer momento pelo seu Dashboard em 'Gerenciar Plano'. O cancelamento é imediato e você será rebaixado para o plano gratuito. Não há multas ou burocracia." 
        }
      ]
    },
    {
      icon: Library,
      title: "Biblioteca Pessoal",
      description: "Salve e organize seu material de estudo",
      articles: [
        { 
          title: "O que posso salvar na biblioteca?", 
          content: "Você pode salvar repertórios, propostas, textos modificados, roteiros de redação, ideias refinadas, simulados completos e redações corrigidas. Tudo fica organizado por categoria para fácil acesso." 
        },
        { 
          title: "Limite de arquivos no plano gratuito", 
          content: "Usuários do plano gratuito têm acesso aos 20 arquivos mais antigos da biblioteca. Arquivos excedentes ficam bloqueados até fazer upgrade para o Pro. Usuários Pro têm biblioteca ilimitada." 
        },
        { 
          title: "Exportar material", 
          content: "Você pode baixar roteiros em PDF, copiar textos e repertórios para usar offline. Seu material fica salvo na nuvem e disponível em qualquer dispositivo." 
        }
      ]
    },
    {
      icon: Target,
      title: "Acompanhamento de Evolução",
      description: "Monitore seu progresso rumo à nota 1000",
      articles: [
        { 
          title: "Dashboard personalizado", 
          content: "Visualize suas notas por competência, média geral, pontos a melhorar e gráfico de evolução. A IA identifica padrões nos seus erros e sugere onde focar seus estudos." 
        },
        { 
          title: "Registro de notas", 
          content: "Adicione notas de simulados externos, provas anteriores ou correções de professores. O sistema considera todas as fontes para calcular sua média e evolução real." 
        },
        { 
          title: "Metas personalizadas", 
          content: "Defina sua nota alvo e acompanhe o quanto falta para alcançá-la. O sistema mostra quanto você precisa melhorar em cada competência para atingir seu objetivo." 
        }
      ]
    },
    {
      icon: Settings,
      title: "Sua Conta",
      description: "Gerencie perfil, assinatura e preferências",
      articles: [
        { 
          title: "Criar conta", 
          content: "Cadastre-se com email e senha. Preencha seu nome e telefone (opcional) para facilitar o suporte. Sua conta é criada instantaneamente e você já pode começar a usar a plataforma." 
        },
        { 
          title: "Alterar dados do perfil", 
          content: "Acesse seu Dashboard e clique em 'Perfil' para atualizar nome, email e telefone. O telefone deve estar no formato brasileiro com DDD." 
        },
        { 
          title: "Recuperar senha", 
          content: "Na tela de login, clique em 'Esqueceu a senha?' e informe seu email. Você receberá um link para criar uma nova senha. O link expira em 1 hora por segurança." 
        },
        { 
          title: "Newsletter e notificações", 
          content: "Receba semanalmente nossa newsletter com temas prováveis, dicas de redação e repertórios atualizados. Acesse pelo menu 'Newsletter' no Dashboard." 
        }
      ]
    },
    {
      icon: Shield,
      title: "Privacidade e Segurança",
      description: "Seus dados e redações protegidos",
      articles: [
        { 
          title: "Suas redações são privadas", 
          content: "Apenas você tem acesso às suas redações e materiais salvos. Todo conteúdo é armazenado de forma segura e criptografada. Nossa equipe não tem acesso ao seu conteúdo." 
        },
        { 
          title: "Proteção de dados (LGPD)", 
          content: "Seguimos a Lei Geral de Proteção de Dados. Seus dados pessoais nunca são vendidos ou compartilhados com terceiros. Você pode solicitar exclusão completa a qualquer momento." 
        },
        { 
          title: "Pagamento seguro", 
          content: "Processamos pagamentos via Stripe, líder mundial em segurança de pagamentos. Nunca armazenamos dados do seu cartão de crédito em nossos servidores." 
        },
        { 
          title: "Exclusão de conta", 
          content: "Você pode solicitar a exclusão completa da sua conta e todos os dados associados entrando em contato pelo suporte. A exclusão é permanente e irreversível." 
        }
      ]
    }
  ];

  const popularQuestions = [
    {
      question: "O DissertIA realmente me ensina a escrever ou só corrige?",
      answer: "O DissertIA é uma plataforma completa de aprendizado! Além da correção detalhada por competência, você tem acesso ao Refinamento de Ideias (que te ajuda a pensar antes de escrever), Explorador de Repertório (para enriquecer seus argumentos), Estrutura Roterizada (roteiros personalizados) e Controlador de Escrita (para refinar seus parágrafos). A IA identifica seus pontos fracos e você evolui a cada redação."
    },
    {
      question: "Como funciona a correção com IA?",
      answer: "Você escreve sua redação no Simulador e nossa IA analisa nas 5 competências do ENEM. Em segundos, você recebe nota estimada de 0 a 1000, comentários detalhados em cada competência, pontos fortes, pontos a melhorar e sugestões específicas. Tudo fica salvo na sua biblioteca para revisão futura."
    },
    {
      question: "Qual a diferença entre o plano Gratuito e o Pro?",
      answer: "O plano Gratuito oferece acesso básico com limite de uso de IA que zera a cada 15 dias e biblioteca limitada a 20 arquivos. O plano Pro (R$55/mês ou R$479,88/ano) libera todas as funcionalidades, uso completo de IA com limite zerando em 7 dias, biblioteca ilimitada e suporte prioritário."
    },
    {
      question: "A IA pode me ajudar a encontrar repertório sociocultural?",
      answer: "Sim! O Explorador de Repertório busca citações de filósofos, dados estatísticos, referências históricas, literárias e culturais relevantes para qualquer tema. Você pode filtrar por tipo (citação, dado estatístico, exemplo histórico) e salvar os favoritos na sua biblioteca para usar em futuras redações."
    },
    {
      question: "Como funciona o Simulador de Prova?",
      answer: "O Simulador recria condições reais de vestibulares e concursos. Você escolhe o tipo de prova (ENEM, FUVEST, concursos), define o tempo, seleciona ou gera um tema, e escreve em ambiente focado com timer. Ao finalizar, recebe correção completa com nota por competência. Você também pode digitalizar uma redação manuscrita usando a câmera."
    },
    {
      question: "O DissertIA serve para concursos públicos?",
      answer: "Sim! A estrutura dissertativa-argumentativa e as competências avaliadas são similares em vestibulares e concursos. Você pode praticar com propostas específicas para ENEM, FUVEST, UNICAMP e concursos públicos federais. O Gerador de Propostas cria temas personalizados para qualquer tipo de prova."
    },
    {
      question: "Posso cancelar minha assinatura quando quiser?",
      answer: "Sim! Acesse 'Gerenciar Plano' no seu Dashboard e clique em 'Cancelar Assinatura'. O cancelamento é imediato, sem multas ou burocracia. Você será rebaixado para o plano gratuito e manterá acesso aos seus dados salvos."
    },
    {
      question: "Minhas redações e materiais ficam salvos?",
      answer: "Sim! Todas as suas redações, correções, repertórios salvos, roteiros e propostas ficam armazenados na sua Biblioteca Pessoal. Você pode acessar a qualquer momento, comparar sua evolução e revisar feedbacks anteriores. Usuários Pro têm biblioteca ilimitada."
    }
  ];

  const quickLinks = [
    { icon: PenTool, title: "Começar a Escrever", description: "Acesse o simulador", href: "/simulador" },
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
            Encontre respostas rápidas sobre como usar o DissertIA. Explore nossas ferramentas, planos e dicas para alcançar a nota 1000.
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
                  Para evoluir mais rápido, recomendamos escrever pelo menos 2 redações por semana no Simulador. Use o Refinamento de Ideias antes de escrever, explore o Repertório para enriquecer seus argumentos e analise o feedback da correção para identificar padrões. Leia a Newsletter semanal para se manter atualizado com temas prováveis!
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
