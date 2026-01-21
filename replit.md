# Hyper Local AI - Market Analysis Platform

## Overview

This is a full-stack web application that generates AI-powered hyperlocal market analysis reports for businesses. Users enter a business address and type, and the system uses OpenAI's GPT-4o to generate comprehensive market insights including TAM/SAM/SOM analysis, demographics, psychographics, weather impact, and traffic patterns. Reports are stored in PostgreSQL and can be viewed, downloaded as PDFs, and accessed from a history page.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode by default
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Charts**: Recharts for data visualization (pie charts, bar charts)
- **Animations**: Framer Motion for smooth transitions
- **Maps**: Google Maps API integration with Places Autocomplete for address input
- **PDF Export**: jsPDF with html2canvas for report downloads

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: Custom build script using esbuild for server bundling, Vite for client
- **API Design**: RESTful endpoints under `/api/` prefix
- **AI Integration**: OpenAI GPT-4o via Replit AI Integrations proxy

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - single source of truth for database schema
- **Migration Tool**: Drizzle Kit with `db:push` command
- **Data Model**: Single `analysis_reports` table storing report metadata and JSON analysis data

### Project Structure
```
├── client/           # React frontend (Vite)
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Route pages
│       └── lib/          # Utilities
├── server/           # Express backend
│   ├── index.ts      # Entry point
│   ├── routes.ts     # API routes
│   ├── storage.ts    # Database operations
│   ├── openai.ts     # AI integration
│   └── db.ts         # Database connection
├── shared/           # Shared types and schema
│   ├── schema.ts     # Drizzle schema + Zod validation
│   └── routes.ts     # API route definitions
└── migrations/       # Database migrations
```

### Key Design Patterns
- **Shared Schema**: TypeScript types derived from Drizzle schema using `$inferSelect` and `$inferInsert`
- **Zod Validation**: Used for both API input validation and runtime type checking
- **Type-Safe API**: Route definitions in `shared/routes.ts` ensure frontend/backend contract consistency
- **Custom Hooks**: Data fetching logic encapsulated in `use-reports.ts` hook

## External Dependencies

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned by Replit)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key via Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Replit AI proxy base URL
- `VITE_GOOGLE_API_KEY` - Google Maps API key for Places Autocomplete

### Third-Party Services
- **OpenAI API**: GPT-4o model for market analysis generation (proxied through Replit)
- **Google Maps Platform**: Places API for address autocomplete
- **PostgreSQL**: Primary database (Replit-provisioned)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Server state management
- `@react-google-maps/api` - Google Maps React wrapper
- `framer-motion` - Animation library
- `recharts` - Chart components
- `jspdf` / `html2canvas` - PDF generation
- `zod` - Schema validation

### Replit Integrations
The project includes pre-built integration utilities in `server/replit_integrations/` and `client/replit_integrations/`:
- Audio/Voice chat capabilities
- Image generation
- Chat storage
- Batch processing utilities

These are optional add-ons and not currently used by the main application flow.