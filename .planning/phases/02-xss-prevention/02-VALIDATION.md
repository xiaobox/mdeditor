---
phase: 02
slug: xss-prevention
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 1.6.1 + jsdom 23.2.0 |
| **Config file** | `vitest.config.js` |
| **Quick run command** | `npm run test:run -- tests/shared/utils/sanitize.test.js` |
| **Full suite command** | `npm run test:run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:run -- tests/shared/utils/sanitize.test.js`
- **After every plan wave:** Run `npm run test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SEC-03 | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SEC-01 | unit | `npm run test:run -- tests/components/PreviewPane.test.js` | ✅ | ⬜ pending |
| 02-01-03 | 01 | 1 | SEC-04 | unit | `npm run test:run -- tests/components/MarkdownGuide.test.js` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | SEC-05, TST-01 | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/shared/utils/sanitize.test.js` — stubs for SEC-03, SEC-05, TST-01
- [ ] Existing test infrastructure covers framework needs (Vitest + jsdom already configured)

*Existing infrastructure covers framework requirements. Only test files for new sanitize.js module needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mermaid diagram renders correctly after sanitization | SEC-05 | SVG rendering requires browser visual verification | Load markdown with mermaid code block, verify diagram renders in preview |
| Theme-driven styling preserved | SEC-05 | Visual comparison needed | Switch themes, verify preview styling unchanged |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
