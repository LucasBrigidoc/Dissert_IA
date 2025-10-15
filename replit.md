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