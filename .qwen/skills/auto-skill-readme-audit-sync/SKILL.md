---
name: readme-audit-sync
description: Systematically audit a README.md against the actual codebase, identify discrepancies, and rewrite it to accurately reflect the project's contents, structure, features, and configuration.
source: auto-skill
extracted_at: '2026-06-23T05:02:59.962Z'
---

# README Audit & Sync

Use this skill when the user asks to "update the README to match the repo", "fix the README to reflect the actual project", "edit and adjust the readme with the contents of the repo", or any request to align README documentation with the real codebase.

## Workflow

### 1. Snapshot current README

Read the existing `README.md` to understand what it claims about the project.

### 2. Deep-inspect the codebase

Explore beyond surface level — read these key files to build an accurate picture:

- **`package.json`** — project name, scripts, dependencies (reveals tech stack, AI SDKs, build tools)
- **Server files** (`server.ts`, `app.ts`, `main.py`, etc.) — reveal real API endpoints, AI provider, environment variables
- **Worker/edge files** (`worker.ts`, `wrangler.toml`, `api/`) — alternative deployment targets
- **Frontend entry** (`src/App.tsx`, `src/main.tsx`, `src/app/`) — real component structure and routing
- **Configuration files** (`vite.config.ts`, `tsconfig.json`, `next.config.js`, `CNAME`, `wrangler.toml`) — deployment base paths, custom domains, build settings
- **Component directory** (`src/components/`, `src/pages/`) — list all actual UI modules
- **Type definitions** (`types.ts`, `types/`, `schema/`) — reveals real data models
- **Environment template** (`.env.example`) — real environment variable names
- **CI/CD files** (`.github/workflows/`) — deployment targets and secrets
- **Root metadata** (`CNAME`, `metadata.json`, `robots.txt`) — domain, app name, SEO

### 3. Compare and identify discrepancies

For each section of the README, verify against observed code:

| README Claim | Check Against |
|---|---|
| Project name | `package.json` `name` field, `metadata.json`, app title in `index.html` |
| AI provider / model | Server code imports, API call URLs, env var names |
| Environment variables | `.env.example` keys, server code `process.env.*` references |
| Features list | All component files, app routing, UI tabs |
| API endpoints | Server route definitions (`app.post/get`) |
| Tech stack | `package.json` dependencies, import statements |
| Project structure | Actual directory listing |
| Deployment instructions | CI workflow, config files |

### 4. Rewrite each section

For **every** section that is inaccurate, stale, or missing:

1. **Tech Stack** — use real dependencies and their versions from `package.json`
2. **Features / Modules** — list real components found in the codebase, not marketing descriptions
3. **API Endpoints** — read the actual route definitions from server code (method + path + description)
4. **Environment Variables** — copy names exactly from `.env.example` and server code
5. **Project Structure** — generate from actual `ls` output, annotate each file with its purpose
6. **Deployment** — verify CI workflow file, custom domain (CNAME), alternate deployment targets (Worker, edge runtime)
7. **Getting Started** — ensure commands and prerequisites match `package.json` scripts

### 5. Verify before committing

- Re-read the rewritten README and confirm it matches the codebase state
- Run `git diff` to review all changes
- Commit with a descriptive message listing the key corrections made

## Why

READMEs that drift from reality cause confusion, onboarding friction, and wasted debugging time. A systematic audit catches every discrepancy because it cross-references every claim against source code rather than relying on memory or assumptions.

## How to apply

Use whenever the user asks to align documentation with code — especially when the README was written during initial scaffolding and hasn't been updated as the project evolved. Also use proactively when you notice obvious mismatches between what the README says and what you observe in the code.