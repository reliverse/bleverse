# Contributing

Thanks for wanting to help. Bleverse is built around clarity, consent, and modularity — contributions should follow the same spirit.

## Ways to Contribute

- Report bugs and request features via issues
- Improve docs
- Submit pull requests
- Share feedback on UX, accessibility, and architecture
- Support the project financially via [GitHub Sponsors](https://github.com/sponsors/blefnk)

## Before You Start

- Be kind and constructive.
- Prefer small, focused changes over large rewrites.
- If you're planning a bigger change, open an issue first to align on direction.

## Development Setup

> Note: this repository uses [Bun](https://bun.com) as the package manager, a runtime, and a testing framework.

If you're unsure what to run for a specific package/app, check the nearest `package.json` scripts.

1. Fork this repo
2. Clone your fork
3. Install deps
4. Run the dev server

```bash
git clone https://github.com/your-fork-username/bleverse.git
cd bleverse
bun install
bun dev:web
```

> **Project Status**: v0.x. Work in progress. APIs and features may change.

## Code Style

- Follow the existing patterns in the codebase.
- Keep changes readable and modular.
- Prefer explicit behavior over "magic".
- Avoid unrelated refactors in the same PR.

## Commits

Prefer clear, descriptive commit messages. Conventional Commits are welcome if the repo already uses them often.

Examples:

- `feat: add profile privacy toggle`
- `fix: prevent feed flash on refresh`
- `docs: clarify local setup`

## Tests

- Add or update tests when behavior changes.
- If there are no tests yet for an area, add the simplest practical coverage.
- Make sure the project builds and runs locally before opening a PR.

## Documentation

If your change affects behavior, UX, or configuration:

- Update relevant docs in `apps/docs`
- Add notes for any new env vars, flags, or breaking changes

## Pull Requests

When opening a PR, please include:

- What you changed and why
- Screenshots / recordings for UI changes (when applicable)
- Any follow-ups or known limitations

PRs should be focused and easy to review. If you have multiple unrelated changes, split them into separate PRs.

## Reporting Issues

When opening an issue, include:

- Steps to reproduce
- Expected vs actual behavior
- Logs or screenshots if relevant
- Environment details (OS, browser, version info)

## Security Issues

Please **do not** report vulnerabilities publicly. See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the project's license(s) (see `LICENSE` and package-level licenses where applicable).
