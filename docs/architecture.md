# PRIS architecture

## Runtime application

The open shared PRIS workspace is a React frontend served by an Express server. tRPC connects the frontend to shared server procedures, Drizzle connects server procedures to the managed database, and built-in Manus AI is called server-side.

The runtime is deployed on Manus because it requires server routes, database access, and AI capabilities. Authentication is intentionally bypassed: every visitor uses one shared workspace identity and can modify the same records. Environment values are supplied at runtime and are never committed to GitHub.

## GitHub Pages portfolio

`docs/index.html` is a static project portfolio and public explanation of PRIS. The Pages workflow deploys only this directory. GitHub Pages does not host the shared application backend, database, or workspace data.

## Quality gates

The CI workflow installs the pinned pnpm version, runs `pnpm check`, runs `pnpm test`, and runs the full `pnpm build` on pushes and pull requests targeting `main`.
