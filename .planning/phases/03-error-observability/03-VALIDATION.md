---
phase: 03
slug: error-observability
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 1.6.1 |
| **Config file** | vitest.config.js |
| **Quick run command** | `npm run test:run -- tests/core/editor/` |
| **Full suite command** | `npm run test:run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:run -- tests/core/editor/`
- **After every plan wave:** Run `npm run test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | OBS-01, OBS-02 | unit | `npm run test:run -- tests/core/editor/clipboard-logger.test.js` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | OBS-01, OBS-02 | unit | `npm run test:run -- tests/core/theme/loader-logger.test.js` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | OBS-01, OBS-02 | unit | `npm run test:run -- tests/core/editor/copy-formats-logger.test.js` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | TST-02 | integration | `npm run test:run -- tests/core/` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/core/editor/clipboard-logger.test.js` — stubs for OBS-01 clipboard catch block
- [ ] `tests/core/theme/loader-logger.test.js` — stubs for OBS-01 loader catch block
- [ ] `tests/core/editor/copy-formats-logger.test.js` — stubs for OBS-01 copy-formats catch blocks

*Existing vitest infrastructure covers all phase requirements. Only new test files needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dev console visibility | OBS-02 | Visual inspection of console output format | Trigger each error path in dev mode, verify timestamp + module prefix + error context visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
