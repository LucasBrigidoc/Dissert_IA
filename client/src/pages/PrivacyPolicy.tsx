import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
          <Shield className="h-16 w-16 text-bright-blue mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy dark:text-white mb-4">
            Política de Privacidade
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
              <h2>1. Introdução</h2>
              <p>
                Bem-vindo à DissertIA. Esta Política de Privacidade explica como coletamos, usamos, 
                compartilhamos e protegemos suas informações pessoais quando você utiliza nossa plataforma 
                de assistência à redação com inteligência artificial.
              </p>
              <p>
                Ao usar o DissertIA, você concorda com a coleta e uso de informações de acordo com esta política. 
                Se você não concordar com esta política, não use nossos serviços.
              </p>

              <h2>2. Informações que Coletamos</h2>
              <h3>2.1. Informações Fornecidas por Você</h3>
              <ul>
                <li><strong>Informações de Conta:</strong> Nome, endereço de email, senha (criptografada)</li>
                <li><strong>Conteúdo do Usuário:</strong> Redações, textos e outros conteúdos que você cria na plataforma</li>
                <li><strong>Informações de Pagamento:</strong> Processadas através do Stripe (não armazenamos dados completos de cartão)</li>
              </ul>

              <h3>2.2. Informações Coletadas Automaticamente</h3>
              <ul>
                <li><strong>Dados de Uso:</strong> Páginas visitadas, recursos utilizados, tempo de uso</li>
                <li><strong>Dados do Dispositivo:</strong> Tipo de navegador, sistema operacional, endereço IP</li>
                <li><strong>Cookies:</strong> Usamos cookies para manter sua sessão e melhorar a experiência</li>
              </ul>

              <h2>3. Como Usamos suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul>
                <li>Fornecer e melhorar nossos serviços de correção de redação com IA</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar notificações importantes sobre sua conta</li>
                <li>Analisar o uso da plataforma para melhorias</li>
                <li>Treinar e aprimorar nossos modelos de IA (de forma anonimizada)</li>
                <li>Prevenir fraudes e garantir a segurança</li>
              </ul>

              <h2>4. Compartilhamento de Informações</h2>
              <p>Não vendemos suas informações pessoais. Compartilhamos apenas:</p>
              <ul>
                <li><strong>Com Prestadores de Serviços:</strong> Stripe (pagamentos), Google (IA), SendGrid (emails)</li>
                <li><strong>Por Requisição Legal:</strong> Quando exigido por lei ou para proteger direitos</li>
                <li><strong>Com seu Consentimento:</strong> Em outras situações com sua permissão explícita</li>
              </ul>

              <h2>5. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo:
              </p>
              <ul>
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Senhas criptografadas com hash bcrypt</li>
                <li>Acesso restrito às informações pessoais</li>
                <li>Monitoramento regular de segurança</li>
              </ul>
              <p>
                No entanto, nenhum método de transmissão pela Internet é 100% seguro. 
                Fazemos o possível para proteger seus dados, mas não podemos garantir segurança absoluta.
              </p>

              <h2>6. Seus Direitos</h2>
              <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:</p>
              <ul>
                <li><strong>Acesso:</strong> Solicitar cópias de suas informações pessoais</li>
                <li><strong>Correção:</strong> Corrigir informações imprecisas ou incompletas</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de suas informações</li>
                <li><strong>Portabilidade:</strong> Receber suas informações em formato estruturado</li>
                <li><strong>Revogação:</strong> Retirar o consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de suas informações</li>
              </ul>
              <p>
                Para exercer esses direitos, entre em contato através do email: privacidade@dissertia.com
              </p>

              <h2>7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais apenas pelo tempo necessário para os fins descritos nesta política, 
                a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>

              <h2>8. Uso por Menores</h2>
              <p>
                Nossos serviços são destinados a estudantes maiores de 13 anos. Se você tem entre 13 e 18 anos, 
                você deve ter a permissão de seus pais ou responsáveis para usar o DissertIA.
              </p>

              <h2>9. Uso de IA e Processamento de Conteúdo</h2>
              <p>
                Suas redações são processadas por modelos de IA (Google Gemini) para fornecer feedback e sugestões. 
                Podemos usar seu conteúdo de forma anonimizada e agregada para melhorar nossos modelos de IA. 
                Nunca compartilhamos suas redações publicamente ou com terceiros não autorizados.
              </p>

              <h2>10. Cookies</h2>
              <p>
                Usamos cookies essenciais para o funcionamento da plataforma (autenticação, sessão). 
                Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.
              </p>

              <h2>11. Alterações a Esta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças 
                significativas através de email ou aviso destacado em nosso site. A continuação do uso após as 
                alterações constitui aceitação da nova política.
              </p>

              <h2>12. Contato</h2>
              <p>
                Para questões sobre esta Política de Privacidade ou suas informações pessoais, entre em contato:
              </p>
              <ul>
                <li><strong>Email:</strong> privacidade@dissertia.com</li>
                <li><strong>Email Geral:</strong> contato@dissertia.com</li>
              </ul>

              <h2>13. Legislação Aplicável</h2>
              <p>
                Esta política é regida pelas leis brasileiras, incluindo a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
