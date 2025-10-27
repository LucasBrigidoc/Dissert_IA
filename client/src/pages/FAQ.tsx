import { Link } from "wouter";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQ() {
  const faqCategories = [
    {
      category: "Geral",
      questions: [
        {
          question: "O que é o DissertIA?",
          answer: "O DissertIA é um assistente pessoal de redação com IA que ajuda estudantes a dominar a arte de escrever redações para vestibulares e concursos. Oferecemos correção automática, sugestões de melhoria e feedback personalizado."
        },
        {
          question: "Como funciona a inteligência artificial?",
          answer: "Nossa IA foi treinada em milhares de redações nota 1000 do ENEM e outros vestibulares. Ela analisa sua redação considerando critérios como gramática, coesão, coerência, adequação ao tema e estrutura argumentativa, fornecendo feedback detalhado e sugestões práticas."
        },
        {
          question: "O DissertIA substitui um professor?",
          answer: "Não. O DissertIA é uma ferramenta complementar que oferece prática ilimitada e feedback imediato. Recomendamos que você também trabalhe com professores para desenvolver suas habilidades de forma completa."
        }
      ]
    },
    {
      category: "Planos e Pagamentos",
      questions: [
        {
          question: "Quais são os planos disponíveis?",
          answer: "Oferecemos três planos: Gratuito (5 redações/mês), Básico (20 redações/mês por R$ 29,90) e Premium (redações ilimitadas + recursos avançados por R$ 59,90). Todos incluem correção com IA."
        },
        {
          question: "Como posso atualizar meu plano?",
          answer: "Você pode atualizar seu plano a qualquer momento através da página de Planos. Basta escolher o plano desejado e fazer o pagamento. O upgrade é instantâneo."
        },
        {
          question: "Vocês oferecem reembolso?",
          answer: "Sim, oferecemos reembolso integral dentro de 7 dias após a compra, caso você não esteja satisfeito com o serviço. Basta entrar em contato com nosso suporte."
        },
        {
          question: "Quais formas de pagamento vocês aceitam?",
          answer: "Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express) e PIX através da plataforma Stripe, garantindo segurança total nas transações."
        }
      ]
    },
    {
      category: "Recursos e Funcionalidades",
      questions: [
        {
          question: "Como criar uma redação?",
          answer: "Após fazer login, acesse 'Minhas Redações' e clique em 'Nova Redação'. Escolha o tema, escreva seu texto e envie para análise. A IA fornecerá feedback em poucos segundos."
        },
        {
          question: "O que é o modo de modificação de texto com IA?",
          answer: "Este recurso permite que você selecione partes da sua redação e peça à IA para reescrevê-las, corrigi-las ou melhorá-las. É ideal para aprimorar trechos específicos do seu texto."
        },
        {
          question: "Posso exportar minhas redações?",
          answer: "Sim! Você pode exportar suas redações em formato PDF através do botão 'Exportar' disponível em cada redação. O PDF inclui seu texto e o feedback da IA."
        },
        {
          question: "Como funciona o banco de temas?",
          answer: "Oferecemos uma biblioteca extensa de temas atuais e relevantes para vestibulares e concursos. Você pode escolher um tema do banco ou criar seu próprio tema personalizado."
        }
      ]
    },
    {
      category: "Conta e Segurança",
      questions: [
        {
          question: "Como criar uma conta?",
          answer: "Clique em 'Criar Conta' na página inicial, preencha seus dados (nome, email e senha) e confirme seu email. Sua conta será criada imediatamente e você pode começar a usar o plano gratuito."
        },
        {
          question: "Esqueci minha senha. O que fazer?",
          answer: "Na página de login, clique em 'Esqueci minha senha'. Digite seu email cadastrado e você receberá um link para redefinir sua senha."
        },
        {
          question: "Meus dados estão seguros?",
          answer: "Sim! Levamos a segurança muito a sério. Utilizamos criptografia de ponta a ponta, armazenamento seguro e não compartilhamos seus dados com terceiros. Veja nossa Política de Privacidade para mais detalhes."
        }
      ]
    },
    {
      category: "Suporte Técnico",
      questions: [
        {
          question: "A IA não está funcionando. O que fazer?",
          answer: "Verifique sua conexão com a internet e tente novamente. Se o problema persistir, entre em contato com nosso suporte através do email suporte@dissertia.com com detalhes do problema."
        },
        {
          question: "Como reportar um bug ou problema?",
          answer: "Entre em contato conosco através do email suporte@dissertia.com descrevendo o problema em detalhes. Nossa equipe trabalhará para resolver o mais rápido possível."
        },
        {
          question: "Vocês têm aplicativo móvel?",
          answer: "Atualmente, o DissertIA é uma aplicação web responsiva que funciona perfeitamente em smartphones e tablets. Estamos trabalhando em aplicativos nativos para iOS e Android."
        }
      ]
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
          <HelpCircle className="h-16 w-16 text-bright-blue mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy dark:text-white mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-lg text-deep-navy/70 dark:text-white/70 max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o DissertIA
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex} className="mb-8" data-testid={`faq-category-${catIndex}`}>
              <h2 className="text-2xl font-bold text-deep-navy dark:text-white mb-4">
                {category.category}
              </h2>
              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible>
                    {category.questions.map((item, qIndex) => (
                      <AccordionItem key={qIndex} value={`item-${catIndex}-${qIndex}`}>
                        <AccordionTrigger data-testid={`accordion-trigger-${catIndex}-${qIndex}`}>
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent data-testid={`accordion-content-${catIndex}-${qIndex}`}>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-bright-blue/5 dark:bg-bright-blue/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-navy dark:text-white mb-4">
            Não encontrou sua resposta?
          </h2>
          <p className="text-deep-navy/70 dark:text-white/70 mb-6">
            Entre em contato conosco e teremos prazer em ajudar
          </p>
          <Link href="/help-center">
            <a className="inline-block bg-bright-blue text-white px-6 py-3 rounded-lg hover:bg-bright-blue/90 smooth-transition" data-testid="button-help-center">
              Visitar Central de Ajuda
            </a>
          </Link>
        </div>
      </section>
    </div>
  );
}
