# 贡献指南

感谢你愿意为 Modern MD Editor 做出贡献！以下指南将帮助你顺利开展工作。

## 开发环境
- Node.js: >= 18（推荐 18/20 LTS）
- 包管理器：npm / pnpm / yarn 任选其一
- 推荐使用 VS Code + Volar（Vue）等插件

## 快速开始
```bash
# 克隆仓库
git clone https://github.com/xiaobox/mdeditor.git
cd mdeditor

# 安装依赖（任选其一）
npm i # 或 yarn 或 pnpm i

# 启动开发服务器
npm run dev

# 运行测试（可选）
npm run test
```

## 分支模型
- `main`: 稳定分支，保持可发布状态
- 功能分支：`feat/<scope>`，例如 `feat/copy-social-format`
- 修复分支：`fix/<scope>`，例如 `fix/clipboard-timeout`

## 提交规范（建议）
遵循 Conventional Commits：
- `feat:` 新功能
- `fix:` 问题修复
- `docs:` 文档更新
- `style:` 代码风格（不影响逻辑）
- `refactor:` 重构（无新功能或修复）
- `test:` 测试相关
- `chore:` 构建/工具/依赖等杂项

示例：
```
feat(editor): 支持有序/无序列表缩进配置
fix(clipboard): 降级逻辑在 http 环境下生效
```

## Issue 指南
- 描述清晰：重现步骤、期望行为、实际结果、环境信息（浏览器/系统/Node 版本）
- 最小复现：若可能，请提供最小复现仓库或代码片段
- 截图/录屏：视觉或交互问题建议附带 GIF/截图

## Pull Request 流程
1. Fork 仓库并创建分支（见分支模型）
2. 确保本地通过构建与测试：
   - `npm run dev` 可正常启动
   - `npm run test`（如涉及逻辑改动请补充测试）
3. 更新文档：涉及功能/行为变更时，请同步更新 `README.md`/`CHANGELOG.md`
4. 提交 PR：请在描述中说明动机、变更点、影响范围、截图或动图

## 代码风格与质量
- 组件命名、变量命名使用清晰易懂的全词，不使用缩写
- 保持模块职责单一，避免深层嵌套与过长函数
- 优先可读性，必要时添加解释「为什么」的注释
- 不引入无关重构，避免大范围格式化与无关文件变更

## 目录速览
- `src/components/` UI 组件
- `src/core/editor/` 编辑器与复制
- `src/core/markdown/` 解析与后处理
- `src/core/theme/` 主题与变量管理
- `src/config/` 常量、工具栏配置
- `src/styles/` 全局与组件样式

## 安全与许可
- 勿提交敏感信息（密钥、令牌等）
- 提交代码默认遵循本项目开源许可（MIT）

## 沟通
- 提出想法与问题：请使用 GitHub Issues
- 讨论实现细节：在 PR 评论区持续跟进

欢迎你的任何反馈与贡献！🎉
