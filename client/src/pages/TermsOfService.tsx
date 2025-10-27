import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
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
          <FileText className="h-16 w-16 text-bright-blue mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy dark:text-white mb-4">
            Termos de Serviço
          </h1>
          <p className="text-lg text-deep-navy/70 dark:text-white/70 max-w-2xl mx-auto">
            Última atualização: 27 de outubro de 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card>
            <CardContent className="p-6 md:p-8 prose prose-slate dark:prose-invert max-w-none">
              <h2>1. Aceitação dos Termos</h2>
              <p>
                Bem-vindo ao DissertIA. Ao acessar e usar nossos serviços, você concorda em cumprir e estar vinculado 
                a estes Termos de Serviço. Se você não concordar com alguma parte destes termos, não use nossos serviços.
              </p>

              <h2>2. Descrição do Serviço</h2>
              <p>
                O DissertIA é uma plataforma online que oferece:
              </p>
              <ul>
                <li>Assistência à redação de textos com inteligência artificial</li>
                <li>Correção automatizada de redações com feedback detalhado</li>
                <li>Sugestões de melhoria e aprimoramento de texto</li>
                <li>Banco de temas para prática de redação</li>
                <li>Ferramentas de aprendizado para vestibulares e concursos</li>
              </ul>

              <h2>3. Contas de Usuário</h2>
              <h3>3.1. Registro</h3>
              <p>
                Para usar certos recursos, você deve criar uma conta fornecendo informações precisas e completas. 
                Você é responsável por manter a confidencialidade de sua senha.
              </p>
              
              <h3>3.2. Responsabilidade da Conta</h3>
              <p>
                Você é responsável por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente 
                sobre qualquer uso não autorizado.
              </p>

              <h3>3.3. Idade Mínima</h3>
              <p>
                Você deve ter pelo menos 13 anos para usar o DissertIA. Usuários entre 13 e 18 anos devem ter 
                permissão dos pais ou responsáveis.
              </p>

              <h2>4. Planos e Pagamentos</h2>
              <h3>4.1. Planos de Assinatura</h3>
              <p>Oferecemos os seguintes planos:</p>
              <ul>
                <li><strong>Gratuito:</strong> 5 redações por mês, recursos básicos</li>
                <li><strong>Básico:</strong> R$ 29,90/mês - 20 redações por mês</li>
                <li><strong>Premium:</strong> R$ 59,90/mês - Redações ilimitadas e recursos avançados</li>
              </ul>

              <h3>4.2. Cobrança</h3>
              <p>
                As assinaturas são cobradas mensalmente de forma recorrente até o cancelamento. 
                Os pagamentos são processados através do Stripe.
              </p>

              <h3>4.3. Reembolsos</h3>
              <p>
                Oferecemos reembolso integral dentro de 7 dias após a primeira compra. 
                Após este período, os pagamentos não são reembolsáveis, mas você pode cancelar 
                a renovação automática a qualquer momento.
              </p>

              <h3>4.4. Alterações de Preço</h3>
              <p>
                Reservamo-nos o direito de modificar os preços dos planos. Notificaremos você com 
                30 dias de antecedência sobre mudanças que afetem sua assinatura atual.
              </p>

              <h2>5. Uso Aceitável</h2>
              <h3>5.1. Você Concorda em NÃO:</h3>
              <ul>
                <li>Usar o serviço para fins ilegais ou não autorizados</li>
                <li>Tentar obter acesso não autorizado aos nossos sistemas</li>
                <li>Compartilhar sua conta com outras pessoas</li>
                <li>Fazer engenharia reversa ou copiar nossos modelos de IA</li>
                <li>Usar bots ou automações para acessar o serviço</li>
                <li>Enviar conteúdo ofensivo, difamatório ou ilegal</li>
                <li>Revender ou redistribuir nossos serviços</li>
              </ul>

              <h3>5.2. Uso Educacional</h3>
              <p>
                O DissertIA é uma ferramenta de aprendizado. Você deve usar o feedback da IA como 
                orientação, mas sempre submeter seu próprio trabalho original em provas e avaliações. 
                Não nos responsabilizamos pelo uso inadequado de nossos serviços.
              </p>

              <h2>6. Propriedade Intelectual</h2>
              <h3>6.1. Seu Conteúdo</h3>
              <p>
                Você mantém todos os direitos sobre as redações e textos que criar. Ao usar nossos serviços, 
                você nos concede uma licença limitada para processar e armazenar seu conteúdo para fornecer 
                o serviço e melhorar nossos modelos de IA (de forma anonimizada).
              </p>

              <h3>6.2. Nossa Propriedade</h3>
              <p>
                O DissertIA, incluindo design, código, modelos de IA, logotipos e marcas, são de nossa 
                propriedade exclusiva e protegidos por leis de propriedade intelectual.
              </p>

              <h2>7. Limitações de Responsabilidade</h2>
              <p>
                O DissertIA é fornecido "como está" sem garantias de qualquer tipo. Não garantimos que:
              </p>
              <ul>
                <li>O serviço estará sempre disponível ou livre de erros</li>
                <li>As sugestões da IA resultarão em notas específicas</li>
                <li>Todos os erros serão corrigidos</li>
                <li>O serviço atenderá suas expectativas específicas</li>
              </ul>
              <p>
                Não seremos responsáveis por quaisquer danos indiretos, incidentais ou consequenciais 
                resultantes do uso ou incapacidade de usar nossos serviços.
              </p>

              <h2>8. Modificações do Serviço</h2>
              <p>
                Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do serviço 
                a qualquer momento, com ou sem aviso prévio. Faremos esforços razoáveis para notificar 
                mudanças significativas.
              </p>

              <h2>9. Cancelamento e Suspensão</h2>
              <h3>9.1. Por Você</h3>
              <p>
                Você pode cancelar sua assinatura a qualquer momento através das configurações da conta. 
                O acesso permanecerá ativo até o final do período pago.
              </p>

              <h3>9.2. Por Nós</h3>
              <p>
                Podemos suspender ou encerrar sua conta se você violar estes termos, sem direito a reembolso.
              </p>

              <h2>10. Privacidade</h2>
              <p>
                Seu uso do DissertIA também é regido por nossa Política de Privacidade. 
                Por favor, leia-a para entender como coletamos, usamos e protegemos suas informações.
              </p>

              <h2>11. Isenção de Garantias</h2>
              <p>
                A IA do DissertIA é uma ferramenta de auxílio educacional. Não garantimos:
              </p>
              <ul>
                <li>Que a correção da IA seja 100% precisa</li>
                <li>Aprovação em vestibulares ou concursos</li>
                <li>Notas específicas em avaliações</li>
                <li>Que todas as sugestões sejam aplicáveis ao seu contexto específico</li>
              </ul>

              <h2>12. Indenização</h2>
              <p>
                Você concorda em indenizar e isentar o DissertIA de quaisquer reclamações, danos ou 
                despesas resultantes de sua violação destes termos ou uso indevido do serviço.
              </p>

              <h2>13. Lei Aplicável e Jurisdição</h2>
              <p>
                Estes termos são regidos pelas leis brasileiras. Quaisquer disputas serão resolvidas 
                nos tribunais do Brasil.
              </p>

              <h2>14. Alterações aos Termos</h2>
              <p>
                Podemos atualizar estes Termos de Serviço periodicamente. Notificaremos você sobre 
                mudanças materiais através de email ou aviso em nosso site. O uso continuado após as 
                alterações constitui aceitação dos novos termos.
              </p>

              <h2>15. Disposições Gerais</h2>
              <p>
                Se alguma disposição destes termos for considerada inválida, as demais disposições 
                permanecerão em pleno vigor. Nossa falha em aplicar qualquer direito não constitui 
                renúncia a esse direito.
              </p>

              <h2>16. Contato</h2>
              <p>
                Para questões sobre estes Termos de Serviço, entre em contato:
              </p>
              <ul>
                <li><strong>Email:</strong> juridico@dissertia.com</li>
                <li><strong>Email Geral:</strong> contato@dissertia.com</li>
                <li><strong>Suporte:</strong> suporte@dissertia.com</li>
              </ul>

              <h2>17. Aceitação</h2>
              <p>
                Ao usar o DissertIA, você reconhece que leu, compreendeu e concorda em estar vinculado 
                a estes Termos de Serviço e nossa Política de Privacidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
