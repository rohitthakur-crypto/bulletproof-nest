# ManyChat Clone — Backend

Enterprise-grade NestJS backend built with Fastify, Prisma, PostgreSQL, Redis, BullMQ, and Firebase.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Environment Variables](#environment-variables)
- [All Scripts — Complete Reference](#all-scripts--complete-reference)
  - [Start / Run](#start--run)
  - [Build](#build)
  - [Code Quality](#code-quality)
  - [Testing](#testing)
  - [Full Check Suite](#full-check-suite)
  - [Database (Prisma)](#database-prisma)
  - [Utilities](#utilities)
- [Workflow Guide by Environment](#workflow-guide-by-environment)
  - [Local Development](#local-development)
  - [Before Every Commit](#before-every-commit)
  - [Before Every Push](#before-every-push)
  - [CI / GitHub Actions](#ci--github-actions)
  - [Production Deployment](#production-deployment)
- [Database Workflow](#database-workflow)
- [Git Hooks — What Runs Automatically](#git-hooks--what-runs-automatically)
- [Architecture Overview](#architecture-overview)

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Framework  | NestJS 11 + Fastify 5                    |
| Language   | TypeScript 5 (strict mode)               |
| ORM        | Prisma 6                                 |
| Database   | PostgreSQL                               |
| Cache      | Redis (ioredis)                          |
| Queue      | BullMQ                                   |
| Auth       | JWT + Passport + Google OAuth + Firebase |
| Validation | Zod + nestjs-zod                         |
| Logging    | Pino + nestjs-pino                       |
| API Docs   | Swagger (OpenAPI)                        |
| Testing    | Jest + Supertest                         |
| Linting    | ESLint + Prettier + typescript-eslint    |
| Git Hooks  | Husky + lint-staged + commitlint         |

---

## Prerequisites

- **Node.js** `>= 24` — check with `node -v`
- **pnpm** `>= 9` — install with `npm i -g pnpm`
- **PostgreSQL** running locally or a connection string
- **Redis** running locally (`redis-server`) or a connection URL
- **Git** configured with SSH key (for pushing)

---

## First-Time Setup

```bash
# 1. Clone and enter the project
git clone git@github.com:your-org/manychat-backend.git
cd manychat-backend

# 2. Install all dependencies
#    This automatically runs `prisma generate` via postinstall
pnpm install

# 3. Copy the example env file and fill in your values
cp .env.example .env

# 4. Apply database migrations (creates all tables)
pnpm db:migrate:dev

# 5. Start the dev server
pnpm start:dev
```

After step 5, the server is at `http://localhost:3000`  
Swagger docs are at `http://localhost:3000/api/docs`

---

## Environment Variables

Create a `.env` file in the project root. All variables are validated on startup — the app will refuse to start if required vars are missing.

```env
# Application
NODE_ENV=development
APP_PORT=3000
APP_PREFIX=api
APP_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/manychat

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Logging
LOG_LEVEL=debug
```

---

## All Scripts — Complete Reference

### Start / Run

```bash
pnpm start           # Start without watch (uses pre-built dist/)
pnpm start:dev       # Start with hot-reload (development)
pnpm start:debug     # Start with hot-reload + Node.js debugger (port 9229)
pnpm start:prod      # Run the compiled production bundle from dist/
```

**When to use:**

| Script        | When                                                          |
| ------------- | ------------------------------------------------------------- |
| `start:dev`   | Every day during local development                            |
| `start:debug` | When you need to attach a debugger (VS Code, Chrome DevTools) |
| `start`       | Rarely — only to quickly verify a pre-existing build          |
| `start:prod`  | On the production server after deployment                     |

---

### Build

```bash
pnpm build           # Clean dist/ → compile TypeScript → resolve path aliases
pnpm build:prod      # Same but sets NODE_ENV=production and runs prisma generate first
```

**What `build` does internally:**

1. `rimraf dist` — wipes old compiled output
2. `nest build` — compiles TypeScript using the NestJS CLI and tsconfig
3. `tsc-alias` — replaces `@/...` path aliases with relative paths in the compiled JS

**What `build:prod` adds:**

- Sets `NODE_ENV=production` so all env-specific code branches correctly
- Runs `prisma generate` first to ensure the Prisma client is up-to-date before building

**When to use:**

| Script       | When                                                |
| ------------ | --------------------------------------------------- |
| `build`      | Locally to verify the build compiles before pushing |
| `build:prod` | In CI/CD pipelines and deployment scripts           |

---

### Code Quality

```bash
pnpm lint            # Check all .ts files for ESLint errors (read-only, no changes)
pnpm lint:fix        # Same but auto-fixes everything that can be auto-fixed
pnpm format          # Auto-format all files with Prettier
pnpm format:check    # Check formatting without changing files (used in CI)
pnpm typecheck       # Run tsc --noEmit — type-check only, no output files
```

**When to use:**

| Script         | When                                                        |
| -------------- | ----------------------------------------------------------- |
| `lint`         | Quickly check if there are any lint issues                  |
| `lint:fix`     | Fix lint issues automatically — run before committing       |
| `format`       | Format code before committing                               |
| `format:check` | In CI to verify code is formatted — fails if it isn't       |
| `typecheck`    | After changing types/interfaces to verify nothing is broken |

> **Note:** `lint-staged` (runs on `git commit`) automatically runs `lint:fix` and `format` on staged files — so you rarely need to run these manually.

---

### Testing

```bash
pnpm test            # Run all unit tests (*.spec.ts files in src/)
pnpm test:watch      # Run unit tests in interactive watch mode
pnpm test:cov        # Run unit tests and generate a coverage report in /coverage
pnpm test:e2e        # Run end-to-end tests (*.e2e-spec.ts files in test/)
pnpm test:e2e:watch  # Run e2e tests in interactive watch mode
pnpm test:ci         # Run unit tests with coverage, in CI mode, serially (no parallel)
```

**How tests are structured:**

```
src/
  modules/
    users/
      users.service.spec.ts    ← unit test (mocked dependencies)
      users.controller.spec.ts ← unit test (mocked dependencies)

test/
  app.e2e-spec.ts              ← e2e test (real HTTP requests against a running app)
```

**What each test mode does:**

| Script           | How it runs                     | Uses real DB? | Use when                                 |
| ---------------- | ------------------------------- | ------------- | ---------------------------------------- |
| `test`           | Parallel by default             | No (mocked)   | During development to verify logic       |
| `test:watch`     | Watches for file changes        | No (mocked)   | TDD — keep it running while writing code |
| `test:cov`       | Parallel, generates HTML report | No (mocked)   | Before PRs to see coverage gaps          |
| `test:e2e`       | Boots the full app              | Yes (test DB) | After features are complete              |
| `test:e2e:watch` | Watches for changes             | Yes (test DB) | TDD for API endpoints                    |
| `test:ci`        | `--ci --runInBand` serial       | No (mocked)   | GitHub Actions / CI pipelines            |

> **`test:ci` flags explained:**
>
> - `--ci` disables interactive mode, fails if snapshots need updating
> - `--runInBand` runs all tests serially in one process — prevents port conflicts in CI environments

---

### Full Check Suite

```bash
pnpm check           # lint → typecheck → test → build  (full local check)
pnpm check:ci        # lint → typecheck → test:ci → build  (for CI pipelines)
pnpm check:quick     # lint → typecheck only  (fast feedback, no tests or build)
```

**What each check runs:**

| Script        | Lint | Typecheck | Tests        | Build | Use when                                    |
| ------------- | ---- | --------- | ------------ | ----- | ------------------------------------------- |
| `check:quick` | ✓    | ✓         | —            | —     | Quick sanity check while coding             |
| `check`       | ✓    | ✓         | ✓ unit       | ✓     | Before pushing (also run by husky pre-push) |
| `check:ci`    | ✓    | ✓         | ✓ + coverage | ✓     | GitHub Actions workflow                     |

**`check` runs automatically** before every `git push` via the husky pre-push hook. If it fails, the push is blocked.

---

### Database (Prisma)

```bash
pnpm db:generate        # Regenerate the Prisma Client from schema.prisma
pnpm db:migrate:dev     # Create a new migration and apply it (dev only — interactive)
pnpm db:migrate:deploy  # Apply all pending migrations (production — no interactive prompts)
pnpm db:migrate:status  # Show which migrations are applied and which are pending
pnpm db:migrate:reset   # DROP all tables, recreate from scratch, reapply all migrations
pnpm db:push            # Push schema changes to DB without creating a migration file
pnpm db:studio          # Open Prisma Studio (visual DB browser) at http://localhost:5555
```

**When to use each:**

| Script              | When                                           | Environment          |
| ------------------- | ---------------------------------------------- | -------------------- |
| `db:generate`       | After any change to `schema.prisma`            | All                  |
| `db:migrate:dev`    | Creating a new migration for a schema change   | Local dev only       |
| `db:migrate:deploy` | Applying pending migrations during deployment  | Staging / Production |
| `db:migrate:status` | Before deploying — verify what will be applied | All                  |
| `db:migrate:reset`  | Starting fresh — wipes ALL data                | Local dev only       |
| `db:push`           | Rapid prototyping without migration history    | Local dev only       |
| `db:studio`         | Inspecting / editing data visually             | Local dev only       |

> **NEVER run `db:migrate:reset` or `db:push` in production.** `reset` destroys all data. `push` bypasses migration history and can cause drift.

---

### Utilities

```bash
pnpm clean           # Delete the dist/ directory
pnpm clean:all       # Delete dist/ and node_modules/ (full reset)
```

**When to use:**

| Script      | When                                                                               |
| ----------- | ---------------------------------------------------------------------------------- |
| `clean`     | When you want to force a full recompile on the next build                          |
| `clean:all` | When switching branches with dependency changes, or debugging weird install issues |

---

## Workflow Guide by Environment

### Local Development

This is your day-to-day workflow:

```bash
# Terminal 1 — keep the dev server running
pnpm start:dev

# Terminal 2 — keep tests running in watch mode while writing code
pnpm test:watch

# When you change schema.prisma
pnpm db:migrate:dev   # creates migration + applies it
# (db:generate runs automatically as part of migrate:dev)

# To inspect your DB visually
pnpm db:studio
```

---

### Before Every Commit

Git's pre-commit hook handles this automatically — you don't need to run anything manually.

**What runs automatically on `git commit`:**

- `lint-staged` runs on your staged files only
  - ESLint auto-fix on `.ts` / `.js` files
  - Prettier auto-format on `.ts`, `.js`, `.json`, `.md` files
- `commitlint` validates your commit message format (Conventional Commits)

**Commit message format** (enforced by commitlint):

```
feat: add OAuth login endpoint
fix: resolve token expiry bug
chore: update dependencies
docs: update README
refactor: extract auth service
test: add coverage for users module
```

If your message doesn't follow this pattern, the commit is rejected.

---

### Before Every Push

Git's pre-push hook handles this automatically.

**What runs automatically on `git push`:**

```bash
pnpm check
# which runs: lint → typecheck → test → build
```

If any step fails, the push is blocked. Fix the issue and push again.

**To run manually before pushing:**

```bash
pnpm check         # full check — same as what husky runs
pnpm check:quick   # faster — just lint + typecheck, skip tests
```

---

### CI / GitHub Actions

Use `check:ci` instead of `check` in your pipeline:

```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run full CI check
  run: pnpm check:ci

- name: Apply migrations (staging)
  run: pnpm db:migrate:deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Why `check:ci` differs from `check`:**

- Uses `test:ci` which adds `--ci` (no interactive) and `--runInBand` (serial execution)
- Serial execution prevents flaky tests caused by port conflicts when Jest spawns workers

---

### Production Deployment

Full deployment sequence:

```bash
# On your production server or in your deploy pipeline:

# 1. Pull latest code
git pull origin main

# 2. Install only production dependencies
pnpm install --prod --frozen-lockfile
# (postinstall automatically runs `prisma generate`)

# 3. Build for production
pnpm build:prod
# (generates prisma client + compiles TypeScript)

# 4. Apply pending database migrations (SAFE — never destroys data)
pnpm db:migrate:deploy

# 5. Start the production server
pnpm start:prod
```

> **Checklist before production deploy:**
>
> - [ ] `pnpm db:migrate:status` — verify which migrations will be applied
> - [ ] All env vars set on the server (see Environment Variables section)
> - [ ] `pnpm check:ci` passed in your CI pipeline

---

## Database Workflow

### Adding a new model or changing schema

```bash
# 1. Edit prisma/schema.prisma

# 2. Create and apply the migration
pnpm db:migrate:dev
# Prisma will ask you to name the migration, e.g. "add_workspace_table"

# 3. The Prisma client is automatically regenerated by migrate:dev
#    But if you only edited schema without migrating, regenerate manually:
pnpm db:generate

# 4. Verify everything looks right
pnpm db:studio
```

### Checking migration status before deploying

```bash
pnpm db:migrate:status
# Shows:
# ✓ 20260522131243_init   (applied)
# ✓ 20260601000000_add_workspace   (applied)
# ○ 20260602000000_add_contacts    (pending — will run on next deploy)
```

### Resetting your local database

```bash
# WARNING: deletes ALL local data
pnpm db:migrate:reset
# Drops DB → recreates → applies all migrations from scratch
```

---

## Git Hooks — What Runs Automatically

| Hook         | Trigger      | What runs                                                    |
| ------------ | ------------ | ------------------------------------------------------------ |
| `pre-commit` | `git commit` | `lint-staged` (lint + format on staged files) + `commitlint` |
| `pre-push`   | `git push`   | `pnpm check` (lint + typecheck + test + build)               |

**These hooks protect you from:**

- Committing code with lint errors
- Committing badly formatted code
- Committing with a non-conventional commit message
- Pushing code that fails TypeScript checks
- Pushing code that breaks tests
- Pushing code that doesn't compile

---

## Architecture Overview

```
src/
├── main.ts                    Entry point — creates Fastify + NestJS app
├── app.module.ts              Root module — wires everything together
│
├── bootstrap/                 App setup pipeline (runs in order on startup)
│   ├── app.bootstrap.ts       Global prefix, API versioning
│   ├── fastify.bootstrap.ts   Helmet, CORS, compression, cookies
│   ├── middleware.bootstrap.ts Request logger middleware
│   ├── logger.bootstrap.ts    Pino structured logger
│   ├── validation.bootstrap.ts Zod global validation pipe
│   ├── interceptor.bootstrap.ts Response envelope, logging, timeout
│   ├── filter.bootstrap.ts    Global exception handler
│   ├── guard.bootstrap.ts     Global auth/role guards
│   └── swagger.bootstrap.ts   OpenAPI docs
│
├── config/                    Typed, validated environment config
│
├── core/                      Cross-cutting concerns (logger, auth interceptors)
│
├── common/                    Shared utilities (decorators, guards, filters, pipes)
│
├── infra/                     External service clients (Prisma, Redis, BullMQ, Firebase)
│
└── modules/                   Feature modules (users, auth, health, etc.)
    └── health/
        ├── controllers/       HTTP endpoints (/health/live, /health/ready, /health/detailed)
        ├── indicators/        Individual health checks (DB, Redis, memory, disk, queue)
        └── services/          Orchestrates health probes and builds response

prisma/
├── schema.prisma              Database schema — source of truth
└── migrations/                Auto-generated SQL migration history
```

**Request lifecycle:**

```
HTTP Request
  → Fastify (receives raw request)
  → NestJS Router (matches route)
  → Guards (auth, roles)
  → Interceptors (timeout → zod serialize → logging → response envelope)
  → Pipe (Zod validation of body/params/query)
  → Controller method
  → Service (business logic)
  → Repository / Prisma (database)
  → Response flows back through interceptors (envelope wrapping)
  → Exception Filter (catches any unhandled errors, formats error envelope)
```
