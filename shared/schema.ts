import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json, jsonb, uniqueIndex, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  userType: varchar("user_type", { enum: ["vestibulano", "concurseiro"] }).notNull().default("vestibulano"),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).default('plan-free'),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  averageScore: integer("average_score").default(0),
  targetScore: integer("target_score"),
  essaysCount: integer("essays_count").default(0),
  studyHours: integer("study_hours").default(0),
  streak: integer("streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const essays = pgTable("essays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  score: integer("score"),
  competence1: integer("competence_1"),
  competence2: integer("competence_2"),
  competence3: integer("competence_3"),
  competence4: integer("competence_4"),
  competence5: integer("competence_5"),
  competence1Feedback: text("competence_1_feedback"),
  competence2Feedback: text("competence_2_feedback"),
  competence3Feedback: text("competence_3_feedback"),
  competence4Feedback: text("competence_4_feedback"),
  competence5Feedback: text("competence_5_feedback"),
  feedback: text("feedback"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const essayStructures = pgTable("essay_structures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  sections: json("sections").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repertoires = pgTable("repertoires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { enum: ["movies", "laws", "books", "news", "events", "music", "series", "documentaries", "research", "data"] }).notNull(),
  category: varchar("category", { enum: ["social", "environment", "technology", "education", "politics", "economy", "culture", "health", "ethics", "globalization"] }).notNull(),
  popularity: varchar("popularity", { enum: ["very-popular", "popular", "moderate", "uncommon", "rare"] }).notNull().default("moderate"),
  year: text("year"),
  rating: integer("rating").default(0),
  keywords: json("keywords").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const searchCache = pgTable("search_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  queryText: text("query_text").notNull(),
  normalizedQuery: text("normalized_query").notNull(),
  results: json("results").notNull(),
  searchCount: integer("search_count").default(1),
  lastSearched: timestamp("last_searched").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


// Rate limiting table to control AI usage
export const rateLimits = pgTable("rate_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(), // IP address or user ID
  requestCount: integer("request_count").default(1),
  windowStart: timestamp("window_start").defaultNow(),
  lastRequest: timestamp("last_request").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly cost tracking for unified AI usage limits
export const weeklyUsage = pgTable("weekly_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(), // IP address or user ID
  weekStart: timestamp("week_start").notNull(), // Start of the week (Monday 00:00)
  totalCostCentavos: integer("total_cost_centavos").default(0), // Total cost in centavos
  operationCount: integer("operation_count").default(0), // Total operations count
  operationBreakdown: jsonb("operation_breakdown").default({}), // Count by operation type
  costBreakdown: jsonb("cost_breakdown").default({}), // Cost by operation type
  lastOperation: timestamp("last_operation").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueIdentifierWeek: unique().on(table.identifier, table.weekStart),
}));

// Saved repertoires for user's personal library
export const savedRepertoires = pgTable("saved_repertoires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  repertoireId: varchar("repertoire_id").notNull().references(() => repertoires.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Proposals table for essay topics and exam prompts
export const proposals = pgTable("proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  statement: text("statement").notNull(), // The main proposal/prompt
  supportingText: text("supporting_text"), // Supporting materials/texts
  examType: varchar("exam_type", { enum: ["enem", "vestibular", "concurso", "simulado", "custom"] }).notNull(),
  examName: text("exam_name"), // Name of the specific exam (e.g., "ENEM 2023", "FUVEST 2024")
  year: integer("year"),
  difficulty: varchar("difficulty", { enum: ["facil", "medio", "dificil", "muito-dificil"] }).notNull().default("medio"),
  theme: varchar("theme", { enum: ["social", "environment", "technology", "education", "politics", "economy", "culture", "health", "ethics", "globalization"] }).notNull(),
  keywords: json("keywords").notNull().default([]),
  isAiGenerated: boolean("is_ai_generated").default(false),
  rating: integer("rating").default(0),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved proposals for user's personal library
export const savedProposals = pgTable("saved_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  proposalId: varchar("proposal_id").notNull().references(() => proposals.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved essays for user's personal library
export const savedEssays = pgTable("saved_essays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  essayId: varchar("essay_id").notNull().references(() => essays.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved structures for user's personal library
export const savedStructures = pgTable("saved_structures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  structureId: varchar("structure_id").notNull().references(() => essayStructures.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved newsletters for user's personal library
export const savedNewsletters = pgTable("saved_newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  newsletterId: varchar("newsletter_id").notNull().references(() => newsletters.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved texts from Controlador de Escrita
export const savedTexts = pgTable("saved_texts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  modifiedText: text("modified_text").notNull(),
  modificationType: text("modification_type"),
  activeModifications: json("active_modifications").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved outlines/roteiros from Estrutura Roterizada
export const savedOutlines = pgTable("saved_outlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  proposalTitle: text("proposal_title").notNull(),
  proposalStatement: text("proposal_statement").notNull(),
  outlineData: json("outline_data").notNull(),
  outlineType: varchar("outline_type", { enum: ["roteiro", "brainstorming"] }).notNull().default("roteiro"),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Simulations table for tracking completed simulations
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional user ID for logged users
  title: text("title").notNull(),
  examType: varchar("exam_type", { enum: ["enem", "vestibular", "concurso", "simulado", "custom"] }).notNull(),
  theme: text("theme").notNull(),
  customTheme: text("custom_theme"),
  timeLimit: integer("time_limit"), // In minutes
  timeTaken: integer("time_taken"), // In minutes, actual time taken
  timeBreakdown: json("time_breakdown"), // Detailed time spent per checkpoint
  score: integer("score"),
  progress: integer("progress"), // Percentage 0-100
  isCompleted: boolean("is_completed").default(false),
  proposalUsed: text("proposal_used"), // The essay proposal/prompt used
  essayText: text("essay_text"), // The actual essay written
  correctionData: json("correction_data"), // AI correction results with feedback and scores
  sessionId: text("session_id"), // For anonymous tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversations table for AI chat memory and context
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional user ID for logged users
  sessionId: text("session_id"), // For anonymous tracking
  messages: json("messages").notNull().default([]), // Array of chat messages
  summary: text("summary"), // Conversation summary for context
  currentSection: varchar("current_section", { 
    enum: ["tema", "tese", "introducao", "desenvolvimento1", "desenvolvimento2", "conclusao", "finalizacao", "optimization"] 
  }).default("tema"),
  brainstormData: json("brainstorm_data"), // Current brainstorm state
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User scores table for tracking all user scores (manual and from simulations)
export const userScores = pgTable("user_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  competence1: integer("competence_1"),
  competence2: integer("competence_2"),
  competence3: integer("competence_3"),
  competence4: integer("competence_4"),
  competence5: integer("competence_5"),
  examName: text("exam_name").notNull(),
  source: varchar("source", { enum: ["manual", "simulation", "essay"] }).notNull().default("manual"),
  sourceId: varchar("source_id"), // ID of the simulation or essay if applicable
  scoreDate: timestamp("score_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User feedback table for system and AI issue reports
export const userFeedback = pgTable("user_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  userEmail: text("user_email"),
  userName: text("user_name"),
  message: text("message").notNull(),
  location: text("location"),
  status: varchar("status", { enum: ["pending", "reviewing", "resolved", "dismissed"] }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  planId: true,
  subscriptionExpiresAt: true,
}).extend({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().refine((phone) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  }, "Telefone deve ter 10 ou 11 dígitos"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  userType: z.enum(["vestibulano", "concurseiro"], {
    errorMap: () => ({ message: "Tipo de usuário inválido" })
  }),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().refine((phone) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
  }, "Telefone deve ter 10 ou 11 dígitos"),
  userType: z.enum(["vestibulano", "concurseiro"]).optional(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEssaySchema = createInsertSchema(essays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  guidelines: z.string().optional(),
});

export const insertEssayStructureSchema = createInsertSchema(essayStructures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  sections: z.array(sectionSchema),
});

export const insertRepertoireSchema = createInsertSchema(repertoires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSearchCacheSchema = createInsertSchema(searchCache).omit({
  id: true,
  createdAt: true,
});

export const insertRateLimitSchema = createInsertSchema(rateLimits).omit({
  id: true,
  createdAt: true,
});

export const insertSavedRepertoireSchema = createInsertSchema(savedRepertoires).omit({
  id: true,
  createdAt: true,
});

export const insertSavedTextSchema = createInsertSchema(savedTexts).omit({
  id: true,
  createdAt: true,
});

export const insertSavedOutlineSchema = createInsertSchema(savedOutlines).omit({
  id: true,
  createdAt: true,
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
  type: z.string().optional(),
  category: z.string().optional(),
  popularity: z.string().optional(),
  excludeIds: z.array(z.string()).optional(),
});

// Individual message schema for storage in conversation
export const conversationMessageSchema = z.object({
  id: z.string(),
  type: z.enum(["user", "ai"]),
  content: z.string(),
  section: z.enum(["tema", "tese", "introducao", "desenvolvimento1", "desenvolvimento2", "conclusao", "finalizacao", "optimization"]).optional(),
  timestamp: z.date(),
});

export const chatMessageSchema = z.object({
  conversationId: z.string().nullish(), // Optional for first message, can be null or undefined
  messageId: z.string().optional(), // For deduplication
  message: z.string().min(1, "Mensagem é obrigatória"),
  section: z.enum(["tema", "tese", "introducao", "desenvolvimento1", "desenvolvimento2", "conclusao", "finalizacao", "optimization"]),
  context: z.object({
    proposta: z.string().optional(),
    tese: z.string().optional(),
    paragrafos: z.object({
      introducao: z.string().optional(),
      desenvolvimento1: z.string().optional(),
      desenvolvimento2: z.string().optional(),
      conclusao: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedProposalSchema = createInsertSchema(savedProposals).omit({
  id: true,
  createdAt: true,
});

export const insertSavedEssaySchema = createInsertSchema(savedEssays).omit({
  id: true,
  createdAt: true,
});

export const insertSavedStructureSchema = createInsertSchema(savedStructures).omit({
  id: true,
  createdAt: true,
});

export const insertSavedNewsletterSchema = createInsertSchema(savedNewsletters).omit({
  id: true,
  createdAt: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

export const insertUserScoreSchema = createInsertSchema(userScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scoreDate: z.coerce.date(),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
});

export const proposalSearchQuerySchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
  examType: z.string().optional(),
  theme: z.string().optional(),
  difficulty: z.string().optional(),
  year: z.number().optional(),
  excludeIds: z.array(z.string()).optional(),
});

export const generateProposalSchema = z.object({
  theme: z.string().min(1, "Tema é obrigatório"),
  difficulty: z.enum(["facil", "medio", "dificil", "muito-dificil"]),
  examType: z.enum(["enem", "vestibular", "concurso", "simulado", "custom"]),
  keywords: z.array(z.string()).optional(),
  specificRequirements: z.string().optional(),
  context: z.string().optional(),
});

// Text Modification Schemas
export const textModificationTypeSchema = z.enum([
  "formalidade", 
  "argumentativo", 
  "sinonimos", 
  "antonimos",
  "estrutura-causal",
  "estrutura-comparativa", 
  "estrutura-condicional",
  "estrutura-oposicao"
]);

export const wordDifficultySchema = z.enum([
  "simples", 
  "medio", 
  "complexo"
]);

export const argumentTechniqueSchema = z.enum([
  "topico-frasal",
  "tese-antitese", 
  "causa-consequencia",
  "problema-solucao"
]);

export const argumentStructureSchema = z.object({
  repertoire: z.boolean().optional(),
  thesis: z.boolean().optional(),
  arguments: z.boolean().optional(),
  conclusion: z.boolean().optional(),
});

export const structureTypeSchema = z.enum([
  // Estruturas causais
  "tese-argumento",
  "problema-causa",
  "topico-consequencia",
  "causa-observacao",
  "efeito-analise",
  "fator-impacto",
  "origem-desenvolvimento",
  // Estruturas comparativas
  "comparacao-paralela",
  "forma-similar",
  "condicional-se",
  "medida-proporcional",
  "enquanto-outro",
  "tanto-quanto",
  "diferente-de",
  "semelhanca-de",
  // Estruturas de oposição
  "embora-oposicao",
  "apesar-concessao",
  "conforme-evidencia",
  "exemplo-confirmacao",
  "no-entanto",
  "contudo",
  "por-sua-vez",
  "entretanto"
]);

export const textModificationConfigSchema = z.object({
  textLength: z.number().min(50).max(200).optional(), // Percentage: 50% to 200% of original length
  wordDifficulty: wordDifficultySchema.optional(),
  meaningPreservation: z.enum(["preserve", "change"]).optional(),
  argumentTechnique: argumentTechniqueSchema.optional(),
  argumentativeLevel: z.number().min(0).max(100).optional(),
  argumentStructure: argumentStructureSchema.optional(),
  structureType: structureTypeSchema.optional(),
});

export const textModificationResultSchema = z.object({
  modifiedText: z.string(),
  modificationType: textModificationTypeSchema,
  source: z.enum(["cache", "optimized_ai", "fallback", "fallback_error"]),
  tokensUsed: z.number().optional(),
  promptTokens: z.number().optional(),
  outputTokens: z.number().optional(),
});

export const textModificationRequestSchema = z.object({
  text: z.string().min(1, "Texto é obrigatório").max(2000, "Texto muito longo. Máximo 2000 caracteres."),
  type: textModificationTypeSchema,
  config: textModificationConfigSchema.optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertEssay = z.infer<typeof insertEssaySchema>;
export type Essay = typeof essays.$inferSelect;

export type Section = z.infer<typeof sectionSchema>;
export type InsertEssayStructure = z.infer<typeof insertEssayStructureSchema>;
export type EssayStructure = typeof essayStructures.$inferSelect;

export type InsertRepertoire = z.infer<typeof insertRepertoireSchema>;
export type Repertoire = typeof repertoires.$inferSelect;

export type InsertSearchCache = z.infer<typeof insertSearchCacheSchema>;
export type SearchCache = typeof searchCache.$inferSelect;

export type InsertRateLimit = z.infer<typeof insertRateLimitSchema>;
export type RateLimit = typeof rateLimits.$inferSelect;

export type InsertSavedRepertoire = z.infer<typeof insertSavedRepertoireSchema>;
export type SavedRepertoire = typeof savedRepertoires.$inferSelect;

export type InsertSavedText = z.infer<typeof insertSavedTextSchema>;
export type SavedText = typeof savedTexts.$inferSelect;
export type InsertSavedOutline = z.infer<typeof insertSavedOutlineSchema>;
export type SavedOutline = typeof savedOutlines.$inferSelect;

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export type InsertSavedProposal = z.infer<typeof insertSavedProposalSchema>;
export type SavedProposal = typeof savedProposals.$inferSelect;

export type InsertSavedEssay = z.infer<typeof insertSavedEssaySchema>;
export type SavedEssay = typeof savedEssays.$inferSelect;

export type InsertSavedStructure = z.infer<typeof insertSavedStructureSchema>;
export type SavedStructure = typeof savedStructures.$inferSelect;

export type InsertSavedNewsletter = z.infer<typeof insertSavedNewsletterSchema>;
export type SavedNewsletter = typeof savedNewsletters.$inferSelect;

export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

export type InsertUserScore = z.infer<typeof insertUserScoreSchema>;
export type UserScore = typeof userScores.$inferSelect;

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

export const insertWeeklyUsageSchema = createInsertSchema(weeklyUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WeeklyUsage = typeof weeklyUsage.$inferSelect;
export type InsertWeeklyUsage = z.infer<typeof insertWeeklyUsageSchema>;

export type ProposalSearchQuery = z.infer<typeof proposalSearchQuerySchema>;
export type GenerateProposal = z.infer<typeof generateProposalSchema>;

// Text Modification Types
export type TextModificationType = z.infer<typeof textModificationTypeSchema>;
export type WordDifficulty = z.infer<typeof wordDifficultySchema>;
export type ArgumentTechnique = z.infer<typeof argumentTechniqueSchema>;
export type ArgumentStructure = z.infer<typeof argumentStructureSchema>;
export type TextModificationConfig = z.infer<typeof textModificationConfigSchema>;
export type TextModificationResult = z.infer<typeof textModificationResultSchema>;
export type TextModificationRequest = z.infer<typeof textModificationRequestSchema>;


// ===================== NEWSLETTER MANAGEMENT TABLES =====================

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"), // Optional name if provided
  status: varchar("status", { enum: ["active", "unsubscribed", "bounced"] }).notNull().default("active"),
  subscriptionSource: varchar("subscription_source", { enum: ["footer", "landing", "popup", "manual"] }).default("footer"),
  confirmedAt: timestamp("confirmed_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeToken: varchar("unsubscribe_token").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletters table
export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(), // HTML content
  plainTextContent: text("plain_text_content"), // Plain text version
  subject: text("subject").notNull(),
  previewText: text("preview_text"), // Email preview text
  excerpt: text("excerpt"), // Short description for newsletter preview
  readTime: text("read_time"), // Reading time (e.g., "8 min")
  category: text("category"), // Newsletter category
  isNew: boolean("is_new").default(false), // Whether this is the featured newsletter
  publishDate: timestamp("publish_date"), // Date when newsletter should be published
  status: varchar("status", { enum: ["draft", "scheduled", "sent", "cancelled"] }).notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickedCount: integer("clicked_count").default(0),
  bounceCount: integer("bounce_count").default(0),
  unsubscribeCount: integer("unsubscribe_count").default(0),
  tags: json("tags").default([]), // Newsletter tags for organization
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletter sends tracking table (for tracking individual sends)
export const newsletterSends = pgTable("newsletter_sends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  newsletterId: varchar("newsletter_id").notNull().references(() => newsletters.id),
  subscriberId: varchar("subscriber_id").notNull().references(() => newsletterSubscribers.id),
  status: varchar("status", { enum: ["sent", "delivered", "bounced", "opened", "clicked", "unsubscribed"] }).notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  firstClickedAt: timestamp("first_clicked_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  bounceReason: text("bounce_reason"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===================== ADMIN & COST TRACKING TABLES =====================

// Admin users table for administrative access
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  adminLevel: varchar("admin_level", { enum: ["super_admin", "admin", "moderator"] }).notNull().default("admin"),
  permissions: json("permissions").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cost tracking table for monitoring AI usage costs per user
export const userCosts = pgTable("user_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Null for anonymous users
  ipAddress: text("ip_address").notNull(),
  operation: varchar("operation", { 
    enum: ["structure_analysis", "essay_generation", "essay_correction", "proposal_generation", 
           "proposal_search", "future_exam_detection", "repertoire_search", "repertoire_generation", 
           "ai_chat", "text_modification"] 
  }).notNull(),
  tokensInput: integer("tokens_input").notNull().default(0),
  tokensOutput: integer("tokens_output").notNull().default(0),
  costBrl: integer("cost_brl").notNull().default(0), // Cost in centavos (R$ 0.01 = 1)
  modelUsed: text("model_used").notNull().default("gemini-1.5-flash"),
  source: varchar("source", { enum: ["ai", "cache", "fallback"] }).notNull(),
  processingTime: integer("processing_time").default(0), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Business metrics table for tracking key performance indicators
export const businessMetrics = pgTable("business_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricDate: timestamp("metric_date").notNull(),
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0), // Users who made requests in last 30 days
  totalOperations: integer("total_operations").default(0),
  totalCostBrl: integer("total_cost_brl").default(0), // Cost in centavos
  avgCostPerUser: integer("avg_cost_per_user").default(0), // Cost in centavos
  cacheHitRate: integer("cache_hit_rate").default(0), // Percentage * 100
  topOperation: text("top_operation"),
  totalRevenue: integer("total_revenue").default(0), // Revenue in centavos (future subscription tracking)
  createdAt: timestamp("created_at").defaultNow(),
});

// User daily usage summary for efficient cost tracking
export const userDailyUsage = pgTable("user_daily_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  ipAddress: text("ip_address").notNull(),
  usageDate: timestamp("usage_date").notNull(), // Date without time for daily aggregation
  totalOperations: integer("total_operations").default(0),
  totalCostBrl: integer("total_cost_brl").default(0), // Cost in centavos
  operationBreakdown: json("operation_breakdown").notNull().default({}), // Count per operation type
  costBreakdown: json("cost_breakdown").notNull().default({}), // Cost per operation type
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for admin and cost tracking tables
export const insertAdminUserSchema = createInsertSchema(adminUsers);
export const insertUserCostSchema = createInsertSchema(userCosts);
export const insertBusinessMetricSchema = createInsertSchema(businessMetrics);
export const insertUserDailyUsageSchema = createInsertSchema(userDailyUsage);

// ===================== FASE 1: RECEITA + IA COST TRACKING =====================

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  priceMonthly: integer("price_monthly").notNull(), // Price in centavos
  priceYearly: integer("price_yearly"), // Price in centavos
  features: json("features").notNull().default([]),
  maxOperationsPerMonth: integer("max_operations_per_month").default(-1), // -1 = unlimited
  maxAICostPerMonth: integer("max_ai_cost_per_month").default(-1), // -1 = unlimited, in centavos
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { enum: ["active", "cancelled", "paused", "expired", "trial"] }).notNull(),
  billingCycle: varchar("billing_cycle", { enum: ["monthly", "yearly"] }).notNull().default("monthly"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  trialEndDate: timestamp("trial_end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  isAutoRenew: boolean("is_auto_renew").default(true),
  paymentMethodId: text("payment_method_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeStatus: text("stripe_status"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  couponId: varchar("coupon_id").references(() => coupons.id),
  effectivePriceCentavos: integer("effective_price_centavos"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table for financial tracking
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id),
  type: varchar("type", { enum: ["subscription", "upgrade", "downgrade", "refund", "chargeback"] }).notNull(),
  amount: integer("amount").notNull(), // Amount in centavos
  currency: text("currency").notNull().default("BRL"),
  status: varchar("status", { enum: ["pending", "completed", "failed", "refunded"] }).notNull(),
  paymentMethod: varchar("payment_method", { enum: ["credit_card", "pix", "boleto", "paypal"] }),
  paymentProcessorId: text("payment_processor_id"), // External payment ID
  description: text("description"),
  metadata: json("metadata").default({}),
  processor: text("processor").notNull().default("stripe"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  stripeChargeId: text("stripe_charge_id"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  discountAppliedCentavos: integer("discount_applied_centavos").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupons table for discount management
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // Stored in uppercase
  discountType: varchar("discount_type", { enum: ["percent", "fixed"] }).notNull(),
  discountValue: integer("discount_value").notNull(), // 1-100 for percent, centavos for fixed
  currency: text("currency").notNull().default("BRL"),
  maxRedemptions: integer("max_redemptions").default(-1), // -1 = unlimited
  maxRedemptionsPerUser: integer("max_redemptions_per_user").default(-1), // -1 = unlimited
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").default(true),
  planScope: varchar("plan_scope", { enum: ["all", "specific"] }).notNull().default("all"),
  eligiblePlanIds: json("eligible_plan_ids").default([]),
  stripeCouponId: text("stripe_coupon_id"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupon redemptions table for tracking coupon usage
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").notNull().references(() => coupons.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id").references(() => userSubscriptions.id),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  discountAppliedCentavos: integer("discount_applied_centavos").notNull(),
  context: json("context").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment events table for webhook audit
export const paymentEvents = pgTable("payment_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  processor: text("processor").notNull().default("stripe"),
  eventId: text("event_id").notNull().unique(),
  type: text("type").notNull(),
  payload: json("payload").notNull(),
  receivedAt: timestamp("received_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  status: varchar("status", { enum: ["received", "processed", "failed"] }).notNull(),
  error: text("error"),
});

// Revenue metrics table for aggregated financial data
export const revenueMetrics = pgTable("revenue_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricDate: timestamp("metric_date").notNull(),
  mrr: integer("mrr").default(0), // Monthly Recurring Revenue in centavos
  arr: integer("arr").default(0), // Annual Recurring Revenue in centavos
  newMrrThisMonth: integer("new_mrr_this_month").default(0),
  churnedMrrThisMonth: integer("churned_mrr_this_month").default(0),
  expansionMrrThisMonth: integer("expansion_mrr_this_month").default(0),
  contractionMrrThisMonth: integer("contraction_mrr_this_month").default(0),
  totalActiveSubscriptions: integer("total_active_subscriptions").default(0),
  trialUsers: integer("trial_users").default(0),
  paidUsers: integer("paid_users").default(0),
  arpu: integer("arpu").default(0), // Average Revenue Per User in centavos
  ltv: integer("ltv").default(0), // Lifetime Value in centavos
  cac: integer("cac").default(0), // Customer Acquisition Cost in centavos
  paybackPeriodDays: integer("payback_period_days").default(0),
  grossMarginPercent: integer("gross_margin_percent").default(0), // Percentage * 100
  createdAt: timestamp("created_at").defaultNow(),
});

// ===================== FASE 2: FUNIL DE CONVERSÃO + UX COMPLETION RATES =====================

// User events for conversion funnel tracking
export const userEvents = pgTable("user_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  eventType: varchar("event_type", { 
    enum: ["page_view", "signup", "login", "trial_start", "subscription_start", "feature_used", 
           "essay_created", "essay_completed", "structure_created", "chat_started", "task_completed",
           "upgrade", "downgrade", "churn", "reactivation"] 
  }).notNull(),
  eventName: text("event_name").notNull(),
  properties: json("properties").default({}),
  source: varchar("source", { enum: ["organic", "paid", "social", "email", "referral", "direct"] }),
  medium: varchar("medium"),
  campaign: text("campaign"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversion funnels for tracking user journey
export const conversionFunnels = pgTable("conversion_funnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  funnelName: text("funnel_name").notNull(),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(),
  eventType: text("event_type").notNull(),
  conversionRate: integer("conversion_rate").default(0), // Percentage * 100
  usersEntered: integer("users_entered").default(0),
  usersCompleted: integer("users_completed").default(0),
  averageTimeToComplete: integer("average_time_to_complete").default(0), // seconds
  metricDate: timestamp("metric_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User sessions for detailed UX tracking
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration").default(0), // seconds
  pageViews: integer("page_views").default(0),
  bounced: boolean("bounced").default(false),
  source: varchar("source"),
  medium: varchar("medium"),
  campaign: text("campaign"),
  device: varchar("device", { enum: ["desktop", "mobile", "tablet"] }),
  browser: text("browser"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task completions for UX metrics
export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  taskType: varchar("task_type", { 
    enum: ["essay_creation", "structure_creation", "repertoire_search", "chat_completion", 
           "correction_review", "signup_completion", "subscription_signup"] 
  }).notNull(),
  taskName: text("task_name").notNull(),
  status: varchar("status", { enum: ["started", "completed", "abandoned", "failed"] }).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  completionTime: timestamp("completion_time"),
  timeToComplete: integer("time_to_complete").default(0), // seconds
  steps: json("steps").default([]), // Array of step tracking
  errors: json("errors").default([]), // Array of errors encountered
  satisfactionScore: integer("satisfaction_score"), // 1-5 rating
  npsScore: integer("nps_score"), // 0-10 NPS rating
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===================== FASE 3: ADVANCED COHORT ANALYSIS + PREDICTIVE METRICS =====================

// User cohorts for cohort analysis
export const userCohorts = pgTable("user_cohorts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cohortMonth: timestamp("cohort_month").notNull(), // First day of signup month
  userId: varchar("user_id").notNull().references(() => users.id),
  signupDate: timestamp("signup_date").notNull(),
  firstPaymentDate: timestamp("first_payment_date"),
  source: varchar("source"),
  campaign: text("campaign"),
  initialPlan: text("initial_plan"),
  currentStatus: varchar("current_status", { enum: ["active", "churned", "paused", "trial"] }).notNull(),
  currentMrr: integer("current_mrr").default(0), // in centavos
  totalRevenue: integer("total_revenue").default(0), // in centavos
  lifetimeDays: integer("lifetime_days").default(0),
  churnDate: timestamp("churn_date"),
  churnReason: text("churn_reason"),
  lastActivityDate: timestamp("last_activity_date"),
  totalOperations: integer("total_operations").default(0),
  totalAiCost: integer("total_ai_cost").default(0), // in centavos
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Predictive metrics table
export const predictiveMetrics = pgTable("predictive_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricDate: timestamp("metric_date").notNull(),
  metricType: varchar("metric_type", { 
    enum: ["churn_prediction", "ltv_prediction", "upgrade_likelihood", "revenue_forecast"] 
  }).notNull(),
  timeHorizon: varchar("time_horizon", { enum: ["1_month", "3_months", "6_months", "12_months"] }).notNull(),
  predictedValue: integer("predicted_value").notNull(),
  confidenceScore: integer("confidence_score").default(0), // Percentage * 100
  actualValue: integer("actual_value"), // For model validation
  modelVersion: text("model_version").notNull(),
  features: json("features").default({}), // Features used for prediction
  createdAt: timestamp("created_at").defaultNow(),
});

// Churn predictions for specific users
export const churnPredictions = pgTable("churn_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  predictionDate: timestamp("prediction_date").notNull(),
  churnProbability: integer("churn_probability").notNull(), // Percentage * 100
  riskLevel: varchar("risk_level", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  daysToChurn: integer("days_to_churn"),
  riskFactors: json("risk_factors").default([]), // Array of risk factors
  recommendedActions: json("recommended_actions").default([]), // Array of suggested interventions
  modelVersion: text("model_version").notNull(),
  isActual: boolean("is_actual").default(false), // True if user actually churned
  actualChurnDate: timestamp("actual_churn_date"),
  interventionTaken: text("intervention_taken"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for all new tables
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCouponSchema = createInsertSchema(coupons).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  code: z.string().min(1).transform(val => val.toUpperCase()),
  eligiblePlanIds: z.array(z.string()).default([]),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date().nullable(),
}).refine(
  (data) => {
    if (data.discountType === "percent") {
      return data.discountValue >= 1 && data.discountValue <= 100;
    }
    return true;
  },
  {
    message: "Para tipo 'percent', o valor do desconto deve estar entre 1 e 100",
    path: ["discountValue"],
  }
);

// Validation schemas for coupon operations
export const validateCouponSchema = z.object({
  code: z.string().min(1),
  planId: z.string().optional(),
  userId: z.string().optional(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1),
  planId: z.string(),
  userId: z.string().optional(),
});

// Admin schema to update user subscription plan
export const updateUserPlanSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
  planId: z.string().min(1, "ID do plano é obrigatório"),
});

export const insertCouponRedemptionSchema = createInsertSchema(couponRedemptions).omit({ id: true, createdAt: true });
export const insertPaymentEventSchema = createInsertSchema(paymentEvents).omit({ id: true });
export const insertRevenueMetricSchema = createInsertSchema(revenueMetrics).omit({ id: true, createdAt: true });
export const insertUserEventSchema = createInsertSchema(userEvents).omit({ id: true, createdAt: true });
export const insertConversionFunnelSchema = createInsertSchema(conversionFunnels).omit({ id: true, createdAt: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, createdAt: true });
export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({ id: true, createdAt: true });
export const insertUserCohortSchema = createInsertSchema(userCohorts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPredictiveMetricSchema = createInsertSchema(predictiveMetrics).omit({ id: true, createdAt: true });
export const insertChurnPredictionSchema = createInsertSchema(churnPredictions).omit({ id: true, createdAt: true });

// Admin and cost tracking types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type UserCost = typeof userCosts.$inferSelect;
export type InsertUserCost = z.infer<typeof insertUserCostSchema>;
export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type InsertBusinessMetric = z.infer<typeof insertBusinessMetricSchema>;
export type UserDailyUsage = typeof userDailyUsage.$inferSelect;
export type InsertUserDailyUsage = z.infer<typeof insertUserDailyUsageSchema>;

// Fase 1 types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UpdateUserPlan = z.infer<typeof updateUserPlanSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type InsertCouponRedemption = z.infer<typeof insertCouponRedemptionSchema>;
export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type InsertPaymentEvent = z.infer<typeof insertPaymentEventSchema>;
export type RevenueMetric = typeof revenueMetrics.$inferSelect;
export type InsertRevenueMetric = z.infer<typeof insertRevenueMetricSchema>;

// Fase 2 types
export type UserEvent = typeof userEvents.$inferSelect;
export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;
export type ConversionFunnel = typeof conversionFunnels.$inferSelect;
export type InsertConversionFunnel = z.infer<typeof insertConversionFunnelSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;

// Fase 3 types
export type UserCohort = typeof userCohorts.$inferSelect;
export type InsertUserCohort = z.infer<typeof insertUserCohortSchema>;
export type PredictiveMetric = typeof predictiveMetrics.$inferSelect;
export type InsertPredictiveMetric = z.infer<typeof insertPredictiveMetricSchema>;
export type ChurnPrediction = typeof churnPredictions.$inferSelect;
export type InsertChurnPrediction = z.infer<typeof insertChurnPredictionSchema>;

// ===================== NEWSLETTER SCHEMAS =====================

// Newsletter insert schemas
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  unsubscribeToken: true,
  confirmedAt: true,
  unsubscribedAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  sentCount: true,
  deliveredCount: true,
  openedCount: true,
  clickedCount: true,
  bounceCount: true,
  unsubscribeCount: true,
});

export const insertNewsletterSendSchema = createInsertSchema(newsletterSends).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Newsletter management schemas
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().optional(),
});

export const createNewsletterSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  previewText: z.string().optional(),
  plainTextContent: z.string().optional(),
  excerpt: z.string().min(1, "Resumo é obrigatório"),
  readTime: z.string().min(1, "Tempo de leitura é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  isNew: z.boolean().optional(),
  publishDate: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  scheduledAt: z.coerce.date().optional(),
});

export const updateNewsletterSchema = createNewsletterSchema.partial();

export const sendNewsletterSchema = z.object({
  newsletterId: z.string(),
  sendImmediately: z.boolean().optional(),
  scheduledAt: z.coerce.date().optional(),
});

// Newsletter type definitions
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;

export type NewsletterSend = typeof newsletterSends.$inferSelect;
export type InsertNewsletterSend = z.infer<typeof insertNewsletterSendSchema>;

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;
export type CreateNewsletter = z.infer<typeof createNewsletterSchema>;
export type UpdateNewsletter = z.infer<typeof updateNewsletterSchema>;
export type SendNewsletter = z.infer<typeof sendNewsletterSchema>;

// ===================== MATERIAIS COMPLEMENTARES =====================

// Materiais complementares table
export const materiaisComplementares = pgTable("materiais_complementares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // Conteúdo completo do material
  category: text("category").notNull().default("Fundamental"), // Permite categorias personalizadas
  readTime: text("read_time"), // Opcional - permite ocultar tempo de leitura
  pdfUrl: text("pdf_url"), // URL do PDF para download (opcional)
  icon: varchar("icon", { 
    enum: ["FileText", "Target", "BookOpen", "Lightbulb", "PenTool", "Eye"] 
  }).notNull().default("FileText"),
  colorScheme: varchar("color_scheme", { 
    enum: ["green", "blue", "purple", "orange", "indigo", "amber"] 
  }).notNull().default("green"),
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").default(0), // Para ordenação manual
  views: integer("views").default(0), // Contador de visualizações
  pdfDownloads: integer("pdf_downloads").default(0), // Contador de downloads de PDF
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Material complementar insert schemas
export const insertMaterialComplementarSchema = createInsertSchema(materiaisComplementares).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Material complementar management schemas
export const createMaterialComplementarSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"), // Permite categorias personalizadas
  readTime: z.string().optional(), // Opcional - permite não mostrar tempo de leitura
  pdfUrl: z.string().min(1).optional(), // URL ou caminho do PDF (opcional)
  icon: z.enum(["FileText", "Target", "BookOpen", "Lightbulb", "PenTool", "Eye"]).default("FileText"),
  colorScheme: z.enum(["green", "blue", "purple", "orange", "indigo", "amber"]).default("green"),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const updateMaterialComplementarSchema = createMaterialComplementarSchema.partial();

// Material complementar type definitions
export type MaterialComplementar = typeof materiaisComplementares.$inferSelect;
export type InsertMaterialComplementar = z.infer<typeof insertMaterialComplementarSchema>;
export type CreateMaterialComplementar = z.infer<typeof createMaterialComplementarSchema>;
export type UpdateMaterialComplementar = z.infer<typeof updateMaterialComplementarSchema>;

// ===================== USER GOALS (METAS) =====================

export const userGoals = pgTable("user_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  target: integer("target").notNull(), // Meta a atingir
  current: integer("current").notNull().default(0), // Progresso atual
  unit: text("unit").notNull(), // Unidade (redações, horas, etc)
  completed: boolean("completed").default(false),
  priority: varchar("priority", { enum: ["alta", "media", "baixa"] }).default("media"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_goals_user_id").on(table.userId),
}));

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserGoal = typeof userGoals.$inferSelect;
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;

// ===================== USER EXAMS (PROVAS/VESTIBULARES) =====================

export const userExams = pgTable("user_exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  examAt: timestamp("exam_at").notNull(), // Data e hora da prova
  location: text("location"), // Local da prova
  description: text("description"),
  type: varchar("type", { enum: ["vestibular", "concurso", "simulado", "outros"] }).notNull().default("simulado"),
  status: varchar("status", { enum: ["upcoming", "completed", "cancelled"] }).default("upcoming"),
  subjects: json("subjects").default([]), // Matérias da prova
  durationMinutes: integer("duration_minutes"), // Duração da prova em minutos
  importance: varchar("importance", { enum: ["alta", "media", "baixa"] }).default("media"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_exams_user_id").on(table.userId),
}));

export const insertUserExamSchema = createInsertSchema(userExams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  examAt: z.coerce.date(),
});

export type UserExam = typeof userExams.$inferSelect;
export type InsertUserExam = z.infer<typeof insertUserExamSchema>;

// ===================== USER SCHEDULE (CRONOGRAMA) =====================

export const userSchedule = pgTable("user_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  day: varchar("day", { 
    enum: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"] 
  }).notNull(),
  activities: json("activities").notNull().default([]), // Lista de atividades do dia
  hours: integer("hours").default(0), // Horas de estudo
  minutes: integer("minutes").default(0), // Minutos de estudo
  completed: boolean("completed").default(false),
  weekStart: timestamp("week_start").notNull(), // Início da semana (para rastrear semanas diferentes)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_user_schedule_user_id").on(table.userId),
  uniqueUserDayWeek: uniqueIndex("unique_user_day_week").on(table.userId, table.weekStart, table.day),
}));

export const insertUserScheduleSchema = createInsertSchema(userSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  weekStart: z.coerce.date(),
});

export type UserSchedule = typeof userSchedule.$inferSelect;
export type InsertUserSchedule = z.infer<typeof insertUserScheduleSchema>;

// ===================== ESSAY OUTLINE QUESTIONNAIRE =====================

export const essayOutlineQuestionnaireSchema = z.object({
  proposal: z.string().min(10, "A proposta deve ter pelo menos 10 caracteres"),
  familiarityLevel: z.enum([
    "never-studied",
    "know-little", 
    "studied-can-develop",
    "advanced-mastery"
  ], {
    required_error: "Selecione seu nível de familiaridade",
  }),
  problemsAndChallenges: z.object({
    dontKnow: z.boolean(),
    text: z.string().optional(),
  }).refine(
    (data) => data.dontKnow || (data.text && data.text.length >= 20),
    {
      message: "Descreva os problemas com pelo menos 20 caracteres ou marque 'Não conheço'",
      path: ["text"],
    }
  ),
  knownReferences: z.object({
    hasReferences: z.boolean(),
    references: z.string().optional(),
  }).refine(
    (data) => !data.hasReferences || (data.references && data.references.length > 0),
    {
      message: "Se você conhece referências, descreva-as",
      path: ["references"],
    }
  ),
  detailLevel: z.enum(["step-by-step", "general-directions"], {
    required_error: "Selecione o nível de detalhamento desejado",
  }),
});

export type EssayOutlineQuestionnaire = z.infer<typeof essayOutlineQuestionnaireSchema>;

// ===================== DRIZZLE ORM RELATIONS =====================

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  userSubscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
}));
