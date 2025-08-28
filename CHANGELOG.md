# 更新日志

本项目的所有显著变更都将记录在此文件中。

格式参考 Keep a Changelog，版本号遵循语义化版本（SemVer）。

## [Unreleased]

### Added
- 新增所见即所得编辑模式（WYSIWYG）：基于 Milkdown（commonmark + gfm），支持 Prism 代码高亮与 Mermaid 节点视图
- 视图切换增加「所见即所得（可编辑）」选项，并与 Markdown 文本双向同步

### Docs
- README/README.en：补充 WYSIWYG 说明、架构细节与快速上手指引

### Planned
- 计划：完善单元测试覆盖、增加更多主题/代码样式预设、支持导出图片/PDF、提供中英文双语文档


## [1.0.2] - 2025-08-15

### Added
- 支持 Mermaid 流程图/时序图等渲染，预览与复制链路均可用（参见提交 cdb219d）
- 支持 Docker 一键部署：提供多阶段构建的 Dockerfile、.dockerignore、Docker Hub 公共镜像与 GitHub Actions 自动发布流程

### Fixed
- 代码块缺少横向滚动条的问题，长行代码现在可横向滚动（8b84299）
- 含 alt 的图片被当作链接导致显示异常；同时为带 alt 的图片新增图注显示（b296c47）
- Breeze（清风）主题：标题装饰稳定性、列表缩进统一（b926f33）
- 平板预览背景色与其他模式不一致（bcf3dc7）

### Docs/CI
- README：新增 Mermaid 展示、完善文档与截图，新增 Docker 一键部署使用说明
- CI：新增 Docker 多架构构建与推送 Workflow（推送到 helongisno1/mdeditor）

## [1.0.0] - 2025-08-10

### Added
- 一键复制为公众号/社交平台格式（内联样式、字体/行高/字距适配，主题化增强）
- 实时预览与双向同步滚动，预览视口切换（桌面/平板/手机）
- 主题系统：颜色主题、代码样式、排版系统与字体设置，支持预加载避免 FOUC
- 设置面板：主题系统、主题色、代码样式、字体、字号、间距等可视化配置
- 工具栏（数据驱动）：标题、加粗/斜体/列表/引用/代码/表格/分割线等
- Markdown 解析协调器与社交样式后处理器（可扩展适配器体系）
- 基于 Vue 3 + Vite 5 + CodeMirror 6 的现代架构

### Docs
- 新增 `README.md`（简介、特性、演示、安装使用、API/扩展点、配置、贡献、许可证）
- 徽章样式居中展示，新增 Node 和 npm 版本徽章
- 增补演示截图与「支持我们」说明

[Unreleased]: https://github.com/xiaobox/mdeditor/compare/main...HEAD
[1.0.0]: https://github.com/xiaobox/mdeditor/releases/tag/v1.0.0
