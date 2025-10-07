import { type User, type InsertUser, type UserProgress, type InsertUserProgress, type Essay, type InsertEssay, type EssayStructure, type InsertEssayStructure, type Repertoire, type InsertRepertoire, type SearchCache, type InsertSearchCache, type RateLimit, type InsertRateLimit, type SavedRepertoire, type InsertSavedRepertoire, type Proposal, type InsertProposal, type SavedProposal, type InsertSavedProposal, type SavedEssay, type InsertSavedEssay, type SavedStructure, type InsertSavedStructure, type SavedNewsletter, type InsertSavedNewsletter, type SavedText, type InsertSavedText, type Simulation, type InsertSimulation, type Conversation, type InsertConversation, type ConversationMessage, type UserScore, type InsertUserScore, type AdminUser, type InsertAdminUser, type UserCost, type InsertUserCost, type BusinessMetric, type InsertBusinessMetric, type UserDailyUsage, type InsertUserDailyUsage, type WeeklyUsage, type InsertWeeklyUsage, type SubscriptionPlan, type InsertSubscriptionPlan, type UserSubscription, type InsertUserSubscription, type Transaction, type InsertTransaction, type RevenueMetric, type InsertRevenueMetric, type UserEvent, type InsertUserEvent, type ConversionFunnel, type InsertConversionFunnel, type UserSession, type InsertUserSession, type TaskCompletion, type InsertTaskCompletion, type UserCohort, type InsertUserCohort, type PredictiveMetric, type InsertPredictiveMetric, type ChurnPrediction, type InsertChurnPrediction, type Newsletter, type InsertNewsletter, type NewsletterSubscriber, type InsertNewsletterSubscriber, type NewsletterSend, type InsertNewsletterSend, type MaterialComplementar, type InsertMaterialComplementar, type Coupon, type InsertCoupon, type CouponRedemption, type InsertCouponRedemption, type PaymentEvent, type InsertPaymentEvent, type UserGoal, type InsertUserGoal, type UserExam, type InsertUserExam, type UserSchedule, type InsertUserSchedule } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress>;
  updateUserProgressAfterCorrection(userId: string): Promise<void>;
  
  // Essay operations
  getEssaysByUser(userId: string): Promise<Essay[]>;
  createEssay(essay: InsertEssay): Promise<Essay>;
  updateEssay(id: string, essay: Partial<Essay>): Promise<Essay>;
  
  // Essay structure operations
  getStructuresByUser(userId: string): Promise<EssayStructure[]>;
  createStructure(structure: InsertEssayStructure): Promise<EssayStructure>;
  updateStructure(id: string, structure: Partial<EssayStructure>): Promise<EssayStructure>;
  deleteStructure(id: string): Promise<void>;
  getStructure(id: string): Promise<EssayStructure | undefined>;
  
  // Repertoire operations
  searchRepertoires(query: string, filters?: { type?: string; category?: string; popularity?: string }): Promise<Repertoire[]>;
  createRepertoire(repertoire: InsertRepertoire): Promise<Repertoire>;
  getRepertoires(limit?: number, offset?: number): Promise<Repertoire[]>;
  
  // Search cache operations
  getSearchCache(normalizedQuery: string): Promise<SearchCache | undefined>;
  createSearchCache(cache: InsertSearchCache): Promise<SearchCache>;
  updateSearchCache(id: string, cache: Partial<SearchCache>): Promise<SearchCache>;
  
  // Rate limiting operations
  checkRateLimit(identifier: string, maxRequests?: number, windowMinutes?: number): Promise<{ allowed: boolean; remaining: number }>;
  
  // Weekly usage operations for unified cost limiting
  findWeeklyUsage(identifier: string, weekStart: Date): Promise<WeeklyUsage | undefined>;
  insertWeeklyUsage(usage: InsertWeeklyUsage): Promise<WeeklyUsage>;
  upsertWeeklyUsage(usage: InsertWeeklyUsage): Promise<WeeklyUsage>;
  updateWeeklyUsage(id: string, usage: Partial<WeeklyUsage>): Promise<WeeklyUsage>;
  getWeeklyUsageHistory(identifier: string, weeks: number): Promise<WeeklyUsage[]>;
  
  // Saved repertoires operations
  saveRepertoire(userId: string, repertoireId: string): Promise<SavedRepertoire>;
  removeSavedRepertoire(userId: string, repertoireId: string): Promise<boolean>;
  getUserSavedRepertoires(userId: string): Promise<Repertoire[]>;
  isRepertoireSaved(userId: string, repertoireId: string): Promise<boolean>;
  
  // Proposal operations
  searchProposals(query: string, filters?: { examType?: string; theme?: string; difficulty?: string; year?: number }): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  getProposals(limit?: number, offset?: number): Promise<Proposal[]>;
  
  // Saved proposals operations
  saveProposal(userId: string, proposalId: string): Promise<SavedProposal>;
  removeSavedProposal(userId: string, proposalId: string): Promise<boolean>;
  getUserSavedProposals(userId: string): Promise<Proposal[]>;
  isProposalSaved(userId: string, proposalId: string): Promise<boolean>;
  
  // Saved essays operations
  saveEssay(userId: string, essayId: string): Promise<SavedEssay>;
  removeSavedEssay(userId: string, essayId: string): Promise<boolean>;
  getUserSavedEssays(userId: string): Promise<Essay[]>;
  isEssaySaved(userId: string, essayId: string): Promise<boolean>;
  
  // Saved structures operations
  saveStructure(userId: string, structureId: string): Promise<SavedStructure>;
  removeSavedStructure(userId: string, structureId: string): Promise<boolean>;
  getUserSavedStructures(userId: string): Promise<EssayStructure[]>;
  isStructureSaved(userId: string, structureId: string): Promise<boolean>;
  
  // Saved newsletters operations
  saveNewsletter(userId: string, newsletterId: string): Promise<SavedNewsletter>;
  removeSavedNewsletter(userId: string, newsletterId: string): Promise<boolean>;
  getUserSavedNewsletters(userId: string): Promise<Newsletter[]>;
  isNewsletterSaved(userId: string, newsletterId: string): Promise<boolean>;
  
  // Saved texts operations
  createSavedText(savedText: InsertSavedText): Promise<SavedText>;
  getUserSavedTexts(userId: string): Promise<SavedText[]>;
  deleteSavedText(id: string, userId: string): Promise<boolean>;
  
  // Saved outlines operations
  createSavedOutline(savedOutline: InsertSavedOutline): Promise<SavedOutline>;
  getUserSavedOutlines(userId: string): Promise<SavedOutline[]>;
  deleteSavedOutline(id: string, userId: string): Promise<boolean>;
  
  // Simulation operations
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
  updateSimulation(id: string, simulation: Partial<Simulation>): Promise<Simulation>;
  getSimulation(id: string): Promise<Simulation | undefined>;
  getSimulations(userId?: string, sessionId?: string, limit?: number, offset?: number): Promise<Simulation[]>;
  getUserSimulations(userId: string): Promise<Simulation[]>;
  getSessionSimulations(sessionId: string): Promise<Simulation[]>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  appendMessage(conversationId: string, message: ConversationMessage): Promise<Conversation>;
  updateConversationSummary(conversationId: string, summary: string): Promise<Conversation>;
  updateConversationData(conversationId: string, brainstormData: any, currentSection: string): Promise<Conversation>;
  getRecentConversations(userId?: string, sessionId?: string, limit?: number): Promise<Conversation[]>;
  
  // User scores operations
  getUserScores(userId: string): Promise<UserScore[]>;
  createUserScore(score: InsertUserScore): Promise<UserScore>;
  updateUserScore(id: string, score: Partial<UserScore>): Promise<UserScore>;
  deleteUserScore(id: string): Promise<boolean>;
  
  // Admin operations
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  getAdminUser(userId: string): Promise<AdminUser | undefined>;
  
  // Cost tracking operations
  insertUserCost(cost: InsertUserCost): Promise<UserCost>;
  insertUserDailyUsage(usage: InsertUserDailyUsage): Promise<UserDailyUsage>;
  findUserDailyUsage(userId: string | null, ipAddress: string, date: Date): Promise<UserDailyUsage | undefined>;
  updateUserDailyUsage(id: string, updates: Partial<UserDailyUsage>): Promise<UserDailyUsage>;
  
  // Business metrics operations
  insertBusinessMetric(metric: InsertBusinessMetric): Promise<BusinessMetric>;
  getDailyOperationStats(startDate: Date, endDate: Date): Promise<{
    totalOperations: number;
    totalCost: number;
    cacheHitRate: number;
    topOperation: string;
  }>;
  getUserActivityStats(days: number): Promise<{
    totalUsers: number;
    activeUsers: number;
  }>;
  getUserCostSummary(identifier: { userId?: string; ipAddress?: string }, startDate: Date, endDate: Date): Promise<{
    totalCost: number;
    totalOperations: number;
    operationBreakdown: Record<string, number>;
    costBreakdown: Record<string, number>;
  }>;
  getBusinessOverview(startDate: Date, endDate: Date): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    totalCostBrl: number;
    totalTokens: number;
    averageCostPerUser: number;
    topOperations: Array<{ operation: string; count: number; cost: number }>;
    dailyTrends: Array<{ date: string; operations: number; cost: number; users: number }>;
    cacheEfficiency: number;
  }>;
  getTopCostUsers(startDate: Date, endDate: Date, limit: number): Promise<Array<{
    userId?: string;
    ipAddress: string;
    totalCost: number;
    totalOperations: number;
    averageOperationCost: number;
    topOperation: string;
  }>>;
  
  // Advanced analytics operations
  getHourlyUsagePatterns(startDate: Date, endDate: Date): Promise<Array<{
    hour: number;
    totalOperations: number;
    totalCost: number;
    averageOperations: number;
    peakDay: string;
  }>>;
  getDetailedUsersList(days: number, limit: number): Promise<Array<{
    userId?: string;
    ipAddress: string;
    userType?: string;
    totalCost: number;
    totalOperations: number;
    firstSeen: Date;
    lastSeen: Date;
    daysSinceFirst: number;
    accessFrequency: number;
    topOperation: string;
    plan: string;
  }>>;
  getToolsRankingByUsage(startDate: Date, endDate: Date): Promise<Array<{
    operation: string;
    operationName: string;
    totalCount: number;
    totalCost: number;
    averageCost: number;
    uniqueUsers: number;
    rank: number;
  }>>;
  getUserAccessFrequency(startDate: Date, endDate: Date): Promise<Array<{
    frequency: string;
    userCount: number;
    averageOperations: number;
    averageCost: number;
  }>>;
  
  // ===================== FASE 1: RECEITA + IA COST TRACKING =====================
  
  // Subscription plans operations
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  getSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  
  // User subscriptions operations
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  getUserSubscriptions(userId: string): Promise<UserSubscription[]>;
  updateUserSubscription(id: string, subscription: Partial<UserSubscription>): Promise<UserSubscription>;
  getActiveSubscriptions(): Promise<UserSubscription[]>;
  getSubscriptionsByStatus(status: string): Promise<UserSubscription[]>;
  
  // Transactions operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  // Revenue metrics operations
  createRevenueMetric(metric: InsertRevenueMetric): Promise<RevenueMetric>;
  getRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetric[]>;
  getLatestRevenueMetric(): Promise<RevenueMetric | undefined>;
  getRevenueOverview(days: number): Promise<{
    mrr: number;
    arr: number;
    totalActiveSubscriptions: number;
    paidUsers: number;
    trialUsers: number;
    arpu: number;
    grossMarginPercent: number;
    mrrGrowthRate: number;
    churnRate: number;
  }>;
  
  // ===================== FASE 2: FUNIL DE CONVERSÃO + UX COMPLETION RATES =====================
  
  // User events operations
  createUserEvent(event: InsertUserEvent): Promise<UserEvent>;
  getUserEvents(userId?: string, sessionId?: string, eventType?: string): Promise<UserEvent[]>;
  getEventsByDateRange(startDate: Date, endDate: Date, eventType?: string): Promise<UserEvent[]>;
  
  // Conversion funnels operations
  createConversionFunnel(funnel: InsertConversionFunnel): Promise<ConversionFunnel>;
  getConversionFunnels(funnelName?: string, metricDate?: Date): Promise<ConversionFunnel[]>;
  getConversionRates(funnelName: string, startDate: Date, endDate: Date): Promise<Array<{
    stepName: string;
    stepNumber: number;
    conversionRate: number;
    usersEntered: number;
    usersCompleted: number;
    averageTimeToComplete: number;
  }>>;
  
  // User sessions operations
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(id: string, session: Partial<UserSession>): Promise<UserSession>;
  getUserSessions(userId?: string, startDate?: Date, endDate?: Date): Promise<UserSession[]>;
  getSessionMetrics(startDate: Date, endDate: Date): Promise<{
    totalSessions: number;
    averageDuration: number;
    bounceRate: number;
    averagePageViews: number;
    topSources: Array<{ source: string; count: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
  }>;
  
  // Task completions operations
  createTaskCompletion(task: InsertTaskCompletion): Promise<TaskCompletion>;
  updateTaskCompletion(id: string, task: Partial<TaskCompletion>): Promise<TaskCompletion>;
  getTaskCompletions(userId?: string, taskType?: string, status?: string): Promise<TaskCompletion[]>;
  getTaskCompletionRates(taskType?: string, startDate?: Date, endDate?: Date): Promise<Array<{
    taskType: string;
    taskName: string;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageTimeToComplete: number;
    averageSatisfactionScore: number;
    averageNpsScore: number;
  }>>;
  
  // ===================== FASE 3: ADVANCED COHORT ANALYSIS + PREDICTIVE METRICS =====================
  
  // User cohorts operations
  createUserCohort(cohort: InsertUserCohort): Promise<UserCohort>;
  updateUserCohort(id: string, cohort: Partial<UserCohort>): Promise<UserCohort>;
  getUserCohort(userId: string): Promise<UserCohort | undefined>;
  getCohortAnalysis(cohortMonth?: Date): Promise<Array<{
    cohortMonth: string;
    totalUsers: number;
    activeUsers: number;
    churnedUsers: number;
    retentionRate: number;
    currentMrr: number;
    averageLtv: number;
    averageLifetimeDays: number;
  }>>;
  getRevenueBySource(startDate: Date, endDate: Date): Promise<Array<{
    source: string;
    totalRevenue: number;
    totalUsers: number;
    averageRevenue: number;
    percentage: number;
  }>>;
  
  // Predictive metrics operations
  createPredictiveMetric(metric: InsertPredictiveMetric): Promise<PredictiveMetric>;
  getPredictiveMetrics(metricType?: string, timeHorizon?: string): Promise<PredictiveMetric[]>;
  getLatestPredictions(metricType: string): Promise<PredictiveMetric[]>;
  
  // Churn predictions operations
  createChurnPrediction(prediction: InsertChurnPrediction): Promise<ChurnPrediction>;
  updateChurnPrediction(id: string, prediction: Partial<ChurnPrediction>): Promise<ChurnPrediction>;
  getChurnPredictions(riskLevel?: string, userId?: string): Promise<ChurnPrediction[]>;
  getHighRiskUsers(limit?: number): Promise<Array<{
    userId: string;
    userName: string;
    userEmail: string;
    churnProbability: number;
    riskLevel: string;
    daysToChurn: number;
    riskFactors: string[];
    recommendedActions: string[];
  }>>;

  // ===================== NEWSLETTER OPERATIONS =====================
  
  // Newsletter subscriber operations
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getNewsletterSubscriber(id: string): Promise<NewsletterSubscriber | undefined>;
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  updateNewsletterSubscriber(id: string, subscriber: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber>;
  deleteNewsletterSubscriber(id: string): Promise<void>;
  getAllNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]>;
  getActiveNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  unsubscribeByToken(token: string): Promise<boolean>;
  
  // Newsletter operations
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  getNewsletter(id: string): Promise<Newsletter | undefined>;
  getAllNewsletters(status?: string): Promise<Newsletter[]>;
  updateNewsletter(id: string, newsletter: Partial<Newsletter>): Promise<Newsletter>;
  deleteNewsletter(id: string): Promise<void>;
  getNewslettersByAuthor(authorId: string): Promise<Newsletter[]>;
  
  // Newsletter send operations
  createNewsletterSend(send: InsertNewsletterSend): Promise<NewsletterSend>;
  getNewsletterSends(newsletterId: string): Promise<NewsletterSend[]>;
  updateNewsletterSend(id: string, send: Partial<NewsletterSend>): Promise<NewsletterSend>;
  getNewsletterStats(newsletterId: string): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  }>;

  // ===================== MATERIAL COMPLEMENTAR OPERATIONS =====================
  
  // Material complementar operations
  createMaterialComplementar(material: InsertMaterialComplementar): Promise<MaterialComplementar>;
  getMaterialComplementar(id: string): Promise<MaterialComplementar | undefined>;
  getAllMateriaisComplementares(isPublished?: boolean): Promise<MaterialComplementar[]>;
  updateMaterialComplementar(id: string, material: Partial<MaterialComplementar>): Promise<MaterialComplementar>;
  deleteMaterialComplementar(id: string): Promise<void>;
  
  // Analytics operations
  incrementMaterialView(id: string): Promise<void>;
  incrementMaterialPdfDownload(id: string): Promise<void>;

  // ===================== COUPON OPERATIONS =====================
  
  // Coupon operations
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  listCoupons(filters?: { isActive?: boolean; planScope?: string }): Promise<Coupon[]>;
  updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon>;
  deleteCoupon(id: string): Promise<boolean>;
  
  // Coupon validation and usage
  validateCoupon(code: string, planId?: string, userId?: string): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
    discount?: { type: string; value: number; currency: string };
  }>;
  
  redeemCoupon(redemption: InsertCouponRedemption): Promise<CouponRedemption>;
  getCouponRedemptions(couponId: string): Promise<CouponRedemption[]>;
  getAllCouponRedemptions(): Promise<CouponRedemption[]>;
  getUserCouponRedemptions(userId: string): Promise<CouponRedemption[]>;
  getCouponUsageCount(couponId: string, userId?: string): Promise<number>;
  
  // Payment events (webhook audit)
  createPaymentEvent(event: InsertPaymentEvent): Promise<PaymentEvent>;
  getPaymentEvent(eventId: string): Promise<PaymentEvent | undefined>;
  updatePaymentEventStatus(id: string, status: string, processedAt?: Date, error?: string): Promise<PaymentEvent>;
  
  // ===================== USER GOALS OPERATIONS =====================
  getUserGoals(userId: string): Promise<UserGoal[]>;
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  updateUserGoal(id: string, goal: Partial<UserGoal>): Promise<UserGoal>;
  deleteUserGoal(id: string): Promise<boolean>;
  
  // ===================== USER EXAMS OPERATIONS =====================
  getUserExams(userId: string): Promise<UserExam[]>;
  createUserExam(exam: InsertUserExam): Promise<UserExam>;
  updateUserExam(id: string, exam: Partial<UserExam>): Promise<UserExam>;
  deleteUserExam(id: string): Promise<boolean>;
  
  // ===================== USER SCHEDULE OPERATIONS =====================
  getUserSchedule(userId: string, weekStart: Date): Promise<UserSchedule[]>;
  createUserSchedule(schedule: InsertUserSchedule): Promise<UserSchedule>;
  updateUserSchedule(id: string, schedule: Partial<UserSchedule>): Promise<UserSchedule>;
  deleteUserSchedule(id: string): Promise<boolean>;
  
}

