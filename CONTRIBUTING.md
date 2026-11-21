# Contributing to PRIS

PRIS is a private professional relationship intelligence workspace built with React, Express, tRPC, Drizzle, and the Manus-managed runtime.

## Local setup

1. Install Node.js 22 and pnpm 10.18.0.
2. Copy `.env.example` to `.env.local` and provide only the values needed for your local environment.
3. Install dependencies with `pnpm install --frozen-lockfile`.
4. Start the development server with `pnpm dev`.

## Before opening a pull request

Run the same checks used by GitHub Actions:

```bash
pnpm check
pnpm test
pnpm build
```

Keep changes focused, preserve evidence and privacy boundaries, and update documentation when behavior or configuration changes. Do not commit `.env` files, credentials, API keys, database dumps, build output, or runtime logs.

## Architecture boundaries

The Manus deployment provides authentication, server routes, database access, and built-in AI. GitHub Pages hosts only the static project portfolio at `docs/`; it is not the runtime for the authenticated PRIS application.
