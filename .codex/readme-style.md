# README Style Guide

This file defines the standard for repository and package `README.md` files.

A README is an entry point. It should help a reader decide what the project is, how to run it, and where to go next. It should not try to hold all project knowledge.

## Job of a README

A good README answers these questions quickly:

1. What is this repository or package?
2. Who is it for?
3. How do I start it or install it?
4. What are the most common workflows?
5. Where is the deeper documentation?

If a section does not contribute to one of those answers, it probably belongs elsewhere.

## Recommended Structure

Use this order unless there is a strong repository-specific reason not to.

1. Title
2. One-paragraph summary
3. Quick start
4. Common workflows
5. Repository layout or key directories
6. Links to reference documentation
7. Contributing or development notes

Reasoning:

- This order serves both first-time readers and maintainers.
- It keeps setup near the top and background material lower down.

## Title

The title should be the repository or package name only.

Do not include:

- slogans;
- badges as the main content;
- decorative prefixes;
- version-history banners.

Reasoning:

- Readers should identify the project immediately.
- Decorative framing adds noise above the first useful line.

## Summary

The first paragraph should describe the repository in concrete terms:

- what it provides;
- its main runtime or integration surface;
- its scope boundaries when those are easy to misunderstand.

Keep it short, usually 2 to 4 sentences.

Prefer:

- "Aether Meet is a meeting platform with a Next.js web client, a Go API, and supporting infrastructure for local and production deployments."

Avoid:

- origin stories;
- aspirational language;
- exhaustive feature lists in the opening paragraph.

Reasoning:

- The summary establishes context.
- Long openings delay the first actionable information.

## Quick Start

Place the shortest correct setup path near the top.

A quick start should include only what a reader needs to reach a working state:

- prerequisites that are actually required;
- install or bootstrap commands;
- the command that starts the software;
- the default access point if relevant.

Keep the path narrow. Put variants in later sections or dedicated docs.

Reasoning:

- Quick start sections are copied line by line.
- Variant-heavy setup sections intimidate new users and increase maintenance.

## Common Workflows

After quick start, document the few workflows readers are most likely to need:

- running tests;
- building artifacts;
- local development;
- package-specific usage;
- debugging entry points.

Do not dump every script in the README. Summarize the important ones and link to the authoritative source for the rest.

Reasoning:

- A README should expose the common path, not mirror `package.json` or `Makefile`.

## Repository Layout

Include a short directory map when the repository has multiple major areas.

Keep it to top-level or high-signal paths only.

Example:

```text
apps/             Frontend applications
server/           Go services and API handlers
infrastructure/   Deployment and operations material
package/          Client SDKs and language-specific packages
```

Reasoning:

- A compact map gives maintainers orientation without forcing them to browse the tree.

## Links to Deeper Docs

A README should route readers to the next document:

- architecture overview;
- deployment guide;
- API reference;
- package docs;
- contributing guide;
- security policy.

Use links instead of reproducing those documents inline.

Reasoning:

- Routing is one of the main jobs of a README.
- A short README is easier to keep correct.

## What to Avoid

Do not include the following unless the repository has a strong, current need for them:

- long feature inventories;
- manually maintained product status dashboards;
- large badge blocks;
- repeated explanations already present in subdirectory READMEs;
- screenshots without operational value;
- promotional adjectives;
- "why this project matters" essays.

Reasoning:

- These sections age poorly and displace actionable content.

## Style Rules

- Use sentence case for headings unless the repository already uses title case consistently.
- Prefer short paragraphs.
- Prefer lists for commands, workflows, and directory maps.
- Use fenced code blocks with a language identifier.
- Keep line noise low: avoid excessive emoji, callouts, and blockquotes.

## Maintenance Rules

- Every command in a README must be testable by a reviewer.
- Every relative link must resolve in the repository.
- When a new canonical doc is added, update the README to point to it.
- When setup changes, update the quick start first.

## Exit Criteria

A README is complete when a new reader can:

- understand the repository at a high level;
- start the supported local path;
- find the deeper source of truth for everything else.
