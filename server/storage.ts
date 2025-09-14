import { type User, type InsertUser, type UserProgress, type InsertUserProgress, type Essay, type InsertEssay, type EssayStructure, type InsertEssayStructure, type Repertoire, type InsertRepertoire, type SearchCache, type InsertSearchCache, type RateLimit, type InsertRateLimit, type SavedRepertoire, type InsertSavedRepertoire, type Proposal, type InsertProposal, type SavedProposal, type InsertSavedProposal, type Simulation, type InsertSimulation } from "@shared/schema";
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
  private proposals: Map<string, Proposal>;
  private savedProposals: Map<string, SavedProposal>;
  private simulations: Map<string, Simulation>;

  constructor() {
    this.users = new Map();
    this.userProgress = new Map();
    this.essays = new Map();
    this.essayStructures = new Map();
    this.repertoires = new Map();
    this.searchCaches = new Map();
    this.rateLimits = new Map();
    this.savedRepertoires = new Map();
    this.proposals = new Map();
    this.savedProposals = new Map();
    this.simulations = new Map();
    
    // Initialize with basic repertoires
    this.initializeRepertoires();
    // Initialize with basic proposals
    this.initializeProposals();
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

}

export const storage = new MemStorage();
