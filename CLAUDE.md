# CLAUDE.md — ai-harness

## What This Is
A public web app where visitors watch a multi-agent AI factory build a feature in real time (plan → build → QA → PR). Hybrid: public sees recorded runs replayed over SSE; owner can trigger real runs.

## Stack
- Next.js 16 (App Router, `src/` dir, TypeScript)
- React 19
- Tailwind CSS v4
- Server-Sent Events via Route Handler (`ReadableStream`)
- Vitest 4 + React Testing Library + jsdom
- Deployed on Vercel (auto-deploy on push)

## Code Style
- TypeScript strict mode; `type` over `interface`
- Arrow functions preferred
- Colocated tests: `*.test.ts` / `*.test.tsx` next to source (or `__tests__/`)
- No `any` — model data with explicit types
- Keep components small and pure where possible

## Source of Truth
- **Behavior** is defined in `docs/DESIGN.md` (Given/When/Then). If the code disagrees with the spec, the spec wins — fix the code or update the spec first.
- **Architecture / how it works** is in `docs/ARCHITECTURE.md`.

## TDD is Mandatory
RED → GREEN → REFACTOR. No implementation before a failing test. One test → one impl → repeat (vertical slices, not all-tests-then-all-code).

## When Done
Run `npm test` (and `npm run build` for route/build changes). Report: files created/modified, test count, how to run.
