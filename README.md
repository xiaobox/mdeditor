<p align="center">
  <a href="./public/logo.svg" target="_blank">
    <img src="./public/logo.svg" alt="Modern MD Editor Logo" width="120" />
  </a>
</p>

<h1 align="center">Modern MD Editor</h1>
<p align="center">社交平台友好型 Markdown 编辑器</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.x-42b883.svg" alt="Vue 3" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.x-646CFF.svg" alt="Vite 5" /></a>
  <a href="https://codemirror.net/6/"><img src="https://img.shields.io/badge/CodeMirror-6.x-0b87da.svg" alt="CodeMirror 6" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white" alt="node >=18" /></a>
  <a href="https://www.npmjs.com/"><img src="https://img.shields.io/badge/npm-%3E%3D9-CB3837?logo=npm&logoColor=white" alt="npm >=9" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> · <a href="./README.en.md">English</a>
</p>

> 一款专为极致书写体验与「一键复制为公众号格式」而生的现代化 Markdown 编辑器。界面精致、体验顺滑，所见即所得地预览与复制，帮助你高效创作优雅内容。

## 项目简介

- **这是什么**：现代化的 Markdown 编辑器，内置美学设计与强大预览，支持将 Markdown 一键转换为适配微信公众号/社交平台的 HTML（自动内联样式、字体/行高/字距适配、主题化美化）。
- **为什么做**：创作公众号/社交平台文章时，粘贴 Markdown 常丢样式、不统一。此项目提供「一键复制」能力，解决格式调整的低效痛点。
- **有什么不同**：
  - 精致 UI 与顺滑交互（预览视口切换、同步滚动、主题预加载防闪烁）。
  - 可调「颜色主题 / 代码样式 / 排版系统 / 字体与字距与行高」。
  - 针对社交平台的粘贴兼容性优化与降级策略。

## 效果预览


###  一键复制公众号格式

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810145119169.png)


###  编辑 + 预览双栏

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144536506.png)

###  预览窗口（桌面 / 平板 / 手机）

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144616512.png)

### 支持 mermaid

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250814231133156.png)

###  设置面板（主题 / 代码样式 / 字体 / 间距）

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144902477.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144832875.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144933681.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144947233.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810145007195.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810145031310.png)

###  丰富的主题色
  - ![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144355636.png)

## 项目特性

- **所见即所得预览**：
  - 实时渲染，编辑区与预览区支持双向同步滚动。
  - 预览视口一键切换：`桌面 / 平板 / 手机`。
- **一键复制为公众号/社交平台格式**：
  - 自动注入内联样式（字体、字号、行高、字距、配色）。
  - 主题化适配与细节增强（标题、列表、引用、代码、表格等）。
  - 现代 Clipboard API 优先，失败时自动降级，增强兼容性。
- **强大的主题与排版系统**：
  - 颜色主题（含自定义主题色实时预览与持久化）。
  - 代码样式（背景/字体/高亮变量一站式应用）。
  - 排版主题系统（布局、间距、圆角、阴影等 CSS 变量）。
- **可调字体与阅读体验**：
  - 字体族、字号、行高、字距皆可在设置面板中直观调节。
- **现代前端架构**：
  - 基于 `Vue 3 + Vite 5 + CodeMirror 6`。
  - 主题预加载（避免 FOUC）、性能防抖与缓存、模块化可扩展设计。

## 技术栈与架构

- **核心框架**
  - **Vue 3**：组件化与响应式核心，使用 `<script setup>` 与组合式 API 实现清晰的 UI 与状态管理。
  - **Vite 5**：极速开发服务器与构建工具，HMR 体验优秀，使用官方插件 `@vitejs/plugin-vue` 处理 `.vue`。
- **编辑器**
  - **CodeMirror 6 + vue-codemirror**：提供高性能文本编辑、快捷键与滚动事件。在 `src/composables/editor/` 封装编辑器的生命周期、操作与状态。
- **Markdown 渲染管线**
  - `src/core/markdown/parser/*`：解析协调器与多策略解析；`PreviewPane.vue` 调用 `parseMarkdown` 生成预览版与社交版 HTML。
  - `src/core/markdown/post-processors/social-styler.js` 与 `adapters/*`：为 HTML 注入内联样式并进行主题化适配，兼容公众号等粘贴环境。
- **复制链路**
  - `src/core/editor/copy-formats.js`：一键生成社交版/Markdown 两种复制格式。
  - `src/core/editor/clipboard.js`：Clipboard API 优先，失败降级到 `execCommand`；模拟社交平台容器，处理字体/行高/字距等细节。
