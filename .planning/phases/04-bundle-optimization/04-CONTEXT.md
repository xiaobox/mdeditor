# Phase 4: Bundle Optimization - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

通过 Vite `build.rollupOptions.output.manualChunks` 将 4,788 kB 的单体 `index-*.js` 拆分为按领域分组的 vendor 分块。不引入动态 import，不改变运行时加载行为。Mermaid 已有的 ~25 个动态 import 分块保持不变。

</domain>

<decisions>
## Implementation Decisions

### 分块策略
- **D-01:** 使用 Vite `build.rollupOptions.output.manualChunks` 函数形式（非对象形式），通过检查模块 ID 中的 `node_modules/` 路径分配分块
- **D-02:** 按领域分组为 6 个 vendor chunk：
  - `vendor-vue` — vue, @vue/* 相关包
  - `vendor-codemirror` — @codemirror/*, vue-codemirror
  - `vendor-milkdown` — @milkdown/* 全家桶
  - `vendor-mermaid` — mermaid 核心（不含已有的动态 import 子模块）
  - `vendor-mathjax` — mathjax-full
  - `vendor-export` — html2canvas, jspdf
- **D-03:** 不属于上述 6 组的 node_modules 依赖归入默认 chunk（Vite/Rollup 自动处理）

### Mermaid 动态 import 保护
- **D-04:** manualChunks 函数仅匹配 mermaid 核心包路径（`node_modules/mermaid/`），不匹配 mermaid 动态 import 的图表子模块（这些已经被 Rollup 自动分割为独立 chunk）
- **D-05:** 验证构建后 Mermaid 动态分块数量与优化前一致（当前 ~25 个独立 chunk）

### 构建验证
- **D-06:** `npm run build` 成功完成，输出多个 vendor chunk 而非单个 4.8MB 文件
- **D-07:** `npm run preview` 加载应用后所有功能正常（编辑、预览、主题、导出、社交复制）
- **D-08:** 不设置严格的单个 chunk 大小上限，目标是打散单体 bundle 为缓存友好的独立文件

### Claude's Discretion
- manualChunks 函数中具体的路径匹配逻辑（startsWith vs includes）
- 是否需要处理 prismjs、github-markdown-css 等小型依赖的分组
- vendor chunk 命名是否带 hash（Vite 默认行为即可）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 构建需求
- `.planning/REQUIREMENTS.md` §Build — BLD-01（manualChunks 拆分）、BLD-02（Mermaid 动态 import 不干扰）
- `.planning/PROJECT.md` §Key Decisions — "manualChunks 拆分而非动态 import" 决策
- `.planning/PROJECT.md` §Out of Scope — "动态 import 代码分割" 明确排除

### 构建配置
- `vite.config.js` — 当前构建配置，无 rollupOptions/manualChunks
- `package.json` — 依赖清单，确定 vendor 分组边界

### Mermaid 动态 import
- `src/plugins/mermaid-nodeview.js:12` — `await import('mermaid')` 动态导入
- `src/components/WysiwygPane.vue:246` — mermaid-nodeview 插件动态导入

</canonical_refs>

<code_context>
## Existing Code Insights

### 当前构建产物
- 主 chunk: `index-*.js` — 4,788 kB (gzip 1,552 kB)
- Mermaid 动态 chunk: ~25 个独立文件（architectureDiagram, blockDiagram, c4Diagram, flowDiagram, ganttDiagram, mindmap, sequenceDiagram, treemap, xychartDiagram 等）
- cytoscape.esm chunk: 442 kB（Mermaid 依赖，已自动分离）
- Milkdown prosemirror chunk: `index.es-*.js` — 150 kB

### Established Patterns
- Vite 5 + Rollup — 标准 ES module 构建
- 无现有 manualChunks 配置
- isElectron 环境变量控制 base 路径（`./` vs `/`）

### Integration Points
- `vite.config.js` build section — 添加 `rollupOptions.output.manualChunks`
- 不需要修改任何源代码文件，仅修改构建配置

</code_context>

<specifics>
## Specific Ideas

No specific requirements — 标准 Vite manualChunks 配置，按 BLD-01/BLD-02 需求执行。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-bundle-optimization*
*Context gathered: 2026-03-28*
