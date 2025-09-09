import { type User, type InsertUser, type UserProgress, type InsertUserProgress, type Essay, type InsertEssay, type EssayStructure, type InsertEssayStructure, type Repertoire, type InsertRepertoire, type SearchCache, type InsertSearchCache, type RateLimit, type InsertRateLimit, type SavedRepertoire, type InsertSavedRepertoire } from "@shared/schema";
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
  
  // Saved repertoires operations
  saveRepertoire(userId: string, repertoireId: string): Promise<SavedRepertoire>;
  removeSavedRepertoire(userId: string, repertoireId: string): Promise<boolean>;
  getUserSavedRepertoires(userId: string): Promise<Repertoire[]>;
  isRepertoireSaved(userId: string, repertoireId: string): Promise<boolean>;
  
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProgress: Map<string, UserProgress>;
  private essays: Map<string, Essay>;
  private essayStructures: Map<string, EssayStructure>;
  private repertoires: Map<string, Repertoire>;
  private searchCaches: Map<string, SearchCache>;
  private rateLimits: Map<string, RateLimit>;
  private savedRepertoires: Map<string, SavedRepertoire>;

  constructor() {
    this.users = new Map();
    this.userProgress = new Map();
    this.essays = new Map();
    this.essayStructures = new Map();
    this.repertoires = new Map();
    this.searchCaches = new Map();
    this.rateLimits = new Map();
    this.savedRepertoires = new Map();
    
    // Initialize with basic repertoires
    this.initializeRepertoires();
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

}

export const storage = new MemStorage();
