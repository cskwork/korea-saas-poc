<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions

One Next.js 16 app hosts ten product modules ("POCs") plus a hub, deployed as a single Vercel project.
`docs/ARCHITECTURE.md` explains the why; this file is the rulebook.

## Layout

```
src/
  app/                    # routes only — thin files that call module code
    page.tsx              # hub (catalogue of modules)
    <slug>/               # one route tree per module
    api/                  # health check, cron
  core/                   # platform: env, db, workspace (tenant), modules, ai, actions, format
  pocs/                   # product modules (feature slices)
    slugs.ts registry.ts  # catalogue
    <slug>/
      meta.ts             # catalogue card (name, tagline, accent…)
      module.ts           # defineModule({ id, schema, seed })
      db/schema.ts        # pgSchema("<slug_with_underscores>") + tables
      db/seed.ts          # demo data for a new workspace
      domain/             # pure business logic + unit tests
      server/queries.ts   # "server-only" reads
      server/actions.ts   # "use server" mutations
      components/         # UI + CSS Modules
      PRODUCT.md DESIGN.md .impeccable/   # design context (impeccable)
drizzle/                  # generated SQL migrations for the platform + OPEN modules (never hand-edit)
```

## Rules

- **Modules are independent.** A module imports `@/core/*` and its own files, never another module.
  `src/core` never imports module internals.
- **Routes are thin.** `src/app/<slug>/**` files fetch through `server/queries.ts` and render module components.
- **Tenancy is not optional.** Every module table has
  `workspaceId: uuid().notNull().references(() => workspaces.id, { onDelete: "cascade" })`.
  Every read filters by it, every write sets it, every update/delete matches `id` **and** `workspaceId`.
  Get both from `getModuleContext(module)`; never accept a workspace id from the client.
  Intra-module foreign keys use `onDelete: "cascade"` (or `"set null"`), so reset can delete in any order.
- **Schema.** Tables live in the module's own Postgres schema: `export const s = pgSchema("smart_store")`,
  `s.table(...)`, `s.enum(...)`. Columns are camelCase in TS (stored snake_case). Money is integer won.
  Instants are `timestamp({ withTimezone: true })`; calendar days are `date({ mode: "string" })`. Ids are `uuid().primaryKey().defaultRandom()`.
- **Mutations** are server actions built with `formAction` / `action` from `@/core/actions` (zod-validated,
  return `ActionState`, throw `UserError` for expected failures), followed by `revalidatePath("/<slug>", "layout")`.
- **AI** goes through `generateObject` / `generateText` from `@/core/ai` with a deterministic Korean `fallback`.
  It works with or without `ANTHROPIC_API_KEY`; show `source` honestly in the UI. Routes that call AI export `maxDuration = 60`.
- **Styling.** CSS Modules only (no Tailwind, no global CSS from modules). Tokens are custom properties on the
  module's root class. Page background/scrollbar/selection may be themed with `:global(html):has(.root) { … }`.
  Fonts via `next/font` in the module. Icons from `lucide-react` or authored SVG — never emoji as UI icons.
  Pretendard Variable is loaded globally.
- **Formatting** with `@/core/format` (KRW, Asia/Seoul dates). Copy is Korean.
- **Links.** Inside a module use `next/link`; links to the hub or another module use a plain `<a>` (full load isolates module CSS).
- **Shipping a module**: add its slug to `OPEN_MODULE_SLUGS` (src/pocs/slugs.ts) and run `npm run db:generate`.
  Migrations, hub links, sitemap, legacy redirects and e2e smoke tests all follow that list.
- **Tests** sit next to code as `*.test.ts`. Domain logic gets unit tests; seeds and key queries/mutations get an
  integration test on `createTestDatabase(schema)` from `@/core/testing/database` (in-memory PGlite).

## Commands

```
npm run dev          # http://localhost:3000 (PGlite in .data/ unless DATABASE_URL is set)
npm run check        # lint + typecheck + tests
npm run db:generate  # after schema changes: writes a migration to /drizzle
npm run db:migrate   # applies migrations (DATABASE_URL or local PGlite)
DRIZZLE_MODULE=<slug> npm run db:push   # sync one module's schema to a dev database
```
