# Deploy Scaffold with Render + GitHub Pages

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
| `CORS_ALLOWED_ORIGINS` | Your GitHub Pages origin, for example `https://lenguajelabs-design.github.io` |

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

## 4. Enable GitHub Pages

1. Go to `Settings` > `Pages`.
2. Under `Build and deployment`, choose `GitHub Actions` as the source.
3. Open the `Actions` tab and run `Deploy frontend to GitHub Pages`, or push a new commit to `main`.

The workflow builds with the correct `/scaffold/` base path and publishes
`artifacts/speak-your-lesson/dist/public` automatically.

## 5. Local production build

To test the same frontend build locally:

```bash
BASE_PATH=/scaffold/ VITE_API_BASE_URL=https://scaffold-api.onrender.com pnpm --filter @workspace/speak-your-lesson run build
```

The built frontend will be written to:

```bash
artifacts/speak-your-lesson/dist/public
```

## 6. Expected production URLs

- Frontend: `https://lenguajelabs-design.github.io/scaffold/`
- Backend: `https://<your-render-service>.onrender.com`

## 7. Normal update workflow

After migration, updates no longer require Replit Agent:

1. Make changes locally with Codex.
2. Review and test them locally.
3. Commit and push them to GitHub.
4. Render redeploys the API and GitHub Actions redeploys the frontend.
