# Scaffold Version 2.1 Release Checklist

Target release: October 2026

Production frontend: [scaffolded.app](https://scaffolded.app)
Production API: [api.scaffolded.app](https://api.scaffolded.app)

## Release scope

Version 2.1 includes the new landing preview, guided planner, optional paste-text workflow, API contract changes, prompt safety boundary, interface polish, and updated release label.

PDF upload is not part of this release. The interface must continue to label it as a concept and must not expose a file picker.

## Phase 1: Freeze and review

- [ ] Confirm the intended release files with `git status` and `git diff`.
- [ ] Confirm `/landing-preview` is intended to be publicly reachable.
- [ ] Confirm no `.env` files, API keys, access codes, student data, or private curriculum review artifacts are staged.
- [ ] Review all teacher-facing privacy and curriculum claims.
- [ ] Create a recoverable Version 2.0 production tag before deployment.

Go/no-go gate: the release scope is intentional, reviewable, and free of secrets or private data.

## Phase 2: Validate locally

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm --filter @workspace/api-server run build
BASE_PATH=/ VITE_API_BASE_URL=https://api.scaffolded.app pnpm --filter @workspace/speak-your-lesson run build
```

- [ ] Confirm OpenAPI code generation is current.
- [ ] Confirm an ordinary request without `sourceMaterial` remains valid.
- [ ] Confirm a request with source material at or below 8,000 characters is accepted.
- [ ] Confirm source material above 8,000 characters is rejected.
- [ ] Confirm the prompt places lesson material in a separate, non-canonical section.
- [ ] Confirm the prompt instructs the model to ignore embedded directions.

Go/no-go gate: typechecking, targeted builds, schema validation, and prompt-boundary checks pass.

## Phase 3: Deploy the API first

Prepare an API-readiness commit containing:

- `lib/api-spec/openapi.yaml`;
- regenerated API client and Zod files;
- server-side request validation; and
- prompt handling for `sourceMaterial`.

Deploy that commit to Render before publishing the new frontend.

- [ ] Render reports a successful deployment.
- [ ] `GET https://api.scaffolded.app/api/healthz` succeeds.
- [ ] A fictional lesson can be generated without source material.
- [ ] A fictional lesson can be generated with harmless pasted material.
- [ ] CORS accepts `https://scaffolded.app`.
- [ ] Production logs contain no lesson text, student data, access codes, or secrets.

Go/no-go gate: the production API accepts both the existing and Version 2.1 request shapes.

## Phase 4: Deploy the frontend

Prepare the frontend release commit containing the landing preview, guided flow, paste-text interface, UI polish, documentation, and Version 2.1 footer.

- [ ] Merge or push the approved frontend commit to `main`.
- [ ] Confirm GitHub Pages uses **GitHub Actions** as its deployment source.
- [ ] Confirm the `Deploy frontend to GitHub Pages` workflow succeeds.
- [ ] Confirm the workflow used the production `VITE_API_BASE_URL` repository variable.
- [ ] Confirm the published artifact contains `index.html` and `404.html`.

Go/no-go gate: GitHub Pages finishes successfully and the custom domain serves the new asset bundle over HTTPS.

## Phase 5: Production smoke test

Use fictional classroom content only.

- [ ] Open `https://scaffolded.app` in a private browser window.
- [ ] Confirm the footer displays Version 2.1 and October 2026.
- [ ] Confirm `/landing-preview` loads directly and after refresh.
- [ ] Confirm the landing-page materials action opens `/?start=materials`.
- [ ] Confirm the paste-text field, helper text, counter, tabs, and guided transition work.
- [ ] Confirm the PDF option remains concept-only and does not open a file picker.
- [ ] Generate one fictional plan and confirm pasted material informs the result.
- [ ] Confirm the generated plan remains editable, saveable, shareable, and printable.
- [ ] Confirm Google sign-in and saved-plan retrieval work.
- [ ] Confirm `/admin`, `/classroom-copilot`, and other direct routes survive refresh.
- [ ] Check desktop and narrow-screen layouts.
- [ ] Check browser console and network requests for unexpected errors.

Go/no-go gate: all critical teacher workflows function without privacy, routing, generation, or account regressions.

## Phase 6: Monitor

- [ ] Watch Render errors, response latency, generation failures, and database connectivity.
- [ ] Watch OpenAI usage and the configured generation ceilings.
- [ ] Confirm rate-limit and cooldown responses remain understandable.
- [ ] Confirm no unusual increase in rejected or malformed requests.
- [ ] Record the deployed frontend commit and API commit.
- [ ] Replace the changelog’s “Unreleased” heading with the actual release date after confirmation.
- [ ] Tag the verified release as `v2.1.0`.

## Rollback

If generation must stop immediately, set `GENERATION_ENABLED=false` on Render.

For an API regression:

1. Redeploy the last known-good Render commit.
2. Verify `/api/healthz`.
3. Run the fictional generation smoke test again.

For a frontend regression:

1. Revert the Version 2.1 frontend commit.
2. Allow GitHub Pages to deploy the revert.
3. Confirm `scaffolded.app` and its direct routes load correctly.

Do not perform a database rollback unless a release contains a reviewed database migration. Version 2.1 does not require a destructive migration.
