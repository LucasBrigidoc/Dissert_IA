# Overview

DissertAI is a comprehensive SaaS educational platform designed to revolutionize essay writing for Brazilian students preparing for entrance exams (vestibulares) and competitive exams (concursos). The platform combines artificial intelligence with pedagogical expertise to provide personalized writing assistance, featuring tools like the Socratic Argument Architect, Intelligent Repertoire Explorer, and personalized structure creators. Built as a full-stack web application with a React frontend and Express backend, it offers a modern "liquid glass" design aesthetic with a blue-themed color scheme.

# Recent Changes

- **September 26, 2025**: Fresh GitHub Import to Replit Environment Successfully Completed
  - **Project Import**: Successfully imported and configured DissertAI fullstack application for Replit environment
    - **Host Configuration**: Verified existing proper host settings (0.0.0.0:5000) already configured for Replit proxy compatibility
    - **Workflow Setup**: Configured 'Start application' workflow with webview output on port 5000
    - **Frontend**: React + Vite development server running successfully with allowedHosts: true
    - **Backend**: Express.js server properly configured for Replit environment
    - **Storage**: Using MemStorage (in-memory) for optimal Replit performance
    - **Deployment Config**: Set up autoscale deployment with npm build and start commands
    - **Environment Verification**: Application running successfully on port 5000 with Vite dev server connected
    - **AI Services**: Ready for GEMINI_API_KEY configuration when needed for AI features
  - **Architecture Validated**: All existing TypeScript, React, Express, and storage configurations work perfectly in Replit
  - **Testing**: Application loads and runs without errors, all components properly connected
- **September 25, 2025**: AI Rate Limiting Optimization - Final Implementation R$ 45/mês
  - **Cost Optimization**: Implementação final dos limites de IA para custo máximo de R$ 45/mês por usuário
    - **Propostas**: Busca 14 a cada 3 dias, Geração 11 a cada 3 dias, Detecção de provas futuras 5 a cada 3 dias
    - **Redações**: Geração 8 a cada 3 dias, Análise de estruturas 6 a cada 3 dias
    - **Repertórios**: Busca 19 a cada 3 dias, Geração 8 a cada 3 dias
    - **Chat com IA**: 12 conversas a cada 3 dias
    - **Correção**: Correção de redações 5 a cada 3 dias, Modificação de textos 9 a cada 3 dias
  - **Custo Calculado**: R$ 44,80 por mês máximo com uso total dos limites (dentro do orçamento de R$ 45)
  - **Tokens por Operação**: Baseado em análise real do código - Input/Output tokens calculados precisamente
  - **Preços API Gemini**: $0.075 input + $0.30 output por 1M tokens (convertido para BRL)
  - **Flexibilidade**: Períodos de 3 dias permitem distribuição inteligente do uso sem restrições diárias
- **September 23, 2025**: AI Rate Limiting Optimization - Daily Limits Implementation
  - **Cost Optimization**: Implemented comprehensive daily rate limiting across all AI-powered features for improved cost control
    - **Propostas**: Busca 20/dia, Geração 7/dia, Detecção de provas futuras 10/dia
    - **Redações**: Geração 3/dia, Análise de estruturas 15/dia
    - **Repertórios**: Busca 20/dia, Geração 6/dia
    - **Chat com IA**: 15 conversas/dia
    - **Correção**: Correção de redações 8/dia, Modificação de textos 15/dia
  - **User Experience**: Updated all error messages to clearly indicate daily limits with 24-hour retry periods
  - **Technical Implementation**: Converted all rate limiting from hourly (60 min) to daily (1440 min) windows for better user distribution
  - **Cost Impact**: Reduced maximum user cost from R$100.20 to R$75.60 per month (25% reduction) while maintaining generous usage limits
  - **Sustainability**: Balanced approach ensuring high-quality user experience while controlling AI API costs for long-term platform viability
- **September 16, 2025**: AI Essay Generation Integration for "Estrutura Coringa" Feature Completed
  - **AI Essay Generation**: Implemented complete AI-powered essay generation using custom user-defined structures
    - Added `generateEssayFromStructure` function to GeminiService for structure-based essay generation
    - Created `/api/essays/generate` endpoint with robust Zod validation and rate limiting (3 essays per hour)
    - Enhanced UseStructure and CreateStructure pages to use real AI instead of mock content
    - Implemented intelligent fallback system for offline scenarios with local content generation
    - Added proper error handling using HTTP status codes instead of string matching
    - Included rate limiting with standardized Retry-After headers for production readiness
  - **Data Validation**: Enhanced backend validation with proper Zod schemas preventing whitespace-only inputs
  - **User Experience**: Added contextual toasts for success, rate limiting, and offline fallback scenarios
  - **Cost Control**: Maintained existing rate limiting strategy to ensure R$30/month maximum user cost alignment
