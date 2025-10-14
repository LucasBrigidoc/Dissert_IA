import { storage } from "./storage";
import { SubscriptionService } from "./subscription-service";

const subscriptionService = new SubscriptionService(storage);

/**
 * Check and downgrade expired subscriptions
 * This function should be called periodically (e.g., daily)
 */
export async function checkExpiredSubscriptions(): Promise<{
  checked: number;
  downgraded: number;
}> {
  console.log('🔄 Running expired subscriptions check...');
  
  try {
    const result = await subscriptionService.checkAllExpiredSubscriptions();
    
    console.log(`✅ Expired subscriptions check completed: ${result.checked} checked, ${result.downgraded} downgraded`);
    
    return result;
  } catch (error) {
    console.error('❌ Error checking expired subscriptions:', error);
    throw error;
  }
}

/**
 * Initialize cron jobs
 * Runs periodic tasks at specified intervals
 */
export function initializeCronJobs(): void {
  console.log('⏰ Initializing cron jobs...');

  // Check expired subscriptions every 6 hours (4 times per day)
  const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  setInterval(async () => {
    try {
      await checkExpiredSubscriptions();
    } catch (error) {
      console.error('❌ Cron job error (expired subscriptions):', error);
    }
  }, SIX_HOURS);

  // Run immediately on startup
  setTimeout(() => {
    checkExpiredSubscriptions().catch(err => 
      console.error('❌ Initial expired subscriptions check failed:', err)
    );
  }, 10000); // Wait 10 seconds after startup

  console.log('✅ Cron jobs initialized (checking every 6 hours)');
}
