# Phase 4: Bundle Optimization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 04-bundle-optimization
**Areas discussed:** Chunk grouping strategy, Chunk naming convention, Size target
**Mode:** auto (all decisions auto-selected using recommended defaults)

---

## Chunk Grouping Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Domain-based groups (6 vendor chunks) | vue-core, codemirror, milkdown, mermaid, mathjax, export-tools | ✓ |
| Single vendor chunk | 所有 node_modules 合并为一个 vendor.js | |
| Per-package splitting | 每个 npm 包一个 chunk | |

**User's choice:** [auto] Domain-based groups (recommended default, matches BLD-01 requirement)
**Notes:** 6 个领域分组与项目主要功能模块对齐

---

## Chunk Naming Convention

| Option | Description | Selected |
|--------|-------------|----------|
| Claude's discretion | 使用描述性名称匹配领域分组 | ✓ |
| Hash-only naming | 仅使用 content hash | |

**User's choice:** [auto] Claude's discretion (recommended default)
**Notes:** Vite 默认添加 content hash 后缀

---

## Size Target

| Option | Description | Selected |
|--------|-------------|----------|
| No strict per-chunk limit | 目标是打散单体，不设硬性上限 | ✓ |
| Strict 500KB per chunk | 每个 chunk 不超过 500KB | |

**User's choice:** [auto] No strict per-chunk limit (recommended default)
**Notes:** 部分依赖（如 mermaid 核心）本身较大，强制拆分会增加复杂度

---

## Claude's Discretion

- manualChunks 路径匹配逻辑细节
- 小型依赖分组决策
- Vendor chunk hash 策略

## Deferred Ideas

None — discussion stayed within phase scope
