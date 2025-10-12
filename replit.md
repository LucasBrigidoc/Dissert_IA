# Overview

DissertIA is an AI-powered SaaS educational platform for Brazilian students preparing for entrance and competitive exams. It offers personalized writing assistance through tools like the Socratic Argument Architect, Intelligent Repertoire Explorer, and custom essay structure creators. The platform integrates AI technology with pedagogical expertise to revolutionize essay writing education, featuring a modern "liquid glass" design with a blue-themed aesthetic.

# Recent Changes

## October 12, 2025 - Pricing and AI Usage Limits Update (Latest)
- **Updated Plano Pro Pricing**: Adjusted subscription prices for better accessibility
  - **Mensal**: R$55,00/mês (previously R$65,90)
  - **Anual**: R$479,88/ano equivale a R$39,99/mês (previously R$599,00 - 27% discount)
  - **Economia Anual**: R$180,12 (previously R$190,80)
  - Updated pricing display across:
    - `client/src/lib/mock-data.ts` - Plan prices and FAQ
    - `client/src/pages/pricing.tsx` - Pricing page display
    - `client/src/pages/checkout.tsx` - Checkout page with all price calculations
- **Updated Gemini API Usage Limits**: Adjusted cost limits for both free and pro plans
  - **Free Plan**: R$ 0,17 a cada 15 dias (17 centavos) with unlimited operations; R$ 0,35 max cost per month (35 centavos)
  - **Pro Plan**: R$ 4,00 por semana (400 centavos a cada 7 dias) with unlimited operations; R$ 20,00 max cost per month (2000 centavos)
  - Updated `WeeklyCostLimitingService` with new cost limits
  - Updated `SubscriptionService` free plan monthly limit to R$ 0,35
  - Maintains unlimited operations for both plans (-1 sentinel value)

## October 11, 2025 - AI Usage Limits Previous Update
- **Updated Gemini API Usage Limits**: Completely restructured the cost and operation limits for free and pro plans
  - **Free Plan**: R$ 0,90 a cada 15 dias (90 centavos) with unlimited operations; R$ 1,80 max cost per month (180 centavos)
  - **Pro Plan**: R$ 5,00 por semana (500 centavos a cada 7 dias) with unlimited operations; R$ 22,00 max cost per month (2200 centavos)
  - Updated `WeeklyCostLimitingService` with new quinzenal/semanal limits
  - Updated `SubscriptionService` with new monthly limits and unlimited operations logic
  - Fixed free plan logic to properly handle unlimited operations (-1 sentinel value)

## October 11, 2025 - AI Chat Brainstorming Enhancement
- **Enhanced AI Chat Prompt**: Completely redesigned the brainstorming chat prompt to provide comprehensive pedagogical guidance
  - Now explicitly guides students through the full dissertativo-argumentativo structure: Tema → Tese → Introdução → Desenvolvimento 1 → Desenvolvimento 2 → Conclusão
  - Added detailed instructions for each section with specific guidance on structure, length, and requirements
  - Included comprehensive explanation of proposta de intervenção with 5 required elements (Agente, Ação, Meio/Modo, Finalidade, Detalhamento)
  - Enhanced fallback responses for each section with practical, actionable guidance
  - Standardized response format to ensure consistent pedagogical quality
- **UI Improvements**: Changed "Save to Library" button icon from Star to BookmarkPlus for better visual representation

## October 6, 2025 - Dashboard Integration with Database
- **Essay Correction Auto-Save**: Essay corrections now automatically save scores to `userScores` table when user is authenticated
- **Score Management API**: Created complete REST API for score management
  - GET `/api/user-scores` - Retrieves all user scores with competency breakdown
  - POST `/api/user-scores` - Manual score entry for external exams
  - PATCH `/api/user-scores/:id` - Update existing scores
  - DELETE `/api/user-scores/:id` - Remove scores
- **Competency Analysis API**: Created GET `/api/user-competencies` endpoint with period filters (30/90/365 days)
- **Automatic Progress Updates**: After each essay correction, user progress (averageScore, essaysCount) is automatically recalculated
- **Dashboard Data Integration**: Dashboard now displays real data from database:
  - Evolution graph shows actual essay scores over time
  - Competency breakdown calculated from stored competency data
  - Progress metrics sync with database automatically

