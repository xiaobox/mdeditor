---
phase: 04
slug: bundle-optimization
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 1.6.1 + npm run build |
| **Config file** | vite.config.js |
| **Quick run command** | `npm run build 2>&1 \| tail -30` |
| **Full suite command** | `npm run test:run && npm run build` |
| **Estimated runtime** | ~35 seconds (tests ~15s + build ~20s) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build 2>&1 | tail -30`
- **After every plan wave:** Run `npm run test:run && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + build produces expected chunks
- **Max feedback latency:** 35 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BLD-01 | build | `npm run build 2>&1 \| grep vendor` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | BLD-02 | build | `npm run build 2>&1 \| grep -c Diagram` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files needed — verification is via build output analysis.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All features work after optimization | BLD-01 | Full app walkthrough required | Run `npm run preview`, test editing, preview, themes, export, social copy |
| Electron build succeeds | BLD-01 | Platform-specific packaging | Run `npm run build:electron` if available |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 35s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
