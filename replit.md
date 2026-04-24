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

### Speak Your Lesson Into Existence (`artifacts/speak-your-lesson`)
- **Type**: React + Vite web app
- **Preview Path**: `/`
- **Purpose**: Helps elementary teachers turn rough spoken/written planning notes into ready-to-teach lesson plans for multilingual learner (ELL) classrooms
- **Features**:
  - Large textarea for pasting rough notes or voice transcripts
  - Grade Level dropdown (Grade 3, 4, 5)
  - WIDA Band dropdown (WIDA 1-2, 2-3, 3-4)
  - Topic/Subject input
  - AI-generated lesson plan with 10 structured sections
  - Loading state, error handling, clean card-based output layout
- **Colors**: Navy #142550, Red #C82C39, Background #F4F6FA
- **Font**: Montserrat (Google Fonts)

#### Classroom Copilot (`artifacts/speak-your-lesson` — `/classroom-copilot` route)
- **Type**: React page within the same web artifact
- **Purpose**: Instant EAL classroom support for live teaching moments
- **Features**:
  - Text area: "What do your students need help with right now?"
  - Grade Level dropdown (Grade 2–5)
  - WIDA Level dropdown (WIDA 1-2, 2-3, 3-4)
  - 6 output cards: Simple Explanation, Key Vocabulary, Sentence Frames, Quick Activity, Extension Question, Teacher Move
  - "Copy All" button to copy all support to clipboard
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

### Notes

- CORS is open (no origin restrictions) — fine for MVP, no auth or sensitive data
- Request body capped at 16 kb to prevent payload abuse
- Raw AI output is never exposed to clients — errors are logged server-side and a safe message is returned
