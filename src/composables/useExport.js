/**
 * @file src/composables/useExport.js
 * @description 导出功能管理 Composable
 *
 * 管理导出相关功能：
 * - 导出格式选项管理
 * - 导出操作执行 (PDF / 图片)
 * - 获取当前主题配置传递给导出管道
 */

import { ref, watch, onUnmounted } from 'vue'
import { exportAsImage, exportAsPdf, getExportFormatOptions } from '../core/editor/export-formats.js'
import { useGlobalThemeManager } from './index.js'
import { i18n } from '../plugins/i18n.js'
import { SafeStorage, TEMP_STORAGE_KEYS } from '../shared/utils/storage.js'

/**
 * 导出功能管理 Composable
 * @param {Object} options - 配置选项
 * @param {Function} options.onNotify - 通知回调函数
 * @param {Function} options.getContent - 获取 Markdown 内容的回调
 * @returns {Object} 导出状态和方法
 */
export function useExport(options = {}) {
  const { onNotify, getContent } = options

  const themeManager = useGlobalThemeManager()

  const exportFormatOptions = ref(getExportFormatOptions())
  const isExporting = ref(false)

  /**
   * 获取当前有效的颜色主题（包括临时自定义主题）
   */
  const getCurrentEffectiveTheme = () => {
    const tempTheme = SafeStorage.getJson(TEMP_STORAGE_KEYS.CUSTOM_THEME, null)
    return tempTheme || themeManager.currentColorTheme.value
  }

  /**
   * 处理导出格式选择
   * @param {Object|string} format - 选择的导出格式
   */
  const handleExportFormatSelect = async (format) => {
    if (isExporting.value) return

    const content = getContent?.() || ''
    if (!content.trim()) {
      onNotify?.('请先编辑内容', 'warning')
      return
    }

    const formatValue = typeof format === 'string' ? format : format?.value || null
    if (!formatValue) return

    isExporting.value = true
    try {
      const exportOptions = {
        theme: getCurrentEffectiveTheme(),
        codeTheme: themeManager.currentCodeStyle.value,
        themeSystem: themeManager.currentThemeSystem.value,
        fontSettings: themeManager.currentFontSettings.value
      }

      let result
      switch (formatValue) {
        case 'pdf':
          result = await exportAsPdf(content, exportOptions)
          break
        case 'image':
          result = await exportAsImage(content, exportOptions)
          break
        default:
          result = { success: false, message: '未知的导出格式' }
      }
      onNotify?.(result.message, result.success ? 'success' : 'error')
    } catch (error) {
      onNotify?.('导出失败: ' + error.message, 'error')
    } finally {
      isExporting.value = false
    }
  }

  const reloadExportFormatOptions = () => {
    exportFormatOptions.value = getExportFormatOptions()
  }

  let stopLocaleWatch = null
  try {
    const loc = i18n?.global?.locale
    const localeRef = typeof loc === 'string' ? null : loc
    if (localeRef && typeof localeRef === 'object' && 'value' in localeRef) {
      stopLocaleWatch = watch(localeRef, () => reloadExportFormatOptions())
    }
  } catch {}

  onUnmounted(() => {
    if (stopLocaleWatch) {
      stopLocaleWatch()
      stopLocaleWatch = null
    }
  })

  return {
    exportFormatOptions,
    isExporting,
    handleExportFormatSelect
  }
}
