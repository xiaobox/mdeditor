---
phase: 04-bundle-optimization
plan: 01
subsystem: infra
tags: [vite, rollup, manualChunks, vendor-splitting, bundle-optimization]

# Dependency graph
requires:
  - phase: 02-xss-prevention
    provides: DOMPurify sanitize module (included in default vendor chunk)
provides:
  - 6 domain-based vendor chunks for cache-friendly browser caching
  - manualChunks function pattern in vite.config.js
  - 93% reduction in main chunk size (4,788 kB -> 318 kB)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [manualChunks function-form vendor splitting, mermaid dynamic chunk exclusion]

key-files:
  created: []
  modified: [vite.config.js]

key-decisions:
  - "Function-form manualChunks with id.includes() path matching for maximum flexibility"
  - "Mermaid /dist/chunks/ excluded to preserve 22 dynamic diagram sub-module files"
  - "vendor-mathjax is largest chunk at 1,797 kB but within acceptable range (no strict per-chunk limit per D-08)"

patterns-established:
  - "manualChunks: check node_modules path prefix to assign vendor group, return undefined for default"
  - "Mermaid exclusion: always check !id.includes('/dist/chunks/') before assigning vendor-mermaid"

requirements-completed: [BLD-01, BLD-02]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 04 Plan 01: Bundle Optimization Summary

**Vite manualChunks 将 4,788 kB 单体 bundle 拆分为 6 个 vendor chunk，主 chunk 缩减至 318 kB，Mermaid 22 个动态图表 chunk 完整保留**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-28T10:19:43Z
- **Completed:** 2026-03-28T10:23:43Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- 将 4,788 kB 单体 index-*.js 拆分为 6 个缓存友好的 vendor chunk + 318 kB 主 chunk
- Mermaid 22 个动态 import 图表 chunk 完整保留，数量与优化前一致
- Web 构建和 Electron 构建均成功，vendor chunk 正常生成
- 428 个测试全部通过，零回归

## Build Output Summary

### Vendor Chunk Sizes (Web Build)

| Chunk | Size (kB) | Gzip (kB) | Contents |
|-------|-----------|-----------|----------|
| vendor-vue | 137 | 49 | Vue 3, @vue/*, vue-i18n |
| vendor-codemirror | 596 | 203 | CodeMirror 6, @codemirror/*, vue-codemirror |
| vendor-milkdown | 858 | 265 | @milkdown/* (含 ProseMirror) |
| vendor-mermaid | 530 | 151 | Mermaid 核心 (不含图表子模块) |
| vendor-mathjax | 1,797 | 621 | mathjax-full |
| vendor-export | 593 | 177 | html2canvas, jspdf |
| **index (main)** | **318** | **102** | **应用代码 + 未分组小型依赖** |

### Comparison

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Main chunk | 4,788 kB | 318 kB | -93% |
| Total JS files | 50 | 47 | -3 (prosemirror chunk absorbed into vendor-milkdown) |
| Mermaid diagram chunks | 22 | 22 | 0 (preserved) |
| Build time | ~17s | ~16s | ~same |

## Task Commits

Each task was committed atomically:

1. **Task 1: Add manualChunks function to vite.config.js and verify build output** - `1ae853f` (feat)
2. **Task 2: Run full test suite and verify no runtime regression** - verification only, no file changes

## Files Created/Modified

- `vite.config.js` - Added manualChunks function (6 vendor groups) and rollupOptions.output configuration

## Decisions Made

- **Function-form manualChunks**: 使用函数形式而非对象形式，支持条件排除 Mermaid 动态 chunk (per D-01)
- **Mermaid /dist/chunks/ 排除**: `!id.includes('/dist/chunks/')` 确保图表子模块保持独立动态加载 (per D-04)
- **vendor-mathjax 为最大 chunk (1,797 kB)**: mathjax-full 库体积较大但无法进一步拆分，符合 D-08 (无严格单 chunk 大小限制)
- **小型依赖归入默认 chunk**: prismjs, dompurify, github-markdown-css 等未单独分组，交由 Rollup 自动处理 (per D-03)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 04 (bundle-optimization) 为项目最后一个阶段，已完成全部计划
- 所有安全加固、XSS 防护、错误可观测性、构建优化均已就绪

## Self-Check: PASSED

- vite.config.js: FOUND
- 04-01-SUMMARY.md: FOUND
- Commit 1ae853f: FOUND
- manualChunks references in config: 3
- Vendor chunks in dist: 6

---
*Phase: 04-bundle-optimization*
*Completed: 2026-03-28*
