/**
 * @file src/composables/useClipboard.js
 * @description 剪贴板功能管理 Composable
 *
 * 专门管理剪贴板相关功能，包括：
 * - 复制格式选项管理
 * - 复制操作执行
 * - 主题配置获取
 * - 复制格式选择
 */

import { ref, watch } from 'vue'
import { copySocialFormat, copyMarkdownFormat, getCopyFormatOptions } from '../core/editor/copy-formats.js'
import { useGlobalThemeManager } from './index.js'
import { i18n } from '../plugins/i18n.js'

/**
 * 剪贴板功能管理 Composable
 * @param {Object} options - 配置选项
 * @param {Function} options.onNotify - 通知回调函数
 * @param {Function} options.getContent - 获取内容的回调函数
 * @returns {Object} 剪贴板状态和方法
 */
export function useClipboard(options = {}) {
  const { onNotify, getContent } = options

  // 获取主题管理器
  const themeManager = useGlobalThemeManager()

  // 状态
  const copyFormatOptions = ref(getCopyFormatOptions())
  const selectedCopyFormat = ref(copyFormatOptions.value[0]) // 存储选中项对象以保持向后兼容

  /**
   * 获取当前有效的颜色主题（包括临时自定义主题）
   * @returns {Object} 当前有效的主题配置
   */
  const getCurrentEffectiveTheme = () => {
    try {
      const tempTheme = localStorage.getItem('temp-custom-theme')
      if (tempTheme) {
        return JSON.parse(tempTheme)
      }
    } catch (error) {
      console.warn('Failed to load temp custom theme:', error)
    }
    return themeManager.currentColorTheme.value
  }

  /**
   * 处理复制格式选择
   * @param {Object} format - 选择的复制格式
   */
  const handleCopyFormatSelect = async (format) => {
    try {
      // 获取当前内容
      const content = getContent?.() || ''
      if (!content.trim()) {
        onNotify?.('请先编辑内容', 'warning')
        return
      }

      // 使用 requestAnimationFrame 确保UI更新不会引起抖动
      await new Promise(resolve => requestAnimationFrame(resolve))

      let result
      const copyOptions = {
        theme: getCurrentEffectiveTheme(), // 使用有效主题
        codeTheme: themeManager.currentCodeStyle.value,
        themeSystem: themeManager.currentThemeSystem.value,
        fontSettings: themeManager.currentFontSettings.value
      }

      // 如果没有指定格式，默认使用社交格式
      const formatValue = format.value || 'social'

      switch (formatValue) {
        case 'social':
          result = await copySocialFormat(content, copyOptions)
          break
        case 'markdown':
          result = await copyMarkdownFormat(content)
          break
        default:
          result = { success: false, message: '未知的复制格式' }
      }

      // 延迟显示通知，避免与复制操作冲突
      setTimeout(() => {
        onNotify?.(result.message, result.success ? 'success' : 'error')
      }, 50)
    } catch (error) {
      setTimeout(() => {
        onNotify?.('❌ 复制失败：' + error.message, 'error')
      }, 50)
    }
  }

  /**
   * 设置选中的复制格式
   * @param {Object} format - 复制格式对象
   */
  const setSelectedCopyFormat = (format) => {
    selectedCopyFormat.value = format
  }

  /**
   * 根据值获取复制格式
   * @param {string} value - 格式值
   * @returns {Object|null} 复制格式对象
   */
  const getCopyFormatByValue = (value) => {
    return copyFormatOptions.value.find(option => option.value === value) || null
  }

  /**
   * 重新加载复制格式选项
   */
  const reloadCopyFormatOptions = () => {
    const prevVal = selectedCopyFormat.value?.value
    copyFormatOptions.value = getCopyFormatOptions()
    // 如果当前选中的格式不在新选项中，重置为第一个
    const matched = copyFormatOptions.value.find(option => option.value === prevVal)
    selectedCopyFormat.value = matched || copyFormatOptions.value[0]
  }

  // 监听语言切换，实时刷新复制菜单
  try {
    const loc = i18n?.global?.locale
    const localeRef = typeof loc === 'string' ? null : loc
    if (localeRef && typeof localeRef === 'object' && 'value' in localeRef) {
      watch(localeRef, () => reloadCopyFormatOptions())
    }
  } catch {}

  return {
    // 状态
    copyFormatOptions,
    selectedCopyFormat,

    // 方法
    handleCopyFormatSelect,
    setSelectedCopyFormat,
    getCopyFormatByValue,
    reloadCopyFormatOptions,
    getCurrentEffectiveTheme
  }
}
