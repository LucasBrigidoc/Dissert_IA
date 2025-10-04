# Overview

DissertIA is a SaaS educational platform designed for Brazilian students preparing for entrance and competitive exams. It leverages AI to offer personalized writing assistance, including tools like the Socratic Argument Architect, Intelligent Repertoire Explorer, and custom structure creators. The platform aims to merge AI technology with pedagogical expertise to transform essay writing education, featuring a modern "liquid glass" design aesthetic with a blue-themed color scheme.

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
- **Authentication**: bcrypt for password hashing; session-based authentication planned.
- **API Design**: RESTful endpoints.

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database.
- **Storage Implementation**: DbStorage class with full Drizzle ORM integration (migrated from MemStorage on Oct 2, 2025).
- **Schema Design**: User-centric with tables for users, progress, and essays, including ENEM competency fields (competence1-5, feedback1-5).
- **Migration Management**: Drizzle Kit.
- **Persistence Status**: ✅ All data persisted to PostgreSQL (users, essays, progress, structures, materials, analytics, etc.).

## Development
- **Monorepo Structure**: `client/`, `server/`, and `shared/` directories.
- **Shared Code**: Common TypeScript interfaces and Zod schemas.

## Design System
- **Color Palette**: Custom CSS variables for DissertIA brand colors (dark blue, bright blue, soft gray).
- **Typography**: Inter font family.
- **Responsive Design**: Mobile-first approach with Tailwind.

## Technical Implementations
- **AI-powered Features**: Socratic Argument Architect, Intelligent Repertoire Explorer, personalized structure creators, AI essay generation, AI chat, and professional essay correction with competency analysis.
- **Rate Limiting**: Comprehensive AI feature rate limiting over 3-day periods to manage costs.
- **Responsive Modals**: Fully responsive modal dialogs.
- **Admin Navigation**: Enhanced navigation for administrative materials.
- **Replit Environment**: Configured for Replit hosting, workflow, and deployment.
- **Profile Management**: User profile update functionality with Brazilian phone validation and database persistence.
- **Competency Analysis**: "Pontos a Melhorar" feature displaying dynamic competency cards based on real user essay data and average scores, identifying top 3 weakest competencies.
- **Dynamic Goal Management**: Smart goal setting system that shows empty state when no target is defined (similar to weekly goals), prompts users to set their target score, and displays progress with distance to goal once defined. Fully connected to the database.
- **User Score Tracking**: Complete system for tracking user scores from multiple sources (simulations, essays, manual entries). Includes database table, API endpoints, and dashboard visualization with real-time data fetching. Features manual score entry dialog for external exam results with competency breakdown.
- **Save to Library Feature**: Users can save modified texts from the Writing Controller (Controlador de Escrita) to their personal library with custom titles. Saved texts are displayed in the Biblioteca page with filtering, viewing, copying, and deletion capabilities.

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
- **memorystore**: In-memory session store (active in development).
- **connect-pg-simple**: PostgreSQL session store (installed, to be used in production).

## Validation and Form Handling
- **zod**: Schema validation.
- **@hookform/resolvers**: Resolver for React Hook Form.

## Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay.
- **@replit/vite-plugin-cartographer**: Replit workspace integration.

# Replit Environment Setup

## Database
- **PostgreSQL Database**: Provisioned via Replit's built-in database service (Neon)
- **Schema Migration**: Successfully pushed using `npm run db:push`
- **Connection**: Automatically configured via `DATABASE_URL` environment variable
- **Driver**: node-postgres (`pg`) with SSL support
- **SSL Configuration**: Uses `ssl: { rejectUnauthorized: false }` for Replit's self-signed certificates
- **Session Storage**: MemoryStore (in-memory) for development; must migrate to PgStore for production deployment
- **⚠️ Production Note**: SSL verification is disabled for Replit compatibility. Before production deployment:
  1. Re-enable SSL certificate verification with proper trust configuration
  2. Migrate session storage from MemoryStore to PgStore for persistence across instances
  3. Configure proper SSL certificates for DATABASE_URL connection

