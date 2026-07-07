# Documentation Style Guide

This file defines the standard for maintained prose under `docs/` or equivalent documentation paths.

These documents exist to help users, operators, and contributors complete a specific task or understand a specific interface. They are not general-purpose essays.

## Choose a Document Type First

Before writing, decide which kind of document you are creating:

- task guide: step-by-step instructions for one workflow;
- reference: factual description of commands, config, APIs, or behavior;
- concept: explanation of a model or subsystem needed to use the repository correctly;
- troubleshooting: symptom, cause, diagnosis, and recovery.

Reasoning:

- Mixing document types makes the prose longer and harder to navigate.
- Different document types need different levels of detail.

## Standard Structure by Type

### Task Guide

Use this order:

1. Purpose
2. Prerequisites
3. Steps
4. Verification
5. Related references

### Reference

Use this order:

1. Scope
2. Definitions or inputs
3. Behavior or options
4. Constraints
5. Related guides

### Concept

Use this order:

1. Problem or context
2. Model
3. Boundaries and invariants
4. Operational consequences
5. Related references

### Troubleshooting

Use this order:

1. Symptom
2. Likely causes
3. Diagnosis steps
4. Resolution
5. Prevention or related docs

Reasoning:

- Consistent structure reduces search time.
- Readers can predict where the answer will be.

## Start With Scope

The opening lines should say what the document covers and what it does not cover.

Reasoning:

- Scope boundaries prevent confusion and keep documents small.

## Prefer Commands and Paths Over Abstract Advice

Use concrete repository references:

- commands from `package.json`, `Makefile`, or scripts;
- file paths that exist;
- configuration keys that are implemented;
- logs, outputs, or error messages that are real.

Reasoning:

- Concrete guidance is testable.
- Abstract advice creates ambiguity during incident response or onboarding.

## Keep Steps Linear

In task guides, each step should do one thing. If a workflow branches, say where the branch starts and move variant details into a separate subsection or document.

Reasoning:

- Readers often execute docs in order.
- Dense multi-action steps are harder to verify.

## Explain Constraints Explicitly

If a workflow has limits, preconditions, or side effects, state them near the relevant instruction.

Examples:

- required services must be running;
- a command modifies persistent state;
- a step is safe only in development;
- a feature depends on optional infrastructure such as Redis.

Reasoning:

- Hidden constraints are a common source of failed setups and incorrect operations.

## Link by Role

Link to documents because they answer the next question, not because they merely exist.

Prefer link labels such as:

- "Deployment guide"
- "API reference"
- "Worker architecture"

Avoid generic labels such as:

- "Click here"
- "More info"

Reasoning:

- Role-based links help scanning and improve long-term navigation quality.

## What to Avoid

- duplicated setup instructions across multiple task guides;
- screenshots for text-first workflows;
- unexplained jargon;
- speculative implementation notes;
- roadmap material mixed into operational docs;
- large warning blocks for minor caveats.

## Maintenance Rules

- When a workflow changes, update the canonical task guide rather than patching multiple copies.
- When a document exceeds its scope, split it.
- When a command or config option is removed, remove its documentation in the same change set.

## Completion Standard

A document is complete when its intended reader can use it without needing to infer missing steps, hidden prerequisites, or unstated boundaries.
