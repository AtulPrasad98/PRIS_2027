# PRIS — Professional Relationship Intelligence

PRIS is an open, shared evidence-backed workspace for understanding professional relationships, preserving context, and choosing thoughtful next actions. It is designed for human review: AI can draft and explain, but it does not decide or send messages.

## What is included

- Shared contacts, evidence, interactions, relationship states, projects, follow-ups, and notes. Every visitor can view and modify the same workspace.
- Server-side structured AI for person intelligence, introductions, conversation analysis, and project matching.
- Persistent light/dark mode and India Standard Time (`Asia/Kolkata`) calendar handling.
- React + Vite frontend, Express server, tRPC API, Drizzle ORM, and managed database migrations.
- GitHub Actions CI for typechecking, tests, and the production build.
- A static project portfolio at [`docs/index.html`](docs/index.html), deployed to GitHub Pages.

## Local development

Requirements: Node.js 22 and pnpm 10.18.0.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

The development server runs on port 3000 by default. Never commit `.env.local` or real credentials.

## Quality checks

```bash
pnpm check       # TypeScript diagnostics
pnpm test        # Vitest suite
pnpm build       # Frontend and server production build
```

The same checks run in [GitHub Actions](.github/workflows/ci.yml) for pushes and pull requests targeting `main`.

## Deployment boundaries

The open PRIS workspace runs on the Manus-managed runtime because it needs server routes, database access, and built-in AI. Authentication is intentionally bypassed: visitors use one shared workspace identity, so all records and changes are public to anyone with the application URL. Runtime values are supplied through managed secrets and environment configuration.

GitHub Pages hosts only the static portfolio overview in `docs/`; it cannot host the shared PRIS backend or database. The Pages workflow is defined in [.github/workflows/pages.yml](.github/workflows/pages.yml).

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Architecture](docs/architecture.md)
- [MIT License](LICENSE)
