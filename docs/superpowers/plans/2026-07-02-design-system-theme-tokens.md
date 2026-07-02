# Fase 2 Design System and Theme Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o bloqueio de build e consolidar um design system reutilizavel com theme tokens completos para white label sem alterar regras centrais de negocio.

**Architecture:** A correcao do build ficara isolada na configuracao de TypeScript para remover artefatos de desenvolvimento do type check. O design system sera expandido em torno de tokens CSS semanticos e helpers de tema server-safe, preservando componentes atuais e substituindo estilos acoplados gradualmente. A camada white label continuara baseada em `platform_settings`, mas passara a expor tokens de superficie, estados e navegacao para habilitar futuras refatoracoes visuais sem tocar logica.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, React 19, Node test runner

---

### Task 1: Fix Build Pipeline Safely

**Files:**
- Modify: `tsconfig.json`
- Test: `npm run build`

- [ ] **Step 1: Remove dev-generated types from TypeScript include**

Update `tsconfig.json` para manter `next-env.d.ts`, `**/*.ts`, `**/*.tsx`, `.next/types/**/*.ts` e `**/*.mts`, removendo `.next/dev/types/**/*.ts`.

- [ ] **Step 2: Run build to verify the previous validator failure is gone**

Run: `npm run build`
Expected: build proceeds past the previous `.next/dev/types/validator.ts` error. If another legitimate app type error appears, fix that error in the next task rather than restoring dev validator paths.

### Task 2: Add Theme Token Model and Tests

**Files:**
- Create: `tests/platform-theme.test.mjs`
- Modify: `src/types/platform-settings.ts`
- Modify: `src/lib/platform-settings/theme.ts`

- [ ] **Step 1: Write failing tests for token resolution**

Add tests that verify:
- hex color validation still works
- theme resolution returns semantic tokens for primary, secondary, accent, background, surface, card, border, muted, success, warning, danger, header, sidebar and footer
- readable foregrounds are generated for strong accent colors

- [ ] **Step 2: Run test file and verify failure**

Run: `node --test tests/platform-theme.test.mjs`
Expected: FAIL because current theme helper does not yet expose the new semantic token map.

- [ ] **Step 3: Implement typed theme token helpers**

Refactor `src/lib/platform-settings/theme.ts` to expose a semantic token builder and extend `src/types/platform-settings.ts` with theme token types used by the helper.

- [ ] **Step 4: Re-run theme tests**

Run: `node --test tests/platform-theme.test.mjs`
Expected: PASS

### Task 3: Expand Global Token Surface

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add semantic CSS variables**

Introduce root and Tailwind theme variables for:
- background
- foreground
- muted
- border
- surface
- surface-raised
- card
- card-foreground
- input
- input-foreground
- header
- header-foreground
- footer
- footer-foreground
- sidebar
- sidebar-foreground
- primary
- primary-foreground
- secondary
- secondary-foreground
- accent
- accent-foreground
- success
- success-foreground
- warning
- warning-foreground
- danger
- danger-foreground
- info
- info-foreground

- [ ] **Step 2: Preserve existing visual behavior while shifting components toward semantic tokens**

Keep the current dark premium visual direction, but rebase color references on semantic tokens so future screens can be themed without ad hoc color classes.

### Task 4: Refactor Core UI Primitives

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/loading-state.tsx`
- Modify: `src/components/ui/empty-state.tsx`
- Modify: `src/components/ui/modal.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/alert.tsx`
- Create: `src/components/ui/stat-card.tsx`
- Create: `src/components/ui/section-heading.tsx`

- [ ] **Step 1: Add missing reusable primitives**

Create lightweight reusable components for:
- skeleton
- alert
- stat card
- section heading

- [ ] **Step 2: Rebase existing primitives on semantic tokens**

Update button, card, input, select, textarea, badge, loading state, empty state and modal to consume semantic token classes instead of local one-off colors wherever possible.

- [ ] **Step 3: Preserve API compatibility**

Do not rename existing props or remove existing variants used by current pages.

### Task 5: Apply Theme Tokens at Platform Entry Points

**Files:**
- Modify: `src/lib/platform-settings/defaults.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Align default platform values with expanded token model**

Keep database-backed settings unchanged, but ensure the default visual palette maps cleanly into the new token system.

- [ ] **Step 2: Keep root layout stable**

Continue injecting theme styles at `<html>` level through `getPlatformThemeStyle(settings)` so white label behavior remains centralized.

### Task 6: Full Verification

**Files:**
- Verify only

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run security audit**

Run: `npm run audit:security`
Expected: PASS

- [ ] **Step 4: Run env check**

Run: `npm run check:env`
Expected: PASS with only expected operational warnings

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: PASS
