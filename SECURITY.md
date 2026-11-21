# Security policy

## Scope

PRIS currently runs in fully open shared-workspace mode. Anyone with the application URL can view, create, edit, and delete the same professional relationship context and notes. Do not enter confidential personal, recruiting, or sensitive relationship data. The public GitHub repository contains source code and safe configuration templates only.

## Secret handling

Never commit API keys, OAuth credentials, JWT secrets, database URLs, private keys, `.env` files, credentials, database dumps, or runtime logs. Use the managed Manus secret/runtime configuration for deployment values and local `.env.local` files for development.

The repository includes automated ignore rules and GitHub Actions checks. If a secret is ever committed, revoke or rotate it immediately, then remove it from the repository history.

## Reporting a vulnerability

Please do not open a public issue containing sensitive details. Contact the repository owner privately through GitHub with a concise description, affected path or version, reproduction steps, and potential impact.
