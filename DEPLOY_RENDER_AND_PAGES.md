# Deploy Scaffold with Render + GitHub Pages at scaffolded.app

This is the lowest-friction path for the current codebase:

- `Render` runs the Express API
- `GitHub Pages` serves the React frontend

## 1. Deploy the backend on Render

1. Push this repo to GitHub.
2. In Render, create a new `Web Service`.
3. Select this repository.
4. Render should detect `render.yaml` automatically.
5. Set these environment variables in Render:

| Variable | Value |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `VALID_ACCESS_CODES` | School access codes, separated by commas |
| `GOOGLE_CLIENT_ID` | Web OAuth client ID from Google Cloud; this identifier is public, not a secret |
| `ADMIN_EMAILS` | Comma-separated Google account emails allowed to test without the public daily limit |
| `USAGE_HASH_SECRET` | A random 32+-character server secret for irreversible usage identifiers |
| `DATABASE_URL` | PostgreSQL connection string used for durable quotas and usage records |
| `GENERATION_ENABLED` | Set `true` to permit generation; set `false` to stop all paid calls immediately |
| `TRUST_PROXY` | Set `1` on Render so connection-level abuse protection sees the original client IP |
| `CORS_ALLOWED_ORIGINS` | `https://scaffolded.app` |

### Notes

- The backend health check is `GET /api/healthz`
- The service will listen on Render's provided `PORT`
- You do not need Replit AI integration variables on Render anymore

## 2. Point the frontend at Render

The frontend now supports a configurable API base URL with `VITE_API_BASE_URL`.

Example:

```bash
VITE_API_BASE_URL=https://scaffold-api.onrender.com
```

## 3. Connect GitHub Pages to Render

After Render gives you the backend URL:

1. Open the GitHub repository.
2. Go to `Settings` > `Secrets and variables` > `Actions` > `Variables`.
3. Create a repository variable named `VITE_API_BASE_URL`.
4. Set its value to the full Render URL, for example `https://scaffold-api.onrender.com`.

This URL is public configuration, not a secret. The OpenAI API key stays only on Render.

### Access-code sign-in

Production opens with school access-code sign-in by default. The Pages workflow
passes `VITE_ACCESS_GATE_ENABLED` into the frontend build, defaulting to `true`.
Teachers can still choose sample lessons without signing in.

Only set `VITE_ACCESS_GATE_ENABLED=false` for an intentionally sample-only site.
Set `VALID_ACCESS_CODES=SUZHOU` on the Render API. Teachers sign in with Google
and use that code; their four daily generations are recorded server-side across
both tools. Set `ADMIN_EMAILS` only in Render, never in a Pages variable or
source file. Codes, the admin allowlist, database URL, hash secret, and OpenAI
key must never be placed in frontend build variables. Replit secrets do not
automatically transfer to Render.

Create a Google OAuth **Web application** client and add both the production
GitHub Pages URL and local development URL to its authorized JavaScript origins.
The browser receives an ID token, but the API verifies its signature and
audience before it checks `ADMIN_EMAILS`. Google recommends server-side ID-token
verification for this flow: [Google Identity documentation](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

### Beta safety defaults

The API defaults to four public generations per account per UTC day, a 30-second
public cooldown, a smaller admin cooldown, three concurrent calls, and both
daily and lifetime emergency ceilings. These values are server-only environment
variables: `BETA_DAILY_LIMIT`, `BETA_COOLDOWN_SECONDS`,
`ADMIN_COOLDOWN_SECONDS`, `BETA_IP_DAILY_LIMIT`,
`GLOBAL_CONCURRENT_GENERATIONS`, `GLOBAL_DAILY_GENERATION_LIMIT`,
`GLOBAL_DAILY_TOKEN_LIMIT`, `GLOBAL_LIFETIME_GENERATION_LIMIT`,
`GLOBAL_LIFETIME_TOKEN_LIMIT`, and `GENERATION_DUPLICATE_SECONDS`.
`LESSON_PLAN_MAX_TOKENS` and `CLASSROOM_COPILOT_MAX_TOKENS` cap each provider
response; their safe defaults are 3,000 and 1,200 tokens respectively.

Every generation is reserved before OpenAI is called. This means a provider
failure can still use an allowance, which prevents retry storms. Logs contain
event type, hashed account/connection IDs, beta/admin traffic type, model, and
provider usage tokens when returned; they never contain lesson text, email,
student data, access codes, or API keys.

Deploy the API before the frontend when introducing `/api/access/validate`.
Confirm the API health endpoint, invalid-code rejection, and valid-code sign-in;
then generate a fictional lesson from the production frontend to verify AI and
CORS configuration. Code validation does not consume generation allowance.

## 4. Enable GitHub Pages

1. Go to `Settings` > `Pages`.
2. Under `Build and deployment`, choose `GitHub Actions` as the source.
3. Open the `Actions` tab and run `Deploy frontend to GitHub Pages`, or push a new commit to `main`.

The workflow builds with the correct `/` base path and publishes
`artifacts/speak-your-lesson/dist/public` automatically.

## 5. Local production build

To test the same frontend build locally:

```bash
BASE_PATH=/ VITE_API_BASE_URL=https://api.scaffolded.app pnpm --filter @workspace/speak-your-lesson run build
```

The built frontend will be written to:

```bash
artifacts/speak-your-lesson/dist/public
```

## 6. Connect scaffolded.app in Porkbun

After GitHub Pages and Render are deployed, add these DNS records in Porkbun:

- Apex/root `A` records for `@` to GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`.
- `CNAME` record for `www` to `lenguajelabs-design.github.io`.
- `CNAME` record for `api` to the Render hostname for the `scaffold-api` service.

In GitHub, set the Pages custom domain to `scaffolded.app` and enable HTTPS after DNS verification. Update the Render `CORS_ALLOWED_ORIGINS` value to `https://scaffolded.app`.

## 7. Expected production URLs

- Frontend: `https://scaffolded.app`
- Backend: `https://api.scaffolded.app` (or the Render hostname before the API custom domain is configured)

## 8. Normal update workflow

After migration, updates no longer require Replit Agent:

1. Make changes locally with Codex.
2. Review and test them locally.
3. Commit and push them to GitHub.
4. Render redeploys the API and GitHub Actions redeploys the frontend.
