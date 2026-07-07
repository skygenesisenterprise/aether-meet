# Aether Meet

Aether Meet is a meeting platform with a Next.js web client, a Go API, and supporting infrastructure for local and production deployments. This repository contains the application code, deployment assets, and language-specific packages used to operate and extend the system.

## Quick start

Prerequisites:

- Node.js 18 or later
- pnpm 9 or later

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The default web application runs at `http://localhost:3000`.

## Common workflows

Run the linter:

```bash
pnpm lint
```

Build the production bundle:

```bash
pnpm build
pnpm start
```

## Repository layout

```text
apps/             Frontend applications
server/           Backend services and API handlers
infrastructure/   Deployment, Kubernetes, Docker, and monitoring assets
package/          Language-specific packages and SDKs
tests/            Repository-level test material
```

## Related documentation

- [Architecture overview](../architecture-style.md)
- [README style guide](../readme-style.md)
- [Documentation style guide](../docs-style.md)

## Contributing

Keep the top-level README focused on startup, common workflows, and links to deeper references. Move subsystem detail into package READMEs or dedicated docs once it stops serving the entry-point use case.

## Why this example is good

- The summary states what the repository contains without slogans.
- The quick start is short and uses commands that belong near the top.
- The layout section helps orientation without dumping the full tree.
- Deeper topics are linked instead of duplicated.
- The final note explains maintenance intent so future edits preserve the structure.
