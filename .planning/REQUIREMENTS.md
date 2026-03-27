# Requirements: MDEditor Security Hardening

**Defined:** 2026-03-27
**Core Value:** 消除已知安全风险，确保编辑器在面对恶意输入时不会产生 XSS 或 DoS 漏洞

## v1 Requirements

Requirements for security hardening milestone. Each maps to roadmap phases.

### Security

- [ ] **SEC-01**: PreviewPane 渲染前通过 DOMPurify 净化 renderedHtml，阻止 XSS 注入
- [ ] **SEC-02**: 修复 svgo 4.0.0 → 4.0.1，消除 CVE-2026-29074 Billion Laughs DoS 漏洞
- [ ] **SEC-03**: 创建 `src/shared/utils/sanitize.js` 集中管理 DOMPurify 配置，导出 `sanitizeHtml()` 方法
- [ ] **SEC-04**: MarkdownGuide.vue 的 v-html 也通过 sanitize.js 净化（defense-in-depth）
- [ ] **SEC-05**: DOMPurify 配置保留 `style`、`class` 属性和 SVG/MathML 标签，不破坏预览效果

### Observability

- [ ] **OBS-01**: 7 个空 catch 块全部接入 `createModuleLogger()`，按严重程度使用 warn/debug 级别
- [ ] **OBS-02**: catch 块包含结构化上下文（模块名、操作描述、错误对象）

### Build

- [ ] **BLD-01**: Vite manualChunks 将 4.8MB 单体 bundle 拆分为 vendor 分组（vue-core、codemirror、milkdown、mermaid、mathjax、export-tools）
- [ ] **BLD-02**: manualChunks 不干扰 Mermaid 已有的动态 import 分块

### Testing

- [ ] **TST-01**: DOMPurify 净化单元测试（XSS payload 被移除、合法 styled HTML 保留、Mermaid class 保留）
- [ ] **TST-02**: 空 catch 块 logger 集成测试（验证 logger.warn/debug 被调用且包含上下文）
- [ ] **TST-03**: 现有 394 个测试全部通过，覆盖率 ≥ 80%

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Security Hardening

- **SEC-V2-01**: Content Security Policy (CSP) headers 配置（需跨 Vercel + Electron 环境测试）
- **SEC-V2-02**: npm audit CI gate（`npm audit --audit-level=high --production`）

### Observability

- **OBS-V2-01**: 全局 console.* 替换为 createModuleLogger()（37 处 raw console 调用）
- **OBS-V2-02**: 外部错误监控集成（Sentry 或同类）

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 全局 console.* 替换 | 本次仅处理空 catch 块，全局替换范围太大 |
| html2canvas 替换 | 未维护但功能正常，非安全问题 |
| TypeScript 迁移 | 范围太大，独立里程碑 |
| E2E 测试 | 本次聚焦单元测试覆盖 |
| Mermaid 传递依赖漏洞 | 无可用修复，低实际风险 |
| ESLint/Prettier 配置 | 基础设施改进，不在本次范围 |
| vue-dompurify-html 指令 | 额外依赖，直接使用 DOMPurify 更透明可测 |
| 动态 import 代码分割 | 改变加载行为，超出 manualChunks 范围 |
| 服务端 HTML 净化 | 纯客户端应用，无服务端处理 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 2 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 2 | Pending |
| SEC-04 | Phase 2 | Pending |
| SEC-05 | Phase 2 | Pending |
| OBS-01 | Phase 3 | Pending |
| OBS-02 | Phase 3 | Pending |
| BLD-01 | Phase 4 | Pending |
| BLD-02 | Phase 4 | Pending |
| TST-01 | Phase 2 | Pending |
| TST-02 | Phase 3 | Pending |
| TST-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after roadmap creation*
