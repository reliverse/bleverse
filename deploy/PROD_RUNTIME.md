# Bleverse production runtime policy

## Canonical roots
- dev: `/home/blefnk/dev/reliverse/bleverse`
- prod: `/home/deploy/prod/reliverse/bleverse`

## Production layout
Bleverse production uses a release-style runtime tree:
- `current -> releases/<release-id>`
- `previous -> releases/<release-id>`
- `releases/`
- `shared/`
- `metadata/`

The deploy workflow swaps `current` to a new release and records deploy history in `metadata/`.

## Checkout staging
Remote deploy staging now uses:
- `/home/deploy/prod/.checkouts`

Legacy `_tmp-source` is no longer part of the active deploy flow.

## Deploy registry
Canonical registry path:
- `/home/deploy/.config/bleverse/deploy.json`

Relevant app ids:
- `bleverse-web`
- `bleverse-api`

Registry entries for Bleverse should point `repoDir` at:
- `/home/deploy/prod/reliverse/bleverse/current`

## Repo fetch model
Bleverse is public.
Deploy workflow clones the source repository via HTTPS:
- `https://github.com/reliverse/bleverse.git`

## Runtime model
Current Bleverse prod services run from:
- `current/apps/web`
- `current/apps/api`

Bleverse does not currently require canonical shared env files under `shared/` for web/api startup.
The `shared/` directory remains reserved for future durable runtime config if needed.

## Systemd user units
Canonical unit templates live in:
- `deploy/systemd/bun-web-4000-bleverse-prod.service`
- `deploy/systemd/bun-api-4001-bleverse-prod.service`

## Operational note
If a Bleverse deploy fails after the runtime tree updates, check in this order:
1. `current` points to the intended release
2. `/home/deploy/.config/bleverse/deploy.json` points Bleverse apps to `.../current`
3. prod units still match the templates in `deploy/systemd/`
4. `.deploy-sha` exists in the active release and matches the requested ref
5. local/public health checks still pass for `4000` and `4001`
