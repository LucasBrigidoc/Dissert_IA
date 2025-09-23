import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertEssayStructureSchema, searchQuerySchema, chatMessageSchema, proposalSearchQuerySchema, generateProposalSchema, textModificationRequestSchema, insertSimulationSchema } from "@shared/schema";
import { geminiService } from "./gemini-service";
import { textModificationService } from "./text-modification-service";
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

      // Rate limiting check (5 analyses per hour per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`structure_analysis_${clientIP}`, 5, 60);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '3600');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can analyze 5 essays per hour.", 
          retryAfter: 3600,
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
      
      // Analyze essay structure using Gemini AI
      const structureAnalysis = await geminiService.analyzeEssayStructure(
        essayText,
        existingStructures
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

      // Rate limiting check (3 essay generations per hour per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`essay_generation_${clientIP}`, 3, 60);
      
      if (!rateLimitCheck.allowed) {
        res.set('Retry-After', '3600');
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can generate 3 essays per hour.", 
          retryAfter: 3600,
          rateLimitType: "essay_generation"
        });
      }
      
      console.log(`📝 Essay generation request: ${structureName || 'Custom Structure'}, topic: ${topic.substring(0, 50)}..., IP: ${clientIP}`);
      
      // Generate essay using Gemini AI
      const generatedEssay = await geminiService.generateEssayFromStructure(
        structureName || 'Custom Structure',
        sections,
        topic.trim(),
        additionalInstructions?.trim()
      );
      
      res.json({
        success: true,
        essay: generatedEssay,
        structureName: structureName || 'Custom Structure',
        topic: topic.trim(),
        additionalInstructions: additionalInstructions?.trim() || null,
        message: "Essay generated successfully"
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
      
      // Rate limiting check (40 AI searches per hour per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(clientIP, 40, 60);
      
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can make 40 AI searches per hour.", 
          retryAfter: 3600 
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
      
      // Rate limiting - use daily limit for future exam detection, hourly for regular searches
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      let rateLimitCheck;
      
      if (futureExamDetection.isFuture) {
        // Daily rate limit for future exam detection (50 searches per day)
        rateLimitCheck = await storage.checkRateLimit(`future_exam_${clientIP}`, 50, 1440);
        if (!rateLimitCheck.allowed) {
          return res.status(429).json({ 
            message: "Rate limit exceeded. You can search for future exams 50 times per day.", 
            retryAfter: 86400 // 24 hours
          });
        }
      } else {
        // Regular rate limiting (30 searches per hour per IP)
        rateLimitCheck = await storage.checkRateLimit(clientIP, 30, 60);
        if (!rateLimitCheck.allowed) {
          return res.status(429).json({ 
            message: "Rate limit exceeded. You can make 30 searches per hour.", 
            retryAfter: 3600 
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
      
      // Rate limiting check (5 generations per hour per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(clientIP, 5, 60);
      
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can generate 5 proposals per hour.", 
          retryAfter: 3600 
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
      
      // Rate limiting check (10 AI chats per hour per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(clientIP, 10, 60);
      
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can make 10 AI chat requests per hour.", 
          retryAfter: 3600 
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
      
      // Generate AI response with conversation context
      const aiResponse = await geminiService.generateWithContext(
        conversation.summary,
        recentMessages,
        section,
        context || {}
      );
      
      // Add AI response to conversation
      const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai' as const,
        content: aiResponse,
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
      
      res.json({
        conversationId: conversation.id,
        response: aiResponse,
        section,
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
      
      // Per-type rate limiting (15 modifications per hour per IP per type)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const perTypeIdentifier = `${clientIP}_text_${type}`;
      const rateLimitCheck = await storage.checkRateLimit(perTypeIdentifier, 15, 60);
      
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ 
          message: `Rate limit exceeded for ${type} modifications. You can make 15 ${type} modifications per hour.`, 
          retryAfter: 3600,
          type: type
        });
      }
      
      console.log(`✏️ Text modification request: ${type}, IP: ${clientIP}`);
      
      // Process text with AI
      const result = await textModificationService.modifyText(text, type, config || {});
      
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
      
      if (essayText.trim().length < 100) {
        return res.status(400).json({ message: "Essay too short for correction (minimum 100 characters)" });
      }
      
      // Rate limiting check (3 corrections per hour per IP)
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const rateLimitCheck = await storage.checkRateLimit(`correction_${clientIP}`, 3, 60);
      
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. You can correct 3 essays per hour.", 
          retryAfter: 3600 
        });
      }
      
      console.log(`📝 Essay correction request, ${essayText.length} characters, IP: ${clientIP}`);
      
      // Correct essay using Gemini AI
      const correction = await geminiService.correctEssay(
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


  const httpServer = createServer(app);
  return httpServer;
}
