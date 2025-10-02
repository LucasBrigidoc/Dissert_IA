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

## September 30, 2025 - Complete Rebranding from "Dissert AI" to "Dissert IA"
- Successfully rebranded entire application from "DissertAI" to "DissertIA"
- Updated all visual branding elements (headers, navigation, footers)
- Changed all text references across the application:
  - Navigation component logo
  - Login and signup page headers
  - Footer copyright and branding
  - All page content references
  - Mock data testimonials
  - PDF generation headers and footers
  - Image alt texts
  - CSS comments
- Maintained exact same styling, fonts, colors, and spacing
- All changes applied via hot module reload without downtime
- Visual verification completed with screenshots

## September 30, 2025 - Admin Pages Styling Consistency
- Updated admin-coupons page to match standard admin page styling
  - Removed custom dark theme (gradient background, white text)
  - Applied standard theme classes (text-muted-foreground, Card, etc.)
  - Updated all buttons, inputs, and dialogs to use default theme styling
  - Statistics cards now use consistent layout with other admin pages
  - Page now properly adapts to light/dark mode based on system preferences
- All admin pages now have consistent navigation and visual design

## October 1, 2025 - GitHub Import Setup - VERIFIED WORKING
- Successfully imported and configured GitHub repository in Replit environment
- **Fixed Critical TypeScript Compilation Errors**: Removed duplicate `identifier` variable declarations in server/routes.ts (14 duplicate declarations across multiple route handlers)
- Workflow configured: "Start application" runs `npm run dev` on port 5000 with webview output
- Deployment configured for autoscale with build (`npm run build`) and start (`npm run start`) commands
- PostgreSQL database already provisioned and connected (DATABASE_URL configured)
- Database schema successfully pushed using `npm run db:push`
- Application running successfully on port 5000
- Frontend properly configured with host 0.0.0.0 and allowedHosts: true for Replit proxy (already in vite.config.ts)
- Backend configured to listen on 0.0.0.0:5000 with reusePort enabled (already in server/index.ts)
- Routing verified: Landing page (/), all routes working correctly
- Vite HMR (Hot Module Replacement) connected and working
- Browser console showing clean Vite connection
- Application gracefully handles missing optional API keys:
  - GEMINI_API_KEY - AI text modification features use fallback mode when not set
  - SENDGRID_API_KEY - Email features disabled when not set
  - STRIPE_SECRET_KEY - Payment features disabled when not set
- Required environment variables:
  - DATABASE_URL - PostgreSQL connection (configured via Replit) ✓
  - SESSION_SECRET - Session security (configured via Replit) ✓
- All integrations configured: database, Gemini, SendGrid, and Stripe
- Build and production deployment ready with optimized builds

## October 1, 2025 - Fresh Clone GitHub Import Re-verification
- Re-verified GitHub import setup in fresh Replit clone environment
- Confirmed all existing configurations are intact and working:
  - Workflow "Start application" running successfully on port 5000 with webview output
  - Database connected and schema synchronized (no changes needed)
  - All environment variables properly configured (DATABASE_URL, SESSION_SECRET, PORT)
  - Frontend rendering correctly with Vite HMR connected
  - Backend Express server running on 0.0.0.0:5000
- Fixed deployment configuration: corrected run command from `["npm", "run"]` to `["npm", "run", "start"]`
- Verified landing page displays correctly with DissertIA branding
- No TypeScript/LSP errors detected
- Application fully operational and ready for use

## October 1, 2025 - Profile Update Feature Implementation
- Implemented complete profile update functionality with database persistence:
  - **Backend**: Created `updateUserProfileSchema` in `shared/schema.ts` with Brazilian phone validation (10-11 digits)
  - **API Route**: Added authenticated PUT `/api/users/profile` endpoint with Zod validation in `server/routes.ts`
  - **Storage**: Implemented `updateUser` method in `server/storage.ts` for both MemStorage and DbStorage
  - **Frontend**: Updated Settings page (`client/src/pages/settings.tsx`) to call API and refresh auth context
  - **Phone Field**: Made phone field mandatory in signup with format validation ((XX) XXXXX-XXXX or (XX) XXXX-XXXX)
