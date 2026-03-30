/**
 * @file vite.config.js
 * @description Vite 构建配置文件
 *
 * 这个文件用于配置 Vite，一个现代化的前端构建工具。
 * 它定义了项目在开发和生产环境中的行为。
 *
 * 主要配置项:
 * 1.  **`plugins`**: 
 *     - `@vitejs/plugin-vue`: 这是官方的 Vue 插件，是让 Vite 能够理解和处理
 *       `.vue` 单文件组件（SFC）的核心。它负责将 SFC 编译成浏览器可以理解的
 *       JavaScript 和 CSS。
 *
 * 2.  **`server`**: 配置开发服务器的行为。
 *     - `port: 3000`: 指定开发服务器监听的端口号为 3000。
 *     - `host: true`: 将主机地址设置为 `0.0.0.0`。这使得开发服务器不仅可以通过
 *       `localhost` 访问，还可以通过局域网内的 IP 地址访问。这对于在移动设备上
 *       进行真机调试非常有用。
 *
 * 3.  **`build`**: 配置生产环境构建的行为。
 *     - `outDir: 'dist'`: 指定 `vite build` 命令的输出目录为 `dist`。
 *       这是存放最终打包好的静态文件的文件夹。
 *     - `assetsDir: 'assets'`: 指定生成的静态资源（如 JS、CSS、图片）
 *       在输出目录 (`dist`) 中的存放路径。例如，打包后的 JS 文件路径会是 `dist/assets/index.xxxx.js`。
 *
 * 这个配置文件相对简洁，利用了 Vite 的许多开箱即用的默认设置，
 * 同时根据项目的特定需求（如端口号、局域网访问）进行了定制。
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
const isElectron = process.env.ELECTRON === 'true';

/**
 * manualChunks - 按领域拆分 vendor 依赖为独立 chunk (BLD-01)
 *
 * 将 4,788 kB 的单体 bundle 拆分为 6 个缓存友好的 vendor chunk。
 * 浏览器可独立缓存稳定的 vendor 代码，部署后仅需重新加载变更的应用代码。
 *
 * 重要：Mermaid 图表子模块 (/dist/chunks/) 被排除在外，
 * 以保留其现有的动态 import 拆分行为 (BLD-02)。
 */
function manualChunks(id) {
  if (!id.includes('node_modules')) {
    return undefined
  }

  // vendor-vue: Vue 核心 + 生态系统
  if (
    id.includes('node_modules/vue/') ||
    id.includes('node_modules/@vue/') ||
    id.includes('node_modules/vue-i18n/')
  ) {
    return 'vendor-vue'
  }

  // vendor-codemirror: CodeMirror 6 编辑器 + vue-codemirror 封装
  if (
    id.includes('node_modules/codemirror/') ||
    id.includes('node_modules/@codemirror/') ||
    id.includes('node_modules/vue-codemirror/')
  ) {
    return 'vendor-codemirror'
  }

  // vendor-milkdown: Milkdown WYSIWYG + ProseMirror 全家桶
  if (
    id.includes('node_modules/@milkdown/') ||
    id.includes('node_modules/prosemirror-')
  ) {
    return 'vendor-milkdown'
  }

  // vendor-mermaid: Mermaid 核心，不含动态 import 的图表子模块 (D-04)
  if (
    id.includes('node_modules/mermaid/') &&
    !id.includes('/dist/chunks/')
  ) {
    return 'vendor-mermaid'
  }

  // vendor-mathjax: MathJax 数学公式渲染引擎
  if (id.includes('node_modules/mathjax-full/')) {
    return 'vendor-mathjax'
  }

  // vendor-export: PDF/图片导出工具
  if (
    id.includes('node_modules/html2canvas/') ||
    id.includes('node_modules/jspdf/')
  ) {
    return 'vendor-export'
  }

  // 其他 node_modules 依赖：交由 Rollup 自动处理 (D-03)
  return undefined
}

// https://vitejs.dev/config/
export default defineConfig({
    // Electron构建：使用相对路径 './'，解决file://协议下的路径问题
  base: isElectron ? './' : '/',
  // 插件配置
  plugins: [
    // Vue 插件，用于支持 .vue 单文件组件
    vue()
  ],

  // 开发服务器配置
  server: {
    // 端口号
    port: 3000,
    // 允许通过局域网 IP 访问
    host: true
  },

  // 生产构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // Rollup 输出配置：vendor 分块
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@config': resolve(__dirname, './src/config'),
      '@utils': resolve(__dirname, './src/shared/utils'),
      '@core': resolve(__dirname, './src/core'),
      '@composables': resolve(__dirname, './src/composables'),
      '@components': resolve(__dirname, './src/components'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});