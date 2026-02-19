# Bleverse

[bleverse.com](https://bleverse.com) is an open-source social platform built around clarity, consent, and modular architecture.

**Calm by default. Powerful by design.**

Bleverse is not just a social network. It is:

- A place where identity and projects can stay.
- A modular foundation for human-first platforms.
- A reference implementation of ethical social infrastructure.
- A bun-based TS monorepo built for long-term maintainability.

## Principles

- Designed to respect attention.
- Clear system boundaries.
- Open by architecture.
- Modular by design.

## Philosophy

- No dark patterns.
- Feed is optional.
- Ranking is explainable.
- Accessibility by default.
- Consent precedes automation.
- System actions are visible and reversible.
- Personalization is explicit and user-controlled.

## Contributing

We welcome contributions ❤️

- [Report issues or suggest features](https://github.com/reliverse/bleverse/issues)
- [Support financially via GitHub Sponsors](https://github.com/sponsors/blefnk)
- Contribute code ([contributing.md](CONTRIBUTING.md)/[roadmap.md](ROADMAP.md))

## Documentation

Documentation lives on [https://docs.bleverse.com](https://docs.bleverse.com)

## Code Contribution Quickstart

```bash
bun install
bun dev:web

# Exact commands may vary by app
# Please refer to documentation
```

## Architecture

Bleverse is structured as a modular monorepo.

```bash
apps/         → deployable runtimes
packages/     → reusable platform modules
components/   → UI libraries (web & mobile)
scripts/      → automation
documentation/
```

Core Layers:

- `packages/server` → backend runtime core
- `packages/sdk` → public client contract layer
- `packages/db` → persistence layer
- `packages/auth` → identity & sessions
- `packages/billing` → subscriptions & entitlements
- `packages/storage` → file abstraction
- `packages/convex` → cloud backend logic

Applications:

- `apps/api` → backend entrypoint
- `apps/web` → bleverse.com
- `apps/cli`
- `apps/mobile`
- `apps/desktop`

Boundaries:

- Apps depend on packages.
- SDK never depends on server.
- Packages never depend on apps.
- Database layer is isolated from runtime.

## Security

If you find a security issue, report it privately. See [SECURITY.md](SECURITY.md).

## License

Copyright © 2026–present Nazarii Korniienko

Licensed under the [Apache License 2.0](LICENSE). Some apps or packages may define additional licenses. See individual `LICENSE` files for details.
