import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, updateUserProfileSchema, insertUserProgressSchema, insertUserScoreSchema, insertEssayStructureSchema, searchQuerySchema, chatMessageSchema, proposalSearchQuerySchema, generateProposalSchema, textModificationRequestSchema, insertSimulationSchema, newsletterSubscriptionSchema, createNewsletterSchema, updateNewsletterSchema, sendNewsletterSchema, createMaterialComplementarSchema, updateMaterialComplementarSchema, insertCouponSchema, validateCouponSchema, insertUserGoalSchema, insertUserExamSchema, insertUserScheduleSchema, type UserScore } from "@shared/schema";
import { textModificationService } from "./text-modification-service";
import { optimizedAnalysisService } from "./optimized-analysis-service";
import { optimizationTelemetry } from "./optimization-telemetry";
import { geminiService } from "./gemini-service";
import { intelligentCache } from "./intelligent-cache";
import { WeeklyCostLimitingService } from "./weekly-cost-limiting";
import { CostTrackingService } from "./cost-tracking-service";
import { SubscriptionService } from "./subscription-service";
import { sendNewsletter, sendWelcomeEmail } from "./email-service";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import "./session-types";

// Initialize Stripe (optional in development)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not found. Payment features will be disabled.');
}

// Initialize services
const weeklyCostLimitingService = new WeeklyCostLimitingService(storage);
const costTrackingService = new CostTrackingService(storage);
const subscriptionService = new SubscriptionService(storage);

// Helper function to track AI operations for both rate limiting and analytics
async function trackAIUsage(params: {
  identifier: string;
  operation: string;
  costCentavos: number;
  planType: string;
  tokensInput: number;
  tokensOutput: number;
  userId?: string;
  ipAddress: string;
  source: 'ai' | 'cache' | 'fallback';
  modelUsed?: string;
  processingTime?: number;
}): Promise<void> {
  const validPlanType = (params.planType === 'pro' || params.planType === 'free') ? params.planType : 'free';
  
  // Track for weekly rate limiting
  await weeklyCostLimitingService.recordAIOperation(
    params.identifier,
    params.operation,
    params.costCentavos,
    validPlanType
  );
  
  // Track for admin analytics dashboard
  await costTrackingService.trackAIOperation({
    userId: params.userId,
    ipAddress: params.ipAddress,
    operation: params.operation,
    tokensInput: params.tokensInput,
    tokensOutput: params.tokensOutput,
    modelUsed: params.modelUsed,
    source: params.source,
    processingTime: params.processingTime,
  });
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Não autenticado" });
  }
};

// Middleware to check AI usage limits
export const checkAILimits = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    await subscriptionService.checkAIUsageAllowed(req.session.userId);
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Limite de uso atingido";
    return res.status(403).json({ 
      message,
      upgradeRequired: true,
      action: "upgrade"
    });
  }
};

