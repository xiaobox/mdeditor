# Phase 2: XSS Prevention - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

在预览面板（PreviewPane）和 Markdown 指南（MarkdownGuide）的所有 v-html 注入点集成 DOMPurify 净化，阻止 XSS 攻击，同时保留内联样式、CSS class、SVG（Mermaid 图表）和 MathML（数学公式）的完整渲染效果。社交复制和 PDF/图片导出管道不受影响。

</domain>

<decisions>
## Implementation Decisions

### DOMPurify 配置策略
- **D-01:** 使用宽松白名单配置 — `ADD_TAGS` 添加 SVG 族标签（svg, g, path, circle, rect, line, polyline, polygon, text, tspan, defs, marker, use, clipPath, foreignObject 等）和 MathML 族标签（math, mi, mo, mn, mrow, mfrac, msqrt, msub, msup, munder, mover, mtable, mtr, mtd, mtext, annotation 等）
- **D-02:** `ADD_ATTR` 保留 style, class, d, viewBox, xmlns, fill, stroke, transform, width, height, x, y, cx, cy, r, rx, ry, points, marker-end, font-size, text-anchor 等 SVG/MathML 必需属性
- **D-03:** `FORBID_TAGS` 显式阻止 script, iframe, object, embed, form, input, textarea — 即使白名单宽松也确保这些标签被移除
- **D-04:** 保留 `ALLOW_DATA_ATTR: false`（默认值）— data-* 属性仅在 Mermaid 需要时按需开放

### 净化注入点
- **D-05:** 创建 `src/shared/utils/sanitize.js` 集中管理 DOMPurify 配置，导出 `sanitizeHtml(html)` 方法（满足 SEC-03）
- **D-06:** `PreviewPane.vue` 在 v-html 绑定前调用 `sanitizeHtml(renderedHtml)` 净化（满足 SEC-01）
- **D-07:** `MarkdownGuide.vue` 的 math demo v-html 同样通过 `sanitizeHtml()` 净化（满足 SEC-04，defense-in-depth）
- **D-08:** 不使用 vue-dompurify-html 指令 — 直接调用函数更透明可测（已在 Out of Scope 中确认）

### 社交复制/导出隔离
- **D-09:** 社交复制（copySocialFormat）和 PDF/图片导出管道**不**经过 DOMPurify — 这些管道有独立的净化逻辑（escapeHtml, cleanUrl），且输出不通过 v-html 渲染。保持现有行为不变（满足 SC-4）

### 测试策略
- **D-10:** 单元测试覆盖三类场景：XSS payload 被移除（script/onerror/javascript: URI）、合法 styled HTML 保留（inline style/class）、Mermaid SVG class 保留（满足 TST-01）
- **D-11:** 回归测试验证净化后预览效果不变 — 使用典型 Markdown 内容（含代码块、表格、数学公式、Mermaid 图表）对比净化前后输出

### Claude's Discretion
- DOMPurify 具体版本选择 — 使用最新稳定版
- sanitizeHtml() 内部是否缓存 DOMPurify 实例 — 性能优化细节
- 测试用例的具体 XSS payload 选择 — 覆盖 OWASP 常见向量即可
- 是否需要 DOMPurify hooks（beforeSanitizeElements 等）— 仅在白名单不够时使用

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 安全需求
- `.planning/REQUIREMENTS.md` §Security — SEC-01, SEC-03, SEC-04, SEC-05 定义净化需求
- `.planning/PROJECT.md` §Key Decisions — "DOMPurify 仅包装预览面板" 决策
- `.planning/PROJECT.md` §Out of Scope — vue-dompurify-html 排除

### v-html 站点
- `src/components/PreviewPane.vue:43` — 主预览面板 v-html（SEC-01 目标）
- `src/components/MarkdownGuide.vue:272-283` — math demo v-html（SEC-04 目标）

### 现有净化基础
- `src/shared/utils/text.js` §escapeHtml, §cleanUrl, §sanitizeAttribute — 现有基础防护
- `src/core/editor/copy-formats.js` §sanitizeSvgForRasterize — SVG 净化参考
- `src/core/markdown/inline-formatter.js` — 内联格式化中的 escapeHtml/cleanUrl 使用

### 渲染管道
- `src/plugins/mermaid-nodeview.js` — Mermaid SVG 渲染（需保留 SVG 标签和 class）
- `src/plugins/math-nodeview.js` — MathJax 渲染（需保留 SVG/MathML 输出）
- `src/core/markdown/math/renderer.js` — 数学公式渲染器

### 测试基线
- `vitest.config.js` — 覆盖率阈值 80%
- `.planning/phases/01-dependency-vulnerability-patch/01-01-SUMMARY.md` — Phase 1 建立的 394 测试基线

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/shared/utils/text.js` — 已有 `escapeHtml()`, `cleanUrl()`, `sanitizeAttribute()` 工具函数，sanitize.js 可放在同目录
- `src/shared/utils/` — 模块化工具函数目录，已有 error.js, logger.js, dom.js 等，新增 sanitize.js 符合约定
- 测试模式：`tests/` 镜像 `src/` 结构，sanitize.js 测试放在 `tests/shared/utils/sanitize.test.js`

### Established Patterns
- 工厂函数命名：`createModuleLogger()` → 新建 `sanitizeHtml()` 符合 camelCase 导出约定
- 工具函数导出：text.js 导出具名函数（`export const escapeHtml = TextUtils.escapeHtml`）→ sanitize.js 同模式
- 组件导入：PreviewPane 已从 `../shared/utils/text.js` 导入 `escapeHtml`，添加 sanitize.js 导入同路径

### Integration Points
- `PreviewPane.vue:43` — `v-html="renderedHtml"` 改为 `v-html="sanitizedHtml"`，在 computed 或 watch 中调用 sanitizeHtml
- `MarkdownGuide.vue:272-283` — math demo 的 `v-html="renderInlineMath(...)"` 和 `v-html="renderBlockMath(...)"` 需包装
- `package.json` — 新增 `dompurify` 依赖

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard DOMPurify integration with SVG/MathML preservation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-xss-prevention*
*Context gathered: 2026-03-27*
