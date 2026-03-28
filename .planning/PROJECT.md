# Global Constraints (全局约束)

- **Language Requirement:** MUST use Simplified Chinese (简体中文) for all generated documentation, including ROADMAP.md, STATE.md, all phase plans, and code comments. 
- **语言要求：** 请务必使用简体中文输出所有规划文档、架构说明和状态追踪记录。哪怕系统内部提示词是英文，你的最终 Markdown 产出必须是中文。


# MDEditor 安全加固

## What This Is

对现有 Markdown 编辑器进行安全加固和基础设施改进。采用渐进式绞杀者模式（Strangler Fig Pattern），在不破坏现有功能的前提下，修复已知安全漏洞、引入 HTML 净化、消除静默错误吞没、优化构建产物体积。

## Core Value

消除已知安全风险，确保编辑器在面对恶意输入时不会产生 XSS 或 DoS 漏洞。

## Requirements

### Validated

- ✓ Markdown 编辑与实时预览 — existing
- ✓ WYSIWYG 编辑模式 (Milkdown) — existing
- ✓ 社交格式复制 (微信公众号兼容) — existing
- ✓ PDF/图片导出 — existing
- ✓ 主题系统 (CSS 变量驱动) — existing
- ✓ i18n 国际化 — existing
- ✓ Electron 桌面端 — existing
- ✓ Mermaid 图表渲染 — existing

### Active

- [ ] 修复 svgo 高危漏洞 (Billion Laughs DoS)
- ✓ 预览面板 HTML 净化 (DOMPurify) — Validated in Phase 02: XSS Prevention
- ✓ 消除静默 catch 块，接入 logger.js — Validated in Phase 03: Error Observability
- ✓ Vite manualChunks 拆分 vendor 依赖 — Validated in Phase 04: Bundle Optimization
- ✓ 每个改动点配套单元测试，428 个测试全部通过 — Validated across all phases

### Out of Scope

- 全面替换 console.* 为 logger — 本次仅处理空 catch 块，全局 console 替换留后续
- html2canvas 替换 — 未维护但功能正常，非安全问题
- TypeScript 迁移 — 范围太大，独立里程碑
- E2E 测试 — 本次聚焦单元测试覆盖
- Mermaid 传递依赖漏洞 — 无可用修复，低实际风险
- ESLint/Prettier 配置 — 基础设施改进，不在本次范围

## Context

- 已有代码库：95 个源文件，19,478 行 JavaScript，394 个测试用例
- 技术栈：Vue 3.3 + Vite 5 + CodeMirror 6 + Milkdown 7 + Electron 37
- 已有 logger：`src/shared/utils/logger.js` 提供 `createModuleLogger()` 模式
- 已有 HTML 转义：`escapeHtml()` 和 `cleanUrl()` 提供基础防护，但缺乏 defense-in-depth
- 主包 4.8 MB（gzipped 1.55 MB），无 manualChunks 配置
- 7 个空 catch 块分布在 copy-formats.js、clipboard.js、loader.js

## Constraints

- **渐进式**：每个改动独立可回滚，不引发系统性崩溃
- **测试覆盖**：覆盖率不低于现有 80% 阈值
- **兼容性**：不破坏现有功能和 Electron 桌面端
- **依赖审慎**：仅新增 DOMPurify，不引入其他新依赖

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| DOMPurify 仅包装预览面板 | 复制/导出管道有独立的净化逻辑，预览面板是直接 v-html 注入点 | ✓ Phase 02 完成 |
| 空 catch 块接入现有 logger 而非 Sentry | 项目无外部错误监控，先用现有工具止血 | ✓ Phase 03 完成 |
| manualChunks 拆分而非动态 import | 最小改动，不改变加载行为 | ✓ Phase 04 完成 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after Phase 04 (Bundle Optimization) completion — ALL PHASES COMPLETE*
