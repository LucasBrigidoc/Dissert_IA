import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertEssayStructureSchema, searchQuerySchema, chatMessageSchema, proposalSearchQuerySchema, generateProposalSchema, textModificationRequestSchema, insertSimulationSchema, newsletterSubscriptionSchema, createNewsletterSchema, updateNewsletterSchema, sendNewsletterSchema, createMaterialComplementarSchema, updateMaterialComplementarSchema, insertCouponSchema, validateCouponSchema } from "@shared/schema";
import { textModificationService } from "./text-modification-service";
import { optimizedAnalysisService } from "./optimized-analysis-service";
import { optimizationTelemetry } from "./optimization-telemetry";
import { geminiService } from "./gemini-service";
import { WeeklyCostLimitingService } from "./weekly-cost-limiting";
import { sendNewsletter, sendWelcomeEmail } from "./email-service";
import bcrypt from "bcrypt";
import Stripe from "stripe";

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
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Don't return password in response
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password in response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
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

      // Rate limiting check (6 analyses every 3 days per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`structure_analysis_${clientIP}`, 6, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can analyze 6 essays every 3 days.", 
          retryAfter: 259200,
          rateLimitType: "structure_analysis"
        });
      }
      
      console.log(`🔍 Structure analysis request: ${essayText.substring(0, 50)}..., IP: ${clientIP}`);
      
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

      // Rate limiting check (8 essay generations every 3 days per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`essay_generation_${clientIP}`, 8, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can generate 8 essays every 3 days.", 
          retryAfter: 259200,
          rateLimitType: "essay_generation"
        });
      }
      
      console.log(`📝 Essay generation request: ${structureName || 'Custom Structure'}, topic: ${topic.substring(0, 50)}..., IP: ${clientIP}`);
      
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
      const validatedQuery = searchQuerySchema.parse(req.body);
      const { query, type, category, popularity, excludeIds = [] } = validatedQuery;
      
      // Rate limiting check (19 AI searches every 3 days per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`repertoire_search_${clientIP}`, 19, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can make 19 AI searches every 3 days.", 
          retryAfter: 259200 
        });
      }
      
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
        
        // Rate limiting check for repertoire generation (18 every 3 days per IP)
        const generateLimitCheck = await storage.checkRateLimit(`repertoire_generate_${clientIP}`, 8, 4320);
        if (!generateLimitCheck.allowed) {
          res.set('Retry-After', '259200');
          return res.status(429).json({ 
            message: "Rate limit exceeded. You can generate 8 new repertoires every 3 days.", 
            retryAfter: 259200 
          });
        }
        
        // Single OPTIMIZED AI call that generates 6 repertoires
        const repertoireResult = await optimizedAnalysisService.generateRepertoiresBatchOptimized(query, filters, 6);
        const generatedRepertoires = repertoireResult.repertoires;
        
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
      const repertoireId = req.params.id;
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
      const repertoireId = req.params.id;
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
      const repertoireId = req.params.id;
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
      const isSaved = await storage.isRepertoireSaved(userId, repertoireId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Check saved repertoire error:", error);
      res.status(500).json({ message: "Failed to check if repertoire is saved" });
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
      
      // Rate limiting - use daily limit for future exam detection and regular searches
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      let rateLimitCheck;
      
      if (futureExamDetection.isFuture) {
        // Rate limit for future exam detection (30 searches every 3 days)
        rateLimitCheck = await storage.checkRateLimit(`future_exam_${clientIP}`, 5, 4320);
        if (!rateLimitCheck.allowed) {
          res.set('Retry-After', '259200');
          return res.status(429).json({ 
            message: "Rate limit exceeded. You can search for future exams 5 times every 3 days.", 
            retryAfter: 259200 // 72 hours
          });
        }
      } else {
        // Regular rate limiting (45 searches every 3 days per IP)
        rateLimitCheck = await storage.checkRateLimit(`proposal_search_${clientIP}`, 14, 4320);
        if (!rateLimitCheck.allowed) {
          res.set('Retry-After', '259200');
          return res.status(429).json({ 
            message: "Rate limit exceeded. You can make 14 searches every 3 days.", 
            retryAfter: 259200 
          });
        }
      }
      
      console.log(`🔍 Proposal search request: "${query}", IP: ${clientIP}${futureExamDetection.isFuture ? ' [FUTURE EXAM DETECTED]' : ''}`);
      
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
      
      // Step 2: Search existing proposals
      let searchResults = await storage.searchProposals(query, {
        examType: examType || localAnalysis.suggestedExamTypes[0],
        theme: theme || localAnalysis.suggestedThemes[0],
        difficulty,
        year
      });
      
      // Filter out excluded IDs
      if (excludeIds && excludeIds.length > 0) {
        searchResults = searchResults.filter(p => !excludeIds.includes(p.id));
      }
      
      // Step 3: If limited results, generate new proposals with AI
      if (searchResults.length < 3) {
        try {
          const aiProposals = await geminiService.generateProposalsBatch(
            { examType, theme, difficulty }, 
            localAnalysis.keywords
          );
          
          // Save generated proposals to storage
          for (const aiProposal of aiProposals) {
            const savedProposal = await storage.createProposal(aiProposal);
            searchResults.push(savedProposal);
          }
        } catch (aiError) {
          console.error("AI proposal generation failed:", aiError);
        }
      }
      
      res.json({
        results: searchResults.slice(0, 10),
        count: searchResults.length,
        query: localAnalysis.normalizedQuery,
        futureExamDetected: false,
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
      const validatedData = generateProposalSchema.parse(req.body);
      
      // Rate limiting check (40 generations every 3 days per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`proposal_generate_${clientIP}`, 11, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can generate 11 proposals every 3 days.", 
          retryAfter: 259200 
        });
      }
      
      console.log(`🎯 Proposal generation request: ${validatedData.theme}, IP: ${clientIP}`);
      
      // Generate proposals using AI
      const aiProposals = await geminiService.generateProposalsBatch(
        validatedData, 
        validatedData.keywords || []
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
  app.post("/api/proposals/:id/save", async (req, res) => {
    try {
      const proposalId = req.params.id;
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
  app.delete("/api/proposals/:id/save", async (req, res) => {
    try {
      const proposalId = req.params.id;
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
  app.get("/api/proposals/saved", async (req, res) => {
    try {
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
  app.get("/api/proposals/:id/saved", async (req, res) => {
    try {
      const proposalId = req.params.id;
      // For now, we'll use a hardcoded user ID since we don't have authentication yet
      const userId = "default-user"; // TODO: Replace with actual user from session
      
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
      const validatedData = chatMessageSchema.parse(req.body);
      const { conversationId, messageId, message, section, context } = validatedData;
      
      // Rate limiting check (15 AI chats every 3 days per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`ai_chat_${clientIP}`, 12, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can make 12 AI chat requests every 3 days.", 
          retryAfter: 259200 
        });
      }
      
      console.log(`🤖 AI Chat request for section: ${section}, IP: ${clientIP}`);
      
      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation) {
          // If conversation not found, create a new one instead of throwing error
          console.log(`⚠️ Conversation ${conversationId} not found, creating new conversation`);
          conversation = await storage.createConversation({
            userId: null, // TODO: Add user authentication
            sessionId: clientIP, // Use IP as session identifier for now
            messages: [],
            currentSection: section,
            brainstormData: context || {}
          });
        }
      } else {
        // Create new conversation
        conversation = await storage.createConversation({
          userId: null, // TODO: Add user authentication
          sessionId: clientIP, // Use IP as session identifier for now
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

      res.json({
        conversationId: conversation.id,
        response: aiResult.response,
        section,
        source: aiResult.source,
        tokensSaved: aiResult.tokensSaved || 0,
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
      // Validate input using shared schema
      const validatedData = textModificationRequestSchema.parse(req.body);
      const { text, type, config } = validatedData;
      
      // Per-type rate limiting (45 modifications every 3 days per IP per type)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const perTypeIdentifier = `${clientIP}_text_${type}`;
      const rateLimitCheck = await storage.checkRateLimit(perTypeIdentifier, 9, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: `Rate limit exceeded for ${type} modifications. You can make 9 ${type} modifications every 3 days.`, 
          retryAfter: 259200,
          type: type
        });
      }
      
      console.log(`✏️ Text modification request: ${type}, IP: ${clientIP}`);
      
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

      res.json({
        ...result,
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

  // ===================== ESSAY CORRECTION ROUTES =====================

  // Essay correction endpoint with AI
  app.post("/api/essays/correct", async (req, res) => {
    try {
      const { essayText, topic, examType } = req.body;
      
      if (!essayText || !topic) {
        return res.status(400).json({ message: "Essay text and topic are required" });
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
      
      // Rate limiting check (10 corrections every 3 days per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`correction_${clientIP}`, 5, 4320);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '259200');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can correct 5 essays every 3 days.", 
          retryAfter: 259200 
        });
      }
      
      console.log(`📝 Essay correction request, ${essayText.length} characters, IP: ${clientIP}`);
      
      // Correct essay using Gemini AI
      const correction = await textModificationService.correctEssay(
        essayText, 
        topic, 
        examType || 'ENEM'
      );
      
      res.json({
        success: true,
        correction,
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
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const identifier = `weekly_usage_${clientIP}`;
      
      const stats = await weeklyCostLimitingService.getWeeklyUsageStats(identifier);
      
      res.json({
        success: true,
        stats
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
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const identifier = `weekly_usage_${clientIP}`;
      
      // Estimate cost for the operation
      const costEstimate = await weeklyCostLimitingService.estimateOperationCost(
        estimatedInputTokens, 
        estimatedOutputTokens
      );
      
      // Check if operation is allowed
      const limitCheck = await weeklyCostLimitingService.checkWeeklyCostLimit(
        identifier,
        costEstimate.estimatedCostCentavos
      );
      
      res.json({
        success: true,
        allowed: limitCheck.allowed,
        costEstimate,
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
      
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const identifier = `weekly_usage_${clientIP}`;
      
      const result = await weeklyCostLimitingService.recordAIOperation(
        identifier,
        operation,
        costCentavos
      );
      
      res.json({
        success: result.success,
        usageStats: result.usageStats
      });
    } catch (error) {
      console.error("Error recording AI operation:", error);
      res.status(500).json({ message: "Failed to record operation" });
    }
  });

  // Get usage analytics for monitoring
  app.get("/api/weekly-usage/analytics", async (req, res) => {
    try {
      const { weeks = 4 } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const identifier = `weekly_usage_${clientIP}`;
      
      const analytics = await weeklyCostLimitingService.getUsageAnalytics(
        identifier, 
        parseInt(weeks as string) || 4
      );
      
      res.json({
        success: true,
        analytics
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


  const httpServer = createServer(app);
  return httpServer;
}
