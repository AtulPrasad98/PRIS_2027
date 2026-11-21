# PRIS architecture

## Runtime application

The authenticated PRIS workspace is a React frontend served by an Express server. tRPC connects the frontend to owner-scoped server procedures, Drizzle connects server procedures to the managed database, and built-in Manus AI is called server-side.

The runtime is deployed on Manus because it requires authentication, cookies, server routes, database access, and AI capabilities. Environment values are supplied at runtime and are never committed to GitHub.

## GitHub Pages portfolio

`docs/index.html` is a static project portfolio and public explanation of PRIS. The Pages workflow deploys only this directory. GitHub Pages does not host the authenticated application backend, database, or private workspace.

## Quality gates

The CI workflow installs the pinned pnpm version, runs `pnpm check`, runs `pnpm test`, and runs the full `pnpm build` on pushes and pull requests targeting `main`.
