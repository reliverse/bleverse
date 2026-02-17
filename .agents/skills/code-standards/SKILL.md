---
name: code-standards
description: Engineering and architectural standards for the Bun + TypeScript + React monorepo.
license: MIT
---

## Overview

This repository is a **Bun-based monorepo** written in **TypeScript (strict mode)** and managed via Bun workspaces.

The architecture separates deployable applications from shared packages and enforces clear dependency boundaries.

The codebase prioritizes **calm, intentional, human-readable code** with minimal abstraction and minimal surface area.

## Core Values

- Simplicity over cleverness
- DX, performance, and readability first
- Minimal abstractions, minimal surface area
- Modern, stable standards only
- Code should feel calm, intentional, and human
- Remove accidental complexity before adding features
- Prefer omission over correction

## Defaults

- Runtime & tooling: **Bun**
- Language: **TypeScript (strict)** — no `any`, no unsafe casts
- Frontend: **React, TanStack Start, Tailwind CSS, shadcn/ui**
- State & data: declarative, minimal, explicit
- Prefer async patterns where reasonable
- Never produce `.js` or `.mjs`, only `.ts`
- Dev server must not be started unless explicitly requested
- Bun documentation lives in `node_modules/bun-types/docs/**/*.mdx`

## Project Structure

### `packages/`

Contains shared workspace packages:

- `convex/`
- `tsconfig/`
- other reusable libraries and internal tooling

Packages are **not deployed by default**.

> Exception: `packages/convex` is deployed because it contains Convex backend logic and exports types.
> Although located in `packages/`, it behaves as a cloud application.

### `apps/`

Contains deployable applications:

- `web`
- `expo`
- `tauri`
- `api`
- `docs`
- other services

All submodules inside `apps/` are considered deployable units.

## Monorepo Rules

- Bun workspaces by default
- Use `workspace:*` for internal dependencies
- Centralized versions via Bun catalogs:
  1. Root `package.json` → `workspaces.catalog`
  2. Packages reference dependencies via `"catalog:"`
  3. Run `bun install`
- Small, focused, composable packages
- Respect existing structure, naming, and formatting

## Architectural Rules

- `apps/` may depend on `packages/`
- `packages/` must never depend on `apps/`
- Avoid circular dependencies
- Shared logic belongs in `packages/`
- Deployment logic belongs in `apps/`
- Explicit types at system boundaries
- Trust TypeScript inference inside modules
- Avoid `unknown` except at real external boundaries

## TypeScript Rules

- Strict mode must be enabled
- Avoid `any`
- Avoid unsafe casts
- Prefer explicit types at boundaries
- Rely on inference internally
- Functional patterns over classes
- Async-first where reasonable

## Backend

- Backend logic lives in `packages/convex/`
- Code must follow Convex conventions
- Shared types should be exported from workspace packages

## Imports

- Use workspace aliases (e.g. `@repo/convex`)
- Avoid deep relative imports across workspace boundaries

## Code Style & Discipline

- Prefer early returns over nested `if`
- Avoid unnecessary `else`
- Avoid `try/catch` in trusted paths
- Do not add redundant guards or defensive checks
- Do not introduce unnecessary helpers or abstractions
- If code requires a paragraph to justify itself — rewrite it
- Do not reformat unrelated code
- Do not change behavior or semantics unintentionally
- Preserve local conventions and implicit assumptions
- Unusual or complex code is valid if it shows clear human intent

## Commenting Rules

- No narrative or tutorial-style comments
- No comments that restate code behavior
- Comments allowed only when logic is complex or non-obvious
- Comments must serve developers or end users

## Design Principles

- Favor simplicity over abstraction
- Prefer composable modules over monolithic utilities
- Keep functions small and predictable
- Minimize hidden side effects
- Optimize for long-term maintainability
- Improve proactively, not reactively
- Refactor instead of patching
