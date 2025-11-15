# Aether Meet - Agent Guidelines

## Build Commands
- **Frontend**: `pnpm run dev` (development), `pnpm run build` (production), `pnpm run lint` (linting)
- **Backend**: `cargo build` (build), `cargo run` (run), `cargo test` (test)
- **Single test**: `cargo test <test_name>` for Rust, no test framework detected for frontend

## Code Style Guidelines

### TypeScript/React (Frontend)
- Use Next.js 15 with App Router
- Import React components: `import Component from './component'`
- Use TypeScript strict mode with proper typing
- Follow ESLint Next.js config (core-web-vitals, typescript)
- Use Tailwind CSS for styling with utility classes
- Path alias: `@/*` maps to project root

### Rust (Backend)
- Use 2024 edition
- Follow standard Rust formatting (`cargo fmt`)
- Use `cargo clippy` for linting
- Prefer idiomatic Rust patterns and error handling

### General
- Use pnpm for package management
- Follow conventional commit messages
- No comments unless explicitly requested
- Keep components and functions focused and small