## October 4, 2025 - GitHub Import Setup
- Successfully imported GitHub repository to Replit environment
- Verified existing configuration (already set up for Replit)
- Installed all npm dependencies (570 packages)
- Configured development workflow "Start application" to run on port 5000 with webview output
- Pushed database schema to PostgreSQL using Drizzle Kit
- Verified application is running correctly with frontend displaying properly
- Both frontend and backend serving on port 5000 as expected
- Vite HMR (Hot Module Replacement) is working correctly
- Application ready for development and deployment

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack React Query.
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with a "liquid glass" aesthetic.
- **Build Tool**: Vite.

## Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **Database ORM**: Drizzle ORM.
- **Authentication**: bcrypt for password hashing; session-based authentication.
- **API Design**: RESTful endpoints.

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database.
- **Storage Implementation**: DbStorage class with Drizzle ORM.
- **Schema Design**: User-centric with tables for users, progress, essays, ENEM competency fields, structures, materials, and analytics.
- **Migration Management**: Drizzle Kit.

## Development
- **Monorepo Structure**: `client/`, `server/`, and `shared/` directories.
- **Shared Code**: Common TypeScript interfaces and Zod schemas.

## Design System
- **Color Palette**: Custom CSS variables for DissertIA brand colors (dark blue, bright blue, soft gray).
- **Typography**: Inter font family.
- **Responsive Design**: Mobile-first approach with Tailwind.

## Technical Implementations
- **AI-powered Features**: Socratic Argument Architect, Intelligent Repertoire Explorer, personalized structure creators, AI essay generation, AI chat, and professional essay correction with competency analysis.
- **Rate Limiting**: Comprehensive AI feature rate limiting to manage costs.
- **Profile Management**: User profile update with Brazilian phone validation.
- **Competency Analysis**: "Pontos a Melhorar" feature displaying dynamic competency cards based on user essay data, identifying weakest competencies.
- **Dynamic Goal Management**: Smart goal setting system for target scores, displaying progress.
- **User Score Tracking**: System for tracking user scores from various sources, with dashboard visualization and manual entry for external exam results.
- **Save to Library Feature**: Users can save modified texts from the Writing Controller to a personal library with custom titles, viewable in the Biblioteca page with filtering and CRUD functionality.

# External Dependencies

## Core Frameworks
- **pg**: PostgreSQL connection (node-postgres driver).
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **drizzle-orm**: TypeScript ORM for PostgreSQL.

## UI and Design
- **@radix-ui/react-\***: UI primitives.
- **tailwindcss**: CSS framework.
- **class-variance-authority**: Component variants.
- **clsx**: Conditional CSS class joining.

## Development and Build Tools
- **vite**: Frontend build tool.
- **esbuild**: JavaScript bundler.
- **tsx**: TypeScript execution.
- **drizzle-kit**: Database migration.

## Authentication and Security
- **bcrypt**: Password hashing.
- **memorystore**: In-memory session store (development).
- **connect-pg-simple**: PostgreSQL session store (production).

## Validation and Form Handling
- **zod**: Schema validation.
- **@hookform/resolvers**: Resolver for React Hook Form.

## Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay.
- **@replit/vite-plugin-cartographer**: Replit workspace integration.

# Environment Configuration

## Required Environment Variables

### Essential (Already Configured)
- **DATABASE_URL**: PostgreSQL connection string (automatically provided by Replit Database)
- **SESSION_SECRET**: Session encryption key (configured)

### Optional AI & Payment Features
To enable full functionality, configure these environment variables in Replit Secrets:

- **GEMINI_API_KEY**: Google Gemini API key for AI-powered features (text modification, essay correction)
  - Without this key, text modification will use fallback mode only
  - Required for: Socratic Argument Architect, AI essay generation, chat functionality
  
- **STRIPE_SECRET_KEY**: Stripe API key for payment processing
  - Without this key, payment features will be disabled
  - Required for: Subscription management, payment processing
  
- **STRIPE_WEBHOOK_SECRET**: Stripe webhook signing secret
  - Required for: Processing payment webhooks securely
  
- **SENDGRID_API_KEY**: SendGrid API key for email functionality
  - Required for: Sending transactional emails, newsletters

## Running the Application

### Development
The application runs automatically via the configured workflow:
```bash
npm run dev
```
This starts both the Express backend and Vite frontend dev server on port 5000.

### Database Management
To push schema changes to the database:
```bash
npm run db:push
```

### Production Deployment
The application is configured for Replit deployment with:
- Build command: `npm run build`
- Start command: `npm run start`
- Deployment type: Autoscale (stateless web app)