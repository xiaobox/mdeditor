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
import vue from '@vitejs/plugin-vue';
const isElectron = process.env.ELECTRON === 'true';

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
    assetsDir: 'assets'
  }
});