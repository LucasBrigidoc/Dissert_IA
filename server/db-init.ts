import { db } from './db';
import { subscriptionPlans } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Initialize database with default subscription plans
 * This ensures the required plans exist when the app starts
 */
export async function initializeDatabase() {
  try {
    // Check if subscription plans exist
    const existingPlans = await db.select().from(subscriptionPlans);
    
    if (existingPlans.length === 0) {
      console.log('📦 Initializing subscription plans...');
      
      // Insert default subscription plans using raw SQL to avoid type issues
      await db.execute(sql`
        INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, features, max_operations_per_month, max_ai_cost_per_month, is_active)
        VALUES 
          ('plan-free', 'Plano Gratuito', 'Acesso básico às funcionalidades da plataforma', 0, 0, 
           '["Até 5 redações por mês", "Ferramentas básicas de escrita", "Acesso limitado ao repertório"]'::json, 
           5, 500, true),
          ('plan-pro-monthly', 'Plano Pro Mensal', 'Acesso completo com pagamento mensal', 5500, 0, 
           '["Redações ilimitadas", "Todas as ferramentas de IA", "Repertório completo", "Correção profissional", "Suporte prioritário"]'::json, 
           -1, 5000, true),
          ('plan-pro-yearly', 'Plano Pro Anual', 'Acesso completo com desconto anual', 0, 29990, 
           '["Redações ilimitadas", "Todas as ferramentas de IA", "Repertório completo", "Correção profissional", "Suporte prioritário", "2 meses grátis"]'::json, 
           -1, 5000, true)
      `);
      
      console.log('✅ Subscription plans initialized successfully');
    } else {
      console.log('✅ Subscription plans already exist, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
