# README Review Guide

Use this checklist when reviewing a `README.md`. The goal is to catch incorrect instructions, structural drift, and prose that increases maintenance cost.

## Review Order

Review in this order:

1. Accuracy
2. Scope
3. Structure
4. Brevity
5. Consistency

Reasoning:

- A concise README that is wrong is still wrong.
- Structural polish matters only after the content is trustworthy.

## Accuracy

Check the following first:

- Do the commands exist in the repository?
- Do the prerequisites match actual runtime requirements?
- Do referenced files and directories exist?
- Do ports, URLs, environment variables, and versions match the code and config?
- Does the README describe current behavior rather than planned behavior?

Reject or request changes for:

- stale commands;
- invented capabilities;
- unsupported compatibility claims;
- status language that contradicts implementation.

## Scope

Ask whether the README is doing the correct job.

The README should:

- introduce the repository or package;
- provide the shortest supported start path;
- document the most common workflows;
- route to deeper docs.

The README should not:

- replace architecture documentation;
- duplicate API reference material;
- carry roadmap content;
- serve as a changelog;
- act as a marketing page.

## Structure

Check whether information appears in a useful order:

- title and summary first;
- quick start near the top;
- common tasks before deep background;
- links to related docs near the end or at transition points.

Request changes if readers must scroll through low-value material before finding setup or usage.

## Brevity

Look for sentences that can be removed without losing meaning.

Common problems:

- repeated claims in multiple sections;
- long adjective chains;
- feature lists that restate directory names;
- paragraphs that explain obvious commands;
- excessive badges and decorative formatting.

Use a deletion-first mindset. Tight documentation is easier to maintain.

## Consistency

Check for alignment with `.codex/readme-style.md` and the rest of the organization:

- same section ordering where possible;
- same terminology for subsystems and commands;
- same level of detail for similar repositories;
- same heading style and formatting conventions.

## Questions for Reviewers

Use these questions to drive comments:

- Can a new contributor start the software from this README without extra tribal knowledge?
- Does the document point to the actual source of truth for deeper topics?
- Is any section present only because it looks standard, not because it helps readers?
- If this text goes stale in three months, which sections will fail first?

## Approval Standard

Approve a README when it is:

- correct against the repository;
- short enough to scan;
- explicit about common workflows;
- disciplined about what it leaves to other documents.
