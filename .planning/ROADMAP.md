# Roadmap: MDEditor Security Hardening

## Overview

This milestone eliminates known security vulnerabilities and infrastructure gaps in the MDEditor codebase through four independent, rollback-safe changes: patching the svgo DoS vulnerability, integrating DOMPurify at the preview rendering boundary, instrumenting silent catch blocks with structured logging, and splitting the monolithic production bundle into cache-friendly vendor chunks. Each phase builds on a clean baseline from the previous one, and the entire milestone introduces exactly one new direct dependency (DOMPurify).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Dependency Vulnerability Patch** - Upgrade svgo to fix CVE-2026-29074 and establish a known-good test baseline
- [ ] **Phase 2: XSS Prevention** - Integrate DOMPurify at all v-html boundaries while preserving rendering fidelity
- [ ] **Phase 3: Error Observability** - Replace 7 empty catch blocks with structured module-logger instrumentation
- [ ] **Phase 4: Bundle Optimization** - Split 4.8MB monolithic bundle into domain-based vendor chunks via Vite manualChunks

## Phase Details

### Phase 1: Dependency Vulnerability Patch
**Goal**: The project has zero actionable high-severity production dependency vulnerabilities and a verified green test baseline
**Depends on**: Nothing (first phase)
**Requirements**: SEC-02, TST-03
**Success Criteria** (what must be TRUE):
  1. `npm audit --omit=dev` reports no HIGH-severity vulnerabilities in direct production dependencies
  2. All 394 existing tests pass without modification after the svgo upgrade
  3. Test coverage remains at or above the 80% threshold
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — 升级 svgo 至 4.0.1 并验证测试基线和构建完整性

### Phase 2: XSS Prevention
**Goal**: The preview pane is immune to XSS injection while preserving all visual rendering fidelity across themes, diagrams, and export paths
**Depends on**: Phase 1
**Requirements**: SEC-01, SEC-03, SEC-04, SEC-05, TST-01
**Success Criteria** (what must be TRUE):
  1. Injecting known XSS payloads (script tags, event handlers, javascript: URIs) into Markdown source produces no executable code in the preview pane
  2. Inline-styled HTML, CSS classes, and theme-driven styling render identically before and after sanitization
  3. Mermaid diagrams (SVG) and MathML content render correctly in the preview pane after sanitization
  4. Social copy and PDF/image export pipelines produce unchanged output (sanitization does not affect non-preview paths)
  5. A centralized `sanitize.js` utility exists and all v-html sites (PreviewPane, MarkdownGuide) consume it
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Install DOMPurify, create sanitize.js module with TDD test coverage
- [x] 02-02-PLAN.md — Integrate sanitizeHtml into PreviewPane and MarkdownGuide v-html sites

### Phase 3: Error Observability
**Goal**: Every previously-silent error path surfaces diagnostic information through the existing module logger infrastructure
**Depends on**: Phase 2
**Requirements**: OBS-01, OBS-02, TST-02
**Success Criteria** (what must be TRUE):
  1. All 7 previously-empty catch blocks produce structured log output (module name, operation description, error object) when triggered
  2. Cleanup and fallback catch blocks use debug level; recoverable failure catch blocks use warn level
  3. Triggering error paths in dev mode produces visible console output with actionable diagnostic context
**Plans**: TBD

### Phase 4: Bundle Optimization
**Goal**: The production build is split into cache-friendly vendor chunks without altering runtime loading behavior
**Depends on**: Phase 3
**Requirements**: BLD-01, BLD-02
**Success Criteria** (what must be TRUE):
  1. `npm run build` produces multiple domain-based vendor chunks instead of a single 4.8MB monolith
  2. Mermaid's existing ~25 dynamic import chunks (diagram submodules) remain as separate files in the build output
  3. `npm run preview` loads the application with all features working identically to pre-optimization (editing, preview, themes, export, social copy)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dependency Vulnerability Patch | 0/1 | Planning complete | - |
| 2. XSS Prevention | 0/2 | Planning complete | - |
| 3. Error Observability | 0/0 | Not started | - |
| 4. Bundle Optimization | 0/0 | Not started | - |