## Workflow Configuration
- **Workflow Name**: "Start application"
- **Command**: `npm run dev`
- **Port**: 5000 (frontend and backend on same port)
- **Host**: 0.0.0.0 (configured in vite.config.ts)
- **Proxy Configuration**: `allowedHosts: true` enabled in Vite config for Replit's iframe preview

## Deployment Configuration
- **Deployment Type**: Autoscale (stateless web app)
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

## Optional Environment Variables
The following API keys are optional and will use fallback modes if not configured:
- **GEMINI_API_KEY**: For AI-powered features (text modification, analysis, etc.)
- **STRIPE_SECRET_KEY**: For payment processing features
- **STRIPE_WEBHOOK_SECRET**: For Stripe webhook verification
- **SENDGRID_API_KEY**: For email functionality
- **SESSION_SECRET**: Auto-generated in development, required in production

## Application Status
✅ **Successfully imported from GitHub and configured for Replit (Oct 3, 2025)**
✅ Frontend running on port 5000 with Vite dev server
✅ Backend API running on same port (Express)
✅ Database provisioned and schema initialized (Replit PostgreSQL via Neon)
✅ All database tables created successfully using `npm run db:push`
✅ Database connection working with pg driver
✅ User registration and authentication fully operational
✅ All core functionality operational (auth, routing, UI components)
✅ Sessions working with MemoryStore (acceptable for single-instance Replit development)
✅ Deployment configured (autoscale mode with build and start commands)
✅ Workflow configured with webview output type and port 5000
✅ Host configuration set to 0.0.0.0 with allowedHosts enabled
✅ Schedule (cronograma) saving fixed - now properly saves to database with date conversion
✅ **GitHub Import Setup Complete** - All dependencies installed, database initialized, server running, frontend accessible
✅ SESSION_SECRET configured (secure authentication enabled)
⚠️ AI features in fallback mode (GEMINI_API_KEY not configured - optional)
⚠️ Payment features disabled (STRIPE_SECRET_KEY not configured - optional)
⚠️ Sessions in-memory only (must migrate to PgStore before production)

## Recent Changes (Oct 4, 2025)

### Fresh GitHub Import - Replit Environment Setup Complete (Oct 4, 2025 - 7:02 PM)
- **Status**: ✅ Fresh clone from GitHub successfully set up and running in Replit environment
- **Import Setup Actions**:
  - ✅ Node.js 20 module verified (nodejs-20)
  - ✅ All npm dependencies already installed (570 packages)
  - ✅ PostgreSQL database already provisioned with DATABASE_URL configured
  - ✅ Database schema pushed successfully using `npm run db:push`
  - ✅ Workflow configured with webview output type on port 5000
  - ✅ Frontend running successfully with Vite dev server on 0.0.0.0:5000
  - ✅ Backend API operational on Express (same port)
  - ✅ Database connection verified (DATABASE_URL and SESSION_SECRET exist)
  - ✅ Deployment configuration verified (autoscale with build and start commands)
  - ✅ Production build tested successfully (`npm run build` - 31.13s, 2MB bundle)
  - ✅ Landing page rendering correctly with DissertIA branding
  - ✅ Vite HMR (Hot Module Replacement) working perfectly
  - ✅ Host configuration confirmed: 0.0.0.0 with allowedHosts: true for Replit proxy
  - ✅ All database tables created and schema synchronized
- **Current Status**:
  - ✅ Server running on port 5000 (single process for frontend + backend)
  - ✅ All routes functional (auth, API endpoints, static assets)
  - ✅ Database tables created and ready
  - ✅ Application fully functional and ready to use
  - ✅ .gitignore properly configured (node_modules, dist, .env, etc.)
  - ✅ Deployment ready for publishing (autoscale mode configured)
  - ✅ Build process optimized and working (vite build + esbuild)
  - ⚠️ Optional API keys in fallback mode (GEMINI_API_KEY, STRIPE_SECRET_KEY, SENDGRID_API_KEY - optional for AI/payment/email features)
  - ⚠️ Sessions using MemoryStore (acceptable for development, consider PgStore for production)
