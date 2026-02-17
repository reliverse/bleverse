# no-dead-code

Detect dead code in TS/TSX files + suppressions.

## Flag

- unused imports/vars/params
- unused funcs/components/hooks
- unreachable code (after return/throw/break/continue)
- React: unused destructured props; handlers never used in JSX

## Suppressions

- biome-ignore (broad → flag)
- @ts-expect-error (allow only with short reason)

## Rules

- Ban `@ts-ignore`.
- `@ts-expect-error` → must have reason + no safer fix.
- Flag `_` throwaways unless required by signature.
- Flag unused exports if clearly internal (not framework/public API).

## Ignore

- framework-discovered exports
- barrel public APIs
- type-only imports/exports, .d.ts
- explicit placeholders

## Output

file + line + reason + fix.  
High-confidence only.

---

## Options

{{OPTIONS}}

---

## Files

{{FILES}}
