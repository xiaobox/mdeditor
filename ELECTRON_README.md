# Electron 桌面应用集成

这个项目已经集成了 Electron，可以作为桌面应用运行。

## 功能特性

- 🖥️ 原生桌面应用体验
- 📁 本地文件读写支持（打开、保存）
- ⌨️ 完整的键盘快捷键
- 🍎 原生菜单栏支持
- 🔧 开发和生产环境支持

## 安装依赖

```bash
npm install
```

## 开发模式

### 启动开发服务器 + Electron

```bash
npm run electron:dev
```

这会同时启动 Vite 开发服务器和 Electron 应用。

### 仅启动 Electron（需要先启动开发服务器）

```bash
# 终端 1: 启动开发服务器
npm run dev

# 终端 2: 启动 Electron
npm run electron
```

## 构建桌面应用

### 构建应用

```bash
npm run build:electron
```

### 打包应用

```bash
npm run package
```

这会生成一个包含应用的可执行文件，位于 `out/` 目录中。

### 制作安装包

```bash
# macOS 安装包
npm run make:mac

# Windows 安装包
npm run make:win

# Linux 安装包
npm run make:linux

# 所有平台安装包
npm run make:all
```

## 项目结构

```
mdeditor/
├── electron/                 # Electron 相关文件
│   ├── main.cjs             # 主进程文件
│   └── preload.cjs          # 预加载脚本
├── dist/                    # Vite 构建输出
├── out/                     # Electron 打包输出
└── package.json            # 项目配置
```

## 主要功能

### 文件操作

- **打开文件**: `Cmd/Ctrl + O` - 支持 `.md`、`.markdown`、`.txt` 等格式
- **保存文件**: `Cmd/Ctrl + S` - 自动保存到当前文件或选择新位置

### 菜单栏

- **文件**: 打开、保存等文件操作
- **编辑**: 文本编辑功能（撤销、重做、剪切、复制、粘贴、全选）
- **视图**: 视图控制功能（重新加载、开发者工具、缩放、全屏）
- **帮助**: 关于信息和 GitHub 链接

### 平台支持

- ✅ macOS (Intel + Apple Silicon)
- ✅ Windows (x64) 没测
- ✅ Linux (x64) 没测

## 开发说明

### 主进程 (main.cjs)

负责创建应用窗口、处理系统级事件、管理应用生命周期、文件对话框操作。

### 预加载脚本 (preload.cjs)

为渲染进程提供安全的 API 接口，实现主进程和渲染进程的通信：
- `saveFile`: 保存文件操作
- `onMenuOpenFile`: 监听打开文件菜单事件
- `onMenuSaveFile`: 监听保存文件菜单事件

### 渲染进程 (Vue 应用)

通过 `useElectron` composable 与 Electron 主进程通信：
- 文件打开：接收文件内容并更新编辑器
- 文件保存：发送内容到主进程进行保存
- 状态管理：跟踪当前文件路径和修改状态

## 核心实现

### 文件打开流程

1. 用户按 `Cmd/Ctrl + O` 或点击菜单
2. 主进程显示文件选择对话框
3. 读取选中文件内容
4. 通过 IPC 发送到渲染进程
5. 渲染进程更新编辑器内容并设置当前文件路径

### 文件保存流程

1. 用户按 `Cmd/Ctrl + S` 或点击菜单
2. 渲染进程发送内容到主进程
3. 主进程显示保存对话框（如果没有当前文件路径）
4. 写入文件并返回结果
5. 渲染进程显示成功/失败通知
