# Overview

DissertIA is an AI-powered SaaS educational platform designed for Brazilian students preparing for entrance and competitive exams. Its primary purpose is to revolutionize essay writing education through personalized AI assistance. Key capabilities include the Socratic Argument Architect, Intelligent Repertoire Explorer, and custom essay structure creators. The platform aims to integrate advanced AI with pedagogical expertise, featuring a modern "liquid glass" design with a blue aesthetic. The project envisions significant market potential by addressing the specific needs of Brazilian students in a rapidly evolving educational landscape.

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
- **Authentication**: bcrypt for password hashing; session-based authentication (PostgreSQL for persistence).
- **API Design**: RESTful endpoints.

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database.
- **Storage Implementation**: DbStorage class with Drizzle ORM.
- **Schema Design**: User-centric with tables for users, progress, essays, ENEM competency fields, structures, materials, subscription plans, and analytics.
- **Migration Management**: Drizzle Kit.

## Development
- **Monorepo Structure**: `client/`, `server/`, and `shared/` directories.
- **Shared Code**: Common TypeScript interfaces and Zod schemas.

## Design System
- **Color Palette**: Custom CSS variables for DissertIA brand colors (dark blue, bright blue, soft gray).
- **Typography**: Inter font family.
- **Responsive Design**: Mobile-first approach with Tailwind.

## Technical Implementations
- **AI-powered Features**: Socratic Argument Architect, Intelligent Repertoire Explorer, personalized structure creators, AI essay generation, AI chat (with enhanced pedagogical guidance), and professional essay correction with competency analysis.
- **Rate Limiting**: Comprehensive AI feature rate limiting to manage costs based on subscription plans (Free, Pro Monthly, Pro Yearly).
- **Profile Management**: User profile update with Brazilian phone validation.
- **Competency Analysis**: "Pontos a Melhorar" feature displaying dynamic competency cards based on user essay data.
- **Dynamic Goal Management**: Smart goal setting system for target scores.
- **User Score Tracking**: System for tracking user scores from various sources, with dashboard visualization and manual entry.
- **Save to Library Feature**: Users can save modified texts from the Writing Controller to a personal library.
- **Subscription Management**: Automatic user subscription lifecycle management (default to free, automatic upgrades via Stripe webhooks, automatic downgrades for expired subscriptions) with persistent session storage in PostgreSQL.
- **Stripe Integration**: Uses pre-configured Stripe Price IDs for monthly and annual plans.
- **Database Auto-Initialization**: Automatic creation of subscription plans on first server start via db-init.ts.
- **Admin Access Control**: Role-based access control (RBAC) system with isAdmin field in users table. Backend protected with requireAdmin middleware on all admin routes. Frontend protected with useAdminCheck hook on all admin pages (dashboard, newsletter, coupons, materials).
- **User Management System**: Admin dashboard with separate tabs for "Usuários" (user management) and "Administradores" (admin management). Multi-select functionality with checkboxes allows bulk deletion of user accounts. Endpoint POST /api/admin/users/delete-multiple safely deletes multiple users with transaction-based cascading deletion, preventing admins from deleting their own accounts. Both tabs feature real-time search filtering by name, email, phone, and plan with results counter and clear button.
- **Subscription Prompt System**: Popup dialog displayed to free-tier users after signup and every login, encouraging upgrade to Pro plan. Uses useEffect-based state management to react to authentication changes, ensuring correct display timing. Dialog presents Pro benefits and offers choices to upgrade or continue with free plan.
- **Intelligent Repertoire Generation**: Automatic AI-powered repertoire generation when search returns no results. System detects empty search results and automatically triggers Gemini API to create relevant repertoires based on search query and filters. Features visual loading state with Sparkles icon and "Gerando repertórios personalizados..." message. Smart flag management prevents infinite loops and allows manual retries. Robust JSON parsing with recovery logic handles truncated Gemini responses by preserving complete objects and ensuring proper array closure.
- **Mobile-Optimized Repertoire Display**: Expandable description feature for repertoire cards on mobile devices. Long descriptions (>90 chars) show truncated text with "Ver mais"/"Ver menos" toggle button, allowing users to read full content without overwhelming small screens.
- **Simulator Information Card**: Informational card on simulator page guides users to track their evolution via Dashboard and reminds them that all simulation data is automatically saved to their Personal Library.
- **Plan Management System**: Pro users (monthly and annual) have access to "Gerenciar Plano" button replacing individual upgrade/cancel buttons. Centralized dialog provides cancellation option for all Pro users and upgrade to annual option exclusively for monthly subscribers. System correctly identifies paid plans via priceMonthly or priceYearly validation, ensuring proper access control.

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
- **connect-pg-simple**: PostgreSQL session store.

## Validation and Form Handling
- **zod**: Schema validation.
- **@hookform/resolvers**: Resolver for React Hook Form.

## Third-Party Services / APIs
- **Google Gemini API**: For AI-powered features.
- **Stripe**: For payment processing and subscription management.
- **SendGrid**: For email functionality.

## Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay.
- **@replit/vite-plugin-cartographer**: Replit workspace integration.