import { type User, type InsertUser, type UserProgress, type InsertUserProgress, type Essay, type InsertEssay, type EssayStructure, type InsertEssayStructure, type Repertoire, type InsertRepertoire, type SearchCache, type InsertSearchCache, type RateLimit, type InsertRateLimit, type SavedRepertoire, type InsertSavedRepertoire, type Proposal, type InsertProposal, type SavedProposal, type InsertSavedProposal, type Simulation, type InsertSimulation, type Conversation, type InsertConversation, type ConversationMessage, type AdminUser, type InsertAdminUser, type UserCost, type InsertUserCost, type BusinessMetric, type InsertBusinessMetric, type UserDailyUsage, type InsertUserDailyUsage, type WeeklyUsage, type InsertWeeklyUsage, type SubscriptionPlan, type InsertSubscriptionPlan, type UserSubscription, type InsertUserSubscription, type Transaction, type InsertTransaction, type RevenueMetric, type InsertRevenueMetric, type UserEvent, type InsertUserEvent, type ConversionFunnel, type InsertConversionFunnel, type UserSession, type InsertUserSession, type TaskCompletion, type InsertTaskCompletion, type UserCohort, type InsertUserCohort, type PredictiveMetric, type InsertPredictiveMetric, type ChurnPrediction, type InsertChurnPrediction, type Newsletter, type InsertNewsletter, type NewsletterSubscriber, type InsertNewsletterSubscriber, type NewsletterSend, type InsertNewsletterSend, type MaterialComplementar, type InsertMaterialComplementar } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress>;
  
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
  private simulations: Map<string, Simulation>;
  private conversations: Map<string, Conversation>;
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
    this.simulations = new Map();
    this.conversations = new Map();
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
      targetScore: 900,
      essaysCount: 0,
      studyHours: 0,
      streak: 0
    });
    
    return user;
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
      targetScore: insertProgress.targetScore ?? 900,
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
        .filter(cost => cost.createdAt && new Date(cost.createdAt) >= cutoffDate && cost.userId)
        .map(cost => cost.userId!)
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
    const activeUserIds = new Set(costs.filter(c => c.userId).map(c => c.userId!));
    const activeUsers = activeUserIds.size;
    const totalOperations = costs.length;
    const totalCostBrl = costs.reduce((sum, cost) => sum + cost.costBrl, 0);
    const averageCostPerUser = activeUsers > 0 ? Math.round(totalCostBrl / activeUsers) : 0;

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
      if (cost.userId) dailyData[date].users.add(cost.userId);
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
      icon: material.icon || "FileText",
      colorScheme: material.colorScheme || "green",
      isPublished: material.isPublished ?? true,
      sortOrder: material.sortOrder || 0,
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

}

export const storage = new MemStorage();
