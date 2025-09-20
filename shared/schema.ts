import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: varchar("user_type", { enum: ["vestibulano", "concurseiro"] }).notNull().default("vestibulano"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  averageScore: integer("average_score").default(0),
  targetScore: integer("target_score").default(900),
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
  score: integer("score"),
  progress: integer("progress"), // Percentage 0-100
  isCompleted: boolean("is_completed").default(false),
  proposalUsed: text("proposal_used"), // The essay proposal/prompt used
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  formalityLevel: z.number().min(0).max(100).optional(),
  wordDifficulty: wordDifficultySchema.optional(),
  argumentTechnique: argumentTechniqueSchema.optional(),
  argumentativeLevel: z.number().min(0).max(100).optional(),
  argumentStructure: argumentStructureSchema.optional(),
  structureType: structureTypeSchema.optional(),
});

export const textModificationResultSchema = z.object({
  modifiedText: z.string(),
  modificationType: textModificationTypeSchema,
  source: z.enum(["ai", "cache", "fallback"]),
  tokensUsed: z.number().optional(),
});

export const textModificationRequestSchema = z.object({
  text: z.string().min(1, "Texto é obrigatório").max(2000, "Texto muito longo. Máximo 2000 caracteres."),
  type: textModificationTypeSchema,
  config: textModificationConfigSchema.optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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


export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;

export type InsertSavedProposal = z.infer<typeof insertSavedProposalSchema>;
export type SavedProposal = typeof savedProposals.$inferSelect;

export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type Simulation = typeof simulations.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

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
