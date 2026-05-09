# Steam Ban Checker Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first Next.js app that checks Steam ban status for single accounts and reusable imported account collections.

**Architecture:** Next.js App Router serves the UI and local API proxy. Client modules handle file parsing, IndexedDB persistence, and result-state orchestration. Server modules keep the Steam API key private and normalize Steam Web API responses.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Framer Motion, Dexie, TanStack Table, Vitest, Testing Library.

---

## Chunk 1: Project Foundation

### Task 1: Scaffold and Standards

**Files:**
- Create: `package.json`
- Create: `src/app/*`
- Create: `src/lib/*`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] Scaffold Next.js with TypeScript, App Router, ESLint, Tailwind, and `src/`.
- [ ] Add runtime dependencies: `@tanstack/react-table`, `dexie`, `framer-motion`, `lucide-react`, `papaparse`, `zod`.
- [ ] Add test dependencies: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- [ ] Configure Vitest.
- [ ] Commit as `chore: scaffold next app`.

## Chunk 2: Domain and API

### Task 2: Steam Input Parsing

**Files:**
- Create: `src/lib/steam/parse.ts`
- Create: `src/lib/steam/parse.test.ts`

- [ ] Write tests for SteamID64, profile URL, vanity URL, duplicate whitespace, and invalid input.
- [ ] Implement parser and run tests.
- [ ] Commit as `feat: add steam identifier parsing`.

### Task 3: Import Parsing

**Files:**
- Create: `src/lib/import/parse-import.ts`
- Create: `src/lib/import/parse-import.test.ts`

- [ ] Write tests for TXT line lists, CSV first-column lists, duplicate removal, and empty files.
- [ ] Implement import parser.
- [ ] Commit as `feat: add account import parsing`.

### Task 4: Steam API Proxy

**Files:**
- Create: `src/lib/steam/api.ts`
- Create: `src/lib/steam/types.ts`
- Create: `src/app/api/steam/lookup/route.ts`
- Create: `src/app/api/steam/batch/route.ts`
- Create: `src/app/api/steam/resolve/route.ts`
- Create: `src/app/api/health/route.ts`

- [ ] Implement server-side API key checks.
- [ ] Implement ResolveVanityURL, GetPlayerBans, and GetPlayerSummaries proxy helpers.
- [ ] Implement batch lookup with row-level failures.
- [ ] Commit as `feat: add steam api proxy`.

## Chunk 3: Local Persistence

### Task 5: IndexedDB Store

**Files:**
- Create: `src/lib/storage/db.ts`
- Create: `src/lib/storage/repositories.ts`
- Create: `src/lib/storage/types.ts`

- [ ] Define collections, query runs, and result records.
- [ ] Add repository functions for creating collections, listing collections, storing query runs, and reading history.
- [ ] Commit as `feat: add local persistence`.

## Chunk 4: UI

### Task 6: Shared Components

**Files:**
- Create: `src/components/ui/*`
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/steam/*`

- [ ] Add reusable buttons, inputs, status pills, empty states, and result cards.
- [ ] Keep components typed, focused, and reusable for later maFile/account-management modules.
- [ ] Commit as `feat: add shared ui components`.

### Task 7: Search Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/search/search-workspace.tsx`

- [ ] Implement centered search.
- [ ] Implement single lookup flow.
- [ ] Implement file import flow and current batch query.
- [ ] Show single details for one account and compact rows for batch.
- [ ] Commit as `feat: build search workflow`.

### Task 8: Collections and History Pages

**Files:**
- Create: `src/app/collections/page.tsx`
- Create: `src/app/history/page.tsx`
- Create: `src/components/collections/*`
- Create: `src/components/history/*`

- [ ] Collections list saved imports and can rerun a full collection.
- [ ] History lists single and batch query runs.
- [ ] Commit as `feat: add collections and history`.

## Chunk 5: Verification

### Task 9: Final Checks

- [ ] Run `npm.cmd test`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run build`.
- [ ] Start dev server and inspect the app in browser.
- [ ] Commit as needed.
