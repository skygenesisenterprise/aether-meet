# Architecture Documentation Style Guide

This file defines the standard for architecture overviews, subsystem design notes, and ADR-style documents.

Architecture documentation explains how the repository is organized, which boundaries matter, and which decisions shape implementation. Its job is to reduce accidental complexity for maintainers.

## Primary Goals

Architecture documentation should answer:

1. What are the major components?
2. How do they interact?
3. Which boundaries are intentional?
4. Which invariants must not be broken?
5. Which tradeoffs explain the current design?

If a document does not answer those questions, it is probably not architecture documentation.

## What Architecture Docs Are Not

They are not:

- onboarding walkthroughs;
- setup guides;
- feature lists;
- roadmap pages;
- line-by-line code explanations.

Reasoning:

- Architecture docs must stay stable as features change.
- Implementation detail belongs closer to code and task-specific docs.

## Recommended Structure

Use this order unless a narrower ADR format is already established:

1. Context
2. System shape
3. Component responsibilities
4. Data flow or control flow
5. Invariants and boundaries
6. Tradeoffs and rejected alternatives
7. Operational implications
8. References to code and related docs

Reasoning:

- This order moves from problem space to system behavior to consequences.

## Context

State the problem the architecture solves and the constraints that shaped it.

Good constraints include:

- latency requirements;
- deployment model;
- compatibility needs;
- language boundaries;
- persistence model;
- failure domains.

Reasoning:

- Architecture without context reads like arbitrary structure.

## System Shape

Describe the top-level components in repository terms. Name real directories, services, packages, and interfaces.

Prefer:

- "`apps/` contains the web client."
- "`server/` contains API handlers and backend services."
- "`infrastructure/` contains deployment and runtime configuration."

Avoid:

- vague boxes with no mapping to repository paths;
- aspirational components that do not exist.

## Responsibilities

For each major component, state:

- what it owns;
- what it depends on;
- what it must not do.

Reasoning:

- Maintainability depends on knowing ownership boundaries, not only connectivity.

## Flows

Describe only the flows that matter to understanding the architecture:

- request path;
- event path;
- background job path;
- authentication path;
- deployment path.

Use diagrams only when they simplify the explanation. A clear text flow is preferable to an oversized diagram with low information density.

Reasoning:

- Many architecture diagrams become stale because they describe everything.
- Focused flows survive change better.

## Invariants and Boundaries

Every architecture document should name the rules that maintainers should preserve.

Examples:

- which layer owns persistence;
- which package is allowed to call an external service;
- where validation must occur;
- whether components can run without optional dependencies;
- what data must remain consistent across boundaries.

Reasoning:

- Architecture matters most at the boundaries where future changes introduce regressions.

## Tradeoffs

Explain why the design is the way it is, including known costs.

Examples:

- choosing operational simplicity over peak throughput;
- using multiple runtimes for capability separation;
- supporting a fallback mode to reduce local setup requirements.

Reasoning:

- Future maintainers need the reasoning behind the design, not only its current shape.

## Operational Implications

Document the consequences that matter in production and development:

- required backing services;
- failure handling expectations;
- scaling boundaries;
- configuration dependencies;
- observability entry points.

Reasoning:

- A design is incomplete if its runtime consequences are left implicit.

## Review Standard

Approve architecture documentation when it:

- maps directly to repository structure;
- describes current boundaries accurately;
- names the important invariants;
- explains the tradeoffs behind non-obvious decisions;
- avoids turning into setup or marketing material.
