# Documentation Standards

This directory defines the documentation standards for this repository and related repositories in the organization.

The purpose is to make documentation:

- technically accurate;
- concise;
- repository-first;
- easy to maintain;
- consistent across projects.

Documentation is part of the product surface. It must be reviewed with the same care as code because it changes how users install, operate, extend, and debug the software.

## Core Principles

### Prefer repository facts over narrative

Documentation must describe what exists in the repository now: commands, files, interfaces, constraints, and supported workflows.

Reasoning:

- Repository content is auditable.
- Facts tied to files and commands age more slowly than broad claims.
- Readers can verify statements locally.

### Optimize for scanability

Lead with the answer, then provide the minimum context needed to use it correctly.

Reasoning:

- Most readers arrive with a task, not with time for a full tour.
- Concise structure reduces ambiguity and review cost.

### Treat documentation as an interface

Each document should have a clear audience and a narrow job. A README is not a design essay, and an architecture note is not a setup guide.

Reasoning:

- Mixed-purpose documents become long, inconsistent, and hard to maintain.
- Readers should know where to look for one class of information.

### Avoid claims that cannot be maintained

Do not describe a feature as complete, production-ready, enterprise-grade, simple, intuitive, modern, powerful, or best-in-class unless the statement is backed by repository facts and is necessary to understand behavior.

Reasoning:

- Promotional language obscures operational truth.
- Subjective claims decay quickly and create review noise.

### Prefer stable references over repetition

If details already live in a canonical file, link to that file instead of re-explaining the same material.

Reasoning:

- Duplication creates divergence.
- Single-source references reduce maintenance cost.

## Scope

Use these files as the source of truth for:

- top-level and package-level `README.md` files;
- user and operator documentation under `docs/` or equivalent paths;
- architecture documents, ADRs, and design overviews;
- examples intended to teach usage patterns.

These standards do not replace code comments, API schemas, or generated reference documentation. They define how maintained prose should be written around them.

## Required Qualities

All maintained documentation must satisfy the following:

### Accurate

- Commands must exist and be runnable.
- Paths, environment variables, ports, and version requirements must match the repository.
- Behavior descriptions must reflect current implementation, not intent.

### Concise

- Remove repetition, filler, and marketing language.
- Prefer short paragraphs and lists over long prose blocks.
- Keep introductions brief; move detail into focused sections.

### Repository-first

- Explain local structure before external context.
- Reference actual files, scripts, and entry points.
- Prefer examples that can be traced to code in the repository.

### Maintainable

- Choose structures that survive feature growth.
- Prefer checklists and templates over ad hoc prose.
- Avoid status sections that require frequent manual rewriting unless they are essential and actively maintained.

### Consistent

- Use the same section ordering for the same class of document.
- Reuse terminology across repositories.
- Use one canonical name for each subsystem, command, and workflow.

## Writing Rules

### Use direct language

Prefer:

- "Run `pnpm dev`."
- "The API server listens on `:8080`."
- "Configuration is loaded from `.env`."

Avoid:

- "You can easily run..."
- "Simply configure..."
- "This amazing project..."

Reasoning:

- Direct language is shorter and easier to translate into action.

### Explain decisions when the reader needs them

Include reasoning when a rule, limitation, or tradeoff affects implementation or operations.

Reasoning:

- Readers need to know not only what to do, but why a constraint exists.
- Good reasoning reduces repeated questions and accidental misuse.

### Keep examples representative

Examples should show normal usage, not edge-case theatrics. Use realistic paths, names, and commands drawn from the repository.

Reasoning:

- Readers copy examples directly.
- Contrived examples teach syntax but not practice.

### Prefer present tense

Describe current behavior in present tense. Use future tense only for explicit plans in dedicated roadmap material.

Reasoning:

- Present tense keeps documentation anchored to shipped behavior.

### Use RFC 2119 language sparingly

Use "must", "should", and "may" only when expressing actual requirements or supported variation.

Reasoning:

- Overusing requirement words makes guidance harder to rank.

## Canonical Document Types

- `README.md`: entry point for understanding purpose, setup, common workflows, and where deeper references live.
- `docs/*`: task-oriented or reference-oriented material for users and operators.
- architecture documents: system shape, boundaries, invariants, and tradeoffs.
- examples: minimal, runnable demonstrations of one supported path.

Each document type has its own style file in this directory. Follow the specialized file instead of inventing a new format.

## Review Standard

Documentation changes should be reviewed for the same failure modes as code changes:

- incorrect instructions;
- stale references;
- unsupported claims;
- duplicated guidance;
- unclear audience;
- weak structure.

Use `.codex/readme-review.md` for README review and apply the same method to the other document classes.

## Default Rule

If a sentence does not help a reader complete a real task, understand a real constraint, or find a real source of truth, remove it.
