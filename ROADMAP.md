# Bleverse Roadmap (Monorepo)

This is a **direction**, not a promise. Priorities may shift based on feedback, maintainer time, and what we learn while building.

## North Star
- Calm UX, no attention traps
- Modularity over monoliths
- Accessibility by default
- Transparent, explainable system behavior
- Consent-first settings and personalization

## Global TODO (not tied to a single package)

### Product / UX
- [ ] Onboarding: short, clear, with explicit consent/personalization toggles
- [ ] "Feed optional" as a first-class mode (no degraded experience)
- [ ] Privacy/visibility policies: consistent language and consistent behavior everywhere
- [ ] Copy tone: calm + clear microcopy (empty states, errors, prompts)

### Platform / Security / Reliability
- [ ] Lightweight threat model + security checklist for releases
- [ ] Baseline rate limiting / abuse protection
- [ ] Audit trail for critical actions (login, email changes, permissions, payments)
- [ ] Backups/restore plan + periodic restore tests
- [ ] Minimum observability: structured logs, error reporting, health endpoints, basic metrics

### DX / Repo hygiene
- [ ] One "Quickstart" (one-command boot) + "Architecture overview"
- [ ] CI: lint/typecheck/test/build across all workspaces
- [ ] Release discipline: Conventional Commits / Changesets (or equivalent) + automated changelog
- [ ] Versioning policy: define what counts as "public API" and what guarantees exist
- [ ] Templates: issue/PR templates + label taxonomy (`roadmap`, `help wanted`, etc.)

## apps/

### apps/web (web platform)
> `apps/web` contains multiple web targets:
> - `apps/web/main` — the primary web client
> - `apps/web/docs` — the documentation site

#### apps/web/main (primary web client)
- [ ] App shell: navigation, layouts, routing, error boundaries
- [ ] Auth UX: sign-in/up, sessions, logout, basic session management UI
- [ ] Profile: edit, privacy, field visibility, public profile page
- [ ] Feed (optional): hard "disable feed" mode + alternative views (projects/updates)
- [ ] Accessibility pass: keyboard nav, focus states, screen reader sanity
- [ ] Performance: core web vitals, caching, bundle optimization

#### apps/web/docs (documentation site)
- [ ] Architecture overview: "apps vs packages", data flows
- [ ] Setup + troubleshooting (common failures + fixes)
- [ ] Consent/privacy model explained (product + technical)
- [ ] Contribution guide: where things live, how to add features safely
- [ ] ADRs (short decision records) for major architectural choices

### apps/api (server API / backend endpoints)
- [ ] Auth middleware + baseline RBAC/permissions
- [ ] Request validation + unified error shape (user-facing vs internal)
- [ ] Rate limiting (IP + account scoped)
- [ ] Health endpoints + readiness/liveness
- [ ] Jobs/queues if needed: email, webhooks, cleanup, billing events
- [ ] API versioning strategy (if public): `/v1` or equivalent approach

### apps/cli (dev/admin tooling)
- [ ] `bleverse dev` / `bleverse doctor` (env, service, and dependency checks)
- [ ] Generators: scaffold package/module/component
- [ ] Admin helpers: create-user, reset-password, seed, migrate (local/dev)
- [ ] Release helpers: notes/changelog tooling (if this fits the workflow)

### apps/mobile (mobile client)
- [ ] Auth flow + secure session storage
- [ ] Key screen parity with web (profile/posts/projects)
- [ ] Offline-friendly states (minimum: graceful degradation)
- [ ] Notifications (explicit opt-in only)
- [ ] Accessibility: gestures, safe areas, screen reader checks

### apps/desktop (desktop client)
- [ ] App shell + updates strategy (if applicable)
- [ ] System integration (deep links, files, protocols) as needed
- [ ] Shared UI with web (maximize shared code)
- [ ] Secure storage for tokens
- [ ] Crash/error reporting (opt-in, transparent)

## components/ (shared components)

> `cts` is short for **components** (shared building blocks / component sets).

### components/web
- [ ] Shared UI kit: buttons/forms/dialogs/toasts/tables/empty states
- [ ] A11y patterns: focus management, aria, keyboard shortcuts
- [ ] Shared "cts" conventions: naming, props, composition patterns
- [ ] Component previews/docs (Storybook or similar) if useful

### components/expo
- [ ] Component parity with web where reasonable (names/props/behavior)
- [ ] Shared "cts" conventions aligned with web
- [ ] Navigation patterns: stack/tab, modals, sheets

## packages/

### packages/env
- [ ] Typed env schema + fail-fast validation
- [ ] Split: server-only vs client-exposed vars
- [ ] Document variables + provide `.env.example`

### packages/auth
- [ ] Core auth: session management, refresh, revoke
- [ ] Permissions model (baseline): user/admin/roles/scopes
- [ ] Multi-device sessions + audit events
- [ ] Account recovery flow (email-based) + hardening

### packages/db
- [ ] Canonical data models/schemas
- [ ] Indexing + migration strategy alignment
- [ ] Seed fixtures for dev/test
- [ ] Backup/restore primitives (docs + scripts)

### packages/drizzle
- [ ] Drizzle config as a single source of truth
- [ ] Migrations: generate/run/status checks
- [ ] Type-safe query/repository helpers

### packages/api (shared contracts/client)
- [ ] Shared contracts (DTO/types) across web/mobile/desktop and apps/api
- [ ] Typed client (fetch wrapper) + error normalization
- [ ] Auth-aware client (headers, token refresh, retry rules)

### packages/email
- [ ] Transactional emails: verify, reset, security alerts
- [ ] Templates + optional i18n
- [ ] Rate limits + bounce/complaint handling (baseline)

### packages/storage
- [ ] Storage abstraction (local/object storage) + signed URLs
- [ ] Access policies (private/public/unlisted)
- [ ] File type/size limits + optional virus scan hook

### packages/kv
- [ ] KV for rate limiting, session cache, feature flags
- [ ] Namespacing + TTL rules
- [ ] Dev fallback (in-memory) for local runs

### packages/payments
- [ ] Billing primitives: plans, entitlements, invoices (baseline)
- [ ] Webhooks ingestion + idempotency guarantees
- [ ] Consent-first billing UX (no hidden auto-upsells)

### packages/convex
- [ ] Define scope clearly: what lives here and why
- [ ] Data sync contracts + offline strategy (if used)
- [ ] Observability/limits: latency, quotas, retries

## tooling/

### tooling/tsconfig
- [ ] One TS policy: strict, moduleResolution, path aliases
- [ ] Shared base configs for apps/packages/components

### tooling/tailwind
- [ ] Design tokens as code: spacing, typography, radii, shadows
- [ ] Themes (light/dark) + a11y contrast defaults
- [ ] Shared presets across web/docs (and wherever needed)

### tooling/sdk
- [ ] Internal SDK for shared utilities and conventions
- [ ] Guardrails where possible (lint rules / patterns aligned with "no dark patterns")
- [ ] Shared logging/telemetry helpers (opt-in)

## Definition of Done (PR hygiene)
- [ ] Tests or checks when logic changes
- [ ] Docs updated (`apps/web/docs`) when behavior changes
- [ ] A11y sanity pass for UI changes
- [ ] No silent breaking changes (note in CHANGELOG)
