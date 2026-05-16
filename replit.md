# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (no user API key required)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Scaffold (`artifacts/speak-your-lesson`)
- **App name**: Scaffold
- **Type**: React + Vite web app
- **Preview Path**: `/`
- **Purpose**: Helps elementary teachers turn rough spoken/written planning notes into ready-to-teach lesson plans for multilingual learner (ELL) classrooms
- **Font**: Inter (Google Fonts, variable weight 400–700)
- **Colors**: Navy #142550 (primary), Red #C82C39 (accent), Background #F4F6FA
- **Logo**: SVG staircase mark — ascending 3-step outline with baseline, used in nav and as favicon
- **Nav**: White top bar with Scaffold logo + name on the left, tab links on the right (GitHub-style)
- **Typography scale**: App title/section titles font-weight 600, labels 500, body 400

#### Access Gate
- Full-screen code entry shown to first-time visitors each browser session
- Validates against `VALID_ACCESS_CODES` secret (comma-separated, e.g. `SUZHOU,BEIJING`)
- "Explore sample lesson plans" link enters Demo Mode without a code
- Session stored in `sessionStorage` — requires re-entry on new tab/session
- "Change code" / "Demo mode" button in nav top-right lets users switch

#### Lesson Planner (`/`)
- **Features**:
  - Topic/Subject input, Grade Level dropdown (Grade 3–5), WIDA Band dropdown (WIDA 1-2, 2-3, 3-4)
  - Planning notes textarea with 2000-char limit + live counter
  - Privacy reminder: "Please do not include student names or private student information"
  - AI-generated lesson plan with 10 structured sections in card layout
  - Loading state, error handling with cooldown countdown
  - Demo mode shows 2 pre-written sample plans (no API cost)
  - Download PDF via `window.print()`; save to lesson library (localStorage)

#### Classroom Copilot (`/classroom-copilot`)
- **Purpose**: Instant EAL classroom support for live teaching moments
- **Features**:
  - Grade Level dropdown (Grade 2–5), WIDA Level dropdown
  - Text area: "What do your students need help with right now?" — 2000-char limit + live counter
  - Privacy reminder near input
  - 6 output cards: Simple Explanation, Key Vocabulary, Sentence Frames, Quick Activity, Extension Question, Teacher Move
  - "Copy All" button; session history (localStorage)
  - Demo mode shows 2 pre-written sample responses (no API cost)
- **Model**: gpt-5-mini (fast, cost-effective)

## API Server (`artifacts/api-server`)

- **Type**: Express 5 REST API
- **Routes**:
  - `GET /api/healthz` — health check
  - `POST /api/lesson-plan/generate` — generate lesson plan via OpenAI
  - `POST /api/classroom-copilot/generate` — generate quick EAL support via OpenAI
- **AI Integration**: `@workspace/integrations-openai-ai-server` using Replit AI Integrations proxy (no user API key needed)

### Backend Source Layout

```
artifacts/api-server/src/
  app.ts                       Express app setup (middleware, CORS, routing mount)
  index.ts                     Server entry point — reads PORT, starts listening
  config/
    models.ts                  AI model names + token limits (single source of truth)
  lib/
    logger.ts                  Pino logger instance (used via req.log in routes)
    access-codes.ts            Code validation + per-code rate limiting (3/day, 30s cooldown)
    usage-logger.ts            Privacy-safe structured usage logging (no student data)
  routes/
    index.ts                   Mounts all routers under /api
    health.ts                  GET /api/healthz
    lesson-plan.ts             POST /api/lesson-plan/generate
    classroom-copilot.ts       POST /api/classroom-copilot/generate
  services/
    openai.service.ts          callOpenAIForJSON() — shared OpenAI call + JSON parse wrapper
    prompts.ts                 buildLessonPlanPrompt() + buildClassroomSupportPrompt()
```

### Responsibility Boundaries

| Layer | Responsibility |
|---|---|
| **routes/** | Validate HTTP request with Zod; call services; return HTTP response |
| **services/openai.service.ts** | Call OpenAI; extract content; parse JSON; throw safe errors |
| **services/prompts.ts** | Build system + user prompts from validated input |
| **config/models.ts** | Model identifiers and token budgets as named constants |

- **To change prompts**: edit `src/services/prompts.ts` only
- **To change models**: edit `src/config/models.ts` only
- **To add a new AI feature**: add a prompt builder, optionally a model constant, a new route file, register in `routes/index.ts`, then wire the frontend via the generated React hook

### Security & Rate Limiting

- Access code gate: all AI endpoints require a valid `accessCode` in the request body
  - Codes stored in `VALID_ACCESS_CODES` secret (comma-separated), validated server-side
  - Invalid code → HTTP 401
- Per-code limits (in-memory, resets at midnight UTC):
  - 3 AI generations per feature per day
  - 30-second cooldown between requests
  - Rate limit exceeded → HTTP 429 with a human-readable message
- IP-based flood limit: 20 req/hr (lesson plan), 40 req/hr (copilot) as a backstop
- Input length capped at 2000 characters (frontend + backend validation)
- Request body capped at 16 kb
- Raw AI output is never exposed to clients — errors are logged server-side and a safe message is returned
- Usage logging: timestamp, feature, access code (uppercased), input length, success/errorKind — no student data ever logged

### Notes

- CORS is open (no origin restrictions) — fine for MVP
- `accessCode` is part of the OpenAPI spec and generated client types — add to request body alongside other fields
