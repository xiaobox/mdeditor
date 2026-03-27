# Phase 2: XSS Prevention - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 02-xss-prevention
**Areas discussed:** DOMPurify 配置策略, 净化注入点, SVG/MathML 兼容性, MarkdownGuide 净化策略
**Mode:** auto (all areas auto-selected, recommended defaults chosen)

---

## DOMPurify 配置策略

| Option | Description | Selected |
|--------|-------------|----------|
| 宽松白名单配置 | ADD_TAGS/ADD_ATTR 保留 SVG/MathML/style/class，FORBID_TAGS 阻止 script/iframe | ✓ |
| 严格默认配置 | 使用 DOMPurify 默认设置，仅按需放宽 | |
| 自定义 hook 配置 | 使用 beforeSanitizeElements 等 hook 精细控制 | |

**User's choice:** [auto] 宽松白名单配置 (recommended default)
**Notes:** Phase 需要保留 Mermaid SVG 和 MathJax 输出，严格默认会破坏渲染效果。白名单方式最直接可维护。

---

## 净化注入点

| Option | Description | Selected |
|--------|-------------|----------|
| 集中 sanitize.js 工具函数 | src/shared/utils/sanitize.js 导出 sanitizeHtml()，所有 v-html 站点调用 | ✓ |
| Vue 指令包装 | vue-dompurify-html 指令自动净化 | |
| 解析管道内嵌 | 在 Markdown 解析管道末端集成净化 | |

**User's choice:** [auto] 集中 sanitize.js 工具函数 (recommended default)
**Notes:** SEC-03 明确要求创建集中 sanitize.js。Vue 指令已被 Out of Scope 排除。解析管道内嵌会影响社交复制/导出管道。

---

## SVG/MathML 兼容性

| Option | Description | Selected |
|--------|-------------|----------|
| ADD_TAGS 白名单覆盖 | 枚举 SVG 族和 MathML 族标签，ADD_ATTR 保留必需属性 | ✓ |
| WHOLE_DOCUMENT 模式 | DOMPurify WHOLE_DOCUMENT 保留所有 SVG/MathML | |
| 分段净化 | SVG/MathML 内容先提取，净化后再拼回 | |

**User's choice:** [auto] ADD_TAGS 白名单覆盖 (recommended default)
**Notes:** 白名单方式安全性最高且可控。WHOLE_DOCUMENT 过于宽松，分段净化实现复杂。

---

## MarkdownGuide 净化策略

| Option | Description | Selected |
|--------|-------------|----------|
| 复用 sanitizeHtml() | 与 PreviewPane 使用同一净化函数，math demo 的 SVG 输出兼容 | ✓ |
| 跳过净化 | MarkdownGuide 内容为静态硬编码，无 XSS 风险 | |
| 独立配置 | 为 MarkdownGuide 创建更严格的净化配置 | |

**User's choice:** [auto] 复用 sanitizeHtml() (recommended default)
**Notes:** SEC-04 要求 defense-in-depth，即使内容为静态也应净化。复用同一函数零额外成本。

---

## Claude's Discretion

- DOMPurify 版本选择
- sanitizeHtml() 内部缓存策略
- 测试 XSS payload 选择
- DOMPurify hooks 使用决策

## Deferred Ideas

None — discussion stayed within phase scope