// Helper function to remove undefined values from objects
function removeUndefined<T extends object>(obj: Partial<T>): Partial<{ [K in keyof T]: Exclude<T[K], undefined> }> {
  const out: any = {};
  for (const k in obj) {
    const v = (obj as any)[k];
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProgress: Map<string, UserProgress>;
  private essays: Map<string, Essay>;
  private essayStructures: Map<string, EssayStructure>;
  private repertoires: Map<string, Repertoire>;
  private searchCaches: Map<string, SearchCache>;
  private rateLimits: Map<string, RateLimit>;
  private weeklyUsages: Map<string, WeeklyUsage>;
  private savedRepertoires: Map<string, SavedRepertoire>;
  private proposals: Map<string, Proposal>;
  private savedProposals: Map<string, SavedProposal>;
  private savedEssays: Map<string, SavedEssay>;
  private savedStructures: Map<string, SavedStructure>;
  private savedNewsletters: Map<string, SavedNewsletter>;
  private simulations: Map<string, Simulation>;
  private conversations: Map<string, Conversation>;
  private userScores: Map<string, UserScore>;
  private adminUsers: Map<string, AdminUser>;
  private userCosts: Map<string, UserCost>;
  private businessMetrics: Map<string, BusinessMetric>;
  private userDailyUsage: Map<string, UserDailyUsage>;
  
  // FASE 1: Receita + IA cost tracking
  private subscriptionPlans: Map<string, SubscriptionPlan>;
  private userSubscriptions: Map<string, UserSubscription>;
  private transactions: Map<string, Transaction>;
  private revenueMetrics: Map<string, RevenueMetric>;
  
  // FASE 2: Funil de conversão + UX completion rates
  private userEvents: Map<string, UserEvent>;
  private conversionFunnels: Map<string, ConversionFunnel>;
  private userSessions: Map<string, UserSession>;
  private taskCompletions: Map<string, TaskCompletion>;
  
  // FASE 3: Advanced cohort analysis + predictive metrics
  private userCohorts: Map<string, UserCohort>;
  private predictiveMetrics: Map<string, PredictiveMetric>;
  private churnPredictions: Map<string, ChurnPrediction>;
  
  // Newsletter storage
  private newsletterSubscribers: Map<string, NewsletterSubscriber>;
  private newsletters: Map<string, Newsletter>;
  private newsletterSends: Map<string, NewsletterSend>;

  // Material complementar storage
  private materiaisComplementares: Map<string, MaterialComplementar>;

  // Coupon storage
  private coupons: Map<string, Coupon>;
  private couponRedemptions: Map<string, CouponRedemption>;
  private paymentEvents: Map<string, PaymentEvent>;

  // User goals, exams and schedule storage
  private userGoals: Map<string, UserGoal>;
  private userExams: Map<string, UserExam>;
  private userSchedules: Map<string, UserSchedule>;

  constructor() {
    this.users = new Map();
    this.userProgress = new Map();
    this.essays = new Map();
    this.essayStructures = new Map();
    this.repertoires = new Map();
    this.searchCaches = new Map();
    this.rateLimits = new Map();
    this.weeklyUsages = new Map();
    this.savedRepertoires = new Map();
    this.proposals = new Map();
    this.savedProposals = new Map();
    this.savedEssays = new Map();
    this.savedStructures = new Map();
    this.savedNewsletters = new Map();
    this.simulations = new Map();
    this.conversations = new Map();
    this.userScores = new Map();
    this.adminUsers = new Map();
    this.userCosts = new Map();
    this.businessMetrics = new Map();
    this.userDailyUsage = new Map();
    
    // FASE 1: Receita + IA cost tracking
    this.subscriptionPlans = new Map();
    this.userSubscriptions = new Map();
    this.transactions = new Map();
    this.revenueMetrics = new Map();
    
    // FASE 2: Funil de conversão + UX completion rates
    this.userEvents = new Map();
    this.conversionFunnels = new Map();
    this.userSessions = new Map();
    this.taskCompletions = new Map();
    
    // FASE 3: Advanced cohort analysis + predictive metrics
    this.userCohorts = new Map();
    this.predictiveMetrics = new Map();
    this.churnPredictions = new Map();
    
    // Newsletter storage initialization
    this.newsletterSubscribers = new Map();
    this.newsletters = new Map();
    this.newsletterSends = new Map();

    // Material complementar storage initialization
    this.materiaisComplementares = new Map();
    
    // Coupon storage initialization
    this.coupons = new Map();
    this.couponRedemptions = new Map();
    this.paymentEvents = new Map();
    
    // User goals, exams and schedule storage initialization
    this.userGoals = new Map();
    this.userExams = new Map();
    this.userSchedules = new Map();
    
    // Initialize with basic repertoires
    this.initializeRepertoires();
    // Initialize with basic proposals
    this.initializeProposals();
    // Initialize subscription plans
    this.initializeSubscriptionPlans();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      userType: insertUser.userType || "vestibulano", 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    
    // Create default progress for the user
    await this.createUserProgress({
      userId: id,
      averageScore: 0,
      targetScore: null,
      essaysCount: 0,
      studyHours: 0,
      streak: 0
    });
    
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) {
      throw new Error("User not found");
    }
    
    const updated: User = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.users.set(id, updated);
    return updated;
  }

  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId,
    );
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = { 
      ...insertProgress,
      averageScore: insertProgress.averageScore ?? 0,
      targetScore: insertProgress.targetScore ?? null,
      essaysCount: insertProgress.essaysCount ?? 0,
      studyHours: insertProgress.studyHours ?? 0,
      streak: insertProgress.streak ?? 0, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userProgress.set(id, progress);
    return progress;
  }

  async updateUserProgress(userId: string, updateData: Partial<UserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    if (!existing) {
      throw new Error("User progress not found");
    }
    
    const updated: UserProgress = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.userProgress.set(existing.id, updated);
    return updated;
  }

  async updateUserProgressAfterCorrection(userId: string): Promise<void> {
    const userScores = await this.getUserScores(userId);
    if (userScores.length === 0) return;

    const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
    const averageScore = Math.round(totalScore / userScores.length);
    const essaysCount = userScores.length;

    const existingProgress = await this.getUserProgress(userId);
    if (existingProgress) {
      await this.updateUserProgress(userId, {
        averageScore,
        essaysCount,
      });
    } else {
      await this.createUserProgress({
        userId,
        averageScore,
        essaysCount,
      });
    }
  }

  async getEssaysByUser(userId: string): Promise<Essay[]> {
    return Array.from(this.essays.values()).filter(
      (essay) => essay.userId === userId,
    );
  }

  async createEssay(insertEssay: InsertEssay): Promise<Essay> {
    const id = randomUUID();
    const essay: Essay = { 
      ...insertEssay,
      score: insertEssay.score ?? null,
      feedback: insertEssay.feedback ?? null,
      isCompleted: insertEssay.isCompleted ?? false, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.essays.set(id, essay);
    return essay;
  }

  async updateEssay(id: string, updateData: Partial<Essay>): Promise<Essay> {
    const existing = this.essays.get(id);
    if (!existing) {
      throw new Error("Essay not found");
    }
    
    const updated: Essay = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.essays.set(id, updated);
    return updated;
  }

  async getStructuresByUser(userId: string): Promise<EssayStructure[]> {
    return Array.from(this.essayStructures.values()).filter(
      (structure) => structure.userId === userId,
    );
  }

  async createStructure(insertStructure: InsertEssayStructure): Promise<EssayStructure> {
    const id = randomUUID();
    const structure: EssayStructure = { 
      ...insertStructure, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.essayStructures.set(id, structure);
    return structure;
  }

  async updateStructure(id: string, updateData: Partial<EssayStructure>): Promise<EssayStructure> {
    const existing = this.essayStructures.get(id);
    if (!existing) {
      throw new Error("Structure not found");
    }
    
    const updated: EssayStructure = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.essayStructures.set(id, updated);
    return updated;
  }

  async deleteStructure(id: string): Promise<void> {
    const exists = this.essayStructures.has(id);
    if (!exists) {
      throw new Error("Structure not found");
    }
    this.essayStructures.delete(id);
  }

  async getStructure(id: string): Promise<EssayStructure | undefined> {
    return this.essayStructures.get(id);
  }

  // Repertoire operations
  async searchRepertoires(query: string, filters?: { type?: string; category?: string; popularity?: string }): Promise<Repertoire[]> {
    const normalizedQuery = query.toLowerCase().trim();
    let results = Array.from(this.repertoires.values());

    // Filter by query in title, description, or keywords
    if (normalizedQuery) {
      results = results.filter(rep => 
        rep.title.toLowerCase().includes(normalizedQuery) ||
        rep.description.toLowerCase().includes(normalizedQuery) ||
        (rep.keywords as string[]).some(k => k.toLowerCase().includes(normalizedQuery))
      );
    }

    // Apply filters
    if (filters?.type && filters.type !== "all") {
      results = results.filter(rep => rep.type === filters.type);
    }
    
    if (filters?.category && filters.category !== "all") {
      results = results.filter(rep => rep.category === filters.category);
    }
    
    if (filters?.popularity && filters.popularity !== "all") {
      results = results.filter(rep => rep.popularity === filters.popularity);
    }

    // Sort by rating descending
    return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async createRepertoire(insertRepertoire: InsertRepertoire): Promise<Repertoire> {
    const id = randomUUID();
    const repertoire: Repertoire = { 
      ...insertRepertoire,
      year: insertRepertoire.year ?? null,
      rating: insertRepertoire.rating ?? 0,
      popularity: insertRepertoire.popularity ?? "moderate",
      keywords: insertRepertoire.keywords ?? [],
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.repertoires.set(id, repertoire);
    return repertoire;
  }

  async getRepertoires(limit = 50, offset = 0): Promise<Repertoire[]> {
    const allRepertoires = Array.from(this.repertoires.values())
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return allRepertoires.slice(offset, offset + limit);
  }

  // Search cache operations with TTL check
  async getSearchCache(normalizedQuery: string): Promise<SearchCache | undefined> {
    const cache = Array.from(this.searchCaches.values()).find(
      cache => cache.normalizedQuery === normalizedQuery
    );
    
    // Check if cache has expired
    if (cache && cache.expiresAt && new Date() > cache.expiresAt) {
      console.log(`🗑️ Cache expired for query: "${normalizedQuery}"`);
      this.searchCaches.delete(cache.id);
      return undefined;
    }
    
    return cache;
  }

  async createSearchCache(insertCache: InsertSearchCache): Promise<SearchCache> {
    const id = randomUUID();
    // TTL: Cache expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const cache: SearchCache = { 
      ...insertCache,
      searchCount: insertCache.searchCount ?? 1,
      lastSearched: insertCache.lastSearched ?? new Date(),
      expiresAt,
      id,
      createdAt: new Date()
    };
    this.searchCaches.set(id, cache);
    return cache;
  }

  async updateSearchCache(id: string, updateData: Partial<SearchCache>): Promise<SearchCache> {
    const existing = this.searchCaches.get(id);
    if (!existing) {
      throw new Error("Search cache not found");
    }
    
    const updated: SearchCache = {
      ...existing,
      ...updateData,
      lastSearched: new Date()
    };
    
    this.searchCaches.set(id, updated);
    return updated;
  }

  // Rate limiting operations
  async checkRateLimit(identifier: string, maxRequests = 10, windowMinutes = 60): Promise<{ allowed: boolean; remaining: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
    
    let rateLimit = Array.from(this.rateLimits.values()).find(
      limit => limit.identifier === identifier
    );
    
    // Clean up or reset if window has passed
    if (!rateLimit || (rateLimit.windowStart && rateLimit.windowStart < windowStart)) {
      const id = randomUUID();
      rateLimit = {
        id,
        identifier,
        requestCount: 1,
        windowStart: now,
        lastRequest: now,
        createdAt: new Date()
      };
      this.rateLimits.set(id, rateLimit);
      return { allowed: true, remaining: maxRequests - 1 };
    }
    
    // Check if within limits
    const currentCount = rateLimit.requestCount || 0;
    if (currentCount >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    // Increment count
    rateLimit.requestCount = currentCount + 1;
    rateLimit.lastRequest = now;
    this.rateLimits.set(rateLimit.id, rateLimit);
    
    return { allowed: true, remaining: maxRequests - rateLimit.requestCount };
  }

  private initializeRepertoires() {
    const initialRepertoires: InsertRepertoire[] = [
      {
        title: "1984 - George Orwell",
        description: "Distopia que aborda temas como vigilância estatal, manipulação da informação e controle social. Ideal para redações sobre tecnologia, privacidade e liberdade.",
        type: "books",
        category: "technology",
        popularity: "very-popular",
        year: "1949",
        rating: 48,
        keywords: ["distopia", "vigilância", "estado", "controle", "tecnologia", "privacidade", "liberdade", "orwell"]
      },
      {
        title: "Declaração Universal dos Direitos Humanos",
        description: "Marco histórico de 1948 que estabelece direitos fundamentais. Excelente referência para temas sobre dignidade humana, igualdade e justiça social.",
        type: "laws",
        category: "social",
        popularity: "very-popular",
        year: "1948",
        rating: 49,
        keywords: ["direitos humanos", "onu", "dignidade", "igualdade", "justiça", "social"]
      },
      {
        title: "Revolução Industrial 4.0",
        description: "Transformação digital atual com IoT, AI e automação. Perfeito para discussões sobre futuro do trabalho, inovação e impactos socioeconômicos.",
        type: "research",
        category: "technology",
        popularity: "popular",
        year: "2010s",
        rating: 47,
        keywords: ["revolução industrial", "tecnologia", "automação", "ia", "iot", "trabalho", "futuro"]
      },
      {
        title: "Lei Maria da Penha",
        description: "Marco legal brasileiro de 2006 no combate à violência doméstica. Essencial para redações sobre direitos das mulheres e violência de gênero.",
        type: "laws",
        category: "social",
        popularity: "popular",
        year: "2006",
        rating: 46,
        keywords: ["maria da penha", "violência doméstica", "mulheres", "gênero", "direitos", "brasil"]
      },
      {
        title: "Parasita (Gisaengchung)",
        description: "Filme sul-coreano que retrata desigualdade social e luta de classes. Vencedor do Oscar, ideal para temas sobre pobreza e sociedade.",
        type: "movies",
        category: "social",
        popularity: "popular",
        year: "2019",
        rating: 45,
        keywords: ["parasita", "desigualdade", "classes sociais", "pobreza", "coreia do sul", "oscar"]
      },
      {
        title: "Acordo de Paris",
        description: "Acordo climático internacional de 2015 que visa limitar o aquecimento global. Fundamental para discussões ambientais.",
        type: "laws",
        category: "environment",
        popularity: "popular",
        year: "2015",
        rating: 44,
        keywords: ["acordo de paris", "clima", "aquecimento global", "meio ambiente", "sustentabilidade"]
      }
    ];

    initialRepertoires.forEach((rep, index) => {
      const id = `initial-${index + 1}`;
      const repertoire: Repertoire = {
        ...rep,
        year: rep.year ?? null,
        rating: rep.rating ?? 0,
        popularity: rep.popularity ?? "moderate",
        keywords: rep.keywords ?? [],
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.repertoires.set(id, repertoire);
    });
  }

  // Saved repertoires operations
  async saveRepertoire(userId: string, repertoireId: string): Promise<SavedRepertoire> {
    // Check if already saved
    const existing = Array.from(this.savedRepertoires.values()).find(
      saved => saved.userId === userId && saved.repertoireId === repertoireId
    );
    
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const savedRepertoire: SavedRepertoire = {
      id,
      userId,
      repertoireId,
      createdAt: new Date()
    };
    
    this.savedRepertoires.set(id, savedRepertoire);
    return savedRepertoire;
  }

  async removeSavedRepertoire(userId: string, repertoireId: string): Promise<boolean> {
    const existing = Array.from(this.savedRepertoires.entries()).find(
      ([_, saved]) => saved.userId === userId && saved.repertoireId === repertoireId
    );
    
    if (existing) {
      this.savedRepertoires.delete(existing[0]);
      return true;
    }
    
    return false;
  }

  async getUserSavedRepertoires(userId: string): Promise<Repertoire[]> {
    const savedIds = Array.from(this.savedRepertoires.values())
      .filter(saved => saved.userId === userId)
      .map(saved => saved.repertoireId);
    
    const repertoires = savedIds
      .map(id => this.repertoires.get(id))
      .filter((rep): rep is Repertoire => rep !== undefined);
    
    return repertoires.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async isRepertoireSaved(userId: string, repertoireId: string): Promise<boolean> {
    return Array.from(this.savedRepertoires.values()).some(
      saved => saved.userId === userId && saved.repertoireId === repertoireId
    );
  }

  // Proposal operations
  async searchProposals(query: string, filters?: { examType?: string; theme?: string; difficulty?: string; year?: number }): Promise<Proposal[]> {
    const normalizedQuery = query.toLowerCase();
    let proposals = Array.from(this.proposals.values());

    // Filter by text search
    if (normalizedQuery) {
      proposals = proposals.filter(proposal =>
        proposal.title.toLowerCase().includes(normalizedQuery) ||
        proposal.statement.toLowerCase().includes(normalizedQuery) ||
        (proposal.examName && proposal.examName.toLowerCase().includes(normalizedQuery)) ||
        (Array.isArray(proposal.keywords) && proposal.keywords.some((keyword: any) => 
          typeof keyword === 'string' && keyword.toLowerCase().includes(normalizedQuery)
        )) ||
        proposal.theme.toLowerCase().includes(normalizedQuery)
      );
    }

    // Apply filters
    if (filters?.examType) {
      proposals = proposals.filter(proposal => proposal.examType === filters.examType);
    }
    if (filters?.theme) {
      proposals = proposals.filter(proposal => proposal.theme === filters.theme);
    }
    if (filters?.difficulty) {
      proposals = proposals.filter(proposal => proposal.difficulty === filters.difficulty);
    }
    if (filters?.year) {
      proposals = proposals.filter(proposal => proposal.year === filters.year);
    }

    return proposals.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const proposal: Proposal = {
      ...insertProposal,
      year: insertProposal.year ?? null,
      rating: insertProposal.rating ?? null,
      supportingText: insertProposal.supportingText ?? null,
      isAiGenerated: insertProposal.isAiGenerated ?? false,
      usageCount: insertProposal.usageCount ?? null,
      keywords: insertProposal.keywords ?? [],
      difficulty: insertProposal.difficulty ?? "medio",
      examName: insertProposal.examName ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  async getProposals(limit: number = 20, offset: number = 0): Promise<Proposal[]> {
    const proposals = Array.from(this.proposals.values())
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(offset, offset + limit);
    return proposals;
  }

  // Saved proposals operations
  async saveProposal(userId: string, proposalId: string): Promise<SavedProposal> {
    // Check if already saved
    const existing = Array.from(this.savedProposals.values()).find(
      saved => saved.userId === userId && saved.proposalId === proposalId
    );
    
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const savedProposal: SavedProposal = {
      id,
      userId,
      proposalId,
      createdAt: new Date()
    };
    
    this.savedProposals.set(id, savedProposal);
    return savedProposal;
  }

  async removeSavedProposal(userId: string, proposalId: string): Promise<boolean> {
    const existing = Array.from(this.savedProposals.entries()).find(
      ([_, saved]) => saved.userId === userId && saved.proposalId === proposalId
    );
    
    if (existing) {
      this.savedProposals.delete(existing[0]);
      return true;
    }
    
    return false;
  }

  async getUserSavedProposals(userId: string): Promise<Proposal[]> {
    const savedIds = Array.from(this.savedProposals.values())
      .filter(saved => saved.userId === userId)
      .map(saved => saved.proposalId);
    
    const proposals = savedIds
      .map(id => this.proposals.get(id))
      .filter((proposal): proposal is Proposal => proposal !== undefined);
    
    return proposals.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async isProposalSaved(userId: string, proposalId: string): Promise<boolean> {
    return Array.from(this.savedProposals.values()).some(
      saved => saved.userId === userId && saved.proposalId === proposalId
    );
  }

  // Saved essays operations
  async saveEssay(userId: string, essayId: string): Promise<SavedEssay> {
    const existing = Array.from(this.savedEssays.values()).find(
      saved => saved.userId === userId && saved.essayId === essayId
    );
    
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const savedEssay: SavedEssay = {
      id,
      userId,
      essayId,
      createdAt: new Date()
    };
    
    this.savedEssays.set(id, savedEssay);
    return savedEssay;
  }

  async removeSavedEssay(userId: string, essayId: string): Promise<boolean> {
    const saved = Array.from(this.savedEssays.values()).find(
      saved => saved.userId === userId && saved.essayId === essayId
    );
    
    if (saved) {
      this.savedEssays.delete(saved.id);
      return true;
    }
    return false;
  }

  async getUserSavedEssays(userId: string): Promise<Essay[]> {
    const savedIds = Array.from(this.savedEssays.values())
      .filter(saved => saved.userId === userId)
      .map(saved => saved.essayId);
    
    const essays = savedIds
      .map(id => this.essays.get(id))
      .filter((essay): essay is Essay => essay !== undefined);
    
    return essays.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async isEssaySaved(userId: string, essayId: string): Promise<boolean> {
    return Array.from(this.savedEssays.values()).some(
      saved => saved.userId === userId && saved.essayId === essayId
    );
  }

  // Saved structures operations
  async saveStructure(userId: string, structureId: string): Promise<SavedStructure> {
    const existing = Array.from(this.savedStructures.values()).find(
      saved => saved.userId === userId && saved.structureId === structureId
    );
    
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const savedStructure: SavedStructure = {
      id,
      userId,
      structureId,
      createdAt: new Date()
    };
    
    this.savedStructures.set(id, savedStructure);
    return savedStructure;
  }

  async removeSavedStructure(userId: string, structureId: string): Promise<boolean> {
    const saved = Array.from(this.savedStructures.values()).find(
      saved => saved.userId === userId && saved.structureId === structureId
    );
    
    if (saved) {
      this.savedStructures.delete(saved.id);
      return true;
    }
    return false;
  }

  async getUserSavedStructures(userId: string): Promise<EssayStructure[]> {
    const savedIds = Array.from(this.savedStructures.values())
      .filter(saved => saved.userId === userId)
      .map(saved => saved.structureId);
    
    const structures = savedIds
      .map(id => this.essayStructures.get(id))
      .filter((structure): structure is EssayStructure => structure !== undefined);
    
    return structures.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async isStructureSaved(userId: string, structureId: string): Promise<boolean> {
    return Array.from(this.savedStructures.values()).some(
      saved => saved.userId === userId && saved.structureId === structureId
    );
  }

  // Saved newsletters operations
  async saveNewsletter(userId: string, newsletterId: string): Promise<SavedNewsletter> {
    const existing = Array.from(this.savedNewsletters.values()).find(
      saved => saved.userId === userId && saved.newsletterId === newsletterId
    );
    
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const savedNewsletter: SavedNewsletter = {
      id,
      userId,
      newsletterId,
      createdAt: new Date()
    };
    
    this.savedNewsletters.set(id, savedNewsletter);
    return savedNewsletter;
  }

  async removeSavedNewsletter(userId: string, newsletterId: string): Promise<boolean> {
    const saved = Array.from(this.savedNewsletters.values()).find(
      saved => saved.userId === userId && saved.newsletterId === newsletterId
    );
    
    if (saved) {
      this.savedNewsletters.delete(saved.id);
      return true;
    }
    return false;
  }

  async getUserSavedNewsletters(userId: string): Promise<Newsletter[]> {
    const savedIds = Array.from(this.savedNewsletters.values())
      .filter(saved => saved.userId === userId)
      .map(saved => saved.newsletterId);
    
    const newsletters = savedIds
      .map(id => this.newsletters.get(id))
      .filter((newsletter): newsletter is Newsletter => newsletter !== undefined);
    
    return newsletters.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async isNewsletterSaved(userId: string, newsletterId: string): Promise<boolean> {
    return Array.from(this.savedNewsletters.values()).some(
      saved => saved.userId === userId && saved.newsletterId === newsletterId
    );
  }

  private initializeProposals(): void {
    const initialProposals = [
      {
        title: "Desafios da Educação Digital",
        statement: "Com a aceleração da digitalização durante a pandemia, a educação brasileira enfrenta desafios para garantir acesso equitativo às tecnologias educacionais. A partir da leitura dos textos motivadores e com base nos seus conhecimentos, redija um texto dissertativo-argumentativo sobre o tema 'Os desafios da implementação da educação digital no Brasil e suas implicações sociais'. Apresente proposta de intervenção que respeite os direitos humanos.",
        supportingText: "Dados do IBGE mostram que 67% dos domicílios brasileiros têm acesso à internet, mas apenas 58% dos estudantes de escolas públicas conseguem estudar remotamente. A desigualdade digital evidencia-se quando 8,7 milhões de estudantes não têm acesso a computador ou tablet para atividades escolares.",
        theme: "education" as const,
        difficulty: "medio" as const,
        examType: "enem" as const,
        examName: "ENEM 2023",
        year: 2023,
        rating: 47,
        keywords: ["educação", "tecnologia", "desigualdade", "digital", "acesso", "pandemia"]
      },
      {
        title: "Sustentabilidade e Consumo Consciente",
        statement: "O modelo de consumo da sociedade contemporânea tem gerado impactos significativos no meio ambiente. Considerando os textos de apoio e seus conhecimentos, elabore um texto dissertativo-argumentativo sobre 'A importância do consumo consciente para a sustentabilidade ambiental no século XXI'. Proponha medidas que promovam mudanças de comportamento.",
        supportingText: "A Organização das Nações Unidas alerta que a humanidade consome anualmente 70% mais recursos naturais do que o planeta consegue regenerar. No Brasil, são produzidas cerca de 79 milhões de toneladas de resíduos sólidos por ano, dos quais apenas 13% são reciclados.",
        theme: "environment" as const,
        difficulty: "medio" as const,
        examType: "enem" as const,
        examName: "ENEM 2024",
        year: 2024,
        rating: 46,
        keywords: ["sustentabilidade", "consumo", "meio ambiente", "recursos", "reciclagem"]
      },
      {
        title: "Inclusão no Mercado de Trabalho",
        statement: "Pessoas com deficiência enfrentam barreiras significativas para ingressar no mercado de trabalho brasileiro. Com base nos textos motivadores, redija um texto dissertativo-argumentativo sobre 'Os desafios da inclusão de pessoas com deficiência no mercado de trabalho brasileiro'. Apresente proposta de intervenção.",
        supportingText: "Segundo dados do IBGE, apenas 28,3% das pessoas com deficiência estão no mercado de trabalho, contra 66,3% das pessoas sem deficiência. A Lei de Cotas (Lei 8.213/91) determina que empresas com mais de 100 funcionários contratem entre 2% e 5% de pessoas com deficiência.",
        theme: "social" as const,
        difficulty: "dificil" as const,
        examType: "vestibular" as const,
        examName: "FUVEST 2024",
        year: 2024,
        rating: 48,
        keywords: ["inclusão", "deficiência", "trabalho", "acessibilidade", "lei de cotas"]
      }
    ];

    initialProposals.forEach((prop, index) => {
      const id = `proposal-${index + 1}`;
      const proposal: Proposal = {
        ...prop,
        isAiGenerated: false,
        usageCount: 0,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.proposals.set(id, proposal);
    });
  }

  // Simulation operations
  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const id = randomUUID();
    const simulation: Simulation = {
      ...insertSimulation,
      userId: insertSimulation.userId ?? null,
      customTheme: insertSimulation.customTheme ?? null,
      timeLimit: insertSimulation.timeLimit ?? null,
      timeTaken: insertSimulation.timeTaken ?? null,
      score: insertSimulation.score ?? null,
      progress: insertSimulation.progress ?? null,
      isCompleted: insertSimulation.isCompleted ?? false,
      proposalUsed: insertSimulation.proposalUsed ?? null,
      sessionId: insertSimulation.sessionId ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.simulations.set(id, simulation);
    return simulation;
  }

  async updateSimulation(id: string, updateData: Partial<Simulation>): Promise<Simulation> {
    const existing = this.simulations.get(id);
    if (!existing) {
      throw new Error("Simulation not found");
    }

    const updated: Simulation = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };

    this.simulations.set(id, updated);
    return updated;
  }

  async getSimulation(id: string): Promise<Simulation | undefined> {
    return this.simulations.get(id);
  }

  async getSimulations(userId?: string, sessionId?: string, limit: number = 20, offset: number = 0): Promise<Simulation[]> {
    let simulations = Array.from(this.simulations.values());

    // Filter by userId if provided
    if (userId) {
      simulations = simulations.filter(sim => sim.userId === userId);
    }

    // Filter by sessionId if provided
    if (sessionId) {
      simulations = simulations.filter(sim => sim.sessionId === sessionId);
    }

    // Sort by creation date (newest first)
    simulations = simulations.sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    // Apply pagination
    return simulations.slice(offset, offset + limit);
  }

  async getUserSimulations(userId: string): Promise<Simulation[]> {
    return this.getSimulations(userId, undefined, 100, 0);
  }

  async getSessionSimulations(sessionId: string): Promise<Simulation[]> {
    return this.getSimulations(undefined, sessionId, 100, 0);
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const newConversation: Conversation = {
      id,
      userId: conversation.userId || null,
      sessionId: conversation.sessionId || null,
      messages: conversation.messages || [],
      summary: conversation.summary || null,
      currentSection: conversation.currentSection || "tema",
      brainstormData: conversation.brainstormData || null,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };
    
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async appendMessage(conversationId: string, message: ConversationMessage): Promise<Conversation> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }

    const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const updatedConversation: Conversation = {
      ...conversation,
      messages: [...messages, message],
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversations.set(conversationId, updatedConversation);
    return updatedConversation;
  }

  async updateConversationSummary(conversationId: string, summary: string): Promise<Conversation> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }

    const updatedConversation: Conversation = {
      ...conversation,
      summary,
      updatedAt: new Date(),
    };

    this.conversations.set(conversationId, updatedConversation);
    return updatedConversation;
  }

  async updateConversationData(conversationId: string, brainstormData: any, currentSection: string): Promise<Conversation> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }

    const updatedConversation: Conversation = {
      ...conversation,
      brainstormData,
      currentSection: currentSection as any,
      updatedAt: new Date(),
    };

    this.conversations.set(conversationId, updatedConversation);
    return updatedConversation;
  }

  async getRecentConversations(userId?: string, sessionId?: string, limit: number = 10): Promise<Conversation[]> {
    let conversations = Array.from(this.conversations.values());

    // Filter by userId if provided
    if (userId) {
      conversations = conversations.filter(conv => conv.userId === userId);
    }

    // Filter by sessionId if provided
    if (sessionId) {
      conversations = conversations.filter(conv => conv.sessionId === sessionId);
    }

    // Sort by last message date (newest first)
    conversations = conversations.sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() ?? 0;
      const bTime = b.lastMessageAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    return conversations.slice(0, limit);
  }

  // User scores operations
  async getUserScores(userId: string): Promise<UserScore[]> {
    const scores = Array.from(this.userScores.values())
      .filter(score => score.userId === userId)
      .sort((a, b) => new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime());
    return scores;
  }

  async createUserScore(score: InsertUserScore): Promise<UserScore> {
    const id = randomUUID();
    const userScore: UserScore = {
      ...score,
      source: score.source ?? "manual",
      competence1: score.competence1 ?? null,
      competence2: score.competence2 ?? null,
      competence3: score.competence3 ?? null,
      competence4: score.competence4 ?? null,
      competence5: score.competence5 ?? null,
      sourceId: score.sourceId ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userScores.set(id, userScore);
    return userScore;
  }

  // Admin operations
  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const adminUser: AdminUser = {
      ...admin,
      adminLevel: admin.adminLevel ?? "admin",
      permissions: admin.permissions ?? [],
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adminUsers.set(id, adminUser);
    return adminUser;
  }

  async getAdminUser(userId: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(admin => admin.userId === userId);
  }

  // Cost tracking operations
  async insertUserCost(cost: InsertUserCost): Promise<UserCost> {
    const id = randomUUID();
    const userCost: UserCost = {
      ...cost,
      userId: cost.userId ?? null,
      tokensInput: cost.tokensInput ?? 0,
      tokensOutput: cost.tokensOutput ?? 0,
      costBrl: cost.costBrl ?? 0,
      modelUsed: cost.modelUsed ?? "gemini-2.5-flash-lite",
      processingTime: cost.processingTime ?? null,
      id,
      createdAt: new Date(),
    };
    this.userCosts.set(id, userCost);
    return userCost;
  }

  async insertUserDailyUsage(usage: InsertUserDailyUsage): Promise<UserDailyUsage> {
    const id = randomUUID();
    const dailyUsage: UserDailyUsage = {
      ...usage,
      userId: usage.userId ?? null,
      totalOperations: usage.totalOperations ?? 0,
      totalCostBrl: usage.totalCostBrl ?? 0,
      operationBreakdown: usage.operationBreakdown ?? {},
      costBreakdown: usage.costBreakdown ?? {},
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userDailyUsage.set(id, dailyUsage);
    return dailyUsage;
  }

  async findUserDailyUsage(userId: string | null, ipAddress: string, date: Date): Promise<UserDailyUsage | undefined> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.userDailyUsage.values()).find(usage => {
      const usageDate = new Date(usage.usageDate);
      usageDate.setHours(0, 0, 0, 0);
      
      return usage.userId === userId && 
             usage.ipAddress === ipAddress && 
             usageDate.getTime() === targetDate.getTime();
    });
  }

  async updateUserDailyUsage(id: string, updates: Partial<UserDailyUsage>): Promise<UserDailyUsage> {
    const existing = this.userDailyUsage.get(id);
    if (!existing) {
      throw new Error(`UserDailyUsage with id ${id} not found`);
    }
    
    const cleaned = removeUndefined(updates);
    const updated: UserDailyUsage = {
      ...existing,
      ...cleaned,
      userId: (cleaned as any).userId ?? existing.userId,
      updatedAt: new Date(),
    };
    
    this.userDailyUsage.set(id, updated);
    return updated;
  }

  // Business metrics operations
  async insertBusinessMetric(metric: InsertBusinessMetric): Promise<BusinessMetric> {
    const id = randomUUID();
    const businessMetric: BusinessMetric = {
      ...metric,
      totalUsers: metric.totalUsers ?? null,
      activeUsers: metric.activeUsers ?? null,
      totalOperations: metric.totalOperations ?? null,
      totalCostBrl: metric.totalCostBrl ?? null,
      avgCostPerUser: metric.avgCostPerUser ?? null,
      cacheHitRate: metric.cacheHitRate ?? null,
      topOperation: metric.topOperation ?? null,
      totalRevenue: metric.totalRevenue ?? null,
      id,
      createdAt: new Date(),
    };
    this.businessMetrics.set(id, businessMetric);
    return businessMetric;
  }

  async getDailyOperationStats(startDate: Date, endDate: Date): Promise<{
    totalOperations: number;
    totalCost: number;
    cacheHitRate: number;
    topOperation: string;
  }> {
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      if (!cost.createdAt) return false;
      const costDate = new Date(cost.createdAt);
      return costDate >= startDate && costDate <= endDate;
    });

    const totalOperations = costs.length;
    const totalCost = costs.reduce((sum, cost) => sum + cost.costBrl, 0);
    
    // Calculate cache hit rate
    const aiOperations = costs.filter(cost => cost.source === 'ai').length;
    const cacheHits = costs.filter(cost => cost.source === 'cache').length;
    const cacheHitRate = totalOperations > 0 ? cacheHits / totalOperations : 0;

    // Find top operation
    const operationCounts: Record<string, number> = {};
    costs.forEach(cost => {
      operationCounts[cost.operation] = (operationCounts[cost.operation] || 0) + 1;
    });
    
    const topOperation = Object.entries(operationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    return {
      totalOperations,
      totalCost,
      cacheHitRate,
      topOperation,
    };
  }

  async getUserActivityStats(days: number): Promise<{
    totalUsers: number;
    activeUsers: number;
  }> {
    const totalUsers = this.users.size;
    
    // Calculate active users (users who made requests in the last N days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const activeUserIds = new Set(
      Array.from(this.userCosts.values())
        .filter(cost => cost.createdAt && new Date(cost.createdAt) >= cutoffDate)
        .map(cost => cost.userId || cost.ipAddress)
        .filter(Boolean)
    );
    
    return {
      totalUsers,
      activeUsers: activeUserIds.size,
    };
  }

  async getUserCostSummary(identifier: { userId?: string; ipAddress?: string }, startDate: Date, endDate: Date): Promise<{
    totalCost: number;
    totalOperations: number;
    operationBreakdown: Record<string, number>;
    costBreakdown: Record<string, number>;
  }> {
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      if (!cost.createdAt) return false;
      const costDate = new Date(cost.createdAt);
      const dateMatch = costDate >= startDate && costDate <= endDate;
      
      if (identifier.userId) {
        return dateMatch && cost.userId === identifier.userId;
      } else if (identifier.ipAddress) {
        return dateMatch && cost.ipAddress === identifier.ipAddress;
      }
      
      return false;
    });

    const totalCost = costs.reduce((sum, cost) => sum + cost.costBrl, 0);
    const totalOperations = costs.length;
    
    const operationBreakdown: Record<string, number> = {};
    const costBreakdown: Record<string, number> = {};
    
    costs.forEach(cost => {
      operationBreakdown[cost.operation] = (operationBreakdown[cost.operation] || 0) + 1;
      costBreakdown[cost.operation] = (costBreakdown[cost.operation] || 0) + cost.costBrl;
    });

    return {
      totalCost,
      totalOperations,
      operationBreakdown,
      costBreakdown,
    };
  }

  async getBusinessOverview(startDate: Date, endDate: Date): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    totalCostBrl: number;
    averageCostPerUser: number;
    topOperations: Array<{ operation: string; count: number; cost: number }>;
    dailyTrends: Array<{ date: string; operations: number; cost: number; users: number }>;
    cacheEfficiency: number;
  }> {
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      if (!cost.createdAt) return false;
      const costDate = new Date(cost.createdAt);
      return costDate >= startDate && costDate <= endDate;
    });

    const totalUsers = this.users.size;
    const uniqueIdentifiers = new Set(
      costs.map(c => c.userId || c.ipAddress).filter(Boolean)
    );
    const activeUsers = uniqueIdentifiers.size;
    const totalOperations = costs.length;
    const totalCostBrl = costs.reduce((sum, cost) => sum + cost.costBrl, 0);
    const totalTokens = costs.reduce((sum, cost) => sum + cost.tokensInput + cost.tokensOutput, 0);
    const averageCostPerUser = activeUsers > 0 ? totalCostBrl / activeUsers : 0;

    // Top operations
    const operationStats: Record<string, { count: number; cost: number }> = {};
    costs.forEach(cost => {
      if (!operationStats[cost.operation]) {
        operationStats[cost.operation] = { count: 0, cost: 0 };
      }
      operationStats[cost.operation].count++;
      operationStats[cost.operation].cost += cost.costBrl;
    });

    const topOperations = Object.entries(operationStats)
      .map(([operation, stats]) => ({ operation, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Daily trends
    const dailyData: Record<string, { operations: number; cost: number; users: Set<string> }> = {};
    costs.forEach(cost => {
      if (!cost.createdAt) return;
      const date = new Date(cost.createdAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { operations: 0, cost: 0, users: new Set() };
      }
      dailyData[date].operations++;
      dailyData[date].cost += cost.costBrl;
      const userIdentifier = cost.userId || cost.ipAddress;
      if (userIdentifier) dailyData[date].users.add(userIdentifier);
    });

    const dailyTrends = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        operations: data.operations,
        cost: data.cost,
        users: data.users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cache efficiency
    const cacheHits = costs.filter(c => c.source === 'cache').length;
    const cacheEfficiency = totalOperations > 0 ? (cacheHits / totalOperations) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      totalOperations,
      totalCostBrl,
      totalTokens,
      averageCostPerUser,
      topOperations,
      dailyTrends,
      cacheEfficiency,
    };
  }

  async getTopCostUsers(startDate: Date, endDate: Date, limit: number): Promise<Array<{
    userId?: string;
    ipAddress: string;
    totalCost: number;
    totalOperations: number;
    averageOperationCost: number;
    topOperation: string;
  }>> {
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      if (!cost.createdAt) return false;
      const costDate = new Date(cost.createdAt);
      return costDate >= startDate && costDate <= endDate;
    });

    // Group by user/IP
    const userStats: Record<string, {
      userId?: string;
      ipAddress: string;
      totalCost: number;
      totalOperations: number;
      operations: Record<string, number>;
    }> = {};

    costs.forEach(cost => {
      const key = cost.userId || cost.ipAddress;
      if (!userStats[key]) {
        userStats[key] = {
          userId: cost.userId || undefined,
          ipAddress: cost.ipAddress,
          totalCost: 0,
          totalOperations: 0,
          operations: {},
        };
      }
      
      userStats[key].totalCost += cost.costBrl;
      userStats[key].totalOperations++;
      userStats[key].operations[cost.operation] = (userStats[key].operations[cost.operation] || 0) + 1;
    });

    return Object.values(userStats)
      .map(stats => ({
        userId: stats.userId,
        ipAddress: stats.ipAddress,
        totalCost: stats.totalCost,
        totalOperations: stats.totalOperations,
        averageOperationCost: Math.round(stats.totalCost / stats.totalOperations),
        topOperation: Object.entries(stats.operations)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  // Advanced analytics implementations
  async getHourlyUsagePatterns(startDate: Date, endDate: Date) {
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      const costDate = new Date(cost.createdAt || new Date());
      return costDate >= startDate && costDate <= endDate;
    });

    const hourlyStats: Record<number, {
      operations: number;
      cost: number;
      days: Set<string>;
    }> = {};

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = { operations: 0, cost: 0, days: new Set() };
    }

    costs.forEach(cost => {
      const hour = new Date(cost.createdAt || new Date()).getHours();
      const day = new Date(cost.createdAt || new Date()).toDateString();
      
      hourlyStats[hour].operations++;
      hourlyStats[hour].cost += cost.costBrl;
      hourlyStats[hour].days.add(day);
    });

    return Array.from({ length: 24 }, (_, hour) => {
      const stats = hourlyStats[hour];
      const daysWithActivity = stats.days.size;
      
      return {
        hour,
        totalOperations: stats.operations,
        totalCost: stats.cost,
        averageOperations: daysWithActivity > 0 ? Math.round(stats.operations / daysWithActivity) : 0,
        peakDay: Array.from(stats.days)[0] || '',
      };
    });
  }

  async getDetailedUsersList(days: number, limit: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const costs = Array.from(this.userCosts.values()).filter(cost => {
      const costDate = new Date(cost.createdAt || new Date());
      return costDate >= startDate && costDate <= endDate;
    });

    const rateLimitData = Array.from(this.rateLimits.values()).filter(limit => {
      const limitDate = new Date(limit.createdAt || new Date());
      return limitDate >= startDate && limitDate <= endDate;
    });

    const userStats: Record<string, {
      userId?: string;
      ipAddress: string;
      userType?: string;
      totalCost: number;
      totalOperations: number;
      firstSeen: Date;
      lastSeen: Date;
      operations: Record<string, number>;
      accessCount: number;
    }> = {};

    // Process cost data
    costs.forEach(cost => {
      const key = cost.userId || cost.ipAddress;
      const costDate = new Date(cost.createdAt || new Date());
      
      if (!userStats[key]) {
        userStats[key] = {
          userId: cost.userId || undefined,
          ipAddress: cost.ipAddress,
          userType: 'visitor', // Default since we don't have user data linked
          totalCost: 0,
          totalOperations: 0,
          firstSeen: costDate,
          lastSeen: costDate,
          operations: {},
          accessCount: 0,
        };
      }
      
      userStats[key].totalCost += cost.costBrl;
      userStats[key].totalOperations++;
      userStats[key].operations[cost.operation] = (userStats[key].operations[cost.operation] || 0) + 1;
      
      if (costDate < userStats[key].firstSeen) userStats[key].firstSeen = costDate;
      if (costDate > userStats[key].lastSeen) userStats[key].lastSeen = costDate;
    });

    // Process access frequency from rate limits
    rateLimitData.forEach(rateLimit => {
      const ipAddress = rateLimit.identifier.split('_')[1] || rateLimit.identifier;
      const key = Object.keys(userStats).find(k => 
        userStats[k].ipAddress === ipAddress
      ) || ipAddress;
      
      if (userStats[key]) {
        userStats[key].accessCount += rateLimit.requestCount || 1;
      }
    });

    return Object.values(userStats)
      .map(stats => {
        const daysSinceFirst = Math.max(1, Math.ceil((endDate.getTime() - stats.firstSeen.getTime()) / (1000 * 60 * 60 * 24)));
        const topOperation = Object.entries(stats.operations)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
        
        return {
          userId: stats.userId,
          ipAddress: stats.ipAddress,
          userType: stats.userType,
          totalCost: stats.totalCost,
          totalOperations: stats.totalOperations,
          firstSeen: stats.firstSeen,
          lastSeen: stats.lastSeen,
          daysSinceFirst,
          accessFrequency: Math.round(stats.accessCount / daysSinceFirst * 10) / 10,
          topOperation,
          plan: stats.totalCost > 1000 ? 'Premium' : 'Free', // Mock plan based on usage
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  async getToolsRankingByUsage(startDate: Date, endDate: Date) {
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      const costDate = new Date(cost.createdAt || new Date());
      return costDate >= startDate && costDate <= endDate;
    });

    const toolStats: Record<string, {
      count: number;
      cost: number;
      users: Set<string>;
    }> = {};

    costs.forEach(cost => {
      const operation = cost.operation;
      const userKey = cost.userId || cost.ipAddress;
      
      if (!toolStats[operation]) {
        toolStats[operation] = { count: 0, cost: 0, users: new Set() };
      }
      
      toolStats[operation].count++;
      toolStats[operation].cost += cost.costBrl;
      toolStats[operation].users.add(userKey);
    });

    const operationNames: Record<string, string> = {
      structure_analysis: "Análise de Estrutura",
      essay_generation: "Geração de Redação", 
      essay_correction: "Correção de Redação",
      proposal_generation: "Geração de Proposta",
      proposal_search: "Busca de Proposta",
      future_exam_detection: "Detecção de Provas Futuras",
      repertoire_search: "Busca de Repertório",
      repertoire_generation: "Geração de Repertório",
      ai_chat: "Chat com IA",
      text_modification: "Modificação de Texto"
    };

    return Object.entries(toolStats)
      .map(([operation, stats]) => ({
        operation,
        operationName: operationNames[operation] || operation,
        totalCount: stats.count,
        totalCost: stats.cost,
        averageCost: Math.round(stats.cost / stats.count),
        uniqueUsers: stats.users.size,
        rank: 0, // Will be set after sorting
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  async getUserAccessFrequency(startDate: Date, endDate: Date) {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const costs = Array.from(this.userCosts.values()).filter(cost => {
      const costDate = new Date(cost.createdAt || new Date());
      return costDate >= startDate && costDate <= endDate;
    });

    const userActivityDays: Record<string, Set<string>> = {};
    const userOperations: Record<string, number> = {};
    const userCosts: Record<string, number> = {};

    costs.forEach(cost => {
      const userKey = cost.userId || cost.ipAddress;
      const day = new Date(cost.createdAt || new Date()).toDateString();
      
      if (!userActivityDays[userKey]) {
        userActivityDays[userKey] = new Set();
        userOperations[userKey] = 0;
        userCosts[userKey] = 0;
      }
      
      userActivityDays[userKey].add(day);
      userOperations[userKey]++;
      userCosts[userKey] += cost.costBrl;
    });

    const frequencyBuckets: Record<string, {
      users: number;
      totalOperations: number;
      totalCost: number;
    }> = {
      'Diário': { users: 0, totalOperations: 0, totalCost: 0 },
      'Semanal': { users: 0, totalOperations: 0, totalCost: 0 },
      'Esporádico': { users: 0, totalOperations: 0, totalCost: 0 },
      'Único': { users: 0, totalOperations: 0, totalCost: 0 },
    };

    Object.entries(userActivityDays).forEach(([userKey, activeDays]) => {
      const dayCount = activeDays.size;
      const operations = userOperations[userKey];
      const cost = userCosts[userKey];
      
      let frequency: string;
      if (dayCount >= totalDays * 0.8) frequency = 'Diário';
      else if (dayCount >= totalDays * 0.3) frequency = 'Semanal';
      else if (dayCount >= 2) frequency = 'Esporádico';
      else frequency = 'Único';
      
      frequencyBuckets[frequency].users++;
      frequencyBuckets[frequency].totalOperations += operations;
      frequencyBuckets[frequency].totalCost += cost;
    });

    return Object.entries(frequencyBuckets).map(([frequency, data]) => ({
      frequency,
      userCount: data.users,
      averageOperations: data.users > 0 ? Math.round(data.totalOperations / data.users) : 0,
      averageCost: data.users > 0 ? Math.round(data.totalCost / data.users) : 0,
    }));
  }

  // Weekly usage operations for unified cost limiting
  async findWeeklyUsage(identifier: string, weekStart: Date): Promise<WeeklyUsage | undefined> {
    return Array.from(this.weeklyUsages.values()).find(
      usage => usage.identifier === identifier && 
      usage.weekStart.getTime() === weekStart.getTime()
    );
  }

  async insertWeeklyUsage(usage: InsertWeeklyUsage): Promise<WeeklyUsage> {
    const id = randomUUID();
    const weeklyUsage: WeeklyUsage = {
      ...usage,
      totalCostCentavos: usage.totalCostCentavos ?? null,
      operationCount: usage.operationCount ?? null,
      operationBreakdown: usage.operationBreakdown ?? {},
      costBreakdown: usage.costBreakdown ?? {},
      lastOperation: usage.lastOperation ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.weeklyUsages.set(id, weeklyUsage);
    return weeklyUsage;
  }

  async upsertWeeklyUsage(usage: InsertWeeklyUsage): Promise<WeeklyUsage> {
    // Find existing record
    const existing = Array.from(this.weeklyUsages.values()).find(
      wu => wu.identifier === usage.identifier && 
      wu.weekStart.getTime() === usage.weekStart.getTime()
    );

    if (existing) {
      // Update existing record with merged values
      const operationBreakdown = { ...existing.operationBreakdown as any, ...usage.operationBreakdown as any };
      const costBreakdown = { ...existing.costBreakdown as any, ...usage.costBreakdown as any };
      
      const updated: WeeklyUsage = {
        ...existing,
        totalCostCentavos: (existing.totalCostCentavos || 0) + (usage.totalCostCentavos || 0),
        operationCount: (existing.operationCount || 0) + (usage.operationCount || 0),
        operationBreakdown,
        costBreakdown,
        lastOperation: usage.lastOperation || new Date(),
        updatedAt: new Date(),
      };
      this.weeklyUsages.set(existing.id, updated);
      return updated;
    } else {
      // Insert new record
      return this.insertWeeklyUsage(usage);
    }
  }

  async updateWeeklyUsage(id: string, usage: Partial<WeeklyUsage>): Promise<WeeklyUsage> {
    const existing = this.weeklyUsages.get(id);
    if (!existing) {
      throw new Error("Weekly usage not found");
    }

    const cleaned = removeUndefined(usage);
    const updated: WeeklyUsage = {
      ...existing,
      ...cleaned,
      updatedAt: new Date(),
    };

    this.weeklyUsages.set(id, updated);
    return updated;
  }

  async getWeeklyUsageHistory(identifier: string, weeks: number): Promise<WeeklyUsage[]> {
    const now = new Date();
    const weeksAgo = new Date(now);
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));

    return Array.from(this.weeklyUsages.values())
      .filter(usage => 
        usage.identifier === identifier && 
        usage.weekStart >= weeksAgo
      )
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }

  // ===================== FASE 1: RECEITA + IA COST TRACKING =====================

  // Subscription plans operations
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = randomUUID();
    const subscriptionPlan: SubscriptionPlan = {
      ...plan,
      id,
      description: plan.description || null,
      priceYearly: plan.priceYearly || null,
      features: plan.features || [],
      maxOperationsPerMonth: plan.maxOperationsPerMonth || null,
      maxAICostPerMonth: plan.maxAICostPerMonth || null,
      isActive: plan.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptionPlans.set(id, subscriptionPlan);
    return subscriptionPlan;
  }

  async getSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]> {
    const plans = Array.from(this.subscriptionPlans.values());
    return activeOnly ? plans.filter(p => p.isActive) : plans;
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const existing = this.subscriptionPlans.get(id);
    if (!existing) throw new Error("Subscription plan not found");
    
    const updated: SubscriptionPlan = {
      ...existing,
      ...removeUndefined(plan),
      updatedAt: new Date(),
    };
    this.subscriptionPlans.set(id, updated);
    return updated;
  }

  // User subscriptions operations
  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = randomUUID();
    const userSubscription: UserSubscription = {
      ...subscription,
      id,
      billingCycle: subscription.billingCycle || 'monthly',
      endDate: subscription.endDate || null,
      trialEndDate: subscription.trialEndDate || null,
      nextBillingDate: subscription.nextBillingDate || null,
      cancelledAt: subscription.cancelledAt || null,
      cancellationReason: subscription.cancellationReason || null,
      isAutoRenew: subscription.isAutoRenew ?? true,
      paymentMethodId: subscription.paymentMethodId || null,
      stripeCustomerId: subscription.stripeCustomerId ?? null,
      stripeSubscriptionId: subscription.stripeSubscriptionId ?? null,
      stripeStatus: subscription.stripeStatus ?? null,
      currentPeriodStart: subscription.currentPeriodStart ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      couponId: subscription.couponId ?? null,
      effectivePriceCentavos: subscription.effectivePriceCentavos ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSubscriptions.set(id, userSubscription);
    return userSubscription;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    return Array.from(this.userSubscriptions.values())
      .find(sub => sub.userId === userId && sub.status === 'active');
  }

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values())
      .filter(sub => sub.userId === userId);
  }

  async updateUserSubscription(id: string, subscription: Partial<UserSubscription>): Promise<UserSubscription> {
    const existing = this.userSubscriptions.get(id);
    if (!existing) throw new Error("User subscription not found");
    
    const updated: UserSubscription = {
      ...existing,
      ...removeUndefined(subscription),
      updatedAt: new Date(),
    };
    this.userSubscriptions.set(id, updated);
    return updated;
  }

  async getActiveSubscriptions(): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values())
      .filter(sub => sub.status === 'active');
  }

  async getSubscriptionsByStatus(status: string): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values())
      .filter(sub => sub.status === status);
  }

  // Transactions operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      userId: transaction.userId || null,
      subscriptionId: transaction.subscriptionId || null,
      currency: transaction.currency || 'BRL',
      paymentMethod: transaction.paymentMethod || null,
      paymentProcessorId: transaction.paymentProcessorId || null,
      description: transaction.description || null,
      metadata: transaction.metadata || {},
      processor: transaction.processor ?? "stripe",
      stripePaymentIntentId: transaction.stripePaymentIntentId ?? null,
      stripeChargeId: transaction.stripeChargeId ?? null,
      stripeInvoiceId: transaction.stripeInvoiceId ?? null,
      periodStart: transaction.periodStart ?? null,
      periodEnd: transaction.periodEnd ?? null,
      discountAppliedCentavos: transaction.discountAppliedCentavos ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId);
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const existing = this.transactions.get(id);
    if (!existing) throw new Error("Transaction not found");
    
    const updated: Transaction = {
      ...existing,
      ...removeUndefined(transaction),
      updatedAt: new Date(),
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.createdAt && tx.createdAt >= startDate && tx.createdAt <= endDate);
  }

  // Revenue metrics operations
  async createRevenueMetric(metric: InsertRevenueMetric): Promise<RevenueMetric> {
    const id = randomUUID();
    const revenueMetric: RevenueMetric = {
      ...metric,
      id,
      mrr: metric.mrr || null,
      arr: metric.arr || null,
      newMrrThisMonth: metric.newMrrThisMonth || null,
      churnedMrrThisMonth: metric.churnedMrrThisMonth || null,
      expansionMrrThisMonth: metric.expansionMrrThisMonth || null,
      contractionMrrThisMonth: metric.contractionMrrThisMonth || null,
      totalActiveSubscriptions: metric.totalActiveSubscriptions || null,
      trialUsers: metric.trialUsers || null,
      paidUsers: metric.paidUsers || null,
      arpu: metric.arpu || null,
      ltv: metric.ltv || null,
      cac: metric.cac || null,
      paybackPeriodDays: metric.paybackPeriodDays || null,
      grossMarginPercent: metric.grossMarginPercent || null,
      createdAt: new Date(),
    };
    this.revenueMetrics.set(id, revenueMetric);
    return revenueMetric;
  }

  async getRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetric[]> {
    return Array.from(this.revenueMetrics.values())
      .filter(metric => metric.metricDate >= startDate && metric.metricDate <= endDate)
      .sort((a, b) => b.metricDate.getTime() - a.metricDate.getTime());
  }

  async getLatestRevenueMetric(): Promise<RevenueMetric | undefined> {
    const metrics = Array.from(this.revenueMetrics.values());
    return metrics.sort((a, b) => b.metricDate.getTime() - a.metricDate.getTime())[0];
  }

  async getRevenueOverview(days: number): Promise<{
    mrr: number;
    arr: number;
    totalActiveSubscriptions: number;
    paidUsers: number;
    trialUsers: number;
    arpu: number;
    grossMarginPercent: number;
    mrrGrowthRate: number;
    churnRate: number;
  }> {
    const latest = await this.getLatestRevenueMetric();
    const activeSubscriptions = await this.getActiveSubscriptions();
    const trialSubs = await this.getSubscriptionsByStatus('trial');
    
    // Calculate MRR growth rate (mock calculation)
    const previousPeriod = new Date();
    previousPeriod.setDate(previousPeriod.getDate() - days);
    const previousMetrics = await this.getRevenueMetrics(previousPeriod, new Date());
    const previousMrr = previousMetrics.length > 1 ? (previousMetrics[1].mrr || 0) : (latest?.mrr || 0);
    const currentMrr = latest?.mrr || 0;
    const mrrGrowthRate = previousMrr > 0 ? ((currentMrr - previousMrr) / previousMrr) * 100 : 0;
    
    return {
      mrr: latest?.mrr || 0,
      arr: latest?.arr || 0,
      totalActiveSubscriptions: activeSubscriptions.length,
      paidUsers: latest?.paidUsers || 0,
      trialUsers: trialSubs.length,
      arpu: latest?.arpu || 0,
      grossMarginPercent: latest?.grossMarginPercent || 0,
      mrrGrowthRate,
      churnRate: 0, // Would be calculated from cohort data
    };
  }

  // ===================== FASE 2: FUNIL DE CONVERSÃO + UX COMPLETION RATES =====================

  // User events operations
  async createUserEvent(event: InsertUserEvent): Promise<UserEvent> {
    const id = randomUUID();
    const userEvent: UserEvent = {
      ...event,
      id,
      userId: event.userId || null,
      properties: event.properties || {},
      source: event.source || null,
      medium: event.medium || null,
      campaign: event.campaign || null,
      ipAddress: event.ipAddress || null,
      userAgent: event.userAgent || null,
      createdAt: new Date(),
    };
    this.userEvents.set(id, userEvent);
    return userEvent;
  }

  async getUserEvents(userId?: string, sessionId?: string, eventType?: string): Promise<UserEvent[]> {
    return Array.from(this.userEvents.values()).filter(event => 
      (!userId || event.userId === userId) &&
      (!sessionId || event.sessionId === sessionId) &&
      (!eventType || event.eventType === eventType)
    );
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, eventType?: string): Promise<UserEvent[]> {
    return Array.from(this.userEvents.values()).filter(event => 
      event.createdAt && event.createdAt >= startDate && 
      event.createdAt && event.createdAt <= endDate &&
      (!eventType || event.eventType === eventType)
    );
  }

  // Conversion funnels operations
  async createConversionFunnel(funnel: InsertConversionFunnel): Promise<ConversionFunnel> {
    const id = randomUUID();
    const conversionFunnel: ConversionFunnel = {
      ...funnel,
      id,
      conversionRate: funnel.conversionRate || null,
      usersEntered: funnel.usersEntered || null,
      usersCompleted: funnel.usersCompleted || null,
      averageTimeToComplete: funnel.averageTimeToComplete || null,
      createdAt: new Date(),
    };
    this.conversionFunnels.set(id, conversionFunnel);
    return conversionFunnel;
  }

  async getConversionFunnels(funnelName?: string, metricDate?: Date): Promise<ConversionFunnel[]> {
    return Array.from(this.conversionFunnels.values()).filter(funnel => 
      (!funnelName || funnel.funnelName === funnelName) &&
      (!metricDate || funnel.metricDate.toDateString() === metricDate.toDateString())
    );
  }

  async getConversionRates(funnelName: string, startDate: Date, endDate: Date): Promise<Array<{
    stepName: string;
    stepNumber: number;
    conversionRate: number;
    usersEntered: number;
    usersCompleted: number;
    averageTimeToComplete: number;
  }>> {
    const funnels = Array.from(this.conversionFunnels.values()).filter(funnel => 
      funnel.funnelName === funnelName &&
      funnel.metricDate >= startDate && 
      funnel.metricDate <= endDate
    );

    // Group by step and calculate averages
    const stepGroups = new Map();
    funnels.forEach(funnel => {
      const key = `${funnel.stepNumber}-${funnel.stepName}`;
      if (!stepGroups.has(key)) {
        stepGroups.set(key, {
          stepName: funnel.stepName,
          stepNumber: funnel.stepNumber,
          totalConversionRate: 0,
          totalUsersEntered: 0,
          totalUsersCompleted: 0,
          totalTime: 0,
          count: 0
        });
      }
      const group = stepGroups.get(key);
      group.totalConversionRate += funnel.conversionRate;
      group.totalUsersEntered += funnel.usersEntered;
      group.totalUsersCompleted += funnel.usersCompleted;
      group.totalTime += funnel.averageTimeToComplete;
      group.count++;
    });

    return Array.from(stepGroups.values()).map(group => ({
      stepName: group.stepName,
      stepNumber: group.stepNumber,
      conversionRate: group.count > 0 ? group.totalConversionRate / group.count : 0,
      usersEntered: group.totalUsersEntered,
      usersCompleted: group.totalUsersCompleted,
      averageTimeToComplete: group.count > 0 ? group.totalTime / group.count : 0,
    })).sort((a, b) => a.stepNumber - b.stepNumber);
  }

  // User sessions operations
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const id = randomUUID();
    const userSession: UserSession = {
      ...session,
      id,
      userId: session.userId || null,
      startTime: session.startTime || new Date(),
      endTime: session.endTime || null,
      duration: session.duration || null,
      pageViews: session.pageViews || null,
      bounced: session.bounced ?? false,
      source: session.source || null,
      medium: session.medium || null,
      campaign: session.campaign || null,
      device: session.device || null,
      browser: session.browser || null,
      os: session.os || null,
      country: session.country || null,
      city: session.city || null,
      createdAt: new Date(),
    };
    this.userSessions.set(id, userSession);
    return userSession;
  }

  async updateUserSession(id: string, session: Partial<UserSession>): Promise<UserSession> {
    const existing = this.userSessions.get(id);
    if (!existing) throw new Error("User session not found");
    
    const updated: UserSession = {
      ...existing,
      ...removeUndefined(session),
    };
    this.userSessions.set(id, updated);
    return updated;
  }

  async getUserSessions(userId?: string, startDate?: Date, endDate?: Date): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(session => 
      (!userId || session.userId === userId) &&
      (!startDate || (session.startTime && session.startTime >= startDate)) &&
      (!endDate || (session.startTime && session.startTime <= endDate))
    );
  }

  async getSessionMetrics(startDate: Date, endDate: Date): Promise<{
    totalSessions: number;
    averageDuration: number;
    bounceRate: number;
    averagePageViews: number;
    topSources: Array<{ source: string; count: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
  }> {
    const sessions = await this.getUserSessions(undefined, startDate, endDate);
    const totalSessions = sessions.length;
    
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        averageDuration: 0,
        bounceRate: 0,
        averagePageViews: 0,
        topSources: [],
        deviceBreakdown: []
      };
    }

    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalPageViews = sessions.reduce((sum, s) => sum + (s.pageViews || 0), 0);
    const bouncedSessions = sessions.filter(s => s.bounced).length;

    // Source analysis
    const sourceCount = new Map();
    sessions.forEach(s => {
      if (s.source) {
        sourceCount.set(s.source, (sourceCount.get(s.source) || 0) + 1);
      }
    });

    // Device analysis
    const deviceCount = new Map();
    sessions.forEach(s => {
      if (s.device) {
        deviceCount.set(s.device, (deviceCount.get(s.device) || 0) + 1);
      }
    });

    return {
      totalSessions,
      averageDuration: totalDuration / totalSessions,
      bounceRate: (bouncedSessions / totalSessions) * 100,
      averagePageViews: totalPageViews / totalSessions,
      topSources: Array.from(sourceCount.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      deviceBreakdown: Array.from(deviceCount.entries())
        .map(([device, count]) => ({ 
          device, 
          count, 
          percentage: (count / totalSessions) * 100 
        }))
        .sort((a, b) => b.count - a.count)
    };
  }

  // Task completions operations
  async createTaskCompletion(task: InsertTaskCompletion): Promise<TaskCompletion> {
    const id = randomUUID();
    const taskCompletion: TaskCompletion = {
      ...task,
      id,
      userId: task.userId || null,
      startTime: task.startTime || new Date(),
      completionTime: task.completionTime || null,
      timeToComplete: task.timeToComplete || null,
      steps: task.steps || [],
      errors: task.errors || [],
      satisfactionScore: task.satisfactionScore || null,
      npsScore: task.npsScore || null,
      feedback: task.feedback || null,
      createdAt: new Date(),
    };
    this.taskCompletions.set(id, taskCompletion);
    return taskCompletion;
  }

  async updateTaskCompletion(id: string, task: Partial<TaskCompletion>): Promise<TaskCompletion> {
    const existing = this.taskCompletions.get(id);
    if (!existing) throw new Error("Task completion not found");
    
    const updated: TaskCompletion = {
      ...existing,
      ...removeUndefined(task),
    };
    this.taskCompletions.set(id, updated);
    return updated;
  }

  async getTaskCompletions(userId?: string, taskType?: string, status?: string): Promise<TaskCompletion[]> {
    return Array.from(this.taskCompletions.values()).filter(task => 
      (!userId || task.userId === userId) &&
      (!taskType || task.taskType === taskType) &&
      (!status || task.status === status)
    );
  }

  async getTaskCompletionRates(taskType?: string, startDate?: Date, endDate?: Date): Promise<Array<{
    taskType: string;
    taskName: string;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageTimeToComplete: number;
    averageSatisfactionScore: number;
    averageNpsScore: number;
  }>> {
    const tasks = Array.from(this.taskCompletions.values()).filter(task => 
      (!taskType || task.taskType === taskType) &&
      (!startDate || (task.startTime && task.startTime >= startDate)) &&
      (!endDate || (task.startTime && task.startTime <= endDate))
    );

    // Group by task type and name
    const taskGroups = new Map();
    tasks.forEach(task => {
      const key = `${task.taskType}-${task.taskName}`;
      if (!taskGroups.has(key)) {
        taskGroups.set(key, {
          taskType: task.taskType,
          taskName: task.taskName,
          started: 0,
          completed: 0,
          totalTime: 0,
          completedTasks: 0,
          totalSatisfaction: 0,
          satisfactionCount: 0,
          totalNps: 0,
          npsCount: 0
        });
      }
      const group = taskGroups.get(key);
      group.started++;
      if (task.status === 'completed') {
        group.completed++;
        group.totalTime += task.timeToComplete || 0;
        group.completedTasks++;
      }
      if (task.satisfactionScore) {
        group.totalSatisfaction += task.satisfactionScore;
        group.satisfactionCount++;
      }
      if (task.npsScore !== null && task.npsScore !== undefined) {
        group.totalNps += task.npsScore;
        group.npsCount++;
      }
    });

    return Array.from(taskGroups.values()).map(group => ({
      taskType: group.taskType,
      taskName: group.taskName,
      totalStarted: group.started,
      totalCompleted: group.completed,
      completionRate: group.started > 0 ? (group.completed / group.started) * 100 : 0,
      averageTimeToComplete: group.completedTasks > 0 ? group.totalTime / group.completedTasks : 0,
      averageSatisfactionScore: group.satisfactionCount > 0 ? group.totalSatisfaction / group.satisfactionCount : 0,
      averageNpsScore: group.npsCount > 0 ? group.totalNps / group.npsCount : 0,
    }));
  }

  // ===================== FASE 3: ADVANCED COHORT ANALYSIS + PREDICTIVE METRICS =====================

  // User cohorts operations
  async createUserCohort(cohort: InsertUserCohort): Promise<UserCohort> {
    const id = randomUUID();
    const userCohort: UserCohort = {
      ...cohort,
      id,
      firstPaymentDate: cohort.firstPaymentDate || null,
      source: cohort.source || null,
      campaign: cohort.campaign || null,
      initialPlan: cohort.initialPlan || null,
      currentMrr: cohort.currentMrr || null,
      totalRevenue: cohort.totalRevenue || null,
      lifetimeDays: cohort.lifetimeDays || null,
      churnDate: cohort.churnDate || null,
      churnReason: cohort.churnReason || null,
      lastActivityDate: cohort.lastActivityDate || null,
      totalOperations: cohort.totalOperations || null,
      totalAiCost: cohort.totalAiCost || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userCohorts.set(id, userCohort);
    return userCohort;
  }

  async updateUserCohort(id: string, cohort: Partial<UserCohort>): Promise<UserCohort> {
    const existing = this.userCohorts.get(id);
    if (!existing) throw new Error("User cohort not found");
    
    const updated: UserCohort = {
      ...existing,
      ...removeUndefined(cohort),
      updatedAt: new Date(),
    };
    this.userCohorts.set(id, updated);
    return updated;
  }

  async getUserCohort(userId: string): Promise<UserCohort | undefined> {
    return Array.from(this.userCohorts.values()).find(cohort => cohort.userId === userId);
  }

  async getCohortAnalysis(cohortMonth?: Date): Promise<Array<{
    cohortMonth: string;
    totalUsers: number;
    activeUsers: number;
    churnedUsers: number;
    retentionRate: number;
    currentMrr: number;
    averageLtv: number;
    averageLifetimeDays: number;
  }>> {
    const cohorts = Array.from(this.userCohorts.values()).filter(cohort => 
      !cohortMonth || cohort.cohortMonth.toDateString() === cohortMonth.toDateString()
    );

    // Group by cohort month
    const cohortGroups = new Map();
    cohorts.forEach(cohort => {
      const monthKey = cohort.cohortMonth.toISOString().substring(0, 7); // YYYY-MM
      if (!cohortGroups.has(monthKey)) {
        cohortGroups.set(monthKey, {
          cohortMonth: monthKey,
          totalUsers: 0,
          activeUsers: 0,
          churnedUsers: 0,
          totalMrr: 0,
          totalLtv: 0,
          totalLifetimeDays: 0
        });
      }
      const group = cohortGroups.get(monthKey);
      group.totalUsers++;
      if (cohort.currentStatus === 'active') group.activeUsers++;
      if (cohort.currentStatus === 'churned') group.churnedUsers++;
      group.totalMrr += cohort.currentMrr || 0;
      group.totalLtv += cohort.totalRevenue || 0;
      group.totalLifetimeDays += cohort.lifetimeDays || 0;
    });

    return Array.from(cohortGroups.values()).map(group => ({
      cohortMonth: group.cohortMonth,
      totalUsers: group.totalUsers,
      activeUsers: group.activeUsers,
      churnedUsers: group.churnedUsers,
      retentionRate: group.totalUsers > 0 ? (group.activeUsers / group.totalUsers) * 100 : 0,
      currentMrr: group.totalMrr,
      averageLtv: group.totalUsers > 0 ? group.totalLtv / group.totalUsers : 0,
      averageLifetimeDays: group.totalUsers > 0 ? group.totalLifetimeDays / group.totalUsers : 0,
    })).sort((a, b) => a.cohortMonth.localeCompare(b.cohortMonth));
  }

  async getRevenueBySource(startDate: Date, endDate: Date): Promise<Array<{
    source: string;
    totalRevenue: number;
    totalUsers: number;
    averageRevenue: number;
    percentage: number;
  }>> {
    const cohorts = Array.from(this.userCohorts.values()).filter(cohort => 
      cohort.signupDate >= startDate && cohort.signupDate <= endDate
    );

    const sourceGroups = new Map();
    let totalRevenue = 0;

    cohorts.forEach(cohort => {
      const source = cohort.source || 'unknown';
      if (!sourceGroups.has(source)) {
        sourceGroups.set(source, { totalRevenue: 0, totalUsers: 0 });
      }
      const group = sourceGroups.get(source);
      group.totalRevenue += cohort.totalRevenue || 0;
      group.totalUsers++;
      totalRevenue += cohort.totalRevenue || 0;
    });

    return Array.from(sourceGroups.entries()).map(([source, data]) => ({
      source,
      totalRevenue: data.totalRevenue,
      totalUsers: data.totalUsers,
      averageRevenue: data.totalUsers > 0 ? data.totalRevenue / data.totalUsers : 0,
      percentage: totalRevenue > 0 ? (data.totalRevenue / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  // Predictive metrics operations
  async createPredictiveMetric(metric: InsertPredictiveMetric): Promise<PredictiveMetric> {
    const id = randomUUID();
    const predictiveMetric: PredictiveMetric = {
      ...metric,
      id,
      confidenceScore: metric.confidenceScore || null,
      actualValue: metric.actualValue || null,
      features: metric.features || {},
      createdAt: new Date(),
    };
    this.predictiveMetrics.set(id, predictiveMetric);
    return predictiveMetric;
  }

  async getPredictiveMetrics(metricType?: string, timeHorizon?: string): Promise<PredictiveMetric[]> {
    return Array.from(this.predictiveMetrics.values()).filter(metric => 
      (!metricType || metric.metricType === metricType) &&
      (!timeHorizon || metric.timeHorizon === timeHorizon)
    );
  }

  async getLatestPredictions(metricType: string): Promise<PredictiveMetric[]> {
    const metrics = Array.from(this.predictiveMetrics.values())
      .filter(metric => metric.metricType === metricType)
      .sort((a, b) => b.metricDate.getTime() - a.metricDate.getTime());
    
    // Group by time horizon and get latest for each
    const latestByHorizon = new Map();
    metrics.forEach(metric => {
      if (!latestByHorizon.has(metric.timeHorizon)) {
        latestByHorizon.set(metric.timeHorizon, metric);
      }
    });
    
    return Array.from(latestByHorizon.values());
  }

  // Churn predictions operations
  async createChurnPrediction(prediction: InsertChurnPrediction): Promise<ChurnPrediction> {
    const id = randomUUID();
    const churnPrediction: ChurnPrediction = {
      ...prediction,
      id,
      daysToChurn: prediction.daysToChurn || null,
      riskFactors: prediction.riskFactors || [],
      recommendedActions: prediction.recommendedActions || [],
      isActual: prediction.isActual ?? false,
      actualChurnDate: prediction.actualChurnDate || null,
      interventionTaken: prediction.interventionTaken || null,
      createdAt: new Date(),
    };
    this.churnPredictions.set(id, churnPrediction);
    return churnPrediction;
  }

  async updateChurnPrediction(id: string, prediction: Partial<ChurnPrediction>): Promise<ChurnPrediction> {
    const existing = this.churnPredictions.get(id);
    if (!existing) throw new Error("Churn prediction not found");
    
    const updated: ChurnPrediction = {
      ...existing,
      ...removeUndefined(prediction),
    };
    this.churnPredictions.set(id, updated);
    return updated;
  }

  async getChurnPredictions(riskLevel?: string, userId?: string): Promise<ChurnPrediction[]> {
    return Array.from(this.churnPredictions.values()).filter(prediction => 
      (!riskLevel || prediction.riskLevel === riskLevel) &&
      (!userId || prediction.userId === userId)
    );
  }

  async getHighRiskUsers(limit?: number): Promise<Array<{
    userId: string;
    userName: string;
    userEmail: string;
    churnProbability: number;
    riskLevel: string;
    daysToChurn: number;
    riskFactors: string[];
    recommendedActions: string[];
  }>> {
    const highRiskPredictions = Array.from(this.churnPredictions.values())
      .filter(prediction => ['high', 'critical'].includes(prediction.riskLevel))
      .sort((a, b) => b.churnProbability - a.churnProbability);
      
    const results = [];
    for (const prediction of highRiskPredictions) {
      const user = await this.getUser(prediction.userId);
      if (user) {
        results.push({
          userId: prediction.userId,
          userName: user.name,
          userEmail: user.email,
          churnProbability: prediction.churnProbability,
          riskLevel: prediction.riskLevel,
          daysToChurn: prediction.daysToChurn || 0,
          riskFactors: (prediction.riskFactors as string[]) || [],
          recommendedActions: (prediction.recommendedActions as string[]) || [],
        });
      }
    }
    
    return limit ? results.slice(0, limit) : results;
  }

  // Initialize subscription plans with sample data
  private initializeSubscriptionPlans() {
    const plans = [
      {
        name: "Básico",
        description: "Plano básico para estudantes",
        priceMonthly: 2900, // R$ 29.00
        priceYearly: 29000, // R$ 290.00
        features: ["5 redações por mês", "Chat com IA limitado", "Estruturas básicas"],
        maxOperationsPerMonth: 50,
        maxAICostPerMonth: 500, // R$ 5.00
        isActive: true
      },
      {
        name: "Premium",
        description: "Plano completo para vestibulandos",
        priceMonthly: 4900, // R$ 49.00
        priceYearly: 49000, // R$ 490.00
        features: ["Redações ilimitadas", "Chat com IA completo", "Todas as estruturas", "Correções detalhadas"],
        maxOperationsPerMonth: -1, // ilimitado
        maxAICostPerMonth: 2000, // R$ 20.00
        isActive: true
      }
    ];

    plans.forEach(plan => {
      const id = randomUUID();
      const subscriptionPlan: SubscriptionPlan = {
        ...plan,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.subscriptionPlans.set(id, subscriptionPlan);
    });
  }

  // ===================== NEWSLETTER OPERATIONS IMPLEMENTATION =====================
  
  // Newsletter subscriber operations
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = randomUUID();
    const unsubscribeToken = randomUUID();
    const newsletterSubscriber: NewsletterSubscriber = {
      ...subscriber,
      id,
      status: "active",
      subscriptionSource: subscriber.subscriptionSource || "footer",
      unsubscribeToken,
      name: subscriber.name || null,
      confirmedAt: null,
      unsubscribedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.newsletterSubscribers.set(id, newsletterSubscriber);
    return newsletterSubscriber;
  }

  async getNewsletterSubscriber(id: string): Promise<NewsletterSubscriber | undefined> {
    return this.newsletterSubscribers.get(id);
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(
      subscriber => subscriber.email === email
    );
  }

  async updateNewsletterSubscriber(id: string, subscriber: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber> {
    const existing = this.newsletterSubscribers.get(id);
    if (!existing) throw new Error("Newsletter subscriber not found");
    
    const updated: NewsletterSubscriber = {
      ...existing,
      ...removeUndefined(subscriber),
      updatedAt: new Date(),
    };
    this.newsletterSubscribers.set(id, updated);
    return updated;
  }

  async deleteNewsletterSubscriber(id: string): Promise<void> {
    const exists = this.newsletterSubscribers.has(id);
    if (!exists) throw new Error("Newsletter subscriber not found");
    this.newsletterSubscribers.delete(id);
  }

  async getAllNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
    const subscribers = Array.from(this.newsletterSubscribers.values());
    return status ? subscribers.filter(s => s.status === status) : subscribers;
  }

  async getActiveNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values()).filter(
      subscriber => subscriber.status === "active"
    );
  }

  async unsubscribeByToken(token: string): Promise<boolean> {
    const subscriber = Array.from(this.newsletterSubscribers.values()).find(
      s => s.unsubscribeToken === token
    );
    if (!subscriber) return false;
    
    await this.updateNewsletterSubscriber(subscriber.id, {
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    });
    return true;
  }

  // Newsletter operations
  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const id = randomUUID();
    const newsletterItem: Newsletter = {
      ...newsletter,
      id,
      status: "draft",
      plainTextContent: newsletter.plainTextContent || null,
      previewText: newsletter.previewText || null,
      category: newsletter.category || null,
      readTime: newsletter.readTime || null,
      excerpt: newsletter.excerpt || null,
      isNew: newsletter.isNew || false,
      publishDate: newsletter.publishDate || null,
      scheduledAt: newsletter.scheduledAt || null,
      sentAt: null,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      bounceCount: 0,
      unsubscribeCount: 0,
      tags: newsletter.tags || [],
      authorId: newsletter.authorId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.newsletters.set(id, newsletterItem);
    return newsletterItem;
  }

  async getNewsletter(id: string): Promise<Newsletter | undefined> {
    return this.newsletters.get(id);
  }

  async getAllNewsletters(status?: string): Promise<Newsletter[]> {
    const newsletters = Array.from(this.newsletters.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
    return status ? newsletters.filter(n => n.status === status) : newsletters;
  }

  async updateNewsletter(id: string, newsletter: Partial<Newsletter>): Promise<Newsletter> {
    const existing = this.newsletters.get(id);
    if (!existing) throw new Error("Newsletter not found");
    
    const updated: Newsletter = {
      ...existing,
      ...removeUndefined(newsletter),
      updatedAt: new Date(),
    };
    this.newsletters.set(id, updated);
    return updated;
  }

  async deleteNewsletter(id: string): Promise<void> {
    const exists = this.newsletters.has(id);
    if (!exists) throw new Error("Newsletter not found");
    this.newsletters.delete(id);
    
    // Also delete related sends
    const sends = Array.from(this.newsletterSends.values()).filter(
      send => send.newsletterId === id
    );
    sends.forEach(send => this.newsletterSends.delete(send.id));
  }

  async getNewslettersByAuthor(authorId: string): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values()).filter(
      newsletter => newsletter.authorId === authorId
    ).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Newsletter send operations
  async createNewsletterSend(send: InsertNewsletterSend): Promise<NewsletterSend> {
    const id = randomUUID();
    const newsletterSend: NewsletterSend = {
      ...send,
      id,
      sentAt: send.sentAt || new Date(),
      deliveredAt: null,
      openedAt: null,
      firstClickedAt: null,
      unsubscribedAt: null,
      bounceReason: send.bounceReason || null,
      userAgent: send.userAgent || null,
      ipAddress: send.ipAddress || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.newsletterSends.set(id, newsletterSend);
    return newsletterSend;
  }

  async getNewsletterSends(newsletterId: string): Promise<NewsletterSend[]> {
    return Array.from(this.newsletterSends.values()).filter(
      send => send.newsletterId === newsletterId
    );
  }

  async updateNewsletterSend(id: string, send: Partial<NewsletterSend>): Promise<NewsletterSend> {
    const existing = this.newsletterSends.get(id);
    if (!existing) throw new Error("Newsletter send not found");
    
    const updated: NewsletterSend = {
      ...existing,
      ...removeUndefined(send),
      updatedAt: new Date(),
    };
    this.newsletterSends.set(id, updated);
    return updated;
  }

  async getNewsletterStats(newsletterId: string): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  }> {
    const sends = await this.getNewsletterSends(newsletterId);
    
    const totalSent = sends.length;
    const totalDelivered = sends.filter(s => s.status === "delivered" || s.openedAt || s.firstClickedAt).length;
    const totalOpened = sends.filter(s => s.openedAt).length;
    const totalClicked = sends.filter(s => s.firstClickedAt).length;
    const totalBounced = sends.filter(s => s.status === "bounced").length;
    const totalUnsubscribed = sends.filter(s => s.unsubscribedAt).length;
    
    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalUnsubscribed,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
    };
  }

  // ===================== MATERIAL COMPLEMENTAR OPERATIONS =====================
  
  // Material complementar operations
  async createMaterialComplementar(material: InsertMaterialComplementar): Promise<MaterialComplementar> {
    const id = randomUUID();
    const materialComplementar: MaterialComplementar = {
      ...material,
      id,
      category: material.category || "Fundamental",
      readTime: material.readTime || null,
      pdfUrl: material.pdfUrl || null,
      icon: material.icon || "FileText",
      colorScheme: material.colorScheme || "green",
      isPublished: material.isPublished ?? true,
      sortOrder: material.sortOrder || 0,
      views: 0,
      pdfDownloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.materiaisComplementares.set(id, materialComplementar);
    return materialComplementar;
  }

  async getMaterialComplementar(id: string): Promise<MaterialComplementar | undefined> {
    return this.materiaisComplementares.get(id);
  }

  async getAllMateriaisComplementares(isPublished?: boolean): Promise<MaterialComplementar[]> {
    let materials = Array.from(this.materiaisComplementares.values());
    if (isPublished !== undefined) {
      materials = materials.filter(m => m.isPublished === isPublished);
    }
    return materials.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async updateMaterialComplementar(id: string, material: Partial<MaterialComplementar>): Promise<MaterialComplementar> {
    const existing = this.materiaisComplementares.get(id);
    if (!existing) throw new Error("Material complementar not found");
    
    const updated: MaterialComplementar = {
      ...existing,
      ...material,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.materiaisComplementares.set(id, updated);
    return updated;
  }

  async deleteMaterialComplementar(id: string): Promise<void> {
    const exists = this.materiaisComplementares.has(id);
    if (!exists) throw new Error("Material complementar not found");
    this.materiaisComplementares.delete(id);
  }

  // Analytics operations
  async incrementMaterialView(id: string): Promise<void> {
    const material = this.materiaisComplementares.get(id);
    if (!material) throw new Error("Material complementar not found");
    
    material.views = (material.views || 0) + 1;
    material.updatedAt = new Date();
    this.materiaisComplementares.set(id, material);
  }

  async incrementMaterialPdfDownload(id: string): Promise<void> {
    const material = this.materiaisComplementares.get(id);
    if (!material) throw new Error("Material complementar not found");
    
    material.pdfDownloads = (material.pdfDownloads || 0) + 1;
    material.updatedAt = new Date();
    this.materiaisComplementares.set(id, material);
  }

  // ===================== COUPON OPERATIONS =====================

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = {
      ...insertCoupon,
      code: insertCoupon.code.toUpperCase(),
      currency: insertCoupon.currency || "BRL",
      planScope: insertCoupon.planScope || "all",
      isActive: insertCoupon.isActive ?? true,
      maxRedemptions: insertCoupon.maxRedemptions ?? null,
      maxRedemptionsPerUser: insertCoupon.maxRedemptionsPerUser ?? null,
      stripeCouponId: insertCoupon.stripeCouponId ?? null,
      metadata: insertCoupon.metadata || {},
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const upperCode = code.toUpperCase();
    return Array.from(this.coupons.values()).find(
      (coupon) => coupon.code === upperCode
    );
  }

  async listCoupons(filters?: { isActive?: boolean; planScope?: string }): Promise<Coupon[]> {
    let coupons = Array.from(this.coupons.values());
    
    if (filters?.isActive !== undefined) {
      coupons = coupons.filter(c => c.isActive === filters.isActive);
    }
    
    if (filters?.planScope) {
      coupons = coupons.filter(c => c.planScope === filters.planScope);
    }
    
    return coupons;
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const existing = this.coupons.get(id);
    if (!existing) {
      throw new Error("Coupon not found");
    }
    
    const updated: Coupon = {
      ...existing,
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : existing.code,
      updatedAt: new Date(),
    };
    
    this.coupons.set(id, updated);
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  async validateCoupon(code: string, planId?: string, userId?: string): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
    discount?: { type: string; value: number; currency: string };
  }> {
    const upperCode = code.toUpperCase();
    const coupon = await this.getCouponByCode(upperCode);
    
    if (!coupon) {
      return { valid: false, error: "Cupom não encontrado" };
    }
    
    if (!coupon.isActive) {
      return { valid: false, error: "Cupom inativo" };
    }
    
    const now = new Date();
    if (now < new Date(coupon.validFrom)) {
      return { valid: false, error: "Cupom ainda não está válido" };
    }
    
    if (now > new Date(coupon.validUntil)) {
      return { valid: false, error: "Cupom expirado" };
    }
    
    if (coupon.planScope === "specific" && planId) {
      const eligiblePlanIds = coupon.eligiblePlanIds as string[] || [];
      if (!eligiblePlanIds.includes(planId)) {
        return { valid: false, error: "Cupom não aplicável a este plano" };
      }
    }
    
    if (coupon.maxRedemptions && coupon.maxRedemptions > 0) {
      const totalUsage = await this.getCouponUsageCount(coupon.id);
      if (totalUsage >= coupon.maxRedemptions) {
        return { valid: false, error: "Limite de usos do cupom atingido" };
      }
    }
    
    if (userId && coupon.maxRedemptionsPerUser && coupon.maxRedemptionsPerUser > 0) {
      const userUsage = await this.getCouponUsageCount(coupon.id, userId);
      if (userUsage >= coupon.maxRedemptionsPerUser) {
        return { valid: false, error: "Limite de usos por usuário atingido" };
      }
    }
    
    return {
      valid: true,
      coupon,
      discount: {
        type: coupon.discountType,
        value: coupon.discountValue,
        currency: coupon.currency,
      },
    };
  }

  async redeemCoupon(insertRedemption: InsertCouponRedemption): Promise<CouponRedemption> {
    const id = randomUUID();
    const redemption: CouponRedemption = {
      ...insertRedemption,
      subscriptionId: insertRedemption.subscriptionId || null,
      transactionId: insertRedemption.transactionId || null,
      context: insertRedemption.context || {},
      id,
      redeemedAt: new Date(),
      createdAt: new Date(),
    };
    this.couponRedemptions.set(id, redemption);
    return redemption;
  }

  async getCouponRedemptions(couponId: string): Promise<CouponRedemption[]> {
    return Array.from(this.couponRedemptions.values()).filter(
      (redemption) => redemption.couponId === couponId
    );
  }

  async getAllCouponRedemptions(): Promise<CouponRedemption[]> {
    return Array.from(this.couponRedemptions.values());
  }

  async getUserCouponRedemptions(userId: string): Promise<CouponRedemption[]> {
    return Array.from(this.couponRedemptions.values()).filter(
      (redemption) => redemption.userId === userId
    );
  }

  async getCouponUsageCount(couponId: string, userId?: string): Promise<number> {
    let redemptions = Array.from(this.couponRedemptions.values()).filter(
      (redemption) => redemption.couponId === couponId
    );
    
    if (userId) {
      redemptions = redemptions.filter(r => r.userId === userId);
    }
    
    return redemptions.length;
  }

  async createPaymentEvent(insertEvent: InsertPaymentEvent): Promise<PaymentEvent> {
    const id = randomUUID();
    const event: PaymentEvent = {
      ...insertEvent,
      processor: insertEvent.processor || "stripe",
      processedAt: insertEvent.processedAt ?? null,
      error: insertEvent.error ?? null,
      id,
      receivedAt: new Date(),
    };
    this.paymentEvents.set(id, event);
    return event;
  }

  async getPaymentEvent(eventId: string): Promise<PaymentEvent | undefined> {
    return Array.from(this.paymentEvents.values()).find(
      (event) => event.eventId === eventId
    );
  }

  async updatePaymentEventStatus(id: string, status: string, processedAt?: Date, error?: string): Promise<PaymentEvent> {
    const existing = this.paymentEvents.get(id);
    if (!existing) {
      throw new Error("Payment event not found");
    }
    
    const validStatus = status as "received" | "processed" | "failed";
    const updated: PaymentEvent = {
      ...existing,
      status: validStatus,
      processedAt: processedAt || existing.processedAt,
      error: error || existing.error,
    };
    
    this.paymentEvents.set(id, updated);
    return updated;
  }

  // ===================== USER GOALS OPERATIONS IMPLEMENTATION =====================

  async getUserGoals(userId: string): Promise<UserGoal[]> {
    return Array.from(this.userGoals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async createUserGoal(insertGoal: InsertUserGoal): Promise<UserGoal> {
    const id = randomUUID();
    const goal: UserGoal = {
      ...insertGoal,
      current: insertGoal.current ?? 0,
      description: insertGoal.description ?? null,
      priority: insertGoal.priority || "media",
      completed: insertGoal.completed || false,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userGoals.set(id, goal);
    return goal;
  }

  async updateUserGoal(id: string, updateData: Partial<UserGoal>): Promise<UserGoal> {
    const existing = this.userGoals.get(id);
    if (!existing) {
      throw new Error("Goal not found");
    }

    const updated: UserGoal = {
      ...existing,
      ...removeUndefined(updateData),
      updatedAt: new Date(),
    };

    this.userGoals.set(id, updated);
    return updated;
  }

  async deleteUserGoal(id: string): Promise<boolean> {
    return this.userGoals.delete(id);
  }

  // ===================== USER EXAMS OPERATIONS IMPLEMENTATION =====================

  async getUserExams(userId: string): Promise<UserExam[]> {
    return Array.from(this.userExams.values())
      .filter((exam) => exam.userId === userId)
      .sort((a, b) => new Date(a.examAt).getTime() - new Date(b.examAt).getTime());
  }

  async createUserExam(insertExam: InsertUserExam): Promise<UserExam> {
    const id = randomUUID();
    const exam: UserExam = {
      ...insertExam,
      location: insertExam.location ?? null,
      description: insertExam.description ?? null,
      durationMinutes: insertExam.durationMinutes ?? null,
      type: insertExam.type || "simulado",
      status: insertExam.status || "upcoming",
      subjects: insertExam.subjects || [],
      importance: insertExam.importance || "media",
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userExams.set(id, exam);
    return exam;
  }

  async updateUserExam(id: string, updateData: Partial<UserExam>): Promise<UserExam> {
    const existing = this.userExams.get(id);
    if (!existing) {
      throw new Error("Exam not found");
    }

    const updated: UserExam = {
      ...existing,
      ...removeUndefined(updateData),
      updatedAt: new Date(),
    };

    this.userExams.set(id, updated);
    return updated;
  }

  async deleteUserExam(id: string): Promise<boolean> {
    return this.userExams.delete(id);
  }

  // ===================== USER SCHEDULE OPERATIONS IMPLEMENTATION =====================

  async getUserSchedule(userId: string, weekStart: Date): Promise<UserSchedule[]> {
    return Array.from(this.userSchedules.values()).filter(
      (schedule) => 
        schedule.userId === userId && 
        schedule.weekStart.getTime() === weekStart.getTime()
    );
  }

  async createUserSchedule(insertSchedule: InsertUserSchedule): Promise<UserSchedule> {
    const id = randomUUID();
    const schedule: UserSchedule = {
      ...insertSchedule,
      activities: insertSchedule.activities || [],
      hours: insertSchedule.hours || 0,
      minutes: insertSchedule.minutes || 0,
      completed: insertSchedule.completed || false,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSchedules.set(id, schedule);
    return schedule;
  }

  async updateUserSchedule(id: string, updateData: Partial<UserSchedule>): Promise<UserSchedule> {
    const existing = this.userSchedules.get(id);
    if (!existing) {
      throw new Error("Schedule not found");
    }

    const updated: UserSchedule = {
      ...existing,
      ...removeUndefined(updateData),
      updatedAt: new Date(),
    };

    this.userSchedules.set(id, updated);
    return updated;
  }

  async deleteUserSchedule(id: string): Promise<boolean> {
    return this.userSchedules.delete(id);
  }

}

// ================= DATABASE STORAGE IMPLEMENTATION =================
// DbStorage uses PostgreSQL with Drizzle ORM for persistent data storage

import { db } from "./db";
import { eq, and, or, gte, lte, desc, asc, sql as sqlQuery, count, sum, avg, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";

export class DbStorage implements IStorage {
  // ===================== USER OPERATIONS =====================
  
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(schema.users)
      .set({ ...removeUndefined(updateData), updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (!updated) throw new Error("User not found");
    return updated;
  }

  // ===================== USER PROGRESS OPERATIONS =====================
  
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const result = await db.query.userProgress.findFirst({
      where: eq(schema.userProgress.userId, userId),
    });
    return result;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(schema.userProgress).values(insertProgress).returning();
    return progress;
  }

  async updateUserProgress(userId: string, updateData: Partial<UserProgress>): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId);
    if (!existing) throw new Error("User progress not found");
    
    const [updated] = await db
      .update(schema.userProgress)
      .set({ ...removeUndefined(updateData), updatedAt: new Date() })
      .where(eq(schema.userProgress.id, existing.id))
      .returning();
    
    if (!updated) throw new Error("Failed to update user progress");
    return updated;
  }

  async updateUserProgressAfterCorrection(userId: string): Promise<void> {
    const userScores = await this.getUserScores(userId);
    if (userScores.length === 0) return;

    const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
    const averageScore = Math.round(totalScore / userScores.length);
    const essaysCount = userScores.length;

    const existingProgress = await this.getUserProgress(userId);
    if (existingProgress) {
      await this.updateUserProgress(userId, {
        averageScore,
        essaysCount,
      });
    } else {
      await this.createUserProgress({
        userId,
        averageScore,
        essaysCount,
      });
    }
  }

  // ===================== ESSAY OPERATIONS =====================
  
  async getEssaysByUser(userId: string): Promise<Essay[]> {
    const essays = await db.query.essays.findMany({
      where: eq(schema.essays.userId, userId),
      orderBy: [desc(schema.essays.createdAt)],
    });
    return essays;
  }

  async createEssay(insertEssay: InsertEssay): Promise<Essay> {
    const [essay] = await db.insert(schema.essays).values(insertEssay).returning();
    return essay;
  }

  async updateEssay(id: string, updateData: Partial<Essay>): Promise<Essay> {
    const [updated] = await db
      .update(schema.essays)
      .set({ ...removeUndefined(updateData), updatedAt: new Date() })
      .where(eq(schema.essays.id, id))
      .returning();
    
    if (!updated) throw new Error("Essay not found");
    return updated;
  }

  // ===================== ESSAY STRUCTURE OPERATIONS =====================
  
  async getStructuresByUser(userId: string): Promise<EssayStructure[]> {
    const structures = await db.query.essayStructures.findMany({
      where: eq(schema.essayStructures.userId, userId),
      orderBy: [desc(schema.essayStructures.createdAt)],
    });
    return structures;
  }

  async createStructure(insertStructure: InsertEssayStructure): Promise<EssayStructure> {
    const [structure] = await db.insert(schema.essayStructures).values(insertStructure).returning();
    return structure;
  }

  async updateStructure(id: string, updateData: Partial<EssayStructure>): Promise<EssayStructure> {
    const [updated] = await db
      .update(schema.essayStructures)
      .set({ ...removeUndefined(updateData), updatedAt: new Date() })
      .where(eq(schema.essayStructures.id, id))
      .returning();
    
    if (!updated) throw new Error("Structure not found");
    return updated;
  }

  async deleteStructure(id: string): Promise<void> {
    await db.delete(schema.essayStructures).where(eq(schema.essayStructures.id, id));
  }

  async getStructure(id: string): Promise<EssayStructure | undefined> {
    const result = await db.query.essayStructures.findFirst({
      where: eq(schema.essayStructures.id, id),
    });
    return result;
  }

  // ===================== REPERTOIRE OPERATIONS =====================
  
  async searchRepertoires(query: string, filters?: { type?: string; category?: string; popularity?: string }): Promise<Repertoire[]> {
    const conditions: any[] = [];
    
    if (query) {
      conditions.push(
        or(
          sqlQuery`${schema.repertoires.title} ILIKE ${`%${query}%`}`,
          sqlQuery`${schema.repertoires.description} ILIKE ${`%${query}%`}`
        )
      );
    }
    
    if (filters?.type) conditions.push(eq(schema.repertoires.type, filters.type as any));
    if (filters?.category) conditions.push(eq(schema.repertoires.category, filters.category as any));
    if (filters?.popularity) conditions.push(eq(schema.repertoires.popularity, filters.popularity as any));
    
    const repertoires = await db.query.repertoires.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.repertoires.rating)],
      limit: 20,
    });
    
    return repertoires;
  }

  async createRepertoire(insertRepertoire: InsertRepertoire): Promise<Repertoire> {
    const [repertoire] = await db.insert(schema.repertoires).values(insertRepertoire).returning();
    return repertoire;
  }

  async getRepertoires(limit = 20, offset = 0): Promise<Repertoire[]> {
    const repertoires = await db.query.repertoires.findMany({
      orderBy: [desc(schema.repertoires.createdAt)],
      limit,
      offset,
    });
    return repertoires;
  }

  // ===================== SEARCH CACHE OPERATIONS =====================
  
  async getSearchCache(normalizedQuery: string): Promise<SearchCache | undefined> {
    const result = await db.query.searchCache.findFirst({
      where: and(
        eq(schema.searchCache.normalizedQuery, normalizedQuery),
        gte(schema.searchCache.expiresAt, new Date())
      ),
    });
    return result;
  }

  async createSearchCache(insertCache: InsertSearchCache): Promise<SearchCache> {
    const [cache] = await db.insert(schema.searchCache).values(insertCache).returning();
    return cache;
  }

  async updateSearchCache(id: string, updateData: Partial<SearchCache>): Promise<SearchCache> {
    const [updated] = await db
      .update(schema.searchCache)
      .set(removeUndefined(updateData))
      .where(eq(schema.searchCache.id, id))
      .returning();
    
    if (!updated) throw new Error("Search cache not found");
    return updated;
  }

  // ===================== RATE LIMITING OPERATIONS =====================
  
  async checkRateLimit(identifier: string, maxRequests = 10, windowMinutes = 60): Promise<{ allowed: boolean; remaining: number }> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    const existing = await db.query.rateLimits.findFirst({
      where: and(
        eq(schema.rateLimits.identifier, identifier),
        gte(schema.rateLimits.windowStart, windowStart)
      ),
    });
    
    if (!existing) {
      await db.insert(schema.rateLimits).values({
        identifier,
        requestCount: 1,
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    
    if ((existing.requestCount || 0) >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    await db
      .update(schema.rateLimits)
      .set({
        requestCount: (existing.requestCount || 0) + 1,
        lastRequest: new Date(),
      })
      .where(eq(schema.rateLimits.id, existing.id));
    
    return { allowed: true, remaining: maxRequests - (existing.requestCount || 0) - 1 };
  }

  // ===================== WEEKLY USAGE OPERATIONS =====================
  
  async findWeeklyUsage(identifier: string, weekStart: Date): Promise<WeeklyUsage | undefined> {
    const result = await db.query.weeklyUsage.findFirst({
      where: and(
        eq(schema.weeklyUsage.identifier, identifier),
        eq(schema.weeklyUsage.weekStart, weekStart)
      ),
    });
    return result;
  }

  async insertWeeklyUsage(insertUsage: InsertWeeklyUsage): Promise<WeeklyUsage> {
    const [usage] = await db.insert(schema.weeklyUsage).values(insertUsage).returning();
    return usage;
  }

  async upsertWeeklyUsage(insertUsage: InsertWeeklyUsage): Promise<WeeklyUsage> {
    const [usage] = await db
      .insert(schema.weeklyUsage)
      .values(insertUsage)
      .onConflictDoUpdate({
        target: [schema.weeklyUsage.identifier, schema.weeklyUsage.weekStart],
        set: {
          totalCostCentavos: sqlQuery`weekly_usage.total_cost_centavos + ${insertUsage.totalCostCentavos || 0}`,
          operationCount: sqlQuery`weekly_usage.operation_count + ${insertUsage.operationCount || 0}`,
          operationBreakdown: sqlQuery`weekly_usage.operation_breakdown || ${insertUsage.operationBreakdown || {}}::jsonb`,
          costBreakdown: sqlQuery`weekly_usage.cost_breakdown || ${insertUsage.costBreakdown || {}}::jsonb`,
          lastOperation: insertUsage.lastOperation || new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return usage;
  }

  async updateWeeklyUsage(id: string, updateData: Partial<WeeklyUsage>): Promise<WeeklyUsage> {
    const [updated] = await db
      .update(schema.weeklyUsage)
      .set({ ...removeUndefined(updateData), updatedAt: new Date() })
      .where(eq(schema.weeklyUsage.id, id))
      .returning();
    
    if (!updated) throw new Error("Weekly usage not found");
    return updated;
  }

  async getWeeklyUsageHistory(identifier: string, weeks: number): Promise<WeeklyUsage[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);
    
    const history = await db.query.weeklyUsage.findMany({
      where: and(
        eq(schema.weeklyUsage.identifier, identifier),
        gte(schema.weeklyUsage.weekStart, cutoffDate)
      ),
      orderBy: [desc(schema.weeklyUsage.weekStart)],
    });
    return history;
  }

  // ===================== SAVED REPERTOIRES OPERATIONS =====================
  
  async saveRepertoire(userId: string, repertoireId: string): Promise<SavedRepertoire> {
    const [saved] = await db.insert(schema.savedRepertoires).values({
      userId,
      repertoireId,
    }).returning();
    return saved;
  }

  async removeSavedRepertoire(userId: string, repertoireId: string): Promise<boolean> {
    const result = await db
      .delete(schema.savedRepertoires)
      .where(and(
        eq(schema.savedRepertoires.userId, userId),
        eq(schema.savedRepertoires.repertoireId, repertoireId)
      ));
    return true;
  }

  async getUserSavedRepertoires(userId: string): Promise<Repertoire[]> {
    const saved = await db
      .select()
      .from(schema.savedRepertoires)
      .where(eq(schema.savedRepertoires.userId, userId));
    
    const repertoireIds = saved.map(s => s.repertoireId);
    
    if (repertoireIds.length === 0) {
      return [];
    }
    
    const repertoires = await db
      .select()
      .from(schema.repertoires)
      .where(inArray(schema.repertoires.id, repertoireIds));
    
    return repertoires;
  }

  async isRepertoireSaved(userId: string, repertoireId: string): Promise<boolean> {
    const result = await db.query.savedRepertoires.findFirst({
      where: and(
        eq(schema.savedRepertoires.userId, userId),
        eq(schema.savedRepertoires.repertoireId, repertoireId)
      ),
    });
    return !!result;
  }

  // ===================== PROPOSAL OPERATIONS =====================
  
  async searchProposals(query: string, filters?: { examType?: string; theme?: string; difficulty?: string; year?: number }): Promise<Proposal[]> {
    const conditions: any[] = [];
    
    if (query) {
      conditions.push(
        or(
          sqlQuery`${schema.proposals.title} ILIKE ${`%${query}%`}`,
          sqlQuery`${schema.proposals.statement} ILIKE ${`%${query}%`}`
        )
      );
    }
    
    if (filters?.examType) conditions.push(eq(schema.proposals.examType, filters.examType as any));
    if (filters?.theme) conditions.push(eq(schema.proposals.theme, filters.theme as any));
    if (filters?.difficulty) conditions.push(eq(schema.proposals.difficulty, filters.difficulty as any));
    if (filters?.year) conditions.push(eq(schema.proposals.year, filters.year));
    
    const proposals = await db.query.proposals.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.proposals.rating)],
      limit: 20,
    });
    
    return proposals;
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const [proposal] = await db.insert(schema.proposals).values(insertProposal).returning();
    return proposal;
  }

  async getProposals(limit = 20, offset = 0): Promise<Proposal[]> {
    const proposals = await db.query.proposals.findMany({
      orderBy: [desc(schema.proposals.createdAt)],
      limit,
      offset,
    });
    return proposals;
  }

  // ===================== SAVED PROPOSALS OPERATIONS =====================
  
  async saveProposal(userId: string, proposalId: string): Promise<SavedProposal> {
    const [saved] = await db.insert(schema.savedProposals).values({
      userId,
      proposalId,
    }).returning();
    return saved;
  }

  async removeSavedProposal(userId: string, proposalId: string): Promise<boolean> {
    await db
      .delete(schema.savedProposals)
      .where(and(
        eq(schema.savedProposals.userId, userId),
        eq(schema.savedProposals.proposalId, proposalId)
      ));
    return true;
  }

  async getUserSavedProposals(userId: string): Promise<Proposal[]> {
    const saved = await db
      .select()
      .from(schema.savedProposals)
      .where(eq(schema.savedProposals.userId, userId));
    
    const proposalIds = saved.map(s => s.proposalId);
    
    if (proposalIds.length === 0) {
      return [];
    }
    
    const proposals = await db
      .select()
      .from(schema.proposals)
      .where(inArray(schema.proposals.id, proposalIds));
    
    return proposals;
  }

  async isProposalSaved(userId: string, proposalId: string): Promise<boolean> {
    const result = await db.query.savedProposals.findFirst({
      where: and(
        eq(schema.savedProposals.userId, userId),
        eq(schema.savedProposals.proposalId, proposalId)
      ),
    });
    return !!result;
  }

  // ===================== SAVED ESSAYS OPERATIONS =====================
  
  async saveEssay(userId: string, essayId: string): Promise<SavedEssay> {
    const [saved] = await db.insert(schema.savedEssays).values({
      userId,
      essayId,
    }).returning();
    return saved;
  }

  async removeSavedEssay(userId: string, essayId: string): Promise<boolean> {
    await db
      .delete(schema.savedEssays)
      .where(and(
        eq(schema.savedEssays.userId, userId),
        eq(schema.savedEssays.essayId, essayId)
      ));
    return true;
  }

  async getUserSavedEssays(userId: string): Promise<Essay[]> {
    const saved = await db
      .select()
      .from(schema.savedEssays)
      .where(eq(schema.savedEssays.userId, userId));
    
    const essayIds = saved.map(s => s.essayId);
    
    if (essayIds.length === 0) {
      return [];
    }
    
    const essays = await db
      .select()
      .from(schema.essays)
      .where(inArray(schema.essays.id, essayIds));
    
    return essays;
  }

  async isEssaySaved(userId: string, essayId: string): Promise<boolean> {
    const result = await db.query.savedEssays.findFirst({
      where: and(
        eq(schema.savedEssays.userId, userId),
        eq(schema.savedEssays.essayId, essayId)
      ),
    });
    return !!result;
  }

  // ===================== SAVED STRUCTURES OPERATIONS =====================
  
  async saveStructure(userId: string, structureId: string): Promise<SavedStructure> {
    const [saved] = await db.insert(schema.savedStructures).values({
      userId,
      structureId,
    }).returning();
    return saved;
  }

  async removeSavedStructure(userId: string, structureId: string): Promise<boolean> {
    await db
      .delete(schema.savedStructures)
      .where(and(
        eq(schema.savedStructures.userId, userId),
        eq(schema.savedStructures.structureId, structureId)
      ));
    return true;
  }

  async getUserSavedStructures(userId: string): Promise<EssayStructure[]> {
    const saved = await db
      .select()
      .from(schema.savedStructures)
      .where(eq(schema.savedStructures.userId, userId));
    
    const structureIds = saved.map(s => s.structureId);
    
    if (structureIds.length === 0) {
      return [];
    }
    
    const structures = await db
      .select()
      .from(schema.essayStructures)
      .where(inArray(schema.essayStructures.id, structureIds));
    
    return structures;
  }

  async isStructureSaved(userId: string, structureId: string): Promise<boolean> {
    const result = await db.query.savedStructures.findFirst({
      where: and(
        eq(schema.savedStructures.userId, userId),
        eq(schema.savedStructures.structureId, structureId)
      ),
    });
    return !!result;
  }

  // ===================== SAVED NEWSLETTERS OPERATIONS =====================
  
  async saveNewsletter(userId: string, newsletterId: string): Promise<SavedNewsletter> {
    const [saved] = await db.insert(schema.savedNewsletters).values({
      userId,
      newsletterId,
    }).returning();
    return saved;
  }

  async removeSavedNewsletter(userId: string, newsletterId: string): Promise<boolean> {
    await db
      .delete(schema.savedNewsletters)
      .where(and(
        eq(schema.savedNewsletters.userId, userId),
        eq(schema.savedNewsletters.newsletterId, newsletterId)
      ));
    return true;
  }

  async getUserSavedNewsletters(userId: string): Promise<Newsletter[]> {
    const saved = await db
      .select()
      .from(schema.savedNewsletters)
      .where(eq(schema.savedNewsletters.userId, userId));
    
    const newsletterIds = saved.map(s => s.newsletterId);
    
    if (newsletterIds.length === 0) {
      return [];
    }
    
    const newsletters = await db
      .select()
      .from(schema.newsletters)
      .where(inArray(schema.newsletters.id, newsletterIds));
    
    return newsletters;
  }

  async isNewsletterSaved(userId: string, newsletterId: string): Promise<boolean> {
    const result = await db.query.savedNewsletters.findFirst({
      where: and(
        eq(schema.savedNewsletters.userId, userId),
        eq(schema.savedNewsletters.newsletterId, newsletterId)
      ),
    });
    return !!result;
  }

  // ===================== SAVED TEXTS OPERATIONS =====================
  
  async createSavedText(insertSavedText: InsertSavedText): Promise<SavedText> {
    const [saved] = await db.insert(schema.savedTexts).values(insertSavedText).returning();
    return saved;
  }

  async getUserSavedTexts(userId: string): Promise<SavedText[]> {
    const texts = await db.query.savedTexts.findMany({
      where: eq(schema.savedTexts.userId, userId),
      orderBy: desc(schema.savedTexts.createdAt),
    });
    return texts;
  }

  async deleteSavedText(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(schema.savedTexts)
      .where(and(
        eq(schema.savedTexts.id, id),
        eq(schema.savedTexts.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // ===================== SAVED OUTLINES OPERATIONS =====================
  
  async createSavedOutline(insertSavedOutline: InsertSavedOutline): Promise<SavedOutline> {
    const [saved] = await db.insert(schema.savedOutlines).values(insertSavedOutline).returning();
    return saved;
  }

  async getUserSavedOutlines(userId: string): Promise<SavedOutline[]> {
    const outlines = await db.query.savedOutlines.findMany({
      where: eq(schema.savedOutlines.userId, userId),
      orderBy: desc(schema.savedOutlines.createdAt),
    });
    return outlines;
  }

  async deleteSavedOutline(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(schema.savedOutlines)
      .where(and(
        eq(schema.savedOutlines.id, id),
        eq(schema.savedOutlines.userId, userId)
      ))
      .returning();
    return result.length > 0;
  }

  // ===================== SIMULATION OPERATIONS =====================
  
  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const [simulation] = await db.insert(schema.simulations).values(insertSimulation).returning();
    return simulation;
  }

  async updateSimulation(id: string, updateData: Partial<Simulation>): Promise<Simulation> {
    const [updated] = await db
      .update(schema.simulations)
      .set({ ...removeUndefined(updateData), updatedAt: new Date() })
      .where(eq(schema.simulations.id, id))
      .returning();
    
    if (!updated) throw new Error("Simulation not found");
    return updated;
  }

  async getSimulation(id: string): Promise<Simulation | undefined> {
    const result = await db.query.simulations.findFirst({
      where: eq(schema.simulations.id, id),
    });
    return result;
  }

  async getSimulations(userId?: string, sessionId?: string, limit = 20, offset = 0): Promise<Simulation[]> {
    const conditions: any[] = [];
    
    if (userId) conditions.push(eq(schema.simulations.userId, userId));
    if (sessionId) conditions.push(eq(schema.simulations.sessionId, sessionId));
    
    const simulations = await db.query.simulations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.simulations.createdAt)],
      limit,
      offset,
    });
    
    return simulations;
  }

  async getUserSimulations(userId: string): Promise<Simulation[]> {
    const simulations = await db.query.simulations.findMany({
      where: eq(schema.simulations.userId, userId),
      orderBy: [desc(schema.simulations.createdAt)],
    });
    return simulations;
  }

  async getSessionSimulations(sessionId: string): Promise<Simulation[]> {
    const simulations = await db.query.simulations.findMany({
      where: eq(schema.simulations.sessionId, sessionId),
      orderBy: [desc(schema.simulations.createdAt)],
    });
    return simulations;
  }

  // ===================== CONVERSATION OPERATIONS =====================
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(schema.conversations).values(insertConversation).returning();
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.query.conversations.findFirst({
      where: eq(schema.conversations.id, id),
    });
    return result;
  }

  async appendMessage(conversationId: string, message: ConversationMessage): Promise<Conversation> {
    const existing = await this.getConversation(conversationId);
    if (!existing) throw new Error("Conversation not found");
    
    const messages = (existing.messages as any[]) || [];
    messages.push(message);
    
    const [updated] = await db
      .update(schema.conversations)
      .set({
        messages,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.conversations.id, conversationId))
      .returning();
    
    if (!updated) throw new Error("Failed to update conversation");
    return updated;
  }

  async updateConversationSummary(conversationId: string, summary: string): Promise<Conversation> {
    const [updated] = await db
      .update(schema.conversations)
      .set({ summary, updatedAt: new Date() })
      .where(eq(schema.conversations.id, conversationId))
      .returning();
    
    if (!updated) throw new Error("Conversation not found");
    return updated;
  }

  async updateConversationData(conversationId: string, brainstormData: any, currentSection: string): Promise<Conversation> {
    const [updated] = await db
      .update(schema.conversations)
      .set({
        brainstormData,
        currentSection: currentSection as any,
        updatedAt: new Date(),
      })
      .where(eq(schema.conversations.id, conversationId))
      .returning();
    
    if (!updated) throw new Error("Conversation not found");
    return updated;
  }

  async getRecentConversations(userId?: string, sessionId?: string, limit = 10): Promise<Conversation[]> {
    const conditions: any[] = [];
    
    if (userId) conditions.push(eq(schema.conversations.userId, userId));
    if (sessionId) conditions.push(eq(schema.conversations.sessionId, sessionId));
    
    const conversations = await db.query.conversations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.conversations.lastMessageAt)],
      limit,
    });
    
    return conversations;
  }

  // ===================== USER SCORES OPERATIONS =====================
  
  async getUserScores(userId: string): Promise<UserScore[]> {
    const scores = await db.query.userScores.findMany({
      where: eq(schema.userScores.userId, userId),
      orderBy: [desc(schema.userScores.scoreDate)],
    });
    return scores;
  }

  async createUserScore(insertScore: InsertUserScore): Promise<UserScore> {
    const [score] = await db.insert(schema.userScores).values(insertScore).returning();
    return score;
  }

  async updateUserScore(id: string, updates: Partial<UserScore>): Promise<UserScore> {
    const [score] = await db.update(schema.userScores)
      .set(updates)
      .where(eq(schema.userScores.id, id))
      .returning();
    if (!score) throw new Error("Score not found");
    return score;
  }

  async deleteUserScore(id: string): Promise<boolean> {
    const result = await db.delete(schema.userScores)
      .where(eq(schema.userScores.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ===================== ADMIN OPERATIONS =====================
  
  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db.insert(schema.adminUsers).values(insertAdmin).returning();
    return admin;
  }

  async getAdminUser(userId: string): Promise<AdminUser | undefined> {
    const result = await db.query.adminUsers.findFirst({
      where: eq(schema.adminUsers.userId, userId),
    });
    return result;
  }

  // ===================== COST TRACKING OPERATIONS =====================
  
  async insertUserCost(insertCost: InsertUserCost): Promise<UserCost> {
    const [cost] = await db.insert(schema.userCosts).values(insertCost).returning();
    return cost;
  }

  async insertUserDailyUsage(insertUsage: InsertUserDailyUsage): Promise<UserDailyUsage> {
    const [usage] = await db.insert(schema.userDailyUsage).values(insertUsage).returning();
    return usage;
  }

  async findUserDailyUsage(userId: string | null, ipAddress: string, date: Date): Promise<UserDailyUsage | undefined> {
    const conditions = [
      eq(schema.userDailyUsage.ipAddress, ipAddress),
      eq(schema.userDailyUsage.usageDate, date),
    ];
    
    if (userId) {
      conditions.push(eq(schema.userDailyUsage.userId, userId));
    }
    
    const result = await db.query.userDailyUsage.findFirst({
      where: and(...conditions),
    });
    return result;
  }

  async updateUserDailyUsage(id: string, updates: Partial<UserDailyUsage>): Promise<UserDailyUsage> {
    const [updated] = await db
      .update(schema.userDailyUsage)
      .set({ ...removeUndefined(updates), updatedAt: new Date() })
      .where(eq(schema.userDailyUsage.id, id))
      .returning();
    
    if (!updated) throw new Error("User daily usage not found");
    return updated;
  }

  // ===================== BUSINESS METRICS OPERATIONS =====================
  
  async insertBusinessMetric(insertMetric: InsertBusinessMetric): Promise<BusinessMetric> {
    const [metric] = await db.insert(schema.businessMetrics).values(insertMetric).returning();
    return metric;
  }

  async getDailyOperationStats(startDate: Date, endDate: Date): Promise<{
    totalOperations: number;
    totalCost: number;
    cacheHitRate: number;
    topOperation: string;
  }> {
    const costs = await db.query.userCosts.findMany({
      where: and(
        gte(schema.userCosts.createdAt, startDate),
        lte(schema.userCosts.createdAt, endDate)
      ),
    });
    
    if (costs.length === 0) {
      return {
        totalOperations: 0,
        totalCost: 0,
        cacheHitRate: 0,
        topOperation: "",
      };
    }
    
    const totalCost = costs.reduce((sum, c) => sum + c.costBrl, 0);
    const cacheHits = costs.filter(c => c.source === 'cache').length;
    const cacheHitRate = costs.length > 0 ? cacheHits / costs.length : 0;
    
    const operationCounts: Record<string, number> = {};
    costs.forEach(c => {
      operationCounts[c.operation] = (operationCounts[c.operation] || 0) + 1;
    });
    
    const topOperation = Object.entries(operationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    
    return {
      totalOperations: costs.length,
      totalCost,
      cacheHitRate,
      topOperation,
    };
  }

  async getUserActivityStats(days: number): Promise<{
    totalUsers: number;
    activeUsers: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const [totalResult] = await db.select({ count: count() }).from(schema.users);
    const totalUsers = totalResult?.count || 0;
    
    const activeCosts = await db.query.userCosts.findMany({
      where: gte(schema.userCosts.createdAt, cutoffDate),
      columns: {
        userId: true,
      },
    });
    
    const uniqueUserIds = new Set(activeCosts.map(c => c.userId).filter(Boolean));
    const activeUsers = uniqueUserIds.size;
    
    return {
      totalUsers: Number(totalUsers),
      activeUsers,
    };
  }

  async getUserCostSummary(identifier: { userId?: string; ipAddress?: string }, startDate: Date, endDate: Date): Promise<{
    totalCost: number;
    totalOperations: number;
    operationBreakdown: Record<string, number>;
    costBreakdown: Record<string, number>;
  }> {
    const conditions: any[] = [
      gte(schema.userCosts.createdAt, startDate),
      lte(schema.userCosts.createdAt, endDate),
    ];
    
    if (identifier.userId) conditions.push(eq(schema.userCosts.userId, identifier.userId));
    if (identifier.ipAddress) conditions.push(eq(schema.userCosts.ipAddress, identifier.ipAddress));
    
    const costs = await db.query.userCosts.findMany({
      where: and(...conditions),
    });
    
    const totalCost = costs.reduce((sum, c) => sum + c.costBrl, 0);
    const totalOperations = costs.length;
    
    const operationBreakdown: Record<string, number> = {};
    const costBreakdown: Record<string, number> = {};
    
    costs.forEach(cost => {
      operationBreakdown[cost.operation] = (operationBreakdown[cost.operation] || 0) + 1;
      costBreakdown[cost.operation] = (costBreakdown[cost.operation] || 0) + cost.costBrl;
    });
    
    return {
      totalCost,
      totalOperations,
      operationBreakdown,
      costBreakdown,
    };
  }

  async getBusinessOverview(startDate: Date, endDate: Date): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalOperations: number;
    totalCostBrl: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    averageCostPerUser: number;
    topOperations: Array<{ operation: string; count: number; cost: number }>;
    dailyTrends: Array<{ date: string; operations: number; cost: number; users: number }>;
    cacheEfficiency: number;
  }> {
    const costs = await db.query.userCosts.findMany({
      where: and(
        gte(schema.userCosts.createdAt, startDate),
        lte(schema.userCosts.createdAt, endDate)
      ),
    });
    
    const [totalUsersResult] = await db.select({ count: count() }).from(schema.users);
    const totalUsers = Number(totalUsersResult?.count || 0);
    
    const uniqueIdentifiers = new Set(
      costs.map(c => c.userId || c.ipAddress).filter(Boolean)
    );
    const activeUsers = uniqueIdentifiers.size;
    
    const totalCostBrl = costs.reduce((sum, c) => sum + c.costBrl, 0);
    const totalInputTokens = costs.reduce((sum, c) => sum + c.tokensInput, 0);
    const totalOutputTokens = costs.reduce((sum, c) => sum + c.tokensOutput, 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const totalOperations = costs.length;
    const averageCostPerUser = activeUsers > 0 ? totalCostBrl / activeUsers : 0;
    
    // Calculate top operations
    const operationStats: Record<string, { count: number; cost: number }> = {};
    costs.forEach(cost => {
      if (!operationStats[cost.operation]) {
        operationStats[cost.operation] = { count: 0, cost: 0 };
      }
      operationStats[cost.operation].count++;
      operationStats[cost.operation].cost += cost.costBrl;
    });
    
    const topOperations = Object.entries(operationStats)
      .map(([operation, stats]) => ({ operation, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate daily trends
    const dailyStats: Record<string, { operations: number; cost: number; users: Set<string> }> = {};
    costs.forEach(cost => {
      const date = cost.createdAt!.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { operations: 0, cost: 0, users: new Set() };
      }
      dailyStats[date].operations++;
      dailyStats[date].cost += cost.costBrl;
      const userIdentifier = cost.userId || cost.ipAddress;
      if (userIdentifier) dailyStats[date].users.add(userIdentifier);
    });
    
    const dailyTrends = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        operations: stats.operations,
        cost: stats.cost,
        users: stats.users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const cacheHits = costs.filter(c => c.source === 'cache').length;
    const cacheEfficiency = totalOperations > 0 ? (cacheHits / totalOperations) * 100 : 0;
    
    return {
      totalUsers,
      activeUsers,
      totalOperations,
      totalCostBrl,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      averageCostPerUser,
      topOperations,
      dailyTrends,
      cacheEfficiency,
    };
  }

  async getTopCostUsers(startDate: Date, endDate: Date, limit: number): Promise<Array<{
    userId?: string;
    ipAddress: string;
    totalCost: number;
    totalOperations: number;
    averageOperationCost: number;
    topOperation: string;
  }>> {
    const costs = await db.query.userCosts.findMany({
      where: and(
        gte(schema.userCosts.createdAt, startDate),
        lte(schema.userCosts.createdAt, endDate)
      ),
    });
    
    const userStats: Record<string, {
      userId?: string;
      ipAddress: string;
      totalCost: number;
      totalOperations: number;
      operations: Record<string, number>;
    }> = {};
    
    costs.forEach(cost => {
      const key = cost.userId || cost.ipAddress;
      if (!userStats[key]) {
        userStats[key] = {
          userId: cost.userId || undefined,
          ipAddress: cost.ipAddress,
          totalCost: 0,
          totalOperations: 0,
          operations: {},
        };
      }
      userStats[key].totalCost += cost.costBrl;
      userStats[key].totalOperations++;
      userStats[key].operations[cost.operation] = (userStats[key].operations[cost.operation] || 0) + 1;
    });
    
    return Object.values(userStats)
      .map(user => ({
        userId: user.userId,
        ipAddress: user.ipAddress,
        totalCost: user.totalCost,
        totalOperations: user.totalOperations,
        averageOperationCost: user.totalOperations > 0 ? user.totalCost / user.totalOperations : 0,
        topOperation: Object.entries(user.operations).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  // Continua na próxima parte...
  
  async getHourlyUsagePatterns(startDate: Date, endDate: Date): Promise<Array<{
    hour: number;
    totalOperations: number;
    totalCost: number;
    averageOperations: number;
    peakDay: string;
  }>> {
    const costs = await db.query.userCosts.findMany({
      where: and(
        gte(schema.userCosts.createdAt, startDate),
        lte(schema.userCosts.createdAt, endDate)
      ),
    });
    
    const hourlyStats: Record<number, {
      totalOperations: number;
      totalCost: number;
      days: Record<string, number>;
    }> = {};
    
    for (let h = 0; h < 24; h++) {
      hourlyStats[h] = {
        totalOperations: 0,
        totalCost: 0,
        days: {},
      };
    }
    
    costs.forEach(cost => {
      if (!cost.createdAt) return;
      const hour = cost.createdAt.getHours();
      const day = cost.createdAt.toISOString().split('T')[0];
      
      hourlyStats[hour].totalOperations++;
      hourlyStats[hour].totalCost += cost.costBrl;
      hourlyStats[hour].days[day] = (hourlyStats[hour].days[day] || 0) + 1;
    });
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Object.entries(hourlyStats).map(([hour, stats]) => {
      const peakDay = Object.entries(stats.days).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
      
      return {
        hour: parseInt(hour),
        totalOperations: stats.totalOperations,
        totalCost: stats.totalCost,
        averageOperations: daysDiff > 0 ? stats.totalOperations / daysDiff : 0,
        peakDay,
      };
    });
  }

  async getDetailedUsersList(days: number, limit: number): Promise<Array<{
    userId?: string;
    ipAddress: string;
    userType?: string;
    totalCost: number;
    totalOperations: number;
    firstSeen: Date;
    lastSeen: Date;
    daysSinceFirst: number;
    accessFrequency: number;
    topOperation: string;
    plan: string;
  }>> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const costs = await db.query.userCosts.findMany({
      where: gte(schema.userCosts.createdAt, cutoffDate),
    });
    
    const userStats: Record<string, any> = {};
    
    costs.forEach(cost => {
      const key = cost.userId || cost.ipAddress;
      if (!userStats[key]) {
        userStats[key] = {
          userId: cost.userId || undefined,
          ipAddress: cost.ipAddress,
          totalCost: 0,
          totalOperations: 0,
          firstSeen: cost.createdAt,
          lastSeen: cost.createdAt,
          operations: {},
        };
      }
      
      userStats[key].totalCost += cost.costBrl;
      userStats[key].totalOperations++;
      userStats[key].operations[cost.operation] = (userStats[key].operations[cost.operation] || 0) + 1;
      
      if (cost.createdAt && cost.createdAt < userStats[key].firstSeen) {
        userStats[key].firstSeen = cost.createdAt;
      }
      if (cost.createdAt && cost.createdAt > userStats[key].lastSeen) {
        userStats[key].lastSeen = cost.createdAt;
      }
    });
    
    return Object.values(userStats)
      .map((user: any) => {
        const daysSinceFirst = Math.ceil((Date.now() - user.firstSeen.getTime()) / (1000 * 60 * 60 * 24));
        const accessFrequency = daysSinceFirst > 0 ? user.totalOperations / daysSinceFirst : 0;
        const topOperation = Object.entries(user.operations).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "";
        
        return {
          userId: user.userId,
          ipAddress: user.ipAddress,
          userType: undefined,
          totalCost: user.totalCost,
          totalOperations: user.totalOperations,
          firstSeen: user.firstSeen,
          lastSeen: user.lastSeen,
          daysSinceFirst,
          accessFrequency,
          topOperation,
          plan: "free",
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  async getToolsRankingByUsage(startDate: Date, endDate: Date): Promise<Array<{
    operation: string;
    operationName: string;
    totalCount: number;
    totalCost: number;
    averageCost: number;
    uniqueUsers: number;
    rank: number;
  }>> {
    const costs = await db.query.userCosts.findMany({
      where: and(
        gte(schema.userCosts.createdAt, startDate),
        lte(schema.userCosts.createdAt, endDate)
      ),
    });
    
    const operationStats: Record<string, {
      totalCount: number;
      totalCost: number;
      users: Set<string>;
    }> = {};
    
    costs.forEach(cost => {
      if (!operationStats[cost.operation]) {
        operationStats[cost.operation] = {
          totalCount: 0,
          totalCost: 0,
          users: new Set(),
        };
      }
      operationStats[cost.operation].totalCount++;
      operationStats[cost.operation].totalCost += cost.costBrl;
      if (cost.userId) operationStats[cost.operation].users.add(cost.userId);
    });
    
    const operationNames: Record<string, string> = {
      structure_analysis: "Análise de Estrutura",
      essay_generation: "Geração de Redação",
      essay_correction: "Correção de Redação",
      proposal_generation: "Geração de Proposta",
      proposal_search: "Busca de Proposta",
      future_exam_detection: "Detecção de Provas Futuras",
      repertoire_search: "Busca de Repertório",
      repertoire_generation: "Geração de Repertório",
      ai_chat: "Chat com IA",
      text_modification: "Modificação de Texto",
    };
    
    return Object.entries(operationStats)
      .map(([operation, stats]) => ({
        operation,
        operationName: operationNames[operation] || operation,
        totalCount: stats.totalCount,
        totalCost: stats.totalCost,
        averageCost: stats.totalCount > 0 ? stats.totalCost / stats.totalCount : 0,
        uniqueUsers: stats.users.size,
        rank: 0,
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  async getUserAccessFrequency(startDate: Date, endDate: Date): Promise<Array<{
    frequency: string;
    userCount: number;
    averageOperations: number;
    averageCost: number;
  }>> {
    const costs = await db.query.userCosts.findMany({
      where: and(
        gte(schema.userCosts.createdAt, startDate),
        lte(schema.userCosts.createdAt, endDate)
      ),
    });
    
    const userStats: Record<string, { operations: number; cost: number }> = {};
    
    costs.forEach(cost => {
      const key = cost.userId || cost.ipAddress;
      if (!userStats[key]) {
        userStats[key] = { operations: 0, cost: 0 };
      }
      userStats[key].operations++;
      userStats[key].cost += cost.costBrl;
    });
    
    const frequencies: Record<string, { users: string[]; totalOps: number; totalCost: number }> = {
      'daily': { users: [], totalOps: 0, totalCost: 0 },
      'weekly': { users: [], totalOps: 0, totalCost: 0 },
      'monthly': { users: [], totalOps: 0, totalCost: 0 },
      'occasional': { users: [], totalOps: 0, totalCost: 0 },
    };
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    Object.entries(userStats).forEach(([user, stats]) => {
      const opsPerDay = daysDiff > 0 ? stats.operations / daysDiff : stats.operations;
      
      let category = 'occasional';
      if (opsPerDay >= 1) category = 'daily';
      else if (opsPerDay >= 0.14) category = 'weekly';
      else if (opsPerDay >= 0.03) category = 'monthly';
      
      frequencies[category].users.push(user);
      frequencies[category].totalOps += stats.operations;
      frequencies[category].totalCost += stats.cost;
    });
    
    return Object.entries(frequencies).map(([frequency, data]) => ({
      frequency,
      userCount: data.users.length,
      averageOperations: data.users.length > 0 ? data.totalOps / data.users.length : 0,
      averageCost: data.users.length > 0 ? data.totalCost / data.users.length : 0,
    }));
  }

  // Continue with remaining methods (subscriptions, revenue, conversions, etc.)...
  // Due to character limits, implementing remaining methods in similar pattern

  // PLACEHOLDER IMPLEMENTATIONS FOR REMAINING METHODS
  // These will return empty/default data until fully implemented
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [result] = await db.insert(schema.subscriptionPlans).values(plan).returning();
    return result;
  }

  async getSubscriptionPlans(activeOnly = false): Promise<SubscriptionPlan[]> {
    const plans = await db.query.subscriptionPlans.findMany({
      where: activeOnly ? eq(schema.subscriptionPlans.isActive, true) : undefined,
    });
    return plans;
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return await db.query.subscriptionPlans.findFirst({
      where: eq(schema.subscriptionPlans.id, id),
    });
  }

  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const [updated] = await db
      .update(schema.subscriptionPlans)
      .set({ ...removeUndefined(plan), updatedAt: new Date() })
      .where(eq(schema.subscriptionPlans.id, id))
      .returning();
    if (!updated) throw new Error("Subscription plan not found");
    return updated;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [result] = await db.insert(schema.userSubscriptions).values(subscription).returning();
    return result;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    return await db.query.userSubscriptions.findFirst({
      where: eq(schema.userSubscriptions.userId, userId),
      orderBy: [desc(schema.userSubscriptions.createdAt)],
    });
  }

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    return await db.query.userSubscriptions.findMany({
      where: eq(schema.userSubscriptions.userId, userId),
      orderBy: [desc(schema.userSubscriptions.createdAt)],
    });
  }

  async updateUserSubscription(id: string, subscription: Partial<UserSubscription>): Promise<UserSubscription> {
    const [updated] = await db
      .update(schema.userSubscriptions)
      .set({ ...removeUndefined(subscription), updatedAt: new Date() })
      .where(eq(schema.userSubscriptions.id, id))
      .returning();
    if (!updated) throw new Error("User subscription not found");
    return updated;
  }

  async getActiveSubscriptions(): Promise<UserSubscription[]> {
    return await db.query.userSubscriptions.findMany({
      where: eq(schema.userSubscriptions.status, "active"),
    });
  }

  async getSubscriptionsByStatus(status: string): Promise<UserSubscription[]> {
    return await db.query.userSubscriptions.findMany({
      where: eq(schema.userSubscriptions.status, status),
    });
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db.insert(schema.transactions).values(transaction).returning();
    return result;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return await db.query.transactions.findFirst({
      where: eq(schema.transactions.id, id),
    });
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db.query.transactions.findMany({
      where: eq(schema.transactions.userId, userId),
      orderBy: [desc(schema.transactions.createdAt)],
    });
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const [updated] = await db
      .update(schema.transactions)
      .set({ ...removeUndefined(transaction), updatedAt: new Date() })
      .where(eq(schema.transactions.id, id))
      .returning();
    if (!updated) throw new Error("Transaction not found");
    return updated;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.query.transactions.findMany({
      where: and(
        gte(schema.transactions.createdAt, startDate),
        lte(schema.transactions.createdAt, endDate)
      ),
      orderBy: [desc(schema.transactions.createdAt)],
    });
  }

  async createRevenueMetric(metric: InsertRevenueMetric): Promise<RevenueMetric> {
    const [result] = await db.insert(schema.revenueMetrics).values(metric).returning();
    return result;
  }

  async getRevenueMetrics(startDate: Date, endDate: Date): Promise<RevenueMetric[]> {
    return await db.query.revenueMetrics.findMany({
      where: and(
        gte(schema.revenueMetrics.metricDate, startDate),
        lte(schema.revenueMetrics.metricDate, endDate)
      ),
      orderBy: [desc(schema.revenueMetrics.metricDate)],
    });
  }

  async getLatestRevenueMetric(): Promise<RevenueMetric | undefined> {
    return await db.query.revenueMetrics.findFirst({
      orderBy: [desc(schema.revenueMetrics.metricDate)],
    });
  }

  async getRevenueOverview(days: number): Promise<{
    mrr: number;
    arr: number;
    totalActiveSubscriptions: number;
    paidUsers: number;
    trialUsers: number;
    arpu: number;
    grossMarginPercent: number;
    mrrGrowthRate: number;
    churnRate: number;
  }> {
    const latest = await this.getLatestRevenueMetric();
    const activeSubscriptions = await this.getActiveSubscriptions();
    const trialSubs = await this.getSubscriptionsByStatus('trial');
    
    const mrr = latest?.mrr || 0;
    const arr = mrr * 12;
    const totalActiveSubscriptions = activeSubscriptions.length;
    const paidUsers = activeSubscriptions.filter(s => s.status === 'active').length;
    const trialUsers = trialSubs.length;
    const arpu = paidUsers > 0 ? mrr / paidUsers : 0;
    
    return {
      mrr,
      arr,
      totalActiveSubscriptions,
      paidUsers,
      trialUsers,
      arpu,
      grossMarginPercent: latest?.grossMarginPercent || 0,
      mrrGrowthRate: 0, // Calculate from historical data if needed
      churnRate: 0, // Calculate from churn events if needed
    };
  }

  // Implementing remaining stub methods to satisfy interface...
  // These follow the same pattern as above
  
  async createUserEvent(event: InsertUserEvent): Promise<UserEvent> {
    const [result] = await db.insert(schema.userEvents).values(event).returning();
    return result;
  }

  async getUserEvents(userId?: string, sessionId?: string, eventType?: string): Promise<UserEvent[]> {
    const conditions: any[] = [];
    if (userId) conditions.push(eq(schema.userEvents.userId, userId));
    if (sessionId) conditions.push(eq(schema.userEvents.sessionId, sessionId));
    if (eventType) conditions.push(eq(schema.userEvents.eventType, eventType));
    
    return await db.query.userEvents.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.userEvents.createdAt)],
    });
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, eventType?: string): Promise<UserEvent[]> {
    const conditions: any[] = [
      gte(schema.userEvents.createdAt, startDate),
      lte(schema.userEvents.createdAt, endDate),
    ];
    if (eventType) conditions.push(eq(schema.userEvents.eventType, eventType));
    
    return await db.query.userEvents.findMany({
      where: and(...conditions),
      orderBy: [desc(schema.userEvents.createdAt)],
    });
  }

  async createConversionFunnel(funnel: InsertConversionFunnel): Promise<ConversionFunnel> {
    const [result] = await db.insert(schema.conversionFunnels).values(funnel).returning();
    return result;
  }

  async getConversionFunnels(funnelName?: string, metricDate?: Date): Promise<ConversionFunnel[]> {
    const conditions: any[] = [];
    if (funnelName) conditions.push(eq(schema.conversionFunnels.funnelName, funnelName));
    if (metricDate) conditions.push(eq(schema.conversionFunnels.metricDate, metricDate));
    
    return await db.query.conversionFunnels.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.conversionFunnels.metricDate)],
    });
  }

  async getConversionRates(funnelName: string, startDate: Date, endDate: Date): Promise<Array<{
    stepName: string;
    stepNumber: number;
    conversionRate: number;
    usersEntered: number;
    usersCompleted: number;
    averageTimeToComplete: number;
  }>> {
    const funnels = await db.query.conversionFunnels.findMany({
      where: and(
        eq(schema.conversionFunnels.funnelName, funnelName),
        gte(schema.conversionFunnels.metricDate, startDate),
        lte(schema.conversionFunnels.metricDate, endDate)
      ),
    });
    
    return funnels.map(f => ({
      stepName: f.stepName,
      stepNumber: f.stepNumber,
      conversionRate: f.conversionRate || 0,
      usersEntered: f.usersEntered || 0,
      usersCompleted: f.usersCompleted || 0,
      averageTimeToComplete: f.averageTimeToComplete || 0,
    }));
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [result] = await db.insert(schema.userSessions).values(session).returning();
    return result;
  }

  async updateUserSession(id: string, session: Partial<UserSession>): Promise<UserSession> {
    const [updated] = await db
      .update(schema.userSessions)
      .set(removeUndefined(session))
      .where(eq(schema.userSessions.id, id))
      .returning();
    if (!updated) throw new Error("User session not found");
    return updated;
  }

  async getUserSessions(userId?: string, startDate?: Date, endDate?: Date): Promise<UserSession[]> {
    const conditions: any[] = [];
    if (userId) conditions.push(eq(schema.userSessions.userId, userId));
    if (startDate) conditions.push(gte(schema.userSessions.createdAt, startDate));
    if (endDate) conditions.push(lte(schema.userSessions.createdAt, endDate));
    
    return await db.query.userSessions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.userSessions.createdAt)],
    });
  }

  async getSessionMetrics(startDate: Date, endDate: Date): Promise<{
    totalSessions: number;
    averageDuration: number;
    bounceRate: number;
    averagePageViews: number;
    topSources: Array<{ source: string; count: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
  }> {
    const sessions = await this.getUserSessions(undefined, startDate, endDate);
    
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const bounces = sessions.filter(s => (s.pageViews || 0) <= 1).length;
    const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;
    const totalPageViews = sessions.reduce((sum, s) => sum + (s.pageViews || 0), 0);
    const averagePageViews = totalSessions > 0 ? totalPageViews / totalSessions : 0;
    
    const sourceCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    
    sessions.forEach(s => {
      const source = s.source || 'direct';
      const device = s.device || 'unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    
    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        count,
        percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0,
      }));
    
    return {
      totalSessions,
      averageDuration,
      bounceRate,
      averagePageViews,
      topSources,
      deviceBreakdown,
    };
  }

  async createTaskCompletion(task: InsertTaskCompletion): Promise<TaskCompletion> {
    const [result] = await db.insert(schema.taskCompletions).values(task).returning();
    return result;
  }

  async updateTaskCompletion(id: string, task: Partial<TaskCompletion>): Promise<TaskCompletion> {
    const [updated] = await db
      .update(schema.taskCompletions)
      .set(removeUndefined(task))
      .where(eq(schema.taskCompletions.id, id))
      .returning();
    if (!updated) throw new Error("Task completion not found");
    return updated;
  }

  async getTaskCompletions(userId?: string, taskType?: string, status?: string): Promise<TaskCompletion[]> {
    const conditions: any[] = [];
    if (userId) conditions.push(eq(schema.taskCompletions.userId, userId));
    if (taskType) conditions.push(eq(schema.taskCompletions.taskType, taskType));
    if (status) conditions.push(eq(schema.taskCompletions.status, status));
    
    return await db.query.taskCompletions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.taskCompletions.createdAt)],
    });
  }

  async getTaskCompletionRates(taskType?: string, startDate?: Date, endDate?: Date): Promise<Array<{
    taskType: string;
    taskName: string;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageTimeToComplete: number;
    averageSatisfactionScore: number;
    averageNpsScore: number;
  }>> {
    const conditions: any[] = [];
    if (taskType) conditions.push(eq(schema.taskCompletions.taskType, taskType));
    if (startDate) conditions.push(gte(schema.taskCompletions.createdAt, startDate));
    if (endDate) conditions.push(lte(schema.taskCompletions.createdAt, endDate));
    
    const tasks = await db.query.taskCompletions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });
    
    const taskStats: Record<string, any> = {};
    
    tasks.forEach(task => {
      const key = `${task.taskType}_${task.taskName}`;
      if (!taskStats[key]) {
        taskStats[key] = {
          taskType: task.taskType,
          taskName: task.taskName,
          started: 0,
          completed: 0,
          totalTime: 0,
          totalSatisfaction: 0,
          totalNps: 0,
          satisfactionCount: 0,
          npsCount: 0,
        };
      }
      
      taskStats[key].started++;
      if (task.status === 'completed') {
        taskStats[key].completed++;
        if (task.timeToComplete) taskStats[key].totalTime += task.timeToComplete;
      }
      if (task.satisfactionScore) {
        taskStats[key].totalSatisfaction += task.satisfactionScore;
        taskStats[key].satisfactionCount++;
      }
      if (task.npsScore !== null) {
        taskStats[key].totalNps += task.npsScore;
        taskStats[key].npsCount++;
      }
    });
    
    return Object.values(taskStats).map((stats: any) => ({
      taskType: stats.taskType,
      taskName: stats.taskName,
      totalStarted: stats.started,
      totalCompleted: stats.completed,
      completionRate: stats.started > 0 ? (stats.completed / stats.started) * 100 : 0,
      averageTimeToComplete: stats.completed > 0 ? stats.totalTime / stats.completed : 0,
      averageSatisfactionScore: stats.satisfactionCount > 0 ? stats.totalSatisfaction / stats.satisfactionCount : 0,
      averageNpsScore: stats.npsCount > 0 ? stats.totalNps / stats.npsCount : 0,
    }));
  }

  async createUserCohort(cohort: InsertUserCohort): Promise<UserCohort> {
    const [result] = await db.insert(schema.userCohorts).values(cohort).returning();
    return result;
  }

  async updateUserCohort(id: string, cohort: Partial<UserCohort>): Promise<UserCohort> {
    const [updated] = await db
      .update(schema.userCohorts)
      .set({ ...removeUndefined(cohort), updatedAt: new Date() })
      .where(eq(schema.userCohorts.id, id))
      .returning();
    if (!updated) throw new Error("User cohort not found");
    return updated;
  }

  async getUserCohort(userId: string): Promise<UserCohort | undefined> {
    return await db.query.userCohorts.findFirst({
      where: eq(schema.userCohorts.userId, userId),
    });
  }

  async getCohortAnalysis(cohortMonth?: Date): Promise<Array<{
    cohortMonth: string;
    totalUsers: number;
    activeUsers: number;
    churnedUsers: number;
    retentionRate: number;
    currentMrr: number;
    averageLtv: number;
    averageLifetimeDays: number;
  }>> {
    const conditions: any[] = [];
    if (cohortMonth) conditions.push(eq(schema.userCohorts.cohortMonth, cohortMonth));
    
    const cohorts = await db.query.userCohorts.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });
    
    const cohortStats: Record<string, any> = {};
    
    cohorts.forEach(cohort => {
      const key = cohort.cohortMonth.toISOString().split('T')[0].substring(0, 7);
      if (!cohortStats[key]) {
        cohortStats[key] = {
          totalUsers: 0,
          activeUsers: 0,
          churnedUsers: 0,
          totalMrr: 0,
          totalLtv: 0,
          totalLifetimeDays: 0,
        };
      }
      
      cohortStats[key].totalUsers++;
      if (cohort.currentStatus === 'active') cohortStats[key].activeUsers++;
      if (cohort.churnDate) cohortStats[key].churnedUsers++;
      cohortStats[key].totalMrr += cohort.currentMrr || 0;
      cohortStats[key].totalLtv += cohort.totalRevenue || 0;
      cohortStats[key].totalLifetimeDays += cohort.lifetimeDays || 0;
    });
    
    return Object.entries(cohortStats).map(([month, stats]: [string, any]) => ({
      cohortMonth: month,
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      churnedUsers: stats.churnedUsers,
      retentionRate: stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0,
      currentMrr: stats.totalMrr,
      averageLtv: stats.totalUsers > 0 ? stats.totalLtv / stats.totalUsers : 0,
      averageLifetimeDays: stats.totalUsers > 0 ? stats.totalLifetimeDays / stats.totalUsers : 0,
    }));
  }

  async getRevenueBySource(startDate: Date, endDate: Date): Promise<Array<{
    source: string;
    totalRevenue: number;
    totalUsers: number;
    averageRevenue: number;
    percentage: number;
  }>> {
    const cohorts = await db.query.userCohorts.findMany({
      where: and(
        gte(schema.userCohorts.cohortMonth, startDate),
        lte(schema.userCohorts.cohortMonth, endDate)
      ),
    });
    
    const sourceStats: Record<string, { revenue: number; users: Set<string> }> = {};
    
    cohorts.forEach(cohort => {
      const source = cohort.source || 'unknown';
      if (!sourceStats[source]) {
        sourceStats[source] = { revenue: 0, users: new Set() };
      }
      sourceStats[source].revenue += cohort.totalRevenue || 0;
      sourceStats[source].users.add(cohort.userId);
    });
    
    const totalRevenue = Object.values(sourceStats).reduce((sum, s) => sum + s.revenue, 0);
    
    return Object.entries(sourceStats).map(([source, stats]) => ({
      source,
      totalRevenue: stats.revenue,
      totalUsers: stats.users.size,
      averageRevenue: stats.users.size > 0 ? stats.revenue / stats.users.size : 0,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
    }));
  }

  async createPredictiveMetric(metric: InsertPredictiveMetric): Promise<PredictiveMetric> {
    const [result] = await db.insert(schema.predictiveMetrics).values(metric).returning();
    return result;
  }

  async getPredictiveMetrics(metricType?: string, timeHorizon?: string): Promise<PredictiveMetric[]> {
    const conditions: any[] = [];
    if (metricType) conditions.push(eq(schema.predictiveMetrics.metricType, metricType));
    if (timeHorizon) conditions.push(eq(schema.predictiveMetrics.timeHorizon, timeHorizon));
    
    return await db.query.predictiveMetrics.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.predictiveMetrics.metricDate)],
    });
  }

  async getLatestPredictions(metricType: string): Promise<PredictiveMetric[]> {
    return await db.query.predictiveMetrics.findMany({
      where: eq(schema.predictiveMetrics.metricType, metricType),
      orderBy: [desc(schema.predictiveMetrics.metricDate)],
      limit: 10,
    });
  }

  async createChurnPrediction(prediction: InsertChurnPrediction): Promise<ChurnPrediction> {
    const [result] = await db.insert(schema.churnPredictions).values(prediction).returning();
    return result;
  }

  async updateChurnPrediction(id: string, prediction: Partial<ChurnPrediction>): Promise<ChurnPrediction> {
    const [updated] = await db
      .update(schema.churnPredictions)
      .set(removeUndefined(prediction))
      .where(eq(schema.churnPredictions.id, id))
      .returning();
    if (!updated) throw new Error("Churn prediction not found");
    return updated;
  }

  async getChurnPredictions(riskLevel?: string, userId?: string): Promise<ChurnPrediction[]> {
    const conditions: any[] = [];
    if (riskLevel) conditions.push(eq(schema.churnPredictions.riskLevel, riskLevel));
    if (userId) conditions.push(eq(schema.churnPredictions.userId, userId));
    
    return await db.query.churnPredictions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.churnPredictions.churnProbability)],
    });
  }

  async getHighRiskUsers(limit = 20): Promise<Array<{
    userId: string;
    userName: string;
    userEmail: string;
    churnProbability: number;
    riskLevel: string;
    daysToChurn: number;
    riskFactors: string[];
    recommendedActions: string[];
  }>> {
    const predictions = await this.getChurnPredictions('high');
    
    return predictions.slice(0, limit).map(p => ({
      userId: p.userId,
      userName: '',
      userEmail: '',
      churnProbability: p.churnProbability,
      riskLevel: p.riskLevel,
      daysToChurn: p.daysToChurn || 0,
      riskFactors: p.riskFactors as string[],
      recommendedActions: p.recommendedActions as string[],
    }));
  }

  // Newsletter operations
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [result] = await db.insert(schema.newsletterSubscribers).values(subscriber).returning();
    return result;
  }

  async getNewsletterSubscriber(id: string): Promise<NewsletterSubscriber | undefined> {
    return await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.id, id),
    });
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    return await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.email, email),
    });
  }

  async updateNewsletterSubscriber(id: string, subscriber: Partial<NewsletterSubscriber>): Promise<NewsletterSubscriber> {
    const [updated] = await db
      .update(schema.newsletterSubscribers)
      .set({ ...removeUndefined(subscriber), updatedAt: new Date() })
      .where(eq(schema.newsletterSubscribers.id, id))
      .returning();
    if (!updated) throw new Error("Newsletter subscriber not found");
    return updated;
  }

  async deleteNewsletterSubscriber(id: string): Promise<void> {
    await db.delete(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.id, id));
  }

  async getAllNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
    return await db.query.newsletterSubscribers.findMany({
      where: status ? eq(schema.newsletterSubscribers.status, status) : undefined,
    });
  }

  async getActiveNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.getAllNewsletterSubscribers('active');
  }

  async unsubscribeByToken(token: string): Promise<boolean> {
    const [updated] = await db
      .update(schema.newsletterSubscribers)
      .set({ status: 'unsubscribed', updatedAt: new Date() })
      .where(eq(schema.newsletterSubscribers.unsubscribeToken, token))
      .returning();
    return !!updated;
  }

  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const [result] = await db.insert(schema.newsletters).values(newsletter).returning();
    return result;
  }

  async getNewsletter(id: string): Promise<Newsletter | undefined> {
    return await db.query.newsletters.findFirst({
      where: eq(schema.newsletters.id, id),
    });
  }

  async getAllNewsletters(status?: string): Promise<Newsletter[]> {
    return await db.query.newsletters.findMany({
      where: status ? eq(schema.newsletters.status, status) : undefined,
      orderBy: [desc(schema.newsletters.createdAt)],
    });
  }

  async updateNewsletter(id: string, newsletter: Partial<Newsletter>): Promise<Newsletter> {
    const [updated] = await db
      .update(schema.newsletters)
      .set({ ...removeUndefined(newsletter), updatedAt: new Date() })
      .where(eq(schema.newsletters.id, id))
      .returning();
    if (!updated) throw new Error("Newsletter not found");
    return updated;
  }

  async deleteNewsletter(id: string): Promise<void> {
    await db.delete(schema.newsletters).where(eq(schema.newsletters.id, id));
  }

  async getNewslettersByAuthor(authorId: string): Promise<Newsletter[]> {
    return await db.query.newsletters.findMany({
      where: eq(schema.newsletters.authorId, authorId),
      orderBy: [desc(schema.newsletters.createdAt)],
    });
  }

  async createNewsletterSend(send: InsertNewsletterSend): Promise<NewsletterSend> {
    const [result] = await db.insert(schema.newsletterSends).values(send).returning();
    return result;
  }

  async getNewsletterSends(newsletterId: string): Promise<NewsletterSend[]> {
    return await db.query.newsletterSends.findMany({
      where: eq(schema.newsletterSends.newsletterId, newsletterId),
    });
  }

  async updateNewsletterSend(id: string, send: Partial<NewsletterSend>): Promise<NewsletterSend> {
    const [updated] = await db
      .update(schema.newsletterSends)
      .set({ ...removeUndefined(send), updatedAt: new Date() })
      .where(eq(schema.newsletterSends.id, id))
      .returning();
    if (!updated) throw new Error("Newsletter send not found");
    return updated;
  }

  async getNewsletterStats(newsletterId: string): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  }> {
    const sends = await this.getNewsletterSends(newsletterId);
    
    const totalSent = sends.length;
    const totalDelivered = sends.filter(s => s.status === 'delivered').length;
    const totalOpened = sends.filter(s => s.openedAt !== null).length;
    const totalClicked = sends.filter(s => s.clickedAt !== null).length;
    const totalBounced = sends.filter(s => s.status === 'bounced').length;
    const totalUnsubscribed = sends.filter(s => s.status === 'unsubscribed').length;
    
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    
    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalUnsubscribed,
      openRate,
      clickRate,
      bounceRate,
    };
  }

  // Material complementar operations
  async createMaterialComplementar(material: InsertMaterialComplementar): Promise<MaterialComplementar> {
    const [result] = await db.insert(schema.materiaisComplementares).values(material).returning();
    return result;
  }

  async getMaterialComplementar(id: string): Promise<MaterialComplementar | undefined> {
    return await db.query.materiaisComplementares.findFirst({
      where: eq(schema.materiaisComplementares.id, id),
    });
  }

  async getAllMateriaisComplementares(isPublished?: boolean): Promise<MaterialComplementar[]> {
    return await db.query.materiaisComplementares.findMany({
      where: isPublished !== undefined ? eq(schema.materiaisComplementares.isPublished, isPublished) : undefined,
      orderBy: [desc(schema.materiaisComplementares.createdAt)],
    });
  }

  async updateMaterialComplementar(id: string, material: Partial<MaterialComplementar>): Promise<MaterialComplementar> {
    const [updated] = await db
      .update(schema.materiaisComplementares)
      .set({ ...removeUndefined(material), updatedAt: new Date() })
      .where(eq(schema.materiaisComplementares.id, id))
      .returning();
    if (!updated) throw new Error("Material complementar not found");
    return updated;
  }

  async deleteMaterialComplementar(id: string): Promise<void> {
    await db.delete(schema.materiaisComplementares).where(eq(schema.materiaisComplementares.id, id));
  }

  async incrementMaterialView(id: string): Promise<void> {
    const material = await this.getMaterialComplementar(id);
    if (material) {
      await this.updateMaterialComplementar(id, {
        viewCount: (material.viewCount || 0) + 1,
      });
    }
  }

  async incrementMaterialPdfDownload(id: string): Promise<void> {
    const material = await this.getMaterialComplementar(id);
    if (material) {
      await this.updateMaterialComplementar(id, {
        pdfDownloads: (material.pdfDownloads || 0) + 1,
      });
    }
  }

  // Coupon operations
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [result] = await db.insert(schema.coupons).values(coupon).returning();
    return result;
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    return await db.query.coupons.findFirst({
      where: eq(schema.coupons.id, id),
    });
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return await db.query.coupons.findFirst({
      where: eq(schema.coupons.code, code),
    });
  }

  async listCoupons(filters?: { isActive?: boolean; planScope?: string }): Promise<Coupon[]> {
    const conditions: any[] = [];
    if (filters?.isActive !== undefined) conditions.push(eq(schema.coupons.isActive, filters.isActive));
    if (filters?.planScope) conditions.push(eq(schema.coupons.planScope, filters.planScope));
    
    return await db.query.coupons.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.coupons.createdAt)],
    });
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const [updated] = await db
      .update(schema.coupons)
      .set({ ...removeUndefined(updates), updatedAt: new Date() })
      .where(eq(schema.coupons.id, id))
      .returning();
    if (!updated) throw new Error("Coupon not found");
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
    return true;
  }

  async validateCoupon(code: string, planId?: string, userId?: string): Promise<{
    valid: boolean;
    coupon?: Coupon;
    error?: string;
    discount?: { type: string; value: number; currency: string };
  }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, error: "Cupom não encontrado" };
    }
    
    if (!coupon.isActive) {
      return { valid: false, error: "Cupom inativo" };
    }
    
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, error: "Cupom ainda não está válido" };
    }
    
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, error: "Cupom expirado" };
    }
    
    if (coupon.maxUses !== null) {
      const usageCount = await this.getCouponUsageCount(coupon.id);
      if (usageCount >= coupon.maxUses) {
        return { valid: false, error: "Cupom atingiu o limite de uso" };
      }
    }
    
    if (userId && coupon.maxUsesPerUser !== null) {
      const userUsageCount = await this.getCouponUsageCount(coupon.id, userId);
      if (userUsageCount >= coupon.maxUsesPerUser) {
        return { valid: false, error: "Você já utilizou este cupom o máximo de vezes permitido" };
      }
    }
    
    if (planId && coupon.planScope !== 'all' && coupon.planScope !== planId) {
      return { valid: false, error: "Cupom não válido para este plano" };
    }
    
    return {
      valid: true,
      coupon,
      discount: {
        type: coupon.discountType,
        value: coupon.discountValue,
        currency: coupon.currency,
      },
    };
  }

  async redeemCoupon(redemption: InsertCouponRedemption): Promise<CouponRedemption> {
    const [result] = await db.insert(schema.couponRedemptions).values(redemption).returning();
    return result;
  }

  async getCouponRedemptions(couponId: string): Promise<CouponRedemption[]> {
    return await db.query.couponRedemptions.findMany({
      where: eq(schema.couponRedemptions.couponId, couponId),
    });
  }

  async getAllCouponRedemptions(): Promise<CouponRedemption[]> {
    return await db.query.couponRedemptions.findMany({
      orderBy: [desc(schema.couponRedemptions.redeemedAt)],
    });
  }

  async getUserCouponRedemptions(userId: string): Promise<CouponRedemption[]> {
    return await db.query.couponRedemptions.findMany({
      where: eq(schema.couponRedemptions.userId, userId),
    });
  }

  async getCouponUsageCount(couponId: string, userId?: string): Promise<number> {
    const conditions = [eq(schema.couponRedemptions.couponId, couponId)];
    if (userId) conditions.push(eq(schema.couponRedemptions.userId, userId));
    
    const [result] = await db
      .select({ count: count() })
      .from(schema.couponRedemptions)
      .where(and(...conditions));
    
    return Number(result?.count || 0);
  }

  async createPaymentEvent(event: InsertPaymentEvent): Promise<PaymentEvent> {
    const [result] = await db.insert(schema.paymentEvents).values(event).returning();
    return result;
  }

  async getPaymentEvent(eventId: string): Promise<PaymentEvent | undefined> {
    return await db.query.paymentEvents.findFirst({
      where: eq(schema.paymentEvents.eventId, eventId),
    });
  }

  async updatePaymentEventStatus(id: string, status: string, processedAt?: Date, error?: string): Promise<PaymentEvent> {
    const [updated] = await db
      .update(schema.paymentEvents)
      .set({
        status,
        processedAt,
        error,
        updatedAt: new Date(),
      })
      .where(eq(schema.paymentEvents.id, id))
      .returning();
    if (!updated) throw new Error("Payment event not found");
    return updated;
  }

  // User goals operations
  async getUserGoals(userId: string): Promise<UserGoal[]> {
    return await db.query.userGoals.findMany({
      where: eq(schema.userGoals.userId, userId),
      orderBy: [desc(schema.userGoals.createdAt)],
    });
  }

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const [result] = await db.insert(schema.userGoals).values(goal).returning();
    return result;
  }

  async updateUserGoal(id: string, goal: Partial<UserGoal>): Promise<UserGoal> {
    const [updated] = await db
      .update(schema.userGoals)
      .set({ ...removeUndefined(goal), updatedAt: new Date() })
      .where(eq(schema.userGoals.id, id))
      .returning();
    if (!updated) throw new Error("User goal not found");
    return updated;
  }

  async deleteUserGoal(id: string): Promise<boolean> {
    await db.delete(schema.userGoals).where(eq(schema.userGoals.id, id));
    return true;
  }

  // User exams operations
  async getUserExams(userId: string): Promise<UserExam[]> {
    return await db.query.userExams.findMany({
      where: eq(schema.userExams.userId, userId),
      orderBy: [asc(schema.userExams.examAt)],
    });
  }

  async createUserExam(exam: InsertUserExam): Promise<UserExam> {
    const [result] = await db.insert(schema.userExams).values(exam).returning();
    return result;
  }

  async updateUserExam(id: string, exam: Partial<UserExam>): Promise<UserExam> {
    const [updated] = await db
      .update(schema.userExams)
      .set({ ...removeUndefined(exam), updatedAt: new Date() })
      .where(eq(schema.userExams.id, id))
      .returning();
    if (!updated) throw new Error("User exam not found");
    return updated;
  }

  async deleteUserExam(id: string): Promise<boolean> {
    await db.delete(schema.userExams).where(eq(schema.userExams.id, id));
    return true;
  }

  // User schedule operations
  async getUserSchedule(userId: string, weekStart: Date): Promise<UserSchedule[]> {
    return await db.query.userSchedule.findMany({
      where: and(
        eq(schema.userSchedule.userId, userId),
        eq(schema.userSchedule.weekStart, weekStart)
      ),
    });
  }

  async createUserSchedule(schedule: InsertUserSchedule): Promise<UserSchedule> {
    const [result] = await db.insert(schema.userSchedule).values(schedule).returning();
    return result;
  }

  async updateUserSchedule(id: string, schedule: Partial<UserSchedule>): Promise<UserSchedule> {
    const [updated] = await db
      .update(schema.userSchedule)
      .set({ ...removeUndefined(schedule), updatedAt: new Date() })
      .where(eq(schema.userSchedule.id, id))
      .returning();
    if (!updated) throw new Error("User schedule not found");
    return updated;
  }

  async deleteUserSchedule(id: string): Promise<boolean> {
    await db.delete(schema.userSchedule).where(eq(schema.userSchedule.id, id));
    return true;
  }
}

// Export DbStorage as the default storage implementation
export const storage = new DbStorage();
