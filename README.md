# Scaffold

Scaffold is an instructional planning tool for elementary teachers supporting multilingual learners. It turns a classroom need, optional existing lesson material, and a small set of editable planning defaults into a reviewable support plan.

- Live site: [scaffolded.app](https://scaffolded.app)
- Production API: [api.scaffolded.app](https://api.scaffolded.app)
- Deployment guide: [DEPLOY_RENDER_AND_PAGES.md](DEPLOY_RENDER_AND_PAGES.md)
- Version 2.1 release checklist: [RELEASE_2_1.md](RELEASE_2_1.md)
- Release history: [CHANGELOG.md](CHANGELOG.md)

## Version 2.1 release candidate

Version 2.1 is being prepared for an October 2026 release. The current working changes include:

- a new Scaffold landing-page preview at `/landing-preview`;
- a guided planning path that explains what happens next;
- an optional, working paste-text input for existing lesson material;
- an 8,000-character limit enforced in the browser and API;
- explicit separation between classroom evidence, teacher-provided material, and approved curriculum sources;
- prompt-injection protection that treats pasted material as untrusted content rather than instructions;
- clearer required, optional, privacy, focus, and completion states;
- improved mobile task ordering and more descriptive action labels; and
- a Version 2.1 / October 2026 footer.

PDF upload remains a clearly labeled concept. No PDF is selected, uploaded, extracted, or retained by the current interface.

## Product principles

Scaffold is designed around five commitments:

1. **Start with the classroom moment.** Teachers can begin with rough notes rather than a configuration-heavy form.
2. **Keep teacher judgment central.** Generated plans are editable starting points, not prescriptions.
3. **Preserve rigor and student ownership.** Support should clarify access without replacing the intellectual work.
4. **Use curriculum carefully.** Only reviewed and approved curriculum profiles may be treated as canonical sources.
5. **Minimize sensitive data.** Teachers are reminded not to enter student names, records, or identifiable student work.

## Architecture

Scaffold is a pnpm TypeScript monorepo.

| Area | Technology | Location |
|---|---|---|
| Teacher-facing application | React, Vite, Tailwind CSS | `artifacts/speak-your-lesson/` |
| API | Express 5, Zod | `artifacts/api-server/` |
| API contract | OpenAPI, Orval-generated clients | `lib/api-spec/` |
| Database | PostgreSQL, Drizzle ORM | `lib/db/` |
| AI integration | Server-side OpenAI client | `lib/integrations-openai-ai-server/` |
| Frontend hosting | GitHub Pages | `.github/workflows/deploy-pages.yml` |
| API hosting | Render | `render.yaml` |

The browser never receives the OpenAI API key. AI requests are made through the Express API.

## Repository layout

```text
artifacts/
  api-server/              Express API
  speak-your-lesson/       Scaffold React application
lib/
  api-client-react/        Generated React API client
  api-spec/                OpenAPI source contract
  api-zod/                 Generated request validation
  db/                      Database schema and connection
  integrations-openai-ai-server/
.github/workflows/
  deploy-pages.yml         GitHub Pages build and deployment
render.yaml                Render API service definition
```

## Local development

### Prerequisites

- Node.js 20 or newer
- pnpm 10
- PostgreSQL
- an OpenAI API key for live generation

Install dependencies from the repository root:

```bash
pnpm install --frozen-lockfile
```

The API requires server-side environment variables. At minimum, configure:

```text
OPENAI_API_KEY
DATABASE_URL
GOOGLE_CLIENT_ID
USAGE_HASH_SECRET
```

Optional production controls include `GENERATION_ENABLED`, `CORS_ALLOWED_ORIGINS`, `REQUIRE_ACCESS_CODE`, `VALID_ACCESS_CODES`, and the documented rate-limit variables. Do not commit real values to Git.

Run the API and frontend in separate terminals:

```bash
pnpm --filter @workspace/api-server run dev
```

```bash
pnpm --filter @workspace/speak-your-lesson run dev
```

## Validation commands

```bash
# Typecheck libraries and artifacts
pnpm run typecheck

# Build the API
pnpm --filter @workspace/api-server run build

# Build the frontend
pnpm --filter @workspace/speak-your-lesson run build

# Regenerate API clients after changing the OpenAPI contract
pnpm --filter @workspace/api-spec run codegen
```

The workspace-wide build also includes development artifacts. Release validation should always include the targeted API and frontend builds shown above.

## Curriculum boundaries

The initial curriculum pilot covers Grade 4 and Grade 5, Reading Unit 1 and Writing Unit 1, plus shared multilingual-learner reading-workshop guidance. Other grades and units are unsupported until their profiles are added, reviewed, and approved.

Teacher-provided pasted material is temporary planning context. It must not be presented as an approved curriculum source or included in `sourcesUsed`.

## Privacy and safety

- Do not submit student names, records, or identifiable student work.
- Pasted material is not added to the curriculum library or included in the saved lesson plan.
- Teacher-provided material is treated as untrusted content; embedded instructions are ignored by the prompt builder.
- Production logs should contain operational metadata, not lesson text, access codes, API keys, or raw student data.
- Secrets belong in Render environment variables, never GitHub Pages variables or frontend source.

## Deployment

The production application is intentionally split:

- **Render** runs the API at `api.scaffolded.app`.
- **GitHub Pages** publishes the Vite frontend at `scaffolded.app`.

For Version 2.1, deploy the backward-compatible API contract and prompt changes before the frontend. This prevents the new paste-text interface from reaching an older backend that may ignore `sourceMaterial`.

GitHub Pages must use **GitHub Actions** as its deployment source. The workflow publishes `artifacts/speak-your-lesson/dist/public` and adds a SPA-compatible `404.html`.

See [DEPLOY_RENDER_AND_PAGES.md](DEPLOY_RENDER_AND_PAGES.md) for initial infrastructure setup and [RELEASE_2_1.md](RELEASE_2_1.md) for the release sequence.

## Status

Version 2.1 is a release candidate until the production deployment and smoke tests in [RELEASE_2_1.md](RELEASE_2_1.md) are complete. Do not use the footer version alone as proof that a particular source revision is deployed.

## License

MIT