- **主题系统**
  - `src/core/theme/manager.js`：集中管理并写入 CSS 变量；`theme-loader.js` 首屏预注入，避免 FOUC；`styles/themes/*` 与 `core/theme/presets/*` 提供预设。
- **样式基线**
  - `github-markdown-css`：为 Markdown 预览提供一致的基础排版，结合自定义 CSS 变量与主题系统统一风格。
- **测试体系**
  - **Vitest + @vue/test-utils + jsdom**：单元测试与覆盖率统计（脚本：`test`、`test:ui`、`test:coverage`）。
- **目录分层**
  - `components/`（UI） · `composables/`（复用逻辑） · `core/`（编辑器/解析/主题/复制） · `config/`（常量与工具栏） · `styles/`（全局与组件样式）。

## 环境要求

- **Node.js**：≥ 18（推荐 18/20 LTS）

## 🖥️ 桌面应用支持

这个项目现在支持 **Electron 桌面应用**！你可以：

- 🚀 **快速启动**: `npm run electron:dev` - 同时启动开发服务器和桌面应用
- 📱 **原生体验**: 享受完整的桌面应用体验，包括菜单栏、快捷键等
- 💾 **本地文件**: 支持本地文件的打开、编辑、保存等操作
- 🔧 **跨平台**: 支持 macOS、Windows 和 Linux

### 桌面应用功能

- **文件操作**: 打开文件（支持 .md、.markdown、.txt 等格式）、保存文件
- **快捷键**: Cmd/Ctrl+O（打开）、Cmd/Ctrl+S（保存）
- **菜单栏**: 完整的应用菜单（文件、编辑、视图、帮助）
- **窗口管理**: 支持调整大小、全屏等
- **日志记录**: 详细的操作日志，便于调试和了解应用状态

### 快速开始

```bash
# 开发模式（同时启动 Vite 服务器和 Electron）
npm run electron:dev

# 构建桌面应用
npm run build:electron

# 打包应用
npm run package

# 制作安装包（macOS）
npm run make:mac
```

详细说明请查看 [Electron 集成文档](./ELECTRON_README.md)
- **包管理器**：npm / pnpm / yarn 均可
- **浏览器**：现代浏览器（Chrome/Edge/Safari/Firefox 最新版本）

## 安装与本地运行

```bash
# 克隆
git clone https://github.com/xiaobox/mdeditor.git
cd modern-md-editor

# 安装依赖（任选其一）
npm install
# 或
yarn
# 或
pnpm install

# 本地开发
npm run dev

# 生产构建
npm run build

# 本地预览构建产物
npm run preview

# 测试（可选）
npm run test
npm run test:ui
npm run test:coverage
```

## Docker 一键部署

你可以直接使用我们在 Docker Hub 上的公共镜像一键部署（支持 AMD64/ARM64）：

- 方式一：Docker（推荐最简）

```bash
# 拉取并运行（默认暴露到本机 8080）
docker run -d --name mdeditor -p 8080:80 helongisno1/mdeditor:latest

# 访问
open http://localhost:8080
```

- 方式二：Docker Compose

```yaml
version: "3.9"
services:
  mdeditor:
    image: helongisno1/mdeditor:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker compose up -d
open http://localhost:8080
```

提示：在 macOS 上如果你使用 OrbStack，容器会有一个形如 <容器名>.orb.local 的本地域名。
例如首次运行若未指定 --name，Docker 会分配随机容器名（如 elegant_feynman），
则可在浏览器看到 elegant_feynman.orb.local 之类的域名。这只是本机可用的开发域名，
并非公网域名；生产环境仍建议通过你自己的域名反向代理或直接使用服务器 IP:端口 访问。

如需自定义容器名（便于记忆的本地域名）：

```bash
docker run -d --name mdeditor -p 8080:80 helongisno1/mdeditor:latest
# 现在本地也可通过 http://mdeditor.orb.local 访问（OrbStack 提供的本地域名解析）
```


## 快速上手（应用运行）

- 启动后即是完整编辑器应用：左侧编辑、右侧预览，上方工具栏与视图控制，右上角「设置」进入主题与排版调节。
- 顶部「复制」下拉：
  - 选择「公众号格式」即可一键复制为富文本 HTML，粘贴至微信公众号/社交平台编辑器。
  - 选择「MD 格式」复制为纯 Markdown 文本。

### 组件/模块与扩展点

