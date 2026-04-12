# AI Agent Instructions

## Context

- Analytics dashboard for Umami (open-source analytics)
- SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS

## Decision Making

- Ambiguous requests: ask before acting
- Significant architectural changes: propose before implementing
- Unclear intent: ask clarifying questions

## Code Style

- Svelte 5 runes: `$state`, `$derived`, `$effect`
- Components: kebab-case (e.g., `settings-modal.svelte`)
- Prefer `$derived` over reactive declarations
- Keep effects minimal; prefer derived state

## Verification

Before claiming completion:

1. Run `pnpm check` (type checking)
2. Run `pnpm lint` (formatting/linting)
3. Fix errors before finishing

## Important

- No direct commits unless explicitly requested
- Never commit secrets or credentials
- Follow existing patterns in the codebase
