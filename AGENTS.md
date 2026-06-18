# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 16 SaaS application for online raffles. Keep feature code under `src/` and infrastructure artifacts outside it.

- `src/app/`: App Router pages, layouts, error states, and Server Actions in `src/app/actions/`.
- `src/components/`: UI and feature components grouped by domain such as `admin/`, `auth/`, `payments/`, and `raffles/`.
- `src/lib/`: shared business logic for auth, Supabase, storage, billing helpers, and platform settings.
- `src/types/`: TypeScript domain models.
- `supabase/migrations/`: ordered SQL migrations; never rewrite shipped migrations.
- `docs/`: product, security, and operations documentation.
- `scripts/`: repo checks such as env validation, security audit, and performance measurement.

## Build, Test, and Development Commands
- `npm run dev`: start the local Next.js server.
- `npm run lint`: run ESLint for `src/` and config files.
- `npm run check:env`: validate required `.env.local` values before build or deploy.
- `npm run build`: run env checks, then create the production build.
- `npm run audit:security`: scan for unsafe patterns and leaked secrets.
- `npm run measure:performance`: run the local performance measurement script.

## Coding Style & Naming Conventions
Use TypeScript with `strict` mode and the `@/*` import alias. Follow the existing style: 2-space indentation, double quotes, semicolons, and small focused modules.

- Components: PascalCase file names such as `RaffleCard.tsx` are not used here; prefer kebab-case files like `raffle-card.tsx`.
- Helpers and actions: lower-case descriptive names such as `require-admin.ts` or `checkout.ts`.
- Keep tenant-aware logic in `src/lib/` or Server Actions, not in presentational components.

## Testing Guidelines
There is no dedicated automated test suite configured yet. Until one is added, every change must pass `npm run lint`, `npm run build`, and `npm run audit:security`.

For changes affecting auth, payments, or tenant isolation, also validate the relevant flow manually and note the result in the PR.

## Commit & Pull Request Guidelines
Git history uses Conventional Commits: `feat:`, `fix:`, `chore:`, `perf:`. Keep subjects imperative and specific, for example `fix: validate Supabase environment configuration`.

PRs should include a short summary, affected areas, migration or env changes, and screenshots for UI updates. If a change touches multi-tenant access, billing, or Supabase policies, call that out explicitly.

## Security & Configuration Tips
Never commit real secrets in `.env.local`. Document new variables in `.env.local.example`. Preserve tenant isolation in queries, policies, and indexes, and add a migration for every database change under `supabase/migrations/`.
