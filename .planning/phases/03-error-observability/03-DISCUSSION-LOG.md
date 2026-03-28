# Phase 3: Error Observability - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 03-error-observability
**Areas discussed:** Log level classification, Structured context format, Cleanup catch handling
**Mode:** auto (all decisions auto-selected using recommended defaults)

---

## Log Level Classification

| Option | Description | Selected |
|--------|-------------|----------|
| Cleanup/fallback = debug, recoverable failure = warn | 与 ROADMAP 成功标准 SC-2 一致 | ✓ |
| All catch blocks use warn | 更保守，所有错误可见 | |
| All catch blocks use debug | 最低噪音 | |

**User's choice:** [auto] Cleanup/fallback = debug, recoverable failure = warn (recommended default, matches ROADMAP SC-2)
**Notes:** clipboard.js:138 是唯一的 warn 级别（用户操作失败），其余 6 个均为 debug（清理/兜底操作）

---

## Structured Context Format

| Option | Description | Selected |
|--------|-------------|----------|
| Module name + operation description + error object | 满足 OBS-02 三要素需求 | ✓ |
| Module name + error object only | 更简洁但缺少操作上下文 | |
| Full structured object with metadata | 过度工程化 | |

**User's choice:** [auto] Module name + operation description + error object (recommended default, matches OBS-02)
**Notes:** createModuleLogger 已提供模块名前缀，catch 块只需传入操作描述和错误对象

---

## Cleanup Catch Handling

| Option | Description | Selected |
|--------|-------------|----------|
| All 7 catch blocks get logging | 满足 OBS-01 全覆盖需求 | ✓ |
| Skip cleanup catches (revokeObjectURL, svg.remove) | 减少噪音但不满足 OBS-01 | |

**User's choice:** [auto] All 7 catch blocks get logging (recommended default, satisfies OBS-01 requirement)
**Notes:** OBS-01 明确要求"7 个空 catch 块全部接入"

---

## Claude's Discretion

- 操作描述的具体措辞
- 测试触发错误的具体方式
- copy-formats.js 测试组织结构

## Deferred Ideas

None — discussion stayed within phase scope
