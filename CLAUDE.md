# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

社交平台友好的 Markdown 编辑器，支持 WYSIWYG 编辑、主题系统、一键复制微信公众号格式。

**技术栈**：Vue 3.3 (Composition API) + Vite 5 + CodeMirror 6 + Milkdown 7 + Electron 37

**环境要求**：Node.js >= 18 | npm >= 9

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器 (端口 3000)
npm run build            # 生产构建
npm run preview          # 预览构建输出

# 测试 (151 个测试用例)
npm run test             # 监听模式
npm run test:run         # 单次运行 (CI)
npm run test:coverage    # 覆盖率报告 (阈值 80%)
npm run test:ui          # Vitest UI

# Electron 桌面应用
npm run electron:dev     # Vite + Electron 并行启动
npm run make:mac         # macOS (DMG + ZIP)
npm run make:win         # Windows (Squirrel + ZIP)
npm run make:linux       # Linux (DEB + RPM)
```

## 架构

### 目录结构 (简化)

```text
src/
├── components/          # Vue 组件
│   ├── layout/          # AppHeader, AppMain, AppFooter
│   ├── settings/        # 6 个设置分区组件
│   ├── MarkdownEditor   # CodeMirror 源码编辑器
│   ├── WysiwygPane      # Milkdown 所见即所得编辑器
│   └── PreviewPane      # HTML 预览面板
├── composables/         # 状态管理 hooks
│   ├── editor/          # useEditor, useEditorState, useEditorEvents...
│   ├── theme/           # useThemeManager, useThemeWatcher
│   ├── useAppState      # 全局内容、视口、同步滚动
│   ├── useElectron      # 桌面端 IPC 通信
│   └── useNotification  # 消息提示
├── core/                # 核心业务逻辑
│   ├── editor/          # 编辑器操作、复制格式、剪贴板
│   ├── markdown/        # Markdown 解析管道 (见下文)
│   └── theme/           # 主题管理器、预设、CSS 变量
├── config/              # 配置常量 + toolbar.js
├── plugins/             # i18n, Prism 高亮, Mermaid
├── locales/             # zh-CN, en
└── styles/              # 全局样式 + 主题 CSS

electron/                # Electron 主进程 + 模块
tests/                   # 镜像 src 结构的测试文件
```

### 路径别名

```javascript
// vitest.config.js 定义
'@'      → './src'
'@tests' → './tests'
```

### Markdown 解析管道

```text
原始 Markdown
    ↓
Parser Coordinator (8 个策略: code-block, list, table, blockquote-end,
                    empty-line, paragraph, line-processor, base)
    ↓
Formatter Coordinator (code, link, text, escape, special, legacy)
    ↓
Processors (FontProcessor, ThemeProcessor)
    ↓
Post-Processors (breeze adapter 社交适配)
    ↓
HTML 输出
```

### 复制格式

- `copySocialFormat()`: 内联样式 HTML + Mermaid SVG→PNG 转换 (微信公众号兼容)
- `copyMarkdownFormat()`: 纯文本 Markdown

### 主题系统

- CSS 变量驱动，`core/theme/manager.js` 统一管理
- `theme-loader.js` 在 Vue 挂载前注入变量防止 FOUC
- 预设: `color-themes.js`, `code-styles.js`, `font-settings.js`, `theme-systems.js`

## 关键模块速查

| 功能 | 路径 | 说明 |
| --- | --- | --- |
| 主题管理器 | `core/theme/manager.js` | CSS 变量 CRUD + localStorage |
| 解析协调器 | `core/markdown/parser/coordinator.js` | 多策略 Markdown 解析入口 |
| 复制格式 | `core/editor/copy-formats.js` | 社交/MD 格式生成 |
| 应用状态 | `composables/useAppState.js` | 全局内容、同步滚动状态 |
| Electron IPC | `composables/useElectron.js` | 桌面端文件操作 |
| 剪贴板 | `core/editor/clipboard.js` | HTML/text 复制实现 |
| Mermaid 渲染 | `plugins/mermaid-nodeview.js` | Milkdown Mermaid 插件 |

## 测试

- **框架**: Vitest + jsdom + @vue/test-utils
- **覆盖率**: 80% (branches, functions, lines, statements)
- **回归测试**: `tests/bugs/` (防止已修复问题复现)
- **Setup**: `tests/setup.js` (浏览器 API polyfills)

运行单个测试:

```bash
npm run test:run -- tests/core/markdown/markdown-parser.test.js
```

## 扩展点

| 扩展类型 | 路径 | 示例 |
| --- | --- | --- |
| 工具栏按钮 | `src/config/toolbar.js` | 添加新的编辑操作 |
| 颜色主题 | `core/theme/presets/color-themes.js` | 添加预设颜色方案 |
| 代码样式 | `core/theme/presets/code-styles.js` | 添加代码高亮主题 |
| 解析策略 | `core/markdown/parser/strategies/` | 实现 `BaseStrategy` 接口 |
| 格式化器 | `core/markdown/formatters/` | 添加新的 HTML 格式化逻辑 |
| 社交适配器 | `core/markdown/post-processors/adapters/` | 支持新的社交平台 |
| 新语言 | `src/locales/<lang>.json` | 添加 i18n 键值对 |

## 部署

- **Web**: Vercel (`vercel.json` SPA 路由配置)
- **Docker**: `docker-compose.yml` (多阶段构建 + Nginx)
- **桌面**: Electron Forge 跨平台打包

## 代码规范

- **命名**: 完整单词不缩写；组件 PascalCase，函数 camelCase
- **组件**: `<script setup>` 语法
- **提交**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- **分支**: `feat/scope`, `fix/scope`
- **测试**: 新功能配套测试，Bug 修复添加回归测试到 `tests/bugs/`
