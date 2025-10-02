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

# External Dependencies

## Core Frameworks
- **@neondatabase/serverless**: PostgreSQL connection.
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
- **connect-pg-simple**: PostgreSQL session store (planned).

## Validation and Form Handling
- **zod**: Schema validation.
- **@hookform/resolvers**: Resolver for React Hook Form.

## Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay.
- **@replit/vite-plugin-cartographer**: Replit workspace integration.

# Replit Environment Setup

## Database
- **PostgreSQL Database**: Provisioned via Replit's built-in database service
- **Schema Migration**: Successfully pushed using `npm run db:push`
- **Connection**: Automatically configured via `DATABASE_URL` environment variable

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
✅ Frontend running on port 5000 with Vite dev server
✅ Backend API running on same port (Express)
✅ Database schema initialized and migrated
✅ All core functionality operational (auth, routing, UI components)
⚠️ AI features in fallback mode (GEMINI_API_KEY not configured)
⚠️ Payment features disabled (STRIPE_SECRET_KEY not configured)