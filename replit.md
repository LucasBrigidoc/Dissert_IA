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
- **Schema Design**: User-centric with tables for users, progress, and essays, including ENEM competency fields (competence1-5, feedback1-5).
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
- **Rate Limiting**: Comprehensive AI feature rate limiting over 3-day periods to manage costs.
- **Responsive Modals**: Fully responsive modal dialogs.
- **Admin Navigation**: Enhanced navigation for administrative materials.
- **Replit Environment**: Configured for Replit hosting, workflow, and deployment.
- **Profile Management**: User profile update functionality with Brazilian phone validation and database persistence.
- **Competency Analysis**: "Pontos a Melhorar" feature displaying dynamic competency cards based on real user essay data and average scores, identifying top 3 weakest competencies.

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