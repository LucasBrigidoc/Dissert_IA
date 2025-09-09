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

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Mensagem é obrigatória"),
  section: z.enum(["introducao", "desenvolvimento1", "desenvolvimento2", "conclusao"]),
  context: z.object({
    proposta: z.string().optional(),
    tese: z.string().optional(),
    paragrafos: z.object({
      introducao: z.string().optional(),
      desenvolvimento1: z.string().optional(),
      desenvolvimento2: z.string().optional(),
      conclusao: z.string().optional(),
    }).optional(),
  }),
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
