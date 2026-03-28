# Phase 3: Error Observability - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

将 7 个空 catch 块替换为结构化 module-logger 调用，使用现有 `createModuleLogger()` 基础设施。每个 catch 块按严重程度分配 warn 或 debug 级别，包含模块名、操作描述和错误对象。不涉及全局 console.* 替换（明确排除在 Out of Scope）。

</domain>

<decisions>
## Implementation Decisions

### 日志级别分类
- **D-01:** 可恢复失败使用 `warn` 级别 — 仅 clipboard.js:138（clipboardData.setData 失败，影响用户操作）
- **D-02:** 清理/兜底操作使用 `debug` 级别 — 其余 6 个 catch 块：
  - `loader.js:62` — localStorage JSON.parse 失败，兜底到默认主题（debug）
  - `copy-formats.js:176` — SVG 元素 getBoundingClientRect 失败，后续有兜底计算（debug）
  - `copy-formats.js:196` — SVG 根 getBBox 失败，后续有兜底尺寸逻辑（debug）
  - `copy-formats.js:237` — img.decode() 失败，可选增强，渲染继续（debug）
  - `copy-formats.js:266` — URL.revokeObjectURL 清理失败，非关键（debug）
  - `copy-formats.js:318` — svg.remove() DOM 清理失败，非关键（debug）

### 结构化上下文格式
- **D-03:** 每个 logger 调用包含三个参数：操作描述字符串 + 错误对象，logger 自身提供模块名前缀
- **D-04:** 操作描述使用中文或英文均可（跟随原有代码注释语言），重点是描述"在做什么时失败"

### Logger 实例策略
- **D-05:** 每个文件顶部创建一个 `createModuleLogger()` 实例（如 `const log = createModuleLogger('Clipboard')`），catch 块引用该实例
- **D-06:** 模块名使用 PascalCase（如 'Clipboard', 'ThemeLoader', 'CopyFormats'），与现有 createModuleLogger 约定一致

### 全部 7 个 catch 块
- **D-07:** 所有 7 个空 catch 块都必须接入 logger（满足 OBS-01），不跳过清理类 catch

### 测试策略
- **D-08:** 使用 vi.spyOn 监控 console.warn/console.debug 调用，验证 logger 在错误路径被正确调用且包含结构化上下文（满足 TST-02）
- **D-09:** 测试按文件分组 — clipboard logger 测试、loader logger 测试、copy-formats logger 测试

### Claude's Discretion
- 具体操作描述的措辞
- 测试用例中触发错误的具体方式（throw, mock, etc.）
- 是否将 copy-formats.js 中的 5 个 catch 块整合到一个测试 describe 块

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 可观测性需求
- `.planning/REQUIREMENTS.md` §Observability — OBS-01（7 个空 catch 块全部接入 logger）、OBS-02（结构化上下文）
- `.planning/REQUIREMENTS.md` §Testing — TST-02（logger 集成测试）
- `.planning/ROADMAP.md` §Phase 3 — 成功标准：warn/debug 级别分配、结构化输出、dev 模式可见

### 现有 Logger 基础设施
- `src/shared/utils/logger.js` — `createModuleLogger(moduleName)` 工厂函数，dev-only，生产环境 noop

### 空 catch 块位置
- `src/core/editor/clipboard.js:138` — clipboardData.setData（warn）
- `src/core/theme/loader.js:62` — localStorage JSON.parse（debug）
- `src/core/editor/copy-formats.js:176` — SVG getBoundingClientRect（debug）
- `src/core/editor/copy-formats.js:196` — SVG getBBox（debug）
- `src/core/editor/copy-formats.js:237` — img.decode()（debug）
- `src/core/editor/copy-formats.js:266` — URL.revokeObjectURL（debug）
- `src/core/editor/copy-formats.js:318` — svg.remove()（debug）

### 测试基线
- `vitest.config.js` — 覆盖率阈值 80%
- `tests/setup.js` — 测试环境 polyfills

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/shared/utils/logger.js` — 现有 logger 基础设施，提供 `createModuleLogger(moduleName)`，返回 `{ debug, info, warn, error, group, groupEnd }`
- Dev 模式下输出带时间戳和模块前缀的日志，生产环境所有方法为 noop

### Established Patterns
- Logger 尚未在任何模块中使用 `createModuleLogger()` 实例（仅导出默认 logger 实例）
- 现有代码风格：catch 块使用 `_` 作为未使用参数名
- 三个目标文件均使用 ES Module 导入

### Integration Points
- `clipboard.js` — 需要在文件顶部添加 logger import 和 createModuleLogger 调用
- `loader.js` — 同上
- `copy-formats.js` — 同上，该文件有 5 个 catch 块需要修改

</code_context>

<specifics>
## Specific Ideas

No specific requirements — 标准的 logger 集成，按 OBS-01/OBS-02 需求执行。

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-error-observability*
*Context gathered: 2026-03-28*