- **编辑器组件**：`src/components/MarkdownEditor.vue`
- **预览组件**：`src/components/PreviewPane.vue`
- **设置面板**：`src/components/SettingsPanel.vue`、`src/components/SettingsPanelTabbed.vue`
- **工具栏配置**：`src/config/toolbar.js`（数据驱动，便于新增/重排按钮）
- **复制能力**：`src/core/editor/copy-formats.js`、`src/core/editor/clipboard.js`
- **Markdown 解析与社交样式后处理**：
  - 解析协调：`src/core/markdown/parser/coordinator.js`
  - 社交样式化：`src/core/markdown/post-processors/social-styler.js`
  - 主题适配器（可扩展）：`src/core/markdown/post-processors/adapters/`
- **主题系统（CSS 变量）**：`src/core/theme/manager.js`、`src/core/theme/theme-loader.js`

### 复制/格式化 API（用于二次开发）

- **复制为公众号/社交平台格式**：

```js
import { copySocialFormat } from './src/core/editor/copy-formats.js'

const { success, message } = await copySocialFormat(markdownText, {
  // 主题/代码样式/排版系统（可选，通常从设置面板或全局主题管理器获取）
  theme: currentColorTheme,
  codeTheme: currentCodeStyle,
  themeSystem: currentThemeSystemId,

  // 字体设置（可选：用于生成内联样式，更贴近社交平台渲染）
  fontSettings: {
    fontFamily: 'system-default',   // 'microsoft-yahei' | 'pingfang-sc' | 'hiragino-sans' | 'arial' | 'system-safe' | 'system-default'
    fontSize: 16,                   // px，区间建议 12~24
    lineHeight: 1.6,                // number，未提供时随字号自适应
    letterSpacing: 0                // px
  }
})
```

- **复制为 Markdown 纯文本**：

```js
import { copyMarkdownFormat } from './src/core/editor/copy-formats.js'

const { success, message } = await copyMarkdownFormat(markdownText)
```

- **扩展社交主题适配**：在 `src/core/markdown/post-processors/adapters/` 目录中新增主题适配器，并在 `adapters/index.js` 注册，即可对标题、列表、引用、图片、表格等进行更细致的主题化修饰。

### 预览与主题说明

- **视口模式**：右上角可切换 `desktop / tablet / mobile`，便于在不同屏宽下预览排版效果。
- **主题预加载**：`src/core/theme/theme-loader.js` 在页面首屏注入 CSS 变量，避免切换前闪烁。
- **CSS 变量管理**：`src/core/theme/manager.js` 统一写入颜色/代码样式/排版/字体变量，支持一次性合并写入提升性能。

### 配置与默认值

- **默认主题/代码样式/排版/字体**：见 `src/config/constants/defaults.js`
- **编辑器基础配置**：见 `src/config/constants/editor.js`
- **外部链接**：`src/config/constants/links.js`（如仓库地址）



## 贡献指南

- **欢迎一切形式的贡献**：Bug 修复、特性提议、文档完善、示例补充等。
- **提交流程**：
  - Fork 本仓库，创建分支：`feat/xxx` 或 `fix/xxx`
  - 本地运行与验证：`npm run dev`、`npm run test`
  - 提交 PR，清晰描述变更动机与效果截图/GIF

- **开发建议**：
  - 新增工具栏按钮：改造 `src/config/toolbar.js`
  - 扩展社交样式：在 `post-processors/adapters/` 新增适配器
  - 新增颜色主题/代码样式：修改 `src/core/theme/presets/`

## 许可证

- 默认采用 **MIT** 许可证。

## 联系与致谢

- **源码**：`https://github.com/xiaobox/mdeditor`
- **灵感与依赖**：`Vue 3`、`Vite`、`CodeMirror 6`、`github-markdown-css` 等优秀开源项目。

## 支持我们
如果本项目对你有所帮助，可以通过以下方式支持我们的持续开发。


<table style="margin: 0 auto">
  <tbody>
    <tr>
      <td align="center" style="width: 260px">
        <img
          src="https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/imagescc16a59f8b43da4a3ad3ce201f46fc9d.jpg"
          style="width: 200px"
        /><br />
      </td>
      <td align="center" style="width: 260px">
        <img
          src="https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images2d585d78e23826f6698ddd4edec5d9c2.jpg"
          style="width: 200px"
        /><br />
      </td>
    </tr>
  </tbody>
</table>

---
如果这个项目对你有帮助，欢迎 Star ⭐️ 支持！也欢迎提交 Issue/PR 一起把它打磨得更好。


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xiaobox/mdeditor&type=Date)](https://www.star-history.com/#xiaobox/mdeditor&Date)