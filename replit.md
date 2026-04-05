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

### API Server (`artifacts/api-server`)
- **Type**: Express 5 REST API
- **Routes**:
  - `GET /api/healthz` — health check
  - `POST /api/lesson-plan/generate` — generate lesson plan via OpenAI gpt-5.2
- **AI Integration**: `@workspace/integrations-openai-ai-server` using Replit AI Integrations proxy

## AI Integration Notes

- Uses `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` env vars (auto-provisioned)
- Model: `gpt-5.2` for lesson plan generation
- No user API key needed — charged to Replit credits
