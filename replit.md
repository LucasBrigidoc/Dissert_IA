# Overview

DissertIA is an AI-powered SaaS educational platform for Brazilian students preparing for entrance and competitive exams. Its core purpose is to revolutionize essay writing education through personalized AI assistance. Key capabilities include the Socratic Argument Architect, Intelligent Repertoire Explorer, and custom essay structure creators. The platform aims to integrate advanced AI with pedagogical expertise, featuring a modern "liquid glass" design with a blue aesthetic, targeting significant market potential in the Brazilian educational sector.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
- **Aesthetic**: "Liquid glass" design with a blue color scheme.
- **Color Palette**: Custom CSS variables for DissertIA brand colors (dark blue, bright blue, soft gray).
- **Typography**: Inter font family.
- **Responsiveness**: Mobile-first approach.

## Technical Implementations
- **AI-powered Features**: Includes Refinamento de Ideias (Socratic Argument Architect), Intelligent Repertoire Explorer (with auto-generation on no results), personalized structure creators, AI essay generation, AI chat with pedagogical guidance (managed conversation flow), structured JSON data extraction for real-time updates, and professional essay correction with competency analysis ("Pontos a Melhorar"). OCR image-to-text for handwritten essays.
- **User Management**: Profile updates, dynamic goal management, score tracking, "Save to Library" feature, and an admin user management system with bulk deletion and real-time search.
- **Subscription Management**: Automatic lifecycle management (free, monthly, annual) integrated with Stripe, including immediate cancellation and plan management for Pro users. Dual cost tracking for AI operations.
- **Security**: bcrypt for password hashing, session-based authentication, role-based access control for admin, and a complete email-based password recovery system with secure token handling.
- **Content Management**: Admin blog system with full CRUD, WYSIWYG editor, SEO management, categories, and public display.
- **User Experience**: Rate limiting for AI features, subscription prompt system for free users, mobile-optimized repertoire display, simulator information cards, unique outline title enforcement, dynamic text length control, paragraph type selector (Introdução, Desenvolvimento 1, Desenvolvimento 2, Conclusão), and library file limits for free-tier users.
- **Public Pages**: Comprehensive public support pages including Help Center, FAQ, Privacy Policy (LGPD compliant), and Terms of Service.

## System Design Choices
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack React Query for state, Radix UI/shadcn/ui for components, Tailwind CSS for styling, and Vite for building.
- **Backend**: Node.js with Express.js, TypeScript, RESTful APIs.
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM for schema management, and Drizzle Kit for migrations. User-centric schema design.
- **Development**: Monorepo structure (`client/`, `server/`, `shared/`) with shared TypeScript interfaces and Zod schemas.

# External Dependencies

- **Google Gemini API**: For all AI-powered features (Socratic Argument Architect, Repertoire Explorer, essay generation, chat, OCR).
- **Stripe**: For payment processing, subscription management, and webhooks.
- **SendGrid**: For email functionalities, particularly password recovery.
- **PostgreSQL (via Neon Database)**: Primary database for all application data and session storage.
- **@tanstack/react-query**: Server state management in the frontend.
- **wouter**: Client-side routing.
- **drizzle-orm**: TypeScript ORM for PostgreSQL.
- **@radix-ui/react-\*** and **shadcn/ui**: UI component primitives.
- **tailwindcss**: CSS framework.
- **bcrypt**: Password hashing.
- **connect-pg-simple**: PostgreSQL session store.
- **zod**: Schema validation.
- **vite**: Frontend build tool.