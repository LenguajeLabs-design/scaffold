# API Server

Express 5 backend for the **Speak Your Lesson Into Existence** teaching app.

---

## How the backend is organised

```
src/
  app.ts                      Express app setup (middleware, CORS, routing mount)
  index.ts                    Server entry point — reads PORT, starts listening

  config/
    models.ts                 AI model names and token limits (single source of truth)

  lib/
    logger.ts                 Pino logger instance (used via req.log in routes)

  routes/
    index.ts                  Mounts all routers under /api
    health.ts                 GET /api/healthz — liveness check
    lesson-plan.ts            POST /api/lesson-plan/generate
    classroom-copilot.ts      POST /api/classroom-copilot/generate

  services/
    openai.service.ts         callOpenAIForJSON() — shared OpenAI call wrapper
    prompts.ts                Prompt builder functions for each AI feature
```

### Responsibility boundaries

| Layer | Responsibility |
|---|---|
| **routes/** | Parse and validate the HTTP request; delegate to services; return HTTP response |
| **services/openai.service.ts** | Call the OpenAI API; extract response content; parse JSON; throw safe errors |
| **services/prompts.ts** | Build system and user prompts from validated request data |
| **config/models.ts** | Store model identifiers and token budgets as named constants |

---

## Where prompts live

All prompt strings are in `src/services/prompts.ts`.

Each AI feature has its own builder function:
- `buildLessonPlanPrompt(args)` — full lesson plan generation
- `buildClassroomSupportPrompt(args)` — quick live classroom support

To change what the AI produces, edit only this file.

---

## Where OpenAI calls happen

Only in `src/services/openai.service.ts`, in the `callOpenAIForJSON<T>()` function.

This function:
1. Calls `openai.chat.completions.create()` with the provided model, prompts, and token limit
2. Extracts the text content from the first choice
3. Parses it as JSON and returns it typed as `T`
4. Throws a safe, user-facing error if the API call fails, returns empty content, or returns unparseable content

Route handlers never call `openai` or `JSON.parse` directly.

---

## Required environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the server binds to (set automatically by Replit) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI-compatible base URL (set by Replit AI Integrations) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API key for the integrations proxy (set by Replit AI Integrations) |

The `AI_INTEGRATIONS_*` variables are provisioned automatically via the Replit AI Integrations system. No API key needs to be managed manually.

---

## Running locally (within the monorepo)

```bash
# From the workspace root
pnpm --filter @workspace/api-server run dev
```

The dev script builds the TypeScript with esbuild and starts the server. Changes require a restart.

---

## How to add a new AI mode

1. **Add the OpenAPI spec entry** in `lib/api-spec/openapi.yaml` (request body schema + response schema + path).
2. **Run codegen** — `pnpm --filter @workspace/api-spec run codegen` — to regenerate Zod schemas and React hooks.
3. **Add a prompt builder** in `src/services/prompts.ts`.
4. **Add a model constant** in `src/config/models.ts` if using a different model.
5. **Add a route file** in `src/routes/` — validate with the generated Zod schema, call `callOpenAIForJSON()`, return the result.
6. **Register the router** in `src/routes/index.ts`.
7. **Wire the frontend** using the generated React hook from `@workspace/api-client-react`.