// Helper function to get identifier for AI tracking
// Uses userId when authenticated, falls back to IP for anonymous users
function getAITrackingIdentifier(req: Request): string {
  if (req.session.userId) {
    return `user_${req.session.userId}`;
  }
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  return `ip_${clientIP}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ===================== NEWSLETTER MANAGEMENT ENDPOINTS =====================
  
  // Newsletter subscription endpoint (updated to save to database)
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = newsletterSubscriptionSchema.parse(req.body);
      
      // Check if already subscribed
      const existing = await storage.getNewsletterSubscriberByEmail(validatedData.email);
      if (existing) {
        if (existing.status === "active") {
          return res.status(400).json({ message: "Email já está cadastrado em nossa newsletter" });
        } else {
          // Reactivate subscription
          await storage.updateNewsletterSubscriber(existing.id, {
            status: "active",
            unsubscribedAt: null,
            updatedAt: new Date(),
          });
          return res.json({ message: "Inscrição reativada com sucesso!" });
        }
      }
      
      // Create new subscription
      const subscriber = await storage.createNewsletterSubscriber(validatedData);
      
      // Send welcome email
      await sendWelcomeEmail(subscriber);
      
      res.json({ message: "Inscrição realizada com sucesso! Verifique seu email." });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      res.status(500).json({ message: "Erro ao inscrever na newsletter" });
    }
  });

  // Unsubscribe endpoint
  app.get("/api/newsletter/unsubscribe/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const success = await storage.unsubscribeByToken(token);
      
      if (success) {
        res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>✅ Inscrição cancelada com sucesso</h2>
              <p>Você foi removido da nossa lista de newsletter.</p>
              <p>Sentiremos sua falta! 😊</p>
              <a href="/" style="color: #5087ff; text-decoration: none;">Voltar ao site</a>
            </body>
          </html>
        `);
      } else {
        res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ Link inválido</h2>
              <p>Este link de cancelamento é inválido ou já foi usado.</p>
              <a href="/" style="color: #5087ff; text-decoration: none;">Voltar ao site</a>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Erro interno</h2>
            <p>Ocorreu um erro ao processar sua solicitação.</p>
            <a href="/" style="color: #5087ff; text-decoration: none;">Voltar ao site</a>
          </body>
        </html>
      `);
    }
  });

  // Get public newsletter feed (sent newsletters for authenticated users)
  app.get("/api/newsletter/feed", async (req, res) => {
    try {
      // Get all sent newsletters
      const newsletters = await storage.getAllNewsletters("sent");
      res.json(newsletters);
    } catch (error) {
      console.error("Get newsletter feed error:", error);
      res.status(500).json({ message: "Erro ao buscar newsletters" });
    }
  });

  // ===================== ADMIN NEWSLETTER ENDPOINTS =====================
  
  // Get all subscribers (admin only)
  app.get("/api/admin/newsletter/subscribers", async (req, res) => {
    try {
      const { status } = req.query;
      const subscribers = await storage.getAllNewsletterSubscribers(status as string);
      res.json(subscribers);
    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ message: "Erro ao buscar inscritos" });
    }
  });

  // Delete subscriber (admin only)
  app.delete("/api/admin/newsletter/subscribers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNewsletterSubscriber(id);
      res.json({ message: "Inscrito removido com sucesso" });
    } catch (error) {
      console.error("Delete subscriber error:", error);
      res.status(500).json({ message: "Erro ao remover inscrito" });
    }
  });

  // Get all newsletters (admin only)
  app.get("/api/admin/newsletter/newsletters", async (req, res) => {
    try {
      const { status } = req.query;
      const newsletters = await storage.getAllNewsletters(status as string);
      res.json(newsletters);
    } catch (error) {
      console.error("Get newsletters error:", error);
      res.status(500).json({ message: "Erro ao buscar newsletters" });
    }
  });

  // Create newsletter (admin only)
  app.post("/api/admin/newsletter/newsletters", async (req, res) => {
    try {
      const validatedData = createNewsletterSchema.parse(req.body);
      const newsletter = await storage.createNewsletter(validatedData);
      res.status(201).json(newsletter);
    } catch (error) {
      console.error("Create newsletter error:", error);
      res.status(400).json({ message: "Erro ao criar newsletter" });
    }
  });

  // Get single newsletter (admin only)
  app.get("/api/admin/newsletter/newsletters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const newsletter = await storage.getNewsletter(id);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter não encontrada" });
      }
      res.json(newsletter);
    } catch (error) {
      console.error("Get newsletter error:", error);
      res.status(500).json({ message: "Erro ao buscar newsletter" });
    }
  });

  // Update newsletter (admin only)
  app.put("/api/admin/newsletter/newsletters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateNewsletterSchema.parse(req.body);
      const newsletter = await storage.updateNewsletter(id, validatedData);
      res.json(newsletter);
    } catch (error) {
      console.error("Update newsletter error:", error);
      res.status(400).json({ message: "Erro ao atualizar newsletter" });
    }
  });

  // Delete newsletter (admin only)
  app.delete("/api/admin/newsletter/newsletters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNewsletter(id);
      res.json({ message: "Newsletter removida com sucesso" });
    } catch (error) {
      console.error("Delete newsletter error:", error);
      res.status(500).json({ message: "Erro ao remover newsletter" });
    }
  });

  // Send newsletter (admin only)
  app.post("/api/admin/newsletter/newsletters/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get newsletter
      const newsletter = await storage.getNewsletter(id);
      if (!newsletter) {
        return res.status(404).json({ message: "Newsletter não encontrada" });
      }

      if (newsletter.status === "sent") {
        return res.status(400).json({ message: "Esta newsletter já foi enviada" });
      }

      // Get active subscribers
      const subscribers = await storage.getActiveNewsletterSubscribers();
      if (subscribers.length === 0) {
        return res.status(400).json({ message: "Nenhum inscrito ativo encontrado" });
      }

      // Send newsletter
      const sendResult = await sendNewsletter(newsletter, subscribers);
      
      // Update newsletter status
      await storage.updateNewsletter(id, {
        status: "sent",
        sentAt: new Date(),
        sentCount: sendResult.sent,
      });

      // Create send records
      for (const result of sendResult.results) {
        const subscriber = subscribers.find(s => s.email === result.email);
        if (subscriber) {
          await storage.createNewsletterSend({
            newsletterId: id,
            subscriberId: subscriber.id,
            status: result.success ? "sent" : "bounced",
            bounceReason: result.error || null,
          });
        }
      }

      res.json({
        message: `Newsletter enviada! ${sendResult.sent} enviados, ${sendResult.failed} falharam`,
        stats: sendResult,
      });
    } catch (error) {
      console.error("Send newsletter error:", error);
      res.status(500).json({ message: "Erro ao enviar newsletter" });
    }
  });

  // Get newsletter statistics (admin only)
  app.get("/api/admin/newsletter/newsletters/:id/stats", async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getNewsletterStats(id);
      res.json(stats);
    } catch (error) {
      console.error("Get newsletter stats error:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // ===================== STRIPE CHECKOUT ENDPOINT =====================

  // Create checkout session with optional coupon
  app.post("/api/checkout/create-session", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment service is not configured" });
      }
      
      const checkoutSchema = z.object({
        planId: z.string(),
        couponCode: z.string().optional(),
        userId: z.string().optional(),
      });
      
      const { planId, couponCode, userId } = checkoutSchema.parse(req.body);
      
      // Get plan details
      // TODO: Replace this with actual plan lookup from database
      const planPrices: Record<string, { monthly: number; name: string }> = {
        "pro": { monthly: 6590, name: "Plano Pro" },
        "premium": { monthly: 9990, name: "Plano Premium" },
      };
      
      const plan = planPrices[planId];
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      
      let discountAmount = 0;
      let couponId: string | undefined;
      let stripeCouponId: string | undefined;
      
      // Validate and apply coupon if provided
      if (couponCode) {
        const validation = await storage.validateCoupon(couponCode, planId, userId);
        
        if (!validation.valid) {
          return res.status(400).json({ 
            message: validation.error || "Cupom inválido" 
          });
        }
        
        if (validation.coupon && validation.discount) {
          couponId = validation.coupon.id;
          
          // Calculate discount
          if (validation.discount.type === "percent") {
            discountAmount = Math.round((plan.monthly * validation.discount.value) / 100);
          } else {
            discountAmount = validation.discount.value;
          }
          
          // Create Stripe coupon for this session (duration: once)
          const stripeCoupon = await stripe.coupons.create({
            duration: "once",
            ...(validation.discount.type === "percent" 
              ? { percent_off: validation.discount.value }
              : { amount_off: validation.discount.value, currency: validation.discount.currency.toLowerCase() }
            ),
            name: `${validation.coupon.code} - ${plan.name}`,
          });
          
          stripeCouponId = stripeCoupon.id;
        }
      }
      
      const finalAmount = Math.max(0, plan.monthly - discountAmount);
      
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: plan.name,
              },
              recurring: {
                interval: "month",
              },
              unit_amount: finalAmount,
            },
            quantity: 1,
          },
        ],
        ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
        success_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/pricing`,
        metadata: {
          planId,
          userId: userId || "anonymous",
          couponId: couponId || "",
          couponCode: couponCode || "",
          discountAmount: discountAmount.toString(),
        },
      });
      
      res.json({ 
        sessionId: session.id,
        url: session.url,
        originalAmount: plan.monthly,
        discountAmount,
        finalAmount,
      });
    } catch (error) {
      console.error("Create checkout session error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Erro ao criar sessão de checkout" 
      });
    }
  });

  // ===================== STRIPE WEBHOOK ENDPOINT =====================

  // Stripe webhook handler
  app.post("/api/webhooks/stripe", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment service is not configured" });
    }
    
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('No signature');
    }
    
    let event;
    
    try {
      // Verify webhook signature (use STRIPE_WEBHOOK_SECRET if configured, otherwise skip in dev)
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // In development without webhook secret, just parse the body
        console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set - webhook signature verification disabled');
        event = JSON.parse(req.body.toString());
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    // Check if event already processed (idempotency)
    const existingEvent = await storage.getPaymentEvent(event.id);
    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return res.json({ received: true, status: 'duplicate' });
    }
    
    // Record the event
    await storage.createPaymentEvent({
      processor: "stripe",
      eventId: event.id,
      type: event.type,
      payload: event,
      status: "received",
    });
    
    try {
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const metadata = session.metadata;
          
          if (!metadata) {
            console.warn('No metadata in session');
            break;
          }
          
          const { planId, userId, couponId, couponCode, discountAmount } = metadata;
          
          // Create or update user subscription
          const userSubscription = await storage.createUserSubscription({
            userId: userId || '',
            planId: planId || '',
            status: 'active',
            billingCycle: 'monthly',
            startDate: new Date(),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripeStatus: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
            cancelAtPeriodEnd: false,
            couponId: couponId || undefined,
            effectivePriceCentavos: session.amount_total ?? undefined,
          });
          
          // Create transaction record
          const txn = await storage.createTransaction({
            userId: userId || undefined,
            subscriptionId: userSubscription.id,
            type: 'subscription',
            amount: session.amount_total || 0,
            currency: 'BRL',
            status: 'completed',
            processor: 'stripe',
            stripePaymentIntentId: session.payment_intent as string,
            discountAppliedCentavos: parseInt(discountAmount || '0'),
          });
          
          // Redeem the coupon if one was used
          if (couponId && userId) {
            await storage.redeemCoupon({
              couponId,
              userId,
              subscriptionId: userSubscription.id,
              transactionId: txn.id,
              redeemedAt: new Date(),
              discountAppliedCentavos: parseInt(discountAmount || '0'),
              context: {
                sessionId: session.id,
                planId,
              },
            });
          }
          
          console.log(`✅ Subscription activated for user ${userId}, plan ${planId}`);
          break;
        }
        
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          console.log(`Subscription ${event.type}: ${subscription.id}`);
          // TODO: Update user subscription status in database
          break;
        }
        
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          console.log(`Invoice ${event.type}: ${invoice.id}`);
          // TODO: Record invoice payment
          break;
        }
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      // Mark event as processed
      await storage.updatePaymentEventStatus(
        (await storage.getPaymentEvent(event.id))!.id,
        'processed',
        new Date()
      );
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Mark event as failed
      const paymentEvent = await storage.getPaymentEvent(event.id);
      if (paymentEvent) {
        await storage.updatePaymentEventStatus(
          paymentEvent.id,
          'failed',
          new Date(),
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
      
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // ===================== COUPON MANAGEMENT ENDPOINTS =====================

  // Admin: Create coupon
  app.post("/api/admin/coupons", async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.json(coupon);
    } catch (error) {
      console.error("Create coupon error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao criar cupom" });
    }
  });

  // Admin: List coupons
  app.get("/api/admin/coupons", async (req, res) => {
    try {
      const { isActive, planScope } = req.query;
      const coupons = await storage.listCoupons({
        isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
        planScope: planScope as string | undefined,
      });
      res.json(coupons);
    } catch (error) {
      console.error("List coupons error:", error);
      res.status(500).json({ message: "Erro ao listar cupons" });
    }
  });

  // Get all coupon redemptions (for admin stats)
  app.get("/api/admin/coupons/redemptions", async (req, res) => {
    try {
      const redemptions = await storage.getAllCouponRedemptions();
      res.json(redemptions);
    } catch (error) {
      console.error("List coupon redemptions error:", error);
      res.status(500).json({ message: "Erro ao listar usos de cupons" });
    }
  });

  // Admin: Get coupon
  app.get("/api/admin/coupons/:id", async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Cupom não encontrado" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Get coupon error:", error);
      res.status(500).json({ message: "Erro ao buscar cupom" });
    }
  });

  // Admin: Update coupon
  app.patch("/api/admin/coupons/:id", async (req, res) => {
    try {
      // Validate update data - create partial schema manually
      const updateCouponSchema = z.object({
        code: z.string().min(1).transform(val => val.toUpperCase()).optional(),
        discountType: z.enum(["percent", "fixed"]).optional(),
        discountValue: z.number().optional(),
        currency: z.string().optional(),
        maxRedemptions: z.number().optional(),
        maxRedemptionsPerUser: z.number().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        isActive: z.boolean().optional(),
        planScope: z.enum(["all", "specific"]).optional(),
        eligiblePlanIds: z.array(z.string()).optional(),
        stripeCouponId: z.string().optional(),
        metadata: z.any().optional(),
      }).refine(
        (data) => {
          if (data.discountType === "percent" && data.discountValue !== undefined) {
            return data.discountValue >= 1 && data.discountValue <= 100;
          }
          return true;
        },
        {
          message: "Para tipo 'percent', o valor do desconto deve estar entre 1 e 100",
          path: ["discountValue"],
        }
      );
      const validatedData = updateCouponSchema.parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, validatedData);
      res.json(coupon);
    } catch (error) {
      console.error("Update coupon error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao atualizar cupom" });
    }
  });

  // Admin: Delete coupon
  app.delete("/api/admin/coupons/:id", async (req, res) => {
    try {
      const success = await storage.deleteCoupon(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Cupom não encontrado" });
      }
      res.json({ message: "Cupom deletado com sucesso" });
    } catch (error) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ message: "Erro ao deletar cupom" });
    }
  });

  // Admin: Get coupon statistics
  app.get("/api/admin/coupons/:id/stats", async (req, res) => {
    try {
      const couponId = req.params.id;
      const coupon = await storage.getCoupon(couponId);
      if (!coupon) {
        return res.status(404).json({ message: "Cupom não encontrado" });
      }
      
      const redemptions = await storage.getCouponRedemptions(couponId);
      const totalUses = redemptions.length;
      const totalDiscountApplied = redemptions.reduce((sum, r) => sum + r.discountAppliedCentavos, 0);
      const uniqueUsers = new Set(redemptions.map(r => r.userId)).size;
      
      res.json({
        coupon,
        stats: {
          totalUses,
          uniqueUsers,
          totalDiscountApplied,
          redemptions,
        },
      });
    } catch (error) {
      console.error("Get coupon stats error:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas do cupom" });
    }
  });

  // ===================== PUBLIC COUPON ENDPOINTS =====================

  // Validate coupon (public, for checkout)
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, planId, userId } = validateCouponSchema.parse(req.body);
      const result = await storage.validateCoupon(code, planId, userId);
      res.json(result);
    } catch (error) {
      console.error("Validate coupon error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro ao validar cupom" });
    }
  });

  // Get user's coupon redemptions
  app.get("/api/users/:userId/coupons", async (req, res) => {
    try {
      const redemptions = await storage.getUserCouponRedemptions(req.params.userId);
      res.json(redemptions);
    } catch (error) {
      console.error("Get user coupon redemptions error:", error);
      res.status(500).json({ message: "Erro ao buscar cupons do usuário" });
    }
  });

  // ===================== MATERIAL COMPLEMENTAR MANAGEMENT ENDPOINTS =====================

  // Get all materiais complementares (public endpoint)
  app.get("/api/materiais-complementares", async (req, res) => {
    try {
      const materials = await storage.getAllMateriaisComplementares(true); // Only published
      res.json(materials);
    } catch (error) {
      console.error("Get materiais complementares error:", error);
      res.status(500).json({ message: "Erro ao buscar materiais" });
    }
  });

  // Admin routes for managing materiais complementares
  app.get("/api/admin/materiais-complementares", async (req, res) => {
    try {
      const materials = await storage.getAllMateriaisComplementares(); // All materials
      res.json(materials);
    } catch (error) {
      console.error("Get admin materiais complementares error:", error);
      res.status(500).json({ message: "Erro ao buscar materiais" });
    }
  });

  app.post("/api/admin/materiais-complementares", async (req, res) => {
    try {
      const validatedData = createMaterialComplementarSchema.parse(req.body);
      const material = await storage.createMaterialComplementar(validatedData);
      res.status(201).json(material);
    } catch (error) {
      console.error("Create material complementar error:", error);
      res.status(400).json({ message: "Erro ao criar material" });
    }
  });

  app.get("/api/admin/materiais-complementares/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const material = await storage.getMaterialComplementar(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material não encontrado" });
      }
      
      res.json(material);
    } catch (error) {
      console.error("Get material complementar error:", error);
      res.status(500).json({ message: "Erro ao buscar material" });
    }
  });

  app.put("/api/admin/materiais-complementares/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateMaterialComplementarSchema.parse(req.body);
      const material = await storage.updateMaterialComplementar(id, validatedData);
      res.json(material);
    } catch (error) {
      console.error("Update material complementar error:", error);
      res.status(500).json({ message: "Erro ao atualizar material" });
    }
  });

  app.delete("/api/admin/materiais-complementares/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaterialComplementar(id);
      res.json({ message: "Material removido com sucesso" });
    } catch (error) {
      console.error("Delete material complementar error:", error);
      res.status(500).json({ message: "Erro ao remover material" });
    }
  });

  // Analytics endpoints for materiais complementares
  app.post("/api/materiais-complementares/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementMaterialView(id);
      res.json({ message: "View registrada com sucesso" });
    } catch (error) {
      console.error("Increment material view error:", error);
      res.status(500).json({ message: "Erro ao registrar visualização" });
    }
  });

  app.post("/api/materiais-complementares/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementMaterialPdfDownload(id);
      res.json({ message: "Download registrado com sucesso" });
    } catch (error) {
      console.error("Increment material PDF download error:", error);
      res.status(500).json({ message: "Erro ao registrar download" });
    }
  });

  // User registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt with data:", { ...req.body, password: '[REDACTED]' });
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Usuário já existe" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Erro ao criar sessão" });
        }
        
        // Save user ID in session
        req.session.userId = user.id;
        
        // Save session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Erro ao salvar sessão" });
          }
          
          // Don't return password in response
          const { password: _, ...userResponse } = user;
          res.status(201).json(userResponse);
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      // If it's a Zod validation error, show specific details
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as any;
        console.error("Validation issues:", JSON.stringify(zodError.issues, null, 2));
        return res.status(400).json({ 
          message: "Dados de registro inválidos",
          details: zodError.issues 
        });
      }
      res.status(400).json({ message: "Dados de registro inválidos" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ message: "Erro ao criar sessão" });
        }
        
        // Save user ID in session
        req.session.userId = user.id;
        
        // Set session cookie duration based on "remember me" preference
        if (rememberMe) {
          // Remember me: 30 days
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else {
          // Don't remember: session cookie (expires when browser closes)
          req.session.cookie.maxAge = undefined as any;
        }
        
        // Save session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return res.status(500).json({ message: "Erro ao salvar sessão" });
          }
          
          // Don't return password in response
          const { password: _, ...userResponse } = user;
          res.json(userResponse);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Falha ao fazer login" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      // Don't return password in response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  // User logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Erro ao fazer logout" });
        }
        res.json({ message: "Logout realizado com sucesso" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Erro ao fazer logout" });
    }
  });

  // Update user profile endpoint
  app.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const validatedData = updateUserProfileSchema.parse(req.body);
      
      // Update user in storage
      const updatedUser = await storage.updateUser(req.user!.id, validatedData);
      
      // Don't return password in response
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  // ===================== USER PROGRESS ENDPOINTS =====================

  // Get user progress
  app.get("/api/user-progress", requireAuth, async (req, res) => {
    try {
      let progress = await storage.getUserProgress(req.user!.id);
      
      // Create default progress if it doesn't exist
      if (!progress) {
        progress = await storage.createUserProgress({
          userId: req.user!.id,
          averageScore: 0,
          targetScore: null,
          essaysCount: 0,
          studyHours: 0,
          streak: 0,
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Get user progress error:", error);
      res.status(500).json({ message: "Erro ao buscar progresso do usuário" });
    }
  });

  // Update user progress
  app.put("/api/user-progress", requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserProgressSchema.partial().omit({ userId: true }).parse(req.body);
      
      // Check if progress exists
      let progress = await storage.getUserProgress(req.user!.id);
      
      if (!progress) {
        // Create new progress with update data
        progress = await storage.createUserProgress({
          userId: req.user!.id,
          ...validatedData,
        });
      } else {
        // Update existing progress
        progress = await storage.updateUserProgress(req.user!.id, validatedData);
      }
      
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Update user progress error:", error);
      res.status(500).json({ message: "Erro ao atualizar progresso" });
    }
  });

  // Reset target score to null (temporary endpoint for testing)
  app.post("/api/user-progress/reset-target", requireAuth, async (req, res) => {
    try {
      const progress = await storage.updateUserProgress(req.user!.id, { targetScore: null });
      res.json(progress);
    } catch (error) {
      console.error("Reset target score error:", error);
      res.status(500).json({ message: "Erro ao resetar meta" });
    }
  });

  // Get user competencies analysis (for dashboard "Pontos a Melhorar")
  app.get("/api/user-competencies", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const period = req.query.period as string || 'all';
      
      // Get user's recent essays with competency scores
      const userEssays = await storage.getEssaysByUser(userId);
      
      // Get user's manual scores with competency scores
      const userScores = await storage.getUserScores(userId);
      
      // Calculate the date threshold based on period
      let dateThreshold: Date | null = null;
      const now = new Date();
      
      switch (period) {
        case '3months':
          dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '15days':
          dateThreshold = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
          break;
        case 'last':
          // Will be handled separately - get only the most recent
          break;
        case 'all':
        default:
          dateThreshold = null;
          break;
      }
      
      // Filter essays that have at least one competency score
      let essaysWithCompetencies = userEssays.filter((essay: any) => 
        essay.competence1 !== null || 
        essay.competence2 !== null || 
        essay.competence3 !== null || 
        essay.competence4 !== null || 
        essay.competence5 !== null
      );

      // Filter scores that have at least one competency score
      let scoresWithCompetencies = userScores.filter((score: any) => 
        score.competence1 !== null || 
        score.competence2 !== null || 
        score.competence3 !== null || 
        score.competence4 !== null || 
        score.competence5 !== null
      );

      // Apply date filtering if needed
      if (dateThreshold) {
        essaysWithCompetencies = essaysWithCompetencies.filter((essay: any) => 
          new Date(essay.createdAt) >= dateThreshold
        );
        scoresWithCompetencies = scoresWithCompetencies.filter((score: any) => 
          new Date(score.scoreDate) >= dateThreshold
        );
      }

      // Combine both sources
      let allCompetencyData = [...essaysWithCompetencies, ...scoresWithCompetencies];
      
      // If period is 'last', get only the most recent item with competencies
      if (period === 'last' && allCompetencyData.length > 0) {
        // Sort by date (most recent first)
        allCompetencyData = allCompetencyData.sort((a: any, b: any) => {
          const dateA = new Date(a.scoreDate || a.createdAt);
          const dateB = new Date(b.scoreDate || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        // Keep only the most recent
        allCompetencyData = [allCompetencyData[0]];
      }

      // If no data with competencies, return empty data
      if (allCompetencyData.length === 0) {
        return res.json({
          hasData: false,
          weakestCompetencies: [],
          averages: {
            competence1: 0,
            competence2: 0,
            competence3: 0,
            competence4: 0,
            competence5: 0,
          }
        });
      }

      // Calculate averages for each competency
      const competencyNames = [
        { id: 1, name: "Norma Culta", key: 'competence1' as const, defaultFeedback: "Concordância e regência" },
        { id: 2, name: "Compreensão", key: 'competence2' as const, defaultFeedback: "Interpretação textual" },
        { id: 3, name: "Argumentação", key: 'competence3' as const, defaultFeedback: "Diversificar argumentos" },
        { id: 4, name: "Coesão", key: 'competence4' as const, defaultFeedback: "Conectivos e coesão" },
        { id: 5, name: "Proposta", key: 'competence5' as const, defaultFeedback: "Detalhar agentes" },
      ];

      const competencyData = competencyNames.map(comp => {
        const scores = allCompetencyData
          .map((item: any) => item[comp.key])
          .filter((score: any): score is number => score !== null);
        
        const average = scores.length > 0 
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0;

        // Get most recent feedback for this competency (from essays only)
        const feedbackKey = `${comp.key}Feedback` as const;
        const recentFeedback = essaysWithCompetencies
          .map((essay: any) => essay[feedbackKey])
          .filter((fb: any): fb is string => fb !== null && fb !== '')
          .slice(-1)[0] || comp.defaultFeedback;

        return {
          id: comp.id,
          name: comp.name,
          average,
          feedback: recentFeedback,
          count: scores.length,
        };
      });

      // Sort by average score (lowest first) to identify weakest competencies
      const sortedByWeakness = [...competencyData]
        .filter(c => c.count > 0) // Only include competencies with data
        .sort((a, b) => a.average - b.average);

      // Get the 3 weakest competencies (or fewer if not enough data)
      const weakestCompetencies = sortedByWeakness.slice(0, 3).map(comp => ({
        id: comp.id,
        name: comp.name,
        score: comp.average,
        feedback: comp.feedback,
      }));

      // Calculate overall average
      const totalScores = competencyData.filter(c => c.count > 0);
      const overallAverage = totalScores.length > 0
        ? Math.round(totalScores.reduce((sum, c) => sum + c.average, 0) / totalScores.length)
        : 0;

      res.json({
        hasData: true,
        weakestCompetencies,
        averages: {
          competence1: competencyData[0].average,
          competence2: competencyData[1].average,
          competence3: competencyData[2].average,
          competence4: competencyData[3].average,
          competence5: competencyData[4].average,
        },
        overallAverage,
        essaysAnalyzed: allCompetencyData.length,
      });
    } catch (error) {
      console.error("Get user competencies error:", error);
      res.status(500).json({ message: "Erro ao buscar análise de competências" });
    }
  });

  // ===================== USER SCORES ENDPOINTS =====================

  // Helper function to recalculate and update user's average score in progress
  async function updateUserAverageScore(userId: string) {
    try {
      const scores = await storage.getUserScores(userId);
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length)
        : 0;
      
      let progress = await storage.getUserProgress(userId);
      if (!progress) {
        await storage.createUserProgress({
          userId,
          averageScore,
          targetScore: null,
          essaysCount: 0,
          studyHours: 0,
          streak: 0,
        });
      } else {
        await storage.updateUserProgress(userId, { averageScore });
      }
    } catch (error) {
      console.error("Error updating user average score:", error);
    }
  }

  // Get all user scores (manual + from simulations)
  app.get("/api/user-scores", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const scores = await storage.getUserScores(userId);
      res.json(scores);
    } catch (error) {
      console.error("Get user scores error:", error);
      res.status(500).json({ message: "Erro ao buscar notas" });
    }
  });

  // Add a manual score
  app.post("/api/user-scores", requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserScoreSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      // Check for duplicate: same exam name and date
      const existingScores = await storage.getUserScores(req.user!.id);
      const scoreDate = new Date(validatedData.scoreDate).toISOString().split('T')[0];
      const duplicate = existingScores.find(s => {
        const existingDate = new Date(s.scoreDate).toISOString().split('T')[0];
        return s.examName === validatedData.examName && existingDate === scoreDate;
      });

      if (duplicate) {
        return res.status(400).json({ 
          message: "Já existe uma nota com este nome de prova e data. Por favor, edite a nota existente ou escolha outra data.",
          duplicate: true
        });
      }
      
      const score = await storage.createUserScore(validatedData);
      
      // Recalculate and update user's average score
      await updateUserAverageScore(req.user!.id);
      
      res.json(score);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      console.error("Create user score error:", error);
      res.status(500).json({ message: "Erro ao adicionar nota" });
    }
  });

  // Update a user score
  app.patch("/api/user-scores/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      // Verify the score belongs to the user
      const allUserScores = await storage.getUserScores(userId);
      const existingScore = allUserScores.find(s => s.id === id);
      if (!existingScore) {
        return res.status(404).json({ message: "Nota não encontrada" });
      }

      // Prepare updates with validation
      const updates: Partial<UserScore> = {};
      if (req.body.score !== undefined) {
        const score = Number(req.body.score);
        if (isNaN(score) || score < 0 || score > 1000) {
          return res.status(400).json({ message: "Nota total deve estar entre 0 e 1000" });
        }
        updates.score = score;
      }
      if (req.body.competence1 !== undefined) {
        const comp = (req.body.competence1 === null || req.body.competence1 === '') ? null : Number(req.body.competence1);
        if (comp !== null && (isNaN(comp) || comp < 0 || comp > 200)) {
          return res.status(400).json({ message: "Competências devem estar entre 0 e 200" });
        }
        updates.competence1 = comp;
      }
      if (req.body.competence2 !== undefined) {
        const comp = (req.body.competence2 === null || req.body.competence2 === '') ? null : Number(req.body.competence2);
        if (comp !== null && (isNaN(comp) || comp < 0 || comp > 200)) {
          return res.status(400).json({ message: "Competências devem estar entre 0 e 200" });
        }
        updates.competence2 = comp;
      }
      if (req.body.competence3 !== undefined) {
        const comp = (req.body.competence3 === null || req.body.competence3 === '') ? null : Number(req.body.competence3);
        if (comp !== null && (isNaN(comp) || comp < 0 || comp > 200)) {
          return res.status(400).json({ message: "Competências devem estar entre 0 e 200" });
        }
        updates.competence3 = comp;
      }
      if (req.body.competence4 !== undefined) {
        const comp = (req.body.competence4 === null || req.body.competence4 === '') ? null : Number(req.body.competence4);
        if (comp !== null && (isNaN(comp) || comp < 0 || comp > 200)) {
          return res.status(400).json({ message: "Competências devem estar entre 0 e 200" });
        }
        updates.competence4 = comp;
      }
      if (req.body.competence5 !== undefined) {
        const comp = (req.body.competence5 === null || req.body.competence5 === '') ? null : Number(req.body.competence5);
        if (comp !== null && (isNaN(comp) || comp < 0 || comp > 200)) {
          return res.status(400).json({ message: "Competências devem estar entre 0 e 200" });
        }
        updates.competence5 = comp;
      }
      if (req.body.examName !== undefined) updates.examName = req.body.examName;
      if (req.body.scoreDate !== undefined) updates.scoreDate = new Date(req.body.scoreDate);

      // Check for duplicate with the new values (if examName or scoreDate is being updated)
      if (updates.examName || updates.scoreDate) {
        const newExamName = updates.examName || existingScore.examName;
        const newScoreDate = updates.scoreDate || existingScore.scoreDate;
        const scoreDate = new Date(newScoreDate).toISOString().split('T')[0];
        
        const duplicate = allUserScores.find(s => {
          if (s.id === id) return false; // Skip the score being edited
          const existingDate = new Date(s.scoreDate).toISOString().split('T')[0];
          return s.examName === newExamName && existingDate === scoreDate;
        });

        if (duplicate) {
          return res.status(400).json({ 
            message: "Já existe outra nota com este nome de prova e data.",
            duplicate: true
          });
        }
      }

      const updatedScore = await storage.updateUserScore(id, updates);
      
      // Recalculate and update user's average score
      await updateUserAverageScore(userId);
      
      res.json(updatedScore);
    } catch (error) {
      console.error("Update user score error:", error);
      res.status(500).json({ message: "Erro ao atualizar nota" });
    }
  });

  // Delete a user score
  app.delete("/api/user-scores/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      // Verify the score belongs to the user
      const existingScore = (await storage.getUserScores(userId)).find(s => s.id === id);
      if (!existingScore) {
        return res.status(404).json({ message: "Nota não encontrada" });
      }

      const deleted = await storage.deleteUserScore(id);
      if (deleted) {
        // Recalculate and update user's average score
        await updateUserAverageScore(userId);
        
        res.json({ message: "Nota excluída com sucesso" });
      } else {
        res.status(500).json({ message: "Erro ao excluir nota" });
      }
    } catch (error) {
      console.error("Delete user score error:", error);
      res.status(500).json({ message: "Erro ao excluir nota" });
    }
  });

  // ===================== SUBSCRIPTION MANAGEMENT ENDPOINTS =====================

  // Get current user subscription with plan details
  app.get("/api/subscription", requireAuth, async (req, res) => {
    try {
      const { subscription, plan } = await subscriptionService.getUserSubscriptionWithPlan(req.user!.id);
      res.json({ subscription, plan });
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ message: "Erro ao buscar assinatura" });
    }
  });

  // Get subscription limits and usage
  app.get("/api/subscription/limits", requireAuth, async (req, res) => {
    try {
      const identifier = getAITrackingIdentifier(req);
      const planType = await subscriptionService.getUserPlanType(req.user!.id);
      const weeklyStats = await weeklyCostLimitingService.getWeeklyUsageStats(identifier, planType);
      
      const weeklyLimit = planType === 'free' ? 219 : 875; // 219 centavos for free, 875 for pro
      const weeklyUsage = weeklyStats.currentUsageCentavos;
      const percentageUsed = Math.min(100, (weeklyUsage / weeklyLimit) * 100);
      const canUseAI = weeklyUsage < weeklyLimit;
      const remainingCredits = Math.max(0, weeklyLimit - weeklyUsage);
      
      const periodDays = planType === 'free' ? 15 : 7;
      const periodLabel = planType === 'free' ? 'quinzenal' : 'semanal';
      
      res.json({
        planType,
        canUseAI,
        weeklyUsage,
        weeklyLimit,
        remainingCredits,
        percentageUsed,
        planName: planType === 'pro' ? "Pro" : "Gratuito",
        daysUntilReset: weeklyStats.daysUntilReset,
        resetPeriodDays: periodDays,
        periodLabel
      });
    } catch (error) {
      console.error("Get limits error:", error);
      res.status(500).json({ message: "Erro ao buscar limites" });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    try {
      const { reason } = req.body;
      const updated = await subscriptionService.cancelSubscription(req.user!.id, reason);
      res.json({ 
        message: "Assinatura cancelada com sucesso. Você ainda terá acesso até o fim do período pago.",
        subscription: updated 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cancelar assinatura";
      console.error("Cancel subscription error:", error);
      res.status(400).json({ message });
    }
  });

  // Reactivate subscription
  app.post("/api/subscription/reactivate", requireAuth, async (req, res) => {
    try {
      const updated = await subscriptionService.reactivateSubscription(req.user!.id);
      res.json({ 
        message: "Assinatura reativada com sucesso!",
        subscription: updated 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao reativar assinatura";
      console.error("Reactivate subscription error:", error);
      res.status(400).json({ message });
    }
  });

  // Get transaction history
  app.get("/api/subscription/transactions", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await subscriptionService.getUserTransactions(req.user!.id, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Erro ao buscar histórico de transações" });
    }
  });

  // ===================== USER GOALS (METAS) ENDPOINTS =====================

  // Get user goals
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const goals = await storage.getUserGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ message: "Erro ao buscar metas" });
    }
  });

  // Create user goal
  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const validatedData = insertUserGoalSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const goal = await storage.createUserGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create goal error:", error);
      res.status(500).json({ message: "Erro ao criar meta" });
    }
  });

  // Update user goal
  app.patch("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const goals = await storage.getUserGoals(req.user!.id);
      const existingGoal = goals.find(g => g.id === id);
      if (!existingGoal) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      // Validate update data
      const updateSchema = insertUserGoalSchema.partial().omit({ userId: true });
      const validatedData = updateSchema.parse(req.body);
      
      const goal = await storage.updateUserGoal(id, validatedData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Update goal error:", error);
      res.status(500).json({ message: "Erro ao atualizar meta" });
    }
  });

  // Delete user goal
  app.delete("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const goals = await storage.getUserGoals(req.user!.id);
      const existingGoal = goals.find(g => g.id === id);
      if (!existingGoal) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      
      const deleted = await storage.deleteUserGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meta não encontrada" });
      }
      res.json({ message: "Meta deletada com sucesso" });
    } catch (error) {
      console.error("Delete goal error:", error);
      res.status(500).json({ message: "Erro ao deletar meta" });
    }
  });

  // ===================== USER EXAMS (PROVAS/VESTIBULARES) ENDPOINTS =====================

  // Get user exams
  app.get("/api/exams", requireAuth, async (req, res) => {
    try {
      const exams = await storage.getUserExams(req.user!.id);
      res.json(exams);
    } catch (error) {
      console.error("Get exams error:", error);
      res.status(500).json({ message: "Erro ao buscar provas" });
    }
  });

  // Create user exam
  app.post("/api/exams", requireAuth, async (req, res) => {
    try {
      console.log("📝 Creating exam with data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertUserExamSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const exam = await storage.createUserExam(validatedData);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Create exam error:", error);
      res.status(500).json({ message: "Erro ao criar prova" });
    }
  });

  // Update user exam
  app.patch("/api/exams/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const exams = await storage.getUserExams(req.user!.id);
      const existingExam = exams.find(e => e.id === id);
      if (!existingExam) {
        return res.status(404).json({ message: "Prova não encontrada" });
      }
      
      // Validate update data
      const updateSchema = insertUserExamSchema.partial().omit({ userId: true });
      const validatedData = updateSchema.parse(req.body);
      
      const exam = await storage.updateUserExam(id, validatedData);
      res.json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Update exam error:", error);
      res.status(500).json({ message: "Erro ao atualizar prova" });
    }
  });

  // Delete user exam
  app.delete("/api/exams/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership
      const exams = await storage.getUserExams(req.user!.id);
      const existingExam = exams.find(e => e.id === id);
      if (!existingExam) {
        return res.status(404).json({ message: "Prova não encontrada" });
      }
      
      const deleted = await storage.deleteUserExam(id);
      if (!deleted) {
        return res.status(404).json({ message: "Prova não encontrada" });
      }
      res.json({ message: "Prova deletada com sucesso" });
    } catch (error) {
      console.error("Delete exam error:", error);
      res.status(500).json({ message: "Erro ao deletar prova" });
    }
  });

  // ===================== USER SCHEDULE (CRONOGRAMA) ENDPOINTS =====================

  // Get user schedule for a week
  app.get("/api/schedule", requireAuth, async (req, res) => {
    try {
      // Validate and parse weekStart
      const weekStartSchema = z.object({
        weekStart: z.coerce.date().optional()
      });
      const { weekStart } = weekStartSchema.parse({ weekStart: req.query.weekStart || new Date().toISOString() });
      
      const schedule = await storage.getUserSchedule(req.user!.id, weekStart || new Date());
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data inválida", errors: error.errors });
      }
      console.error("Get schedule error:", error);
      res.status(500).json({ message: "Erro ao buscar cronograma" });
    }
  });

  // Create or update user schedule
  app.post("/api/schedule", requireAuth, async (req, res) => {
    try {
      console.log("📅 Received schedule data:", JSON.stringify(req.body, null, 2));
      
      // Convert weekStart string to Date if needed
      const dataToValidate = {
        ...req.body,
        userId: req.user!.id,
        weekStart: req.body.weekStart ? new Date(req.body.weekStart) : new Date()
      };
      
      console.log("📅 Data to validate:", JSON.stringify({
        ...dataToValidate,
        weekStart: dataToValidate.weekStart.toISOString()
      }, null, 2));
      
      const validatedData = insertUserScheduleSchema.parse(dataToValidate);
      
      // Check if a schedule already exists for this user/week/day
      const existingSchedules = await storage.getUserSchedule(req.user!.id, validatedData.weekStart);
      const existingSchedule = existingSchedules.find(s => s.day === validatedData.day);
      
      let schedule;
      if (existingSchedule) {
        // Update existing schedule
        console.log("📝 Updating existing schedule:", existingSchedule.id);
        schedule = await storage.updateUserSchedule(existingSchedule.id, {
          activities: validatedData.activities,
          hours: validatedData.hours,
          minutes: validatedData.minutes,
          completed: validatedData.completed
        });
        console.log("✅ Schedule updated successfully:", schedule.id);
      } else {
        // Create new schedule
        console.log("➕ Creating new schedule");
        schedule = await storage.createUserSchedule(validatedData);
        console.log("✅ Schedule created successfully:", schedule.id);
      }
      
      res.status(200).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("❌ Create/Update schedule error:", error);
      res.status(500).json({ message: "Erro ao salvar cronograma" });
    }
  });

  // Update user schedule
  app.patch("/api/schedule/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership - get all schedules for user
      const allSchedules = await storage.getUserSchedule(req.user!.id, new Date()); // This is not ideal but works
      const existingSchedule = allSchedules.find(s => s.id === id);
      if (!existingSchedule) {
        return res.status(404).json({ message: "Cronograma não encontrado" });
      }
      
      // Validate update data
      const updateSchema = insertUserScheduleSchema.partial().omit({ userId: true });
      const validatedData = updateSchema.parse(req.body);
      
      const schedule = await storage.updateUserSchedule(id, validatedData);
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Update schedule error:", error);
      res.status(500).json({ message: "Erro ao atualizar cronograma" });
    }
  });

  // Delete user schedule
  app.delete("/api/schedule/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify ownership - get all schedules for user
      const allSchedules = await storage.getUserSchedule(req.user!.id, new Date()); // This is not ideal but works
      const existingSchedule = allSchedules.find(s => s.id === id);
      if (!existingSchedule) {
        return res.status(404).json({ message: "Cronograma não encontrado" });
      }
      
      const deleted = await storage.deleteUserSchedule(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cronograma não encontrado" });
      }
      res.json({ message: "Cronograma deletado com sucesso" });
    } catch (error) {
      console.error("Delete schedule error:", error);
      res.status(500).json({ message: "Erro ao deletar cronograma" });
    }
  });

  // Get user progress endpoint
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const progress = await storage.getUserProgress(userId);
      if (!progress) {
        return res.status(404).json({ message: "User progress not found" });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Get progress error:", error);
      res.status(500).json({ message: "Failed to get user progress" });
    }
  });

  // ===================== SAVED ESSAYS/STRUCTURES/NEWSLETTERS ROUTES =====================
  // These routes must come BEFORE the generic /api/users/:userId/essays routes
  // to avoid route matching issues

  app.get("/api/essays/saved", async (req, res) => {
    try {
      const userId = req.session?.userId || "default-user";
      const savedEssays = await storage.getUserSavedEssays(userId);
      res.json({ results: savedEssays, count: savedEssays.length });
    } catch (error) {
      console.error("Get saved essays error:", error);
      res.status(500).json({ message: "Failed to get saved essays" });
    }
  });

  app.get("/api/structures/saved", async (req, res) => {
    try {
      const userId = req.session?.userId || "default-user";
      const savedStructures = await storage.getUserSavedStructures(userId);
      res.json({ results: savedStructures, count: savedStructures.length });
    } catch (error) {
      console.error("Get saved structures error:", error);
      res.status(500).json({ message: "Failed to get saved structures" });
    }
  });

  app.get("/api/newsletters/saved", async (req, res) => {
    try {
      const userId = req.session?.userId || "default-user";
      const savedNewsletters = await storage.getUserSavedNewsletters(userId);
      res.json({ results: savedNewsletters, count: savedNewsletters.length });
    } catch (error) {
      console.error("Get saved newsletters error:", error);
      res.status(500).json({ message: "Failed to get saved newsletters" });
    }
  });

  // Saved texts endpoints
  app.post("/api/saved-texts", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.session.userId;
      const { title, originalText, modifiedText, modificationType, activeModifications } = req.body;

      if (!title || !originalText || !modifiedText) {
        return res.status(400).json({ message: "Título, texto original e texto modificado são obrigatórios" });
      }

      const savedText = await storage.createSavedText({
        userId,
        title,
        originalText,
        modifiedText,
        modificationType: modificationType || null,
        activeModifications: activeModifications || [],
      });

      res.status(201).json(savedText);
    } catch (error) {
      console.error("Save text error:", error);
      res.status(500).json({ message: "Erro ao salvar texto" });
    }
  });

  app.get("/api/saved-texts", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.session.userId;
      const savedTexts = await storage.getUserSavedTexts(userId);
      res.json({ results: savedTexts, count: savedTexts.length });
    } catch (error) {
      console.error("Get saved texts error:", error);
      res.status(500).json({ message: "Erro ao buscar textos salvos" });
    }
  });

  app.delete("/api/saved-texts/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.session.userId;
      const { id } = req.params;

      const success = await storage.deleteSavedText(id, userId);
      if (success) {
        res.json({ message: "Texto deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Texto não encontrado" });
      }
    } catch (error) {
      console.error("Delete saved text error:", error);
      res.status(500).json({ message: "Erro ao deletar texto" });
    }
  });

  // Saved outlines endpoints
  app.post("/api/saved-outlines", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.session.userId;
      const { title, proposalTitle, proposalStatement, outlineData, outlineType } = req.body;

      if (!title || !proposalTitle || !proposalStatement || !outlineData) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
      }

      const savedOutline = await storage.createSavedOutline({
        userId,
        title,
        proposalTitle,
        proposalStatement,
        outlineData,
        outlineType: outlineType || 'roteiro',
      });

      res.status(201).json(savedOutline);
    } catch (error) {
      console.error("Save outline error:", error);
      res.status(500).json({ message: "Erro ao salvar roteiro" });
    }
  });

  app.get("/api/saved-outlines", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.session.userId;
      const savedOutlines = await storage.getUserSavedOutlines(userId);
      res.json({ results: savedOutlines, count: savedOutlines.length });
    } catch (error) {
      console.error("Get saved outlines error:", error);
      res.status(500).json({ message: "Erro ao buscar roteiros salvos" });
    }
  });

  app.delete("/api/saved-outlines/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const userId = req.session.userId;
      const { id } = req.params;

      const success = await storage.deleteSavedOutline(id, userId);
      if (success) {
        res.json({ message: "Roteiro deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Roteiro não encontrado" });
      }
    } catch (error) {
      console.error("Delete saved outline error:", error);
      res.status(500).json({ message: "Erro ao deletar roteiro" });
    }
  });

  // Get conversation by ID
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;
      const conversation = await storage.getConversation(id);

      if (!conversation) {
        return res.status(404).json({ message: "Conversa não encontrada" });
      }

      // Check if user has access to this conversation
      if (conversation.userId && conversation.userId !== req.session.userId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Erro ao buscar conversa" });
    }
  });

  // Get user essays endpoint
  app.get("/api/users/:userId/essays", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const essays = await storage.getEssaysByUser(userId);
      res.json(essays);
    } catch (error) {
      console.error("Get essays error:", error);
      res.status(500).json({ message: "Failed to get user essays" });
    }
  });

  // Create essay endpoint
  app.post("/api/essays", async (req, res) => {
    try {
      const { userId, title, content } = req.body;
      
      if (!userId || !title || !content) {
        return res.status(400).json({ message: "userId, title, and content are required" });
      }
      
      const essay = await storage.createEssay({
        userId,
        title,
        content,
        score: null,
        feedback: null,
        isCompleted: false
      });
      
      res.status(201).json(essay);
    } catch (error) {
      console.error("Create essay error:", error);
      res.status(500).json({ message: "Failed to create essay" });
    }
  });

  // Get user structures endpoint
  app.get("/api/users/:userId/structures", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const structures = await storage.getStructuresByUser(userId);
      res.json(structures);
    } catch (error) {
      console.error("Get structures error:", error);
      res.status(500).json({ message: "Failed to get user structures" });
    }
  });

  // Create structure endpoint
  app.post("/api/structures", async (req, res) => {
    try {
      const validatedData = insertEssayStructureSchema.parse(req.body);
      
      const structure = await storage.createStructure(validatedData);
      res.status(201).json(structure);
    } catch (error) {
      console.error("Create structure error:", error);
      res.status(400).json({ message: "Invalid structure data" });
    }
  });

  // Update structure endpoint
  app.put("/api/structures/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEssayStructureSchema.partial().parse(req.body);
      
      const structure = await storage.updateStructure(id, validatedData);
      res.json(structure);
    } catch (error) {
      console.error("Update structure error:", error);
      res.status(400).json({ message: "Failed to update structure" });
    }
  });

  // Delete structure endpoint
  app.delete("/api/structures/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.deleteStructure(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete structure error:", error);
      res.status(400).json({ message: "Failed to delete structure" });
    }
  });

  // Get structure by ID endpoint
  app.get("/api/structures/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const structure = await storage.getStructure(id);
      if (!structure) {
        return res.status(404).json({ message: "Structure not found" });
      }
      
      res.json(structure);
    } catch (error) {
      console.error("Get structure error:", error);
      res.status(500).json({ message: "Failed to get structure" });
    }
  });

  // ===================== ESSAY STRUCTURE ANALYSIS ROUTES =====================
  
  // Analyze essay text and generate structure
  app.post("/api/structures/analyze", async (req, res) => {
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 100, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      // Validate request body
      const validationResult = z.object({
        essayText: z.string().trim().min(50, "Essay text must be at least 50 characters"),
        userId: z.string().optional() // To fetch existing structures for quality reference
      }).safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { essayText, userId } = validationResult.data;
      
      console.log(`🔍 Structure analysis request: ${essayText.substring(0, 50)}..., identifier: ${identifier}`);
      
      // Get existing structures for quality reference if userId provided
      let existingStructures: any[] = [];
      if (userId) {
        try {
          existingStructures = await storage.getStructuresByUser(userId);
        } catch (error) {
          console.log("Could not fetch existing structures:", error);
        }
      }
      
      // Analyze essay structure using OPTIMIZED AI system
      const structureAnalysis = await optimizedAnalysisService.analyzeEssayStructureOptimized(
        essayText,
        existingStructures
      );
      
      // Record telemetry for optimization tracking
      optimizationTelemetry.recordMetric({
        route: '/api/structures/analyze',
        operation: 'structure-analysis',
        tokensOriginal: 800, // Estimated original tokens
        tokensOptimized: structureAnalysis.tokensUsed || 250, // Estimated optimized tokens
        cacheHit: structureAnalysis.source === 'cache',
        source: structureAnalysis.source || 'optimized_ai',
        responseTime: Date.now() - Date.now() // This would be calculated properly in real implementation
      });

      // Record AI operation usage
      await weeklyCostLimitingService.recordAIOperation(
        identifier,
        'structure_analysis',
        100,
        planType
      );

      res.json({
        success: true,
        structure: structureAnalysis,
        message: "Essay structure analyzed successfully"
      });
      
    } catch (error) {
      console.error("Structure analysis error:", error);
      res.status(500).json({ message: "Failed to analyze essay structure. Please try again." });
    }
  });

  // ===================== ESSAY GENERATION ROUTES =====================

  // Generate essay using custom structure
  app.post("/api/essays/generate", async (req, res) => {
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 150, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      // Validate request body with Zod
      const validationResult = z.object({
        structureName: z.string().trim().optional(),
        sections: z.array(z.object({
          title: z.string().trim().min(1),
          description: z.string().trim().min(1),
          guidelines: z.string().trim().min(1).optional()
        })).min(1),
        topic: z.string().trim().min(1),
        additionalInstructions: z.string().trim().optional()
      }).safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { structureName, sections, topic, additionalInstructions } = validationResult.data;
      
      console.log(`📝 Essay generation request: ${structureName || 'Custom Structure'}, topic: ${topic.substring(0, 50)}..., identifier: ${identifier}`);
      
      // Generate essay using OPTIMIZED AI system
      const essayResult = await optimizedAnalysisService.generateEssayFromStructureOptimized(
        structureName || 'Custom Structure',
        sections,
        topic.trim(),
        additionalInstructions?.trim()
      );
      
      // Record telemetry for optimization tracking
      optimizationTelemetry.recordMetric({
        route: '/api/essays/generate',
        operation: 'essay-generation',
        tokensOriginal: 1200, // Estimated original tokens
        tokensOptimized: essayResult.tokensUsed || 350, // Estimated optimized tokens
        cacheHit: essayResult.source === 'cache',
        source: essayResult.source || 'optimized_ai',
        responseTime: Date.now() - Date.now() // This would be calculated properly in real implementation
      });

      // Record AI operation usage
      await weeklyCostLimitingService.recordAIOperation(
        identifier,
        'essay_generation',
        150,
        planType
      );

      res.json({
        success: true,
        essay: essayResult.essay,
        structureName: structureName || 'Custom Structure',
        topic: topic.trim(),
        additionalInstructions: additionalInstructions?.trim() || null,
        source: essayResult.source,
        tokensSaved: essayResult.tokensSaved || 0,
        message: "Essay generated successfully with AI optimization"
      });
      
    } catch (error) {
      console.error("Essay generation error:", error);
      res.status(500).json({ message: "Failed to generate essay. Please try again." });
    }
  });

  // ===================== REPERTOIRE ROUTES =====================

  // Intelligent repertoire search endpoint with rate limiting
  app.post("/api/repertoires/search", async (req, res) => {
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 100, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      const validatedQuery = searchQuerySchema.parse(req.body);
      const { query, type, category, popularity, excludeIds = [] } = validatedQuery;
      
      // Normalize query for cache lookup with type filter
      const normalizedQuery = geminiService.normalizeQuery(query);
      const cacheKey = type ? `${normalizedQuery}__type:${type}` : normalizedQuery;
      
      console.log(`🔑 Cache key gerado: "${cacheKey}" (query: "${query}", type: "${type || 'undefined'}")`);
      
      // Initialize results array
      let results: any[] = [];
      
      // Check cache first (only if no excluded IDs)
      let cachedResult = excludeIds.length === 0 ? await storage.getSearchCache(cacheKey) : null;
      
      if (cachedResult) {
        // Update cache usage statistics
        await storage.updateSearchCache(cachedResult.id, {
          searchCount: (cachedResult.searchCount || 0) + 1,
          lastSearched: new Date()
        });
        
        console.log(`Cache hit for query: "${query}"`);
        
        // Check if cached results are enough (minimum 4)
        const cachedResults = cachedResult.results as any[];
        if (cachedResults.length >= 4) {
          return res.json({
            results: cachedResults,
            source: "cache",
            count: cachedResults.length
          });
        } else {
          console.log(`Cache has only ${cachedResults.length} results, generating more to reach 4...`);
          // Continue to AI generation to complete to 4 results
          results = cachedResults;
        }
      }
      
      console.log(`Cache miss for query: "${query}" - using OPTIMIZED AI system`);
      
      // OPTIMIZED: Use local analysis (0 tokens)
      const analysis = geminiService.analyzeSearchQueryLocal(query);
      
      // Search repertoires with local analysis
      const filters = {
        type: type || undefined,
        category: category || undefined,
        popularity: popularity || undefined
      };
      
      // Check if this is a generic "load more" request (no specific search)
      const isGenericLoadMore = excludeIds.length > 0 && (
        query.trim() === "" || 
        query === "repertórios educacionais variados para redação" ||
        normalizedQuery === "repertorios educacionais variados para redacao"
      );
      
      if (isGenericLoadMore) {
        console.log(`📚 Busca genérica "Carregar Mais": mostrando repertórios do banco (excluindo ${excludeIds.length} já exibidos)`);
        
        // Get ALL existing repertoires from database, excluding already shown ones
        results = await storage.getRepertoires(1000); // Get up to 1000 repertoires (effectively all)
        results = results.filter(rep => !excludeIds.includes(rep.id));
        
        console.log(`📊 Encontrados ${results.length} repertórios disponíveis no banco após filtrar IDs já exibidos`);
        
        // Apply other filters if specified
        if (filters.type) {
          results = results.filter(rep => rep.type === filters.type);
        }
        if (filters.category) {
          results = results.filter(rep => rep.category === filters.category);
        }
        if (filters.popularity) {
          results = results.filter(rep => rep.popularity === filters.popularity);
        }
        
        console.log(`📋 Após aplicar filtros: ${results.length} repertórios disponíveis`);
      } else {
        // Normal search with query - existing logic
        results = await storage.searchRepertoires(normalizedQuery, filters);
        
        // Try with suggested filters if no results
        if (results.length === 0 && !type) {
          for (const suggestedType of analysis.suggestedTypes) {
            results = await storage.searchRepertoires(normalizedQuery, { type: suggestedType });
            if (results.length > 0) break;
          }
          
          if (results.length === 0) {
            for (const suggestedCategory of analysis.suggestedCategories) {
              results = await storage.searchRepertoires(normalizedQuery, { category: suggestedCategory });
              if (results.length > 0) break;
            }
          }
        }
        
        // Filter out excluded IDs first
        if (excludeIds.length > 0) {
          results = results.filter(rep => !excludeIds.includes(rep.id));
        }
      }
      
      // OPTIMIZED: Generate 6 repertoires in 1 AI request (especially important for "load more" requests)
      if (results.length < 4) {
        console.log(`🚀 OPTIMIZED: Generating batch of repertoires for: "${query}" (current: ${results.length}, excluded: ${excludeIds.length})`);
        
        // Single OPTIMIZED AI call that generates 6 repertoires
        const repertoireResult = await optimizedAnalysisService.generateRepertoiresBatchOptimized(query, filters, 6);
        const generatedRepertoires = repertoireResult.repertoires;
        
        // Record AI operation usage with real token counts from API
        if (repertoireResult.source === 'optimized_ai' && repertoireResult.tokensInput && repertoireResult.tokensOutput) {
          await weeklyCostLimitingService.recordAIOperationWithTokens(
            identifier,
            'repertoire_generation',
            repertoireResult.tokensInput,
            repertoireResult.tokensOutput,
            planType
          );
        } else {
          // Fallback for cache hits or fallback mode (no cost)
          console.log(`📦 Repertoire source: ${repertoireResult.source} - no cost recorded`);
        }
        
        // Save all generated repertoires to database
        for (const genRep of generatedRepertoires) {
          try {
            const createdRepertoire = await storage.createRepertoire({
              title: genRep.title,
              description: genRep.description,
              type: genRep.type,
              category: genRep.category,
              popularity: genRep.popularity,
              year: genRep.year,
              rating: genRep.rating,
              keywords: genRep.keywords
            });
            results.push(createdRepertoire);
          } catch (error) {
            console.error("Error saving generated repertoire:", error);
          }
        }
      }
      
      // Local ranking instead of AI (simple keyword matching)
      if (results.length > 1) {
        const queryWords = query.toLowerCase().split(/\s+/);
        results = results.sort((a, b) => {
          const aScore = queryWords.reduce((score, word) => {
            if (a.title.toLowerCase().includes(word)) score += 3;
            if (a.description.toLowerCase().includes(word)) score += 2;
            if (a.keywords && (a.keywords as string[]).some((k: string) => k.toLowerCase().includes(word))) score += 1;
            return score;
          }, 0);
          const bScore = queryWords.reduce((score, word) => {
            if (b.title.toLowerCase().includes(word)) score += 3;
            if (b.description.toLowerCase().includes(word)) score += 2;
            if (b.keywords && (b.keywords as string[]).some((k: string) => k.toLowerCase().includes(word))) score += 1;
            return score;
          }, 0);
          return bScore - aScore;
        });
      }
      
      // Limit results to top 12
      results = results.slice(0, 12);
      
      // Cache the results for future searches (TTL: 30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      await storage.createSearchCache({
        queryText: query,
        normalizedQuery: cacheKey,
        results: results,
        searchCount: 1,
        lastSearched: new Date(),
        expiresAt
      });
      
      // Record telemetry for optimization tracking
      optimizationTelemetry.recordMetric({
        route: '/api/repertoires/search',
        operation: 'repertoire-search',
        tokensOriginal: 1100, // Estimated original tokens for batch generation
        tokensOptimized: 320, // Estimated optimized tokens (local analysis uses 0 tokens)
        cacheHit: cachedResult !== null,
        source: cachedResult ? 'cache' : 'optimized_ai',
        responseTime: Date.now() - Date.now() // This would be calculated properly in real implementation
      });

      res.json({
        results,
        source: cachedResult ? "cache" : "optimized_ai",
        count: results.length,
        tokensSaved: cachedResult ? 1100 : 780, // Tokens saved by using local analysis instead of AI
        analysis: {
          keywords: analysis.keywords,
          suggestedTypes: analysis.suggestedTypes,
          suggestedCategories: analysis.suggestedCategories
        }
      });
      
    } catch (error) {
      console.error("Repertoire search error:", error);
      res.status(500).json({ message: "Failed to search repertoires" });
    }
  });

  // Get all repertoires endpoint (for browsing)
  app.get("/api/repertoires", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const repertoires = await storage.getRepertoires(limit, offset);
      res.json({
        results: repertoires,
        count: repertoires.length
      });
    } catch (error) {
      console.error("Get repertoires error:", error);
      res.status(500).json({ message: "Failed to get repertoires" });
    }
  });

  // Save repertoire to user's personal library
  app.post("/api/repertoires/:id/save", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const repertoireId = req.params.id;
      const userId = req.session.userId;
      
      const savedRepertoire = await storage.saveRepertoire(userId, repertoireId);
      res.json({
        message: "Repertório salvo com sucesso!",
        savedRepertoire
      });
    } catch (error) {
      console.error("Save repertoire error:", error);
      res.status(500).json({ message: "Failed to save repertoire" });
    }
  });

  // Remove repertoire from user's personal library
  app.delete("/api/repertoires/:id/save", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const repertoireId = req.params.id;
      const userId = req.session.userId;
      
      const removed = await storage.removeSavedRepertoire(userId, repertoireId);
      if (removed) {
        res.json({ message: "Repertório removido da biblioteca pessoal!" });
      } else {
        res.status(404).json({ message: "Repertório não encontrado na biblioteca" });
      }
    } catch (error) {
      console.error("Remove saved repertoire error:", error);
      res.status(500).json({ message: "Failed to remove saved repertoire" });
    }
  });

  // Get user's saved repertoires
  app.get("/api/repertoires/saved", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const userId = req.session.userId;
      
      const savedRepertoires = await storage.getUserSavedRepertoires(userId);
      res.json({
        results: savedRepertoires,
        count: savedRepertoires.length
      });
    } catch (error) {
      console.error("Get saved repertoires error:", error);
      res.status(500).json({ message: "Failed to get saved repertoires" });
    }
  });

  // Check if repertoire is saved by user
  app.get("/api/repertoires/:id/saved", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const repertoireId = req.params.id;
      const userId = req.session.userId;
      
      const isSaved = await storage.isRepertoireSaved(userId, repertoireId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Check saved repertoire error:", error);
      res.status(500).json({ message: "Failed to check if repertoire is saved" });
    }
  });

  // ===================== SAVED ESSAYS/STRUCTURES/NEWSLETTERS POST/DELETE ROUTES =====================

  app.post("/api/essays/:id/save", async (req, res) => {
    try {
      const essayId = req.params.id;
      const userId = req.session?.userId || "default-user";
      const savedEssay = await storage.saveEssay(userId, essayId);
      res.json({ message: "Redação salva com sucesso!", savedEssay });
    } catch (error) {
      console.error("Save essay error:", error);
      res.status(500).json({ message: "Failed to save essay" });
    }
  });

  app.delete("/api/essays/:id/save", async (req, res) => {
    try {
      const essayId = req.params.id;
      const userId = req.session?.userId || "default-user";
      const removed = await storage.removeSavedEssay(userId, essayId);
      if (removed) {
        res.json({ message: "Redação removida da biblioteca pessoal!" });
      } else {
        res.status(404).json({ message: "Redação não encontrada na biblioteca" });
      }
    } catch (error) {
      console.error("Remove saved essay error:", error);
      res.status(500).json({ message: "Failed to remove saved essay" });
    }
  });

  app.post("/api/structures/:id/save", async (req, res) => {
    try {
      const structureId = req.params.id;
      const userId = req.session?.userId || "default-user";
      const savedStructure = await storage.saveStructure(userId, structureId);
      res.json({ message: "Estrutura salva com sucesso!", savedStructure });
    } catch (error) {
      console.error("Save structure error:", error);
      res.status(500).json({ message: "Failed to save structure" });
    }
  });

  app.delete("/api/structures/:id/save", async (req, res) => {
    try {
      const structureId = req.params.id;
      const userId = req.session?.userId || "default-user";
      const removed = await storage.removeSavedStructure(userId, structureId);
      if (removed) {
        res.json({ message: "Estrutura removida da biblioteca pessoal!" });
      } else {
        res.status(404).json({ message: "Estrutura não encontrada na biblioteca" });
      }
    } catch (error) {
      console.error("Remove saved structure error:", error);
      res.status(500).json({ message: "Failed to remove saved structure" });
    }
  });

  app.post("/api/newsletters/:id/save", async (req, res) => {
    try {
      const newsletterId = req.params.id;
      const userId = req.session?.userId || "default-user";
      const savedNewsletter = await storage.saveNewsletter(userId, newsletterId);
      res.json({ message: "Newsletter salva com sucesso!", savedNewsletter });
    } catch (error) {
      console.error("Save newsletter error:", error);
      res.status(500).json({ message: "Failed to save newsletter" });
    }
  });

  app.delete("/api/newsletters/:id/save", async (req, res) => {
    try {
      const newsletterId = req.params.id;
      const userId = req.session?.userId || "default-user";
      const removed = await storage.removeSavedNewsletter(userId, newsletterId);
      if (removed) {
        res.json({ message: "Newsletter removida da biblioteca pessoal!" });
      } else {
        res.status(404).json({ message: "Newsletter não encontrada na biblioteca" });
      }
    } catch (error) {
      console.error("Remove saved newsletter error:", error);
      res.status(500).json({ message: "Failed to remove saved newsletter" });
    }
  });

  // ===================== PROPOSAL ROUTES =====================

  // Function to detect future exam years
  function detectFutureExam(searchQuery: string) {
    const currentYear = new Date().getFullYear();
    const yearMatches = searchQuery.match(/(\d{4})/g);
    
    if (yearMatches) {
      for (const yearMatch of yearMatches) {
        const year = parseInt(yearMatch);
        if (year > currentYear && year <= currentYear + 10) { // Only consider realistic future years
          // Extract exam name (remove the year and clean up)
          const examName = searchQuery.replace(yearMatch, '').trim()
            .replace(/\s+/g, ' ')
            .replace(/^(enem|vestibular|concurso|simulado)\s*/i, (match) => match.trim());
          
          return {
            isFuture: true,
            futureYear: year,
            examName: examName || 'essa prova',
            searchTermForPast: searchQuery.replace(yearMatch, '').trim()
          };
        }
      }
    }
    
    return { isFuture: false };
  }

  // Intelligent proposal search endpoint with rate limiting
  app.post("/api/proposals/search", async (req, res) => {
    try {
      const validatedData = proposalSearchQuerySchema.parse(req.body);
      const { query, examType, theme, difficulty, year, excludeIds } = validatedData;
      
      // Detect future exam searches
      const futureExamDetection = detectFutureExam(query);
      
      const identifier = getAITrackingIdentifier(req);
      
      console.log(`🔍 Proposal search request: "${query}", identifier: ${identifier}${futureExamDetection.isFuture ? ' [FUTURE EXAM DETECTED]' : ''}`);
      
      // Handle future exam detection
      if (futureExamDetection.isFuture) {
        console.log(`🔮 Future exam detected: ${futureExamDetection.examName || 'unknown exam'} ${futureExamDetection.futureYear}`);
        
        // Search for related proposals from previous years using the exam name without year
        const searchTermForPast = futureExamDetection.searchTermForPast || 
          (futureExamDetection.examName || '').replace(/\b(enem|vestibular|concurso|simulado)\b/i, '$1').trim();
        
        // Local analysis for the past exam search
        const localAnalysis = geminiService.analyzeProposalSearchLocal(searchTermForPast);
        
        // Search existing proposals from previous years
        let pastProposals = await storage.searchProposals(searchTermForPast, {
          examType: examType || localAnalysis.suggestedExamTypes[0],
          theme: theme || localAnalysis.suggestedThemes[0],
          difficulty
          // Don't filter by year - we want past years
        });
        
        // Filter out excluded IDs
        if (excludeIds && excludeIds.length > 0) {
          pastProposals = pastProposals.filter(p => !excludeIds.includes(p.id));
        }
        
        // Prefer more recent years first
        pastProposals = pastProposals.sort((a, b) => {
          const yearA = parseInt(String(a.year || '0'));
          const yearB = parseInt(String(b.year || '0'));
          return yearB - yearA; // Descending order (most recent first)
        });
        
        return res.json({
          results: pastProposals.slice(0, 10),
          count: pastProposals.length,
          query: localAnalysis.normalizedQuery,
          futureExamDetected: true,
          futureExamInfo: {
            examName: futureExamDetection.examName,
            futureYear: futureExamDetection.futureYear,
            message: `Ainda não temos informações sobre ${futureExamDetection.examName} ${futureExamDetection.futureYear}. Aqui estão propostas relacionadas de anos anteriores:`
          },
          suggestions: {
            themes: localAnalysis.suggestedThemes,
            examTypes: localAnalysis.suggestedExamTypes
          }
        });
      }
      
      // Step 1: Local analysis (no AI tokens used) for regular searches
      const localAnalysis = geminiService.analyzeProposalSearchLocal(query);
      console.log("Local analysis:", localAnalysis);
      
      // Extract year from query if present and not already in filters
      const yearMatches = query.match(/(\d{4})/g);
      const extractedYear = yearMatches && yearMatches.length > 0 ? parseInt(yearMatches[0]) : null;
      const searchYear = year || extractedYear;
      
      // Detect if this is a specific exam+year search (e.g., "ENEM 2022")
      const isSpecificExamSearch = searchYear !== null && (
        query.toLowerCase().includes('enem') ||
        query.toLowerCase().includes('vestibular') ||
        query.toLowerCase().includes('concurso') ||
        query.toLowerCase().includes('fuvest') ||
        query.toLowerCase().includes('unicamp') ||
        query.toLowerCase().includes('usp')
      );
      
      // Step 2: Search existing proposals
      let searchResults = await storage.searchProposals(query, {
        examType: examType || localAnalysis.suggestedExamTypes[0],
        theme: theme || localAnalysis.suggestedThemes[0],
        difficulty,
        year: searchYear || undefined
      });
      
      // Filter out excluded IDs
      if (excludeIds && excludeIds.length > 0) {
        searchResults = searchResults.filter(p => !excludeIds.includes(p.id));
      }
      
      console.log(`🔍 Found ${searchResults.length} proposals for "${query}"${isSpecificExamSearch ? ' (specific exam+year search)' : ''}`);
      
      // Step 3: If limited results and this is a specific exam search, ask Gemini if it knows the real proposal
      if (searchResults.length < 3) {
        try {
          // For specific exam searches, ask Gemini if it knows the real proposal
          if (isSpecificExamSearch && searchYear) {
            console.log(`🧠 Asking Gemini if it knows the real proposal for "${query}"`);
            const knowledgeResult = await geminiService.searchRealProposalsFromKnowledge(
              query, 
              examType || localAnalysis.suggestedExamTypes[0], 
              searchYear
            );
            
            // If Gemini knows the real proposal, save it
            if (knowledgeResult.found && knowledgeResult.proposals.length > 0) {
              for (const realProposal of knowledgeResult.proposals) {
                const savedProposal = await storage.createProposal(realProposal);
                searchResults.push(savedProposal);
              }
              console.log(`✅ Gemini knows this exam! Saved ${knowledgeResult.proposals.length} REAL proposal(s)`);
            } 
            // If Gemini doesn't know but suggests similar proposals, save them
            else if (!knowledgeResult.found && knowledgeResult.similarProposals.length > 0) {
              for (const similarProposal of knowledgeResult.similarProposals) {
                const savedProposal = await storage.createProposal(similarProposal);
                searchResults.push(savedProposal);
              }
              console.log(`ℹ️ Gemini suggested ${knowledgeResult.similarProposals.length} similar proposal(s)`);
            }
          }
          
          // If still have few results, generate with AI as fallback
          if (searchResults.length < 3) {
            let enhancedKeywords = [...localAnalysis.keywords];
            if (isSpecificExamSearch && searchYear) {
              enhancedKeywords = [query, ...localAnalysis.keywords];
            }
            
            const aiResult = await geminiService.generateProposalsBatch(
              { 
                examType: examType || localAnalysis.suggestedExamTypes[0], 
                theme: theme || localAnalysis.suggestedThemes[0], 
                difficulty 
              }, 
              enhancedKeywords
            );
            
            const aiProposals = aiResult.proposals;
            
            // Save generated proposals to storage with exam metadata
            for (const aiProposal of aiProposals) {
              const proposalToSave = {
                ...aiProposal,
                examName: isSpecificExamSearch ? query : aiProposal.examName,
                year: searchYear || aiProposal.year
              };
              const savedProposal = await storage.createProposal(proposalToSave);
              searchResults.push(savedProposal);
            }
            
            console.log(`🤖 Generated ${aiProposals.length} AI proposals for "${query}"`);
          }
        } catch (aiError) {
          console.error("AI proposal generation failed:", aiError);
        }
      }
      
      // For specific exam searches, return ALL results; otherwise limit to 10
      const resultsToReturn = isSpecificExamSearch ? searchResults : searchResults.slice(0, 10);
      
      res.json({
        results: resultsToReturn,
        count: searchResults.length,
        query: localAnalysis.normalizedQuery,
        futureExamDetected: false,
        isSpecificExamSearch,
        suggestions: {
          themes: localAnalysis.suggestedThemes,
          examTypes: localAnalysis.suggestedExamTypes
        }
      });
      
    } catch (error) {
      console.error("Proposal search error:", error);
      res.status(400).json({ message: "Invalid search request" });
    }
  });

  // Generate new proposals using AI
  app.post("/api/proposals/generate", async (req, res) => {
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 100, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      const validatedData = generateProposalSchema.parse(req.body);
      
      console.log(`🎯 Proposal generation request: ${validatedData.theme}, identifier: ${identifier}`);
      
      // Generate proposals using AI
      const aiResult = await geminiService.generateProposalsBatch(
        validatedData, 
        validatedData.keywords || []
      );
      
      const { proposals: aiProposals, promptTokens, outputTokens, tokensUsed } = aiResult;
      
      // Record AI operation usage with actual token counts
      console.log(`💰 Proposal generation - Tokens: ${promptTokens} input + ${outputTokens} output = ${tokensUsed} total`);
      
      await weeklyCostLimitingService.recordAIOperationWithTokens(
        identifier,
        'proposal_generation',
        promptTokens,
        outputTokens,
        planType
      );
      
      // Save generated proposals to storage
      const savedProposals = [];
      for (const aiProposal of aiProposals) {
        const savedProposal = await storage.createProposal(aiProposal);
        savedProposals.push(savedProposal);
      }
      
      res.json({
        results: savedProposals,
        count: savedProposals.length
      });
      
    } catch (error) {
      console.error("Proposal generation error:", error);
      res.status(400).json({ message: "Invalid generation request" });
    }
  });

  // Get all proposals endpoint (for browsing)
  app.get("/api/proposals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const proposals = await storage.getProposals(limit, offset);
      res.json({
        results: proposals,
        count: proposals.length,
        hasMore: proposals.length === limit
      });
    } catch (error) {
      console.error("Get proposals error:", error);
      res.status(500).json({ message: "Failed to get proposals" });
    }
  });

  // Save proposal to user's personal library
  app.post("/api/proposals/:id/save", requireAuth, async (req, res) => {
    try {
      const proposalId = req.params.id;
      const userId = req.session.userId!;
      
      const savedProposal = await storage.saveProposal(userId, proposalId);
      res.json({
        success: true,
        message: "Proposta salva com sucesso",
        savedProposal
      });
    } catch (error) {
      console.error("Save proposal error:", error);
      res.status(500).json({ message: "Failed to save proposal" });
    }
  });

  // Remove proposal from user's personal library
  app.delete("/api/proposals/:id/save", requireAuth, async (req, res) => {
    try {
      const proposalId = req.params.id;
      const userId = req.session.userId!;
      
      const removed = await storage.removeSavedProposal(userId, proposalId);
      if (removed) {
        res.json({
          success: true,
          message: "Proposta removida da biblioteca"
        });
      } else {
        res.status(404).json({ message: "Proposta não encontrada na biblioteca" });
      }
    } catch (error) {
      console.error("Remove saved proposal error:", error);
      res.status(500).json({ message: "Failed to remove saved proposal" });
    }
  });

  // Get user's saved proposals
  app.get("/api/proposals/saved", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      const savedProposals = await storage.getUserSavedProposals(userId);
      res.json({
        results: savedProposals,
        count: savedProposals.length
      });
    } catch (error) {
      console.error("Get saved proposals error:", error);
      res.status(500).json({ message: "Failed to get saved proposals" });
    }
  });

  // Check if proposal is saved by user
  app.get("/api/proposals/:id/saved", requireAuth, async (req, res) => {
    try {
      const proposalId = req.params.id;
      const userId = req.session.userId!;
      
      const isSaved = await storage.isProposalSaved(userId, proposalId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Check saved proposal error:", error);
      res.status(500).json({ message: "Failed to check if proposal is saved" });
    }
  });

  // AI Chat for argumentative structure - with conversation context and rate limiting
  app.post("/api/chat/argumentative", async (req, res) => {
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 100, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      const validatedData = chatMessageSchema.parse(req.body);
      const { conversationId, messageId, message, section, context } = validatedData;
      
      console.log(`🤖 AI Chat request for section: ${section}, identifier: ${identifier}`);
      
      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation) {
          // If conversation not found, create a new one instead of throwing error
          console.log(`⚠️ Conversation ${conversationId} not found, creating new conversation`);
          conversation = await storage.createConversation({
            userId: req.session.userId || null,
            sessionId: identifier,
            messages: [],
            currentSection: section,
            brainstormData: context || {}
          });
        }
      } else {
        // Create new conversation
        conversation = await storage.createConversation({
          userId: req.session.userId || null,
          sessionId: identifier,
          messages: [],
          currentSection: section,
          brainstormData: context || {}
        });
      }
      
      // Add user message to conversation (check for duplicate messageId)
      const existingMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
      const isDuplicate = messageId && existingMessages.some((msg: any) => msg.id === messageId);
      
      if (!isDuplicate) {
        const userMessage = {
          id: messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'user' as const,
          content: message,
          section,
          timestamp: new Date()
        };
        
        conversation = await storage.appendMessage(conversation.id, userMessage);
      }
      
      // Build conversation context for AI (last 12 messages + summary)
      const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
      const recentMessages = messages.slice(-12);
      
      // Generate AI response with OPTIMIZED conversation context
      const aiResult = await optimizedAnalysisService.generateWithContextOptimized(
        conversation.summary,
        recentMessages,
        section,
        context || {}
      );
      
      // Add AI response to conversation
      const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai' as const,
        content: aiResult.response,
        section,
        timestamp: new Date()
      };
      
      conversation = await storage.appendMessage(conversation.id, aiMessage);
      
      // Update brainstorm data and section if provided
      if (context) {
        conversation = await storage.updateConversationData(
          conversation.id, 
          context, 
          section
        );
      }
      
      // Generate summary periodically (every 6 messages)
      const messageCount = Array.isArray(conversation.messages) ? conversation.messages.length : 0;
      if (messageCount > 0 && messageCount % 6 === 0) {
        // TODO: Implement summary generation
        // const summary = await geminiService.generateSummary(conversation.messages);
        // await storage.updateConversationSummary(conversation.id, summary);
      }
      
      // Record telemetry for optimization tracking
      optimizationTelemetry.recordMetric({
        route: '/api/chat/argumentative',
        operation: 'chat-response',
        tokensOriginal: 900, // Estimated original tokens
        tokensOptimized: aiResult.tokensUsed || 280, // Estimated optimized tokens
        cacheHit: aiResult.source === 'cache',
        source: aiResult.source || 'optimized_ai',
        responseTime: Date.now() - Date.now() // This would be calculated properly in real implementation
      });

      // Calculate real cost based on actual tokens from Gemini
      const promptTokens = aiResult.promptTokens || Math.floor((aiResult.tokensUsed || 280) * 0.6);
      const outputTokens = aiResult.outputTokens || Math.floor((aiResult.tokensUsed || 280) * 0.4);
      
      const costEstimate = await weeklyCostLimitingService.estimateOperationCost(
        promptTokens,
        outputTokens
      );

      // Record AI operation usage with REAL cost based on actual Gemini token counts
      const usageResult = await weeklyCostLimitingService.recordAIOperation(
        identifier,
        'chat_argumentative',
        costEstimate.estimatedCostCentavos,
        planType
      );
      
      console.log(`💰 AI Chat cost: ${promptTokens} input + ${outputTokens} output = ${costEstimate.estimatedCostBRL}`);

      res.json({
        conversationId: conversation.id,
        response: aiResult.response,
        section,
        source: aiResult.source,
        tokensSaved: aiResult.tokensSaved || 0,
        tokensUsed: promptTokens + outputTokens,
        usageStats: usageResult.usageStats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("AI Chat error:", error);
      // Ensure we always return JSON even in error cases
      try {
        res.status(500).json({ 
          message: "Failed to generate AI response",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      } catch (jsonError) {
        // If JSON response fails, send a basic text response
        res.status(500).send('{"message":"Internal server error"}');
      }
    }
  });

  // Text Modification API endpoint
  app.post("/api/text-modification", async (req, res) => {
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 100, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      // Validate input using shared schema
      const validatedData = textModificationRequestSchema.parse(req.body);
      const { text, type, config } = validatedData;
      
      console.log(`✏️ Text modification request: ${type}, identifier: ${identifier}`);
      
      // Process text with AI
      const result = await textModificationService.modifyText(text, type, config || {});
      
      // Record telemetry for optimization tracking
      optimizationTelemetry.recordMetric({
        route: '/api/text-modification',
        operation: `text-${type}`,
        tokensOriginal: 600, // Estimated original tokens
        tokensOptimized: result.tokensUsed || 200, // Estimated optimized tokens
        cacheHit: result.source === 'cache',
        source: result.source || 'optimized_ai',
        responseTime: Date.now() - Date.now() // This would be calculated properly in real implementation
      });

      // Calculate real cost based on actual Gemini tokens
      const promptTokens = result.promptTokens || Math.floor((result.tokensUsed || 200) * 0.7);
      const outputTokens = result.outputTokens || Math.floor((result.tokensUsed || 200) * 0.3);
      
      const costEstimate = await weeklyCostLimitingService.estimateOperationCost(
        promptTokens,
        outputTokens
      );

      // Record AI operation usage with REAL cost based on actual Gemini token counts
      const usageResult = await weeklyCostLimitingService.recordAIOperation(
        identifier,
        `text_modification_${type}`,
        costEstimate.estimatedCostCentavos,
        planType
      );
      
      console.log(`💰 Text modification cost: ${promptTokens} input + ${outputTokens} output = ${costEstimate.estimatedCostBRL}`);

      res.json({
        ...result,
        tokensUsed: promptTokens + outputTokens,
        usageStats: usageResult.usageStats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Text modification error:", error);
      res.status(500).json({ 
        message: "Failed to modify text",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get text modification cache statistics (for debugging)
  app.get("/api/text-modification/stats", async (req, res) => {
    try {
      const stats = textModificationService.getCacheStats();
      res.json({
        ...stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Text modification stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Clear all caches (for development/debugging)
  app.post("/api/admin/clear-cache", async (req, res) => {
    try {
      intelligentCache.clearAll();
      res.json({ 
        success: true, 
        message: "All caches cleared successfully" 
      });
    } catch (error) {
      console.error("Cache clear error:", error);
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  // ===================== ESSAY CORRECTION ROUTES =====================

  // Essay correction endpoint with AI
  app.post("/api/essays/correct", async (req, res) => {
    try {
      // Check AI usage limits for all users (authenticated and anonymous)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 150, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      const { essayText, topic, examType, simulationId, timeBreakdown } = req.body;
      
      if (!essayText || !topic) {
        return res.status(400).json({ message: "Essay text and topic are required" });
      }
      
      // Save time breakdown and essay text to simulation if simulationId is provided
      if (simulationId) {
        try {
          await storage.updateSimulation(simulationId, {
            essayText,
            timeBreakdown,
            timeTaken: timeBreakdown?.totalUsed ? Math.floor(timeBreakdown.totalUsed / 60) : null
          });
          console.log(`✅ Saved time breakdown and essay text for simulation ${simulationId}`);
        } catch (saveError) {
          console.error('Error saving simulation data:', saveError);
        }
      }
      
      // Validate minimum length - equivalent to 10 lines of normal essay writing
      const trimmedText = essayText.trim();
      const lineCount = trimmedText.split('\n').length;
      const estimatedLineCount = Math.max(lineCount, Math.ceil(trimmedText.length / 25)); // 25 chars per typical line
      
      if (estimatedLineCount < 10) {
        return res.status(400).json({ 
          message: "Redação muito curta para correção. Escreva pelo menos o equivalente a 10 linhas de uma redação normal para receber uma correção com IA.",
          currentLines: estimatedLineCount,
          minimumRequired: 10
        });
      }
      
      console.log(`📝 Essay correction request, ${essayText.length} characters, identifier: ${identifier}`);
      
      // Correct essay using Gemini AI
      const correction = await textModificationService.correctEssay(
        essayText, 
        topic, 
        examType || 'ENEM'
      );
      
      // Calculate real cost based on actual Gemini tokens (essay correction uses more tokens)
      const promptTokens = correction.promptTokens || Math.floor((correction.tokensUsed || 800) * 0.75);
      const outputTokens = correction.outputTokens || Math.floor((correction.tokensUsed || 800) * 0.25);
      
      const costEstimate = await weeklyCostLimitingService.estimateOperationCost(
        promptTokens,
        outputTokens
      );

      // Record AI operation usage with REAL cost based on actual Gemini token counts
      const usageResult = await weeklyCostLimitingService.recordAIOperation(
        identifier,
        'essay_correction',
        costEstimate.estimatedCostCentavos,
        planType
      );
      
      console.log(`💰 Essay correction cost: ${promptTokens} input + ${outputTokens} output = ${costEstimate.estimatedCostBRL}`);
      
      // Save correction data to simulation if simulationId is provided
      if (simulationId) {
        try {
          await storage.updateSimulation(simulationId, {
            correctionData: correction,
            score: correction.totalScore || null,
            isCompleted: true,
            progress: 100
          });
          console.log(`✅ Saved correction data for simulation ${simulationId}`);
        } catch (saveError) {
          console.error('Error saving correction data:', saveError);
        }
      }

      // Save score to userScores table if user is authenticated
      if (req.session.userId && correction.totalScore !== undefined) {
        try {
          const competencies = correction.competencies || [];
          
          await storage.createUserScore({
            userId: req.session.userId,
            score: correction.totalScore,
            competence1: competencies[0]?.score ?? null,
            competence2: competencies[1]?.score ?? null,
            competence3: competencies[2]?.score ?? null,
            competence4: competencies[3]?.score ?? null,
            competence5: competencies[4]?.score ?? null,
            examName: topic || 'Redação ENEM',
            source: simulationId ? 'simulation' : 'essay',
            sourceId: simulationId || null,
            scoreDate: new Date()
          });
          console.log(`✅ Saved score ${correction.totalScore} with competencies [${competencies.map((c: any) => c?.score).join(', ')}] to userScores for user ${req.session.userId}`);

          // Update user progress (average score and essay count)
          await storage.updateUserProgressAfterCorrection(req.session.userId);
          console.log(`✅ Updated user progress for user ${req.session.userId}`);
        } catch (saveError) {
          console.error('❌ Error saving user score:', saveError);
        }
      }
      
      res.json({
        success: true,
        correction,
        tokensUsed: promptTokens + outputTokens,
        usageStats: usageResult.usageStats,
        message: "Essay corrected successfully"
      });
      
    } catch (error) {
      console.error("Essay correction error:", error);
      res.status(500).json({ message: "Failed to correct essay. Please try again." });
    }
  });

  // ===================== SIMULATION ROUTES =====================

  // Create a new simulation
  app.post("/api/simulations", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.parse(req.body);
      
      // Generate a session ID if not provided (for anonymous users)
      const sessionId = validatedData.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const simulation = await storage.createSimulation({
        ...validatedData,
        sessionId
      });
      
      res.status(201).json({
        success: true,
        simulation
      });
    } catch (error) {
      console.error("Create simulation error:", error);
      res.status(400).json({ message: "Invalid simulation data" });
    }
  });

  // Get simulations (with optional filtering)
  app.get("/api/simulations", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const sessionId = req.query.sessionId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const simulations = await storage.getSimulations(userId, sessionId, limit, offset);
      
      res.json({
        results: simulations,
        count: simulations.length,
        hasMore: simulations.length === limit
      });
    } catch (error) {
      console.error("Get simulations error:", error);
      res.status(500).json({ message: "Failed to get simulations" });
    }
  });

  // Update a simulation (for completing, scoring, etc.)
  app.put("/api/simulations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSimulationSchema.partial().parse(req.body);
      const updateData = validatedData;
      
      const simulation = await storage.updateSimulation(id, updateData);
      
      res.json({
        success: true,
        simulation
      });
    } catch (error) {
      console.error("Update simulation error:", error);
      if (error instanceof Error && error.message === "Simulation not found") {
        res.status(404).json({ message: "Simulation not found" });
      } else {
        res.status(500).json({ message: "Failed to update simulation" });
      }
    }
  });

  // Get a specific simulation
  app.get("/api/simulations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const simulation = await storage.getSimulation(id);
      
      if (!simulation) {
        return res.status(404).json({ message: "Simulation not found" });
      }
      
      res.json(simulation);
    } catch (error) {
      console.error("Get simulation error:", error);
      res.status(500).json({ message: "Failed to get simulation" });
    }
  });

  // ===================== USER SCORES ROUTES =====================

  // Get all user scores (used by dashboard)
  app.get("/api/user-scores", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const scores = await storage.getUserScores(req.session.userId);
      
      res.json(scores);
    } catch (error) {
      console.error("Get user scores error:", error);
      res.status(500).json({ message: "Falha ao carregar notas" });
    }
  });

  // Create a new user score (manual entry)
  app.post("/api/user-scores", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { score, competence1, competence2, competence3, competence4, competence5, examName, scoreDate } = req.body;

      const newScore = await storage.createUserScore({
        userId: req.session.userId,
        score,
        competence1: competence1 || null,
        competence2: competence2 || null,
        competence3: competence3 || null,
        competence4: competence4 || null,
        competence5: competence5 || null,
        examName: examName || 'Nota Manual',
        source: 'manual',
        sourceId: null,
        scoreDate: new Date(scoreDate)
      });

      // Update user progress
      await storage.updateUserProgressAfterCorrection(req.session.userId);

      res.status(201).json(newScore);
    } catch (error) {
      console.error("Create user score error:", error);
      res.status(500).json({ message: "Falha ao adicionar nota" });
    }
  });

  // Update a user score
  app.patch("/api/user-scores/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;
      const updateData = req.body;

      const updatedScore = await storage.updateUserScore(id, updateData);

      // Update user progress after score update
      await storage.updateUserProgressAfterCorrection(req.session.userId);

      res.json(updatedScore);
    } catch (error) {
      console.error("Update user score error:", error);
      res.status(500).json({ message: "Falha ao atualizar nota" });
    }
  });

  // Delete a user score
  app.delete("/api/user-scores/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { id } = req.params;
      const deleted = await storage.deleteUserScore(id);

      if (!deleted) {
        return res.status(404).json({ message: "Nota não encontrada" });
      }

      // Update user progress after score deletion
      await storage.updateUserProgressAfterCorrection(req.session.userId);

      res.json({ success: true, message: "Nota removida com sucesso" });
    } catch (error) {
      console.error("Delete user score error:", error);
      res.status(500).json({ message: "Falha ao remover nota" });
    }
  });

  // Get user competencies analysis
  app.get("/api/user-competencies", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const period = req.query.period as string || 'all';
      const scores = await storage.getUserScores(req.session.userId);

      // Filter scores by period
      let filteredScores = scores;
      if (period !== 'all') {
        const now = new Date();
        const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 0;
        
        if (periodDays > 0) {
          const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
          filteredScores = scores.filter(s => new Date(s.scoreDate) >= cutoffDate);
        } else if (period === 'last') {
          // Get only the most recent score
          filteredScores = scores.length > 0 ? [scores[0]] : [];
        }
      }

      if (filteredScores.length === 0) {
        return res.json({
          hasData: false,
          weakestCompetencies: [],
          averages: {
            competence1: 0,
            competence2: 0,
            competence3: 0,
            competence4: 0,
            competence5: 0
          },
          overallAverage: 0,
          essaysAnalyzed: 0
        });
      }

      // Calculate averages for each competency
      const competencies = ['competence1', 'competence2', 'competence3', 'competence4', 'competence5'] as const;
      const averages: any = {};
      
      competencies.forEach((comp) => {
        const validScores = filteredScores
          .map(s => s[comp])
          .filter(val => val !== null && val !== undefined) as number[];
        
        averages[comp] = validScores.length > 0
          ? Math.round(validScores.reduce((sum, val) => sum + val, 0) / validScores.length)
          : 0;
      });

      // Find weakest competencies (lowest 3 averages)
      const competencyData = [
        { id: 1, name: 'Competência I', key: 'competence1', score: averages.competence1, feedback: 'Domínio da norma culta da língua portuguesa' },
        { id: 2, name: 'Competência II', key: 'competence2', score: averages.competence2, feedback: 'Compreensão do tema e tipo textual' },
        { id: 3, name: 'Competência III', key: 'competence3', score: averages.competence3, feedback: 'Seleção e organização de argumentos' },
        { id: 4, name: 'Competência IV', key: 'competence4', score: averages.competence4, feedback: 'Conhecimento dos mecanismos linguísticos' },
        { id: 5, name: 'Competência V', key: 'competence5', score: averages.competence5, feedback: 'Elaboração de proposta de intervenção' }
      ];

      const weakestCompetencies = competencyData
        .filter(c => c.score > 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

      const overallAverage = Math.round(
        Object.values(averages).reduce((sum: number, val: any) => sum + val, 0) / 5
      );

      res.json({
        hasData: true,
        weakestCompetencies,
        averages,
        overallAverage,
        essaysAnalyzed: filteredScores.length
      });
    } catch (error) {
      console.error("Get competencies error:", error);
      res.status(500).json({ message: "Falha ao carregar competências" });
    }
  });

  // ===================== DASHBOARD ROUTES =====================

  // Get user score history for evolution graph
  app.get("/api/dashboard/scores", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const scores = await storage.getUserScores(req.session.userId);
      
      const formattedScores = scores.map(score => ({
        id: score.id,
        score: score.score,
        date: score.scoreDate,
        examName: score.examName,
        source: score.source
      }));

      res.json({
        success: true,
        scores: formattedScores
      });
    } catch (error) {
      console.error("Get dashboard scores error:", error);
      res.status(500).json({ message: "Falha ao carregar histórico de notas" });
    }
  });

  // Get competency averages for competencies breakdown graph
  app.get("/api/dashboard/competencies", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const scores = await storage.getUserScores(req.session.userId);
      
      if (scores.length === 0) {
        return res.json({
          success: true,
          competencies: []
        });
      }

      const competencies = [
        { name: 'Competência I', key: 'competence1', description: 'Domínio da norma culta' },
        { name: 'Competência II', key: 'competence2', description: 'Compreensão do tema' },
        { name: 'Competência III', key: 'competence3', description: 'Argumentação' },
        { name: 'Competência IV', key: 'competence4', description: 'Coesão' },
        { name: 'Competência V', key: 'competence5', description: 'Proposta de intervenção' }
      ];

      const averages = competencies.map(comp => {
        const validScores = scores
          .map(s => s[comp.key as keyof typeof s] as number)
          .filter(val => val !== null && val !== undefined);
        
        const average = validScores.length > 0
          ? Math.round(validScores.reduce((sum, val) => sum + val, 0) / validScores.length)
          : 0;

        return {
          name: comp.name,
          description: comp.description,
          average,
          maxScore: 200
        };
      });

      res.json({
        success: true,
        competencies: averages
      });
    } catch (error) {
      console.error("Get competencies error:", error);
      res.status(500).json({ message: "Falha ao carregar competências" });
    }
  });

  // Get general dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const [userProgress, scores] = await Promise.all([
        storage.getUserProgress(req.session.userId),
        storage.getUserScores(req.session.userId)
      ]);

      const stats = {
        averageScore: userProgress?.averageScore || 0,
        essaysCount: userProgress?.essaysCount || scores.length,
        targetScore: userProgress?.targetScore || 900,
        studyHours: userProgress?.studyHours || 0,
        streak: userProgress?.streak || 0,
        lastEssayDate: scores.length > 0 ? scores[0].scoreDate : null,
        recentScores: scores.slice(0, 5).map(s => ({
          score: s.score,
          date: s.scoreDate,
          examName: s.examName
        }))
      };

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Falha ao carregar estatísticas" });
    }
  });

  // ===================== OPTIMIZATION TELEMETRY ROUTES =====================

  // Get optimization statistics and telemetry
  app.get("/api/optimization/stats", async (req, res) => {
    try {
      const stats = optimizationTelemetry.getStats();
      const performance = optimizationTelemetry.getPerformanceSummary();
      
      res.json({
        success: true,
        stats,
        performance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Optimization stats error:", error);
      res.status(500).json({ message: "Failed to get optimization statistics" });
    }
  });

  // Get detailed optimization report
  app.get("/api/optimization/report", async (req, res) => {
    try {
      const report = optimizationTelemetry.generateReport();
      
      res.json({
        success: true,
        report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Optimization report error:", error);
      res.status(500).json({ message: "Failed to generate optimization report" });
    }
  });

  // Get optimization metrics for a specific route
  app.get("/api/optimization/route/:route", async (req, res) => {
    try {
      const route = decodeURIComponent(req.params.route);
      const operation = req.query.operation as string;
      
      const metrics = optimizationTelemetry.getRouteMetrics(route, operation);
      
      res.json({
        success: true,
        route,
        operation: operation || 'all',
        metrics,
        count: metrics.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Route metrics error:", error);
      res.status(500).json({ message: "Failed to get route metrics" });
    }
  });

  // ===================== ADMIN & COST TRACKING ROUTES =====================

  // Admin dashboard - Business overview
  app.get('/api/admin/overview', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      
      // Get business overview for the last N days
      const overview = await storage.getBusinessOverview(
        new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        new Date()
      );
      
      res.json(overview);
    } catch (error) {
      console.error('Error getting business overview:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin dashboard - Top cost users
  app.get('/api/admin/top-users', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const topUsers = await storage.getTopCostUsers(
        new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        new Date(),
        limit
      );
      
      res.json(topUsers);
    } catch (error) {
      console.error('Error getting top cost users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin dashboard - User cost summary
  app.get('/api/admin/user-costs', async (req, res) => {
    try {
      const { userId, ipAddress } = req.query as { userId?: string; ipAddress?: string };
      const days = parseInt(req.query.days as string) || 30;
      
      if (!userId && !ipAddress) {
        return res.status(400).json({ message: 'Either userId or ipAddress must be provided' });
      }
      
      const summary = await storage.getUserCostSummary(
        { userId, ipAddress },
        new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        new Date()
      );
      
      res.json(summary);
    } catch (error) {
      console.error('Error getting user cost summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin dashboard - Daily operation stats
  app.get('/api/admin/daily-stats', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const stats = await storage.getDailyOperationStats(startDate, endDate);
      
      res.json(stats);
    } catch (error) {
      console.error('Error getting daily stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin dashboard - User activity stats
  app.get('/api/admin/user-activity', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      
      const stats = await storage.getUserActivityStats(days);
      
      res.json(stats);
    } catch (error) {
      console.error('Error getting user activity stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin dashboard - Generate daily metrics (manual trigger)
  app.post('/api/admin/generate-metrics', async (req, res) => {
    try {
      const { date } = req.body;
      const targetDate = date ? new Date(date) : new Date();
      
      // Initialize cost tracking service
      const { CostTrackingService } = await import('./cost-tracking-service');
      const costTracker = new CostTrackingService(storage);
      
      await costTracker.generateDailyMetrics(targetDate);
      
      res.json({ success: true, message: 'Daily metrics generated successfully' });
    } catch (error) {
      console.error('Error generating daily metrics:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Admin dashboard - Real-time cost tracking (for current day)
  app.get('/api/admin/current-costs', async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const stats = await storage.getDailyOperationStats(today, tomorrow);
      
      res.json({
        ...stats,
        date: today.toISOString().split('T')[0],
        realTime: true
      });
    } catch (error) {
      console.error('Error getting current costs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get usage patterns by hour of day
  app.get('/api/admin/usage-patterns', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const hourlyPatterns = await storage.getHourlyUsagePatterns(startDate, endDate);
      
      res.json({
        patterns: hourlyPatterns,
        timeRange: { start: startDate, end: endDate },
        analysisDate: new Date()
      });
    } catch (error) {
      console.error('Error getting usage patterns:', error);
      res.status(500).json({ message: 'Failed to get usage patterns' });
    }
  });

  // Get detailed user list with metrics
  app.get('/api/admin/users-detailed', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const detailedUsers = await storage.getDetailedUsersList(days, limit);
      
      res.json({
        users: detailedUsers,
        totalUsers: detailedUsers.length,
        analysisDate: new Date()
      });
    } catch (error) {
      console.error('Error getting detailed users:', error);
      res.status(500).json({ message: 'Failed to get detailed users' });
    }
  });

  // Get tools ranking by usage
  app.get('/api/admin/tools-ranking', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const toolsRanking = await storage.getToolsRankingByUsage(startDate, endDate);
      
      res.json({
        ranking: toolsRanking,
        timeRange: { start: startDate, end: endDate },
        analysisDate: new Date()
      });
    } catch (error) {
      console.error('Error getting tools ranking:', error);
      res.status(500).json({ message: 'Failed to get tools ranking' });
    }
  });

  // Get user access frequency
  app.get('/api/admin/access-frequency', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const accessFrequency = await storage.getUserAccessFrequency(startDate, endDate);
      
      res.json({
        frequency: accessFrequency,
        timeRange: { start: startDate, end: endDate },
        analysisDate: new Date()
      });
    } catch (error) {
      console.error('Error getting access frequency:', error);
      res.status(500).json({ message: 'Failed to get access frequency' });
    }
  });

  // ===================== PRICING & CURRENCY MONITORING ROUTES =====================

  // Get current pricing information with real-time exchange rates
  app.get('/api/pricing/current', async (req, res) => {
    try {
      const { CostTrackingService } = await import('./cost-tracking-service');
      const costTracker = new CostTrackingService(storage);
      
      const pricing = await costTracker.getCurrentPricing();
      
      res.json({
        success: true,
        ...pricing,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting current pricing:', error);
      res.status(500).json({ message: 'Failed to get pricing information' });
    }
  });

  // Estimate cost for planned operation
  app.post('/api/pricing/estimate', async (req, res) => {
    try {
      const { inputTokens, outputTokens } = req.body;
      
      if (!inputTokens || !outputTokens || inputTokens < 0 || outputTokens < 0) {
        return res.status(400).json({ 
          message: 'Valid inputTokens and outputTokens are required' 
        });
      }

      const { CostTrackingService } = await import('./cost-tracking-service');
      const costTracker = new CostTrackingService(storage);
      
      const estimate = await costTracker.estimateOperationCost(inputTokens, outputTokens);
      
      res.json({
        success: true,
        ...estimate,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error estimating operation cost:', error);
      res.status(500).json({ message: 'Failed to estimate operation cost' });
    }
  });

  // Get current USD/BRL exchange rate information
  app.get('/api/currency/usd-brl', async (req, res) => {
    try {
      const { currencyService } = await import('./currency-service');
      
      const rateInfo = await currencyService.getRateInfo();
      
      res.json({
        success: true,
        ...rateInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      res.status(500).json({ message: 'Failed to get exchange rate' });
    }
  });

  // Force refresh exchange rate (useful for testing)
  app.post('/api/currency/refresh', async (req, res) => {
    try {
      const { currencyService } = await import('./currency-service');
      
      const newRate = await currencyService.forceRefresh();
      const rateInfo = await currencyService.getRateInfo();
      
      res.json({
        success: true,
        message: 'Exchange rate refreshed successfully',
        ...rateInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error refreshing exchange rate:', error);
      res.status(500).json({ message: 'Failed to refresh exchange rate' });
    }
  });

  // Convert USD amount to BRL
  app.post('/api/currency/convert', async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || amount < 0) {
        return res.status(400).json({ 
          message: 'Valid amount in USD is required' 
        });
      }

      const { currencyService } = await import('./currency-service');
      
      const brlAmount = await currencyService.convertUSDtoBRL(amount);
      const rateInfo = await currencyService.getRateInfo();
      
      res.json({
        success: true,
        conversion: {
          usd: amount,
          brl: parseFloat(brlAmount.toFixed(4)),
          rate: rateInfo.rate
        },
        exchangeRate: rateInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error converting currency:', error);
      res.status(500).json({ message: 'Failed to convert currency' });
    }
  });

  // Weekly usage endpoints for unified AI cost limiting
  
  // Get current weekly usage stats
  app.get("/api/weekly-usage/stats", async (req, res) => {
    try {
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const stats = await weeklyCostLimitingService.getWeeklyUsageStats(identifier, planType);
      
      res.json({
        success: true,
        stats,
        planType
      });
    } catch (error) {
      console.error("Error fetching weekly usage stats:", error);
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  // Check if operation is allowed within weekly limits
  app.post("/api/weekly-usage/check", async (req, res) => {
    try {
      const { estimatedInputTokens = 1000, estimatedOutputTokens = 500 } = req.body;
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      // Estimate cost for the operation
      const costEstimate = await weeklyCostLimitingService.estimateOperationCost(
        estimatedInputTokens, 
        estimatedOutputTokens
      );
      
      // Check if operation is allowed
      const limitCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(
        identifier,
        costEstimate.estimatedCostCentavos,
        planType
      );
      
      res.json({
        success: true,
        allowed: limitCheck.allowed,
        costEstimate,
        planType,
        usageStats: {
          currentUsageCentavos: limitCheck.currentUsageCentavos,
          limitCentavos: limitCheck.limitCentavos,
          remainingCentavos: limitCheck.remainingCentavos,
          usagePercentage: 100 - limitCheck.remainingPercentage,
          daysUntilReset: limitCheck.daysUntilReset
        }
      });
    } catch (error) {
      console.error("Error checking weekly usage limit:", error);
      res.status(500).json({ message: "Failed to check usage limit" });
    }
  });

  // Record AI operation usage (called after successful AI operations)
  app.post("/api/weekly-usage/record", async (req, res) => {
    try {
      const { operation, costCentavos } = req.body;
      
      if (!operation || !costCentavos || costCentavos < 0) {
        return res.status(400).json({ 
          message: "Valid operation and cost are required" 
        });
      }
      
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const result = await weeklyCostLimitingService.recordAIOperation(
        identifier,
        operation,
        costCentavos,
        planType
      );
      
      res.json({
        success: result.success,
        usageStats: result.usageStats,
        planType
      });
    } catch (error) {
      console.error("Error recording AI operation:", error);
      res.status(500).json({ message: "Failed to record operation" });
    }
  });

  // Get usage analytics for monitoring
  app.get("/api/weekly-usage/analytics", async (req, res) => {
    try {
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      const analytics = await weeklyCostLimitingService.getUsageAnalytics(
        identifier, 
        planType
      );
      
      res.json({
        success: true,
        analytics,
        planType
      });
    } catch (error) {
      console.error("Error fetching usage analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===================== FASE 1: RECEITA + IA COST TRACKING APIs =====================

  // Get revenue overview
  app.get("/api/admin/revenue-overview", async (req, res) => {
    try {
      const { days = '30' } = req.query;
      const revenueOverview = await storage.getRevenueOverview(parseInt(days as string));
      
      res.json({
        success: true,
        data: revenueOverview,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching revenue overview:", error);
      res.status(500).json({ message: "Failed to fetch revenue overview" });
    }
  });

  // Get subscription plans
  app.get("/api/admin/subscription-plans", async (req, res) => {
    try {
      const { activeOnly } = req.query;
      const plans = await storage.getSubscriptionPlans(activeOnly === 'true');
      
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Get active subscriptions summary
  app.get("/api/admin/subscriptions-summary", async (req, res) => {
    try {
      const activeSubscriptions = await storage.getActiveSubscriptions();
      const trialSubscriptions = await storage.getSubscriptionsByStatus('trial');
      const cancelledSubscriptions = await storage.getSubscriptionsByStatus('cancelled');
      
      const summary = {
        totalActive: activeSubscriptions.length,
        totalTrial: trialSubscriptions.length,
        totalCancelled: cancelledSubscriptions.length,
        subscriptionsByPlan: {} as Record<string, number>
      };

      // Group by plan
      for (const sub of activeSubscriptions) {
        const plan = await storage.getSubscriptionPlan(sub.planId);
        const planName = plan?.name || 'Unknown Plan';
        summary.subscriptionsByPlan[planName] = (summary.subscriptionsByPlan[planName] || 0) + 1;
      }
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error("Error fetching subscriptions summary:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions summary" });
    }
  });

  // Get recent transactions
  app.get("/api/admin/recent-transactions", async (req, res) => {
    try {
      const { days = '7', limit = '50' } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const transactions = await storage.getTransactionsByDateRange(startDate, new Date());
      const limitedTransactions = transactions.slice(0, parseInt(limit as string));
      
      res.json({
        success: true,
        data: limitedTransactions,
        total: transactions.length
      });
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  // ===================== FASE 2: FUNIL DE CONVERSÃO + UX COMPLETION RATES APIs =====================

  // Get conversion funnel data
  app.get("/api/admin/conversion-funnels", async (req, res) => {
    try {
      const { funnelName, days = '30' } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const conversionRates = await storage.getConversionRates(
        funnelName as string || 'signup_to_paid',
        startDate,
        endDate
      );
      
      res.json({
        success: true,
        data: conversionRates,
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error("Error fetching conversion funnels:", error);
      res.status(500).json({ message: "Failed to fetch conversion funnel data" });
    }
  });

  // Get session metrics
  app.get("/api/admin/session-metrics", async (req, res) => {
    try {
      const { days = '7' } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const sessionMetrics = await storage.getSessionMetrics(startDate, endDate);
      
      res.json({
        success: true,
        data: sessionMetrics,
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error("Error fetching session metrics:", error);
      res.status(500).json({ message: "Failed to fetch session metrics" });
    }
  });

  // Get task completion rates
  app.get("/api/admin/task-completion-rates", async (req, res) => {
    try {
      const { taskType, days = '30' } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const taskCompletionRates = await storage.getTaskCompletionRates(
        taskType as string,
        startDate,
        endDate
      );
      
      res.json({
        success: true,
        data: taskCompletionRates,
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error("Error fetching task completion rates:", error);
      res.status(500).json({ message: "Failed to fetch task completion rates" });
    }
  });

  // Get user events analytics
  app.get("/api/admin/user-events", async (req, res) => {
    try {
      const { eventType, days = '7' } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const events = await storage.getEventsByDateRange(startDate, endDate, eventType as string);
      
      // Group events by type for analytics
      const eventsByType: Record<string, number> = {};
      const eventsByDay: Record<string, number> = {};
      
      events.forEach(event => {
        // Count by type
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
        
        // Count by day
        if (event.createdAt) {
          const day = event.createdAt.toISOString().split('T')[0];
          eventsByDay[day] = (eventsByDay[day] || 0) + 1;
        }
      });
      
      res.json({
        success: true,
        data: {
          totalEvents: events.length,
          eventsByType,
          eventsByDay,
          recentEvents: events.slice(0, 20) // Last 20 events
        },
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // ===================== FASE 3: ADVANCED COHORT ANALYSIS + PREDICTIVE METRICS APIs =====================

  // Get cohort analysis
  app.get("/api/admin/cohort-analysis", async (req, res) => {
    try {
      const { cohortMonth } = req.query;
      
      let cohortDate: Date | undefined;
      if (cohortMonth) {
        cohortDate = new Date(cohortMonth as string);
      }
      
      const cohortAnalysis = await storage.getCohortAnalysis(cohortDate);
      
      res.json({
        success: true,
        data: cohortAnalysis
      });
    } catch (error) {
      console.error("Error fetching cohort analysis:", error);
      res.status(500).json({ message: "Failed to fetch cohort analysis" });
    }
  });

  // Get revenue by source
  app.get("/api/admin/revenue-by-source", async (req, res) => {
    try {
      const { days = '30' } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days as string));
      
      const revenueBySource = await storage.getRevenueBySource(startDate, endDate);
      
      res.json({
        success: true,
        data: revenueBySource,
        period: { startDate, endDate }
      });
    } catch (error) {
      console.error("Error fetching revenue by source:", error);
      res.status(500).json({ message: "Failed to fetch revenue by source" });
    }
  });

  // Get high risk users (churn predictions)
  app.get("/api/admin/high-risk-users", async (req, res) => {
    try {
      const { limit = '20' } = req.query;
      const highRiskUsers = await storage.getHighRiskUsers(parseInt(limit as string));
      
      res.json({
        success: true,
        data: highRiskUsers,
        total: highRiskUsers.length
      });
    } catch (error) {
      console.error("Error fetching high risk users:", error);
      res.status(500).json({ message: "Failed to fetch high risk users" });
    }
  });

  // Get predictive metrics
  app.get("/api/admin/predictive-metrics", async (req, res) => {
    try {
      const { metricType = 'churn_prediction', timeHorizon } = req.query;
      
      const predictions = await storage.getLatestPredictions(metricType as string);
      
      res.json({
        success: true,
        data: predictions,
        metricType,
        timeHorizon
      });
    } catch (error) {
      console.error("Error fetching predictive metrics:", error);
      res.status(500).json({ message: "Failed to fetch predictive metrics" });
    }
  });

  // Generate sample metrics data for testing
  app.post("/api/admin/generate-sample-data", async (req, res) => {
    try {
      const { dataType = 'all' } = req.body;
      
      // Generate sample revenue metrics
      if (dataType === 'all' || dataType === 'revenue') {
        await storage.createRevenueMetric({
          metricDate: new Date(),
          mrr: 15000, // R$ 150.00
          arr: 180000, // R$ 1,800.00
          totalActiveSubscriptions: 25,
          paidUsers: 20,
          trialUsers: 5,
          arpu: 7500, // R$ 75.00
          grossMarginPercent: 8500, // 85%
        });
      }

      // Generate sample user events
      if (dataType === 'all' || dataType === 'events') {
        const sessionId = `session_${Date.now()}`;
        await storage.createUserEvent({
          sessionId,
          eventType: 'signup',
          eventName: 'User Registration',
          properties: { source: 'organic', campaign: 'landing_page' },
          source: 'organic',
        });
      }

      // Generate sample task completion
      if (dataType === 'all' || dataType === 'tasks') {
        const sessionId = `session_${Date.now()}`;
        await storage.createTaskCompletion({
          sessionId,
          taskType: 'essay_creation',
          taskName: 'Create First Essay',
          status: 'completed',
          timeToComplete: 300, // 5 minutes
          satisfactionScore: 4,
          npsScore: 8,
        });
      }

      res.json({
        success: true,
        message: `Sample data generated for: ${dataType}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating sample data:", error);
      res.status(500).json({ message: "Failed to generate sample data" });
    }
  });

  // ===================== ESSAY OUTLINE GENERATION =====================
  
  // Generate essay outline using Gemini AI
  app.post("/api/generate-outline", async (req, res) => {
    try {
      const questionnaireData = req.body;
      
      // Validate questionnaire data
      if (!questionnaireData.proposal || !questionnaireData.familiarityLevel || !questionnaireData.detailLevel) {
        return res.status(400).json({ 
          message: "Dados do questionário incompletos" 
        });
      }

      // Get identifier for cost tracking (user ID or IP)
      const identifier = getAITrackingIdentifier(req);
      const planType = req.session.userId 
        ? await subscriptionService.getUserPlanType(req.session.userId)
        : 'free';
      
      // Check weekly cost limit before proceeding
      const weeklyCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(identifier, 150, planType);
      
      if (!weeklyCheck.allowed) {
        const limitMessage = planType === 'free' 
          ? `Limite quinzenal de R$2,19 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$2,19. Faça upgrade para o Plano Pro e tenha R$8,75 semanais!`
          : `Limite semanal de R$8,75 atingido. Você usou ${(weeklyCheck.currentUsageCentavos / 100).toFixed(2)} de R$8,75. Aguarde ${weeklyCheck.daysUntilReset} dia(s) para resetar.`;
        
        return res.status(403).json({ 
          message: limitMessage,
          upgradeRequired: planType === 'free',
          action: planType === 'free' ? "upgrade" : "wait",
          daysUntilReset: weeklyCheck.daysUntilReset
        });
      }

      console.log(`📝 Essay outline generation request for proposal: "${questionnaireData.proposal.substring(0, 50)}..." by ${identifier}`);

      // Generate outline using Gemini
      const result = await geminiService.generateEssayOutline(questionnaireData);
      
      // Record AI operation with actual token usage
      await weeklyCostLimitingService.recordAIOperationWithTokens(
        identifier,
        'essay_outline',
        result.promptTokens || 0,
        result.outputTokens || 0,
        planType
      );
      
      console.log(`✅ Essay outline generated successfully - Tokens: ${result.tokensUsed}, Identifier: ${identifier}`);
      
      res.json({
        success: true,
        outline: result.outline
      });
    } catch (error: any) {
      console.error("Error generating outline:", error);
      res.status(500).json({ 
        message: error.message || "Erro ao gerar roteiro. Tente novamente." 
      });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