- **Verified Working Features**:
  - Landing page with DissertIA branding and hero section
  - Navigation and routing system (Início, Funcionalidades, Planos, Sobre)
  - Database connection and schema initialization
  - Session management with secure cookies
  - Authentication system ready (registration/login endpoints)
  - User registration successfully tested (user created in database)
  - All API endpoints responding correctly
  
### GitHub Import Setup Complete (Oct 3, 2025 - 8:09 AM)
- **Status**: ✅ Successfully imported from GitHub and fully configured for Replit environment
- **Setup Actions Completed**:
  - ✅ All npm dependencies installed successfully
  - ✅ Database schema pushed successfully using `npm run db:push`
  - ✅ Workflow configured with webview output type on port 5000
  - ✅ Frontend running successfully with Vite dev server
  - ✅ Backend API operational on Express
  - ✅ Database connection verified with PostgreSQL (DATABASE_URL secret configured)
  - ✅ Authentication working - user registration and login tested and operational
  - ✅ All API endpoints functional (user-progress, goals, competencies, simulations, etc.)
  - ✅ Deployment configured for autoscale mode with build and start commands
  - ✅ Security fix applied to drizzle.config.ts to prevent DATABASE_URL exposure
  - ✅ Build process tested and verified successful
- **Configuration Details**:
  - Frontend and backend both run on port 5000 (single process)
  - Host set to 0.0.0.0 with allowedHosts enabled for Replit proxy
  - Sessions using MemoryStore (development mode) with SESSION_SECRET configured
  - SSL configured for Replit's PostgreSQL certificates
  - Vite HMR (Hot Module Replacement) working correctly
- **Environment Variables Configured**:
  - ✅ DATABASE_URL - PostgreSQL connection (secret exists)
  - ✅ SESSION_SECRET - Session authentication (secret exists)
  - ⚠️ GEMINI_API_KEY - AI features in fallback mode (optional)
  - ⚠️ STRIPE_SECRET_KEY - Payment features disabled (optional)
  - ⚠️ SENDGRID_API_KEY - Email features disabled (optional)
- **Tested Functionality**:
  - ✅ User registration successful
  - ✅ User login successful  
  - ✅ Database persistence working
  - ✅ Frontend rendering correctly
  - ✅ API routes responding properly

### Schedule (Cronograma) Feature Fix
- **Fixed**: Schedule saving error where `weekStart` field was receiving string instead of date
- **Solution**: 
  - Updated `insertUserScheduleSchema` in `shared/schema.ts` to use `z.coerce.date()` for automatic string-to-date conversion
  - Implemented proper API integration in `client/src/pages/schedule-editor.tsx` using `useMutation` and `apiRequest`
  - Added data transformation to convert UI format to database format (day names, duration parsing, weekStart calculation)
  - Added loading states and toast notifications for better UX
- **Pattern**: Now follows the same pattern as the goals (metas) feature for consistency

### Save to Library Feature Implementation (Oct 3, 2025 - 8:26 AM)
- **Status**: ✅ Complete implementation of save-to-library functionality for modified texts
- **Database Schema**:
  - Created `saved_texts` table in `shared/schema.ts` with fields: id, userId, title, originalText, modifiedText, modificationType, activeModifications, createdAt
  - Successfully pushed to database using `npm run db:push`
- **Backend Implementation**:
  - Added CRUD methods in `server/storage.ts`: `createSavedText`, `getUserSavedTexts`, `deleteSavedText`
  - Created REST API endpoints in `server/routes.ts`:
    - POST /api/saved-texts (save text with title)
    - GET /api/saved-texts (list user's saved texts)
    - DELETE /api/saved-texts/:id (delete saved text)
  - Fixed bug in `deleteSavedText` to return false when no rows deleted (was always returning true)
- **Frontend Implementation**:
  - Added save dialog in `client/src/pages/controlador-escrita.tsx` with title input
  - Integrated mutation hook for saving texts to API
  - Modified `client/src/pages/biblioteca.tsx` to display saved texts:
    - Added "Textos Modificados" category with cyan color scheme
    - Integrated saved texts into library grid and filtering system
    - Added view, copy, and delete functionality for saved texts
- **Testing**: Requires user authentication; all components verified and ready for end-to-end testing