- **September 9, 2025**: AI Chat Integration & Replit Environment Setup Completed
  - **AI Chat System**: Integrated intelligent chat with IA for argumentative structure development
    - Context-aware suggestions based on user's proposal and thesis
    - Section-specific guidance for introduction, development paragraphs, and conclusion
    - Rate limiting (10 AI chats per hour per IP) for cost optimization
    - Smart fallback system for offline scenarios
    - Real-time contextual analysis using Gemini AI
  - **Project Import**: Successfully imported GitHub project to Replit environment
  - **API Configuration**: Added GEMINI_API_KEY secret for AI-powered repertoire generation
  - **Workflow Setup**: Configured 'Start application' workflow to run on port 5000 with webview output
  - **Host Configuration**: Verified allowedHosts configuration for Replit proxy compatibility
  - **Deployment Config**: Set up autoscale deployment with proper build and start commands
  - **Testing**: Confirmed application runs successfully with modern liquid glass UI design
- **September 8, 2025**: AI Cost Optimization Enhancements & Replit Environment Setup
  - **AI Ranking Removed**: Eliminated AI-based ranking function, replaced with efficient local keyword matching (saves 100% of ranking tokens)
  - **Cache TTL System**: Added 30-day expiration to search cache with automatic cleanup of stale data
  - **Rate Limiting**: Implemented intelligent rate limiting (10 AI searches per hour per IP) to prevent excessive usage and costs
  - **Enhanced Local Analysis**: All query analysis now done locally without AI tokens, maintaining accuracy while reducing costs
  - **UI Fixes**: Fixed text truncation issue in biblioteca dialog modal by improving flexbox layout and adding proper accessibility attributes
  - **Replit Integration**: Successfully configured project for Replit environment with proper host settings, deployment configuration, and workflow setup
- **September 7, 2025**: Successfully imported GitHub project to Replit environment
- **Setup Completion**: Fixed tsx dependency issue, configured proper host settings for Replit proxy
- **AI Enhancement**: Added intelligent repertoire generation using Gemini AI when no existing repertoires match search queries  
- **Search Improvement**: Enhanced search functionality to dynamically create relevant repertoires and save them to the database
- **UX Enhancement**: Improved repertoire search to auto-execute when filter options are changed (if search query exists)
- **Deployment**: Configured autoscale deployment with proper build and start commands
- **Environment Setup**: Added GEMINI_API_KEY secret for AI functionality
- **Project Import**: Completed Replit environment setup with working frontend on port 5000

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing with support for multiple pages (landing, login, signup, dashboard, features, about, pricing)
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Comprehensive design system built on Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens implementing a "liquid glass" aesthetic using backdrop filters and translucent backgrounds
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework providing RESTful API endpoints
- **Language**: TypeScript throughout the stack for consistency and type safety
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: bcrypt for password hashing with session-based authentication planning
- **API Design**: RESTful endpoints for user registration, newsletter signup, and future essay management features

## Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Neon Database for scalable cloud hosting
- **Schema Design**: User-centric design with tables for users, user progress tracking, and essays with comprehensive metadata
- **Data Relationships**: Foreign key relationships between users and their progress/essays for data integrity
- **Migration Management**: Drizzle Kit for database schema versioning and deployment

## Development Architecture
- **Monorepo Structure**: Organized with separate client/, server/, and shared/ directories for clear separation of concerns
- **Shared Code**: Common TypeScript interfaces and Zod schemas in shared/ directory for type consistency across frontend and backend
- **Development Server**: Vite dev server with Express API proxy for seamless full-stack development
- **Build Process**: Separate build processes for client (Vite) and server (esbuild) with production deployment configuration

## Design System Architecture
- **Color Palette**: Custom CSS variables implementing the DissertAI brand colors (dark blue #09072e, bright blue #5087ff, soft gray #adacb7)
- **Typography**: Inter font family from Google Fonts with defined weight and size scales
- **Component Library**: Comprehensive UI component system with consistent spacing, borders, and interaction patterns
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **@tanstack/react-query**: Advanced server state management and caching for React applications
- **wouter**: Minimalist client-side routing library for React
- **drizzle-orm**: TypeScript-first ORM for PostgreSQL with excellent developer experience

## UI and Design Dependencies
- **@radix-ui/react-***: Comprehensive collection of unstyled, accessible UI primitives (accordion, dialog, dropdown, form controls, etc.)
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating type-safe component variants
- **clsx**: Utility for conditional CSS class joining

## Development and Build Tools
- **vite**: Next-generation frontend build tool with fast HMR and optimized builds
- **esbuild**: Fast JavaScript bundler for server-side code compilation
- **tsx**: TypeScript execution environment for development
- **drizzle-kit**: Database migration and schema management tool

## Authentication and Security
- **bcrypt**: Industry-standard password hashing library for secure user authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions (planned implementation)

## Validation and Form Handling
- **zod**: TypeScript-first schema declaration and validation library
- **@hookform/resolvers**: Resolver library for React Hook Form integration with validation schemas

## Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
- **@replit/vite-plugin-cartographer**: Development tool for Replit workspace integration