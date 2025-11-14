# Flowmo Web - AI Coding Agent Instructions

## Project Overview

**Flowmo-web** is a Next.js 16 full-stack application with SQLite database integration via Prisma ORM. The project uses TypeScript, Tailwind CSS (v4), and modern React patterns with the App Router.

- **Tech Stack**: Next.js 16, React 19, Prisma 6, SQLite, TypeScript 5, Tailwind CSS 4
- **Node Version**: Requires Node.js with npm support (see `package.json` for engine constraints)

## Architecture & Data Flow

### Directory Structure

```
app/                      # Next.js App Router (layouts, pages, API routes)
  ├── layout.tsx         # Root layout with metadata and font setup
  ├── page.tsx           # Home page component
  └── globals.css        # Global styles with Tailwind directives
prisma/                  # Database schema and migrations
  ├── schema.prisma      # Data model definitions
  └── migrations/        # Auto-generated migration files
public/                  # Static assets (images, SVG, etc.)
```

### Database & ORM

- **Provider**: SQLite (configured in `prisma/schema.prisma`)
- **Prisma Client**: Generated to `app/generated/prisma` (see `.gitignore` - never commit generated files)
- **Configuration**: `prisma.config.ts` defines schema location and migrations path
- **Environment**: `DATABASE_URL` env var sets the SQLite file location

**When modifying the schema:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>` to create and apply migration
3. Prisma Client is auto-generated - no manual regeneration needed

### Component & Styling Patterns

- **CSS**: Tailwind CSS v4 via `@tailwindcss/postcss` - use utility classes directly in JSX
- **Fonts**: Geist (sans) and Geist Mono loaded via `next/font/google` in `app/layout.tsx`
- **Dark Mode**: `dark:` prefix classes supported (see `app/page.tsx` for examples)
- **No CSS Modules**: Global styles in `app/globals.css` and inline Tailwind utilities only

## Build & Development Workflows

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server at `http://localhost:3000` with HMR |
| `npm run build` | Production build (outputs to `.next/`) |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint checks (uses Next.js + TypeScript configs) |

### Development Workflow

1. **Start dev server**: `npm run dev`
2. **Edit files**: Changes to `app/**` auto-reload in browser (App Router hot module replacement)
3. **Type checking**: Run inline via IDE or `npx tsc --noEmit` before commit
4. **Linting**: `npm run lint` validates ESLint rules from `eslint-config-next`

### Type Paths

Use `@/*` alias for imports (configured in `tsconfig.json`):
```typescript
// ✅ Correct
import { Component } from "@/app/components/Component";

// ❌ Avoid relative imports for cross-directory code
import { Component } from "../../../app/components/Component";
```

## Code Conventions & Patterns

### TypeScript & React

- **Strict Mode**: Enabled in `tsconfig.json` - handle all types explicitly
- **Components**: Use functional components with `React.ReactNode` for children
- **Metadata**: Export `const metadata: Metadata` from layout files (see `app/layout.tsx`)
- **Images**: Use `next/image` component for optimization (never raw `<img />`)
- **Fonts**: Import from `next/font/google` and apply via CSS variables (see root layout)

### ESLint Configuration

- **Config**: `eslint.config.mjs` (ESLint v9 flat config)
- **Rules**: Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- **Ignore**: `.next/`, `build/`, `next-env.d.ts` (checked in config, not `.eslintignore`)

**Before committing:** Run `npm run lint` to catch violations early.

### Prisma Schema Patterns

- **Custom Output**: Generated client outputs to `app/generated/prisma` (non-standard location)
- **Models**: Define all data models in single `schema.prisma` file
- **Relations**: Use Prisma relation syntax for 1:1, 1:N, N:N relationships
- **Example**:
  ```prisma
  model User {
    id    Int     @id @default(autoincrement())
    email String  @unique
    name  String?
  }
  ```

## Environment & Dependencies

### Critical Dependencies

- **@prisma/client**: Generates database ORM client (auto on `npm install`)
- **@tailwindcss/postcss**: Tailwind v4 beta with new `@import` syntax
- **next**: Framework handles routing, SSR, optimization
- **typescript**: Strict type checking (v5 required)

### Setup

1. Install dependencies: `npm install`
2. Configure `.env` with `DATABASE_URL` (e.g., `DATABASE_URL="file:./dev.db"`)
3. Initialize database: `npx prisma migrate dev` (creates schema if not exists)
4. Start dev server: `npm run dev`

## Testing & Debugging

- **No test framework configured**: Add Jest/Vitest if needed (update `package.json` and create `jest.config.js`)
- **Type Checking**: Use IDE type checking + `npx tsc --noEmit` CLI check
- **Browser DevTools**: Next.js exposes source maps in dev mode for stepping through compiled code
- **Prisma Studio**: `npx prisma studio` opens visual database browser

## Known Limitations & TODOs

- Database file location not yet defined in `.env` (set `DATABASE_URL` before first migration)
- No API routes implemented yet (create `app/api/**` routes as needed)
- Prisma Client custom output directory (`app/generated/prisma`) requires manual imports - may need path alias

## Integration Points

- **Database Queries**: Import Prisma client from auto-generated location, initialize in server components or API routes
- **API Communication**: Use `fetch()` in client components or `/api` route handlers (Next.js automatically proxies)
- **External Services**: Environment variables in `.env` (not version controlled)

## When Modifying Code

1. **Database schema changes**: Edit `prisma/schema.prisma` → run migration → restart dev server
2. **New pages/routes**: Create `.tsx` files in `app/` directory (file-based routing)
3. **API endpoints**: Create `app/api/[route].ts` route handlers
4. **Styling**: Add Tailwind utilities to JSX or update `app/globals.css` for global rules
5. **Type issues**: Check strict `tsconfig.json` - avoid `any` types, use proper inference or generics

---

*Last updated: November 2025 | Tech Stack: Next.js 16, Prisma 6, Tailwind CSS 4*
