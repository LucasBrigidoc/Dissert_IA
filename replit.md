# Overview

DissertIA is a SaaS educational platform for Brazilian students preparing for entrance exams (vestibulares) and competitive exams (concursos). It uses AI to provide personalized writing assistance, featuring tools like the Socratic Argument Architect, Intelligent Repertoire Explorer, and personalized structure creators. The platform aims to combine AI with pedagogical expertise to revolutionize essay writing, offering a modern "liquid glass" design with a blue-themed color scheme.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack React Query for server state and caching.
- **UI Components**: Design system built on Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with a "liquid glass" aesthetic.
- **Build Tool**: Vite for development and optimized builds.

## Backend
- **Runtime**: Node.js with Express.js for RESTful APIs.
- **Language**: TypeScript for consistency.
- **Database ORM**: Drizzle ORM for type-safe operations.
- **Authentication**: bcrypt for password hashing; session-based authentication is planned.
- **API Design**: RESTful endpoints for user, newsletter, and essay management.

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database.
- **Schema Design**: User-centric with tables for users, progress, and essays.
- **Migration Management**: Drizzle Kit for schema versioning.

## Development
- **Monorepo Structure**: `client/`, `server/`, and `shared/` directories.
- **Shared Code**: Common TypeScript interfaces and Zod schemas.
- **Development Server**: Vite dev server with Express API proxy.
- **Build Process**: Separate client (Vite) and server (esbuild) builds.

## Design System
- **Color Palette**: Custom CSS variables for DissertIA brand colors (dark blue, bright blue, soft gray).
- **Typography**: Inter font family.
- **Component Library**: Consistent UI components.
- **Responsive Design**: Mobile-first approach with Tailwind.

## Technical Implementations
- **AI-powered Features**: Socratic Argument Architect, Intelligent Repertoire Explorer, personalized structure creators, AI-powered essay generation, AI chat, and professional-level essay correction system with competency analysis.
- **Rate Limiting**: Comprehensive AI rate limiting across features (e.g., proposals, essay generation, repertoire search, chat, correction) to control costs while maintaining user experience. Limits are applied over 3-day periods.
- **Responsive Modals**: Fully responsive modal dialogs adapting to various screen sizes.
- **Admin Navigation**: Enhanced navigation for admin materials.
- **Replit Environment**: Project is configured for Replit, including host settings, workflow, and deployment.

# External Dependencies

## Core Frameworks
- **@neondatabase/serverless**: PostgreSQL database connection.
- **@tanstack/react-query**: Server state management.
- **wouter**: Client-side routing.
- **drizzle-orm**: TypeScript ORM for PostgreSQL.

## UI and Design
- **@radix-ui/react-\***: Unstyled, accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Type-safe component variants.
- **clsx**: Conditional CSS class joining.

## Development and Build Tools
- **vite**: Frontend build tool.
- **esbuild**: JavaScript bundler.
- **tsx**: TypeScript execution environment.
- **drizzle-kit**: Database migration tool.

## Authentication and Security
- **bcrypt**: Password hashing.
- **connect-pg-simple**: PostgreSQL session store (planned).

## Validation and Form Handling
- **zod**: Schema declaration and validation.
- **@hookform/resolvers**: Resolver for React Hook Form.

## Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay.
- **@replit/vite-plugin-cartographer**: Replit workspace integration.

# Recent Changes

## September 30, 2025 - Admin Pages Styling Consistency
- Updated admin-coupons page to match standard admin page styling
  - Removed custom dark theme (gradient background, white text)
  - Applied standard theme classes (text-muted-foreground, Card, etc.)
  - Updated all buttons, inputs, and dialogs to use default theme styling
  - Statistics cards now use consistent layout with other admin pages
  - Page now properly adapts to light/dark mode based on system preferences
- All admin pages now have consistent navigation and visual design

## September 30, 2025 - Fresh GitHub Clone Setup Complete - VERIFIED WORKING
- Successfully set up fresh GitHub clone in Replit environment
- Verified all dependencies installed correctly via npm
- Workflow configured: "Start application" runs `npm run dev` on port 5000 with webview output
- Deployment configured for autoscale with build and start commands
- PostgreSQL database connected via Neon (DATABASE_URL configured)
- Database schema successfully pushed using `npm run db:push`
- Application running successfully on port 5000
- Frontend properly configured with host 0.0.0.0 and allowedHosts: true for Replit proxy
- Routing verified: Landing page (/), Functionalities page (/functionalities), and all routes working correctly
- Vite HMR (Hot Module Replacement) connected and working
- Browser console showing clean Vite connection
- Application gracefully handles missing optional API keys:
  - GEMINI_API_KEY - AI text modification features use fallback mode when not set
  - SENDGRID_API_KEY - Email features require configuration
  - STRIPE_SECRET_KEY - Payment features disabled when not set
- All integrations configured: database, Gemini, SendGrid, and Stripe
- Build and production deployment ready with optimized builds