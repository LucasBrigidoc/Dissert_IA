import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEssayStructureSchema, searchQuerySchema } from "@shared/schema";
import { geminiService } from "./gemini-service";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Newsletter signup endpoint
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // In a real app, this would save to a newsletter database table
      // For now, just return success
      res.json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Newsletter signup error:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
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

  // Intelligent repertoire search endpoint
  app.post("/api/repertoires/search", async (req, res) => {
    try {
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
      
      // First search with explicit filters  
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
      
      // OPTIMIZED: Generate 6 repertoires in 1 AI request (instead of multiple)
      if (results.length < 4) {
        console.log(`🚀 OPTIMIZED: Generating batch of repertoires for: "${query}" (current: ${results.length})`);
        
        // Single optimized AI call that generates 6 repertoires
        const generatedRepertoires = await geminiService.generateRepertoiresBatch(query, filters, 6);
        
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
      
      // Filter out excluded IDs
      if (excludeIds.length > 0) {
        results = results.filter(rep => !excludeIds.includes(rep.id));
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
      
      // Cache the results for future searches
      await storage.createSearchCache({
        queryText: query,
        normalizedQuery: cacheKey,
        results: results,
        searchCount: 1,
        lastSearched: new Date()
      });
      
      res.json({
        results,
        source: "ai",
        count: results.length,
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

  const httpServer = createServer(app);
  return httpServer;
}
