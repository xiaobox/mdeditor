/**
 * @file src/main.js
 * @description 应用主入口文件
 *
 * 这是整个 Vue 应用的起点。它的职责非常清晰和集中：
 * 1.  **创建 Vue 应用实例**: 调用 Vue 3 的 `createApp` 函数，并传入根组件 `App.vue`，
 *     从而创建一个新的 Vue 应用实例。
 * 2.  **导入全局样式**: 导入项目所需的全局 CSS 文件。
 *     - `global.css`: 包含整个应用范围内的基础样式、重置（reset）、CSS 变量定义等。
 *     - `components/index.css`: 这是一个集中的入口，用于导入所有组件级别的 CSS 文件。
 *       这种模式有助于保持 `main.js` 的整洁，将组件样式的管理委托给 CSS 文件本身。
 * 3.  **挂载应用**: 调用 `app.mount('#app')`，将 Vue 应用实例挂载到 `index.html` 文件中
 *     ID 为 `app` 的 DOM 元素上。这是将 Vue 应用渲染到页面上的最后一步。
 *
 * 这个文件遵循了现代前端框架（如 Vue、React）的典型入口文件模式，即保持最小化，
 * 只做最核心的初始化工作，而将具体的业务逻辑、路由、状态管理等委托给其他模块。
 */

import { createApp } from 'vue';
import App from './App.vue';

// 导入全局 CSS
// `global.css` 定义了应用的整体基础样式和 CSS 变量
import './styles/global.css';
// `components/index.css` 作为组件样式的统一入口
import './styles/components/index.css';

// 创建 Vue 应用实例
const app = createApp(App);

// 将应用挂载到 DOM 中 ID 为 'app' 的元素上
app.mount('#app');
