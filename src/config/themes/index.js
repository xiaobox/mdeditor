/**
 * @file src/config/themes/index.js
 * @description 主题配置的统一出口文件。
 *
 * 该文件作为 `config/themes` 目录的公共 API 入口，
 * 重新导出了所有与主题相关的模块。这种模式有几个好处：
 *
 * 1.  **简化导入**: 其他模块（尤其是 `useThemeManager`）可以从一个集中的位置
 *     导入所有需要的主题配置和工具函数，而不需要知道 `themes` 目录的内部结构。
 *     例如，可以写 `import { getColorTheme, getCodeStyle } from '@/config/themes'`，
 *     而不是多个单独的导入语句。
 *
 * 2.  **封装内部结构**: 如果未来 `themes` 目录的内部文件结构发生变化（例如，拆分或合并文件），
 *     只需要更新这个 `index.js` 文件即可，而依赖于它的其他模块则无需任何修改。
 *
 * 3.  **清晰的公共 API**: 这个文件明确定义了 `themes` 模块对外暴露的所有内容，
 *     充当了模块的“公共接口”，使得模块的边界更加清晰。
 */

// 导出基础工厂函数，用于创建主题对象
export * from './base.js';

// 导出颜色主题相关的定义和工具函数
export * from './color-themes.js';

// 导出代码高亮样式相关的定义和工具函数
export * from './code-styles.js';

// 导出排版主题系统相关的定义和工具函数
export * from './theme-systems.js';

// 导出与本地存储相关的常量和工具类
export * from './storage.js';
