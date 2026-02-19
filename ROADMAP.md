# Bleverse Monorepo Roadmap

This roadmap describes **direction**, not guarantees. Priorities may shift based on feedback, maintainer time, and architecture constraints.

## North Star

- Calm, focused UX (no dark patterns)
- Modular platform architecture
- Explicit system behavior
- Accessibility by default
- Consent-first configuration
- Clear architectural boundaries

## Definition of Done

- Types validated
- No boundary violations
- Accessibility sanity pass
- Documentation updated
- Breaking changes documented
- Dependency graph unchanged (unless intentional)

## Global TODOs (Cross-Cutting)

### Product / UX

- [ ] Short onboarding with explicit personalization toggles
- [ ] Feed as optional module (non-core)
- [ ] Unified privacy language + consistent visibility rules
- [ ] Calm microcopy (no urgency mechanics)
- [ ] Clear settings visibility (explainable system state)

### Platform / Security / Reliability

- [ ] Lightweight threat model + release checklist
- [ ] Baseline rate limiting
- [ ] Audit trail (auth, permissions, billing)
- [ ] Backup + restore verification
- [ ] Structured logging + health endpoints
- [ ] Core metrics (latency, errors, usage)

### DX / Repo Hygiene

- [ ] One-command Quickstart
- [ ] CI: typecheck / lint / test / build
- [ ] Versioning policy (public API boundaries)
- [ ] Conventional commits or equivalent
- [ ] Issue/PR templates + label taxonomy
- [ ] Clear dependency graph documentation

## apps/

Deployable runtimes.

### apps/api (api.bleverse.com)

Thin runtime wrapper over `@repo/server`.

- [ ] Auth middleware wiring
- [ ] Public API versioning (`/v1`)
- [ ] Rate limiting (IP + account)
- [ ] Health + readiness checks
- [ ] Job orchestration (email, billing, cleanup)
- [ ] Error normalization (public vs internal)
- [ ] Observability wiring

### apps/web (bleverse.com)

- [ ] App shell (routing + layout)
- [ ] Auth UX
- [ ] Profile + visibility controls
- [ ] Optional feed module
- [ ] Accessibility pass
- [ ] Core Web Vitals optimization
- [ ] Consent-first personalization

### apps/mobile

- [ ] Auth flow
- [ ] Secure session storage
- [ ] Screen parity with web
- [ ] Offline tolerance
- [ ] Opt-in notifications
- [ ] Accessibility review

### apps/desktop

- [ ] Shell + update strategy
- [ ] Secure token storage
- [ ] Deep links
- [ ] Shared UI with web
- [ ] Transparent crash reporting

### apps/cli

- [ ] `bleverse dev`
- [ ] `bleverse doctor`
- [ ] Scaffold generators
- [ ] Admin helpers (seed, migrate, create-user)
- [ ] Release helpers

## components/

Presentation layer only.

### components/web

/blocks

- [ ] Feature-level composition blocks
- [ ] A11y primitives (focus, ARIA, keyboard patterns)
- [ ] Shared composition conventions

/ui

- [ ] Button, form, dialog, toast primitives
- [ ] Empty states
- [ ] Accessible defaults

## components/mobile

/blocks

- [ ] Feature-level mobile compositions
- [ ] Navigation patterns

/ui

- [ ] Shared mobile primitives
- [ ] Accessible defaults

## packages/

Reusable platform modules.

### packages/server

Backend runtime core.

- [ ] Route composition system
- [ ] Unified error model
- [ ] Middleware architecture
- [ ] Dependency injection pattern (if needed)
- [ ] Observability hooks
- [ ] Public API boundary enforcement

### packages/sdk

Public client contract layer.

- [ ] Typed API client
- [ ] DTO definitions
- [ ] Error normalization
- [ ] Auth-aware client (token refresh)
- [ ] Stable versioning guarantees
- [ ] Clear separation from server runtime

### packages/db

Persistence layer.

- [ ] Canonical schema
- [ ] Migration strategy
- [ ] Indexing strategy
- [ ] Seed fixtures
- [ ] Backup/restore docs

### packages/auth

- [ ] Session lifecycle
- [ ] Role/scopes model
- [ ] Multi-device sessions
- [ ] Audit events
- [ ] Hardened recovery flow

### packages/billing

- [ ] Plans + entitlements
- [ ] Subscription lifecycle
- [ ] Webhook ingestion
- [ ] Idempotency guarantees
- [ ] Transparent billing UX principles

### packages/storage

- [ ] Storage abstraction
- [ ] Signed URLs
- [ ] Access policies
- [ ] File constraints

### packages/kv

- [ ] Namespaced keys
- [ ] TTL rules
- [ ] Dev fallback
- [ ] Rate limiting primitives

### packages/email

- [ ] Transactional templates
- [ ] Optional i18n
- [ ] Bounce handling
- [ ] Rate limiting

### packages/env

- [ ] Typed schema
- [ ] Server/client split
- [ ] Fail-fast validation
- [ ] `.env.example`

### packages/convex

Cloud-specific backend logic.

- [ ] Clear scope definition
- [ ] Sync contracts
- [ ] Retry strategy
- [ ] Observability
- [ ] Data ownership clarity

### packages/tailwind

Design preset.

- [ ] Design tokens
- [ ] Light/dark themes
- [ ] Accessible contrast
- [ ] Shared preset across apps

### packages/tsconfig

- [ ] Unified strict policy
- [ ] Shared base configs
- [ ] Path aliases

## documentation/

- [ ] Architecture overview (apps vs packages)
- [ ] Dependency graph
- [ ] Setup guide
- [ ] Contribution guide
- [ ] Consent/privacy model
- [ ] ADRs for major changes

## scripts/

- [ ] CI helpers
- [ ] Release scripts
- [ ] Migration scripts
- [ ] Backup scripts