- Security: Profile update route protected by `requireAuth` middleware
- UX Enhancement: Used `AuthContext.checkAuth()` to refresh user data seamlessly without page reload
- Testing: Verified end-to-end flow from frontend to database persistence
- Code Quality: Architect reviewed and approved implementation with no security issues found

## October 1, 2025 - Fresh GitHub Clone Setup Complete
- Successfully configured fresh clone of GitHub repository in Replit environment
- **Environment Verified**:
  - Node.js 20 runtime configured
  - PostgreSQL database provisioned with DATABASE_URL and SESSION_SECRET
  - Database schema pushed successfully using `npm run db:push`
  - All dependencies installed via npm
- **Workflow Configuration**:
  - "Start application" workflow running `npm run dev` on port 5000 with webview output
  - Frontend served on 0.0.0.0:5000 with allowedHosts: true (already configured in vite.config.ts)
  - Backend Express server listening on 0.0.0.0:5000 with reusePort enabled
- **Deployment Configuration**:
  - Autoscale deployment target configured
  - Build command: `npm run build` (Vite + esbuild)
  - Run command: `npm run start` (production server)
- **Frontend Working**:
  - React + Vite dev server running successfully
  - Vite HMR connected
  - DissertIA landing page rendering correctly
  - All navigation routes functional
- **Backend Working**:
  - Express API server running on port 5000
  - Session management configured with PostgreSQL store
  - Static assets served from /imagem directory
- **Optional API Keys** (gracefully degraded when not set):
  - GEMINI_API_KEY - AI features use fallback mode
  - STRIPE_SECRET_KEY - Payment features disabled
  - SENDGRID_API_KEY - Email features disabled
- **Updated .gitignore**: Added standard Node.js entries (.env files, log files)
- Application fully operational and ready for development

## October 2, 2025 - Fresh GitHub Import Setup - VERIFIED WORKING
- Successfully set up fresh clone of GitHub repository in Replit environment
- **Database Setup**:
  - PostgreSQL database already provisioned (DATABASE_URL and SESSION_SECRET pre-configured)
  - Database schema pushed successfully using `npm run db:push`
  - All tables and relations created without errors
- **Workflow Configuration**:
  - "Start application" workflow configured with `npm run dev` on port 5000
  - Webview output type set for frontend preview
  - Frontend properly configured with host 0.0.0.0 and allowedHosts: true (pre-configured in vite.config.ts)
  - Backend Express server listening on 0.0.0.0:5000 with reusePort enabled
- **Deployment Configuration**:
  - Autoscale deployment target configured for production
  - Build command: `npm run build` (Vite frontend + esbuild backend)
  - Run command: `npm run start` (production server)
- **Application Status**:
  - React + Vite dev server running successfully on port 5000
  - Vite HMR (Hot Module Replacement) connected and working
  - DissertIA landing page rendering correctly with full branding
  - All navigation routes functional (Início, Funcionalidades, Planos, Sobre)
  - Authentication system working (Entrar, Criar Conta buttons)
  - No TypeScript/LSP errors detected
- **API Configuration**:
  - Express API server running on port 5000
  - Session management configured with PostgreSQL store (connect-pg-simple)
  - Static assets served from /imagem directory
  - All API routes registered and functional
- **Environment Variables**:
  - Required: DATABASE_URL ✓, SESSION_SECRET ✓
  - Optional (gracefully degraded): GEMINI_API_KEY (AI fallback mode), STRIPE_SECRET_KEY (payment disabled), SENDGRID_API_KEY (email disabled)
- **Integrations**:
  - javascript_database integration already installed
  - Gemini, SendGrid, and Stripe integrations available but API keys not set
- Application fully operational and ready for development/production deployment