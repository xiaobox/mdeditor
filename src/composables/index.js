/**
 * Composables 统一入口
 * 项目已全面迁移到统一主题管理器
 */

// 🎯 主要：统一主题管理器（项目当前使用）
export { useThemeManager, useGlobalThemeManager } from './useThemeManager.js'

// 📝 编辑器相关
export { useMarkdownEditor } from './useMarkdownEditor.js'

// 🔄 向后兼容：主题包装器（已弃用，保留以防需要）
export { useColorTheme } from './useTheme.js'
export { useCodeStyle } from './useCodeStyle.js'
export { useLayout } from './useLayout.js'

/**
 * ✅ 当前使用方式：
 *
 * // 统一主题管理器 - 项目标准
 * import { useGlobalThemeManager } from '@/composables'
 * const themeManager = useGlobalThemeManager()
 *
 * // 解构所需功能
 * const {
 *   currentColorTheme,
 *   currentCodeStyle,
 *   currentThemeSystemId,
 *   setColorTheme,
 *   setCodeStyle,
 *   setThemeSystem
 * } = themeManager
 *
 * // 编辑器（已集成主题系统）
 * import { useMarkdownEditor } from '@/composables'
 * const editor = useMarkdownEditor({ theme: 'auto' })
 */
