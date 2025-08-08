/**
 * @file src/config/constants/index.js
 * @description 应用程序常量的统一出口文件
 * 
 * 该文件作为所有应用程序常量的中央导出点，提供了一个清晰的
 * API 来访问各种配置常量，包括编辑器设置、UI 文本、时间常量等。
 * 
 * 设计原则：
 * - 消除魔法数字和硬编码字符串
 * - 提供类型安全的常量定义
 * - 便于维护和国际化
 * - 支持环境特定的配置
 */

// 导出编辑器相关常量
export * from './editor.js';



// 导出时间和超时相关常量
export * from './timing.js';

// 导出格式化相关常量
export * from './formatting.js';

// 导出错误消息常量
export * from './error-messages.js';

// 导出默认值常量
export * from './defaults.js';

// 导出外部链接常量
export * from './links.js';
