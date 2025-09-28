// Email service using SendGrid - based on javascript_sendgrid blueprint
import { MailService } from '@sendgrid/mail';
import type { NewsletterSubscriber, Newsletter } from '@shared/schema';

const mailService = new MailService();

// Initialize SendGrid if API key is available
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  mailService.setApiKey(sendgridApiKey);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ SENDGRID_API_KEY not found. Email sending will be simulated.');
    console.log(`📧 Simulated email: ${params.subject} to ${params.to}`);
    return true;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`✅ Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid email error:', error);
    return false;
  }
}

export async function sendNewsletter(
  newsletter: Newsletter, 
  subscribers: NewsletterSubscriber[],
  fromEmail: string = 'newsletter@dissertai.com'
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  results: Array<{ email: string; success: boolean; error?: string }>
}> {
  console.log(`📨 Sending newsletter "${newsletter.title}" to ${subscribers.length} subscribers...`);
  
  const results: Array<{ email: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    try {
      const unsubscribeUrl = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
      
      const htmlContent = `
        ${newsletter.content}
        <br><br>
        <hr style="margin: 20px 0; border: 1px solid #e5e5e5;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          Você está recebendo este email porque se inscreveu em nossa newsletter.<br>
          <a href="${unsubscribeUrl}" style="color: #666;">Cancelar inscrição</a>
        </p>
      `;

      const textContent = `
        ${newsletter.plainTextContent || newsletter.content.replace(/<[^>]*>/g, '')}
        
        ---
        Você está recebendo este email porque se inscreveu em nossa newsletter.
        Para cancelar a inscrição, acesse: ${unsubscribeUrl}
      `;

      const success = await sendEmail({
        to: subscriber.email,
        from: fromEmail,
        subject: newsletter.subject,
        html: htmlContent,
        text: textContent,
      });

      if (success) {
        sent++;
        results.push({ email: subscriber.email, success: true });
      } else {
        failed++;
        results.push({ email: subscriber.email, success: false, error: 'Failed to send' });
      }
    } catch (error) {
      failed++;
      results.push({ 
        email: subscriber.email, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  console.log(`📊 Newsletter sending complete: ${sent} sent, ${failed} failed`);
  
  return {
    success: failed === 0,
    sent,
    failed,
    results
  };
}

export async function sendWelcomeEmail(
  subscriber: NewsletterSubscriber,
  fromEmail: string = 'welcome@dissertai.com'
): Promise<boolean> {
  const welcomeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5087ff;">Bem-vindo ao DissertAI! 🎉</h2>
      
      <p>Olá${subscriber.name ? ` ${subscriber.name}` : ''}!</p>
      
      <p>Ficamos muito felizes em ter você conosco! Você se inscreveu com sucesso em nossa newsletter semanal.</p>
      
      <p>Toda semana você receberá:</p>
      <ul>
        <li>📚 Dicas exclusivas de redação</li>
        <li>🧠 Estratégias de argumentação</li>
        <li>📈 Análises de temas atuais</li>
        <li>🎯 Conteúdos especiais para vestibulares e concursos</li>
      </ul>
      
      <p>Fique de olho em sua caixa de entrada!</p>
      
      <p>Equipe DissertAI<br>
      <a href="https://dissertai.com" style="color: #5087ff;">dissertai.com</a></p>
      
      <hr style="margin: 20px 0; border: 1px solid #e5e5e5;">
      <p style="font-size: 12px; color: #666; text-align: center;">
        <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}" 
           style="color: #666;">Cancelar inscrição</a>
      </p>
    </div>
  `;

  const welcomeText = `
Bem-vindo ao DissertAI!

Olá${subscriber.name ? ` ${subscriber.name}` : ''}!

Ficamos muito felizes em ter você conosco! Você se inscreveu com sucesso em nossa newsletter semanal.

Toda semana você receberá:
- Dicas exclusivas de redação  
- Estratégias de argumentação
- Análises de temas atuais
- Conteúdos especiais para vestibulares e concursos

Fique de olho em sua caixa de entrada!

Equipe DissertAI
https://dissertai.com

Para cancelar a inscrição, acesse: ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}
  `;

  return await sendEmail({
    to: subscriber.email,
    from: fromEmail,
    subject: "Bem-vindo ao DissertAI! 🎉",
    html: welcomeHtml,
    text: welcomeText,
  });
}